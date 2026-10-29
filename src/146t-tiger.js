// THE TIGER: a tiger in denim and shades at his clothes kiosk by the Central Park lake; he sells jackets, jeans and shades you wear (they dye your shirt and trousers, the shades sit on your face).
import {THREE} from './003-shx.js';
import {FORAGE, NPCS, SHOPS, UI} from './003b-systems.js';
import {SOL, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K;
  FORAGE.add({names:{jacket_denim:'DENIM JACKET',jacket_stud:'STUDDED JACKET',jeans:'BLUE JEANS',shades:'GREEN SHADES'}});

  /* ---------- him: orange fur with a few dark stripes, a white muzzle and whiskers, a pink nose; green shades on a studded band; a shiny denim jacket, a studded strap across his chest ---------- */
  const FUR='fur:#d8782c', WHT='fur:#f2ece0', STR='plain:#2a1c16', DEN='denim:#24426e', LTH='leather:#141416', STUD='metal:#c8c8cc';
  const model=()=>{ const sk=MERCH.skel({hipY:1.0,neck:.56,shX:.26,shY:.46,upper:.31,fore:.28,hipX:.11,thigh:.45,shin:.44}), {B}=sk;
    mk(B.torso,drape(LATHE([[.2,-.06],[.24,.08],[.27,.24],[.28,.38],[.25,.48],[.16,.55],[.09,.58]],32,.78),.01),DEN);
    mk(B.torso,new THREE.CylinderGeometry(.1,.12,.1,20),FUR,[0,.58,0]); mk(B.torso,drape(new THREE.TorusGeometry(.12,.035,12,28),.006),DEN,[0,.54,0],[Math.PI/2-.15,0,0],[1.3,1,1.1]);
    mk(B.torso,SPH(.2,28,20,0,Math.PI*2,0,Math.PI*.55),'fur:#f2ece0',[0,.5,.06],[-.35,0,0],[.55,.9,.5]);
    const strap=grp(B.torso,[0,.3,0],[0,0,.75]); mk(strap,new THREE.TorusGeometry(.25,.018,8,40),LTH,[0,0,0],[0,0,0],[1,1.3,.86]); for(let i=0;i<10;i++){ const a=-1.2+i*.25; mk(strap,SPH(.011,8,6),STUD,[Math.sin(a)*.25,Math.cos(a)*.325,.2]); }
    mk(B.hips,drape(LATHE([[.17,.06],[.2,-.06],[.21,-.16]],28,.85),.008),'denim:#2e4a78');
    const H=grp(B.head,[0,.14,0]); mk(H,SPH(.15,32,24),FUR,[0,0,0],[0,0,0],[1.05,.95,1]);
    mk(H,SPH(.085,24,16),WHT,[0,-.05,.1],[0,0,0],[1.1,.75,.8]); mk(H,SPH(.025,14,10),'plain:#d88898',[0,-.015,.165],[0,0,0],[1.3,.8,.8]);
    for(const s of [1,-1]){ mk(H,SPH(.045,16,10,0,Math.PI*2,0,Math.PI*.6),FUR,[.1*s,.12,-.01],[0,0,s*.3],[1,1,.5]); mk(H,SPH(.028,12,8),WHT,[.1*s,.12,.005],[0,0,s*.3],[.8,.8,.3]);
      for(let i=0;i<3;i++)mk(H,new THREE.CylinderGeometry(.0025,.0015,.16,4),'plain:#f4f2ee',[.1*s,-.04-i*.012,.13],[0,0,Math.PI/2+s*(-.15+i*.12)]);
      for(let i=0;i<2;i++)mk(H,new THREE.BoxGeometry(.012,.05,.04),STR,[.13*s,.03+i*.04,.06],[0,0,s*.4]);
      mk(H,new THREE.CylinderGeometry(.045,.045,.012,24),'glass:#1e6a3a',[.055*s,.03,.14],[Math.PI/2,0,0]); }
    for(let i=0;i<3;i++)mk(H,new THREE.BoxGeometry(.012,.05,.02),STR,[-.03+i*.03,.12,.11],[.5,0,0]);
    mk(H,new THREE.TorusGeometry(.155,.012,8,40,Math.PI*1.25),LTH,[0,.03,0],[Math.PI/2,0,Math.PI*.875]); mk(H,new THREE.BoxGeometry(.02,.012,.012),LTH,[0,.035,.145]);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],drape(new THREE.CylinderGeometry(.075,.068,.32,20,4),.006),DEN,[0,-.15,0]); mk(B['upperArm'+n],SPH(.085,18,12),DEN);
      mk(B['forearm'+n],drape(new THREE.CylinderGeometry(.066,.07,.28,20,4),.006),DEN,[0,-.13,0]); mk(B['hand'+n],SPH(.05,16,12),FUR,[0,-.05,0],[0,0,0],[1,1.2,.8]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.085,.072,.45,18),'denim:#2e4a78',[0,-.21,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.07,.064,.44,18),'denim:#2e4a78',[0,-.21,0]);
      mk(B['shoe'+n],new THREE.CapsuleGeometry(.055,.13,6,12),LTH,[0,-.05,.05],[Math.PI/2,0,0]); }
    return sk; };
  const KIT={g:null};
  MERCH.add({key:'tiger',label:'THE TIGER',height:2.0,model,size:11,hd:0,
    idle:t=>{ const p=(t%11)<3; return MERCH.pose({nod:p?-8:3,yaw:Math.sin(t*.3)*14,bend:-4,L:{ua:[p?70:12,-10],fa:[p?100:20,-20]},R:{ua:[12,-6],fa:[14,0]}}); },
    after:(B,N)=>{ if(KIT.g)KIT.g.visible=N.g.visible; }});

  /* ---------- his kiosk: a little green-roofed booth, jackets on a rail, jeans folded, a mirror and a stand of shades ---------- */
  const kit=N=>{ const G=new THREE.Group(), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,...o}), add=(geo,m,x,y,z,r)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); if(r)o.rotation.set(...r); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    const wood=std(0x2e4a3a), roof=std(0x1e5a3a,{roughness:.5}); add(new THREE.BoxGeometry(1.6,.9,.7),wood,0,.45,0); add(new THREE.BoxGeometry(1.7,.05,.8),std(0x8a6a4a),0,.92,0);
    for(const s of [-1,1])add(new THREE.BoxGeometry(.06,1.4,.06),wood,s*.8,1.6,-.3); add(new THREE.BoxGeometry(1.9,.08,1.1),roof,0,2.32,-.05,[.12,0,0]);
    add(new THREE.CylinderGeometry(.015,.015,1.5,8),std(0xb0b0b4,{metalness:.7}),0,1.85,-.3,[0,0,Math.PI/2]);
    const JC=[0x24426e,0x141416,0x3a5a8a,0x24426e]; for(let i=0;i<4;i++){ const j=add(new THREE.BoxGeometry(.3,.5,.06),std(JC[i],{roughness:.55}),-.5+i*.33,1.55,-.3); const c=add(new THREE.BoxGeometry(.06,.05,.05),std(0x9a9a9e,{metalness:.6}),-.5+i*.33,1.82,-.3); }
    for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.34,.06,.26),std([0x34507e,0x2a4470,0x4a6a9a][i]),-.4,.98+i*.06,.1);
    add(new THREE.BoxGeometry(.3,.5,.03),std(0xc8d8e0,{roughness:.05,metalness:.8}),.62,1.3,.15,[0,-.5,0]); add(new THREE.CylinderGeometry(.03,.05,.32,10),std(0x1a1a1e),.25,1.11,.15);
    for(let i=0;i<4;i++){ const a=i/4*Math.PI*2; add(new THREE.BoxGeometry(.12,.03,.02),std(0x1e6a3a,{roughness:.1,metalness:.4}),.25+Math.sin(a)*.05,1.3,.15+Math.cos(a)*.05,[0,a,0]); }
    G.scale.setScalar(T); const hd=N.st.hd; G.position.set(N.st.x+Math.sin(hd+1.57)*1.1*T,N.st.y||0,N.st.z+Math.cos(hd+1.57)*1.1*T); G.rotation.y=hd; N.g.parent.add(G); return G; };
  { const go=()=>{ const N=NPCS.extra.find(q=>q.key==='tiger'); if(!window.__started||!N||!N.g)return setTimeout(go,800); const G=KIT.g=kit(N);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1.7*T,1.4*T,.9*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(G.position.x,.7*T,G.position.z); N.g.parent.add(hb);
      UI.thing({name:'THE TIGER\'S KIOSK',obj:hb,reach:2*T,near:3*T,tall:1.4*T,act:()=>{ if(SHOPS.open)SHOPS.open(N); }}); const x=G.position.x, z=G.position.z; SOL.up.push([x-.85*T,z-.45*T,x+.85*T,z+.45*T]); };
    go(); }
}
