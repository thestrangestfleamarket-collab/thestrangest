// MARKET ST'S ROW (owner, 5 Nov 2026): lays the south row's places in data/world.json west to east from a list, a shut garage building in every gap; West St gets a line of apartment houses. Widths are the kit buildings' real metres (a map unit is 0.84 m); the bath house, the Hudson passage, the subway stairs and the bodega keep their spots. Run: node tools/row-lay.cjs
const fs=require('fs'), F=__dirname+'/../data/world.json', W=JSON.parse(fs.readFileSync(F,'utf8')), U=m=>+(m/.84).toFixed(2), r2=v=>+v.toFixed(2);
const P=Object.fromEntries(W.places.map(p=>[p.id,p])), keep=['bath','hudson','subway','bodega'];
const X0=W.streets.west.x0, X1=W.park.x1-10;   // the walkable row: from West St's corner to 8 tiles short of the park's east wall (the corner, 18 Oct 2026)
// the row's fronts in order, each its width in map units (the old shops keep their own) and the Polyfork front that stands on it (data/street.json)
const WEST=[['bar',P.bar.x1-P.bar.x0],['art',30],['bank',P.bank.x1-P.bank.x0],['theatre',14],['play',14],['arcade',14]];
const EAST=[['florist',U(8),'THE FLORIST','florist'],['tailor',U(4),'THE TAILOR','tailor'],['barber',U(4),'THE BARBER','barber'],['outfitter',U(10),'THE OUTFITTER','outfitter'],['fishmarket',U(8.85),'THE FISH MARKET','fishmarket'],['books',P.books.x1-P.books.x0],['pets',U(8.85),'THE PET STORE','pets'],['antiques',U(8),'ANTIQUES & PAWN','antiques'],['hotel',U(8),'THE HOTEL','hotel']];   // the bookstore keeps its own painted front and width
const fixed=keep.map(k=>P[k]), fx0=Math.min(...fixed.map(p=>p.x0)), fx1=Math.max(...fixed.map(p=>p.x1));
const sum=L=>L.reduce((s,r)=>s+r[1],0), gapWest=r2((fx0-X0-sum(WEST))/WEST.length), gapEast=r2((X1-fx1-sum(EAST))/EAST.length);   // the same gap after every front on each side of the bath house and the bodega, a garage in each
const lay=(L,x0,gapW)=>{ let x=x0; for(const [id,w,name,pf] of L){ const p=P[id]||(P[id]={id,name,kind:'front'}); delete p.y0; delete p.y1; delete p.face; p.x0=r2(x); p.x1=r2(x+w); p.lot=true; if(pf)p.pf=pf; if(name)p.name=name; x+=w+gapW; } return x; };
lay(WEST,X0,gapWest); lay(EAST,fx1+gapEast,gapEast);
for(const id of ['play','theatre','arcade','bank'])delete P[id].lot;   // these four are the block's own lots (006-map-pre)
delete P.museum; delete P.apts.lot;
// West St: the apartment house where it is, then ten Polyfork houses up the street with a small gap between them
const H=P.apts, hw=U(16), hd=U(12), gap=1.2, cw=['apt_red','apt_brown','apt_sand','apt_grey']; let y=H.y1+gap, n=0; for(const k in P)if(/^house\d/.test(k))delete P[k];
while(y+hw<=W.sections.grid.y0+W.sections.grid.h-2&&n<10){ n++; P['house'+n]={id:'house'+n,name:'APARTMENTS '+(n+1),kind:'front',x0:r2(X0-hd),x1:X0,y0:r2(y),y1:r2(y+hw),face:'e',pf:cw[n%4]}; y+=hw+gap; }
W.places=Object.values(P); W.block.x0=-100; W.block.x1=252; W.block.pf={};   // the Drive's buildings' spans are gone with them (archived 5 Nov 2026)
for(const [id,h] of Object.entries(W.homes)){ const k=h[3]; if(k&&P[k]&&P[k].y1==null){ const p=P[k]; W.homes[id]=[r2((p.x0+p.x1)/2),r2(W.block.front+2.4),h[2],k]; } }   // a keeper whose home names a moved place stands at its new door
fs.writeFileSync(F,JSON.stringify(W,null,1)+'\n');
console.log('gaps',gapWest,gapEast,'houses',n,'row:',W.places.filter(p=>p.y1==null).sort((a,b)=>a.x0-b.x0).map(p=>p.id+' '+p.x0+'..'+p.x1).join(' | '));
