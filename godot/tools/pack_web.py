#!/usr/bin/env python3
"""THE GODOT TEST FOR THE WEB: export it and make it fit an artifact (each file at most 15 MB; the engine's .wasm is 38 MB).
python3 godot/tools/pack_web.py   ->  dist/godot/ (index.html, index.js, index.wasmgz.wasm and index.pckgz.wasm: gzipped, named .wasm so an artifact serves them; the audio worklets)
The page (shell.html) unpacks the gzipped files in the browser as they stream in (DecompressionStream)."""
import gzip, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GD = os.path.join(ROOT, 'godot'); OUT = os.path.join(ROOT, 'dist', 'godot')
GODOT = os.environ.get('GODOT', 'godot')
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
subprocess.run([GODOT, '--headless', '--path', GD, '--import'], check=False)
r = subprocess.run([GODOT, '--headless', '--path', GD, '--export-release', 'Web', os.path.join(OUT, 'index.html')])
if r.returncode or not os.path.exists(os.path.join(OUT, 'index.wasm')): sys.exit('export failed')
for f in ('index.png',):   # (Godot's own splash picture for its page: never shown here)
    if os.path.exists(os.path.join(OUT, f)): os.remove(os.path.join(OUT, f))
for f in ('index.wasm', 'index.pck'):
    p = os.path.join(OUT, f)
    with open(p, 'rb') as a, gzip.open(p + 'gz.wasm', 'wb', compresslevel=9) as b: shutil.copyfileobj(a, b)
    os.remove(p)
for f in sorted(os.listdir(OUT)): print(f'{os.path.getsize(os.path.join(OUT, f)) / 1e6:8.2f} MB  {f}')
