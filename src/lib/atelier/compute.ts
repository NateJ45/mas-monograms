// Where the Atelier's heavy work runs. Browser-only.
//
// Normally in a dedicated module worker (atelier.worker.ts): stitch geometry and
// the woven fabric never touch the main thread, so the page stays responsive
// (no long tasks) while a monogram is prepared. Each engine owns its own worker,
// created on first use. A newer design supersedes an older one by TERMINATING
// the busy worker (a sync computation cannot be interrupted any other way); the
// superseded call resolves to null and the next call starts a fresh worker.
//
// Where a worker cannot start (very old browsers, a blocked script), the same
// pure code runs on the main thread, cut into short slices with yields between.

import { fabricJob, fabricRows, normaliseShade, tintFabric, type FabricRequest } from './fabric.ts';
import { buildGeometry, type GeometryInput, type GeometryResult } from './geometry.ts';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// MessageChannel rather than setTimeout: timers are clamped (and throttled to
// 1s in background tabs), message tasks are not.
let channel: MessageChannel | null = null;
const queue: (() => void)[] = [];
/** Give the event loop a turn (input, paint) and carry on. */
export function yieldTask(): Promise<void> {
  const sch = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (sch && typeof sch.yield === 'function') return sch.yield();
  return new Promise<void>((r) => {
    if (typeof MessageChannel !== 'function') {
      setTimeout(r, 0);
      return;
    }
    if (!channel) {
      channel = new MessageChannel();
      channel.port1.onmessage = () => queue.shift()?.();
    }
    queue.push(r);
    channel.port2.postMessage(0);
  });
}

/** A yield that only actually yields once `budget` ms of work have passed. */
export function slicer(budget = 10) {
  let t0 = now();
  return async () => {
    if (now() - t0 < budget) return;
    await yieldTask();
    t0 = now();
  };
}

export interface Compute {
  /** null when superseded (a newer geometry call, or cancel/destroy) */
  geometry(input: GeometryInput, alive: () => boolean): Promise<GeometryResult | null>;
  fabric(req: FabricRequest, alive: () => boolean): Promise<Uint8ClampedArray | null>;
  destroy(): void;
}

type Pending = { resolve: (v: unknown) => void; kind: 'geometry' | 'fabric' };

let workerBroken = false;

export function createCompute(): Compute {
  let worker: Worker | null = null;
  let nextId = 1;
  const pending = new Map<number, Pending>();
  let destroyed = false;

  function drop() {
    if (worker) worker.terminate();
    worker = null;
    for (const p of pending.values()) p.resolve(null);
    pending.clear();
  }

  function ensureWorker(): Worker | null {
    if (worker) return worker;
    if (workerBroken || destroyed || typeof Worker !== 'function') return null;
    try {
      worker = new Worker(new URL('./atelier.worker.ts', import.meta.url), {
        type: 'module',
        name: 'atelier',
      });
    } catch {
      workerBroken = true;
      return null;
    }
    worker.onmessage = (e: MessageEvent<{ id: number; ok: boolean; result?: unknown }>) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      p.resolve(e.data.ok ? (e.data.result ?? null) : FAILED);
    };
    worker.onerror = (e) => {
      // a worker that cannot load or crashes: fall back to the main thread for good
      e.preventDefault?.();
      workerBroken = true;
      const waiting = [...pending.values()];
      pending.clear();
      worker?.terminate();
      worker = null;
      for (const p of waiting) p.resolve(FAILED);
    };
    return worker;
  }

  const FAILED = Symbol('failed');

  function post(kind: 'geometry' | 'fabric', input: unknown): Promise<unknown> | null {
    const w = ensureWorker();
    if (!w) return null;
    const id = nextId++;
    return new Promise((resolve) => {
      pending.set(id, { resolve, kind });
      w.postMessage({ id, type: kind, input });
    });
  }

  async function geometryMain(input: GeometryInput, alive: () => boolean) {
    return buildGeometry(input, { pause: yieldTask, alive: () => alive() && !destroyed });
  }

  async function fabricMain(r: FabricRequest, alive: () => boolean) {
    const job = fabricJob(r.tex, r.W, r.H, r.pitch, 7);
    const tick = slicer(8);
    const rows = Math.max(1, Math.floor(40000 / r.W));
    for (let y = 0; y < r.H; y += rows) {
      fabricRows(job, y, Math.min(r.H, y + rows));
      await tick();
      if (!alive() || destroyed) return null;
    }
    normaliseShade(job.shade);
    const out = new Uint8ClampedArray(r.W * r.H * 4);
    tintFabric(job.shade, r.lin, out);
    return out;
  }

  return {
    async geometry(input, alive) {
      // only the newest geometry matters: stop any older one mid-flight
      if ([...pending.values()].some((p) => p.kind === 'geometry')) drop();
      // labels are copied, not transferred: the caller may still need them
      const res = post('geometry', input);
      if (res) {
        const out = await res;
        if (out !== FAILED) return alive() ? (out as GeometryResult | null) : null;
      }
      if (!alive() || destroyed) return null;
      return geometryMain(input, alive);
    },
    async fabric(req, alive) {
      const res = post('fabric', req);
      if (res) {
        const out = await res;
        if (out !== FAILED) return alive() ? (out as Uint8ClampedArray | null) : null;
      }
      if (!alive() || destroyed) return null;
      return fabricMain(req, alive);
    },
    destroy() {
      destroyed = true;
      drop();
    },
  };
}
