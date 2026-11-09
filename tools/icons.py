# The bag's item pictures (owner, 7 Nov 2026: "go with A"): every live item its own 16x16 pixel picture, drawn here and baked into data/icons.json
# (one PNG sheet and the ids in its order) for BAG.icon. Run: node tools/icons-bfly.cjs /tmp/bfly.json && python3 tools/icons.py /tmp/bfly.json
# --sheet out.png also writes a contact sheet to look over. Families share a drawing and differ by their own colours and markings.
import json, sys, base64, io, re
from PIL import Image

K = '#1a1410'
N = 16

def rgb(c):
    if isinstance(c, (list, tuple)): return tuple(c[:3])
    c = c.lstrip('#'); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))

def hx(t): return '#%02x%02x%02x' % tuple(max(0, min(255, int(v))) for v in t)
def dk(c, f=.62): return hx([v*f for v in rgb(c)])
def lt(c, f=.45): return hx([v+(255-v)*f for v in rgb(c)])
def ih(n): return '#%06x' % n

class Pic:
    def __init__(s): s.p = [[None]*N for _ in range(N)]
    def put(s, rows, pal, ox=0, oy=0):
        for y, r in enumerate(rows):
            for x, ch in enumerate(r):
                if ch in '. ': continue
                X, Y = x+ox, y+oy
                if 0 <= X < N and 0 <= Y < N:
                    c = K if ch == 'k' else pal.get(ch)
                    if c is None: raise KeyError('no colour for %r' % ch)
                    s.p[Y][X] = rgb(c)
        return s
    def px(s, x, y, c):
        if 0 <= x < N and 0 <= y < N: s.p[y][x] = rgb(c)
        return s
    def outline(s, c=K):
        q = [r[:] for r in s.p]
        for y in range(N):
            for x in range(N):
                if s.p[y][x] is None and any(0 <= x+a < N and 0 <= y+b < N and s.p[y+b][x+a] is not None and s.p[y+b][x+a] != rgb(c) for a, b in ((1,0),(-1,0),(0,1),(0,-1))):
                    q[y][x] = rgb(c)
        s.p = q; return s
    def badge(s):   # an unknown one: a small "?" in the corner
        s.put(['kkkk', 'kWWk', 'kkWk', 'k.kk', 'kWkk', 'kkkk'], {'W': '#f2c14e'}, 12, 10)
        s.p[13][13] = rgb('#1a1410'); return s
    def img(s):
        im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
        for y in range(N):
            for x in range(N):
                if s.p[y][x] is not None: im.putpixel((x, y), s.p[y][x]+(255,))
        return im

def T(rows): # a template: rows padded to 16
    assert len(rows) <= 16, rows
    for r in rows: assert len(r) <= 16, (r, len(r))
    return [r.ljust(16, '.') for r in rows]

ICONS = {}
def add(id, pic): ICONS[id] = pic

