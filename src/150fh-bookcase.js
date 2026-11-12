// THE BOOKSHELF: one big walnut bookcase in every apartment from the start (owner, 9 and 12 Nov 2026: "1 big book case with real books inside - pick the most popular interesting ones from bookstore"), three bays and six shelves of the bookstore's MOST READ; double-click it to browse them by genre, read one in the bookstore's reader, take one off the shelf into your pack and put it back.
import {THREE} from './003-shx.js';
import {FORAGE, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {LIB} from './144ca-library.js';
import {ROOMK} from './150a-bedroom.js';
{ ROOMK.always.add('BOOKSHELF');
  const BK={W:3.12,H:2.66,D:.38,SD:.04,EACH:5,ROWS:6,BAYS:3,DV:.03,SH:[.125,.535,.945,1.355,1.765,2.175]};   // metres: the case, its sides, its three bays and the boards between them, its six shelves' tops
  BK.IN=BK.W-2*BK.SD; BK.BW=(BK.IN-(BK.BAYS-1)*BK.DV)/BK.BAYS; BK.FZ=BK.D/2-.035;
  const hsh=s=>{ let h=2166136261; for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0; return h; };
  // which books: a few from every genre the bookstore shelves, the same few in every home, in genre order down the case
  let IDS=null; const ids=()=>{ if(IDS||!LIB.data)return IDS||[]; const seen=new Set(); IDS=[]; for(const c of LIB.data.cases)if(/^popular/.test(c.id))for(const b of c.books)if(!seen.has(b.id)){ seen.add(b.id); IDS.push(b.id); } return IDS; };   // the bookstore's three MOST READ cases, the same in every home
  const rowsOf=()=>{ const L=ids().map(i=>LIB.by[i]), n=Math.ceil(L.length/BK.ROWS), per=Math.ceil(n/BK.BAYS);   // read from the top shelf down, bay by bay
    return Array.from({length:BK.ROWS},(_,r)=>{ const row=L.slice((BK.ROWS-1-r)*n,(BK.ROWS-r)*n), out=[]; for(let b=0;b<BK.BAYS;b++){ const seg=row.slice(b*per,(b+1)*per); if(!seg.length)continue; const cx=-BK.IN/2+BK.BW/2+b*(BK.BW+BK.DV); for(const o of LIB.layRow(seg,BK.BW))out.push({...o,x:o.x+cx}); } return out; }); };
  const live=new Set();   // the cases standing now ({sp, un}): taking a book off empties its place in each
  const off=()=>LIB.S.h||(LIB.S.h=[]);
  const refresh=()=>{ for(const L of live){ if(!L.un.obj.parent){ live.delete(L); continue; } L.sp.skip(off()); } };
  const HOME={name:'YOUR BOOKSHELF',ids,off:id=>off().includes(id),
    take:id=>{ '@later'; if(off().includes(id))return; off().push(id); LIB.save(); FORAGE.give('hb_'+id,1); if(FORAGE.draw)FORAGE.draw(); refresh(); SAY('OFF THE SHELF: '+LIB.by[id].t+'. READ IT ANYWHERE FROM YOUR PACK.','#e8d6a8'); if(SFX)SFX.play('page',{vol:.5}); },
    put:id=>{ '@later'; if(!off().includes(id))return; LIB.S.h=off().filter(x=>x!==id); LIB.save(); if(FORAGE.has('hb_'+id))FORAGE.take('hb_'+id,FORAGE.has('hb_'+id)); if(FORAGE.draw)FORAGE.draw(); refresh(); SAY('BACK ON THE SHELF: '+LIB.by[id].t+'.','#e8d6a8'); if(SFX)SFX.play('page',{vol:.4}); }};
  LIB.home=HOME;
  // walnut, its grain running up the boards, painted once
  let GT=null; const grain=()=>{ if(GT)return GT; const cv=document.createElement('canvas'); cv.width=128; cv.height=512; const g=cv.getContext('2d'); g.fillStyle='#6e4426'; g.fillRect(0,0,128,512);
    let s=11; const rnd=()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
    for(let i=0;i<70;i++){ const x=rnd()*128, w=.6+rnd()*2.2, a=.05+rnd()*.12; g.fillStyle=rnd()<.6?`rgba(40,22,10,${a})`:`rgba(150,100,60,${a})`; g.beginPath(); g.moveTo(x,0); for(let y=0;y<=512;y+=32)g.lineTo(x+Math.sin(y*.012+i)*3*rnd(),y); g.lineTo(x+w,512); g.lineTo(x+w,0); g.fill(); }
    GT=new THREE.CanvasTexture(cv); GT.colorSpace=THREE.SRGBColorSpace; GT.wrapS=GT.wrapT=THREE.RepeatWrapping; return GT; };
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid,Lx,Ly}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast);
    const U0=Lx-BK.D/2-.05, V0=Ly*.36, RY=-Math.PI/2;   // on the living room's east wall between its two front windows, facing into the room
    cap('BOOKSHELF',()=>{ const g=new THREE.Group(); g.position.set(U0,0,V0); g.rotation.y=RY; cur().add(g);
      const t=grain(), wood=mat([255,255,255],{map:t}), woodD=mat([150,120,100],{map:t}), back=mat([92,62,40]), brass=mat([196,160,82]);
      const {W,H,D,SD,IN,SH}=BK, Z=D/2;
      for(const s of [-1,1]){ p(rbox(SD,H-.08,D,.006),wood,s*(W/2-SD/2),(H-.08)/2,0,0,g); p(rbox(.05,H-.1,.02,.006),wood,s*(W/2-.025),(H-.1)/2+.02,Z+.005,0,g); }   // the sides and their face stiles
      p(rbox(IN,H-.14,.012,.003),back,0,(H-.14)/2+.04,-Z+.01,0,g); for(let i=1;i<24;i++)p(rbox(.004,H-.16,.004,.001),woodD,-IN/2+IN*i/24,(H-.16)/2+.05,-Z+.019,0,g);   // the beadboard back
      p(rbox(IN,.1,.02,.004),woodD,0,.05,Z-.03,0,g); p(rbox(W+.02,.02,D+.01,.004),woodD,0,.01,.005,0,g);   // the toe kick and the plinth's foot
      for(let b=1;b<BK.BAYS;b++)p(rbox(BK.DV,H-.2,D-.03,.004),wood,-IN/2+b*BK.BW+(b-.5)*BK.DV,(H-.2)/2+.06,-.01,0,g);   // the boards between the bays
      for(const y of SH){ p(rbox(IN,.025,D-.03,.004),wood,0,y-.0125,-.01,0,g); p(rbox(IN,.035,.018,.004),wood,0,y-.012,Z-.02,0,g); }   // the shelves, each with a lip
      p(rbox(IN,.03,D-.02,.004),wood,0,H-.13,0,0,g);   // the top board
      p(rbox(W+.02,.05,D+.02,.008),wood,0,H-.095,.01,0,g); p(rbox(W+.07,.03,D+.05,.01),woodD,0,H-.06,.025,0,g); p(rbox(W+.1,.03,D+.07,.012),wood,0,H-.03,.035,0,g);   // the crown, stepping out
      p(rbox(.16,.035,.006,.002),brass,0,SH[0]-.012,Z-.008,0,g);   // a little brass plate on the bottom shelf's lip
      const holder=new THREE.Group(); holder.userData.books=1; g.add(holder);   // the books go here once the bookstore's list is in (the wire)
      solid(U0-D/2,V0-W/2,U0+D/2,V0+W/2,H); },{wire:'books',bake:true}); });

  ROOMK.wires.books=(un,c)=>{ '@later'; let holder=null; un.obj.traverse(o=>{ if(o.userData.books)holder=o; }); if(!holder)return;
    const n=()=>ids().length||120;
    c.hit(un,()=>'BOOKSHELF: '+n()+' BOOKS',()=>{ LIB.open(null,false,HOME); if(SFX)SFX.play('page',{vol:.4}); });
    LIB.load().then(()=>{ if(!un.obj.parent)return; holder.clear(); const sp=LIB.spines(rowsOf(),BK.SH,BK.FZ); holder.add(sp.mesh); const L={sp,un}; live.add(L); sp.skip(off()); }).catch(e=>console.warn('BOOKSHELF: the books did not load',e)); };
  window.BOOKCASEDBG=()=>({ids:ids().length,genres:LIB.data?[...new Set(ids().map(i=>LIB.by[i].genre))]:[],all:LIB.data?new Set(LIB.data.books.map(b=>b.genre)).size:0,live:live.size,off:off().slice(),thing:!!(window.__dbg&&__dbg.UI.things.some(t=>/^BOOKSHELF/.test(t.name)))});
}
