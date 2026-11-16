# bakes THE GARAGE's recorded kit (src/drums/): python3 tools/drums-bake.py  ->  data/drums/<piece>.mp3 and data/drums/kit.json
# The MuldjordKit by Lars Muldjord, FreePats' stereo version (CC BY 4.0): every piece's takes from softest to loudest, each cut to start
# 1.5 ms before its own first sound (no dead air before a hit) and laid end to end. Each file opens with one click at CLICK seconds:
# the page finds it in what the browser decoded, so a decoder's own lead-in never shifts a hit.
# The download goes to data/full/samples/drums/ (not kept in git). Needs ffmpeg, numpy, py7zr.
import os, sys, json, glob, subprocess, urllib.request
import numpy as np
SRC = 'data/full/samples/drums'; OUT = 'data/drums'; SR = 44100; CLICK = .02; LEAD = .08; GAP = .05; PRE = .0015
URL = 'https://github.com/freepats/muldjordkit/releases/download/2020-10-18/MuldjordKit-SFZ+FLAC-20201018.7z'
# key, the kit's folder, how many takes at most, seconds kept of each
PIECES = [('kick', 'KdrumR', 26, 1.0), ('snare', 'Snare1', 56, 1.6), ('stick', 'SnareRest1', 13, 1.0), ('tom1', 'Tom1', 11, 2.5), ('tom2', 'Tom2', 13, 3.0),
          ('floor', 'Tom4', 16, 3.5), ('hatc', 'HihatClosed', 29, .57), ('hato', 'HihatOpen', 24, 1.55), ('crash1', 'CrashL', 9, 6.0), ('crash2', 'CrashR', 12, 6.0),
          ('ride', 'RideR', 10, 7.0), ('bell', 'RideRBell', 8, 5.0)]

def fetch():
    kit = f'{SRC}/kit.7z'
    if not glob.glob(f'{SRC}/kit/*/samples'):
        os.makedirs(SRC, exist_ok=True)
        if not os.path.exists(kit):
            r = urllib.request.Request(URL, headers={'User-Agent': 'bake/1.0'}); open(kit, 'wb').write(urllib.request.urlopen(r, timeout=900).read())
        import py7zr; py7zr.SevenZipFile(kit).extractall(f'{SRC}/kit')
    return glob.glob(f'{SRC}/kit/*/samples')[0]

def pcm(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)

def cut(x, dur):
    m = np.abs(x).max(axis=1); pk = m.max()
    on = int(np.argmax(m > pk * .02)); a = max(0, on - int(PRE * SR)); x = x[a:a + int(dur * SR)].copy()
    n = len(x); f = min(n, int(min(dur * .35, 1.2) * SR)); x[n - f:] *= np.linspace(1, 0, f)[:, None] ** 2
    k = min(len(x), 32); x[:k] *= np.linspace(0, 1, k)[:, None]
    return x

base = fetch(); os.makedirs(OUT, exist_ok=True); takes = {}; top = 0
for key, d, most, dur in PIECES:
    fs = glob.glob(f'{base}/{d}/*.flac'); T = []
    for f in fs:
        x = cut(pcm(f), dur); w = x[:int(.08 * SR)]; T.append((float(np.sqrt((w ** 2).mean())), x))
    T.sort(key=lambda t: t[0])
    if len(T) > most: T = [T[round(i * (len(T) - 1) / (most - 1))] for i in range(most)]   # spread over the whole range, the softest and the loudest kept
    takes[key] = T; top = max(top, max(np.abs(x).max() for _, x in T))
scale = .92 / top; index = {'credit': 'THE MULDJORDKIT, LARS MULDJORD (CC BY 4.0), FREEPATS', 'click': CLICK, 'pieces': {}}; total = 0
for key, d, most, dur in PIECES:
    lead = np.zeros((int(LEAD * SR), 2)); lead[int(CLICK * SR)] = .6; parts = [lead]; t = LEAD; S = []; loud = takes[key][-1][0]
    for lv, x in takes[key]:
        S.append([round(t, 5), round(len(x) / SR, 4), round(lv / loud, 4)]); parts += [x * scale, np.zeros((int(GAP * SR), 2))]; t += len(x) / SR + int(GAP * SR) / SR
    data = np.concatenate(parts).astype('<f4').tobytes(); mp3 = f'{OUT}/{key}.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '256k', mp3], input=data, check=True)
    index['pieces'][key] = {'gain': round(float(loud * scale), 4), 's': S}; total += os.path.getsize(mp3)
    print(key, len(S), 'takes', round(t, 1), 's', os.path.getsize(mp3) // 1024, 'KB')
json.dump(index, open(f'{OUT}/kit.json', 'w'), separators=(',', ':'))
print('data/drums/', total // 1024, 'KB')
