# THE DRIVE MODELS' PLACES (owner, 3 Nov 2026: "figure out a place for everything"): writes data/garden.json, the placed props
# (src/152a-landscape.js), from map tiles here. Keeps any placement whose model is not one of the Drive's (pf_).
# Run: python3 tools/pf-places.py
import json, math
X=lambda t:-81.36+1.13*t; Z=lambda t:87.01+1.13*t   # map tiles to the world (SHARED.BOD.XS / ZS)
PI=math.pi; N,E,S,W=0,PI/2,PI,-PI/2   # which way a model's front (+Z) looks
T=lambda m:m/.84   # metres to tiles
size={k:v['size'] for k,v in json.load(open('data/full/pfprops.json')).items()}
P=[]
def put(k,tx,ty,rot=0,s=1,solid=True):
    assert 'pf_'+k in size,k; o={'k':'pf_'+k,'x':round(X(tx),3),'z':round(Z(ty),3),'y':0,'s':s,'rot':round(rot,4)}
    if not solid: o['solid']=False
    P.append(o)
def row(items,x0,front,gap=3,face=N):
    # a row of buildings along x, fronts on map row `front`, looking `face` (N: toward the river from the far bank)
    x=x0
    for k in items:
        w,_,d=size['pf_'+k]; put(k,x+T(w)/2,front-T(d)/2 if face==N else front+T(d)/2,face); x+=T(w)+gap
    return x
# the city's buildings stand on the block (owner, 3 Nov 2026: "put them down further market st and open it up", "along side the hudson ... towards fishing pier"),
# in the gaps the garages and lots kept (data/world.json block.pf holds the spans they take, so src/069a-block.js leaves them free)
B=json.load(open('data/world.json'))['block']; FR,BK,R2=B['front'],B['back'],B['backrow']; SPANS={'1':[],'2':[]}
def strip(items,x0,x1,front,face,rowid,gap):
    n0=len(P); x=row(items,x0,front,gap=gap,face=face); assert x-gap<=x1+.01,(items,x,x1)
    for o in P[n0:]:
        w=T(size[o['k']][0]); cx=(o['x']+81.36)/1.13; SPANS[rowid].append([round(cx-w/2-.3,2),round(cx+w/2+.3,2)]); assert T(size[o['k']][2])<=(FR-BK if rowid=='1' else R2[1]-R2[0])+.4,o['k']
# Market St's east end, either side of the diner (between the Scanner and the flea market), fronts on the street; the fire station by the bank;
# the corner shop, church, school, hall and garage at its west end
strip(['corner_tenement','brownstone_row_house','narrow_walk_up','office_tower'],153.5,193.1,FR,N,'1',1.2); strip(['cast_iron_loft'],201.7,216.4,FR,N,'1',0)
strip(['fire_station'],82.75,92.4,FR,N,'1',0); strip(['corner_shop','brick_church','public_school','village_hall','parking_garage'],-71.6,9.7,FR,N,'1',.7)
# the Hudson row round the fishing pier (x 61), facing the river: the diner at the pier's foot
strip(['auto_repair_garage','motel_office','motel_room_run','corner_shophouse','two_storey_shophouse','street_diner','three_storey_shophouse','wide_shophouse','convenience_store','small_shrine_hall','one_storey_shop_row'],-4.5,110.8,R2[0],S,'2',.5)
put('subway_entrance',40,74,N); put('escalator_flight',47,70,E)
x=-10
for i,k in enumerate(['fire_engine','vintage_hearse','patrol_cruiser','security_patrol_cruiser','stretch_limousine','compact_hatchback','wheeled_city_coupe','team_minibus',
      'campus_shuttle_bus','pop_top_camper_van','camper_trailer','food_truck','semi_tractor','box_trailer','commuter_hover_pod']):
    l=size['pf_'+k][2]
    if i==8: x=-10
    if 36<x+T(l)/2<50: x=51
    put(k,x+T(l)/2,81.5 if i<8 else 88.5,E if i<8 else W); x+=T(l)+3
put('roadside_billboard',106,84,W)
# a pool south of the reservoir; the lighthouse on the lake's east shore
put('kidney_pool',166,76,S,solid=False); put('old_lighthouse',165,12,W)
# a rail yard on the lawn west of the reservoir, its stock on three sidings, a footbridge over them, a bookstall; the viaduct's arches carry the brook
for y,x,ks in [(142,124,['mainline_diesel_locomotive']),(153,122,['passenger_carriage']),(164,122,['railbus','tender_steam_locomotive']),(171,124,['guideway_rail_shuttle'])]:
    for k in ks: l=size['pf_'+k][2]; put(k,x+T(l)/2,y,E); x+=T(l)+1.5
