# builds SPACE FLEET's sounds from real recordings (all CC0; one row each in docs/space-sounds.md): python3 tools/space-sounds.py  ->  data/space/snd/*.mp3
# the recordings as they come are kept in data/full/space/snd/ (fetched when missing, about 420 MB; needs ffmpeg and numpy)
# nothing is synthesised: every layer is a cut of a recording, pitched (played faster or slower), filtered, shaped and mixed - the way film sound builds weapons that do not exist
import os, subprocess, urllib.request, urllib.parse, numpy as np
RAW, OUT, SR = 'data/full/space/snd/', 'data/space/snd/', 44100
U = 'https://archive.org/download/'
SSE, GOLD, RED = U + 'SSE_Library_', U + 'GOLD_TAPE_', U + 'Red_Library_'
SRC = {   # USC Optical Sound Effects Library on the Internet Archive (Sunset Editorial, Gold and Red libraries), every item CC0
 'rifle': SSE + 'GUNS/RIFLE/GUNRif_Very sharp small rifle fire_CS_USC.wav', 'pistol': SSE + 'GUNS/PISTOL/GUNPis_Big optical gun shot; close_CS_USC.wav',
 'cannon': SSE + 'GUNS/CANNON/GUNCano_Cannon shot_CS_USC.wav', 'naval': SSE + 'GUNS/CANNON/GUNCano_6 inch navel cannon fired up close_CS_USC.wav',
 'at37': SSE + 'GUNS/ARTILLERY/GUNArtl_squad firing 37mm anti tank guns_CS_USC.wav', 'whip': SSE + 'WEAPONS/WHIP/WEAPWhip_Whip crack_CS_USC.wav',
 'zap': SSE + 'ELECTRICITY/ZAP/ELECZap_Machine made electrical lightning explosions_CS_USC.wav', 'arcs': SSE + 'ELECTRICITY/ARC/ELECArc_Huge electrical arcs_CS_USC.wav',
 'sparks': SSE + 'ELECTRICITY/SPARKS/ELECSprk_Huge hissing electric sparks nearby_CS_USC.wav', 'tesla': SSE + 'ELECTRICITY/SPARKS/ELECSprk_Tesla coil sparking and humming_CHS_USC.wav',
 'coil': SSE + 'ELECTRICITY/BUZZ & HUM/ELECBuzz_Tesla coil hum_CHS_USC.wav', 'field': GOLD + '32_Electricity/G32-15-Force Field.wav',
 'x_sharp': SSE + 'EXPLOSIONS/REAL/EXPLReal_Heavy sharp explosion with reverb_CS_USC.wav', 'x_heavy': SSE + 'EXPLOSIONS/REAL/EXPLReal_Single heavy explosions 1_CS_USC.wav',
 'x_good': SSE + 'EXPLOSIONS/REAL/EXPLReal_Explosion; good_CS_USC.wav', 'x_debris': SSE + 'EXPLOSIONS/REAL/EXPLReal_Large explosion with debris_CS_USC.wav',
 'x_dyn': SSE + 'EXPLOSIONS/REAL/EXPLReal_Dynamite explosion_CS_USC.wav', 'x_gren': SSE + 'EXPLOSIONS/REAL/EXPLReal_Grenade explodes_CHS_USC.wav',
 'x_atom': SSE + 'EXPLOSIONS/REAL/EXPLReal_Atomic bomb explosion then rumble_CS_USC.wav', 'x_huge': RED + 'Explosions/R09-53-Huge Explosion.wav',
 'x_crisp': RED + 'Explosions/R30-06-Big Crisp Explosions.wav', 'thunder': SSE + 'WEATHER/THUNDER/THUN_Thunderclap; strong but dull; could be explo_CS_USC.wav',
 'metal': SSE + 'METAL/IMPACT/METLImpt_Metal hits against metal; foley_CS_USC.wav', 'crash': SSE + 'METAL/CRASH & DEBRIS/METLCrsh_Large hard metal crash; optical_CS_USC.wav',
 'clank': RED + 'Metal/R16-31-Metal Clank and Ring.wav', 'girders': SSE + 'METAL/MOVEMENT/METLMvmt-GIRDERS_Steel girders wrench and tear; creaking metal_CS_USC.wav',
 'drone': SSE + 'SCIFI/SPACESHIP/SCIShip_Power drone for space ship interior_CS_USC.wav', 'subeng': GOLD + '45_Submarine_Effects/G45-24-Submarine Interior Engine Room.wav',
 'jet': GOLD + '08_09_10_11_Aircraft-Jets/G08-20-Constant Jet Noise.wav', 'jetrun': GOLD + '08_09_10_11_Aircraft-Jets/G09-19-Jet Engine Starts and Stops.wav',
 'hum': GOLD + '45_Submarine_Effects/G45-17-Hum in Conning Tower.wav', 'rumble': SSE + 'DESIGNED/RUMBLE/DSGNRmbl_Background ominous rumble; loopable_CS_USC.wav',
 'telem': SSE + 'COMMUNICATIONS/TELEMETRY/COMTelm_Intersteller radio interference_CS_USC.wav', 'shortwave': GOLD + '32_Electricity/G32-19-Short Wave Radio.wav',
 'static': SSE + 'COMMUNICATIONS/STATIC/COMStatic_Shortwave radio with electrical noises &_CS_USC.wav', 'beeps': GOLD + '32_Electricity/G32-18-Radio Beeps.wav',
 'click': SSE + 'MECHANICAL/CLICK/MECHClik_Metal clicks; several takes_CS_USC.wav', 'buzz': GOLD + '19_20_Bells_Buzzers/G20-36-Short Buzz.wav',
 'sonar': GOLD + '45_Submarine_Effects/G45-08-Sonar Blips.wav', 'klaxon': GOLD + '45_Submarine_Effects/G45-15-Hornlike Sub Alarm.wav',
 'hatch': GOLD + '45_Submarine_Effects/G45-30-Submarine Hatch Opening.wav', 'co2': SSE + 'AIR/BURST/AIRBrst_Carbon dioxide fire extinguisher_CS_USC.wav',
 'stop': RED + 'Sci-Fi/R20-48-Noise Slows to Full Stop.wav', 'horn': GOLD + '37_Horns/G37-08-Ship Horn.wav', 'gong': RED + 'Music/R05-02-Gong Hit.wav',
}
def raw(url):
    f = RAW + url.split('/')[-1].replace(' ', '_')
    if not os.path.exists(f): open(f, 'wb').write(urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(url, safe=':/'), headers={'User-Agent': 'curl/8'}), timeout=600).read())
    return f
