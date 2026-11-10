# THE APP'S ICONS (owner, 10 Nov 2026: "make placeholder icons"): a market stall's striped awning on the page's dark colour, kept in the middle for a maskable icon. Run: python3 tools/app-icons.py
from PIL import Image, ImageDraw
BG, RED, CREAM, WOOD = (14, 16, 22), (196, 44, 40), (240, 226, 196), (122, 78, 44)
for n in (192, 512):
    S = 4; N = n * S; im = Image.new('RGB', (N, N), BG); d = ImageDraw.Draw(im); u = N / 100
    x0, x1, top, low = 22 * u, 78 * u, 30 * u, 50 * u
    w = (x1 - x0) / 6
    for i in range(6):
        d.rectangle([x0 + i * w, top, x0 + (i + 1) * w, low], fill=RED if i % 2 == 0 else CREAM)
        d.pieslice([x0 + i * w, low - w / 2, x0 + (i + 1) * w, low + w / 2], 0, 180, fill=RED if i % 2 == 0 else CREAM)
    d.rectangle([x0 - 2 * u, top - 4 * u, x1 + 2 * u, top], fill=RED)
    d.rectangle([x0 + 2 * u, low + 2 * u, x0 + 5 * u, 76 * u], fill=WOOD); d.rectangle([x1 - 5 * u, low + 2 * u, x1 - 2 * u, 76 * u], fill=WOOD)
    d.rectangle([x0, 64 * u, x1, 70 * u], fill=WOOD)
    for i, c in enumerate([(232, 176, 60), (90, 150, 200), (120, 180, 90), (200, 110, 160)]):
        cx = x0 + (i + 1) * (x1 - x0) / 5; d.ellipse([cx - 4 * u, 56 * u, cx + 4 * u, 64 * u], fill=c)
    im.resize((n, n), Image.LANCZOS).save(f'src/door/icon-{n}.png', optimize=True)
    print(f'src/door/icon-{n}.png')
