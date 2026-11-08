# THE DOUBLE BASS'S BOOK (owner, 8 Nov 2026: the double bass): its pieces are the piano's (data/piano-songs.json, Mutopia, public domain), each one's bass line:
# the left hand's lowest note at each onset, one note at a time (each held till the next), notes closer than a plucking hand can manage dropped, moved by whole
# octaves into the bass's range (E1 to G3) as one and the strays folded in. Writes data/bass-songs.json: per piece its name, composer, credit, level and notes as
# [dt, midi, length] (centiseconds). Run: python3 tools/bass-songs-bake.py (after the piano's bake)
import json, os
LO, HI, GAP = 28, 55, 14
songs = []
for S in json.load(open('data/piano-songs.json'))['songs']:
    n = S['n']; t = 0; ev = []
    for i in range(0, len(n) - 3, 4):
        t += n[i]
        if not (n[i + 3] & 1): ev.append([t, n[i + 1], n[i + 2]])
    by = {}
    for a, m, d in ev: by[a] = min(by.get(a, (999, 0)), (m, d))
    line = []
    for a in sorted(by):
        if line and a - line[-1][0] < GAP: continue
        line.append([a, *by[a]])
    if len(line) < 16: continue
    ms = [m for _, m, _ in line]; best = max(range(-48, 25, 12), key=lambda k: sum(LO <= m + k <= HI for m in ms))
    out = []; last = 0
    for j, (a, m, d) in enumerate(line):
        m += best
        while m < LO: m += 12
        while m > HI: m -= 12
        nxt = line[j + 1][0] if j + 1 < len(line) else a + d
        out += [a - last, m, max(8, min(d, nxt - a))]; last = a
    songs.append({'name': S['name'], 'by': S['by'], 'lvl': S['lvl'], 'secs': S['secs'], 'credit': S['credit'], 'n': out})
json.dump({'songs': songs}, open('data/bass-songs.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(songs), 'songs', os.path.getsize('data/bass-songs.json'), 'bytes; levels', sorted(set(s['lvl'] for s in songs))[:5], '...', max(s['lvl'] for s in songs))