# ---------------------------------------------------------------- mushrooms
MUSH_T = {
 'dome': T(["", "", ".....kkkkkk", "...kkCCCCCCkk", "..kCCCCCCCCCCk", ".kCCcCCCCCCCCCk", ".kCCCCCCCCCCcCk", ".kcCCCCCCCCCCck", "..kkkGGGGGGkkk", "....kkSSSSkk", ".....kSSssk", ".....kSSssk", ".....kSSssk", "....kSSSSssk", "....kkkkkkkk"]),
 'small': T(["", "", "", "", ".....kkkkkk", "....kCCCCCCk", "...kCcCCCCCCk", "...kCCCCCCCck", "...kkGGGGGGkk", "......kSSk", "......kSsk", "......kSsk", ".....kSSssk", ".....kkkkkk"]),
 'fat': T(["", "", "....kkkkkkkk", "..kkCCCCCCCCkk", ".kCCcCCCCCCCCCk", "kCCCCCCCCCCCCCck", "kcCCCCCCCCCCCCck", ".kkGGGGGGGGGGkk", "...kSSSSSSSSk", "...kSSSSSSssk", "..kSSSSSSSSssk", "..kSSSSSSSSssk", "..kSSSSSSSSssk", "...kSSSSSSssk", "....kkkkkkkk"]),
 'tall': T([".....kkkkk", "....kCCCCCk", "....kCcCCCk", "...kCCCCCCCk", "...kCCcCCCCk", "...kCCCCCcCk", "...kCcCCCCCk", "...kCCCCCCCk", "...kGCcGCcGk", "....kkSSkkk", ".....kSsk", ".....kSsk", ".....kSsk", ".....kSsk", "....kSSssk", "....kkkkkk"]),
 'flat': T(["", "", "", "", "...kkkkkkkkkk", ".kkCCcCCCCcCCkk", "kCCCCCCCCCCCCCCk", "kcCCCCCCCCCCCCck", ".kkGGGGGGGGGGkk", "......kSSk", "......kSsk", ".....kkSskk", "......kSsk", "......kSsk", ".....kSSssk", ".....kkkkkk"]),
 'funnel': T(["", "", "..kkkkkkkkkkk", ".kCCcCCCCCCcCCk", ".kGCCCCCCCCCCGk", "..kGCCCCCCCCGk", "...kGGCCCCGGk", "....kGGCCGGk", ".....kSSSSk", ".....kSSssk", ".....kSSssk", "......kSsk", "......kSsk", ".....kSSssk", ".....kkkkkk"]),
 'trumpet': T(["", "..kk.......kk", ".kCCk.....kCCk", ".kCcCkkkkkCcCk", "..kCCCCCCCCCk", "..kCcCCCCCCCk", "...kCCCCCCCk", "...kCCcCCCCk", "....kCCCCCk", "....kCCcCCk", ".....kCCCk", ".....kCcCk", ".....kCCCk", "....kCCCCCk", "....kkkkkkk"]),
 'morel': T(["", "......kkk", ".....kCcCk", "....kCcCcCk", "....kcCcCck", "...kCcCcCcCk", "...kcCcCcCck", "...kCcCcCcCk", "...kcCcCcCck", "....kCcCcCk", "....kkSSSkk", ".....kSssk", ".....kSssk", "....kSSSssk", "....kkkkkkk"]),
 'ball': T(["", "", "", "", ".....kkkkkk", "...kkCCCCCCkk", "..kCCWCCCCCCCk", "..kCWCCCCCCCck", ".kCCCCCCCCCCCck", ".kCCCCCCCCCCcck", ".kCCCCCCCCCccck", "..kcCCCCCCcccK".replace('K', 'k'), "...kkcccccckk", ".....kkkkkk"]),
 'shelf': T(["", "", "", "kkkkkkkk", "kCCCCCCCkkk", "kCcCCCCCCCCkk", "kCCCCcCCCCCCCk", "kCCCCCCCCcCCCk", "kGGGGGGGGGGGk", "kkkkkkkkkkkk", "kCCCCCcCCCCk", "kCcCCCCCCCk", "kGGGGGGGGk", "kkkkkkkkk"]),
 'ear': T(["", "", "", "....kkkkk", "..kkCCCCCkk", ".kCCCcccCCCk", ".kCCcGGGcCCk", "kCCcGkkkGcCCk", "kCCcGk..kGcCk", "kCCcGk..kGcCk", ".kCCcGkkGcCk", ".kCCCcGGcCCk", "..kkCCCCCkk", "....kkkkk"]),
 'cup': T(["", "", "", "", "", "..kkkkkkkkkkk", ".kCCCCCCCCCCCk", ".kCGGGGGGGGGCk", "..kCGGGGGGGCk", "..kCCGGGGGCCk", "...kCCCCCCCk", "....kkSSSkk", ".....kSsk", "....kSSssk", "....kkkkkk"]),
 'shaggy': T(["", "", "....kkkkkkk", "..kkCCCCCCCkk", ".kCCcCCCCCCCCk", ".kCcCCcCCcCCCk", "kCCCcCCcCCcCCk", "kCcCCcCCcCCcCk", "kCCcCCcCCcCCcCk", "kcCCcCCcCCcCcck", ".kcCcCcCcCcCck", ".kcckcckcckck", "..k.k..k..k.k"]),
}

