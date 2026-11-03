# THE DRIVE MODELS' PLACES (owner, 3 Nov 2026: "figure out a place for everything"): writes data/garden.json, the placed props
# (src/152a-landscape.js), from map tiles here. Keeps any placement whose model is not one of the Drive's (pf_).
# Run: python3 tools/pf-places.py
import json, math
X=lambda t:-81.36+1.13*t; Z=lambda t:87.01+1.13*t   # map tiles to the world (SHARED.BOD.XS / ZS)
PI=math.pi; N,E,S,W=0,PI/2,PI,-PI/2   # which way a model's front (+Z) looks
T=lambda m:m/.84   # metres to tiles
size={k:v['size'] for k,v in json.load(open('data/pfprops.json')).items()}
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
# Old Town, in the open north of the park's cross path (the park's trees stand thick south of it): two rows of the city's buildings facing each other
# across their own street (map rows 78 to 92), split where the path to the castle (x 43) crosses; its cars parked along both kerbs
row(['corner_tenement','brownstone_row_house','narrow_walk_up','cast_iron_loft'],-12,78,face=N); row(['office_tower','corner_shop','brick_church','street_diner'],49,78,face=N)
row(['one_storey_shop_row','fire_station','auto_repair_garage'],-12,92,face=S); row(['public_school','village_hall'],49,92,face=S)
put('subway_entrance',40,74,N); put('escalator_flight',47,70,E)
x=-10
for i,k in enumerate(['fire_engine','vintage_hearse','patrol_cruiser','security_patrol_cruiser','stretch_limousine','compact_hatchback','wheeled_city_coupe','team_minibus',
      'campus_shuttle_bus','pop_top_camper_van','camper_trailer','food_truck','semi_tractor','box_trailer','commuter_hover_pod']):
    l=size['pf_'+k][2]
    if i==8: x=-10
    if 36<x+T(l)/2<50: x=51
    put(k,x+T(l)/2,81.5 if i<8 else 88.5,E if i<8 else W); x+=T(l)+3
put('roadside_billboard',106,84,W)
# a motel south of the reservoir, its pool behind; the lighthouse on the lake's east shore
x=row(['motel_office','motel_room_run'],154,94,face=N); put('kidney_pool',166,76,S,solid=False); put('old_lighthouse',165,12,W)
# a rail yard on the lawn west of the reservoir, its stock on three sidings, a footbridge over them, a bookstall; the viaduct's arches carry the brook
for y,x,ks in [(142,124,['mainline_diesel_locomotive']),(153,122,['passenger_carriage']),(164,122,['railbus','tender_steam_locomotive']),(171,124,['guideway_rail_shuttle'])]:
    for k in ks: l=size['pf_'+k][2]; put(k,x+T(l)/2,y,E); x+=T(l)+1.5
put('station_footbridge',144,148,E); put('platform_bookstall',141,171,N); put('stone_viaduct_span',140,36,E); put('stone_viaduct_span',140+T(size['pf_stone_viaduct_span'][2]),36,E)
# the skatepark's gateway: its door (src/089c-skatepark.js)
put('skatepark_entrance_gateway',175,62.6,S,solid=False)
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
old=[o for o in json.load(open('data/garden.json')) if not str(o.get('k','')).startswith('pf_')]
json.dump(old+P,open('data/garden.json','w'),indent=0)
used={o['k'] for o in P}; print(len(P),'placed;',len(used),'of',len(size),'models; unplaced:',sorted(set(size)-used))
