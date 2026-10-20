const BF_C={blk:[26,22,24],brn:[84,56,40],dk:[50,40,36],wht:[244,240,228],cr:[236,224,180],org:[230,122,34],yel:[246,206,70],red:[206,44,36],
  blu:[80,140,220],sky:[150,190,240],grn:[60,190,140],gold:[244,170,40],gry:[150,150,150]};
const BF_SHAPE={
  nym:{f:[[0,0.145],[0.18,0.522],[0.6,0.725],[1,0.638],[0.86,0.174],[0.7,0],[0,-0.04]],h:[.3,-.34,.42,.36]},
  swal:{f:[[0,0.145],[0.2,0.551],[0.62,0.725],[1,0.667],[0.78,0.087],[0,-0.02]],h:[.28,-.34,.4,.34],tail:[[.33,-.55],[.4,-.96],[.46,-.94],[.42,-.55]]},
  bird:{f:[[0,0.116],[0.2,0.435],[0.6,0.58],[1,0.493],[0.7,0.058],[0,-0.02]],h:[.26,-.3,.3,.26]},
  pier:{f:[[0,0.145],[0.16,0.522],[0.6,0.725],[0.95,0.638],[0.9,0.261],[0.66,0],[0,-0.04]],h:[.3,-.3,.34,.32]},
  blue:{f:[[0,0.145],[0.16,0.493],[0.56,0.667],[0.9,0.58],[0.84,0.174],[0.62,-0.02],[0,-0.04]],h:[.27,-.28,.32,.3]},
  bhut:{f:[[0,0.116],[0.2,0.493],[0.62,0.667],[1,0.551],[0.76,0.058],[0,-0.02]],h:[.26,-.32,.32,.28],tail:[[.3,-.52],[.36,-.98],[.42,-.96],[.4,-.52]],tail2:[[.18,-.55],[.22,-.82],[.27,-.8],[.26,-.55]]}};
const bfIn=(P,x,y)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const [a,b]=P[i],[p,q]=P[j]; if((b>y)!==(q>y)&&x<(p-a)*(y-b)/(q-b)+a)c=!c; } return c; };
function bfWing(sh,u,v){ '@later'; const S=BF_SHAPE[sh], [hx,hy,hr,hv]=S.h;
  const inF=(x,y)=>u>=0&&bfIn(S.f,x,y), inH=(x,y)=>x>=0&&((x-hx)/hr)**2+((y-hy)/hv)**2<=1||S.tail&&bfIn(S.tail,x,y)||S.tail2&&bfIn(S.tail2,x,y);
  const f=inF(u,v), h=!f&&inH(u,v); if(!f&&!h)return null;
  const [cx,cy]=f?[.42,.3]:[hx,hy], t=k=>{ const x=cx+(u-cx)/k, y=cy+(v-cy)/k; return f?inF(x,y):inH(x,y); };
  let e=1; for(const k of [.97,.93,.88,.82,.74,.64])if(!t(k)){ e=1-k; break; } return {fore:f,rim:e}; }
