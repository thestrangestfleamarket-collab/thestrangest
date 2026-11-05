// THE FISHING CLOSE-UP (owner, 5 Nov 2026): when a fish comes for your hook, a close-up under the dark water of your line, hook and bait and that fish, in real time, over the whole screen or in a window (TAB toggles).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {FISHES} from './141f-fishes.js';
import {FISHING} from './142-fishing.js';
const CLOSEUP={on:false,mode:SAVE.get('closeup')==='window'?'window':'full'}; window.CLOSEUP=CLOSEUP;
{ const S=new THREE.Scene(), DEEP=new THREE.Color(.03,.07,.06); S.background=DEEP; S.fog=new THREE.FogExp2(DEEP,.55);
  S.add(new THREE.HemisphereLight(0x5f8a78,0x050807,1.0)); const L=new THREE.DirectionalLight(0xbfe6d8,1.1); L.position.set(.5,3,1); S.add(L);
  const cam=new THREE.PerspectiveCamera(42,1,.02,20);
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  // the motes in the water, a few light shafts from the surface
  S.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:450},(_,i)=>(hs(i,i%3)-.5)*(i%3===1?3:4)),3)),new THREE.PointsMaterial({color:0x9ec9b8,size:.012,transparent:true,opacity:.6})));
  const shaft=new THREE.MeshBasicMaterial({color:0x9fd6c2,transparent:true,opacity:.05,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  for(let i=0;i<5;i++){ const m=new THREE.Mesh(new THREE.PlaneGeometry(.4,5),shaft); m.position.set(-1.2+i*.6,1,-1.2-hs(i,2)); m.rotation.z=.18; S.add(m); }
  // the line, the hook, the bait
  const line=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,4,4).translate(0,2,0),new THREE.MeshBasicMaterial({color:0xd8e2dc})); S.add(line);
  const metal=new THREE.MeshStandardMaterial({color:0xc9ced2,metalness:.9,roughness:.3}), hook=new THREE.Group();
  const shank=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.15,8),metal); shank.position.y=.015; hook.add(shank);
  const bend=new THREE.Mesh(new THREE.TorusGeometry(.035,.005,8,20,Math.PI*1.25),metal); bend.position.set(.035,-.06,0); bend.rotation.z=Math.PI; hook.add(bend);
  const barb=new THREE.Mesh(new THREE.ConeGeometry(.008,.025,6),metal); barb.position.set(.07,-.032,0); hook.add(barb); S.add(hook);
  const worm=[], wm=new THREE.MeshLambertMaterial({color:0xd88a8a}), ball=new THREE.IcosahedronGeometry(1,2);
  for(let i=0;i<9;i++){ const s=new THREE.Mesh(ball,wm); s.scale.setScalar(.017-i*.0005); hook.add(s); worm.push(s); }
  const spoon=new THREE.Mesh(new THREE.SphereGeometry(.03,10,6).scale(1,.5,.25),metal); spoon.position.set(.07,-.08,0); hook.add(spoon);
  let fish=null, fishId=null, t=0;
  const setFish=id=>{ if(fishId===id)return; if(fish)S.remove(fish); fish=null; fishId=id; if(!id)return; const o=FISHES.model(id,1); if(!o)return; o.scale.setScalar(.3); S.add(o); fish=o; };
  const fit=()=>{ const C=renderer.domElement, W=C.width/renderer.getPixelRatio(), H=C.height/renderer.getPixelRatio(); return {W,H}; };
  // TAB toggles the close-up between the whole screen and a window in the corner
  addEventListener('keydown',e=>{ if(e.repeat||e.key!=='Tab'||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))return; if(!SHARED.fishing||!CLOSEUP.on)return; e.preventDefault();
    CLOSEUP.mode=CLOSEUP.mode==='full'?'window':'full'; SAVE.set('closeup',CLOSEUP.mode); });
  const tip=document.createElement('div'); tip.style.cssText='position:fixed;left:50%;bottom:86px;transform:translateX(-50%);font:11px Silkscreen,monospace;color:#7fe0a0;background:rgba(10,14,12,.7);border:1px solid #2c4436;padding:5px 9px;z-index:20;pointer-events:none'; tip.hidden=true; document.body.appendChild(tip);
  SYS.add('overlay',dt=>{ const s=FISHING.state&&FISHING.state(), near=!!s&&SHARED.fishing&&(s.st==='bite'||s.st==='wait'&&s.bid&&s.tb-s.t<8);
    CLOSEUP.on=near; tip.hidden=!near; if(!near){ if(fish)setFish(null); return; } tip.textContent=(s.st==='bite'?'BITE! CLICK TO STRIKE':'A FISH IS COMING')+' · TAB: '+(CLOSEUP.mode==='full'?'WINDOW':'FULL SCREEN'); if(!FISHES.ready){ FISHES.load(); return; }
    t+=dt; setFish(s.bid); const r=s.st==='bite'?0:s.tb-s.t;
    hook.position.set(Math.sin(t*.6)*.01,-.03+Math.sin(t*1.2)*.006+(s.st==='bite'?-.02*Math.abs(Math.sin(t*9)):0),0); hook.rotation.z=Math.sin(t*.8)*.08; line.position.set(hook.position.x,hook.position.y+.05,0);
    const lure=/^lure_/.test((FORAGE.S&&FORAGE.S.hook)||''); spoon.visible=lure; for(const w of worm)w.visible=!lure;
    worm.forEach((m,i)=>{ const a=t*3+i*.7; m.position.set(.07+Math.sin(a)*.012*i/8,-.055-i*.02,Math.cos(a)*.01); });
    if(fish){ let p, a;
      if(r>4){ const k=t*.7; p=new THREE.Vector3(Math.cos(k)*1.1,-.1+Math.sin(t*.5)*.1,Math.sin(k)*.6-.2); a=Math.atan2(-Math.cos(k)*.6,-Math.sin(k)*1.1); }
      else if(r>0){ const u=1-r/4, nib=s.nib?Math.max(0,Math.sin(t*16))*.06:0; p=new THREE.Vector3(.5-u*.32-nib,-.12,.04); a=Math.PI; }
      else { p=new THREE.Vector3(.18,-.13+Math.sin(t*14)*.01,.03); a=Math.PI+Math.sin(t*12)*.25; }
      fish.position.lerp(p,Math.min(1,dt*3)); fish.rotation.y+=((a-fish.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI)*Math.min(1,dt*4); }
    cam.position.set(.45+Math.sin(t*.12)*.2,.05,1.05); cam.lookAt(.15,-.09,0);
    const {W,H}=fit(), aut=renderer.autoClear; renderer.autoClear=true;
    if(CLOSEUP.mode==='full'){ cam.aspect=W/H; cam.updateProjectionMatrix(); renderer.setViewport(0,0,W,H); renderer.setScissorTest(false); renderer.setRenderTarget(null); renderer.render(S,cam); }
    else { const sz=Math.round(Math.min(W,H)*.42), x=W-sz-18, y=18; cam.aspect=1; cam.updateProjectionMatrix(); renderer.setRenderTarget(null); renderer.setScissorTest(true); renderer.setScissor(x,y,sz,sz); renderer.setViewport(x,y,sz,sz); renderer.render(S,cam); renderer.setScissorTest(false); renderer.setViewport(0,0,W,H); }
    renderer.autoClear=aut; },'142c-closeup'); }
