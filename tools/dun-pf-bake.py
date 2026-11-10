# THE DUNGEON'S POLYFORK THINGS (owner, 8 Nov 2026: "use polyfork assets where you can, dont just put them randomly in spots, make the relative sizes, logicaly atmospheric"):
# polyfork.dev's cave pieces, fetched into .polyfork/ (git-ignored) and baked by polyfork-bake.py (props, in metres) into data/dunpf.json; placed by src/062c-dunterrain.js where the cave would put them.
# Run: TRIS=220 python3 tools/dun-pf-bake.py   (each model simplified to 220 triangles; needs pip fast-simplification scipy)
import sys, os, time, subprocess, urllib.request
DUN={'stalactites':'stalactite-cluster-6cca9a','stalagmite':'lair-stalagmite-7d4d95','crystalcol':'lair-crystal-column-877d1a','rubble':'collapse-rubble-mound-4fbfed',
  'scree':'scree-heap-42cce5','masonry':'masonry-rubble-chunk-c4da0b','ashlar':'fallen-ashlar-block-87824e','moss':'moss-patch-3ecaf4','mosscushion':'moss-cushion-2eabef',
  'clubmoss':'club-moss-mat-edcb1b','glowcap':'glowing-bonnet-mushroom-13f518','mushrooms':'mushroom-cluster-18dc1d','giantshrooms':'giant-mushroom-cluster-868de6',
  'roots':'root-intrusion-9f1eaa','cobweb':'cobweb-drape-f65d43','column':'broken-stone-column-c91287','pool':'standing-water-pool-daafcb','pipe':'pipe-run-280a0d',
  'pipejoint':'pipe-junction-5b146a','grate':'drain-grate-tile-5568d9','rails':'mine-rail-track-9532dd','cart':'mine-cart-21d7f0','railstack':'spare-rail-stack-99d443',
  'bones':'skull-and-bone-scatter-3dea4c','bonescatter':'bone-scatter-90313d','crystals':'crystal-cluster-624138','rock':'medium-rock-e08405','smallrock':'small-rock-457be8',
  'boulder':'large-boulder-a29b99','ledge':'rock-cave-ledge-2a9532','lantern':'miner-lantern-c13511','pickaxe':'mining-pickaxe-90bdf6'}
C='.polyfork'; os.makedirs(C,exist_ok=True)
def get(i):
    f=os.path.join(C,i+'.glb')
    if not os.path.exists(f):
        r=urllib.request.Request('https://polyfork.dev/cdn/'+i+'.glb',headers={'User-Agent':'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)'})
        for k in range(5):
            try: open(f+'.part','wb').write(urllib.request.urlopen(r).read()); os.replace(f+'.part',f); break
            except Exception as e:
                if k==4: raise
                time.sleep(2**k*2)
        time.sleep(.3)
    return f
out='data/dunpf.json'
if os.path.exists(out): os.remove(out)
L=os.path.join(C,'dun.list'); open(L,'w').write(''.join(k+' '+get(i)+'\n' for k,i in DUN.items()))
subprocess.run([sys.executable,'tools/polyfork-bake.py','props',L,'-'],check=True,env={**os.environ,'OUT':out})
