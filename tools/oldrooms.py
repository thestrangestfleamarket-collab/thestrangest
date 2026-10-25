#!/usr/bin/env python3
# Bakes the old game's rooms (docs/old-game/*.csv) into data/oldrooms-index.json (names and boxes, inlined) and data/oldrooms.json (each room's items, fetched on the first jump).
import csv, json, re, collections, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKIP = {'Outdoors - The Block', 'No room (outside every room)', 'Room Creator', 'Aquarium Hall (switched off)', 'Museum of Earth (copy)', 'Bodega (second)', 'Bodega', 'Arcade'}
PAD, MIN, SLOT, COLS, X0, Y0 = 1.5, 6.0, 40, 7, 600, -400
rooms = collections.defaultdict(lambda: collections.defaultdict(list))
with open('docs/old-game/all-items.csv', newline='') as f:
    for r in csv.DictReader(f):
        if r['room'] in SKIP: continue
        try: x, y = float(r['x']), float(r['y'])
        except ValueError: continue
        rooms[r['room']][r['level'] or '0'].append([r['catalog_kind'] or r['item'], x, y])
order = [r['room'] for r in csv.DictReader(open('docs/old-game/rooms.csv', newline=''))]
index, items = [], {}
for i, name in enumerate(n for n in order if n in rooms):
    lv, L = max(rooms[name].items(), key=lambda kv: len(kv[1]))
    xs, ys = [p[1] for p in L], [p[2] for p in L]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    w, h = max(MIN, max(xs) - min(xs) + 2 * PAD), max(MIN, max(ys) - min(ys) + 2 * PAD)
    sx, sy = X0 + (i % COLS) * SLOT + SLOT / 2, Y0 + (i // COLS) * SLOT + SLOT / 2
    dx, dy = sx - cx, sy - cy
    rid = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    own = any(re.search(r' floor$| wall, (west|east|north|south)$', k) for k, _, _ in L)
    index.append({'id': rid, 'name': name.upper(), 'lv': int(float(lv)), 'own': int(own), 'x0': round(sx - w / 2, 2), 'y0': round(sy - h / 2, 2), 'x1': round(sx + w / 2, 2), 'y1': round(sy + h / 2, 2), 'n': len(L)})
    items[rid] = [[k, round(x + dx, 2), round(y + dy, 2)] for k, x, y in L]
json.dump(index, open('data/oldrooms-index.json', 'w'), separators=(',', ':'))
json.dump(items, open('data/oldrooms.json', 'w'), separators=(',', ':'))
print(len(index), 'rooms;', sum(len(v) for v in items.values()), 'items;', os.path.getsize('data/oldrooms-index.json'), '+', os.path.getsize('data/oldrooms.json'), 'bytes')
