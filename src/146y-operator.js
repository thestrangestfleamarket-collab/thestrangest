// THE OPERATOR: a pale blue horned demon in dusty white robes, always on his light blue phone, at a switchboard stand on Market St; he sells a telephone for your home (150j) and a bulky cell phone you carry. Either one calls any shopkeeper in the city and buys from them where you stand.
import {THREE} from './003-shx.js';
import {FORAGE, NPCS, SHOPS, UI, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const PHONE={}; window.PHONE=PHONE;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K;
  FORAGE.add({names:{phone_home:'HOME TELEPHONE',phone_cell:'CELL PHONE'}});

  /* ---------- the dial: every shopkeeper in characters.json; a call opens their shop ---------- */
  const W=document.createElement('div'); W.hidden=true; W.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:22;background:#0b0d13f4;border:2px solid #3a3f4e;padding:12px;font:11px Silkscreen,monospace;color:#d8dae2;width:min(360px,90vw);max-height:70vh;overflow:auto;zoom:var(--uiz,1)';
  document.body.appendChild(W); for(const ev of ['keydown','keyup'])W.addEventListener(ev,e=>{ if(e.key==='Escape')W.hidden=true; e.stopPropagation(); });
  PHONE.list=()=>Object.entries(LEVEL.chars||{}).filter(([id,r])=>r&&r.trade&&Array.isArray(r.trade.sells)&&r.trade.sells.length).map(([id,r])=>({id,name:r.name||id.toUpperCase()})).sort((a,b)=>a.name<b.name?-1:1);
  PHONE.dial=how=>{ const L=PHONE.list(); W.innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:8px"><b style="color:#9ac8f0">${how==='home'?'THE HOME TELEPHONE':how==='tablet'?'THE TABLET':'THE CELL PHONE'}: WHO ARE WE CALLING?</b><button data-x style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;cursor:pointer">HANG UP</button></div>`+
      L.map(c=>`<button data-c="${c.id}" style="display:block;width:100%;text-align:left;margin:2px 0;font:inherit;color:#ece5d3;background:#141822;border:2px solid #2a3040;padding:4px 6px;cursor:pointer">${c.name}</button>`).join(''); W.hidden=false; };
  W.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.x!==undefined){ W.hidden=true; return; }
    const id=b.dataset.c; if(!id)return; W.hidden=true; const r=(LEVEL.chars||{})[id]; SAY('RING... RING... '+((r&&r.name)||'THEY')+' PICKS UP. "DELIVERY? SURE."','#9ac8f0'); if(SHOPS.open)SHOPS.open(NPCS.extra&&NPCS.extra.find(q=>q.key===id)||{key:id,name:r&&r.name}); });
  // the cell phone: held, a click dials
  const cell=()=>{ const G=new THREE.Group(), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.5,...o}); const b=new THREE.Mesh(new THREE.BoxGeometry(.06,.2,.035),std(0x2a2c30)); G.add(b);
    const ant=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.09,8),std(0x141416)); ant.position.set(.02,.14,0); G.add(ant); const sc=new THREE.Mesh(new THREE.PlaneGeometry(.045,.035),std(0x8ab070,{emissive:0x203818})); sc.position.set(0,.05,.018); G.add(sc);
    for(let i=0;i<9;i++){ const k=new THREE.Mesh(new THREE.BoxGeometry(.012,.008,.004),std(0xc8c8c0)); k.position.set(-.016+(i%3)*.016,-.01-Math.floor(i/3)*.016,.018); G.add(k); } return G; };
  const k={name:'CELL PHONE',hint:'A CLICK DIALS.',make:()=>{ const g=cell(); g.scale.multiplyScalar(1.5); g.head=new THREE.Vector3(0,.2,0); return g; },use:()=>{ if(FORAGE.has('phone_cell'))PHONE.dial('cell'); }};
  (WIELD.pend=WIELD.pend||[]).push(['phone_cell',k]); if(WIELD.kind)WIELD.kind('phone_cell',k);

  /* ---------- him: pale blue cracked skin, four ridged ivory horns, pointed ears, black eye holes, bared teeth, a crown of little flowers and beads; dusty white robes, bead necklaces, a bone medallion; a light blue phone at his ear ---------- */
  const SKIN='skin:#a8c4dc', HORN='ivory:#e4dcc8', ROBE='cloth:#e8e4da', DARK='plain:#0c0e14';
  const model=()=>{ const sk=MERCH.skel({hipY:1.02,neck:.58,shX:.25,shY:.47,upper:.32,fore:.29,hipX:.1}), {B}=sk;
    mk(B.torso,drape(LATHE([[.21,-.08],[.25,.1],[.27,.3],[.26,.46],[.2,.54],[.1,.6]],32,.85),.014),ROBE); mk(B.hips,drape(LATHE([[.21,.05],[.25,-.25],[.3,-.7],[.33,-.98]],32,.9),.016),ROBE);
    for(let j=0;j<2;j++)for(let i=0;i<14;i++){ const a=-1.3+i*.2; mk(B.torso,SPH(.013,8,6),['plain:#c84a3a','plain:#3a7ab0','plain:#e8c050','plain:#2a2a2a'][(i+j)%4],[Math.sin(a)*(.15+j*.04),.5-Math.cos(a*1.2)*(.1+j*.06),Math.cos(a)*(.14+j*.04)+.02]); }
    mk(B.torso,new THREE.CylinderGeometry(.04,.04,.012,16),'ivory:#d8ccb0',[0,.32,.25],[Math.PI/2,0,0]);
    const H=grp(B.head,[0,.13,0]); mk(H,SPH(.11,32,24),SKIN,[0,0,0],[0,0,0],[.92,1.08,1]);
    for(const s of [1,-1]){ mk(H,SPH(.026,14,10),DARK,[.038*s,.015,.088],[0,0,0],[1.1,.8,.6]); mk(H,new THREE.ConeGeometry(.03,.09,10),SKIN,[.11*s,.02,-.01],[0,0,-s*1.3]);
      for(const [y,l,r] of [[.08,.16,-.5],[.04,.12,-.9]]){ const hn=grp(H,[.05*s,y,-.02],[0,0,s*r]); for(let q=0;q<4;q++)mk(hn,new THREE.TorusGeometry(.016-q*.003,.006,6,14),HORN,[0,q*l/4,0],[Math.PI/2,0,0]); mk(hn,new THREE.ConeGeometry(.012,l*.4,10),HORN,[0,l,0]); } }
    mk(H,new THREE.BoxGeometry(.07,.016,.01),'plain:#e8e4dc',[0,-.06,.095]); mk(H,new THREE.BoxGeometry(.075,.022,.008),DARK,[0,-.06,.093]);
    for(let i=0;i<9;i++){ const a=-1.2+i*.3; mk(H,SPH(.014,8,6),['plain:#e85a7a','plain:#f2e8c8','plain:#e8b030'][i%3],[Math.sin(a)*.1,.075+Math.cos(a)*.01,Math.cos(a)*.095]); }
    const ph=grp(H,[.1,-.01,.02],[0,0,-.2]); mk(ph,new THREE.CapsuleGeometry(.018,.14,6,12),'plastic:#9ac8e8',[0,-.04,.02],[.4,0,0]);
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],drape(new THREE.CylinderGeometry(.065,.08,.32,18,4,true),.01),ROBE,[0,-.15,0]); mk(B['upperArm'+n],SPH(.072,16,12),ROBE);
      mk(B['forearm'+n],drape(new THREE.CylinderGeometry(.07,.1,.29,18,4,true),.01),ROBE,[0,-.13,0]); mk(B['hand'+n],SPH(.04,14,10),SKIN,[0,-.05,0],[0,0,0],[1,1.2,.7]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.055,.05,.45,14),ROBE,[0,-.21,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.045,.04,.45,14),SKIN,[0,-.21,0]); mk(B['shoe'+n],new THREE.CapsuleGeometry(.04,.1,6,10),'leather:#8a7a60',[0,-.04,.04],[Math.PI/2,0,0]); }
    return sk; };
  const KIT={g:null};
  MERCH.add({key:'operator',label:'THE OPERATOR',height:2.05,model,size:11,hd:0,
    idle:t=>MERCH.pose({nod:Math.sin(t*.7)*5,yaw:Math.sin(t*.35)*12,L:{ua:[30,-10],fa:[70,-30]},R:{ua:[150,-40],fa:[150,-20]}}),
    after:(B,N)=>{ if(KIT.g)KIT.g.visible=N.g.visible; }});

  /* ---------- his stand: a tall switchboard of jacks and blinking lamps, coiled cords, handsets hung on hooks ---------- */
  const kit=N=>{ const G=new THREE.Group(), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,...o}), add=(geo,m,x,y,z,r)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); if(r)o.rotation.set(...r); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    add(new THREE.BoxGeometry(1.3,1.7,.4),std(0x3a2a20),0,.85,0); add(new THREE.BoxGeometry(1.1,.9,.02),std(0x141414),0,1.25,.21);
    const lamps=[]; for(let r=0;r<5;r++)for(let c=0;c<9;c++){ add(new THREE.CylinderGeometry(.018,.018,.02,10),std(0x2a2a2a,{metalness:.6}),-.44+c*.11,.9+r*.16,.22,[Math.PI/2,0,0]); const l=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshBasicMaterial({color:0x402010})); l.position.set(-.44+c*.11,.97+r*.16,.225); G.add(l); lamps.push(l); }
    add(new THREE.BoxGeometry(1.2,.06,.4),std(0x5a4030),0,.7,.25); for(let i=0;i<6;i++){ const cd=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.4+i*.15,.72,.3),new THREE.Vector3(-.35+i*.13,.55,.38),new THREE.Vector3(-.3+i*.12,.95+(i%3)*.15,.24)]),16,.008,5),std([0xc83a2a,0x2a2a2a,0xe8c050][i%3])); G.add(cd); }
    for(let i=0;i<4;i++){ add(new THREE.CapsuleGeometry(.025,.16,6,10),std([0x9ac8e8,0x2a2a2a,0xe8e4da,0xc8302a][i]),-.5+i*.33,1.8,.1,[0,0,Math.PI/2]); }
    G.userData.lamps=lamps; G.scale.setScalar(T); const hd=N.st.hd; G.position.set(N.st.x-Math.sin(hd)*.7*T,N.st.y||0,N.st.z-Math.cos(hd)*.7*T); G.rotation.y=hd; N.g.parent.add(G); return G; };
  { NPCS.when('operator',N=>{ const G=KIT.g=kit(N);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1.3*T,1.7*T,.5*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(G.position.x,.85*T,G.position.z); N.g.parent.add(hb);
      UI.thing({name:'THE OPERATOR\'S SWITCHBOARD',obj:hb,reach:2*T,near:3*T,tall:1.7*T,act:()=>{ if(SHOPS.open)SHOPS.open(N); }}); const x=G.position.x, z=G.position.z; SOL.up.push([x-.65*T,z-.25*T,x+.65*T,z+.25*T]);
      let lt=0; SYS.add('life',dt=>{ if((lt-=dt||0)>0||!G.visible)return; lt=.7; for(const l of G.userData.lamps)l.material.color.setHex(Math.random()<.18?0xffb040:0x402010); },'146y-operator'); }); }
}
export {PHONE};
