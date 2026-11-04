// THE INSIDES' KIT: IKIT.frame(R) gives a room's corner and axes in metres; IKIT.room(F,add) its makers (boxes, cylinders and balls merged into a few meshes, glowing parts, pictures, painted signs, seats you sit on). Every rebuilt inside furnishes with it.
import {SHARED, THREE} from './003-shx.js';
import {pos, UI, USE} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
const IKIT={};
{ const T=TILE, MW=T/.84; IKIT.MW=MW;   // world units in a metre
  // R a rectangle in map tiles {x0,y0,x1,y1}: u runs from x0 toward x1, v from y0 toward y1, in metres; hd(du,dv) the heading that faces along (du,dv)
  IKIT.frame=(R,X=SHARED.BOD.X,Z=SHARED.BOD.Z)=>{ const EX=Math.sign(X(R.x1)-X(R.x0)), IN=Math.sign(Z(R.y1)-Z(R.y0)), W=Math.abs(X(R.x1)-X(R.x0))/MW, D=Math.abs(Z(R.y1)-Z(R.y0))/MW;
    return {R,EX,IN,W,D,wx:u=>X(R.x0)+EX*u*MW,wz:v=>Z(R.y0)+IN*v*MW,hd:(du,dv)=>Math.atan2(EX*du,IN*dv),tu:u=>R.x0+u/W*(R.x1-R.x0),tv:v=>R.y0+v/D*(R.y1-R.y0)}; };
  IKIT.tex=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; return t; };
  // the makers for one room: add(o) puts a mesh in the scene; flush() makes the merged meshes once everything is laid
  IKIT.room=(F,add)=>{ '@later'; const {wx,wz,hd}=F, V3=THREE.Vector3, COL=new THREE.Color(), bag=()=>({p:[],n:[],c:[]}), MAIN=bag(), GLOW=bag(); let CUR=MAIN;
    const addG=g=>{ const q=g.index?g.toNonIndexed():g, p=q.attributes.position.array, n=q.attributes.normal.array; for(let i=0;i<p.length;i+=3){ CUR.p.push(p[i],p[i+1],p[i+2]); CUR.n.push(n[i],n[i+1],n[i+2]); CUR.c.push(COL.r,COL.g,COL.b); } g.dispose(); if(q!==g)q.dispose(); };
    const box=(u0,v0,u1,v1,h0,h1,c)=>{ COL.set(c); const g=new THREE.BoxGeometry(Math.abs(u1-u0)*MW,(h1-h0)*MW,Math.abs(v1-v0)*MW); g.translate((wx(u0)+wx(u1))/2,(h0+h1)/2*MW,(wz(v0)+wz(v1))/2); addG(g); };
    const cyl=(u,v,r,h0,h1,c,rt=r,seg=12)=>{ COL.set(c); const g=new THREE.CylinderGeometry(rt*MW,r*MW,(h1-h0)*MW,seg); g.translate(wx(u),(h0+h1)/2*MW,wz(v)); addG(g); };
    const ball=(u,v,h,r,c,sy=1)=>{ COL.set(c); const g=new THREE.SphereGeometry(r*MW,10,7); g.scale(1,sy,1); g.translate(wx(u),h*MW,wz(v)); addG(g); };
    const glow=f=>{ const c=CUR; CUR=GLOW; f(); CUR=c; };
    const own=f=>{ const c=CUR, b=bag(); CUR=b; f(); CUR=c; return b; };
    const matL=new THREE.MeshLambertMaterial({vertexColors:true}), matB=new THREE.MeshBasicMaterial({vertexColors:true});
    // a bag as a mesh; own: its origin at its foot's middle (a thing to use or move)
    const meshOf=(b,mat=matL,ownO=false)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
      const me=new THREE.Mesh(g,mat); if(ownO){ g.computeBoundingBox(); const c=g.boundingBox.getCenter(new V3()); c.y=g.boundingBox.min.y; g.translate(-c.x,-c.y,-c.z); me.position.copy(c); }
      me.castShadow=mat===matL; me.receiveShadow=true; add(me); return me; };
    // a flat picture facing (du,dv), its bottom middle at u,v,h
    const pic=(u,v,h,w,hh,du,dv,tex,lit)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*MW,hh*MW),lit?new THREE.MeshBasicMaterial({map:tex}):new THREE.MeshLambertMaterial({map:tex})); m.position.set(wx(u),(h+hh/2)*MW,wz(v)); m.rotation.y=hd(du,dv); add(m); return m; };
    const words=(w,h,bg,lines,fg='#f0e8d0')=>IKIT.tex(w,h,(g,W_,H_)=>{ g.fillStyle=bg; g.fillRect(0,0,W_,H_); g.textBaseline='top'; for(const [t,x,y,c,sz,al] of lines){ g.fillStyle=c||fg; g.font=(sz||8)+'px monospace'; g.textAlign=al||'left'; g.fillText(t,x,y); } });
    // a seat: its own mesh, a thing to use; spots [u,v,seat height,du,dv] (you sit at the nearest)
    const seat=(name,b,spots,reach=.9)=>{ const me=meshOf(b,matL,true); me.name=name;
      const th={name,obj:me,reach:reach*T,near:(reach+1.2)*T,tall:1.2*T,act:()=>{ let best=spots[0], bd=1e9; for(const s of spots){ const d=Math.hypot(wx(s[0])-pos.x,wz(s[1])-pos.z); if(d<bd){ bd=d; best=s; } } USE.sitAt(wx(best[0]),wz(best[1]),best[2]*MW,hd(best[3],best[4])); }};
      UI.thing(th); return me; };
    // a spot or a seat for the room's lists (ROOMS.off[id] or STORE.rooms): y only for a seat
    const spot=(u,v,du,dv,h)=>({x:wx(u),z:wz(v),hd:hd(du,dv),...(h!=null?{y:h*MW}:{})});
    const flush=()=>[MAIN.p.length?meshOf(MAIN,matL):null,GLOW.p.length?meshOf(GLOW,matB):null];
    return {MW,box,cyl,ball,glow,own,meshOf,pic,words,seat,spot,flush,matL,matB}; };
}
export {IKIT};
