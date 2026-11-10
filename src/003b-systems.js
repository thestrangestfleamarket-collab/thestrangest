// THE GAME'S SYSTEMS, DECLARED FIRST: every system another file uses before its own file runs is made here (empty, or its first value) and filled in its own file, so each file only reads names from files before it.
import {THREE} from './003-shx.js';
const ROOMS={lazy:{},off:{},grounds:[]},
  VIS={all:false},
  LEVELS={of:{},ways:[],below:y=>y<-1.6?'down':'up',own:(o,id)=>{ o.userData.level=id; return o; }},
  UI={camKeeps:[]},   // camKeeps: places that keep the camera out of their walls
  CHARP={},
  DOLL={},   // the paper doll (162ea-doll): you, what you wear and your buttons; another player as they are
  BAG={},   // the bag: THE PACK drawn as a bag of item pictures, the ground drops and the paperdoll (162e-bag)
  HUD={},   // the heads-up display (162d-hud): the minimap, the message log and the quick bar
  INVITES={kinds:{}},   // invitations between players (144ch-invites); a kind of invitation is registered in INVITES.kinds by its own file
  MARKS=[],   // marks on the MAP and the minimap ({x,z,name,until}): an invitation's place
  ED={},
  pos=new THREE.Vector3(-2.2,0,3.2),
  keys=new Set(),
  RAG={},
  SFX={},
  LINES={},
  DRONE=window.DRONE={cam:false,state:'home'},
  vwV=(x,y)=>[(x-y)*Math.SQRT1_2,-(x+y)*Math.SQRT1_2],
  wvV=(u,v)=>[(u-v)*Math.SQRT1_2,-(u+v)*Math.SQRT1_2],
  CLOCK={},
  NEWS={},
  DRESS={},
  PONDS={wet:()=>false,strips:[]},
  LITE={},
  SHAD={},
  CLIP={},
  INTERIORS={},
  CINEMA={},
  USE={},
  BLK={},
  st=RIG.create(),
  WX={},
  FAR3={},
  VIT={mends:[]},   // mends: what is healing you now (rest, the bath's steam): each a function giving health a second
  SWIM={tank:()=>0},
  FLOW={},   // one water (065a-flow): every water's shared simulation
  PARK={},
  MAIL={},
  TRADE={},
  INV={},
  CITY={},
  WALKS={},
  SKY={},
  NPCS=[],
  VAULT=window.VAULT={},   // your bank vault (146zmb): say BANK by the bank
  ARCHI=window.ARCHI=id=>{ '@later'; id=String(id).split('~')[0]; if(id==='d_ale'||id==='d_stout'||id==='d_cola'||id==='f_popcorn'||id==='f_nachos'||id==='f_candybox')return false; return /^(fy_|ap_|scroll_|px_(deep|glow|iron)$)/.test(id)||['raw_geode','cut_grotto','crowbar','sword_knight','putter','quill_pen','stack_key','bk_captlog'].includes(id)||/^(gb_|bk_|br_|bs_)/.test(id)||/^(f_|d_|p_|mus_|curse_|junk_|plush_|prize_|soda_)/.test(id)||(/^g_/.test(id)&&id!=='g_catfood'&&id!=='g_fishfood'&&id!=='g_dogfood')
    ||['armor','ticket','fairticket','play_ticket','ptix','lotto_ticket','arc_token','passport','news_paper','fairphoto','fair_pennant','cube2','cube3','cube4','kazoo',
      'corndog','funnelcake','cotton_candy','lemonade','popcorn','tv_console','tv_small','pockettv','handheld','walkman','phone_home','phone_cell','radio_scanner','fix_parts','mortar','scanner','extractor','cutter','art_print','art_postcard'].includes(id); },   // archived items (owner, 4-5 Nov 2026): kept in saves, never shown or sold
  ARCH=window.ARCH=new Set(["aircrew_pilot","fox","armoured_knight_hero","arriving_hotel_guest","ashigaru_foot_soldier","astronaut_engineer","astronaut_explorer","astronaut_scientist","backpacker","bagger","balloonwitch","barista","base_commander","beekeeper","bellhop","bench_researcher","blackjack_dealer","block","bluehour","boardwright","bonsai","broadcast","buddhist_monk","cactus","cafe_customer","cage_cashier","campfire_parent","carving_chef","casino_security_officer","cheerleader","child_with_a_painted_face","china_cueca_dancer","chinchinero","city_commuter","civic_security_officer","clean_room_technician","cleric","coatbear","cocktail_server","commuter","construction_worker","crane_banksman","crossing_keeper","daimyo_lord","delivery_courier","doctor","donut","el_catr_n","emberknight","engine_driver","family_road_tripper","farmer_cozy_farm","farmer_medieval_japan","field_medic","firefighter","fireman","fixer","fixkid","flight_attendant","flowerlady","fruitseller","gas_station_attendant","gd_beardpanda","gd_blueowl","gd_caterpillar","gd_fisher","gd_gemturtle","gd_goggles","gd_lion","gd_lizkeeper","gd_lynx","gd_panda","gd_purpleowl","gd_redpanda","gd_shaman","gd_shark","gd_skullmouse","gd_spirit","gd_tiger","ghost2","glasshorn","goalkeeper","goblin","graduate_in_gown","graduate_student","graffiti_artist","grandmother_in_a_rebozo","gridiron_player","groundskeeper_stadium","groundskeeper_university","groundworker","guard","hero","hero_f_1","hero_f_2","hero_f_3","high_roller","highway_patrol_officer","hiker","hiker_visitor","holidaymaker_in_a_sun_hat","hooded_cultist","hotdogman","huaso","infantry_rifleman","jellycap","kid_in_a_black_cat_costume","kid_in_a_caped_hero_costume","kid_in_a_cardboard_robot_costume","kid_in_a_pumpkin_costume","kid_in_a_skeleton_suit","kid_witch","kid_with_a_flashlight","kite_kid","knight","la_catrina","lake_angler","lifeguard","lift_operator","lounge_bartender","maintenance_technician","male_villager","manatee","merchant","monk","motel_clerk","mountaineer","mrblocks","naval_officer","neighborhood_child","neighbour_handing_out_candy","newsreel","number80","operator","orc_brute","organillero","origamifox","otter","outfield_player","outlaw","paramedic","parent_chaperone","parrilla_cook","passenger","patient_in_gown","petty","pirate_captain","pirate_deckhand","piste_patroller","pit_boss","platelayer","player_in_a_cardigan","player_in_flannel","poacher","poker_pro","police_officer","pool_guest","porter","preacher","prospector","pumpkin_stand_keeper","pupil_girl","pupil_standing","radish","raincat","rainfish","ranger","reelkid","referee","rogue","room_attendant","salaryman_commuter","saloon_keeper","scanner","school_caretaker","school_student","school_teacher","scooter_kid","scooterfrog","seated_office_worker","senior_scientist","service_robot","shambling_ghoul","shark","sheriff","showgirl","shunter","shuttle_pilot","signalman","site_manager","skeleton_mariachi","skier","slot_tourist","soniee","spectator","squad_officer","stage_magician","standing_worker_on_a_call","station_master","steel_erector","student_in_a_hoodie","student_with_backpack","stump","suburban_resident","surgeon_in_scrubs","surveyor","swimmer_in_a_wetsuit","tapati_dancer","team_mascot","teen_player","teen_zombie","tiger","touchline_manager","tour_guide","townswoman_frontier_town","townswoman_medieval_japan","trader","tradesman","trainspotter","tvcat","uniformed_floor_guard","village_child","village_engineer","village_guard","village_mechanic","villager_f_1","villager_f_2","villager_f_3","villager_m_1","villager_m_2","villager_m_3","visitor_with_badge","w_owl","w_pangolin","w_rat","w_tokenbot","waiter","wandercap","ward_nurse","warrior","watchmaker","waving_child","wizard"]),   // archived characters (owner, 4-5 Nov 2026): made hidden and never ticked
  DN={},
  WEEDS=window.WEEDS={},
  PERFX={},
  CULL={},
  PH={},
  W3={},
  BROOK={},
  ONLINE={mine:{}},
  TENANTS={}, TESTS={},
  GUIDE={},
  VR={on:false},
  BINS={},
  MOTION={}, PASSPORT={}, FIRSTDAY={}, PETS={}, SUMMON={}, SCANNER={}, SPRAY={},
  FEEL={},
  WIELD={},
  WINDOWS={panes:[],held:new Set(),pane(me,off,look,dark,only){ this.panes.push({me,off,look,dark,only}); if(only)me.visible=false; if(dark&&this.dark)this.dark(me); }},   // glass panes that show a picture of the real view through them (130a)
  EQUIP={},
  BOAT={},
  CARLAMPS={src:[]},   // vehicles that carry lamps (150pc-carlamps): each src(out) adds {x,y,z,r,dim:[w,h,l,y0],fly} for a vehicle driving now
  SPEED=window.SPEED={k:{},fn:[],of:c=>{ const K=SPEED.k, a=+K.all>0?+K.all:1, v=+K[c]>0?+K[c]:1; return a*v; },on:f=>{ SPEED.fn.push(f); }},   // the owner's vehicle speeds (136cb-vehicles, ADMIN > VEHICLES): SPEED.of(kind) times a kind's own speed, on(f) hears a change
  VLOOK=window.VLOOK={kinds:{},live:new Set(),fn:[],kind:(id,o)=>{ VLOOK.kinds[id]=o; },dress:(id,o)=>{ if(o){ o.userData.vlook=id; VLOOK.live.add(o); if(VLOOK.apply)VLOOK.apply(o); } return o; },on:f=>{ VLOOK.fn.push(f); },scaleOf:id=>{ const L=VLOOK.looks&&VLOOK.looks[id]; return L&&+L.s>0?+L.s:1; }},   // the vehicles' looks (150pd-vedit, ADMIN > VEHICLE EDITOR): a maker passes what it makes through dress(id, mesh); kind(id, {name, grp, make}) lists it in the editor; on(f) hears a change
  RIDE={on:null,lift:0},   // what you are riding (146i-ride): a hoverboard, a balloon
  TRICKS={},   // the skateboard's tricks (146ib-tricks): its kind asks them how to move, stand and score
  PB={},
  FIGFX={},
  MUS={},
  PNM={},
  SGM={},
  DRM={},
  STAGE={},
  LOOK={},
  PS2=window.PS2={cap:480},
  WHERE={},
  AMB={},
  ZONES={},
  SELFSH={},
  BLAZE=window.BLAZE={F:[],D:[]},
  ICE={},
  POND={},
  SND={},
  LOOKS={},
  GAMEED={},
  WE={},
  SIGNS={list:[]},
  TEXT={def:{},cur:{},on:[]},
  WED={meshes:[],objs:[]},
  MAPED={},
  SNDED={},
  EDITORS=window.EDITORS={},
  LIGHTED={},
  ITEMS=window.ITEMS={defs:{}},
  ITEMED={},
  CHARS={},
  CHARED={},
  SHOPS={},
  LAND={},
  BUGS={},
  RINSP={}, GPUT={}, TRAINERS={},
  FORAGE={},
  CIVIC={},
  GHOSTS=window.GHOSTS={list:[]},
  PHYS={},   // the physics extras' settings (090a-physx) and what they share
  GUARD=window.GUARD={list:[]},   // the castle's guardians (146j fills it; the folk's bodies read its moves)
  GPH=window.GPH={ms:0,n:0},   // the loose things' physics (150-loose fills it); declared here so the places before it can add their things
  GTRH={},
  GTSAMP=[],
  IMK={},
  BOOKS={},
  TABLES=window.TABLES={sit:()=>{},top:()=>null,leave:()=>{},chairs:[]},   // the bookstore café's game tables (144cc-tables fills it); the bookstore's room (144ca) sets them
  TALK=window.TALK={on:false,shops:new Map(),ops:{},tests:{},vars:{}},   // the talk window (159da-talk); the shops and the clicks hand characters to it; a character with its own shop panel sets TALK.shops
  INSPECT=window.INSPECT={kinds:[],on:false},   // the inspect window (150cy-inspect); each item family pushes {is:id=>bool, make:id=>Object3D} in its own file
  RADIO=window.RADIO={src:new Map(),next:()=>0,now:()=>null},   // the radio's stations (150p-cars) heard from more than cars: a room's source (a jukebox) is RADIO.src.set(id,{id,room}); RADIO.next(id) tunes it on (shared, like a car's); one with its own set gives st/vol/here/at/R (an apartment's radio, 150fb)
  WORKERS=window.WORKERS={idle:{},made:{},models:{},make:()=>Promise.resolve()};   // the insides' non-human workers (146zb-workers): WORKERS.make(place) the first time you go in; idle[key] how one moves at its spot; models[key] a body made by code (MERCH's way) for one with no folk recipe
