# THE FISH TANK'S POLYFORK DECOR (owner, 12 Nov 2026: "use polyfork assets as small things you can add in the tank + coral reefs, rocks, skull with moss ... small treasure chest"):
# polyfork.dev's corals, reef rocks, arches, a clam, an anemone, a skull, chests, coins, an anchor and the rest, fetched into .polyfork/ (git-ignored) and baked by
# polyfork-bake.py (props, in metres) into data/tankpf.json; shown by src/150k-fishtank.js.
# Run: TRIS=260 python3 tools/tank-pf-bake.py   (each model simplified to 260 triangles; needs pip fast-simplification scipy)
import sys, os, time, json, subprocess, urllib.request
TANK={'staghorn':'staghorn-coral-422d23','brain':'open-brain-coral-50344c','pillar':'pillar-coral-b6deba','table':'table-coral-193fa6','toadstool':'toadstool-coral-d9db0b',
  'softtree':'soft-coral-tree-450af0','torch':'torch-coral-ba58c2','seafan':'gorgonian-sea-fan-aa3c45','tubesponge':'tube-sponge-df576b','barrelsponge':'barrel-sponge-ab460c',
  'clam':'maxima-clam-429c17','anemone':'bubble-tip-anemone-eab5d3','starfish':'blue-linckia-starfish-e07dd3','urchin':'tuxedo-sea-urchin-428a09','seagrass':'tank-seagrass-tuft-d0cbe6',
  'rockarch':'aquascape-rock-arch-48bf5e','reefarch':'reef-swim-through-arch-648930','liverock':'live-rock-piece-6c7bdf','reefboulder':'encrusted-reef-boulder-972d95','bommie':'rock-bommie-column-0f8a9b',
  'lavarock':'volcanic-boulder-cluster-7e29ea','skull':'skull-and-bone-scatter-3dea4c','dragonskull':'ancient-dragon-skull-7be378','pfchest':'treasure-chest-c2ac4f','hoard':'overflowing-treasure-chest-3d6ee0',
  'coins':'spilled-coin-pile-caccf6','anchor':'ship-anchor-c2b4f1','wheel':'ship-s-wheel-7e7426','amphora':'clay-amphora-098d94','column':'broken-stone-column-c91287','moai':'fallen-moai-800fbb',
  'wreck':'wrecked-hull-section-ca6755','barrel':'oak-barrel-b65311'}
C='.polyfork'; os.makedirs(C,exist_ok=True)
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'bake/1.0'})
        for k in range(5):
            try: open(f+'.part','wb').write(urllib.request.urlopen(r).read()); os.replace(f+'.part',f); break
            except Exception as e:
                if k==4: raise
                time.sleep(2**k*2)
        time.sleep(.3)
    return f
out='data/tankpf.json'
if os.path.exists(out): os.remove(out)
L=os.path.join(C,'tank.list'); open(L,'w').write(''.join(k+' '+get(i)+'\n' for k,i in TANK.items()))
subprocess.run([sys.executable,'tools/polyfork-bake.py','props',L,'-'],check=True,env={**os.environ,'OUT':out})
print(out,os.path.getsize(out),'bytes'); D=json.load(open(out)); print({k:(v['tris'],[round(s,2) for s in v['size']]) for k,v in D.items()})
