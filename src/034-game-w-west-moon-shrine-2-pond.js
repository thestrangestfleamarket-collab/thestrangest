function msPond(x,y,w,d,z0=0,K=.2){ '@later'; const zw=z0+7;
  const p=msPut('moon pond',[msStone(x,y,x+w,y+K,z0,zw),msStone(x,y+d-K,x+w,y+d,z0,zw),msStone(x,y+K,x+K,y+d-K,z0,zw),msStone(x+w-K,y+K,x+w,y+d-K,z0,zw)],{flat:false});
  LAMPS.push(msLamp({x:x+w/2,y:y+d/2,z:zw+4,r:3.6,c:[.3,.95,.85]},p)); return p; }
const MSKOI=[{c:[232,98,48],m:[250,244,236],a:1.2,b:1,z:.4,hd:0,sp:.22,tail:0,face:1,up:0}];
for(const k of MSKOI){ const c=v=>v.map(q=>q/255), b=c(k.c); k.pal={b,m:c(k.m),t:b,f:b.map(q=>q*.55+.45),e:[.04,.04,.05]}; }
const MSFL=[[0,.05],[2.1,.04],[4.2,.06]];
const MSLANT=["..ddddd..",".dPPPPPd.","dpPPPPPpd","dPPPPPPPd","dbbbbbbbd","dPPPPPPPd","dpPPPPPpd","dPPPPPPPd",".wwwwwww.","..wwwww.."];
Object.assign(CATALOG,{'stone terrace':(x,y)=>msTerrace(x-2.78,y-2.69),'mossy steps':(x,y)=>msSteps(x-1.2,y-.6),'spiral stone plaza':(x,y)=>msPlaza(x-2.78,y-2.8),
  'statue plinth':(x,y)=>msPlinth(x,y),'moon shrine statue':(x,y)=>msStatue(x,y),'moon shrine gate':(x,y)=>msGate(x,y),'hanging paper lantern':(x,y)=>msHangingLantern(x,y,60),
  'blossom clump':(x,y)=>msBlossom(x,y),'square stone post':(x,y)=>msPost(x,y),'stone post with vines':(x,y)=>msPost(x,y,0,true),'paper ground lantern':(x,y)=>msGroundLantern(x,y),
  'floating pond lantern':(x,y)=>msFloatingLantern(x,y),'stone garden lantern':(x,y)=>msToro(x,y),'mossy cliff rock':(x,y)=>msRock(x,y),'fern bush':(x,y)=>msFern(x,y),
  'moss and grass tuft':(x,y)=>msTuft(x,y),'wooden marker post':(x,y)=>msMarker(x,y),'mossy walkway stone':(x,y)=>msStepStone(x-.5,y-.35),'moon pond':(x,y)=>msPond(x-2.7,y-1.7,5.4,3.4),
  'mossy parapet':(x,y)=>msParapet(x-3,y-.11,x+3,y+.11)});
