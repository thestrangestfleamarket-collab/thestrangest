# builds SKIRMISH TABLE's later sounds from recordings (all CC0; one row each in docs/chess-sounds.md): python3 tools/chess-sounds.py [name ...]  ->  data/chess/sfx/<name>.mp3 (mono, levelled, no peak above -4 dB)
# nothing is synthesised: each is a cut of a recording, played faster or slower, faded and levelled. The recordings are fetched into a scratch folder (CHESS_RAW, default /tmp/chess-snd) and are not kept. Needs ffmpeg and numpy.
import os, subprocess, sys, urllib.request, urllib.parse, numpy as np
RAW, OUT, SR = os.environ.get('CHESS_RAW', '/tmp/chess-snd') + '/', 'data/chess/sfx/', 44100
KEN = 'https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main/kenney-'   # an unchanged copy of Kenney's packs (kenney.nl refuses automated downloads)
USC = 'https://archive.org/download/SSE_Library_'   # the USC Optical Sound Effects Library on the Internet Archive, every item CC0
F, I, R, U = 'foley-sounds/audio/Audio/', 'impact-sounds/audio/Audio/', 'rpg-audio/audio/Audio/', 'interface-sounds/audio/Audio/'
# name: (where from, how it is cut, played how fast, how loud (dB, its loudest third of a second)); a cut is None (all of it, its silence trimmed), ('event', which loudest, seconds) or ('span', from, seconds)
S = {
 **{'paw%d' % i: (KEN + I + 'footstep_carpet_00%d.ogg' % i, None, 1.15, -26) for i in range(3)},
 **{'bone%d' % i: (KEN + I + 'impactWood_light_00%d.ogg' % i, None, 1.5, -23) for i in range(4)},
 'glass0': (KEN + I + 'impactGlass_heavy_000.ogg', None, 1, -21), 'glass1': (KEN + I + 'impactGlass_medium_000.ogg', None, 1, -21),
 'cloth0': (KEN + R + 'cloth1.ogg', None, 0.9, -25), 'cloth1': (KEN + R + 'cloth2.ogg', None, 0.9, -25),
 **{'drip%d' % i: (KEN + F + 'Water/drip%d.ogg' % (i + 1), None, 1, -28) for i in range(3)},
 **{'woosh%d' % i: (KEN + F + 'Woosh/woosh%d.ogg' % (i + 1), None, 1, -23) for i in range(4)},
 'chop': (KEN + R + 'chop.ogg', None, 0.9, -20),
 'punch0': (KEN + I + 'impactPunch_heavy_000.ogg', None, 0.9, -20), 'punch1': (KEN + I + 'impactPunch_heavy_001.ogg', None, 0.9, -20),
 'scrape': (KEN + F + 'Swords/swordStone1.ogg', None, 1, -23),
 'growl': (USC + 'ANIMALS/DOG/ANMLDog_Dog barking viciously_CS_USC.wav', ('event', 0, 0.7), 0.8, -20),
 'whine': (USC + 'ANIMALS/DOG/ANMLDog_Dog whines; whimpers; snarls_CS_USC.wav', ('event', 0, 0.8), 1, -22),
 'roar': (USC + 'CREATURES/DRAGON/CREADrgn_Dragon spits flame_CS_USC.wav', ('event', 0, 1.4), 1.2, -20),
 'screech': (USC + 'CREATURES/MONSTER/CREAMnstr_Half grown monster screaming_CS_USC.wav', ('event', 0, 0.9), 1.15, -22),
 'grunt': (USC + 'CREATURES/BEAST/CREABeast_Mythical beast groans and screams_CS_USC.wav', ('event', 0, 0.9), 1, -20),
 'groan': (USC + 'CREATURES/DINOSAUR/CREADino_Mastodon growls; dinosaur_CS_USC.wav', ('event', 0, 1.4), 1.1, -20),
 'wail': (USC + 'MAGIC/ELEMENTAL/MAGElem_Spooky eerie ghost wind; synthesized tape_CS_USC.wav', ('event', 0, 1.8), 1, -24),
 'moan': (USC + 'WIND/TONAL/WINDTonl_Spooky singing ghost wind_CS_USC.wav', ('event', 0, 1.5), 1, -25),
 'flare': (USC + 'FIRE/WHOOSH/FIREWhsh_Flare whoosh_CS_USC.wav', ('event', 0, 1.3), 1, -21),
 'burn': (USC + 'FIRE/BURNING/FIREBurn_Heavy fire crackle_CS_USC.wav', ('span', 2, 1.2), 1, -24),
 'arrow': (USC + 'WEAPONS/ARROW/WEAPArro_Hard arrow thud into wooden po_CS_USC.wav', None, 1, -21),
 'bodyfall': (USC + 'FIGHT/BODYFALL/FGHTBf_Body hit and crash_CS_USC.wav', ('event', 0, 1.1), 1, -20),
 'shimmer': (USC + 'MAGIC/SHIMMER/MAGShim_Genie appearing from and returning to a bottle_CS_USC.wav', ('event', 0, 1.5), 1, -24),
 'tone': (USC + 'WIND/GENERAL/WIND_Steady wind_CS_USC.wav', ('loop', 2, 10), 0.7, -30),   # the room: a steady wind slowed and muffled, its two ends folded together
}

