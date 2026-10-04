// The Atelier worker: runs the heavy, pure steps (stitch geometry, woven fabric)
// off the main thread, so stitching a monogram never blocks input or paint.
// Spoken to only through compute.ts. Typed arrays travel as transferables.

/// <reference lib="webworker" />

import { buildGeometry, geometryTransfer, type GeometryInput } from './geometry.ts';
import { fabricPixels, type FabricRequest } from './fabric.ts';

type Req =
  | { id: number; type: 'geometry'; input: GeometryInput }
  | { id: number; type: 'fabric'; input: FabricRequest };

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = async (e: MessageEvent<Req>) => {
  const msg = e.data;
  try {
    if (msg.type === 'geometry') {
      const g = await buildGeometry(msg.input);
      scope.postMessage({ id: msg.id, ok: true, result: g }, g ? geometryTransfer(g) : []);
    } else if (msg.type === 'fabric') {
      const px = fabricPixels(msg.input);
      scope.postMessage({ id: msg.id, ok: true, result: px }, [px.buffer]);
    }
  } catch (err) {
    scope.postMessage({ id: msg.id, ok: false, error: String((err as Error)?.message ?? err) });
  }
};