const bfNear=(u,v,x,y,r)=>Math.hypot(u-x,v-y)<r;
const BF_KINDS=[
  ['Monarch','Danaus plexippus','the Americas; flies to Mexico each autumn',95,'nym',0,(u,v,f,r)=>r<.1?(((u*40|0)+(v*40|0))%3===0?BF_C.wht:BF_C.blk):r<.16?BF_C.blk:f&&u>.72&&v>.2?(bfNear(u,v,.86,.36,.04)?BF_C.wht:BF_C.blk):(Math.abs(Math.sin((Math.atan2(v-(f?.0:-.1),u)*7)))<.12?BF_C.blk:BF_C.org),[214,140,60]],
  ['Cabbage White','Pieris rapae','fields and gardens almost everywhere',50,'pier',0,(u,v,f,r)=>f&&u>.72&&v>.28?[70,70,70]:f&&bfNear(u,v,.6,.18,.06)?[70,70,70]:u<.1?[190,190,184]:BF_C.wht,[232,232,200]],
  ['Eastern Tiger Swallowtail','Papilio glaucus','eastern North America, woods and gardens',110,'swal',0,(u,v,f,r)=>r<.12?(((u*30|0)%2)?BF_C.yel:BF_C.blk):r<.2?BF_C.blk:!f&&r<.3&&u>.3?BF_C.blu:f&&[.25,.45,.62].some(s=>Math.abs(u-s)<.035)?BF_C.blk:u<.08?BF_C.blk:BF_C.yel,[236,200,90]],
  ['Black Swallowtail','Papilio polyxenes','meadows and gardens of eastern North America',90,'swal',0,(u,v,f,r)=>r<.1?BF_C.blk:r<.17?BF_C.yel:!f&&r<.28?(bfNear(u,v,.12,-.6,.07)?BF_C.org:BF_C.blu):f&&r<.3&&r>.22?BF_C.yel:BF_C.blk,[40,36,40]],
  ['Spicebush Swallowtail','Papilio troilus','eastern woods with spicebush and sassafras',100,'swal',0,(u,v,f,r)=>r<.1?BF_C.blk:r<.16?[236,232,190]:!f&&r<.42?[90,170,190]:BF_C.blk,[50,44,46]],
  ['Red Admiral','Vanessa atalanta','gardens and woods all over the north',55,'nym',0,(u,v,f,r)=>f&&u>.74&&v>.22&&bfNear(u,v,.86,.38,.06)?BF_C.wht:f&&Math.abs(u+v*.9-.78)<.07?BF_C.red:!f&&r<.16&&r>.06?BF_C.red:BF_C.blk,[60,44,48]],
  ['Painted Lady','Vanessa cardui','every continent but the poles',55,'nym',0,(u,v,f,r)=>f&&u>.72&&v>.2?(bfNear(u,v,.84,.36,.05)?BF_C.wht:BF_C.blk):r<.12?BF_C.blk:f&&bfNear(u,v,.5,.22,.08)?BF_C.blk:!f&&r<.2?(((u*30|0)%2)?BF_C.blk:[240,150,90]):[238,140,70],[200,170,150]],
  ['Mourning Cloak','Nymphalis antiopa','woods across the north, the first out in spring',75,'nym',0,(u,v,f,r)=>r<.12?BF_C.cr:r<.2?(((u*24|0)+(v*24|0))%3===0?BF_C.blu:BF_C.blk):[96,40,44],[60,50,50]],
  ['Question Mark','Polygonia interrogationis','woods and parks of eastern North America',60,'nym',0,(u,v,f,r)=>r<.1?[110,60,40]:!f&&r<.35?[80,50,40]:[[.3,.3],[.5,.2],[.45,.38],[.62,.3]].some(([a,b])=>f&&bfNear(u,v,a,b,.05))?BF_C.blk:[214,110,40],[150,110,80]],
  ['Clouded Sulphur','Colias philodice','clover fields and roadsides',45,'pier',0,(u,v,f,r)=>r<.12?BF_C.blk:f&&bfNear(u,v,.5,.26,.04)?BF_C.blk:!f&&bfNear(u,v,.3,-.32,.05)?BF_C.org:[244,230,120],[230,220,110]],
  ['Pearl Crescent','Phyciodes tharos','open fields and parks of North America',32,'nym',0,(u,v,f,r)=>r<.14?BF_C.blk:((u*16|0)+(v*16|0))%4===0?BF_C.blk:[226,120,40],[220,170,120]],
  ['Eastern Tailed-Blue','Cupido comyntas','lawns, fields and road edges in the east',25,'blue',0,(u,v,f,r)=>r<.12?[60,60,90]:!f&&bfNear(u,v,.2,-.56,.06)?BF_C.org:[110,120,230],[220,220,230]],
  ["Queen Alexandra's Birdwing",'Ornithoptera alexandrae',"one valley's rainforest in Papua New Guinea; the largest butterfly",250,'bird',1,(u,v,f,r)=>r<.08?BF_C.blk:f&&(Math.abs(v-.24)<.05&&u>.1||Math.abs(u-.6)<.05&&v<.3&&v>.05)?[80,230,210]:!f&&r>.18?[70,210,200]:BF_C.blk,[40,60,50]],
  ["Wallace's Golden Birdwing",'Ornithoptera croesus','two islands of the Moluccas',180,'bird',1,(u,v,f,r)=>r<.08?BF_C.blk:f&&Math.abs(v-.22)<.05&&u>.12?[250,140,30]:!f&&r>.16?[252,160,30]:BF_C.blk,[200,170,60]],
  ['Homerus Swallowtail','Papilio homerus','two mountain forests in Jamaica',150,'swal',1,(u,v,f,r)=>r<.1?BF_C.blk:!f&&r<.22?BF_C.blu:Math.abs(u-.4)<.12&&r>.2?BF_C.gold:BF_C.blk,[60,50,40]],
  ["Schaus' Swallowtail",'Heraclides aristodemus ponceanus','the hammocks of the Florida Keys',100,'swal',1,(u,v,f,r)=>r<.1?BF_C.brn:Math.abs(u-.42+v*.2)<.06||!f&&r<.2&&r>.12?[236,206,90]:[60,44,34],[200,180,120]],
  ['Luzon Peacock Swallowtail','Papilio chikae','high mountain forest on Luzon, the Philippines',110,'swal',1,(u,v,f,r)=>!f&&r<.14&&r>.06?BF_C.red:r<.06?BF_C.blk:hash(u*90|0,v*90|0,301)<.35?[40,140,110]:[20,40,36],[40,40,40]],
  ['Corsican Swallowtail','Papilio hospiton','mountains of Corsica and Sardinia',75,'swal',1,(u,v,f,r)=>r<.1?BF_C.blk:!f&&bfNear(u,v,.1,-.6,.06)?BF_C.red:!f&&r<.2?BF_C.blu:f&&u<.25?BF_C.blk:[240,210,80],[220,200,110]],
  ['Kaiser-i-Hind','Teinopalpus imperialis','high forests of the eastern Himalaya',100,'swal',1,(u,v,f,r)=>r<.08?BF_C.blk:!f&&bfNear(u,v,.24,-.34,.12)?BF_C.gold:f&&Math.abs(u-.55)<.04?BF_C.blk:[80,170,90],[120,150,90]],
  ['Bhutan Glory','Bhutanitis lidderdalii','mountain forests of Bhutan and India',100,'bhut',1,(u,v,f,r)=>!f&&bfNear(u,v,.28,-.5,.1)?BF_C.red:!f&&bfNear(u,v,.22,-.48,.16)?BF_C.yel:Math.abs(Math.sin((u+v*.6)*26))<.25?[230,220,190]:BF_C.blk,[40,36,32]],
  ['Palos Verdes Blue','Glaucopsyche lygdamus palosverdesensis','one coastal hill in Los Angeles',25,'blue',1,(u,v,f,r)=>r<.12?[80,80,100]:[150,170,220],[200,200,210]],
  ['Miami Blue','Cyclargus thomasi bethunebakeri','a few islands of the Florida Keys',25,'blue',1,(u,v,f,r)=>r<.1?[50,50,70]:!f&&bfNear(u,v,.22,-.52,.05)?BF_C.blk:[80,140,240],[200,200,210]],
  ['Mission Blue','Icaricia icarioides missionensis',"San Francisco's hills, among the lupines",30,'blue',1,(u,v,f,r)=>r<.06?BF_C.wht:r<.14?[70,70,90]:[150,160,230],[210,210,220]],
  ['Karner Blue','Lycaeides melissa samuelis','pine barrens with wild lupine',25,'blue',1,(u,v,f,r)=>r<.06?BF_C.wht:r<.14?BF_C.blk:[120,110,220],[200,200,210]],
  ["Fender's Blue",'Icaricia icarioides fenderi',"Oregon's Willamette Valley prairies",28,'blue',1,(u,v,f,r)=>r<.12?BF_C.blk:[90,170,250],[210,210,210]],
  ['Sinai Baton Blue','Pseudophilotes sinaicus','round Mount Sinai only; among the smallest',12,'blue',1,(u,v,f,r)=>r<.14?[90,70,60]:[110,130,220],[200,200,200]],
  ['Large Blue','Phengaris arion','sunny grassland in Europe; its caterpillars live with ants',40,'blue',1,(u,v,f,r)=>r<.1?[60,60,80]:f&&[[.42,.2],[.55,.28],[.5,.1]].some(([a,b])=>bfNear(u,v,a,b,.04))?BF_C.blk:[110,140,220],[190,190,200]],
  ["Lange's Metalmark",'Apodemia mormo langei','the Antioch Dunes, California',30,'nym',1,(u,v,f,r)=>((u*14|0)+(v*14|0))%3===0&&r>.1?BF_C.wht:u<.3?[200,70,40]:BF_C.blk,[200,180,170]],
  ['Island Marble','Euchloe ausonides insulanus','one island in the San Juans, Washington',40,'pier',1,(u,v,f,r)=>f&&u>.7&&v>.2?((u*30|0)%2?[60,60,60]:BF_C.wht):BF_C.wht,[150,180,120]],
  ['Uncompahgre Fritillary','Boloria acrocnema','two Colorado mountain tops over 13,000 feet',30,'nym',1,(u,v,f,r)=>r<.1?BF_C.dk:((u*12|0)+(v*12|0))%3===0?BF_C.dk:[200,120,60],[180,120,90]],
  ["Saint Francis' Satyr",'Neonympha mitchellii francisci','wet meadows of one army base in North Carolina',40,'nym',1,(u,v,f,r)=>r>.04&&r<.2&&((u*9|0)%2)&&(!f||u>.5)?(r>.06&&r<.13?BF_C.blk:[226,150,60]):r<.05?[70,50,36]:[100,74,52],[130,100,70]],
  ['Apollo','Parnassius apollo','mountain meadows of Europe and Asia',75,'pier',1,(u,v,f,r)=>{ const eye=!f&&[[.22,-.24],[.36,-.42]].find(([a,b])=>bfNear(u,v,a,b,.075)); if(eye)return bfNear(u,v,eye[0],eye[1],.045)?BF_C.red:BF_C.blk;
    return f&&[[.45,.3],[.62,.22],[.3,.14]].some(([a,b])=>bfNear(u,v,a,b,.05))?BF_C.blk:f&&r<.12?[196,198,196]:[244,242,236]; },[236,232,220]]];

