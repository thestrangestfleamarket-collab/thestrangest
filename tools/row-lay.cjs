// THE NEW MAP'S ROWS (owner, 6 Nov 2026, "the new map" in docs/HISTORY.md): lays Market St's row (facing the park) and the Hudson row behind it (facing the river) in data/world.json, lot for lot, either side of the one way through to the Hudson, which lines up with the park's gate. Run: node tools/row-lay.cjs
const fs=require('fs'), F=__dirname+'/../data/world.json', W=JSON.parse(fs.readFileSync(F,'utf8')), r2=v=>+v.toFixed(2);
const P=Object.fromEntries(W.places.map(p=>[p.id,p]));
const X0=W.streets.west.x0, X1=W.park.x1-10, GATE=(W.parkPlaces&&W.parkPlaces.round?W.parkPlaces.round.x:112), PASS=22/.84;   // the row runs from West St's corner to the park's east end; the way through is 22 m, centred on the park gate
const PX0=r2(GATE-PASS/2), PX1=r2(GATE+PASS/2);
// [id, name, weight (its share of the row), merchant]: Market St's row west to east, each side of the way through
const MW=[['florist','THE FLORIST',1,'tomato'],['bees','THE BEEKEEPER',1,'village_gardener'],['bfly','THE BUTTERFLY SHOP',1,'park_ranger'],['birds','THE BIRD SHOP',1,'forest_ranger'],['pets','THE PET STORE',1],['mush','THE MUSHROOM SHOP',1,'mushroom'],['bath',null,1]];
const ME=[['bodega',null,1],['gems','THE GEM SHOP',1,'scuba_diver'],['armor','THE ARMOURY',1,'samurai_warrior'],['clothes','THE CLOTHES SHOP',1],['skate','THE SKATE SHOP',1,'skate_shop_owner'],['diner','THE DINER',2]];
// the Hudson row behind them, lot for lot (each place takes most of its lot, a shut garage the rest)
const HW=['bank','hotel','bar','theatre','play','art','fishtables'], HE=['fishing','books','arcade','tailor','barber','flea'];
const HN={fishtables:'THE FISH MARKET',fishing:'FISHING & SCUBA',flea:'THE FLEA MARKET'}, HM={fishing:'fisherman_in_waders'}, HLOT={fishtables:1,flea:1};
const lay=(L,a,b)=>{ const s=L.reduce((t,r)=>t+r[2],0), out=[]; let x=a; for(const r of L){ const w=(b-a)*r[2]/s; out.push([r,r2(x),r2(x+w)]); x+=w; } return out; };
const KEEP=new Set(['apts','subway','hudson']); for(const k in P)if(/^house\d/.test(k))KEEP.add(k);
const out=[]; for(const id of KEEP)if(P[id])out.push(P[id]);
const set=(id,o)=>{ const p=Object.assign(P[id]?{...P[id]}:{id,kind:'front'},o); for(const k of ['y0','y1','face','lot','pf'])if(o[k]===undefined&&!(k in o))delete p[k]; out.push(p); return p; };
P.hudson&&Object.assign(P.hudson,{x0:PX0,x1:PX1});
const MR=[...lay(MW,X0,PX0),...lay(ME,PX1,X1)], BR=W.block.backrow, spans=[];
for(const [[id,name,,who],x0,x1] of MR){ const o={x0,x1,lot:true}; if(name)o.name=name; if(who)o.merchant=who; if(id==='bath'||id==='bodega')delete o.lot; set(id,o); }
const HL=[...HW.map((id,i)=>[id,MR[i]]),...HE.map((id,i)=>[id,MR[MW.length+i]])];
for(const [id,[,x0,x1]] of HL){ const last=id==='fishtables'||id==='fishing'||id==='flea', g=last?0:(x1-x0)*.28, a=x0<PX0?x0+g:x0, b=x0<PX0?x1:x1-g;   // the garage on the side away from the way through
  const o={x0:r2(a),x1:r2(b),y0:BR[0],y1:BR[1],face:'s',row:2}; if(HN[id])o.name=HN[id]; if(HM[id])o.merchant=HM[id]; if(HLOT[id])o.kind='lot'; set(id,o); if(id!=='bar')spans.push([r2(a),r2(b)]); }   // the bar is shut until its new inside (job 7): garages stand on its lot
// West St: the bar has left its corner, so the houses close up behind the apartment house, a small gap between each (5 Nov 2026)
{ const H=out.filter(p=>/^house\d+$/.test(p.id)).sort((a,b)=>a.y0-b.y0); let y=P.apts.y1+1.2; for(const h of H){ const d=h.y1-h.y0; h.y0=r2(y); h.y1=r2(y+d); y+=d+1.2; } }
W.places=out; W.block.pf={2:spans};
// keepers whose home names a place that is gone stand nowhere special now; a keeper whose home names a moved place stands at its new door
const at=Object.fromEntries(out.map(p=>[p.id,p]));
for(const [id,h] of Object.entries(W.homes)){ const k=h[3]; if(!k)continue; if(!at[k]){ delete W.homes[id]; continue; } const p=at[k]; if(p.y1==null)W.homes[id]=[r2((p.x0+p.x1)/2),r2(W.block.front+2.4),h[2],k]; }
fs.writeFileSync(F,JSON.stringify(W,null,1)+'\n');
console.log('way through',PX0,PX1,'\nMarket St:',MR.map(([r,a,b])=>r[0]+' '+a+'..'+b).join(' | '),'\nHudson:',HL.map(([id])=>id+' '+at[id].x0+'..'+at[id].x1).join(' | '));