// read by files before their own (their own files fill them)
const INSTR={KINDS:{}}, FLORA={bushes:[],beds:[],tris:0,n:{}}, BIRDS={list:[]}, PAWNL=[], BATCH={items:[],tag:null}, WORTH={}, PROMPT={};
// the archived editors and town life (owner, 5 Nov 2026) leave these calls answered by nothing
{ const no=()=>{}, nf=()=>false;
  Object.assign(FEEL,{key:nf,ui:no},FEEL); Object.assign(GAMEED,{toggle:no},GAMEED); Object.assign(MAPED,{down:nf,move:no,up:no,toggle:no,box:()=>null},MAPED);
  Object.assign(LAND,{down:nf,move:no,up:no},LAND); Object.assign(SNDED,{close:no,into:no},SNDED); Object.assign(RINSP,{toggle:no},RINSP);
  Object.assign(EDITORS,{menu:no,key:no},EDITORS); Object.assign(SUMMON,{id:()=>'',here:()=>[],list:()=>[],go:no,back:no},SUMMON);
  Object.assign(NEWS,{init:no},NEWS); Object.assign(BINS,{station:no},BINS); Object.assign(PNM,{tick:no},PNM); Object.assign(SGM,{tick:no},SGM); }
export {AMB, ARCH, ARCHI, BAG, BATCH, BINS, BIRDS, BLAZE, BLK, BOAT, BOOKS, BROOK, BUGS, CARLAMPS, CHARP, CHARS, CINEMA, CITY, CIVIC, CLIP, CLOCK, CULL, DN, DOLL, DRESS, DRM, DRONE, ED, EQUIP, FAR3, FEEL, FIGFX, FIRSTDAY, FLORA, FLOW, FORAGE, GAMEED, GHOSTS, GPH, GPUT, GTRH, GTSAMP, GUARD, GUIDE, HUD, ICE, IMK, INSPECT, INSTR, INTERIORS, INV, INVITES, ITEMED, ITEMS, keys, LAND, LEVELS, LINES, LITE, LOOK, LOOKS, MAIL, MAPED, MARKS, MOTION, MUS, NEWS, NPCS, ONLINE, PARK, PASSPORT, PAWNL, PB, PERFX, PETS, PH, PHYS, PNM, POND, PONDS, pos, PROMPT, PS2, RADIO, RAG, RIDE, RINSP, ROOMS, SCANNER, SELFSH, SFX, SGM, SHAD, SHOPS, SIGNS, SKY, SND, SNDED, SPEED, SPRAY, st, STAGE, SWIM, TABLES, TALK, TENANTS, TESTS, TEXT, TRADE, TRAINERS, TRICKS, UI, USE, VAULT, VIS, VIT, VLOOK, VR, vwV, W3, WALKS, WE, WED, WEEDS, WHERE, WIELD, WINDOWS, WORKERS, WORTH, wvV, WX, ZONES};
