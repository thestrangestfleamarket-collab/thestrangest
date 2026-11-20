# cuts RAMEN's ElevenLabs sound effects (made with its Sound Effects v2 model on 19 Nov 2026; the originals and the words that made them are kept in data/full/sushi/snd-eleven/) into the page's small files: python3 tools/sushi-sfx.py  ->  data/sushi/snd/*.mp3 (mono; loops 32 kHz 40 kbps with their tail laid over their head, hits 44.1 kHz 56 kbps, peak at -1 dBFS; the walk cut into single steps); needs ffmpeg and numpy; credits in docs/sushi-sounds.md
import os, re, subprocess, sys
import numpy as np

RAW, OUT = 'data/full/sushi/snd-eleven/', 'data/sushi/snd/'
# ours: (kind, the words it was made from)
SFX = {
    'roofrain': ('loop', 'Gentle steady rain on a corrugated tin roof just overhead, close soft patter, even and continuous, no thunder, no wind, no voices, no music'),
    'rainst': ('loop', 'Gentle light rain falling on city pavement at night, soft even hiss with small drips into puddles, calm, no thunder, no wind, no traffic, no voices'),
    'citynight': ('loop', 'Quiet city street ambience late at night, a low distant hum of traffic several blocks away, faint far-off cars on wet roads, calm, no horns, no sirens, no voices, no music'),
    'burner': ('loop', 'A gas stove burner flame burning steadily, soft continuous hiss and low roar of the gas ring, close, nothing else'),
    'neon': ('loop', "A neon sign's quiet steady electrical hum and faint buzz, constant, no crackle, no flicker, nothing else"),
    'carwet': ('hit', 'One car driving slowly past on a wet city street, tyres hissing on the wet asphalt, approaching and going away, no horn, no engine revving'),
    'steps': ('steps', 'Slow footsteps of one person in leather shoes walking on wet concrete pavement, six even steps, close, nothing else'),
    'stool': ('hit', 'A metal bar stool dragged a short way across a concrete pavement, one short scrape'),
    'register': ('hit', 'An old mechanical cash register: one key pressed, the bell rings once and the cash drawer slides open with coins rattling'),
    'sticks': ('hit', 'Wooden chopsticks tapping and clinking against a ceramic bowl, two light taps, close'),
    'slurp': ('hit', 'A person slurping hot noodles from a bowl, one short quiet slurp'),
    'bell': ('hit', 'A small brass counter service bell struck once, a clear single ding ringing out'),
}
def pcm(f, sr): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
def put(a, sr, name, br):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', br, OUT + name + '.mp3'], input=a.astype(np.float32).tobytes(), check=True)
    print(name, round(len(a) / sr, 2), 's', os.path.getsize(OUT + name + '.mp3') // 1024, 'KB', flush=True)
def db(x): return 10 ** (x / 20)
def hit(a, sr, lead=0.01):   # from just before it starts to where it has died away, faded at both ends, its peak at -1 dBFS
    e = np.abs(a); on = np.nonzero(e > e.max() * 0.03)[0]; off = np.nonzero(e > e.max() * 0.006)[0]; i0 = max(0, on[0] - int(lead * sr)); i1 = min(len(a), off[-1] + int(0.05 * sr)); a = a[i0:i1].copy()
    k = int(0.004 * sr); a[:k] *= np.linspace(0, 1, k); t = max(k, int(len(a) * 0.15)); a[-t:] *= np.linspace(1, 0, t) ** 1.5
    return a * db(-1) / max(1e-6, np.abs(a).max())
os.makedirs(OUT, exist_ok=True)
for name, (kind, words) in SFX.items():
    f = RAW + name + '.mp3'
    if kind == 'loop':
        sr = 32000; a = pcm(f, sr); k = int(min(1.0, len(a) / sr * 0.12) * sr); n = len(a) - k; w = np.linspace(0, 1, k, dtype=np.float32)
        a[:k] = a[:k] * np.sqrt(w) + a[n:n + k] * np.sqrt(1 - w); a = a[:n]
        rms = np.sqrt(np.mean(a * a)); g = min(db(-22) / max(1e-7, rms), db(-1) / max(1e-7, np.abs(a).max())); put(a * g, sr, name, '40k')
    elif kind == 'hit': sr = 44100; put(hit(pcm(f, sr), sr), sr, name, '56k')
    else:   # the walk: each footfall found by where the sound rises, cut out on its own
        sr = 44100; a = pcm(f, sr); win = int(0.02 * sr); env = np.sqrt(np.convolve(a * a, np.ones(win) / win, 'same')); th = env.max() * 0.25; got = []; i = 0
        while i < len(a) and len(got) < 6:
            if env[i] > th and (not got or i - got[-1] > int(0.3 * sr)): got.append(i)
            i += 1
        got = sorted(got, key=lambda i: -env[i:i + int(0.1 * sr)].max())[:4]
        for n, i in enumerate(sorted(got)): put(hit(a[max(0, i - int(0.03 * sr)):i + int(0.32 * sr)], sr), sr, 'step%d' % (n + 1), '56k')