def ff(src, flt, pcm=None):   # ffmpeg as the decoder and as the filter box: a file or float samples in, mono float samples out
    a = ['-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-'] if pcm is not None else ['-i', src]
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', *a, '-ac', '1', '-ar', str(SR), '-af', flt, '-f', 'f32le', '-'], input=None if pcm is None else pcm.astype(np.float32).tobytes(), capture_output=True, check=True).stdout, np.float32).copy()
MEM = {}
def src(k):
    if k not in MEM: MEM[k] = ff(raw(SRC[k]), 'highpass=f=28'); MEM[k] /= np.abs(MEM[k]).max()
    return MEM[k]
def fx(s, flt): return ff(None, flt, s)
def onset(k, t0=0, t1=None, rel=.25):   # where the first loud moment of a stretch begins, 3 ms early
    a = src(k)[int(t0 * SR):int(t1 * SR) if t1 else None]; w = int(SR * .005); e = np.sqrt(np.convolve(a * a, np.ones(w) / w, 'same'))
    return t0 + max(0, int(np.argmax(e > e.max() * rel)) / SR - .003)
def cut(k, at, secs, flt='', rate=1., to=None):   # secs of output from `at`, played at `rate` (gliding to `to`): faster is higher, slower is lower and heavier
    n = int(secs * SR); r = np.geomspace(rate, to or rate, n); p = int(at * SR) + np.concatenate(([0], np.cumsum(r)[:-1])); a = src(k)
    s = np.interp(p, np.arange(len(a)), a, right=0).astype(np.float32)
    return fx(s, flt)[:n] if flt else s
