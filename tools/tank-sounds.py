# cuts HULL DOWN's recorded sounds (all CC0; one row each in docs/tank-credits.md): python3 tools/tank-sounds.py  ->  data/tank/snd/*.mp3; the recordings as they come are kept in data/full/tank/snd/ (fetched when missing; needs ffmpeg)
import os, subprocess, urllib.request, urllib.parse, numpy as np
RAW, OUT, SR = 'data/full/tank/snd/', 'data/tank/snd/', 44100
B, U = 'https://bigsoundbank.com/UPLOAD/bwf-en/', 'https://archive.org/download/'
# name: (source, start s or None for the first loud moment, seconds, kind, gain dB under full, extra ffmpeg filter)
CUT = {
 'eng_idle': (B + '0369.wav', 19, 8, 'loop', 0, ''), 'eng_run': (U + 'GOLD_TAPE_15_Tanks_Bulldozers/G15-26-Tanks Close Up.wav', 148, 8, 'loop', 0, ''),
 'turbine': (U + 'SSE_Library_MOTORS/MOTRTurb Engine room high whine from turbines CS USC.wav', 6, 7, 'loop', -3, ''),
 'tracks': (U + 'GOLD_TAPE_15_Tanks_Bulldozers/G15-24-M-4 Squeaky Pass By.wav', 54.5, 8, 'loop', 0, 'highpass=f=250'),
 'servo': (B + '0708.wav', 18, 5, 'loop', -2, ''), 'fan': (B + '2434.wav', 1, 7, 'loop', -4, ''), 'hum': (U + 'GOLD_TAPE_45_Submarine_Effects/G45-17-Hum in Conning Tower.wav', 10, 8, 'loop', -4, ''),
 'wind': (B + '0908.wav', 68, 12, 'loop', -2, ''), 'birds': (B + '1859.wav', 30, 18, 'loop', -2, ''), 'battle': (U + 'SSE_Library_AMBIENCE/AMBWar Tank battle background CS USC.wav', 5, 20, 'loop', -2, 'lowpass=f=1800'),
 'fire': (U + 'SSE_Library_FIRE/FIREBurn Heavy fire crackle CS USC.wav', .5, 9, 'loop', -2, ''), 'static': (B + '0312.wav', .2, 3.2, 'loop', -6, ''),
 'gun_in': (U + 'Red_Library_Guns_Artillery/R12-12-Large Gun in Metal Bunker.wav', None, 4.5, 'shot', 0, ''), 'gun_out': (U + 'SSE_Library_GUNS/GUNCano Cannon shot CS USC.wav', None, 4.2, 'shot', 0, ''),
 'crack': (B + '1808.wav', None, .33, 'shot', 0, ''), 'gun_far': (B + '1023.wav', None, 4.2, 'shot', 0, ''), 'boom': (U + 'SSE_Library_EXPLOSIONS/EXPLReal Explosion bomb or shell CHS USC.wav', None, 5, 'shot', 0, ''),
 'boom_far': (U + 'GOLD_TAPE_43_Seismic_Effects/G43-14-25 Distant Explosions.wav', None, 3.6, 'shot', 0, ''), 'whizz': (U + 'SSE_Library_GUNS/GUNArtl Large shells flies overhead CS USC.wav', 0, 4.5, 'shot', -1, ''),
 'clang': (U + 'GOLD_TAPE_16_17_18_Ambience/G17-14-Several Big Metal Hits.wav', None, 2.6, 'shot', 0, ''), 'rico': (U + 'SSE_Library_BULLETS/BLLTRico Rifle ricochets CS USC.wav', None, 1.6, 'shot', -2, ''),
 'hatch': (U + 'GOLD_TAPE_45_Submarine_Effects/G45-30-Submarine Hatch Opening.wav', None, 3.2, 'shot', -2, ''), 'slam': (U + 'Red_Library_Doors/R09-01-Metal Door Slam.wav', None, 2.2, 'shot', -1, ''),
 'breech': (U + 'Red_Library_Doors/R18-37-Sliding Metal Door Closes.wav', None, 2.4, 'shot', -2, ''), 'latch': (B + '1540.wav', None, 1.6, 'shot', -3, ''), 'thump': (U + 'Red_Library_Metal/R16-35-Metal Thump.wav', None, 1.6, 'shot', -1, ''),
 'switch': (B + '3061.wav', None, .8, 'shot', -6, ''), 'beep': (B + '2380.wav', None, .26, 'shot', -10, ''),
}
def raw(url):
    f = RAW + url.split('/')[-1].replace(' ', '_')
    if not os.path.exists(f): open(f, 'wb').write(urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(url, safe=':/'), headers={'User-Agent': 'curl/8'}), timeout=600).read())
    return f
for d in (RAW, OUT): os.makedirs(d, exist_ok=True)
for name, (url, at, secs, kind, gain, flt) in CUT.items():
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', raw(url), '-ac', '1', '-ar', str(SR), '-af', 'highpass=f=28' + (',' + flt if flt else ''), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, np.float32).copy(); X = int(SR * .6)
    if at is None:   # the first loud moment
        w = int(SR * .01); e = np.sqrt(np.convolve(a * a, np.ones(w) / w, 'same')); at = max(0, int(np.argmax(e > e.max() * .25)) / SR - .02)
    i = int(at * SR); n = int(secs * SR)
    if kind == 'loop':   # the tail is faded into the head, so the end meets the start
        s = a[i:i + n + X].copy(); t = np.linspace(0, 1, X, dtype=np.float32); s[:X] = s[:X] * np.sqrt(t) + s[n:n + X] * np.sqrt(1 - t); s = s[:n]
    else:
        s = a[i:i + n].copy(); f = min(len(s), int(SR * min(.5, secs * .3))); s[-f:] *= np.linspace(1, 0, f, dtype=np.float32) ** 2; s[:64] *= np.linspace(0, 1, 64, dtype=np.float32)
    s *= 10 ** ((gain - 1) / 20) / max(1e-6, np.abs(s).max())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '96k' if kind == 'loop' else '112k', OUT + name + '.mp3'], input=s.tobytes(), check=True)
    print(name, round(at, 2), round(len(s) / SR, 2), 's', os.path.getsize(OUT + name + '.mp3') // 1024, 'KB', flush=True)
