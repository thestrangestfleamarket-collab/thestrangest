# makes SPACE FLEET's hull relief, one tiling map a navy: python3 tools/space-detail.py  ->  data/space/tex/hull<navy>_n.jpg (the normal map) and hull<navy>_h.jpg (red: height, green: roughness, blue: the shade in its hollows), 1024 px
# a hull's plating laid out as a shipwright would: strakes cut into armour plates of several heights with seams and rivet rows, each plate filled with fitted small panels, sunk machinery bays, ribs, vents or a round hatch, conduit runs and small boxes over the top; the Corsairs' also patched, dented and pitted. The free libraries' sci-fi sets were floor tiles or not free to ship (owner, 17 Nov 2026), so the map is made here
import sys, os, subprocess, numpy as np
from PIL import Image
if len(sys.argv) < 2:
    for navy, style in ((0, 'clean'), (1, 'pirate')): subprocess.run([sys.executable, __file__, str(navy), style], check=True)
    sys.exit()
navy, style = sys.argv[1], sys.argv[2]; out = 'data/space/tex'; seed = 7; N = 1024
os.makedirs(out, exist_ok=True); R = np.random.default_rng(seed); U = N / 1024; PIR = style == 'pirate'
H = np.zeros((N, N), np.float32); RO = np.full((N, N), 0.5, np.float32)
px = lambda v: max(1, int(round(v * U)))
def box(x, y, w, h): return np.ix_(np.arange(y, y + h) % N, np.arange(x, x + w) % N)     # wrapped: every mark tiles
def fill(x, y, w, h, z, add=False):
    if w < 1 or h < 1: return
    if add: H[box(x, y, w, h)] += z
    else: H[box(x, y, w, h)] = z
def frame(x, y, w, h, t, dz):                                       # a border t wide, raised or cut by dz
    for b in ((x, y, w, t), (x, y + h - t, w, t), (x, y, t, h), (x + w - t, y, t, h)): fill(*b, dz, True)