def mush(id, shape, cap, stem, marks=None, unknown=False, glow=None):
    cap, stem = cap, stem
    pal = {'C': cap, 'c': dk(cap, .78), 'G': dk(stem, .8), 'S': stem, 's': dk(stem, .82), 'W': lt(cap, .6)}
    p = Pic().put(MUSH_T[shape], pal)
    for (x, y, c) in (marks or []): p.px(x, y, c)
    if glow:
        for (x, y) in ((1, 2), (14, 3), (2, 12), (14, 11)): p.px(x, y, glow)
    if unknown: p.badge()
    return p

MU = {  # kind: shape, cap, stem, markings
 'button': ('small', ih(0xe8dcc0), ih(0xeee6d2), []),
 'puffball': ('ball', ih(0xf2efe6), ih(0xf2efe6), [(6, 8, '#d8d2c0'), (9, 9, '#d8d2c0'), (11, 7, '#d8d2c0')]),
 'oyster': ('shelf', ih(0xb8b4aa), ih(0xd8d4c8), []),
 'parasol': ('flat', ih(0xd8c8a0), ih(0xe8e0d0), [(4, 6, '#8a6a40'), (7, 5, '#8a6a40'), (10, 6, '#8a6a40'), (7, 6, '#8a6a40'), (12, 5, '#8a6a40')]),
 'woodear': ('ear', ih(0x6a3a2a), ih(0x7a4a3a), []),
 'chanterelle': ('funnel', ih(0xe08a2a), ih(0xe8a24a), []),
 'inkcap': ('tall', ih(0xd8d4cc), ih(0xe8e4dc), [(4, 8, '#2a2428'), (6, 8, '#2a2428'), (9, 8, '#2a2428'), (5, 7, '#6a6468'), (10, 7, '#6a6468')]),
 'violet': ('dome', ih(0x7a3aaa), ih(0x9a6ac8), []),
 'redcap': ('dome', ih(0xc0321e), ih(0xeee6d2), []),
 'flyagaric': ('dome', ih(0xd8261a), ih(0xf2ece0), [(5, 4, '#f4efe4'), (9, 3, '#f4efe4'), (3, 6, '#f4efe4'), (7, 6, '#f4efe4'), (11, 5, '#f4efe4'), (10, 7, '#f4efe4'), (5, 7, '#f4efe4')]),
 'trumpet': ('trumpet', ih(0x2a2428), ih(0x3a3438), []),
 'bolete': ('fat', ih(0x7a4a2a), ih(0xd8c49a), []),
 'moonglow': ('dome', ih(0xa8f0ff), ih(0xd8f4ff), []),
 'ghostcap': ('dome', ih(0xc8a8ff), ih(0xe8ddf6), []),
 'morel': ('morel', ih(0xb08a5a), ih(0xe6dcc4), []),
 'sulphur': ('shelf', ih(0xf0b828), ih(0xe8781e), []),
 'elfcup': ('cup', ih(0xe02a1a), ih(0xd8c8a0), []),
 'lionsmane': ('shaggy', ih(0xf4f0e8), ih(0xece6da), []),
}
for k, (sh, c, s, m) in MU.items():
    add('m_'+k, mush('m_'+k, sh, c, s, m, glow='#d8f8ff' if k == 'moonglow' else None))
    add('u_'+k, mush('u_'+k, sh, c, s, m, unknown=True))
