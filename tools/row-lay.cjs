// THE MAP'S ROWS as they stand (the 8 Nov 2026 layout: Market St's row facing the park, THE TOWER on its west corner, the bodega and the arcade either side of the way through, the bank and the art museum at the east end; the Hudson row behind it facing the river, the fish market and the two flea market lots by the way through; the bath house in the park): writes them into data/world.json in this order. Run: node tools/row-lay.cjs (on today's map it changes nothing). It also checks that each keeper stands at their place's door and that the fish market's stalls are on its lot, and says what is off; node tools/row-lay.cjs --fix puts them there. block.pf (the spans the street's garages leave alone) is not touched.
const fs=require('fs'), F=__dirname+'/../data/world.json', W=JSON.parse(fs.readFileSync(F,'utf8')), r2=v=>+v.toFixed(2), FIX=process.argv.includes('--fix');
// every place on the map, in the file's order: the way through and the subway stairs, Market St's row west to east, the Hudson row west to east, then the park's
const PLACES=[
  {"id":"hudson","name":"TO THE HUDSON","kind":"passage","x0":107.63,"x1":116.37},
  {"id":"subway","name":"SUBWAY STAIRS","kind":"stairs","x0":-51.9,"x1":-47.9},
  {"id":"apts","name":"THE TOWER","kind":"front","x0":-47,"x1":-17,"y0":-92.4,"y1":-77,"face":"n"},
  {"id":"bar","name":"THE BAR","kind":"front","x0":3.21,"x1":21.21,"y0":-92.4,"y1":-77,"face":"n","pf":"bar","inW":17,"inD":26,"inH":172},
  {"id":"pets","name":"THE PET STORE","kind":"front","x0":41.42,"x1":61.42,"merchant":"aquarium_service_technician","lot":true,"y0":-92.4,"y1":-77,"face":"n"},
  {"id":"bodega","name":"THE BODEGA","kind":"front","x0":94.5,"x1":107.63,"y0":-92.4,"y1":-77,"face":"n","pf":"bodega"},
  {"id":"arcade","name":"THE ARCADE","kind":"front","x0":116.37,"x1":129.5,"y0":-92.4,"y1":-77,"face":"n","pf":"bodega"},
  {"id":"theatre","name":"THE MOVIE THEATRE","kind":"front","x0":138.3,"x1":158.3,"y0":-92.4,"y1":-77,"face":"n","pf":"theatre"},
  {"id":"play","name":"THE PLAYHOUSE","kind":"front","x0":162.22,"x1":182.22,"y0":-92.4,"y1":-77,"face":"n","pf":"playhouse"},
  {"id":"gym","name":"KNUCKLE & IRON","kind":"front","x0":186.15,"x1":202.15,"lot":true,"inW":22,"inD":17,"inH":130,"y0":-92.4,"y1":-77,"face":"n"},
  {"id":"bank","name":"THE BANK","kind":"front","x0":206.07,"x1":226.07,"y0":-92.4,"y1":-77,"face":"n"},
  {"id":"art","name":"THE ART MUSEUM","kind":"front","x0":230.0,"x1":252.0,"y0":-92.4,"y1":-77,"face":"n"},
  {"id":"antiques","kind":"front","x0":-51,"x1":-37,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"name":"ANTIQUES & PAWN","pf":"antiques"},
  {"id":"fishtables","kind":"lot","x0":57.01,"x1":77.01,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"name":"THE FISH MARKET","fence":"barbed"},
  {"id":"flea","kind":"lot","x0":77.01,"x1":107.63,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"name":"THE FLEA MARKET"},
  {"id":"flea2","kind":"lot","x0":116.37,"x1":146.99,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"name":"THE FLEA MARKET"},
  {"id":"fishing","kind":"front","x0":146.99,"x1":170.99,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"name":"FISHING & SCUBA","merchant":"fisherman_in_waders","pf":"outfitter"},
  {"id":"armor","kind":"front","x0":182.49,"x1":194.49,"name":"THE ARMOURY","merchant":"samurai_warrior","lot":true,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"pf":"florist"},
  {"id":"skate","kind":"front","x0":206.0,"x1":218.0,"name":"THE SKATE SHOP","merchant":"skate_shop_owner","lot":true,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"pf":"florist"},
  {"id":"books","name":"THE BOOKSTORE","kind":"front","x0":229.5,"x1":250.5,"merchant":"professor","at":[-2.4,9.62],"inW":16,"inD":10,"inH":100,"y0":-107.9,"y1":-95.9,"face":"s","row":2,"pf":"books"},
  {"id":"bath","name":"THE BATH HOUSE","kind":"front","x0":25,"x1":48.53,"y0":-34,"y1":-22.45,"face":"s","park":true}
];
W.places=PLACES.map(p=>({...p}));
const B=W.block, BR=B.backrow, at=Object.fromEntries(W.places.map(p=>[p.id,p])), off=[];
// keepers stand at their place's door
for(const [id,h] of Object.entries(W.homes||{})){ const k=h[3]; if(!k)continue; const p=at[k]; if(!p){ off.push(id+': its place '+k+' is gone'); if(FIX)delete W.homes[id]; continue; } if(p.face==='e'||p.park)continue;
  const want=[r2((p.x0+p.x1)/2),r2(p.row===2?BR[0]-2.4:B.front+2.4)]; if(h[0]!==want[0]||h[1]!==want[1]){ off.push(id+' stands at '+h[0]+','+h[1]+', its door ('+k+') is at '+want.join(',')); if(FIX)W.homes[id]=[...want,h[2],k]; } }
// the fish market's stalls, tables and crates spread across its lot, wherever the lot is
{ const L=at.fishtables, FT=new Set(['mstall','ftable','scrate','sacks']), T=(W.things||[]).filter(t=>FT.has(t.k)&&t.y<B.alley[0]&&t.y>BR[0]);
  if(L&&T.length){ const a=Math.min(...T.map(t=>t.x)), b=Math.max(...T.map(t=>t.x)), m=1.8, k=(b-a)>0?Math.min(1,(L.x1-L.x0-2*m)/(b-a)):1, c=(L.x0+L.x1)/2, c0=(a+b)/2;
    if(a<L.x0||b>L.x1){ off.push('the fish market\'s '+T.length+' stalls stand at x '+a+'..'+b+', its lot is '+L.x0+'..'+L.x1); if(FIX)for(const t of T)t.x=r2(c+(t.x-c0)*k); } } }
fs.writeFileSync(F,JSON.stringify(W,null,1)+'\n');
console.log(W.places.length+' places written'+(off.length?'\n'+(FIX?'put right: ':'off (node tools/row-lay.cjs --fix puts them right): ')+'\n  '+off.join('\n  '):''));
