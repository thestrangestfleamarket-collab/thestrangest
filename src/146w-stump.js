// THE STUMP: an old tree being on a Central Park path — his head the top of a cut trunk with a wrinkled face, his body a rust-red clay pot hung with metal leaves, keys and charms — who sells maps from a stump table under his lantern; the menu's MAP shows only once you own one.
import {THREE} from './003-shx.js';
import {FORAGE, NPCS, SHOPS, UI} from './003b-systems.js';
import {SOL, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K;
  FORAGE.add({names:{map:'MAP OF THE MARKET'}});
  UI.mapOk=()=>FORAGE.has('map')>0;

  /* ---------- him: a bark-ridged trunk top for a head (rings on top, grey tufts), round black glassy eyes, a big nose; a rust clay-pot body with metal leaves and a chain of key and charms; grey knobbly hands ---------- */
  const BARK='wood:#6a5040', FACE='wood:#8a7a68', CLAY='plain:#9a4a30', MET='metal:#a8a49a', GREY='skin:#8a8680';
  const model=()=>{ const sk=MERCH.skel({hipY:.6,neck:.4,shX:.2,shY:.34,upper:.22,fore:.2,hipX:.09,thigh:.3,shin:.28}), {B}=sk;
    mk(B.torso,LATHE([[.18,-.02],[.24,.08],[.27,.2],[.26,.32],[.22,.38],[.24,.42],[.22,.44],[.1,.46]],32,.9),CLAY);
    for(let i=0;i<7;i++){ const a=-1.2+i*.4; mk(B.torso,SPH(.04,12,8),MET,[Math.sin(a)*.25,.38-Math.abs(a)*.05,Math.cos(a)*.22],[0,a,.6],[1.4,.5,.2]); }
    const ch=grp(B.torso,[0,.3,.22]); mk(ch,new THREE.TorusGeometry(.12,.005,6,30,Math.PI),MET,[0,0,0],[0,0,Math.PI]); mk(ch,new THREE.BoxGeometry(.02,.07,.006),'metal:#c8a040',[0,-.13,0]); mk(ch,new THREE.TorusGeometry(.015,.004,6,12),'metal:#c8a040',[0,-.09,0]); mk(ch,SPH(.015,8,6),'plain:#3a8a6a',[-.07,-.1,0]); mk(ch,SPH(.012,8,6),'plain:#a82a2a',[.07,-.1,0]);
    mk(B.hips,LATHE([[.18,.02],[.2,-.06],[.16,-.12]],28,.9),CLAY);
    const H=grp(B.head,[0,.12,0]); mk(H,drape(new THREE.CylinderGeometry(.17,.19,.32,28,6),.012),BARK);
    mk(H,new THREE.CylinderGeometry(.165,.165,.01,28),'wood:#c8a878',[0,.161,0]); for(let i=1;i<4;i++)mk(H,new THREE.TorusGeometry(.04*i,.003,4,28),'wood:#8a6a48',[0,.167,0],[Math.PI/2,0,0]);
    mk(H,SPH(.13,24,16,-.9,1.8,.3,2.4),FACE,[0,-.02,.07],[0,0,0],[1,1,.6]); for(const s of [1,-1]){ mk(H,SPH(.028,16,12),'glass:#0a0a0c',[.055*s,.02,.145]); mk(H,new THREE.TorusGeometry(.03,.006,6,16),FACE,[.055*s,.022,.142],[0,0,0],[1,.8,1]);
      mk(H,SPH(.04,12,8),'fur:#b8b4ac',[.15*s,.12,.0],[0,0,0],[1,.7,1]); mk(H,new THREE.ConeGeometry(.03,.09,10),FACE,[.18*s,.04,-.01],[0,0,-s*1.2]); }
    mk(H,new THREE.CapsuleGeometry(.03,.06,6,12),FACE,[0,-.03,.17],[1.3,0,0]); for(let i=0;i<3;i++)mk(H,new THREE.TorusGeometry(.04+i*.015,.003,4,16,Math.PI),'wood:#5a4434',[0,.08+i*.012,.155],[0,0,0]);
    mk(H,new THREE.TorusGeometry(.035,.005,6,16,Math.PI),'wood:#4a3424',[0,-.09,.145],[0,0,Math.PI]);
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],new THREE.CylinderGeometry(.045,.04,.22,14),BARK,[0,-.1,0]); mk(B['forearm'+n],new THREE.CylinderGeometry(.038,.034,.2,14),BARK,[0,-.09,0]);
      const h=grp(B['hand'+n],[0,-.04,0]); mk(h,SPH(.045,14,10),GREY,[0,0,0],[1,1.1,.7]); for(let i=0;i<4;i++)mk(h,new THREE.CapsuleGeometry(.011,.04,4,8),GREY,[-.025+i*.017,-.05,0],[0,0,(i-1.5)*.15]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.05,.045,.3,14),BARK,[0,-.14,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.045,.05,.28,14),BARK,[0,-.13,0]); mk(B['shoe'+n],SPH(.06,14,10),'wood:#4a3828',[0,-.03,.02],[0,0,0],[1,.6,1.4]); }
    return sk; };
  const KIT={g:null};
  MERCH.add({key:'stump',label:'THE STUMP',height:1.2,model,size:6,hd:0,
    idle:t=>{ const tell=(t%14)<5; return MERCH.pose({nod:Math.sin(t*.5)*4+(tell?-4:2),yaw:tell?Math.sin(t*1.1)*12:0,L:{ua:[tell?60+Math.sin(t*2)*15:20,20],fa:[tell?60:30,0]},R:{ua:[20,20],fa:[40,0]}}); },
    after:(B,N)=>{ if(KIT.g)KIT.g.visible=N.g.visible; }});

  /* ---------- his table: a wide old stump, a fan of folded maps, an iron lantern with a flame ---------- */
  const kit=N=>{ const G=new THREE.Group(), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...o}), add=(geo,m,x,y,z,r)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); if(r)o.rotation.set(...r); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    add(new THREE.CylinderGeometry(.42,.5,.6,24),std(0x5a4434),0,.3,0); add(new THREE.CylinderGeometry(.41,.41,.01,24),std(0xc8a878),0,.605,0); for(let i=1;i<5;i++)add(new THREE.TorusGeometry(.08*i,.004,4,28),std(0x8a6a48),0,.61,0,[Math.PI/2,0,0]);
    for(let i=0;i<5;i++)add(new THREE.BoxGeometry(.2,.012,.14),std([0xe8dcc0,0xd8c8a0,0xe0d4b4][i%3]),-.1+i*.03,.62+i*.012,.1,[0,-.3+i*.15,0]);
    const ir=std(0x2a2a2c,{metalness:.6,roughness:.4}); add(new THREE.BoxGeometry(.14,.02,.14),ir,.2,.62,-.15); for(const s of [-1,1])for(const q of [-1,1])add(new THREE.BoxGeometry(.01,.2,.01),ir,.2+s*.06,.73,-.15+q*.06); add(new THREE.ConeGeometry(.1,.08,4),ir,.2,.87,-.15,[0,Math.PI/4,0]);
    const fl=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),new THREE.MeshBasicMaterial({color:0xffb040})); fl.scale.y=1.6; fl.position.set(.2,.72,-.15); G.add(fl); const L=new THREE.PointLight(0xffa040,.8,3.5,2); L.position.set(.2,.75,-.15); G.add(L);
    G.scale.setScalar(T); const hd=N.st.hd; G.position.set(N.st.x+Math.sin(hd)*.8*T,N.st.y||0,N.st.z+Math.cos(hd)*.8*T); G.rotation.y=hd+Math.PI; N.g.parent.add(G); return G; };
  { const go=()=>{ const N=NPCS.extra.find(q=>q.key==='stump'); if(!window.__started||!N||!N.g)return setTimeout(go,800); const G=KIT.g=kit(N);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1*T,.8*T,1*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(G.position.x,.4*T,G.position.z); N.g.parent.add(hb);
      UI.thing({name:'THE STUMP\'S TABLE',obj:hb,reach:2*T,near:3*T,tall:.8*T,act:()=>{ if(SHOPS.open)SHOPS.open(N); }}); const x=G.position.x, z=G.position.z; SOL.up.push([x-.45*T,z-.45*T,x+.45*T,z+.45*T]); };
    go(); }
}