put('station_footbridge',144,148,E); put('platform_bookstall',141,171,N); put('stone_viaduct_span',140,36,E); put('stone_viaduct_span',140+T(size['pf_stone_viaduct_span'][2]),36,E)
# the planes, a display on the west meadow south of the cross path
put('heavy_bomber',18,43,E); put('single_engine_fighter',40,44,E)
# the river: a liner moored mid-stream, a fishing boat by the pier, an old wreck in the shallows
put('capital_cruiser',170,-146,E,solid=False); put('hanga_roa_fishing_boat',-4,-127,E,solid=False); put('wooden_wreck_stern_section',118,-160,W+.4,solid=False)
# the riverside walk: vendors, a pay phone, games
put('pay_phone_booth',22,-111.5,S); put('elote_cart',40,-113,S); put('food_truck',72,-114,E); put('taca_taca',54,-113,S); put('arcade_console',58,-110.6,S)
put('diner_booth',88,-113,E); put('freestyle_bmx',30,-111.2,E,solid=False); put('doorman_canopy',100,-109.2,S,solid=False); put('zen_sand_garden',150,-114,S); put('japanese_koi_pond',162,-114,S,solid=False)
# Central Park: a graveyard on the west side, the haunted house above it
put('haunted_victorian_house',2,166,S); put('family_mausoleum',14,150,S); put('arched_cemetery_gate',2,138,S)
for i in range(-3,4):
    if i: put('wrought_iron_cemetery_fence',2+i*T(4),138,S)
for tx in (-6,10): put('cemetery_lantern_post',tx,141,S)
put('twisted_dead_oak',-12,156,E); put('twisted_dead_oak',20,160,W)
# a cabin in the woods; a boardwalk at the lake; a skiff on it
put('porch_log_cabin',40,150,S)
for i in range(4): put('wetland_boardwalk_run',161+i*T(2),2,E,solid=False)
put('lake_rowing_skiff',148,12,E+.5,solid=False)
# an Easter Island corner by the east tower: moai, the stone houses, a garden of taro, the boat-shaped house
for i,tx in enumerate([230,236,242,248]): put('moai_kavakava',tx,44,S,s=9)
put('orongo_house_run',236,34,S); put('hare_paenga_boat_house',236,24,S); put('taheta_stone_basin',246,30,S,solid=False); put('mata_a_obsidian_blade',246,30.4,S,s=2,solid=False)
for tx,ty in [(226,30),(228,26),(250,26)]: put('taro_plant',tx,ty,S,solid=False)
# the castle's treasure, in its courtyard (clear of the stair): the dragon's pillars and egg, the looted throne, the harp, a naginata, a chest with its key and lock, a hoard
put('coiled_dragon_pillar',35.5,127.5,N); put('coiled_dragon_pillar',46,127.5,N); put('ember_dragon_egg',41,125,N,s=2)
put('looted_gilded_throne',38,117,S); put('gilded_harp',35,117,S); put('samurai_naginata',33,120,S,solid=False)
put('common_chest',37.5,122,S); put('chest_key',38.3,121,S,solid=False); put('chest_padlock',36.6,121,S,solid=False); put('coin_hoard_heap',34,123,S,solid=False)
# the bandstand's guitar
put('guitar',113,58,S,solid=False)
# by the cave: the fungus that glows, coal and emerald in the rock
put('miasma_bladder_fungus',214,16,S); put('coal_seam_deposit',222,16,S); put('emerald_ore_deposit',224,9,S); put('coal_lump',220,14,S,solid=False)
# a bug's-eye garden among the park's bugs: the Drive's giant flowers, seeds and nests, at giant size
for k,tx,ty,h in [('dandelion',84,40,4),('common_daisy',90,44,3),('dandelion_seed',87,37,.8),('orb_web',95,40,3),('wasp_paper_nest',99,46,1.6),('ant_nest_entrance_mound',92,34,2),
                  ('wild_honeycomb_panel',80,46,1.4),('swallowtail_chrysalis',97,36,.8),('sycamore_seed',86,48,.7),('fallen_blackberry',82,36,.6),('dragonsbane_thistle',94,49,1.2)]:
    put(k,tx,ty,S,s=round(h/size['pf_'+k][1],4),solid=False)
put('wall_vine_curtain',-23.2,60,E,solid=False)
# the second batch (owner added it to the folder, 3 Nov 2026)
def at(k):
    o=next(o for o in P if o['k']=='pf_'+k); w,_,d=size['pf_'+k]; return (o['x']+81.36)/1.13,(o['z']-87.01)/1.13,T(w),T(d)
