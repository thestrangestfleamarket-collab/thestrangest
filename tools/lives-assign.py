# THE LIVES' DATA (owner, 3 Nov 2026: "they need to live their own lives. have homes. things they are doing. spots they hang out in. all needs to be logical"):
# writes data/lives.json, for every character with a job in data/characters.json: where they work and their hours (copied from the job), a home
# (data/world.json residences, the apartment house, or down the subway for those who come in from other sections), the habits they keep off the clock
# (by what they do) and a wage. Same input, same answer: run it again after adding characters or homes.
# Run: python3 tools/lives-assign.py
import json, hashlib
C=json.load(open('data/characters.json')); W=json.load(open('data/world.json'))
H=lambda s:int(hashlib.md5(s.encode()).hexdigest()[:8],16)
HABITS=[  # what someone does with their own time, by what they do for work (first match wins)
  (('PATROL','SERGEANT','GUARD','GATE'),['jog','eat','drink']),
  (('FIREFIGHTER','PARAMEDIC','AMBULANCE','RANGER'),['jog','fish','eat']),
  (('BARKEEP','WAITER','WAITRESS','SERVER','COOK','GRILL'),['fish','walk','gamble']),
  (('DOCTOR','SURGEON','NURSE','LAB TECH'),['read','walk','jog']),
  (('TELLER','CLERK','DESK','MANAGER','BOSS','COLLECTIONS','OWNER'),['gamble','drink','shop']),
  (('CURATOR','DOCENT','TOURS','USHER'),['read','pray','walk']),
  (('FISHES','HARBOUR','DIVES','BOAT'),['fish','drink','walk']),
  (('KITE','PICNIC','PLAYS','SKATES','RIDES','SWIMS','COACHES','WAVES','WATCHES'),['bfly','jog','gamble']),
  (('BAND','SINGS','PERFORMER','DANCER','HEADLINER','BUSKER','PAINTS'),['drink','gamble','walk']),
  (('GARDENER','GROUNDSKEEPER','FLOWER'),['bfly','pray','read']),
  (('STALL','SELLER','DEALER','TRADER','CART','TAMALES'),['shop','gamble','drink']),
  (('MECHANIC','REPAIRS','ENGINEER','TRACK','STREET WORKS','YARD','FREIGHT','DRIVES','SIGNALS','PORTER','CREW'),['drink','fish','gamble']),
  (('STROLLS','WALKS','VISITOR','REGULAR'),['walk','shop','read'])]
POOL=['walk','read','shop','fish','bfly','jog','drink','gamble','pray']
WAGE={'DOCTOR':40,'SURGEON':45,'BOSS':35,'MANAGER':30,'OWNER':30,'SERGEANT':28,'ENGINEER':26,'FIREFIGHTER':25,'NURSE':24}
def habits(key,title):
    hs=habits0(key,title)
    return hs[:2]+['movies'] if H(key+'movies')%6==0 else hs   # one in six go to the movies (the theatre has its recliners, 4 Nov 2026)
def habits0(key,title):
    for ks,hs in HABITS:
        if any(k in title for k in ks): return hs
    h=H(key); return [POOL[h%9],POOL[(h>>5)%9],POOL[(h>>11)%9]]
beds={r['id']:r['beds'] for r in W['residences']}; beds['house']=30; ALL=dict(beds)
NEAR={'park':['porch_log_cabin','haunted_victorian_house'],'castle':['haunted_victorian_house','porch_log_cabin'],'lake':['porch_log_cabin'],
  'hudson':['corner_shophouse','two_storey_shophouse','three_storey_shophouse','wide_shophouse','motel_room_run'],'diner':['wide_shophouse','motel_room_run']}
ONLY={'haunted_victorian_house','porch_log_cabin'}   # (only for those who work near them)
out={}
for key in sorted(C):
    c=C[key]; j=c.get('job')
    if not j: continue
    t=j.get('title','')
    out[key]={'at':j['at'],'hours':j['hours'],'title':t,'habits':habits(key,t),'wage':next((v for k,v in WAGE.items() if k in t),12+H(key)%9)}
    if j.get('home')=='subway': out[key]['home']='subway'
# homes: in order of the key's hash; the apartment house for those it already had, a home by their work if there is one (the park's cabin, the river's shophouses), else the emptiest
for key in sorted(out,key=H):
    if out[key].get('home'): continue
    if C[key]['job'].get('home')=='house' and beds['house']>0: out[key]['home']='house'; beds['house']-=1; continue
    pref=[b for b in NEAR.get(out[key]['at'],[]) if beds[b]>0]
    k=pref[0] if pref else max((b for b in beds if b not in ONLY),key=lambda b:(beds[b]/ALL[b],-H(key+b)))
    assert beds[k]>0,'not enough beds'
    out[key]['home']=k; beds[k]-=1
json.dump(out,open('data/lives.json','w'),separators=(',',':'))
import collections; print(len(out),'lives;',dict(collections.Counter(v['home'] for v in out.values()))); print('beds left',beds)
