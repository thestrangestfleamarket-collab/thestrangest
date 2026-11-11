# THE PARK'S POLYFORK THINGS (owner, 7 Nov 2026: "add all of them into central park"): polyfork.dev's benches, lamps, railings, bridges, gates,
# fountains, statues, shelters, boats, playground, kiosks and small things, fetched into .polyfork/ (git-ignored, never committed) and baked by
# polyfork-bake.py (props: int16 points, colours, indices, in metres) into data/parkpf.json; placed where data/world.json's things say (k 'p:<key>'), drawn by 111fe-parkpf.js.
# Run: python3 tools/park-pf-bake.py
import sys, os, time, subprocess, urllib.request
PARK={'parkbench':'park-bench-dc8b62','ironbench':'cast-iron-plaza-bench-b4096d','campusbench':'campus-bench-0d6036',
  'logbench':'split-log-bench-289780','b2bbench':'back-to-back-promenade-8c153b','amphi':'amphitheatre-bench-row-d72422',
  'globelamp':'globe-lamp-346cb6','jlamp':'street-lamp-29f365','colonial':'colonial-lamp-post-eb85f8','campuslamp':'campus-lamp-post-579291',
  'sealamp':'seafront-lamp-post-28bada','stringlights':'string-light-run-01ba14','bowtop':'bow-top-park-railing-6b4cce',
  'arearail':'area-railing-a771da','campusrail':'campus-railing-run-2ceb3e','ironfence':'iron-cemetery-fence-run-cb78a9',
  'picket':'picket-fence-run-9310c1','archbridge':'arched-foot-bridge-0da34f','creekbridge':'creek-footbridge-d35cf7',
  'woodbridge':'wooden-bridge-9d2308','logbridge':'log-plank-bridge-a5f74f','trestle':'timber-trestle-bridge-c3cd88',
  'maingate':'main-gate-arch-with-738ddb','welcomearch':'town-welcome-arch-d2af7d','yardgate':'yard-fence-gate-bay-eb6a30',
  'torii':'torii-gate-402f30','plazafountain':'plaza-fountain-5a5f6e','campusfountain':'campus-plaza-fountain-a0cab1',
  'drink':'park-drinking-fountain-b1c25b','birdbath':'garden-birdbath-9671de','founder':'founder-s-statue-71c269',
  'lion':'guardian-lion-statue-5bde18','picnicshelter':'park-picnic-shelter-9548a3','promshelter':'promenade-shelter-788f46',
  'boatshed':'boat-shed-74c94f','dock':'lake-dock-run-f5380e','launch':'boat-launch-ramp-dbde11','raft':'swim-raft-6aefb5',
  'canoe':'camp-canoe-c65d2a','kayak':'lake-kayak-930d0b','skiff':'lake-rowing-skiff-4916e7','lifebuoy':'lifebuoy-on-a-post-57421b',
  'slide':'playground-slide-8b764c','swings':'backyard-swing-set-38637e','teeter':'teeter-totter-ee9c62','roundabout':'playground-roundabout-e4d43b',
  'spring':'spring-rider-c8b8d8','sandbox':'sandbox-224517','icecream':'ice-cream-kiosk-on-40a568','hotdog':'hot-dog-cart-115192',
  'newsstand':'newsstand-6dfd65','refresh':'refreshment-kiosk-406f65','coffee':'campus-coffee-kiosk-ec2395',
  'seatoilet':'seafront-toilet-block-c3f643','toilet':'toilet-block-da51a4','basket':'wire-trash-basket-269c1c','trashcan':'metal-trash-can-f57043',
  'bikerack':'bike-rack-a1e7c3','trailhead':'trailhead-sign-aa29e1','trailmap':'trail-map-kiosk-be8618','wayfind':'seafront-wayfinding-post-67fc84',
  'library':'little-free-library-post-755dd2','birdhouse':'birdhouse-post-66d6c1','beehive':'beehive-2e70bf','hammock':'hammock-on-posts-7d5c47',
  'picnictable':'heavy-timber-picnic-table-1ac060','planter':'flower-planter-550bfb','planterbox':'campus-planter-box-10970a',
  'bollard':'sidewalk-bollard-c2567e','sphere':'concrete-sphere-bollard-d99a57','conservatory':'glass-conservatory-a938d5',
  'greenhouse':'greenhouse-53ab6d','koi':'japanese-koi-pond-78d204','zen':'zen-sand-garden-79a828','lookout':'splay-leg-lookout-tower-6fae7e',
  'bunting':'bunting-run-2ac207','redbarn':'red-barn-d41683','duck':'duck-base','pigeon':'pigeon-base','horse':'horse-base'}
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
out='data/parkpf.json'
if os.path.exists(out): os.remove(out)
KEEP={'parkbench','trashcan','picnictable','jlamp','drink','archbridge','creekbridge','woodbridge','logbridge','trestle','canoe','kayak','skiff','zen','greenhouse','torii','duck','pigeon','redbarn','picket'}   # (owner, 7 Nov 2026: "remove all the assets except for: park bench, duck, campusrail, trashcan, picnic table, j lamp, drink, bridges, boats, zen, greenhouse, torii - and animals")
PARK={k:v for k,v in PARK.items() if k in KEEP}
L=os.path.join(C,'park.list'); open(L,'w').write(''.join(k+' '+get(i)+'\n' for k,i in PARK.items()))
subprocess.run([sys.executable,'tools/polyfork-bake.py','props',L,'-'],check=True,env={**os.environ,'OUT':out})