add('airshroom', mush('airshroom', 'dome', '#9ad8ff', '#e0f4ff', [(5, 4, '#ffffff'), (9, 4, '#ffffff'), (7, 3, '#ffffff')], glow='#ffffff'))
add('glowcap', mush('glowcap', 'dome', '#7cff9a', '#e8ffe0', [(6, 4, '#d8ffb0'), (10, 5, '#d8ffb0')], glow='#b8ffc8'))
add('shroom_invis', mush('shroom_invis', 'tall', '#d8d4e8', '#ece8f4', [(3, 9, '#c8c4dc'), (4, 10, '#c8c4dc'), (10, 9, '#c8c4dc'), (11, 10, '#c8c4dc')]))
add('shroom_str', mush('shroom_str', 'fat', '#a8401e', '#e8cfa0', [(1, 3, K), (0, 2, '#e8d8b0'), (14, 3, K), (15, 2, '#e8d8b0')]))
add('shroom_swift', mush('shroom_swift', 'shaggy', '#c8c0b4', '#e8e0d4', []))
add('shroom_fly', mush('shroom_fly', 'flat', '#bfe4ff', '#f0f8ff', [], glow='#ffffff'))
add('shroom_keen', mush('shroom_keen', 'dome', '#f2c14e', '#f4ecd0', [(5, 5, K), (6, 5, '#ffffff'), (9, 5, K), (10, 5, '#ffffff')]))
add('shroom_heal', mush('shroom_heal', 'dome', '#e8607a', '#f4e6e8', [(7, 4, '#ffffff'), (6, 5, '#ffffff'), (7, 5, '#ffffff'), (8, 5, '#ffffff'), (7, 6, '#ffffff')]))
add('shroom_cure', mush('shroom_cure', 'tall', '#5fbf5a', '#e4f0dc', [(5, 3, '#d8ffc8'), (7, 5, '#d8ffc8'), (6, 7, '#d8ffc8')]))
add('shroom_jump', mush('shroom_jump', 'tall', '#ff9a3a', '#f4e4cc', [(5, 2, '#ffe0a0'), (8, 4, '#ffe0a0'), (6, 6, '#ffe0a0')]))
add('shroom_luck', mush('shroom_luck', 'flat', '#2fa84f', '#e8f0dc', [(4, 5, '#f2d24e'), (8, 5, '#f2d24e'), (12, 5, '#f2d24e'), (6, 6, '#f2d24e'), (10, 6, '#f2d24e')]))
add('shroom_fire', mush('shroom_fire', 'fat', '#e8401a', '#f4dcb0', [(5, 4, '#ffd23a'), (9, 4, '#ffd23a'), (7, 5, '#ffd23a'), (11, 5, '#ffd23a')], glow='#ffb030'))
add('shroom_small', mush('shroom_small', 'dome', '#b8a8f0', '#ece8f8', [(6, 4, '#ffffff'), (9, 5, '#ffffff')]))
add('shroom_big', mush('shroom_big', 'fat', '#6a2a9a', '#e0d0ec', [(4, 4, '#c8a0f0'), (8, 3, '#c8a0f0'), (11, 5, '#c8a0f0')]))

def load_bfly(path):
    d = json.load(open(path))
    for b in d:
        p = Pic(); oy = (N-b['h'])//2
        for y in range(b['h']):
            for x in range(b['w']):
                c = b['px'][y*b['w']+x]
                if c: p.px(x, y+oy, c)
        p.outline()
        add('b_%d' % b['i'], p)
        q = Pic(); q.p = [r[:] for r in p.p]; q.badge(); add('bu_%d' % b['i'], q)

if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument('bfly'); ap.add_argument('--sheet'); ap.add_argument('--only'); ap.add_argument('--out', default='data/icons.json')
    a = ap.parse_args()
    load_bfly(a.bfly)
    exec(open(__file__.replace('icons.py', 'icons_art.py')).read())
    ids = sorted(ICONS)
    if a.sheet:
        sel = [i for i in ids if not a.only or re.search(a.only, i)]
        cols = 16; rows = (len(sel)+cols-1)//cols; S = 6
        sh = Image.new('RGBA', (cols*(N*S+8)+8, rows*(N*S+8)+8), (11, 13, 19, 255))
        for i, id in enumerate(sel):
            im = ICONS[id].img().resize((N*S, N*S), Image.NEAREST); sh.paste(im, (8+(i % cols)*(N*S+8), 8+(i//cols)*(N*S+8)), im)
        sh.save(a.sheet); print(len(sel), 'on the sheet')
    else:
        cols = 32; rows = (len(ids)+cols-1)//cols
        sh = Image.new('RGBA', (cols*N, rows*N), (0, 0, 0, 0))
        for i, id in enumerate(ids): sh.paste(ICONS[id].img(), ((i % cols)*N, (i//cols)*N))
        b = io.BytesIO(); sh.save(b, 'PNG', optimize=True)
        json.dump({'s': N, 'cols': cols, 'ids': ids, 'png': 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()}, open(a.out, 'w'), separators=(',', ':'))
        print(len(ids), 'pictures,', len(b.getvalue()), 'bytes of PNG')
