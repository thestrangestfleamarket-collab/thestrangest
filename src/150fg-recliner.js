// THE RECLINER AND THE ROUND RUG: a big padded leather recliner facing the CRT TV in its corner, on a soft round rug, in every apartment from the start (owner, 9 Nov 2026); sit in it.
import {THREE} from './003-shx.js';
import {ROOMK} from './150a-bedroom.js';
{ for(const k of ['RECLINER','ROUND RUG'])ROOMK.always.add(k);
  // the rug's pile: soft rings of wool, a little uneven, painted once
  let RT=null; const rugTex=()=>{ if(RT)return RT; const cv=document.createElement('canvas'); cv.width=cv.height=512; const g=cv.getContext('2d'), C=256;
    const rings=[[1,'#cdb9a0'],[.86,'#b99f84'],[.8,'#d8c8b2'],[.55,'#a88c74'],[.5,'#dccdb8'],[.2,'#b9a189']]; for(const [r,c] of rings){ g.fillStyle=c; g.beginPath(); g.arc(C,C,r*C,0,7); g.fill(); }
    let s=7; const rnd=()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
    for(let i=0;i<26000;i++){ const a=rnd()*6.283, d=Math.sqrt(rnd())*C; g.fillStyle=rnd()<.5?'rgba(255,250,240,.10)':'rgba(70,50,30,.10)'; g.fillRect(C+Math.cos(a)*d,C+Math.sin(a)*d,1.4,1.4); }
    RT=new THREE.CanvasTexture(cv); RT.colorSpace=THREE.SRGBColorSpace; RT.anisotropy=4; return RT; };
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid,Lx,Ly}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast);
    const TU=Lx-.56, TV=Ly-.66, RU=TU-2.75, RV=TV-.05;   // the TV in its corner; the chair 2.75 m in front of it
    // the round rug between them, a finger thick, its pile soft at the edge
    cap('ROUND RUG',()=>{ const t=rugTex(), m=mat([255,255,255],{map:t,bumpMap:t,bumpScale:2}); const R0=1.55, cu=(TU+RU)/2+.15, cv=TV-.15;
      p(new THREE.CylinderGeometry(R0,R0,.014,64),m,cu,.007,cv,0,cur(),false); p(new THREE.TorusGeometry(R0-.01,.009,6,64).rotateX(Math.PI/2),mat([176,156,132]),cu,.009,cv,0,cur(),false); },{bake:true});
    // the recliner: a deep seat on a low plinth, rolled padded arms, a tall tufted back leaning a little, the footrest folded under, a lever at its side
    cap('RECLINER',g0=>{ const g=new THREE.Group(); g.position.set(RU,0,RV); g.rotation.y=Math.PI/2; cur().add(g);
      const lea=mat([96,58,38]), leaD=mat([70,42,28]), base=mat([38,30,26]), seam=mat([58,36,24]);
      const q=(geo,m,x,y,z,rx=0)=>{ const me=p(geo,m,x,y,z,0,g); if(rx)me.rotation.x=rx; return me; };
      q(rbox(.86,.12,.82,.03),base,0,.06,0);                                   // the plinth
      q(rbox(.66,.2,.72,.08,6),lea,0,.3,.04);                                  // the seat cushion
      q(rbox(.64,.03,.68,.012),seam,0,.405,.04);                               // its welt
      for(const s of [-1,1]){ q(rbox(.2,.42,.86,.08,6),leaD,s*.43,.33,0);       // the arms, rolled over at the top
        const r=q(new THREE.CylinderGeometry(.11,.11,.86,16).rotateX(Math.PI/2),lea,s*.44,.56,0); r.scale.set(1,.8,1); }
      const back=new THREE.Group(); back.position.set(0,.42,-.36); back.rotation.x=-.22; g.add(back);   // the back, leaning
      p(rbox(.72,.78,.24,.09,6),lea,0,.39,0,0,back); for(let i=0;i<3;i++)p(rbox(.66,.22,.06,.05,5),leaD,0,.15+i*.24,.12,0,back);   // its three tufted rolls
      p(rbox(.7,.16,.16,.07,5),lea,0,.84,.05,0,back);                          // the headrest
      q(rbox(.6,.16,.08,.04),leaD,0,.22,.43);                                  // the folded footrest
      const lv=q(rbox(.02,.12,.04,.008),mat([150,120,70]),.545,.42,.18);       // the lever
      solid(RU-.48,RV-.46,RU+.48,RV+.46,.42); },{wire:'sit',bake:true}); });
}
