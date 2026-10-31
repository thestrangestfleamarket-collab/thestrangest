# BRIGHTER BROWN FOR THE BEAR MERCHANT (owner, 30 Oct 2026: "more brighter brown like a cartoon bear"): the coat bear baked grey
# (bear-bake.py from the owner's Meshy model, whose source .npy is not in the repo), so his fur, jacket, pants, paws and feet are
# recoloured in place to a warm cartoon brown by shifting every grey/brown face onto a brown ramp at its own brightness (boosted a little),
# leaving the blue shirt and bow, the cream muzzle and stripes, and the black eyes and nose. Run once against the grey coatbear in data/toons-glb.json:
#   python3 tools/bear-brown.py
import json, base64, numpy as np
PATH='data/toons-glb.json'
d=json.load(open(PATH)); cb=d['chars']['coatbear']
C=np.frombuffer(base64.b64decode(cb['c']),dtype=np.uint8).reshape(-1,3).astype(np.float64)
r,g,b=C[:,0],C[:,1],C[:,2]; lum=0.299*r+0.587*g+0.114*b
blue=(b>r+8)&(b>g)                   # the blue shirt and bow
dark=lum<42                          # the eyes, nose and dark outline
cream=(lum>198)&(b>=r*0.80)&(~blue)  # the cream muzzle and shirt stripes
keep=blue|dark|cream
brown=np.clip((np.clip(lum*1.35,0,255))[:,None]*np.array([1.0,0.63,0.37])[None,:],0,255)
out=C.copy(); out[~keep]=brown[~keep]
cb['c']=base64.b64encode(out.round().astype(np.uint8).reshape(-1).tobytes()).decode()
json.dump(d,open(PATH,'w'))
print('bear recoloured:',(~keep).sum(),'of',len(C),'faces browned; kept blue',int(blue.sum()),'dark',int(dark.sum()),'cream',int(cream.sum()))
