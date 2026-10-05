// A tiny, deterministic ZIP writer (and reader, for the tests) on Node's own zlib.
// Written 2026-10-05 for the brand kit (scripts/build-brand-kit-zip.mjs) instead of adding a
// dependency: a ZIP is a list of deflated entries plus a central directory, and that is all
// the kit needs.
//
// Deterministic by construction: entries are sorted by name, every entry carries the same
// fixed timestamp (1980-01-01 00:00, the earliest a ZIP can say), no extra fields, no
// comments, so the same files always give the same bytes (the test hashes two runs).
// Names are stored as UTF-8 (flag bit 11). No ZIP64: the kit is a few MB, far under 4 GB.
import { crc32, deflateRawSync, inflateRawSync } from 'node:zlib';

const DOS_TIME = 0; // 00:00:00
const DOS_DATE = (0 << 9) | (1 << 5) | 1; // 1980-01-01

/**
 * @param {{ name: string, data: Buffer | Uint8Array | string }[]} entries
 * @returns {Buffer}
 */
export function writeZip(entries) {
  const sorted = [...entries]
    .map((e) => ({ name: e.name.replace(/\\/g, '/'), data: Buffer.from(e.data) }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const seen = new Set();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of sorted) {
    if (seen.has(name)) throw new Error(`duplicate zip entry ${name}`);
    seen.add(name);
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data) >>> 0;
    const deflated = deflateRawSync(data, { level: 9 });
    // Store already-compressed files (PNG, PDF streams) when deflate gains nothing.
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const method = stored ? 0 : 8;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    // extra, comment, disk, internal attrs, external attrs: all 0
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += 30 + nameBuf.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(sorted.length, 8);
  end.writeUInt16LE(sorted.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

/**
 * Read a ZIP written by writeZip (or any plain store/deflate ZIP without ZIP64), checking
 * every CRC. Used by the tests.
 * @param {Buffer} buf
 * @returns {{ name: string, data: Buffer, compressedSize: number }[]}
 */
export function readZip(buf) {
  const endAt = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (endAt < 0) throw new Error('not a zip: no end record');
  const count = buf.readUInt16LE(endAt + 10);
  let p = buf.readUInt32LE(endAt + 16);
  const out = [];
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    const lnlen = buf.readUInt16LE(local + 26);
    const lxlen = buf.readUInt16LE(local + 28);
    const start = local + 30 + lnlen + lxlen;
    const raw = buf.subarray(start, start + csize);
    const data = method === 0 ? Buffer.from(raw) : inflateRawSync(raw);
    if (crc32(data) >>> 0 !== crc) throw new Error(`crc mismatch in ${name}`);
    out.push({ name, data, compressedSize: csize });
    p += 46 + nlen + xlen + clen;
  }
  return out;
}