def rivets(x, y, w, h, st, r=1, dz=0.035):
    for i in range(x + st // 2, x + w - st // 2 + 1, st):
        for j in (y, y + h - 1): fill(i - r, j - r, 2 * r + 1, 2 * r + 1, dz, True)
    for j in range(y + st // 2 + st, y + h - st // 2 - st + 1, st):
        for i in (x, x + w - 1): fill(i - r, j - r, 2 * r + 1, 2 * r + 1, dz, True)
def vent(x, y, w, h):
    fill(x, y, w, h, -0.07, True); frame(x, y, w, h, px(1), 0.05); p = px(4)
    if w >= h:
        for i in range(x + px(3), x + w - px(4), p): fill(i, y + px(3), px(2), h - px(6), 0.08, True)
    else:
        for j in range(y + px(3), y + h - px(4), p): fill(x + px(3), j, w - px(6), px(2), 0.08, True)
def pipe(x, y, L, horiz, rad, z0):
    for d in range(-rad, rad + 1):
        z = z0 + 0.10 * np.sqrt(max(0, 1 - (d / (rad + .5)) ** 2))
        b = box(x, y + d, L, 1) if horiz else box(x + d, y, 1, L); H[b] = np.maximum(H[b], z)
    for k in range(px(6), L - px(4), max(px(22), rad * 10)):         # collars
        b = box(x + k, y - rad - 1, px(3), 2 * rad + 3) if horiz else box(x - rad - 1, y + k, 2 * rad + 3, px(3)); H[b] = np.maximum(H[b], z0 + 0.13)
def hatch(cx, cy, r):
    yy, xx = np.mgrid[-r - 3:r + 4, -r - 3:r + 4]; d = np.hypot(xx, yy); b = box(cx - r - 3, cy - r - 3, 2 * r + 7, 2 * r + 7); v = H[b]
    base = float(np.median(v)); v[d <= r] = base + 0.03; v[(d > r - 3) & (d <= r)] = base + 0.08; v[(d > r) & (d <= r + 2)] = base - 0.08
    for a in np.linspace(0, 2 * np.pi, max(6, r // 2), endpoint=False):
        i, j = int(r + 3 + (r - 6) * np.sin(a)), int(r + 3 + (r - 6) * np.cos(a)); v[i - 1:i + 1, j - 1:j + 1] += 0.06
    v[r + 2:r + 4, r + 3 - r // 2:r + 3 + r // 2] += 0.05; H[b] = v
def split(x, y, w, h, lo, out_):                                    # cuts a rectangle into smaller ones no side under lo
    if (w < 2 * lo and h < 2 * lo) or (max(w, h) < 5 * lo and R.random() < 0.18): out_.append((x, y, w, h)); return
    if (w >= h and w >= 2 * lo) or h < 2 * lo:
        c = int(R.integers(lo, w - lo + 1)); c = max(lo, c - c % px(4)); split(x, y, c, h, lo, out_); split(x + c, y, w - c, h, lo, out_)
    else:
        c = int(R.integers(lo, h - lo + 1)); c = max(lo, c - c % px(4)); split(x, y, w, c, lo, out_); split(x, y + c, w, h - c, lo, out_)
def subpanels(x, y, w, h, z):                                       # fitted small panels of several heights
    ps = []; split(x, y, w, h, px(R.choice([10, 14, 20])), ps)
    for (a, b, c, d) in ps:
        zz = z + R.choice([-0.05, -0.03, -0.015, 0, 0.015, 0.03, 0.05, 0.08]); fill(a, b, c, d, zz); frame(a, b, c, d, px(1), -0.05)
        RO[box(a, b, c, d)] = 0.3 + 0.45 * R.random()
        if min(c, d) > px(14) and R.random() < .35: fill(a + px(4), b + px(4), c - px(8), d - px(8), 0.03 * R.choice([-1, 1]), True)
        if min(c, d) > px(18) and R.random() < .25: vent(a + px(4), b + px(4), c - px(8), d - px(8))
def bay(x, y, w, h, z):                                             # a sunk bay of machinery: boxes, pipes
    fill(x, y, w, h, z - 0.16); frame(x, y, w, h, px(2), 0.05); RO[box(x, y, w, h)] = 0.75
    hz = w >= h
    for k in range(int(R.integers(2, 6))):
        o = int(R.integers(px(6), max(px(7), (h if hz else w) - px(6)))); pipe(x + px(2) if hz else x + o, y + o if hz else y + px(2), (w if hz else h) - px(4), hz, int(R.integers(1, 4)) * px(1), z - 0.15)
    for k in range(int(w * h / (px(22) ** 2))):
        bw, bh = int(R.integers(px(5), px(26))), int(R.integers(px(5), px(26))); bx, by = x + int(R.integers(px(3), max(px(4), w - bw - px(3)))), y + int(R.integers(px(3), max(px(4), h - bh - px(3))))
        if bx + bw > x + w - px(2) or by + bh > y + h - px(2): continue
        zz = z - 0.12 + 0.14 * R.random(); fill(bx, by, bw, bh, zz); frame(bx, by, bw, bh, px(1), -0.03)
        if min(bw, bh) > px(10): fill(bx + px(3), by + px(3), bw - px(6), bh - px(6), 0.03, True)
def ribs(x, y, w, h, z):
    fill(x, y, w, h, z); p = px(R.choice([6, 8, 12]))
    if w >= h:
        for i in range(x + px(5), x + w - px(6), p): fill(i, y + px(5), p // 2, h - px(10), 0.06, True)
    else:
        for j in range(y + px(5), y + h - px(6), p): fill(x + px(5), j, w - px(10), p // 2, 0.06, True)
# 1. the armour: strakes across the tile, each cut into plates at its own places
levels = [0.42, 0.50, 0.56, 0.62, 0.70]; plates = []; y = 0; bands = []
while y < N:
    bh = min(N - y, px(R.integers(110, 230)));  bh = N - y if N - y - bh < px(90) else bh; bands.append((y, bh)); y += bh
for (by, bh) in bands:
    ps = []; split(0, by, N, bh, px(56), ps); off = int(R.integers(0, N))
    plates += [(a + off, b, c, d) for (a, b, c, d) in ps]
for (x, y, w, h) in plates:
    z = float(R.choice(levels)) + (0.04 * (R.random() - .5) if PIR else 0); g = px(2); fill(x, y, w, h, 0.18)   # the seam's depth
    x, y, w, h = x + g, y + g, w - 2 * g, h - 2 * g; fill(x, y, w, h, z); RO[box(x, y, w, h)] = 0.35 + 0.3 * R.random()
    frame(x, y, w, h, px(3), -0.025)                                # a chamfered rim
    kind = R.choice(['sub', 'sub', 'sub', 'bay', 'bay', 'ribs', 'plain', 'vents'] if not PIR else ['sub', 'sub', 'bay', 'bay', 'bay', 'plain', 'plain', 'vents'])
    m = px(8); ix, iy, iw, ih = x + m, y + m, w - 2 * m, h - 2 * m
    if kind != 'plain' and R.random() < .8: rivets(x + px(4), y + px(4), w - px(8), h - px(8), px(R.choice([8, 12, 16])))
    if kind == 'sub': subpanels(ix, iy, iw, ih, z)
    elif kind == 'bay': bay(ix, iy, iw, ih, z); 
    elif kind == 'ribs': ribs(ix, iy, iw, ih, z - 0.03)
    elif kind == 'vents':
        vs = []; split(ix, iy, iw, ih, px(24), vs)
        for (a, b, c, d) in vs:
            if R.random() < .7: vent(a + px(3), b + px(3), c - px(6), d - px(6))
            else: fill(a + px(3), b + px(3), c - px(6), d - px(6), 0.05, True)
    else:
        rivets(x + px(5), y + px(5), w - px(10), h - px(10), px(10), 1, 0.04)
        if min(iw, ih) > px(40): hatch(ix + iw // 2, iy + ih // 2, int(min(iw, ih) * R.uniform(.22, .4)))
        for k in range(int(R.integers(1, 5))): fill(ix + int(R.integers(0, max(1, iw - px(20)))), iy + int(R.integers(0, max(1, ih - px(8)))), px(R.integers(8, 30)), px(R.integers(3, 8)), 0.04, True)
# 2. what runs over the plates: conduit runs, small hatches, loose boxes
for _ in range(10 if not PIR else 18):
    n = int(R.integers(1, 5)); hz = R.random() < .5; x, y, L, r = int(R.integers(0, N)), int(R.integers(0, N)), px(R.integers(120, 700)), px(R.integers(1, 4))
    for k in range(n): pipe(x + (0 if hz else k * (2 * r + px(3))), y + (k * (2 * r + px(3)) if hz else 0), L, hz, r, 0.66)
for _ in range(26): hatch(int(R.integers(0, N)), int(R.integers(0, N)), px(R.integers(6, 14)))
for _ in range(500 if not PIR else 350):
    w, h = px(R.integers(2, 12)), px(R.integers(2, 12)); fill(int(R.integers(0, N)), int(R.integers(0, N)), w, h, R.choice([-0.05, 0.04, 0.07]), True)
fq = np.fft.fftfreq(N)
def blur(a, s): return np.real(np.fft.ifft2(np.fft.fft2(a) * np.exp(-2 * (np.pi * s) ** 2 * (fq[None, :] ** 2 + fq[:, None] ** 2)))).astype(np.float32)
if PIR:                                                             # patches riveted over the plates, dents, pitting
    for _ in range(46):
        w, h, x, y = px(R.integers(40, 170)), px(R.integers(30, 120)), int(R.integers(0, N)), int(R.integers(0, N)); b = box(x, y, w, h)
        H[b] = np.maximum(H[b], float(np.percentile(H[b], 80)) + 0.05 + 0.015 * blur(R.random((N, N)).astype(np.float32), 3)[:h, :w]); RO[b] = 0.8
        rivets(x + px(4), y + px(4), w - px(8), h - px(8), px(R.choice([7, 10])), px(1), 0.06)
    H += 0.55 * (blur(R.random((N, N)).astype(np.float32), 36 * U) - .5) + 0.5 * (blur(R.random((N, N)).astype(np.float32), 5 * U) - .5)
    H -= 0.6 * blur((R.random((N, N)) < 0.003).astype(np.float32), 1.3 * U)
H = blur(H, 0.55 * U); lo, hi = np.percentile(H, 0.05), np.percentile(H, 99.95); H = np.clip((H - lo) / (hi - lo), 0, 1)
k = 9.0 * U                                                         # how steep the relief is drawn in the normal map
dx = (np.roll(H, -1, 1) - np.roll(H, 1, 1)) * k; dy = (np.roll(H, -1, 0) - np.roll(H, 1, 0)) * k; nz = 1 / np.sqrt(dx * dx + dy * dy + 1)
nrm = np.stack([-dx * nz, dy * nz, nz], -1)                         # OpenGL: green up (the picture's y runs down)
ao = np.ones_like(H)
for s, a in ((2, 1.4), (6, 1.6), (18, 1.4)): ao -= a * np.clip(blur(H, s * U) - H, 0, 1)
ao = np.clip(ao, 0.12, 1)
ro = np.clip(blur(RO, 0.7) + 0.3 * (1 - ao) + 0.05 * (R.random((N, N)) - .5) + (0.25 * (blur(R.random((N, N)).astype(np.float32), 9 * U) - .5) * 8 if PIR else 0), 0.08, 0.96)
g8 = lambda a: Image.fromarray(np.clip(a * 255 + .5, 0, 255).astype(np.uint8))
n8 = Image.fromarray(np.clip((nrm * .5 + .5) * 255 + .5, 0, 255).astype(np.uint8))
fit = lambda im: im.resize((1024, 1024), Image.LANCZOS)
fit(n8).save(out + '/hull' + navy + '_n.jpg', quality=90, optimize=True)
fit(Image.merge('RGB', (g8(H), g8(ro), g8(ao)))).save(out + '/hull' + navy + '_h.jpg', quality=90, optimize=True)
print('hull' + navy, style, 'plates', len(plates))