def shape(s, a=.002, hold=0., d=None, curve=2.):   # attack, hold, then a decay to nothing by the end
    n = len(s); t = np.arange(n) / SR; d = d or n / SR - hold
    return (s * np.clip(t / a, 0, 1) * np.clip(1 - (t - hold) / d, 0, 1) ** curve).astype(np.float32)
def swell(s, up, curve=1.5):   # rises to full over `up` seconds
    return (s * np.clip(np.arange(len(s)) / SR / up, 0, 1) ** curve).astype(np.float32)
def mix(secs, *layers):   # (samples, at seconds, gain)
    m = np.zeros(int(secs * SR), np.float32)
    for s, at, g in layers:
        i = int(at * SR); s = s[:len(m) - i]; m[i:i + len(s)] += s * g / max(1e-6, np.abs(s).max())
    return m
def drive(s, g):   # a soft limiter: the layers are pushed into each other the way a loud blast overloads a microphone
    s = s / np.abs(s).max(); return (np.tanh(s * g) / np.tanh(g)).astype(np.float32)
def loop(s, secs, x):   # the tail is faded into the head (equal power), so the end meets the start
    n, X = int(secs * SR), int(x * SR); s = s[:n + X].copy(); t = np.linspace(0, 1, X, dtype=np.float32)
    s[:X] = s[:X] * np.sqrt(t) + s[n:n + X] * np.sqrt(1 - t); return s[:n]
def held(k, at, secs, total, rate=1.):   # a steady stretch of a note, repeated with cross-fades until it is long enough to hold, then played at `rate`
    one = loop(cut(k, at, secs + .31), secs, .3); a = np.tile(one, int(total * rate / secs) + 2); n = int(total * SR)
    return np.interp(np.arange(n) * rate, np.arange(len(a)), a).astype(np.float32)
