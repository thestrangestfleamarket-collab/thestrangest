# The car radio's stations: recordings from the Library of Congress National Jukebox (archive.org's loc-jukebox items, each marked public
# domain there; US recordings before 1926 are public domain), levelled and joined into one mono mp3 a station (data/radio/<id>.mp3), with
# data/radio.json listing each station's tracks (start, length, title, artist, year, source).   python3 tools/radio-bake.py  (needs ffmpeg)
import json, os, subprocess, sys, time, urllib.parse, urllib.request
STATIONS = [
 ('jazz', 'WJAZ', 'DIXIELAND', [186254, 28219, 185939, 185944, 185940, 40212, 39384, 669812, 670424]),
 ('dance', 'WRTZ', 'ROARING TWENTIES', [39498, 71182, 50556, 36395, 34022, 63051, 40546, 670935]),
 ('rag', 'KRAG', 'RAGTIME', [127251, 126829, 260316, 129052, 656699, 658715, 10836, 128575, 657609]),
 ('opera', 'WOPR', 'OPERA', [126158, 296220, 128044, 122533, 21582, 121374, 134890])]
GAP, KBPS = 2.0, '32k'
def get(u, binary=False):
    for i in range(5):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'TSFM-radio-bake/1.0'}), timeout=300)
            return r.read() if binary else json.load(r)
        except Exception as e: err = e; time.sleep(3 + 5 * i)
    sys.exit('could not fetch ' + u + ': ' + str(err))
def item(n):
    q = urllib.parse.urlencode([('q', 'identifier:loc-jukebox-%d-*' % n), ('fl[]', 'identifier'), ('rows', 1), ('output', 'json')])
    ident = get('https://archive.org/advancedsearch.php?' + q)['response']['docs'][0]['identifier']
    d = get('https://archive.org/metadata/' + ident); m = d['metadata']
    if 'publicdomain' not in str(m.get('licenseurl', '')): sys.exit(ident + ': not marked public domain')
    yr = int(str(m.get('date', '0'))[:4]);
    if not 1890 < yr < 1926: sys.exit(ident + ': ' + str(yr))
    mp3 = [f['name'] for f in d['files'] if f['name'].lower().endswith('.mp3')]
    if not mp3: sys.exit(ident + ': no mp3')
    c = m.get('creator', ''); c = c if isinstance(c, list) else [x.strip() for x in c.split(';')]
    return ident, sorted(mp3, key=len)[0], m.get('title', ident), c, yr
src, tmp = '/tmp/radio-src', '/tmp/radio-tmp'
os.makedirs(src, exist_ok=True); os.makedirs(tmp, exist_ok=True); os.makedirs('data/radio', exist_ok=True)
out = {'note': 'Library of Congress National Jukebox recordings (public domain), via archive.org; tools/radio-bake.py', 'stations': []}
for sid, call, name, ids in STATIONS:
    parts, tracks, t = [], [], 0.0
    for i, n in enumerate(ids):
        ident, f, title, by, yr = item(n)
        raw = os.path.join(src, ident + '.mp3')
        if not os.path.exists(raw): open(raw, 'wb').write(get('https://archive.org/download/' + ident + '/' + urllib.parse.quote(f), True))
        wav = os.path.join(tmp, sid + str(i) + '.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-ac', '1', '-ar', '22050', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-17:TP=-2:LRA=11,apad=pad_dur=%g' % GAP, wav], check=True)
        d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True, check=True).stdout)
        tracks.append({'at': round(t, 2), 'len': round(d - GAP, 2), 'title': title, 'by': by[:4], 'year': yr, 'source': 'https://archive.org/details/' + ident})
        parts.append(wav); t += d; print(sid, yr, title, round(d), 's', flush=True)
    lst = os.path.join(tmp, sid + '.txt'); open(lst, 'w').write(''.join("file '%s'\n" % p for p in parts))
    mp = 'data/radio/' + sid + '.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-ac', '1', '-ar', '22050', '-codec:a', 'libmp3lame', '-b:a', KBPS, mp], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp], capture_output=True, text=True, check=True).stdout)
    out['stations'].append({'id': sid, 'call': call, 'name': name, 'len': round(d, 2), 'tracks': tracks})
json.dump(out, open('data/radio.json', 'w'), indent=1, ensure_ascii=False)
print({s['id']: (round(s['len'] / 60, 1), os.path.getsize('data/radio/' + s['id'] + '.mp3') // 1024) for s in out['stations']})
