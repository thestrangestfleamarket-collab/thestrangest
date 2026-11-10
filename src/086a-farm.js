// THE FARM: the park's paddock (data/world.json parkPlaces.sites 'farm': its pen and its shut gate) and its animals' days, from the shared clock so every player sees the same: they graze, rest, sleep at night, watch whoever comes near, and walk a little between.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, ONLINE, PARK, pos, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FIX, MAPG, SOL, SYS, TILE, WPP} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
const FARM={};
{ const ST=(WPP.sites||[]).find(q=>q.id==='farm')||{}, T=TILE, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, P=ST.pen||[0,0,1,1];
  FARM.pen={x0:X(P[0]),x1:X(P[2]),z0:Z(P[1]),z1:Z(P[3]),park:1};
  const hs=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); };
  const now=()=>TRAINS.now?TRAINS.now():Date.now()/1000, night=h=>h<6||h>=21;
  // an animal's day in slots of 40 to 70 s: it walks from the last slot's spot to this one, then does this slot's thing there (at night it sleeps in its bed, by the barn)
  const plan=(i,v)=>{ const L=40+hs(i,1)*30, o=hs(i,2)*L, pen=FARM.pen, W=pen.x1-pen.x0, D=pen.z1-pen.z0, bed={x:pen.x0+(.08+.3*hs(i,3))*W,z:pen.z0+(.1+.8*hs(i,4))*D};
    const act=(n,t)=>{ const h=((CLOCK.h??12)-(t-(n*L-o))/3600+48)%24; if(night(h))return hs(i,n*7+5)<.9?'sleep':'stand'; const r=hs(i,n*7+1); return r<.45?'graze':r<.65?'rest':r<.85?'stand':'walk'; };
    const spot=(n,t)=>act(n,t)==='sleep'?bed:{x:pen.x0+(.08+.84*hs(i,n*3+11))*W,z:pen.z0+(.08+.84*hs(n*5+13,i))*D};
    return (t=now())=>{ const n=Math.floor((t+o)/L), e=t+o-n*L, a=spot(n-1,t), b=spot(n,t), d=Math.hypot(b.x-a.x,b.z-a.z), dur=d/v;
      if(e<dur){ const k=e/dur; return {x:a.x+(b.x-a.x)*k,z:a.z+(b.z-a.z)*k,to:b,act:'walk',h:Math.atan2(b.x-a.x,b.z-a.z)}; }
      const ac=act(n,t); return {x:b.x,z:b.z,to:null,act:ac==='walk'?'stand':ac,h:d>.01?Math.atan2(b.x-a.x,b.z-a.z):hs(i,n)*6.283}; }; };
  // the poses its clips lack, laid over them: head down to the grass, dozing, lying with its legs folded
  const turnX=(b,q0,a)=>{ if(b&&a)b.quaternion.copy(q0).multiply(QX.setFromAxisAngle(AX,a)); }, QX=new THREE.Quaternion(), AX=new THREE.Vector3(1,0,0);
  const POSE={graze:{Neck:.9,Head:.5},doze:{Neck:.35,Head:.2},lie:{drop:.5,Neck:-.15,FrontUp:1.35,FrontLow:-2.4,HindUp:-1.15,HindLow:2.1},sleep:{drop:.5,Neck:.55,Head:.35,FrontUp:1.35,FrontLow:-2.4,HindUp:-1.15,HindLow:2.1}};
  // N an animal of the farm (087), i its number, clips its kind's, rig its skeleton: drives it by the plan and returns its life {clip, anim}
  FARM.join=(N,i,clips,rig,names,K)=>{ const st=N.st, v=st.v, day=plan(i,v), B=n=>{ const k=names.indexOf(n); return k<0?null:rig.bones[k]; };
    const bones={Neck:[B('Neck')],Head:[B('Head')],FrontUp:[B('LeftFrontUpLeg'),B('RightFrontUpLeg')],FrontLow:[B('LeftFrontElbow')||B('LeftFrontLeg'),B('RightFrontElbow')||B('RightFrontLeg')],HindUp:[B('LeftHindUpLeg'),B('RightHindUpLeg')],HindLow:[B('LeftHindLeg'),B('RightHindLeg')]};
    const hips=B('Hips'), hy0=hips?hips.position.y:0, q0=new Map(); for(const L of Object.values(bones))for(const b of L)if(b)q0.set(b,b.quaternion.clone());
    const has=c=>!!clips[K+'_'+c], lies=!has('Graze');   // a horse or a mule grazes and dozes standing; a cow or a pig lies down to rest (on its Sleep clip when it has one)
    const life={act:'stand',clip:null,k:1,w:0,pose:null,look:null};
    const person=()=>{ let b=null, bd=7*T; const see=(x,z)=>{ const d=Math.hypot(x-st.x,z-st.z); if(d<bd){ bd=d; b={x,z}; } }; see(pos.x,pos.z); if(ONLINE.others)for(const o of ONLINE.others.values())if(o.p&&o.why==='near you')see(o.p.x,o.p.z); return b; };
    const set=(p,dt)=>{ let a=p.act; const gap=Math.hypot(p.x-st.x,p.z-st.z); st.hold=true; st.wait=1;
      if(gap>2.5*T||N.far){ st.x=p.x; st.z=p.z; st.to=null; }
      if(a==='walk'){ st.to={x:p.to.x,z:p.to.z}; st.v=v; } else st.to=gap>.3*T?{x:p.x,z:p.z}:null;
      const lying=a==='sleep'||a==='rest'&&lies, q=a!=='walk'&&!lying?person():null; if(q)a='watch';   // someone near: it stops what it is doing and watches them
      st.face=q||(st.to?null:{x:st.x+Math.sin(p.h),z:st.z+Math.cos(p.h)});
      life.act=a; life.clip=a==='graze'&&has('Graze')?K+'_Graze':lying&&has('Sleep')?K+'_Sleep':null;
      life.pose=a==='graze'&&!has('Graze')?'graze':lying&&!has('Sleep')?(a==='sleep'?'sleep':'lie'):a==='rest'&&!lying?'doze':null; life.k=a==='sleep'?.25:a==='rest'?.5:1; };
    life.drive=dt=>set(day(),dt); N.farMove=()=>{ const p=day(); st.x=p.x; st.z=p.z; st.to=null; };
    // before the clip: the bones it moves back to their rest; after: the pose, eased in and out
    let last=null; life.anim=(dt,mixer)=>{ for(const [b,q] of q0)b.quaternion.copy(q); if(hips)hips.position.y=hy0; mixer.update(dt*life.k);
      if(life.pose)last=life.pose; life.w+=((life.pose?1:0)-life.w)*Math.min(1,dt*2); if(life.w<.01||!last)return; const S=POSE[last], w=life.w;
      if(S.drop&&hips)hips.position.y-=hy0*S.drop*w; for(const k in bones){ const a=S[k]; if(a)for(const b of bones[k])if(b)turnX(b,b.quaternion.clone(),a*w); }
      if(last==='graze'&&bones.Head[0]){ const j=B('Jaw'); if(j)turnX(j,j.quaternion.clone(),Math.max(0,Math.sin(performance.now()/180))*.15*w); } };
    return life; };
  // the paddock's gate, shut (owner, 9 Nov 2026: "make the gate closed"): a five-bar gate in the fence's gap, solid; a double click lifts its latch and you step through, it swings shut behind you
  SYS.onStart(()=>PARK.later(()=>{ const G=ST.gate; if(!G)return; const M=T/.84, x=X(G.x), z=Z(G.y), a=G.rot||0, ca=Math.cos(a), sa=Math.sin(a), y=SHARED.groundY?SHARED.groundY(x,z):0, Lm=4.4, H=1.15;
    const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=a; (MAPG.park||scene).add(g); const wood=new THREE.MeshLambertMaterial({color:0xd9ceb4}), post=new THREE.MeshLambertMaterial({color:0x8a7558});
    const put=(m,w,h,d,px,py,pz,rz=0)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w*M,h*M,d*M),m); o.position.set(px*M,py*M,pz*M); o.rotation.z=rz; o.castShadow=true; o.receiveShadow=true; return o; };
    g.add(put(post,.16,H+.25,.16,-Lm/2,(H+.25)/2,0),put(post,.16,H+.25,.16,Lm/2,(H+.25)/2,0));
    const leaf=new THREE.Group(); leaf.position.x=-Lm/2+.1*M; g.add(leaf); const lw=Lm-.22;
    for(let r=0;r<5;r++)leaf.add(put(wood,lw,.09,.05,lw/2,.18+r*(H-.3)/4,0)); leaf.add(put(wood,.09,H-.1,.06,.05,H/2,0),put(wood,.09,H-.1,.06,lw-.05,H/2,0),put(wood,Math.hypot(lw,H-.3)-.1,.08,.05,lw/2,H/2,0,Math.atan2(H-.3,lw)));
    const hx=(Math.abs(ca)*Lm+Math.abs(sa)*.25)/2*M, hz=(Math.abs(sa)*Lm+Math.abs(ca)*.25)/2*M, s=[x-hx,z-hz,x+hx,z+hz]; SOL.up.push(s); FIX.up.push([s[0],s[1],y,s[2],s[3],y+H*M]);
    const hit=new THREE.Mesh(new THREE.BoxGeometry(Lm*M,H*M,.6*M),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=H*M/2; g.add(hit);
    let sw=0; const nx=sa, nz=ca;   // across the fence
    FARM.gate={x,z,leaf,shut:()=>sw<=0};
    UI.thing({name:'THE PADDOCK GATE',obj:hit,reach:1.8*T,near:2.8*T,tall:1.2*T,act:()=>{ const sd=Math.sign((pos.x-x)*nx+(pos.z-z)*nz)||1; pos.x=x-sd*nx*1.3*T; pos.z=z-sd*nz*1.3*T; SHARED.target=null; if(SHARED.groundY)SHARED.py=SHARED.groundY(pos.x,pos.z); SHARED.heading=Math.atan2(-sd*nx,-sd*nz);
      sw=1.6; if(SFX.play)SFX.play('latch',{vol:.5}); SAY(sd>0?'YOU LIFT THE LATCH AND STEP INTO THE PADDOCK. THE GATE SWINGS SHUT BEHIND YOU.':'YOU LIFT THE LATCH AND STEP OUT. THE GATE SWINGS SHUT BEHIND YOU.','#e8e2cc'); }});
    SYS.add('life',dt=>{ if(sw<=0)return; sw=Math.max(0,sw-(dt||.016)); leaf.rotation.y=Math.sin(Math.min(1,sw/1.6)*Math.PI)*1.1; },'086a farm gate'); }),'086a-farm');
  window.FARMDBG=()=>({pen:FARM.pen,gate:FARM.gate&&{x:FARM.gate.x,z:FARM.gate.z}});
}
export {FARM};
