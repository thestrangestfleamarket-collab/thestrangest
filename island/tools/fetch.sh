#!/bin/bash
set -e
cd "$(dirname "$0")/.."
RAW=${RAW:-/tmp/island-raw}; GT=${GT:-npx --yes @gltf-transform/cli@4}
mkdir -p "$RAW" assets
api(){ curl -sS "https://api.polyhaven.com/files/$1"; }
for k in aerial_beach_01 damp_beach_sand palm_tree_bark reed_roof_04 bamboo_wall_02 weathered_planks; do
  api $k > "$RAW/$k.json"
  for m in $( [ $k = damp_beach_sand ] && echo diff || echo diff nor_gl arm ); do
    u=$(python3 -c "import json,sys;d=json.load(open('$RAW/$k.json'));k={'diff':'Diffuse','nor_gl':'nor_gl','arm':'arm'}['$m'];print(d[k]['1k']['jpg']['url'])")
    curl -sS "$u" -o "$RAW/${k}_$m.jpg"
    python3 -c "from PIL import Image;Image.open('$RAW/${k}_$m.jpg').convert('RGB').save('assets/${k}_$m.webp',quality=82)"
  done
done
for k in kloofendal_48d_partly_cloudy_puresky qwantani_sunset_puresky qwantani_moonrise_puresky; do
  api $k > "$RAW/$k.json"
  curl -sS "$(python3 -c "import json;print(json.load(open('$RAW/$k.json'))['hdri']['1k']['hdr']['url'])")" -o "assets/$k.hdr.wasm"
  curl -sS "$(python3 -c "import json;print(json.load(open('$RAW/$k.json'))['tonemapped']['url'])")" -o "$RAW/$k.jpg"
  python3 -c "from PIL import Image;Image.MAX_IMAGE_PIXELS=None;i=Image.open('$RAW/$k.jpg').convert('RGB');i.resize((4096,2048),Image.LANCZOS).save('assets/${k}_bg.webp',quality=86)"
done
model(){ k=$1; r=$2; t=$3
  api $k > "$RAW/$k.json"; mkdir -p "$RAW/$k"
  python3 - "$RAW/$k.json" "$RAW/$k" <<'P'
import json,sys,urllib.parse,subprocess,os
g=json.load(open(sys.argv[1]))['gltf']['1k']['gltf'];d=sys.argv[2]
subprocess.run(['curl','-sS',g['url'],'-o',os.path.join(d,'m.gltf')],check=True)
for p,v in g['include'].items():
    os.makedirs(os.path.join(d,os.path.dirname(p)),exist_ok=True)
    subprocess.run(['curl','-sS',v['url'],'-o',os.path.join(d,p)],check=True)
P
  $GT simplify "$RAW/$k/m.gltf" "$RAW/$k/s.glb" --ratio $r --error 0.002
  $GT resize "$RAW/$k/s.glb" "$RAW/$k/r.glb" --width $t --height $t
  $GT webp "$RAW/$k/r.glb" "assets/$k.glb.wasm" --quality 80
}
model namaqualand_boulder_05 0.06 1024
model rock_moss_set_01 0.35 1024
model fern_02 1 512
model shrub_02 0.6 512
model modular_wooden_pier 0.5 1024
model lambis_shell 0.4 256
model lifebuoy 0.5 512
model wooden_bucket_01 1 256
model fishermans_hat 0.5 256
model wicker_basket_01 0.5 256
curl -sS https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/textures/waternormals.jpg -o "$RAW/waternormals.jpg"
python3 -c "from PIL import Image;Image.open('$RAW/waternormals.jpg').convert('RGB').save('assets/waternormals.webp',quality=90)"
