// THE MAP'S ROWS (owner, 7 Nov 2026, "only market st"): lays Market St's row (facing the park: the bank, the art museum and the seven apartment houses) and the Hudson row behind it (facing the river: every shop, small Polyfork buildings filling it end to end, the two lots) in data/world.json, either side of the way through to the Hudson (a third as wide as before, on the park's gate). Run: node tools/row-lay.cjs
const fs=require('fs'), F=__dirname+'/../data/world.json', W=JSON.parse(fs.readFileSync(F,'utf8')), r2=v=>+v.toFixed(2), M=1/.84;
const P=Object.fromEntries(W.places.map(p=>[p.id,p])), K=JSON.parse(fs.readFileSync(__dirname+'/../data/street.json','utf8')), pw=k=>K[k].size[0]*M;
const X0=W.streets.west.x0, X1=W.park.x1-10, GATE=(W.parkPlaces&&W.parkPlaces.round?W.parkPlaces.round.x:112), PASS=22/.84/3;
const PX0=r2(GATE-PASS/2), PX1=r2(GATE+PASS/2), B=W.block, BR=B.backrow, SUB=[X0+.6,X0+4.6];
// a run of [id, width, extra] from a to b: a gap between each, the widths grown to fill it (fill) or kept (keep, the gaps spread)
const run=(L,a,b,gap,fill)=>{ const n=L.length, tot=L.reduce((t,r)=>t+r[1],0), k=fill?(b-a-gap*(n+1))/tot:1, g=fill?gap:(b-a-tot)/(n+1); let x=a+g; return L.map(r=>{ const w=r[1]*k, o=[r,r2(x),r2(x+w)]; x+=w+g; return o; }); };
const out=[], set=(id,o)=>{ const p={...(P[id]||{id,kind:'front'}),...o}; for(const k of ['y0','y1','face','lot','pf','row','fence','merchant','name'])if(!(k in o)&&k!=='name'&&k!=='merchant')delete p[k]; out.push(p); return p; };
// the way through
set('hudson',{x0:PX0,x1:PX1});
// the subway stairs at Market St's west end (the second entrance, at the east end, comes with the station: owner, 7 Nov 2026)
if(P.subway)set('subway',{x0:r2(SUB[0]),x1:r2(SUB[1])});
// Market St: the bank, the art museum, then the apartment houses (today's brownstone, two flats a floor), fronts on the street
const HW=28.6, HOUSE=i=>i?'house'+i:'apts', HNAME=i=>i?'APARTMENTS '+(i+1):'APARTMENTS';
const MWEST=[['bank',12*M],['art',16*M],[HOUSE(0),HW],[HOUSE(1),HW],[HOUSE(2),HW]], MEAST=[[HOUSE(3),HW],[HOUSE(4),HW],[HOUSE(5),HW],[HOUSE(6),HW]];
const MR=[...run(MWEST,SUB[1]+1,PX0,0,false),...run(MEAST,PX1,X1,0,false)];
for(const [[id],x0,x1] of MR){ if(/^(apts|house\d)$/.test(id))set(id,{x0,x1,y0:B.back,y1:B.front,name:HNAME(id==='apts'?0:+id.slice(5))}); else set(id,{x0,x1,y0:B.back,y1:B.front,...(id==='art'?{pf:'bank',pfsc:1.25}:{})}); }
// the Hudson row: every other shop, a small Polyfork building each (its model's width, grown to fill), the two lots; doors on the promenade
const HWEST=[['florist','florist','THE FLORIST','tomato'],['bees','barber','THE BEEKEEPER','village_gardener'],['bfly','tailor','THE BUTTERFLY SHOP','park_ranger'],['birds','bar','THE BIRD SHOP','forest_ranger'],['pets','pets','THE PET STORE','aquarium_service_technician'],['mush','barber','THE MUSHROOM SHOP','mushroom'],['bath','bath'],['hotel','hotel','THE HOTEL','front_desk_clerk'],['bar','bar','THE BAR'],['theatre','theatre'],['play','playhouse'],['antiques','antiques','ANTIQUES & PAWN'],['fishtables',null,'THE FISH MARKET',null,13]];
const HEAST=[['fishing','outfitter','FISHING & SCUBA','fisherman_in_waders'],['outfitter','outfitter','THE OUTFITTER'],['bodega','bodega'],['gems','tailor','THE GEM SHOP','scuba_diver'],['armor','antiques','THE ARMOURY','samurai_warrior'],['clothes','outfitter','THE CLOTHES SHOP','valet_attendant'],['skate','arcade','THE SKATE SHOP','skate_shop_owner'],['books','books','THE BOOKSTORE'],['arcade','arcade','THE ARCADE'],['tailor','tailor','THE TAILOR','doorman'],['barber','barber','THE BARBER','lounge_crooner'],['diner','fishmarket','THE DINER','diner_waitress'],['flea',null,'THE FLEA MARKET',null,20]];
const HR=[...run(HWEST.map(r=>[r,r[1]?pw(r[1]):r[4]]),X0,PX0,1.5,true),...run(HEAST.map(r=>[r,r[1]?pw(r[1]):r[4]]),PX1,X1,1.5,true)], spans=[];
for(const [[[id,pf,name,who]],x0,x1] of HR){ const o={x0,x1,y0:BR[0],y1:BR[1],face:'s',row:2}; if(name)o.name=name; if(who)o.merchant=who; if(!pf){ o.kind='lot'; if(id==='fishtables')o.fence='barbed'; } else { o.kind='front'; o.pf=pf; spans.push([x0,x1]); } set(id,o); }
W.places=out; W.block.pf={2:spans};
// keepers whose home names a place that is gone stand nowhere special now; a keeper whose home names a moved place stands at its new door
const at=Object.fromEntries(out.map(p=>[p.id,p]));
for(const [id,h] of Object.entries(W.homes)){ const k=h[3]; if(!k)continue; if(!at[k]){ delete W.homes[id]; continue; } const p=at[k], hud=p.row===2; W.homes[id]=[r2((p.x0+p.x1)/2),r2(hud?BR[0]-2.4:B.front+2.4),h[2],k]; }
fs.writeFileSync(F,JSON.stringify(W,null,1)+'\n');
console.log('way through',PX0,PX1,'\nMarket St:',MR.map(([r,a,b])=>r[0]+' '+a+'..'+b).join(' | '),'\nHudson:',HR.map(([[r],a,b])=>r[0]+' '+a+'..'+b).join(' | '));
