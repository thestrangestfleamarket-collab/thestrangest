# fetches RAMEN's night things that exist as real CC0 models (Poly Haven): the katana, the woodcutter's axe, a barrel for the barricades: python3 tools/ramen-arms.py  ->  data/sushi/m/*.glb (through tools/sushi-assets.py's own model fetch); then the slim line it prints; credits in docs/sushi-credits.md
import json
src = open('tools/sushi-assets.py').read()
exec(src.split("for d in ('tex', 'm')")[0])   # its fetch and trim, not its list
ARMS = {'antique_katana_01': 512, 'wooden_axe': 512, 'wine_barrel_01': 256}
SLIMA = {'antique_katana_01': 2500, 'wooden_axe': 1200, 'wine_barrel_01': 900}
for s, z in ARMS.items(): model(s, z)
print("then: node tools/hide-slim.cjs data/sushi/m '" + json.dumps(SLIMA) + "'")
