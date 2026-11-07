// THE MAP'S ROWS (owner, 7 Nov 2026, the map moved again, mockups/newmap2.svg; then the bodega and the bath house to the Hudson): lays Market St's row (facing the park: the bank on the West St corner, the art museum and brick shops, the diner on the east corner) and the Hudson row behind it (facing the river: small Polyfork shops, the fish market, and the two empty lots for the player flea market either side of the way through), and puts the apartment houses back up West St, in data/world.json. Run: node tools/row-lay.cjs
const fs=require('fs'), F=__dirname+'/../data/world.json', W=JSON.parse(fs.readFileSync(F,'utf8')), r2=v=>+v.toFixed(2), M=1/.84;
const P=Object.fromEntries(W.places.map(p=>[p.id,p])), K=JSON.parse(fs.readFileSync(__dirname+'/../data/street.json','utf8')), pw=k=>K[k].size[0]*M;
const X0=W.streets.west.x0, X1=W.park.x1-10, GATE=(W.parkPlaces&&W.parkPlaces.round?W.parkPlaces.round.x:112), PASS=22/.84/3;
const PX0=r2(GATE-PASS/2), PX1=r2(GATE+PASS/2), B=W.block, BR=B.backrow, SUB=[X0+.6,X0+4.6];
// a run of [row, width] from a to b, a gap between each, the widths grown to fill it
const run=(L,a,b,gap)=>{ const n=L.length, tot=L.reduce((t,r)=>t+r[1],0), k=(b-a-gap*(n+1))/tot; let x=a+gap; return L.map(r=>{ const w=r[1]*k, o=[r[0],r2(x),r2(x+w)]; x+=w+gap; return o; }); };
const out=[], set=(id,o)=>{ const p={...(P[id]||{id,kind:'front'}),...o}; for(const k of ['y0','y1','face','lot','pf','row','fence'])if(!(k in o))delete p[k]; out.push(p); return p; };
set('hudson',{x0:PX0,x1:PX1});
if(P.subway)set('subway',{x0:r2(SUB[0]),x1:r2(SUB[1])});   // the subway stairs at Market St's west end, by the bodega
// the apartment houses up West St, facing the park (as on 6 Nov 2026)
{ const O=JSON.parse(process.env.APTS_FROM?fs.readFileSync(process.env.APTS_FROM,'utf8'):'null'), OP=O?Object.fromEntries(O.places.map(p=>[p.id,p])):null;
  for(const id of ['apts','house1','house2','house3','house4','house5','house6']){ const q=OP&&OP[id]||P[id]; if(q)set(id,{name:q.name,x0:q.x0,x1:q.x1,y0:q.y0,y1:q.y1,face:q.face||'e'}); } }
// Market St's row: brick fronts (the merchants' shops are lots of their own), the bodega and the bath house their own builders
const MW=[['bank',1.3],['art',1.4],['florist',1],['bees',1],['bfly',1],['birds',1],['pets',1],['mush',1]], ME=[['gems',1],['armor',1],['clothes',1],['skate',1],['diner',1.8]];
const NM={florist:['THE FLORIST','tomato'],bees:['THE BEEKEEPER','village_gardener'],bfly:['THE BUTTERFLY SHOP','park_ranger'],birds:['THE BIRD SHOP','forest_ranger'],pets:['THE PET STORE','aquarium_service_technician'],mush:['THE MUSHROOM SHOP','mushroom'],
  gems:['THE GEM SHOP','scuba_diver'],armor:['THE ARMOURY','samurai_warrior'],clothes:['THE CLOTHES SHOP','valet_attendant'],skate:['THE SKATE SHOP','skate_shop_owner'],diner:['THE DINER','diner_waitress']};
const MR=[...run(MW,SUB[1]+1,PX0,0),...run(ME,PX1,X1,0)];
for(const [id,x0,x1] of MR){ const o={x0,x1}; if(id==='bank'||id==='art'){ o.y0=B.back; o.y1=B.front; Object.assign(o,id==='art'?{pf:'bank',pfsc:1.25,pfbox:[17.86,15.66,2.2]}:{pf:'hotel',pfsc:1.25,pfbox:[11.9,11.6,3.3],pfcut:[[-5,-1,3.2,5,5.2,6]],pfsign:{t:'BANK',at:[0,9.35,3.05],w:4.92,h:.62}}); } if(NM[id]){ o.name=NM[id][0]; o.merchant=NM[id][1]; o.lot=true; } set(id,o); }
// the Hudson row: small Polyfork shops (each its model's width, grown to fill), the fish market's lot, and the two empty lots for the player flea market by the way through
const HW=[['hotel','hotel','THE HOTEL','front_desk_clerk'],['bar','bar','THE BAR'],['theatre','theatre'],['play','playhouse'],['antiques','antiques','ANTIQUES & PAWN'],['outfitter','outfitter','THE OUTFITTER'],['bath','bath'],['fishtables',null,'THE FISH MARKET',null,11],['flea',null,'THE FLEA MARKET',null,10]];
const HE=[['flea2',null,'THE FLEA MARKET',null,10],['bodega','bodega'],['fishing','outfitter','FISHING & SCUBA','fisherman_in_waders'],['books','books','THE BOOKSTORE'],['arcade','arcade','THE ARCADE'],['tailor','tailor','THE TAILOR','doorman'],['barber','barber','THE BARBER','lounge_crooner']];
const HR=[...run(HW.map(r=>[r,r[1]?pw(r[1]):r[4]]),X0,PX0,1.5),...run(HE.map(r=>[r,r[1]?pw(r[1]):r[4]]),PX1,X1,1.5)], spans=[];
for(const [[id,pf,name,who],x0,x1] of HR){ const o={x0,x1,y0:BR[0],y1:BR[1],face:'s',row:2}; if(name)o.name=name; if(who)o.merchant=who; if(!pf){ o.kind='lot'; if(id==='fishtables')o.fence='barbed'; } else { o.kind='front'; o.pf=pf; spans.push([x0,x1]); } set(id,o); }
W.places=out; W.block.pf={2:spans};
// the fish market's stalls, tables and crates spread across its lot, wherever the lot is
{ const L=out.find(p=>p.id==='fishtables'), FT=new Set(['mstall','ftable','scrate','sacks']), T=(W.things||[]).filter(t=>FT.has(t.k)&&t.y<B.alley[0]&&t.y>BR[0]);
  if(L&&T.length){ const a=Math.min(...T.map(t=>t.x)), b=Math.max(...T.map(t=>t.x)), m=1.8, k=(b-a)>0?Math.min(1,(L.x1-L.x0-2*m)/(b-a)):1, c=(L.x0+L.x1)/2, c0=(a+b)/2; for(const t of T)t.x=r2(c+(t.x-c0)*k); } }
// keepers stand at their place's door
const at=Object.fromEntries(out.map(p=>[p.id,p]));
for(const [id,h] of Object.entries(W.homes)){ const k=h[3]; if(!k)continue; if(!at[k]){ delete W.homes[id]; continue; } const p=at[k]; if(p.face==='e')continue; const hud=p.row===2; W.homes[id]=[r2((p.x0+p.x1)/2),r2(hud?BR[0]-2.4:B.front+2.4),h[2],k]; }
fs.writeFileSync(F,JSON.stringify(W,null,1)+'\n');
console.log('way through',PX0,PX1,'\nMarket St:',MR.map(([id,a,b])=>id+' '+a+'..'+b).join(' | '),'\nHudson:',HR.map(([[id],a,b])=>id+' '+a+'..'+b).join(' | '));
