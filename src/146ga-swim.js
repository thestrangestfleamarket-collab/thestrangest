// SWIMMING: SWIM steers you in any water (SPACE down, SHIFT up, or look and swim in first person; still, you drift slowly up), draws your arms swimming in first person, the motes and the dark edge under water, and the rented scuba set's tank.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FAR3, FORAGE, ITEMS, LEVELS, LOOKS, st, SWIM, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, SYS, TILE, ZU} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {DFOG} from './134e-distfog.js';
Object.assign(SWIM,{d:null,tankS:0}); window.SWIM=SWIM;
{ const T=TILE, WM=T/.84, MS=T/(.84*ZU), V=THREE.Vector3, say=(t,c)=>{ SAY(t,c||'#9fd8ff'); };   // WM: world units a metre; MS: the rig's units a metre
  let told=false;
  // under the water you see from behind or through your own eyes, the overhead view back when you come up (owner, 7 Nov 2026: the wreck seen as you dive; whatever takes the view itself keeps it)
  const dive=on=>{ if(on&&!SWIM.vw&&UI.view==='iso'){ SWIM.vw='iso'; UI.setView('first'); } else if(!on&&SWIM.vw){ const v=SWIM.vw; SWIM.vw=null; UI.setView(v); } };
  SYS.add('swim',(st,dt,keys,go)=>{ const W=st.water; if(!W||!W.in||W.level==null){ SWIM.d=null; if(W)W.dive=false; dive(false); return; }
    const lvl=W.level, now=lvl-W.y, max=Math.max(30,lvl-W.floor-8), sp=(W.fast?2.8:1.8)*MS, back=keys.has('s')||keys.has('arrowdown');
    let v=(keys.has(' ')||keys.has('j')?sp:0)-(keys.has('shift')?sp:0);
    if(UI.view==='first'&&go&&!UI.freeCam){ const p=SHARED.pitch; if(Math.abs(p)>(SWIM.d==null?.25:.12))v+=Math.sin(p)*sp*1.2*(back?-1:1); }   // first person: you swim where you look
    if(SWIM.d==null&&v>0){ SWIM.d=Math.max(30,now); if(!told){ told=true; say('SPACE SWIMS DOWN, SHIFT UP; IN FIRST PERSON YOU SWIM WHERE YOU LOOK.'); } }
    if(SWIM.d!=null){ if(!v&&!(EQUIP.breathe&&SWIM.tankS>0))v=-.3*MS;   // still, you drift slowly up; a diver's set holds you level
      SWIM.d=Math.max(now-15,Math.min(max,now+30,SWIM.d+v*dt)); if(SWIM.d<28&&v<0)SWIM.d=null; }
    W.dive=SWIM.d!=null; W.deep=SWIM.d||0; dive(W.dive); },'146ga-swim');

  // your arms in first person: two arms in the camera's space, a breaststroke under, a crawl on top, treading or sculling when still
  const skin=new THREE.MeshLambertMaterial({color:0xe6c4b0}), seg=()=>new THREE.Mesh(new THREE.CapsuleGeometry(1,4,3,8),skin), root=LEVELS.own(new THREE.Group(),'*'); root.name='swimarms'; root.visible=false; scene.add(root);
  const ARMS=[-1,1].map(s=>{ const up=seg(), fo=seg(), hd=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),skin); for(const m of [up,fo,hd]){ m.frustumCulled=false; root.add(m); } return {s,up,fo,hd}; });
  const BR=[[0,.07,-.1,-.62],[.3,.4,-.1,-.48],[.55,.17,-.26,-.26],[.7,.06,-.15,-.34],[1,.07,-.1,-.62]], CR=[[0,.14,-.05,-.58],[.25,.12,-.45,-.36],[.5,.2,-.72,.02],[.75,.36,.04,-.16],[1,.14,-.05,-.58]];
  const key=(K,p,o)=>{ p=((p%1)+1)%1; let i=0; while(p>K[i+1][0])i++; const a=K[i], b=K[i+1], u=(p-a[0])/(b[0]-a[0]), k=u*u*(3-2*u); return o.set(a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[3]+(b[3]-a[3])*k); };
  const hA=new V(), hB=new V(), hC=new V(), hD=new V(), Y=new V(0,1,0), d=new V(), e=new V(), pl=new V(), Dv=new V(); let t=0, sk='';
  const place=(m,a,b,r)=>{ d.subVectors(b,a); const L=d.length()||1e-4; m.position.addVectors(a,b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(Y,d.divideScalar(L)); m.scale.set(r,(L+2*r)/6,r); };   // the capsule is 6 tall: its ends just past each joint
  SYS.add('cam',dt=>{ const W=st.water, sw0=!!(W&&W.in)&&!VIT.dead&&UI.persp&&!UI.freeCam, cam=SHARED.cam;
    if(sw0){ const eye=SHARED.py+(W.y+28)*ZU;   // the eyes go down with you: just under the head's top, so under water when you are
      if(UI.view==='first')cam.position.y=eye; else if(!(window.FOUNT&&FOUNT.swim)&&W.under>.01)cam.position.y+=(Math.min(cam.position.y,eye+.6*WM)-cam.position.y)*Math.min(1,W.under); }
    const on=UI.view==='first'&&sw0; root.visible=on; if(!on)return; t+=dt||.016;
    const c=LOOKS.COL&&LOOKS.COL.skin; if(c&&c!==sk){ sk=c; skin.color.set(c); }
    root.position.copy(cam.position); root.quaternion.copy(cam.quaternion); root.scale.setScalar(WM);
    const sw=Math.min(1,W.swim||0), un=Math.min(1,W.under||0), ph=W.ph||0;
    for(const A of ARMS){ const s=A.s, o=s>0?0:.5;
      key(BR,ph,hA); key(CR,ph+o,hB); hC.set(.24+.05*Math.sin(t*3+o*6),-.42+.03*Math.cos(t*3+o*6),-.34+.06*Math.cos(t*3+o*6)); hD.set(.22+.07*Math.sin(t*1.6+o*6),-.22,-.42+.05*Math.cos(t*1.6+o*6));
      hB.lerp(hA,un); hC.lerp(hD,un); hC.lerp(hB,sw); hC.x*=s;   // hC: where this hand is
      const S=e.set(.19*s,-.27,.04), Lr=.3, Lf=.29, D=Dv.subVectors(hC,S), L=Math.min(D.length(),Lr+Lf-.005); D.normalize(); hC.copy(S).addScaledVector(D,L);
      const x=(Lr*Lr-Lf*Lf+L*L)/(2*L), h=Math.sqrt(Math.max(0,Lr*Lr-x*x)); pl.set(s,-.7,.25); pl.addScaledVector(D,-pl.dot(D)).normalize();   // the elbow out and down
      const El=hD.copy(S).addScaledVector(D,x).addScaledVector(pl,h);
      place(A.up,S,El,.042); place(A.fo,El,hC,.035); A.hd.position.copy(hC).addScaledVector(D,.06); A.hd.quaternion.copy(A.fo.quaternion); A.hd.scale.set(.042,.08,.02); } },'146ga-swim arms');

  // under water: motes drifting in the murk round your eyes, and the edges of the view darker
  const NM=500, R=3*WM, mg=new THREE.BufferGeometry(), mp=new Float32Array(NM*3), m0=new Float32Array(NM*3); for(let i=0;i<NM*3;i++)m0[i]=(Math.random()*2-1)*R;
  mg.setAttribute('position',new THREE.BufferAttribute(mp,3)); const motes=LEVELS.own(new THREE.Points(mg,new THREE.PointsMaterial({color:0xa8c49a,size:.012*WM,transparent:true,opacity:.5,depthWrite:false})),'*'); motes.frustumCulled=false; motes.visible=false; scene.add(motes);
  const vig=document.createElement('div'); vig.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;display:none;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(4,16,8,.55) 100%)'; document.body.appendChild(vig);
  let uw=false, mt=0, seen=0, dfo=false, cf=null; const far=[], hid=[], P=new V();   // far things that ignore fog (the far city, backdrops): hidden while you are under, the murk would hide them
  (MODS.waters=MODS.waters||[]).push({pre:(scene,cam)=>{ uw=!!(scene.fog&&scene.fog.uw)&&!!cam&&!cam.isOrthographicCamera; motes.visible=uw; if(vig.style.display!==(uw?'':'none'))vig.style.display=uw?'':'none'; if(!uw){ seen=0; return; } if(DFOG.pass){ dfo=!DFOG.pass.enabled; DFOG.pass.enabled=true; DFOG.under={s:scene.fog.near,e:scene.fog.far,c:scene.fog.color}; }   // the distance fog pass becomes the water's fog: nothing past the murk shows
    if(performance.now()-seen>2000){ seen=performance.now(); far.length=0; scene.traverse(o=>{ const m=o.material; if(!(o.isMesh||o.isPoints)||!m||Array.isArray(m)||m.fog!==false||m.uniforms&&m.uniforms.uUW)return; far.push(o); }); }
    for(const o of [FAR3.mesh,FAR3.farMesh,FAR3.panels,FAR3.trees])if(o&&o.isObject3D&&o.visible){ o.visible=false; hid.push(o); }   // the far city's own mist shader skips the fog
    const lim=scene.fog.far*1.3; for(const o of far){ if(!o.visible)continue; o.getWorldPosition(P); if(P.distanceTo(cam.position)>lim){ o.visible=false; hid.push(o); } }
    SWIM.view=0; if(SWIM.cut!==false&&cam.far>lim){ cf={cam,far:cam.far}; cam.far=lim; cam.updateProjectionMatrix(); SWIM.view=lim; SWIM.murk=scene.fog.far; }   // nothing past the murk is drawn at all: the view ends just beyond it
    mt+=1/60; const c=cam.position, a=mg.attributes.position.array, w=2*R;
    for(let i=0;i<NM;i++){ for(let k=0;k<3;k++){ const base=m0[i*3+k]+(k===1?-mt*.05*WM:Math.sin(mt*.3+i)*.1*WM), cc=k===0?c.x:k===1?c.y:c.z; a[i*3+k]=cc+(((base-cc)%w+w*1.5)%w-R); } }
    mg.attributes.position.needsUpdate=true; },post:()=>{ for(const o of hid)o.visible=true; hid.length=0; if(cf){ cf.cam.far=cf.far; cf.cam.updateProjectionMatrix(); cf=null; } if(DFOG.pass){ DFOG.under=null; if(dfo){ DFOG.pass.enabled=false; dfo=false; } } }});

  // the rented scuba set: a full tank when you rent it, worn on your back; under water it breathes for you until it runs dry, then it goes back to the shark
  FORAGE.add({names:{scuba:'SCUBA SET (RENTAL)'}});
  const save=()=>{ try{ OWNED.set('tank',String(Math.max(0,SWIM.tankS).toFixed(1))); }catch(e){} }; try{ SWIM.tankS=+OWNED.get('tank')||0; }catch(e){}
  SWIM.tank=()=>EQUIP.breathe?SWIM.tankS:0; let st5=0;
  VIT.supply=dt=>{ '@later'; if(!EQUIP.breathe||SWIM.tankS<=0)return false; SWIM.tankS-=dt; if(VIT.air<VIT.airMax)VIT.air=Math.min(VIT.airMax,VIT.air+dt*VIT.airMax/2.5);   // breathing from the tank: your own breath comes back if((st5+=dt)>5){ st5=0; save(); }
    if(SWIM.tankS<=0){ SWIM.tankS=0; const id=EQUIP.by.back; if(id){ EQUIP.off('back'); if(ITEMS.prop(id,'rental'))FORAGE.take(id,1); } save(); say('YOUR TANK IS EMPTY. THE RENTED SET GOES BACK TO FISHING & SCUBA.','#c8a090'); if(FORAGE.draw)FORAGE.draw(); return false; } return true; };
  VIT.tankTxt=()=>EQUIP.breathe&&SWIM.tankS>0?' · TANK '+Math.floor(SWIM.tankS/60)+':'+String(Math.floor(SWIM.tankS%60)).padStart(2,'0'):'';
  SYS.add('rent',id=>{ const s=+ITEMS.prop(id,'tank')||0; if(!s)return; SWIM.tankS=s; save(); if(EQUIP.by[ITEMS.prop(id,'slot')]!==id)EQUIP.wear(id,true);
    say('THE FISHERMAN STRAPS ON A FULL TANK: '+Math.round(s/60)+' MINUTES OF AIR UNDER WATER.'); },'146ga-swim');
  window.SWIMDBG=()=>{ const W=st.water; return {in:!!(W&&W.in),dive:!!(W&&W.dive),d:SWIM.d,y:W&&W.y,level:W&&W.level,floor:W&&W.floor,arms:root.visible,uw,view:SWIM.view,murk:SWIM.murk,tank:SWIM.tankS,breathe:!!EQUIP.breathe,air:VIT.air}; }; }