function bfPic(k,w,pose){ '@later'; const [,,,,sh,,pat,under]=BF_KINDS[k], hs=w/2, ys=.72;
  if(pose===2){ const W=Math.max(3,Math.round(hs*1.25)), h=Math.max(3,Math.round(hs*1.05)+1), oy=h-1, px=new Array(W*h).fill(null);
    for(let y=0;y<h;y++)for(let x=0;x<W;x++){ const a=(x+.5-W*.45)/hs, b=(oy-(y+.5))/hs;
      if(y===oy&&Math.abs(a)<.42){ px[y*W+x]=a>.34?[40,34,30]:[30,26,24]; continue; }
      const q=bfWing(sh,b,a); if(q)px[y*W+x]=q.rim<.07?under.map(v=>v*.62|0):q.fore?under:under.map(v=>v*.88|0); }
    return {w:W,h,oy,px}; }
  const xs=pose===0?1:.56, h=Math.max(3,Math.round(1.78*hs*ys)+1), oy=Math.round(.78*hs*ys), px=new Array(w*h).fill(null);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const X=(x+.5-w/2)/hs, Y=(oy-(y+.5))/hs/ys;
    if(Math.abs(X)<.07&&Y<.38&&Y>-.5){ px[y*w+x]=Y>.3?[40,34,30]:[30,26,24]; continue; }
    const u=Math.abs(X)/xs, q=bfWing(sh,u,Y); if(!q)continue; let c=pat(u,Y,q.fore,q.rim); if(q.rim<.04)c=c.map(v=>v*.55|0); px[y*w+x]=pose===1?c.map(v=>v*.82|0):c; }
  if(hs>=6)for(let i=1;i<=Math.round(hs*.45);i++)for(const sx of [-1,1]){ const x=Math.round(w/2-.5+sx*i*.5), y=oy-Math.round(hs*ys*.3)-i; if(y>=0&&x>=0&&x<w&&!px[y*w+x])px[y*w+x]=[34,28,26]; }
  return {w,h,oy,px}; }

const bfSpan=k=>Math.max(12,Math.round(BF_KINDS[k][3]/35*4));
