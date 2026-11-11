// THE INSIDES' KIT: IKIT.frame(R) gives a room's corner and axes in metres; IKIT.room(F,add) its makers (boxes, cylinders and balls merged into a few meshes, glowing parts, pictures, painted signs, seats you sit on). Every rebuilt inside furnishes with it.
import {SHARED, THREE} from './003-shx.js';
import {ARCHI, FORAGE, INV, pos, UI, USE, WE, WED} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SOL, TILE} from './006-map-pre.js';
const IKIT={}; window.IKIT=IKIT;
{ const T=TILE, MW=T/.84; IKIT.MW=MW;   // world units in a metre
  // R a rectangle in map tiles {x0,y0,x1,y1}: u runs from x0 toward x1, v from y0 toward y1, in metres; P(x,y) the world point of a map point (a turned room: its own); pw(u,v) a room point in the world, hd(du,dv) the heading that faces along (du,dv); wx/wz for a room square to the map
  IKIT.frame=(R,P=(x,y)=>[SHARED.BOD.X(x),SHARED.BOD.Z(y)])=>{ const o=P(R.x0,R.y0), a=P(R.x1,R.y0), b=P(R.x0,R.y1), lu=Math.hypot(a[0]-o[0],a[1]-o[1]), lv=Math.hypot(b[0]-o[0],b[1]-o[1]);
    const eu=[(a[0]-o[0])/lu,(a[1]-o[1])/lu], ev=[(b[0]-o[0])/lv,(b[1]-o[1])/lv], W=lu/MW, D=lv/MW, pw=(u,v)=>[o[0]+(eu[0]*u+ev[0]*v)*MW,o[1]+(eu[1]*u+ev[1]*v)*MW];
    return {R,P,W,D,eu,ev,pw,id:String(R.id||R.name||'inside').toLowerCase(),EX:Math.sign(eu[0])||1,IN:Math.sign(ev[1])||1,wx:u=>pw(u,0)[0],wz:v=>pw(0,v)[1],hd:(du,dv)=>Math.atan2(eu[0]*du+ev[0]*dv,eu[1]*du+ev[1]*dv),
      tu:u=>R.x0+u/W*(R.x1-R.x0),tv:v=>R.y0+v/D*(R.y1-R.y0),
      box:(u0,v0,u1,v1)=>{ const p=pw(u0,v0), q=pw(u1,v1); return [Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[0],q[0]),Math.max(p[1],q[1])]; }}; };
  IKIT.tex=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; return t; };
  // the makers for one room: add(o) puts a mesh in the scene; flush() makes the merged meshes once everything is laid
  IKIT.room=(F,add,solid=r=>SOL.up.push(r))=>{ const {pw,hd}=F, V3=THREE.Vector3, COL=new THREE.Color(), bag=()=>({p:[],n:[],c:[],r:[]}), MAIN=bag(), GLOW=bag(); let CUR=MAIN, KIND='piece';
    const addG=g=>{ const q=g.index?g.toNonIndexed():g, p=q.attributes.position.array, n=q.attributes.normal.array; CUR.r.push([CUR.p.length/3,p.length/3,KIND]); for(let i=0;i<p.length;i+=3){ CUR.p.push(p[i],p[i+1],p[i+2]); CUR.n.push(n[i],n[i+1],n[i+2]); CUR.c.push(COL.r,COL.g,COL.b); } g.dispose(); if(q!==g)q.dispose(); };
    const box=(u0,v0,u1,v1,h0,h1,c)=>{ COL.set(c); KIND='box'; const [x0,z0,x1,z1]=F.box(u0,v0,u1,v1), g=new THREE.BoxGeometry(x1-x0,(h1-h0)*MW,z1-z0); g.translate((x0+x1)/2,(h0+h1)/2*MW,(z0+z1)/2); addG(g); };
    const cyl=(u,v,r,h0,h1,c,rt=r,seg=12)=>{ COL.set(c); KIND='post'; const p=pw(u,v), g=new THREE.CylinderGeometry(rt*MW,r*MW,(h1-h0)*MW,seg); g.translate(p[0],(h0+h1)/2*MW,p[1]); addG(g); };
    const ball=(u,v,h,r,c,sy=1)=>{ COL.set(c); KIND='ball'; const p=pw(u,v), g=new THREE.SphereGeometry(r*MW,10,7); g.scale(1,sy,1); g.translate(p[0],h*MW,p[1]); addG(g); };
    // something you bump into, in the room's metres
    const sol=(u0,v0,u1,v1)=>{ const r=F.box(u0,v0,u1,v1); solid(r); return r; };
    const glow=f=>{ const c=CUR; CUR=GLOW; f(); CUR=c; };
    const own=f=>{ const c=CUR, b=bag(); CUR=b; f(); CUR=c; return b; };
    const matL=new THREE.MeshLambertMaterial({vertexColors:true}), matB=new THREE.MeshBasicMaterial({vertexColors:true});
    // a bag as a mesh; own: its origin at its foot's middle (a thing to use or move)
    // the room's own pieces (not a thing of its own): one batch, each box, post and ball an entry the world editor picks, moves, tints and removes (owner, 7 Nov 2026: "make sure everything in game can be edited")
    const batchOf=(b,mat)=>{ const me=new THREE.BatchedMesh(b.r.length,b.p.length/3,0,mat), items=[], P=new Float32Array(b.p), N=new Float32Array(b.n), C=new Float32Array(b.c);
      for(const [v0,n,k] of b.r){ const g=new THREE.BufferGeometry(), s3=v0*3, e3=(v0+n)*3; g.setAttribute('position',new THREE.BufferAttribute(P.slice(s3,e3),3)); g.setAttribute('normal',new THREE.BufferAttribute(N.slice(s3,e3),3)); g.setAttribute('color',new THREE.BufferAttribute(C.slice(s3,e3),3));
        g.computeBoundingBox(); const c=g.boundingBox.getCenter(new V3()); me.addInstance(me.addGeometry(g)); items.push({k,x:+c.x.toFixed(2),y:+g.boundingBox.min.y.toFixed(2),z:+c.z.toFixed(2)}); }
      me.computeBoundingSphere(); me.castShadow=mat===matL; me.receiveShadow=true; me.userData.weRoom=1; add(me); WED.meshes.push({place:F.id||'inside',me,items,temp:true}); return me; };
    const meshOf=(b,mat=matL,ownO=false)=>{ if(!ownO&&b.r.length&&b.r.length<4000)return batchOf(b,mat); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
      const me=new THREE.Mesh(g,mat); if(ownO){ g.computeBoundingBox(); const c=g.boundingBox.getCenter(new V3()); c.y=g.boundingBox.min.y; g.translate(-c.x,-c.y,-c.z); me.position.copy(c); }
      me.castShadow=mat===matL; me.receiveShadow=true; add(me); if(ownO)WED.objs.push({place:F.id||'inside',name:me.name||'thing',obj:me,temp:true}); return me; };
    // a flat picture facing (du,dv), its bottom middle at u,v,h
    const pic=(u,v,h,w,hh,du,dv,tex,lit)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*MW,hh*MW),lit?new THREE.MeshBasicMaterial({map:tex}):new THREE.MeshLambertMaterial({map:tex})); const p=pw(u,v); m.position.set(p[0],(h+hh/2)*MW,p[1]); m.rotation.y=hd(du,dv); add(m); WED.objs.push({place:F.id||'inside',name:'picture',obj:m,temp:true}); return m; };
    const words=(w,h,bg,lines,fg='#f0e8d0')=>IKIT.tex(w,h,(g,W_,H_)=>{ g.fillStyle=bg; g.fillRect(0,0,W_,H_); g.textBaseline='top'; for(const [t,x,y,c,sz,al] of lines){ g.fillStyle=c||fg; g.font=(sz||8)+'px monospace'; g.textAlign=al||'left'; g.fillText(t,x,y); } });
    // a seat: its own mesh, a thing to use; spots [u,v,seat height,du,dv] (you sit at the nearest)
    const seat=(name,b,spots,reach=.9)=>{ const me=meshOf(b,matL,true); me.name=name;
      const th={name,obj:me,reach:reach*T,near:(reach+1.2)*T,tall:1.2*T,act:()=>{ let best=spots[0], bd=1e9; for(const s of spots){ const p=pw(s[0],s[1]), d=Math.hypot(p[0]-pos.x,p[1]-pos.z); if(d<bd){ bd=d; best=s; } } const p=pw(best[0],best[1]); USE.sitAt(p[0],p[1],best[2]*MW,hd(best[3],best[4])); }};
      UI.thing(th); return me; };
    // a spot or a seat for the room's lists (ROOMS.off[id] or STORE.rooms): y only for a seat
    const spot=(u,v,du,dv,h)=>{ const p=pw(u,v); return {x:p[0],z:p[1],hd:hd(du,dv),...(h!=null?{y:h*MW}:{})}; };
    // a thing to double-click over a piece (u,v its middle, w its width, h its height): act(th) does what it is for
    const use=(name,u,v,w,h,act,reach=1.5)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w*MW,h*MW,w*MW),new THREE.MeshBasicMaterial({visible:false})), p=pw(u,v); hb.position.set(p[0],h/2*MW,p[1]); add(hb);
      const th={name,obj:hb,reach:reach*T,near:(reach+1.1)*T,tall:h*MW,act:()=>act(th)}; UI.thing(th); return th; };
    const flush=()=>{ const r=[MAIN.p.length?meshOf(MAIN,matL):null,GLOW.p.length?meshOf(GLOW,matB):null]; if(WE.late)setTimeout(()=>WE.late(),0); return r; };
    return {MW,box,cyl,ball,glow,own,meshOf,pic,words,seat,spot,sol,use,flush,matL,matB}; };
  // buying a thing over a counter or from a machine: the price from your cash, the thing in your pack
  IKIT.buy=(id,price,line)=>{ '@later'; const say=(t,c)=>SAY(t,c), nm=FORAGE.name?FORAGE.name(id):id.toUpperCase(); if(ARCHI(id)){ say('SOLD OUT.','#c8a090'); return false; }
    if(!INV.afford(price)){ say('THAT IS $'+price+'. YOU HAVE $'+INV.money()+'.','#c8a090'); return false; } INV.pay(price); INV.add(id,1); say(line||nm+': $'+price+'. IT IS IN YOUR PACK.','#f2c14e'); return true; };
}
export {IKIT};
