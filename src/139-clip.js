// THE CLIP: CLIP finds things placed inside walls and moves them out, and checks where things can stand.
import {SHARED, THREE} from './003-shx.js';
import {CLIP, NPCS} from './003b-systems.js';
import {CLIPX, FIX, MODS, QS, SOL, STORE, TILE, ZU} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
Object.assign(CLIP,{moved:[],found:[],added:0,boxes:new Map(),done:new Set(),ms:0}); window.CLIP=CLIP;
{ const MH=24*ZU/.84, STEP=.25*TILE/.84, CHEST=1.2*MH, G=TILE/4, E=.04*TILE, GC=2*TILE;
  const GR=new Map(), key=(i,j)=>i*131072+j;
  const grid=L=>{ let g=GR.get(L); if(g&&g.n===L.length)return g; g={n:L.length,m:new Map()};
    for(const b of L)for(let i=Math.floor(b[0]/GC);i<=Math.floor(b[2]/GC);i++)for(let j=Math.floor(b[1]/GC);j<=Math.floor(b[3]/GC);j++){ const k=key(i,j); let c=g.m.get(k); if(!c)g.m.set(k,c=[]); c.push(b); }
    GR.set(L,g); return g; };
  CLIP.hit=(L,x,z,R)=>{ const g=grid(L); for(let i=Math.floor((x-R)/GC);i<=Math.floor((x+R)/GC);i++)for(let j=Math.floor((z-R)/GC);j<=Math.floor((z+R)/GC);j++){ const c=g.m.get(key(i,j)); if(!c)continue;
      for(const b of c){ const dx=x-Math.max(b[0],Math.min(b[2],x)), dz=z-Math.max(b[1],Math.min(b[3],z)); if(dx*dx+dz*dz<R*R)return b; } } return null; };
  const where=(o,cx,cz,ylo)=>{ const p=o.place;
    if(p==='station')return {L:SOL.down,F:FIX.down,y0:MODS.station.ground(cx,cz)};
    if(p==='dungeon')return {L:SOL.down,F:FIX.down,y0:MODS.dungeon.ground(cx,cz)};
    if(p==='apartments'&&MODS.apts&&MODS.apts.SY){ const A=MODS.apts, lv=Math.max(0,Math.round((ylo-A.R0)/A.SY)); return {L:A.sol[lv],also:SOL.up,F:null,y0:A.lvY(lv)}; }
    if(p.startsWith('store:')){ const R=STORE.rooms.find(r=>r.id===p.slice(6)); if(R&&R.solids)return {L:R.solids,F:FIX.up,y0:R.fy}; }
    return {L:SOL.up,F:FIX.up,y0:MODS.bodega.ground(cx,cz)}; };
  const OPEN=/\bsteps?\b|stairs|\bmat\b|rug\b|carpet|dust in the air/;
  const scan=(o,miss)=>{ let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,ylo=1e9; if(OPEN.test(o.name||''))return o.clip={tot:0,miss:0,open:true};
    for(const {me,v0} of o.parts){ const P=me.geometry.attributes.position.array; for(let q=v0*3;q<v0*3+18;q+=3){ x0=Math.min(x0,P[q]); x1=Math.max(x1,P[q]); z0=Math.min(z0,P[q+2]); z1=Math.max(z1,P[q+2]); ylo=Math.min(ylo,P[q+1]); } }
    const W=where(o,(x0+x1)/2,(z0+z1)/2,ylo), lo=W.y0+STEP, hi=W.y0+CHEST; let tot=0, n=0;
    for(const {me,v0} of o.parts){ const P=me.geometry.attributes.position.array, i=v0*3, a=i, b=i+3, c=i+6, d=i+15;
      const yl=Math.min(P[a+1],P[b+1],P[c+1],P[d+1]), yh=Math.max(P[a+1],P[b+1],P[c+1],P[d+1]); if(yh<=lo||yl>=hi)continue;
      const nu=Math.max(1,Math.ceil(Math.hypot(P[b]-P[a],P[b+2]-P[a+2])/G)), nv=Math.max(1,Math.ceil(Math.hypot(P[d]-P[a],P[d+2]-P[a+2])/G));
      for(let u=0;u<=nu;u++)for(let v=0;v<=nv;v++){ const s=u/nu, t=v/nv, x=(P[a]*(1-s)+P[b]*s)*(1-t)+(P[d]*(1-s)+P[c]*s)*t, z=(P[a+2]*(1-s)+P[b+2]*s)*(1-t)+(P[d+2]*(1-s)+P[c+2]*s)*t; tot++;
        if(CLIP.hit(W.L,x,z,E)||W.also&&CLIP.hit(W.also,x,z,E))continue; n++; if(miss)miss(W,x,z,yh); } }
    o.clip={tot,miss:n,lvl:W.L===SOL.down?'down':W.L===SOL.up?'up':'room',y0:W.y0}; return o.clip; };
  const WADE=/grass|flower|daisy|tulip|rose|lily|sunflower|mushroom/, V=new THREE.Vector3();
  const tris=t=>{ if(t.P)return t.P; const P=[]; t.obj.updateMatrixWorld(true); t.obj.traverse(m=>{ if(!m.isMesh)return; const a=m.geometry.attributes.position, ix=m.geometry.index;
      const n=ix?ix.count:a.count; for(let k=0;k<n;k++){ V.fromBufferAttribute(a,ix?ix.getX(k):k).applyMatrix4(m.matrixWorld); P.push(V.x,V.y,V.z); } }); return t.P=P; };
  const scanX=(t,miss)=>{ if(WADE.test(t.name))return t.clip={tot:0,miss:0,open:true}; const P=tris(t); let cx=0,cz=0;
    for(let q=0;q<P.length;q+=3){ cx+=P[q]; cz+=P[q+2]; } cx/=P.length/3; cz/=P.length/3; const y0=MODS.bodega.ground(cx,cz), lo=y0+STEP, hi=y0+CHEST, W={L:SOL.up,F:FIX.up,y0}; let tot=0, n=0;
    for(let q=0;q<P.length;q+=9){ const yl=Math.min(P[q+1],P[q+4],P[q+7]), yh=Math.max(P[q+1],P[q+4],P[q+7]); if(yh<=lo||yl>=hi)continue;
      const nu=Math.max(1,Math.ceil(Math.max(Math.hypot(P[q+3]-P[q],P[q+5]-P[q+2]),Math.hypot(P[q+6]-P[q],P[q+8]-P[q+2]))/G));
      for(let u=0;u<=nu;u++)for(let v=0;u+v<=nu;v++){ const a=u/nu, b=v/nu, x=P[q]+(P[q+3]-P[q])*a+(P[q+6]-P[q])*b, z=P[q+2]+(P[q+5]-P[q+2])*a+(P[q+8]-P[q+2])*b; tot++;
        if(CLIP.hit(SOL.up,x,z,E))continue; n++; if(miss)miss(W,x,z,yh); } }
    return t.clip={tot,miss:n,lvl:'up',y0}; };
  CLIP.run=()=>{ if(QS.get('clip')==='0')return;
    const t0=performance.now(), C=new Map();
    const cell=nm=>(W,x,z,top)=>{ let m=C.get(W.L); if(!m)C.set(W.L,m={W,c:new Map()}); const i=Math.floor(x/G), j=Math.floor(z/G), k=key(i,j); let e=m.c.get(k);
      if(!e)m.c.set(k,e={i,j,x0:x,x1:x,z0:z,z1:z,top,of:new Set([nm])}); else{ e.of.add(nm); e.x0=Math.min(e.x0,x); e.x1=Math.max(e.x1,x); e.z0=Math.min(e.z0,z); e.z1=Math.max(e.z1,z); e.top=Math.max(e.top,top); } };
    for(const o of OBJS){ if(CLIP.done.has(o)||!o.parts.length)continue; CLIP.done.add(o);
      const nm=o.id+' '+o.name, c=scan(o,cell(nm));
      if(c.miss)CLIP.found.push({id:o.id,name:o.name,lvl:c.lvl,miss:c.miss,of:c.tot}); }
    for(const t of CLIPX){ if(CLIP.done.has(t))continue; CLIP.done.add(t); const c=scanX(t,cell(t.place+' '+t.name)); if(c.miss)CLIP.found.push({id:t.place,name:t.name,lvl:'up',miss:c.miss,of:c.tot}); }
    for(const [L,{W,c}] of C){ const rows=new Map(); for(const e of c.values()){ let r=rows.get(e.j); if(!r)rows.set(e.j,r=[]); r.push(e); }
      let open=new Map(); const out=[], close=bx=>out.push(bx);
      for(const j of [...rows.keys()].sort((p,q)=>p-q)){ const r=rows.get(j).sort((p,q)=>p.i-q.i), now=new Map();
        for(let s=0;s<r.length;){ let t=s; while(t+1<r.length&&r[t+1].i===r[t].i+1)t++; const k=r[s].i+','+r[t].i, run=r.slice(s,t+1);
          let bx=open.get(k); if(bx&&bx.j===j-1)open.delete(k); else bx={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,top:-1e9,of:new Set()};
          for(const e of run){ for(const n of e.of)bx.of.add(n); bx.x0=Math.min(bx.x0,e.x0); bx.x1=Math.max(bx.x1,e.x1); bx.z0=Math.min(bx.z0,e.z0); bx.z1=Math.max(bx.z1,e.z1); bx.top=Math.max(bx.top,e.top); } bx.j=j; now.set(k,bx); s=t+1; }
        for(const bx of open.values())close(bx); open=now; }
      for(const bx of open.values())close(bx);
      for(const bx of out){ const p=.02*TILE; const b=[bx.x0-p,bx.z0-p,bx.x1+p,bx.z1+p]; L.push(b); CLIP.boxes.set(b,[...bx.of]); if(W.F)W.F.push([bx.x0-p,bx.z0-p,W.y0,bx.x1+p,bx.z1+p,Math.max(W.y0+.05,bx.top)]); } CLIP.added+=out.length; }
    CLIP.ms+=performance.now()-t0; CLIP.settle(); };
  const fly=N=>N.key==='dragon'||N.mode==='hidden'||N.sheet||N.far;
  const clear=(N,x,z,ok)=>!CLIP.hit(SOL[N.lv]||SOL.up,x,z,N.st.R)&&!ok.some(q=>q.lv===N.lv&&Math.hypot(q.st.x-x,q.st.z-z)<q.st.R+N.st.R)&&(!N.free||N.free(x,z,N.st.R));
  const through=(L,x0,z0,x1,z1)=>{ const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/E); for(let k=1;k<=n;k++){ const x=x0+(x1-x0)*k/n, z=z0+(z1-z0)*k/n, b=CLIP.hit(L,x,z,1e-3); if(b&&!(x0>=b[0]&&x0<=b[2]&&z0>=b[1]&&z0<=b[3]))return true; } return false; };
  CLIP.settle=()=>{ const ok=[], D=TILE/20;
    for(const N of NPCS){ if(fly(N))continue; const st=N.st, L=SOL[N.lv]||SOL.up, b=CLIP.hit(L,st.x,st.z,st.R), q=ok.find(q=>q.lv===N.lv&&Math.hypot(q.st.x-st.x,q.st.z-st.z)<q.st.R+st.R);
      if(b||q){ let to=null; for(let r=D;r<=8*TILE&&!to;r+=D){ const n=Math.max(8,Math.round(2*Math.PI*r/D)); for(let k=0;k<n;k++){ const a=k/n*2*Math.PI, x=st.x+Math.sin(a)*r, z=st.z+Math.cos(a)*r; if(clear(N,x,z,ok)&&!through(L,st.x,st.z,x,z)){ to={x,z}; break; } } }
        const why=b?'inside a solid ['+b.map(v=>v.toFixed(2))+']':'inside '+q.key;
        if(to){ CLIP.moved.push({key:N.key,from:[+st.x.toFixed(2),+st.z.toFixed(2)],to:[+to.x.toFixed(2),+to.z.toFixed(2)],why}); console.warn('CLIP: '+N.key+' stood '+why+' at '+st.x.toFixed(2)+','+st.z.toFixed(2)+'; moved '+Math.hypot(to.x-st.x,to.z-st.z).toFixed(2)+' to '+to.x.toFixed(2)+','+to.z.toFixed(2));
          st.x=to.x; st.z=to.z; st.to=null; if(!(N.home&&N.home.r>0))N.home={x:to.x,z:to.z}; }
        else console.warn('CLIP: '+N.key+' stands '+why+' and no clear spot within eight tiles'); }
      ok.push(N); } };
  CLIP.audit=()=>{ '@later'; const things=[], chars=[];
    for(const o of OBJS){ if(!o.parts.length)continue; const c=scan(o,null); if(c.miss)things.push({id:o.id,name:o.name,lvl:c.lvl,miss:c.miss,of:c.tot}); }
    for(const t of CLIPX){ const c=scanX(t,null); if(c.miss)things.push({id:t.place,name:t.name,lvl:'up',miss:c.miss,of:c.tot}); }
    const live=NPCS.filter(N=>!fly(N));
    for(const N of live){ const st=N.st, b=CLIP.hit(SOL[N.lv]||SOL.up,st.x,st.z,st.R*.98), q=live.find(q=>q!==N&&q.lv===N.lv&&Math.hypot(q.st.x-st.x,q.st.z-st.z)<(q.st.R+st.R)*.98);
      if(b||q)chars.push({key:N.key,at:[+st.x.toFixed(2),+st.z.toFixed(2)],R:+st.R.toFixed(2),solid:b?b.map(v=>+v.toFixed(2)):null,other:q?q.key:null}); }
    const closed=[]; for(const lv of ['up','down']){ const L=SOL[lv], B=SHARED.BOUND, S=TILE/4, r=.3, nx=Math.ceil((B.x1-B.x0)/S), seeds=[];
      if(lv==='up'){ seeds.push([-2.2,3.2]); for(const R of STORE.rooms)if(!R.solids)seeds.push([R.at.x,R.at.z]); }
      for(const N of live)if(N.lv===lv)seeds.push([N.st.x,N.st.z]);
      const flood=skip=>{ const seen=new Set(), q=[]; const ok=(x,z)=>{ const g=grid(L); for(let i=Math.floor((x-r)/GC);i<=Math.floor((x+r)/GC);i++)for(let j=Math.floor((z-r)/GC);j<=Math.floor((z+r)/GC);j++){ const c=g.m.get(key(i,j)); if(c)for(const b of c){ if(skip&&CLIP.boxes.has(b))continue; const dx=x-Math.max(b[0],Math.min(b[2],x)), dz=z-Math.max(b[1],Math.min(b[3],z)); if(dx*dx+dz*dz<r*r)return false; } } return true; };
        for(const [x,z] of seeds){ const i=Math.round((x-B.x0)/S), j=Math.round((z-B.z0)/S), k=j*nx+i; if(!seen.has(k)&&ok(B.x0+i*S,B.z0+j*S)){ seen.add(k); q.push(k); } }
        while(q.length){ const k=q.pop(), i=k%nx, j=(k-i)/nx; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di, c=j+dj, x=B.x0+a*S, z=B.z0+c*S, kk=c*nx+a; if(a<0||a>=nx||z>B.z1||c<0||seen.has(kk))continue; seen.add(kk); if(ok(x,z))q.push(kk); else seen.add(-kk-1); } }
        return [...seen].filter(k=>k>=0&&!seen.has(-k-1)); };
      const before=flood(true), after=new Set(flood(false));
      for(const k of before){ if(after.has(k))continue; const i=k%nx, j=(k-i)/nx, x=B.x0+i*S, z=B.z0+j*S; if(!CLIP.hit(L,x,z,r))closed.push([lv,+x.toFixed(2),+z.toFixed(2),[...new Set([...CLIP.boxes].filter(([b])=>L.includes(b)&&Math.hypot(x-Math.max(b[0],Math.min(b[2],x)),z-Math.max(b[1],Math.min(b[3],z)))<r+S).flatMap(([b,n])=>n))].join('; ')]); } }
    return {things,chars,closed,found:CLIP.found,checked:{things:OBJS.filter(o=>o.parts.length).length+CLIPX.length,chars:live.length},added:CLIP.added,moved:CLIP.moved,ms:Math.round(CLIP.ms)}; }; }
