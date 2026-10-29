// SONIEE: a mint vending machine on the subway platform whose three bottles are alive (they grin, peek and fidget in its window); it sells them: pink makes you faster, white stronger, teal mends you, each for a while (the items' BOOST).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, SHOPS, UI} from './003b-systems.js';
import {MAPG, SOL, SYS, TILE} from './006-map-pre.js';
const SONIEE={g:null}; window.SONIEE=SONIEE;
{ const T=TILE; FORAGE.add({names:{soda_pink:'SONIEE PINK (FASTER)',soda_white:'SONIEE WHITE (STRONGER)',soda_teal:'SONIEE TEAL (MENDING)'}});
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.5,...o});
  // a bottle with a face: a fuzzy body, two eyes, a mouth; each its own look
  const bottle=(c,face)=>{ const G=new THREE.Group(), fz=std(c,{roughness:.95});
    const b=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.18,8,16),fz); b.position.y=.18; G.add(b); const nk=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,.08,12),std(0xe8e8ec,{roughness:.3,metalness:.4})); nk.position.y=.38; G.add(nk);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.03,12),std(c)); cap.position.y=.43; G.add(cap);
    for(const s of [1,-1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(.02,10,8),std(0x141416)); e.position.set(.035*s,.24,.085); G.add(e); const w=new THREE.Mesh(new THREE.SphereGeometry(.007,6,4),std(0xffffff)); w.position.set(.03*s,.25,.1); G.add(w);
      if(face.lash){ const l=new THREE.Mesh(new THREE.BoxGeometry(.03,.004,.004),std(0x141416)); l.position.set(.035*s,.265,.088); l.rotation.z=s*.4; G.add(l); }
      if(face.cheek){ const k=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),std(0xf08aa8)); k.scale.set(1,.6,.3); k.position.set(.06*s,.2,.08); G.add(k); } }
    const m=new THREE.Mesh(new THREE.TorusGeometry(face.grin?.04:.025,.008,6,16,Math.PI),std(0x2a1418)); m.position.set(face.smirk?.015:0,.19,.088); m.rotation.z=Math.PI+(face.smirk?.35:0); G.add(m);
    if(face.tooth){ const t=new THREE.Mesh(new THREE.BoxGeometry(.012,.012,.004),std(0xffffff)); t.position.set(.02,.178,.09); G.add(t); } return G; };
  const machine=()=>{ const G=new THREE.Group(), mint=std(0x9ad8c0,{roughness:.45}), add=(geo,m,x,y,z,r)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); if(r)o.rotation.set(...r); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    // the cabinet in pieces, so its window is open onto the bottles inside: a lower body, a header, two sides, the tap column, a back
    add(new THREE.BoxGeometry(.9,.78,.7),mint,0,.39,0); add(new THREE.BoxGeometry(.9,.2,.7),mint,0,1.75,0); add(new THREE.BoxGeometry(.06,.87,.7),mint,-.42,1.215,0); add(new THREE.BoxGeometry(.18,.87,.7),mint,.36,1.215,0);
    add(new THREE.BoxGeometry(.7,.87,.04),std(0x2a3a36,{roughness:.6}),-.03,1.215,-.25); add(new THREE.BoxGeometry(.66,.02,.4),std(0xc8ccd0,{metalness:.7,roughness:.3}),-.03,.8,.05);
    const lamp=new THREE.PointLight(0xd8fff0,.6,1.6,2); lamp.position.set(-.03,1.55,.15); G.add(lamp);
    const glass=new THREE.Mesh(new THREE.BoxGeometry(.66,.86,.01),new THREE.MeshStandardMaterial({color:0xd8f4ff,roughness:.05,transparent:true,opacity:.18,depthWrite:false})); glass.position.set(-.03,1.215,.34); G.add(glass);
    for(let i=0;i<14;i++){ const p=add(new THREE.CircleGeometry(.012+(i%3)*.006,10),std([0xf08aa8,0xf2d020,0x2a8a8a,0xffffff][i%4]),-.4+((i*37)%80)/100,.15+((i*53)%160)/100,.351); }
    const sp=add(new THREE.CircleGeometry(.16,24),std(0xf2d020),-.08,.52,.352); sp.scale.set(1.5,.8,1); const tx=document.createElement('canvas'); tx.width=128; tx.height=32; const g=tx.getContext('2d'); g.fillStyle='#1a8a8a'; g.font='bold 24px sans-serif'; g.textAlign='center'; g.fillText('SONIEE',64,25);
    const t=new THREE.CanvasTexture(tx); t.colorSpace=THREE.SRGBColorSpace; const lb=new THREE.Mesh(new THREE.PlaneGeometry(.36,.09),new THREE.MeshBasicMaterial({map:t,transparent:true})); lb.position.set(-.08,.52,.354); G.add(lb);
    const st=add(new THREE.CircleGeometry(.06,20),std(0xffffff),.3,1.72,.352); const t2=document.createElement('canvas'); t2.width=t2.height=32; const g2=t2.getContext('2d'); g2.fillStyle='#222'; g2.font='bold 18px sans-serif'; g2.textAlign='center'; g2.fillText('06',16,23); const n6=new THREE.Mesh(new THREE.PlaneGeometry(.1,.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(t2),transparent:true})); n6.position.set(.3,1.72,.354); G.add(n6);
    add(new THREE.BoxGeometry(.14,.3,.05),std(0xc8ccd0,{metalness:.8,roughness:.25}),.34,1.1,.36); add(new THREE.CylinderGeometry(.015,.015,.08,10),std(0xc8ccd0,{metalness:.8,roughness:.2}),.34,.92,.4,[Math.PI/2,0,0]);
    add(new THREE.BoxGeometry(.5,.14,.08),std(0x141418),-.05,.22,.33);
    const B=[bottle(0xf08aa8,{grin:1}),bottle(0xf4f2ee,{lash:1,cheek:1}),bottle(0x3aa8a8,{smirk:1,tooth:1})]; B.forEach((b,i)=>{ b.position.set(-.25+i*.22,.81,.05); G.add(b); }); G.userData.B=B;
    return G; };

  { const go=()=>{ const M=SHARED.METRO; if(!window.__started||!M||!M.lane||!MAPG.down)return setTimeout(go,800);
      // the platform is an island between two tracks: it stands on its middle line just short of a bench, facing the stairs
      const SL=M.SL, tx=(SL.P0+SL.P1)/2, ty=SL.BENCH[1]-3.2, p=M.at(tx,ty), q=M.at(tx,ty-1);
      const G=SONIEE.g=machine(); G.scale.setScalar(T); G.position.set(p.x,M.ground(p.x,p.z),p.z); G.rotation.y=Math.atan2(q.x-p.x,q.z-p.z); MAPG.down.add(G);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1*T,1.9*T,.8*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=.95; hb.scale.setScalar(1/T); G.add(hb);
      UI.thing({name:'SONIEE',obj:hb,reach:2*T,near:3*T,tall:1.9*T,act:()=>{ if(SHOPS.open)SHOPS.open({key:'soniee',name:'SONIEE'}); FORAGE.say&&FORAGE.say(['"PICK ME. NO, ME."','"GET US OUT OF HERE."','"PSST. THE BUTTON. PRESS IT."'][Math.floor(Math.random()*3)],'#9ad8c0'); }});
      SOL.down.push([p.x-.45*T,p.z-.45*T,p.x+.45*T,p.z+.45*T]); };
    go(); }
  // the bottles fidget: they bob, lean together to plot, and now and then one presses its face to the glass
  SYS.add('life',dt=>{ const G=SONIEE.g; if(!G||!G.visible||SHARED.LVL!=='down')return; const t=performance.now()/1000, B=G.userData.B, plot=(t%12)<3, peek=Math.floor(t/7)%3;
    B.forEach((b,i)=>{ b.position.y=.81+Math.abs(Math.sin(t*2.2+i*1.7))*.02; b.rotation.z=plot?(1-i)*.25:Math.sin(t*1.3+i)*.06; b.position.z=.05+(!plot&&(t%7)<1.2&&peek===i?.2:0); b.rotation.y=plot?(1-i)*.4:0; }); },'146u-soniee');
}
