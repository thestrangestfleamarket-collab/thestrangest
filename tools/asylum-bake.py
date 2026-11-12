# bakes the asylum patient's skin: python3 tools/asylum-bake.py  ->  data/asylum/face.jpg, skin.jpg (from data/full/asylum/head-col.jpg, the Lee Perry-Smith head scan's colour map, CC BY 3.0)
import random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops
random.seed(9)
src = Image.open('data/full/asylum/head-col.jpg').convert('RGB'); W = src.size[0]
def corpse(im):
    g = ImageEnhance.Color(im).enhance(.28); g = ImageEnhance.Contrast(g).enhance(1.12)
    return ImageChops.multiply(g, Image.new('RGB', g.size, (196, 208, 204)))
def layer(draw_fn, blur, size):
    l = Image.new('RGBA', (size, size), (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(l)); return l.filter(ImageFilter.GaussianBlur(blur))
def veins(d, n, size, box):
    for _ in range(n):
        x, y = random.uniform(box[0], box[2]) * size, random.uniform(box[1], box[3]) * size; pts = [(x, y)]
        for _ in range(random.randint(8, 18)): x += random.uniform(-14, 14) * size / 1024; y += random.uniform(-4, 16) * size / 1024; pts.append((x, y))
        d.line(pts, fill=(38, 30, 58, random.randint(60, 120)), width=random.randint(1, 3))
def blotch(d, n, size):
    for _ in range(n):
        x, y, r = random.random() * size, random.random() * size, random.uniform(30, 120) * size / 1024
        d.ellipse((x - r, y - r * .7, x + r, y + r * .7), fill=random.choice([(70, 40, 78, 46), (40, 52, 44, 40), (24, 20, 18, 60)]))
face = corpse(src).convert('RGBA')
face.alpha_composite(layer(lambda d: blotch(d, 46, W), 26, W))
face.alpha_composite(layer(lambda d: veins(d, 60, W, (.12, .12, .88, .8)), 1.2, W))
def sockets(d):
    for cx in (.430, .572):
        for k, a in ((1.0, 150), (.72, 235), (.5, 255)): d.ellipse(((cx - .07 * k) * W, (.308 - .05 * k) * W, (cx + .07 * k) * W, (.318 + .058 * k) * W), fill=(4, 2, 4, a))
    d.ellipse((.445 * W, .448 * W, .555 * W, .492 * W), fill=(8, 2, 3, 250)); d.ellipse((.42 * W, .44 * W, .58 * W, .5 * W), fill=(30, 8, 10, 110))
face.alpha_composite(layer(sockets, 9, W))
def drips(d):
    for _ in range(9):
        x = random.uniform(.455, .545) * W; y = .47 * W; pts = [(x, y)]
        for _ in range(random.randint(5, 14)): x += random.uniform(-5, 5); y += random.uniform(8, 22); pts.append((x, y))
        d.line(pts, fill=(22, 3, 4, 235), width=random.randint(3, 9))
    for cx in (.430, .572):
        x = cx * W + random.uniform(-6, 6); y = .34 * W; pts = [(x, y)]
        for _ in range(9): x += random.uniform(-4, 4); y += random.uniform(8, 18); pts.append((x, y))
        d.line(pts, fill=(14, 3, 5, 200), width=4)
face.alpha_composite(layer(drips, 1.6, W))
face.alpha_composite(layer(lambda d: [d.ellipse((cx * W - 3, .312 * W - 3, cx * W + 3, .312 * W + 3), fill=(190, 200, 190, 255)) for cx in (.430, .572)], .8, W))
face.convert('RGB').save('data/asylum/face.jpg', quality=82)
S = 512; patch = corpse(src.crop((60, 380, 60 + 200, 380 + 200))).resize((S // 2, S // 2), Image.LANCZOS); tile = Image.new('RGB', (S, S))
for i, (x, y) in enumerate(((0, 0), (S // 2, 0), (0, S // 2), (S // 2, S // 2))): tile.paste(patch.transpose([Image.FLIP_LEFT_RIGHT, Image.FLIP_TOP_BOTTOM, Image.ROTATE_180, Image.ROTATE_90][i]) if i else patch, (x, y))
tile = tile.filter(ImageFilter.GaussianBlur(2)).convert('RGBA'); tile.alpha_composite(layer(lambda d: blotch(d, 40, S), 14, S)); tile.alpha_composite(layer(lambda d: veins(d, 70, S, (0, 0, 1, 1)), .9, S))
tile.alpha_composite(layer(lambda d: [d.ellipse((x - r, y - r, x + r, y + r), fill=(30, 6, 6, 150)) for x, y, r in [(random.random() * S, random.random() * S, random.uniform(4, 22)) for _ in range(26)]], 3, S))
tile.convert('RGB').save('data/asylum/skin.jpg', quality=80)
