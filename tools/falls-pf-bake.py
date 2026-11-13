# THE FALLS' POLYFORK THINGS (owner, 10 Nov 2026: "use polyfork assets for base, then decorate intricate design, msos, rocks, textures"):
# polyfork.dev's rocks, cliff ledges, basalt, moss, ferns, logs, reeds, lilies, lanterns, cairns and the rope bridge, fetched into .polyfork/ (git-ignored) and baked by
# polyfork-bake.py (props, in metres) into data/fallspf.json; placed by src/089b-falls.js.
# Run: TRIS=250 python3 tools/falls-pf-bake.py   (each model simplified to 250 triangles; needs pip fast-simplification scipy)
import sys, os, time, subprocess, urllib.request
FALLS={'boulder':'large-boulder-a29b99','basalt':'basalt-boulder-a1929c','lboulder':'landscape-boulder-526f7f','outcrop':'rock-outcrop-158ac3',
  'columns':'basalt-column-outcrop-f1339d','cavewall':'ruined-lair-wall-176561','fernboulder':'fern-covered-boulder-2e0375','cluster':'boulder-field-cluster-08e364',
  'medrock':'medium-rock-e08405','smallrock':'small-rock-db33a7','mosscush':'moss-cushion-2eabef','mosspatch':'moss-patch-3ecaf4','clubmoss':'club-moss-mat-edcb1b',
  'mossstump':'moss-covered-stump-7253ab','mosssteps':'mossy-stone-steps-1beb4d','fallenlog':'fallen-log-1685fb','hollowlog':'hollow-log-329fd7','fungilog':'bracket-fungus-log-2deef4',
  'fernclump':'fern-clump-90ff4b','treefern':'tree-fern-78320e','fern':'fern-plant-1559b8','vine':'hanging-vine-run-4184f3','mush':'mushroom-cluster-18dc1d',
  'glowmush':'glowing-bonnet-mushroom-13f518','cattail':'cattail-reed-6abbb3','reeds':'reed-bed-bbbefb','lilies':'lily-pad-cluster-457382','pebbles':'lake-pebbles-6c0359',
  'lantern':'stone-lantern-d56d0a','roots':'exposed-tree-roots-e1409c','cairn':'stone-cairn-a9bf48','ropebridge':'rope-bridge-span-159f8c'}
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
out='data/fallspf.json'
if os.path.exists(out): os.remove(out)
WHOLE={'ropebridge','lantern','mosssteps','cairn','smallrock'}   # the made things (and the cairns' stones) kept whole; the rocks and plants simplified to TRIS
import json; D={}
for part,keep in (('whole',True),('simple',False)):
    L=os.path.join(C,'falls-'+part+'.list'); open(L,'w').write(''.join(k+' '+get(i)+'\n' for k,i in FALLS.items() if (k in WHOLE)==keep)); tmp=out+'.'+part
    env={**os.environ,'OUT':tmp}
    if keep: env.pop('TRIS',None)
    subprocess.run([sys.executable,'tools/polyfork-bake.py','props',L,'-'],check=True,env=env); D.update(json.load(open(tmp))); os.remove(tmp)
open(out,'w').write(json.dumps(D,separators=(',',':'))); print(out,os.path.getsize(out),'bytes')
