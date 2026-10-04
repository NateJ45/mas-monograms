"""Outline text to SVG paths with fontTools (variable instancing + GPOS pair kerning).

Usage: python outline.py jobs.json out.json
Each job: {id, font, axes?, text, size, tracking? (em/1000), kern? (default true),
           adjust? {index: em/1000 extra space AFTER glyph index}}
Output per job: {d, width, glyphs:[{ch,x,adv,d}], capHeight, xHeight, ascender, descender, bbox}
Coordinates are px: baseline y=0, y down, x starts at 0.
"""
import json
import re
import sys
import os
import hashlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.varLib import instancer

ROOT = 'C:/Users/natha/Documents/Claude/Projects/clients/mas-monograms-rebuild/node_modules/'
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_inst')
os.makedirs(CACHE, exist_ok=True)

_fonts = {}


def load(font, axes):
    key = font + json.dumps(axes or {}, sort_keys=True)
    if key in _fonts:
        return _fonts[key]
    path = font if os.path.isabs(font) else ROOT + font
    if axes:
        h = hashlib.md5(key.encode()).hexdigest()[:10]
        cached = os.path.join(CACHE, h + '.ttf')
        if os.path.exists(cached):
            f = TTFont(cached)
        else:
            vf = TTFont(path)
            f = instancer.instantiateVariableFont(vf, axes, updateFontNames=False)
            f.flavor = None
            f.save(cached)
            f = TTFont(cached)
    else:
        f = TTFont(path)
    _fonts[key] = f
    return f


def class_of(classdef, g):
    if classdef is None:
        return 0
    return classdef.classDefs.get(g, 0)


def pair_kern(font, left, right):
    """Sum of XAdvance adjustments from GPOS PairPos lookups (kern feature)."""
    if 'GPOS' not in font:
        if 'kern' in font:
            try:
                return font['kern'].kernTables[0].kernTable.get((left, right), 0)
            except Exception:
                return 0
        return 0
    gpos = font['GPOS'].table
    if not gpos.FeatureList:
        return 0
    lookup_ids = set()
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag == 'kern':
            lookup_ids.update(fr.Feature.LookupListIndex)
    total = 0
    for li in sorted(lookup_ids):
        lk = gpos.LookupList.Lookup[li]
        for st in lk.SubTable:
            if lk.LookupType == 9:
                st = st.ExtSubTable
            if getattr(st, 'LookupType', 2) != 2 and lk.LookupType not in (2, 9):
                continue
            if not hasattr(st, 'Format') or not hasattr(st, 'Coverage'):
                continue
            cov = st.Coverage.glyphs
            if left not in cov:
                continue
            idx = cov.index(left)
            v = None
            if st.Format == 1:
                for pvr in st.PairSet[idx].PairValueRecord:
                    if pvr.SecondGlyph == right:
                        v = pvr.Value1
                        break
            elif st.Format == 2:
                c1 = class_of(st.ClassDef1, left)
                c2 = class_of(st.ClassDef2, right)
                rec = st.Class1Record[c1].Class2Record[c2]
                v = rec.Value1
            if v is not None and getattr(v, 'XAdvance', None):
                total += v.XAdvance
                break
    return total


_TOK = re.compile(r'[MLHVQCZmlhvqcz]|-?[0-9.]+(?:e-?[0-9]+)?')


def no_hv(d):
    """Rewrite H/V into L so every coordinate in the path is an x y pair."""
    out = []
    cx = cy = 0.0
    toks = _TOK.findall(d)
    i = 0
    cmd = None
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            i += 1
            if cmd in 'Zz':
                out.append('Z')
            continue
        if cmd == 'H':
            cx = float(t); out.append('L%s %s' % (t, fmt(cy))); i += 1
        elif cmd == 'V':
            cy = float(t); out.append('L%s %s' % (fmt(cx), t)); i += 1
        else:
            n = {'M': 2, 'L': 2, 'Q': 4, 'C': 6}[cmd]
            vals = toks[i:i + n]
            out.append(cmd + ' '.join(vals))
            cx, cy = float(vals[-2]), float(vals[-1])
            i += n
            if cmd == 'M':
                cmd = 'L'
    return ''.join(out)


def fmt(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def run(job):
    f = load(job['font'], job.get('axes'))
    upm = f['head'].unitsPerEm
    s = job['size'] / upm
    cmap = f.getBestCmap()
    gs = f.getGlyphSet()
    hmtx = f['hmtx']
    text = job['text']
    tracking = job.get('tracking', 0) * upm / 1000
    adjust = {int(k): v * upm / 1000 for k, v in (job.get('adjust') or {}).items()}
    kern = job.get('kern', True)
    names = [cmap.get(ord(ch), '.notdef') for ch in text]
    x = 0.0
    glyphs = []
    all_d = []
    bp_all = BoundsPen(gs)
    for i, (ch, gn) in enumerate(zip(text, names)):
        adv = hmtx[gn][0]
        pen = SVGPathPen(gs, lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
        tp = TransformPen(pen, (s, 0, 0, -s, x * s, 0))
        gs[gn].draw(tp)
        d = no_hv(pen.getCommands())
        bpen = BoundsPen(gs)
        gs[gn].draw(TransformPen(bpen, (s, 0, 0, -s, x * s, 0)))
        glyphs.append({'ch': ch, 'x': round(x * s, 2), 'adv': round(adv * s, 2), 'd': d,
                       'bbox': [round(b, 2) for b in bpen.bounds] if bpen.bounds else None})
        if d:
            all_d.append(d)
        x += adv
        if i < len(text) - 1:
            if kern:
                x += pair_kern(f, gn, names[i + 1])
            x += tracking
            x += adjust.get(i, 0)
    os2 = f['OS/2']
    bxs = [g['bbox'] for g in glyphs if g['bbox']]
    bbox = [min(b[0] for b in bxs), min(b[1] for b in bxs), max(b[2] for b in bxs), max(b[3] for b in bxs)] if bxs else None
    return {
        'd': ' '.join(all_d),
        'width': round(x * s, 2),
        'glyphs': glyphs,
        'capHeight': round(getattr(os2, 'sCapHeight', 0) * s, 2),
        'xHeight': round(getattr(os2, 'sxHeight', 0) * s, 2),
        'ascender': round(f['hhea'].ascent * s, 2),
        'descender': round(f['hhea'].descent * s, 2),
        'bbox': bbox,
    }


if __name__ == '__main__':
    jobs = json.load(open(sys.argv[1], encoding='utf8'))
    out = {}
    for j in jobs:
        out[j['id']] = run(j)
    json.dump(out, open(sys.argv[2], 'w', encoding='utf8'), indent=0)
    print('outlined', len(out))