if(!CAT_DEPTS.some(d=>d[0]==='shrine'))CAT_DEPTS.push(['shrine','Moon shrine']);
Object.assign(CAT_INFO,{
  'moon shrine gate':{no:'G-401',name:'Vine-Wrapped Red Gate',dept:'shrine',price:12000,desc:'Red timber shrine gate with two hanging lanterns.',mat:'cedar, lacquer, paper'},
  'moon shrine statue':{no:'G-402',name:'Robed Stone Statue',dept:'shrine',price:18000,desc:'Carved stone figure with a staff and a gold halo.',mat:'granite, gold leaf'},
  'statue plinth':{no:'G-403',name:'Lotus Plinth',dept:'shrine',price:3500,desc:'Stone drum with a carved lotus.',mat:'granite'},
  'mossy steps':{no:'G-404',name:'Mossy Stone Steps',dept:'shrine',price:2200,desc:'Two stone steps with side walls.',mat:'stone'},
  'spiral stone plaza':{no:'G-405',name:'Spiral-Carved Stone Plaza',dept:'shrine',price:6500,desc:'Flagstone plaza with a carved spiral.',mat:'stone'},
  'mossy walkway stone':{no:'G-406',name:'Mossy Stepping Stone',dept:'shrine',price:180,desc:'Flat stepping stone.',mat:'stone'},
  'square stone post':{no:'G-407',name:'Square Stone Post',dept:'shrine',price:900,desc:'Stone post with a pointed cap.',mat:'stone'},
  'stone post with vines':{no:'G-408',name:'Stone Post with Vines',dept:'shrine',price:950,desc:'Stone post with ivy.',mat:'stone'},
  'wooden marker post':{no:'G-409',name:'Wooden Marker Post',dept:'shrine',price:120,desc:'Wooden post with a crossbar.',mat:'wood'},
  'paper ground lantern':{no:'L-501',name:'Paper Ground Lantern',dept:'shrine',price:85,desc:'Wood-framed paper floor lantern.',mat:'wood, paper'},
  'hanging paper lantern':{no:'L-502',name:'Hanging Paper Lantern',dept:'shrine',price:40,desc:'Round paper lantern on a cord.',mat:'paper, bamboo'},
  'floating pond lantern':{no:'L-503',name:'Floating Pond Lantern',dept:'shrine',price:15,desc:'Paper lantern on a wooden float.',mat:'paper, wood'},
  'stone garden lantern':{no:'L-504',name:'Stone Garden Lantern',dept:'shrine',price:1400,desc:'Carved stone lantern on a mossy rock.',mat:'granite'},
  'moon pond':{no:'W-601',name:'Koi Pond Kerb',dept:'shrine',price:9000,desc:'Stone kerb round a koi pond (the water is the land\'s: water squares).',mat:'stone'},
  'blossom clump':{no:'W-604',name:'Pink Blossom Clump',dept:'shrine',price:60,desc:'Flowering cherry shrub.',mat:'living'},
  'moss and grass tuft':{no:'W-605',name:'Moss & Grass Tuft',dept:'shrine',price:8,desc:'Clump of moss and grass.',mat:'living'},
  'fern bush':{no:'W-606',name:'Dark Fern Bush',dept:'shrine',price:35,desc:'Shade fern.',mat:'living'},
  'mossy cliff rock':{no:'W-607',name:'Mossy Cliff Rock',dept:'shrine',price:750,desc:'Boulder cluster with moss.',mat:'stone, moss'},
  'stone terrace':{no:'G-410',name:'Stone Terrace',dept:'shrine',price:8500,desc:'Raised stone platform.',mat:'stone'},
  'mossy parapet':{no:'G-411',name:'Mossy Parapet Section',dept:'shrine',price:900,desc:'Six-tile run of low stone wall with hanging vines.',mat:'stone, ivy'}});
for(const k of ['moon shrine gate','moon shrine statue','statue plinth','mossy steps','spiral stone plaza','mossy walkway stone','square stone post','stone post with vines','wooden marker post',
  'paper ground lantern','hanging paper lantern','floating pond lantern','stone garden lantern','moon pond','blossom clump','moss and grass tuft','fern bush','mossy cliff rock','stone terrace','mossy parapet'])if(!KIND_OF[k])KIND_OF[k]=k;
PRESETS['Preset Moon Shrine 1']=[['mossy parapet',3,.11,0],['mossy parapet',3,15.89,2],...[3.22,8,12.78].flatMap(v=>[['mossy parapet',.11,v,3],['mossy parapet',5.89,v,1]]),['stone terrace',3,2.91,0],['mossy steps',3,6.2,0],['spiral stone plaza',3,9.6,0],['moon pond',3,14.19,0],
  ['mossy cliff rock',.85,.85,0],['statue plinth',3,2.7,0],['moon shrine statue',3,2.7,0],['moon shrine gate',3,5.25,0],['wooden marker post',5,1.25,0],
  ['square stone post',5.4,7.2,0],['stone post with vines',.6,7.2,0],['square stone post',.6,12,0],['stone post with vines',5.4,12,0],
  ['paper ground lantern',1.25,7.3,0],['paper ground lantern',4.75,7.3,0],['paper ground lantern',1.6,11.9,0],['paper ground lantern',4.4,11.9,0],['paper ground lantern',1,4.9,0],
  ['mossy walkway stone',4.4,13.1,0],['mossy walkway stone',4.5,14.1,0],['mossy walkway stone',4.45,15.15,0],['stone garden lantern',.78,15.2,0],
  ['fern bush',5.2,15.25,0],['fern bush',.48,6.55,0],['fern bush',5.52,6.4,0],['blossom clump',.55,5.3,0],['blossom clump',5.45,5.25,0],['blossom clump',.45,9.6,0],['blossom clump',2.2,1.4,0]];

STOREK.shrine={MSP,msStone,msGate,msStatue,msToro,msBlossom,msFloatingLantern,msFern,msBlock,msFlag};
}

{