put('promenade_bandstand',245,8,S)
# the riverside walk: an ice cream kiosk; a pier head off the pier
put('ice_cream_kiosk_on',120,-113,S); put('pier_head_platform',8,-121,S,solid=False)
# the zoo's way in, on its north side: the gate, the ticket booth, the turnstiles
put('main_entrance_gate',4,103,S,solid=False); put('ticket_booth',-6,103,S); put('turnstile_bank',13,103,S)
# by the planes: a press box and a helipad
put('press_box',50,36,N); put('rooftop_helipad_deck',-12,28,S,solid=False)
# the castle's moat bridge at its north gate
put('moat_bridge',39,106.5,E,solid=False)
# the buildings' doors: the office tower's revolving entrance, the school's doors, the fire station's side door; a lift by the old subway entrance
x,y,w,d=at('office_tower'); put('revolving_entrance_bay',x,FR+T(1),N,solid=False)
x,y,w,d=at('public_school'); put('school_door_set',x,FR+T(.2),N,solid=False)
x,y,w,d=at('fire_station'); put('fire_door_set',x+w/2-T(.4),y+d/2-T(1.5),E,solid=False)
put('lift_landing_door',44,72,N,solid=False)
# the haunted house's grand staircase; the rail yard footbridge's stairs
x,y,w,d=at('haunted_victorian_house'); put('grand_marble_staircase',x,y-d/2-T(4),N,solid=False)
put('straight_stair_flight',144,138,N,solid=False); put('stair_core_flight',144,158,N)
# a tent by the cabin, a mushroom cottage in the bug's-eye garden, a glass conservatory on the graveyard's lawn
put('camp_tent',48,146,W); put('mushroom_cottage',91,38,S,solid=False); put('glass_conservatory',30,168,S)
old=[o for o in json.load(open('data/garden.json')) if not str(o.get('k','')).startswith('pf_')]
json.dump(old+P,open('data/garden.json','w'),indent=0)
# the homes among them (src/158-lives.js): a door just out of the front, beds by storeys and floor (about 15 m2 a bed, city flats; a shophouse lives over its shop)
HOMES={'corner_tenement':'THE CORNER TENEMENT','brownstone_row_house':'THE BROWNSTONE','narrow_walk_up':'THE WALK-UP','cast_iron_loft':'THE CAST-IRON LOFT',
  'corner_shophouse':'THE CORNER SHOPHOUSE','two_storey_shophouse':'THE TWO-STOREY SHOPHOUSE','three_storey_shophouse':'THE THREE-STOREY SHOPHOUSE','wide_shophouse':'THE WIDE SHOPHOUSE',
  'motel_room_run':'THE RIVER MOTEL','porch_log_cabin':'THE LOG CABIN','haunted_victorian_house':'THE HAUNTED HOUSE'}
RES=[]
for o in P:
    k=o['k'][3:]
    if k not in HOMES: continue
    w,h,d=size[o['k']]; st=max(1,round(h/3)); shop='shophouse' in k; beds={'motel_room_run':8,'porch_log_cabin':2,'haunted_victorian_house':1}.get(k) or max(1,round((st-(1 if shop else 0))*w*d/15))
    tx=(o['x']+81.36)/1.13; ty=(o['z']-87.01)/1.13; f=T(d)/2+.9
    RES.append({'id':k,'name':HOMES[k],'door':[round(tx+math.sin(o['rot'])*f,2),round(ty+math.cos(o['rot'])*f,2)],'beds':beds})
# where the townspeople spend their own time (src/158-lives.js): a band to wander or spots [x, y, r], in map tiles; hd, the way to face (the pier's anglers look at the river)
sh=next(o for o in P if o['k']=='pf_small_shrine_hall'); shx=(sh['x']+81.36)/1.13
HANG={'pier':{'band':[30,100,-117.6,-116.6],'hd':3.1416},'meadow':{'areas':[[-8,46,7],[88,42,6],[180,30,8],[130,150,7]]},'path':{'band':[-15,250,57,60]},
  'bench':{'areas':[[113,52,6],[30,140,5]]},'river':{'band':[0,200,-115,-111]},'flea':{'areas':[[223,-84,5]]},'shrine':{'band':[round(shx-2,2),round(shx+2,2),-110.6,-109.8],'hd':0}}
import re
t=open('data/world.json').read(); pf=json.dumps({k:sorted(v) for k,v in SPANS.items()},separators=(',',':')); t=re.sub(r'\n  "pf": [^\n]*','',t)
t=t.replace('\n "block": {\n','\n "block": {\n  "pf": '+pf+',\n',1); assert json.loads(t)['block']['pf']
t=re.sub(r'\n "residences": [^\n]*','',t); t=re.sub(r'\n "hangouts": [^\n]*','',t); t=t.replace('\n "block": {\n','\n "hangouts": '+json.dumps(HANG,separators=(',',':'))+',\n "block": {\n',1); t=t.replace('\n "block": {\n','\n "residences": '+json.dumps(RES,separators=(',',':'))+',\n "block": {\n',1); assert json.loads(t)['residences']; open('data/world.json','w').write(t)
print(len(RES),'homes,',sum(r['beds'] for r in RES),'beds')
used={o['k'] for o in P}; print(len(P),'placed;',len(used),'of',len(size),'models; unplaced:',sorted(set(size)-used))