def save(name, s, kind='shot', peak=-1.5, tail=None):
    s = s.astype(np.float32).copy()
    if kind == 'shot':
        f = min(len(s), int(SR * (tail or min(.5, len(s) / SR * .3)))); s[-f:] *= np.linspace(1, 0, f, dtype=np.float32) ** 2; s[:64] *= np.linspace(0, 1, 64, dtype=np.float32)
    s *= 10 ** (peak / 20) / max(1e-6, np.abs(s).max())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', '96k' if kind == 'loop' else '112k', OUT + name + '.mp3'], input=s.tobytes(), check=True)
    print(name, round(len(s) / SR, 2), 's', os.path.getsize(OUT + name + '.mp3') // 1024, 'KB', flush=True)
for d in (RAW, OUT): os.makedirs(d, exist_ok=True)

# --- weapons: a real muzzle crack for the attack, an electric arc played down a falling pitch for the "energy", a cannon's low end for the weight
save('gun', drive(mix(.25, (shape(cut('rifle', onset('rifle'), .25, 'highpass=f=350')), 0, 1), (shape(cut('tesla', 3, .25, rate=1.5, to=.45), .004), 0, .55),
     (shape(cut('zap', onset('zap', 7, 7.3), .25, 'highpass=f=200', 1.6, .8)), 0, .5), (shape(cut('cannon', onset('cannon'), .2, 'lowpass=f=220')), 0, .7)), 1.6), tail=.08)
save('gun2', drive(mix(.27, (shape(cut('rifle', onset('rifle', 2, 2.3), .27, 'highpass=f=300', .88)), 0, 1), (shape(cut('sparks', onset('sparks'), .27, rate=1.1, to=.35), .004), 0, .6),
     (shape(cut('zap', onset('zap', 17.6, 17.9), .27, 'highpass=f=200', 1.4, .7)), 0, .5), (shape(cut('pistol', onset('pistol'), .22, 'lowpass=f=260', .8)), 0, .75)), 1.6), tail=.08)
save('cannon', drive(mix(.62, (shape(cut('at37', onset('at37', 7.7, 8.2), .62), curve=1.5), 0, 1), (shape(cut('zap', onset('zap'), .62, 'highpass=f=150', 1.25, .7), curve=1.5), 0, .6),
     (shape(cut('whip', onset('whip'), .2, rate=.8)), 0, .4), (shape(cut('naval', onset('naval'), .62, 'lowpass=f=180', 1.2), curve=1.2), 0, .9)), 2.2), tail=.2)
save('beam', drive(mix(1.25, (shape(cut('arcs', 2.2, 1.25, rate=1.15, to=.8), .004, .75, curve=1.5), 0, 1), (shape(cut('zap', onset('zap'), .5, 'highpass=f=120')), 0, .9),
     (shape(cut('sparks', onset('sparks', 2.7, 3.2), 1.25, rate=.9, to=.6), .02, .7), 0, .3), (shape(cut('coil', 10, 1.25, rate=.75, to=.5), .01, .8, curve=1.2), 0, .55),
     (shape(cut('thunder', onset('thunder'), 1.25, 'lowpass=f=160', 1.3), .003, .3, curve=1.5), 0, .7)), 1.8), tail=.35)
save('hit', drive(mix(.42, (shape(cut('metal', onset('metal', .4, 1), .42, rate=.8)), 0, 1), (shape(cut('x_gren', onset('x_gren'), .3, 'lowpass=f=900', 1.4)), 0, .55),
     (shape(cut('sparks', onset('sparks'), .2, rate=1.3)), 0, .25)), 1.5), tail=.15)
save('hit2', drive(mix(.42, (shape(cut('crash', onset('crash'), .42, rate=1.1)), 0, 1), (shape(cut('clank', onset('clank', .2, .6), .42, rate=.7)), .005, .6),
     (shape(cut('x_sharp', onset('x_sharp'), .3, 'lowpass=f=700', 1.5)), 0, .5)), 1.5), tail=.15)

# --- explosions: real blasts, the bigger ones slowed down and stacked, with torn steel for a ship coming apart
save('boom_s', drive(mix(1.2, (cut('x_sharp', onset('x_sharp'), 1.2, rate=1.1), 0, 1), (shape(cut('crash', onset('crash'), .7, rate=.9)), .03, .35), (shape(cut('sparks', onset('sparks'), .5)), .01, .15)), 1.6), tail=.5)
save('boom_m', drive(mix(2.05, (cut('x_heavy', onset('x_heavy'), 2.05), 0, 1), (shape(cut('x_gren', onset('x_gren'), 1.2, rate=.8)), .0, .6), (shape(cut('crash', onset('crash'), 1.1, rate=.6)), .06, .4),
     (shape(cut('girders', 30, 1.6, rate=.8), .2), .3, .22)), 1.8), tail=.8)
save('boom_l', drive(mix(3.6, (cut('x_good', onset('x_good'), 3.6, rate=.85), 0, 1), (cut('x_debris', onset('x_debris'), 3.6, rate=.7), .08, .8), (shape(cut('x_dyn', onset('x_dyn'), 2.5, rate=.75)), .9, .5),
     (shape(cut('girders', 34, 3.2, rate=.6), .5), .3, .3), (shape(cut('thunder', onset('thunder'), 3.6, rate=.7), .01), 0, .5)), 2.0), tail=1.4)
save('boom_xl', drive(mix(6.2, (cut('x_atom', onset('x_atom'), 6.2, rate=.9), 0, 1), (cut('x_dyn', onset('x_dyn'), 4, rate=.8), 0, .9), (shape(cut('zap', onset('zap'), 1.5, rate=.7)), 0, .5),
     (cut('x_debris', onset('x_debris'), 5, rate=.65), .55, .8), (shape(cut('x_good', onset('x_good'), 4, rate=.7)), 1.5, .8), (shape(cut('x_heavy', onset('x_heavy'), 2.5, rate=.75)), 2.3, .55),
     (shape(cut('x_huge', onset('x_huge'), 3.4, rate=.6), .01), 2.8, .8), (shape(cut('girders', 14, 5.4, rate=.5), .8, 2), .4, .4), (shape(cut('crash', onset('crash'), 1.4, rate=.45)), 1.1, .35),
     (shape(cut('thunder', onset('thunder'), 6.2, rate=.55), .02, 2), 0, .7)), 2.4), tail=2.4)
save('mine', drive(mix(1.5, (shape(cut('x_crisp', onset('x_crisp', 3, 3.5), 1.5, rate=1.15), curve=1.3), 0, 1), (shape(cut('x_gren', onset('x_gren'), .5, 'highpass=f=400', 1.3)), 0, .6), (shape(cut('whip', onset('whip'), .15)), 0, .35),
     (shape(cut('clank', onset('clank', .9, 1.3), .9, rate=1.2)), .02, .2)), 1.7), tail=.6)

# --- loops
save('engine', loop(mix(7.2, (cut('drone', 2, 7.2), 0, 1), (cut('subeng', 40, 7.2, 'lowpass=f=1800'), 0, .9), (cut('rumble', .2, 7.2, rate=.9), 0, .35)), 6, 1.2), 'loop', -2)
save('thrust', loop(mix(5, (cut('jetrun', 40, 5, 'lowpass=f=7000'), 0, 1), (cut('jet', 20, 5), 0, .7), (cut('co2', 2.0, 5, 'highpass=f=1500', .35), 0, .12)), 4, 1), 'loop', -2)
save('ambience', loop(mix(23, (cut('hum', 5, 23, 'lowpass=f=700', .7), 0, 1), (cut('drone', 1, 23, 'lowpass=f=140', .6), 0, .35), (cut('coil', 8, 23, rate=.5), 0, .2),
     (cut('telem', 4, 23, 'highpass=f=700,lowpass=f=3500,tremolo=f=0.11:d=0.7', .8), 0, .09), (cut('shortwave', 20, 23, 'highpass=f=500,lowpass=f=2400,tremolo=f=0.17:d=0.8', .9), 0, .07)), 20, 3), 'loop', -3)

# --- interface and events
save('ui_click', cut('click', onset('click', 2.2, 2.6), .1), tail=.05)
save('ui_deny', shape(cut('buzz', onset('buzz', 1.4, 2) + .04, .26, rate=.8), .004, .2, curve=1), tail=.04)
save('select', shape(cut('sonar', onset('sonar', 1, 1.6), .16, 'lowpass=f=4000', 1.25), .003, .02, curve=1.6), tail=.06)
save('order', mix(.36, (shape(cut('static', onset('static', 7.7, 8.2), .1, 'highpass=f=600'), .002, .07, curve=1), 0, .7), (shape(cut('sonar', onset('sonar', 8, 8.4), .14, rate=1.8), .003, .09, curve=1), .09, 1),
     (shape(cut('click', onset('click', 12.5, 13), .06), .001), .0, .5), (shape(cut('static', onset('static', 3, 3.4), .13, 'highpass=f=600'), .002, .05, curve=1.5), .23, .6)), tail=.05)
save('build', drive(mix(1.22, (shape(cut('hatch', onset('hatch', 2.4, 3), .45, rate=.85)), 0, 1), (shape(cut('click', onset('click', 2.2, 2.6), .1, rate=.6)), 0, .4),
     (shape(swell(cut('co2', onset('co2', 1.8, 2.2), 1.1, rate=1.5, to=.5), .3), .01, .3, curve=1.6), .12, .8), (shape(swell(cut('jet', 30, 1.1, 'highpass=f=150', 1.6, .7), .4), .01, .4, curve=1.5), .12, .55)), 1.4), tail=.4)
k = src('klaxon'); w = int(SR * .03); e = np.sqrt(np.convolve(k * k, np.ones(w) / w, 'same')); c = int(.7 * SR)   # the klaxon's own cycle: from one dip in its level to the dip two cycles on
d0 = int(1.3 * SR) + int(np.argmin(e[int(1.3 * SR):int(1.3 * SR) + c])); d2 = d0 + c + c // 2 + int(np.argmin(e[d0 + c + c // 2:d0 + 2 * c + c // 2]))
save('alarm', cut('klaxon', d0 / SR, 1.6, 'lowpass=f=3000', (d2 - d0) / SR / 1.6), tail=.06)   # played a little slow so two cycles fill 1.6 s
print('klaxon cycle', round((d2 - d0) / SR / 2, 3), 's')
save('capture', mix(1.22, (shape(swell(cut('coil', 6, 1.22, rate=.6, to=2.6), .8), .01, 1.0, curve=1), 0, 1), (shape(swell(cut('field', 10, 1.22, rate=.45, to=1.5), .9, 2), .01, 1.0, curve=1), 0, .7),
     (shape(swell(cut('tesla', 5, 1.22, rate=.5, to=1.2), 1.0, 2.5), .01, 1.05, curve=1), 0, .3), (shape(cut('click', onset('click', 12.5, 13), .12, rate=.7)), .98, .5)), tail=.16)
save('lost', mix(1.22, (shape(cut('coil', 6, 1.22, rate=2.2, to=.4), .004, .1, curve=1.3), 0, 1), (shape(cut('field', 10, 1.22, rate=1.4, to=.3), .004, .1, curve=1.6), 0, .7),
     (shape(cut('sparks', onset('sparks'), .3, rate=1.2, to=.6)), 0, .5), (shape(cut('stop', .2, 1.22, rate=1.3), .01, .2), 0, .6)), tail=.3)
# win and lose: one recorded ship's horn note, held and played at the speeds that make a chord (1 : 5/4 : 3/2 : 2 major, 1 : 6/5 : 3/2 minor), over a struck gong
H = lambda r, total: held('horn', 7.0, 2.6, total, r)
note = lambda r, at, up, total=3.1: swell(H(r, total - at), up)
save('win', mix(3.1, (note(1, 0, .5), 0, 1), (note(1.5, .45, .5), .45, .8), (note(2, .9, .5), .9, .75), (note(2.5, 1.35, .4), 1.35, .6), (note(3, 1.35, .6), 1.35, .3), (note(.5, 0, 1.2), 0, .6),
     (shape(cut('gong', onset('gong'), 1.7, rate=1.0), .003), 1.38, .9)), tail=.9)
fall = lambda r, g: (shape(fx(np.interp(np.cumsum(np.geomspace(1, .62, int(3.1 * SR))), np.arange(int(3.3 * SR)), H(r, 3.3)).astype(np.float32), 'lowpass=f=3000')[:int(3.1 * SR)], .15, .6, curve=1.2), 0, g)
save('lose', mix(3.1, fall(1, 1), fall(1.2, .8), fall(1.5, .7), fall(.5, .7), (shape(cut('gong', onset('gong'), 3.1, rate=.5), .003), 0, .8), (shape(cut('thunder', onset('thunder'), 3.1, rate=.6), .05), .1, .35)), tail=1.2)
print('total', sum(os.path.getsize(OUT + f) for f in os.listdir(OUT)) // 1024, 'KB')