def raw(url):
    f = RAW + urllib.parse.unquote(url.split('/')[-1])
    if not os.path.exists(f):
        os.makedirs(RAW, exist_ok=True); u = url.split('://'); data = urllib.request.urlopen(urllib.request.Request(u[0] + '://' + urllib.parse.quote(u[1]), headers={'User-Agent': 'Mozilla/5.0 asset-fetch'}), timeout=600).read(); open(f, 'wb').write(data)
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)

def env(x, ms=20):
    n = SR * ms // 1000; k = len(x) // n; return np.sqrt((x[:k * n].reshape(k, n) ** 2).mean(axis=1) + 1e-12), n

def make(name):
    url, cut, rate, level = S[name]; x = raw(url); x = x - x.mean()
    if cut is None:
        e, n = env(x, 5); on = np.nonzero(e > e.max() * 0.03)[0]; a = max(0, on[0] * n - SR // 200); x = x[a:min(len(x), on[-1] * n + SR // 4)][:int(SR * 1.6)]
    elif cut[0] == 'event':
        e, n = env(x); w = max(1, int(cut[2] * 1000 // 20)); sums = np.convolve(e ** 2, np.ones(w), 'valid'); order = []
        for i in np.argsort(-sums):   # the loudest stretches of that length, none overlapping
            if all(abs(i - j) >= w for j in order): order.append(i)
            if len(order) > cut[1]: break
        i = order[cut[1]]; pk = e[i:i + w].max(); j = i
        while j > 0 and i - j < 20 and e[j - 1] > pk * 0.08: j -= 1
        x = x[max(0, j * n - SR // 100):][:int(SR * cut[2] * rate)]
    else:
        x = x[int(SR * cut[1]):][:int(SR * (cut[2] + (1.5 if cut[0] == 'loop' else 0)) * rate)]
    if rate != 1: idx = np.arange(0, len(x) - 1, rate); x = np.interp(idx, np.arange(len(x)), x)
    if cut and cut[0] == 'loop':
        f = np.fft.rfft(x); hz = np.fft.rfftfreq(len(x), 1 / SR); f *= 1 / (1 + (hz / 380) ** 4); x = np.fft.irfft(f, len(x))   # muffled, as heard through stone
        k = int(SR * 1.5); t = np.linspace(0, 1, k); x = np.concatenate([x[k:-k], x[-k:] * np.sqrt(1 - t) + x[:k] * np.sqrt(t)])
    else:
        a = min(len(x) // 8, SR // 200); x[:a] *= np.linspace(0, 1, a); b = max(SR // 50, int(len(x) * 0.3)); x[-b:] *= np.linspace(1, 0, b) ** 2
    w = min(len(x), SR // 3); loud = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, 'valid').max()); x *= 10 ** (level / 20) / max(loud, 1e-9)
    lim = 10 ** (-4 / 20); x = np.where(np.abs(x) > lim * 0.7, np.sign(x) * (lim * 0.7 + lim * 0.3 * np.tanh((np.abs(x) - lim * 0.7) / (lim * 0.3))), x)   # no peak above -4 dB: the top is bent over, never clipped
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-b:a', '48k' if name == 'tone' else '64k', OUT + name + '.mp3'], input=x.astype(np.float32).tobytes(), check=True)
    print('%-9s %5.2f s  peak %6.1f dB  loudest %6.1f dB  %5d bytes' % (name, len(x) / SR, 20 * np.log10(np.abs(x).max()), level, os.path.getsize(OUT + name + '.mp3')), flush=True)

for name in sys.argv[1:] or S: make(name)
