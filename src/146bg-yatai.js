// THE DARK ALLEY: a place off the map (GO TO it from the map): a wet service alley at night, brick on both sides, a bar's back door, dumpsters, and the ramen cart. Use the cart to work it (YATAI '86, as a holodeck program does). While a tenant is working it, everyone in the alley sees it happen at the cart, which is YATAI '86's own cart and its own things, mesh for mesh (data/yatai.json, baked out of that game by tools/yatai-bake.cjs), each thing where the cook has it, the cook's hands and sleeves too; who sits on which stool, what is said; a tenant who takes a stool is the cook's customer (an order, a bowl, and they pay for it); and the cook sees and hears whoever is in the alley (the cook's page's word through the section, t 'yt')
import {SHARED, THREE} from './003-shx.js';
import {INV, ONLINE, pos, ROOMS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MAPSTAIR, MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
{ const T=TILE, MW=TILE/.84, W=16, D=8, CU=8, CV=4.6, OX=()=>SHARED.BOD.XS(-3900), OZ=()=>SHARED.BOD.ZS(0), say=(t,c)=>SAY(t,c||'#ffb070');
  const frame=()=>{ const o=[OX(),OZ()]; return IKIT.frame({x0:0,y0:0,x1:1,y1:1},(x,y)=>[o[0]+x*W*MW,o[1]+y*D*MW]); };
  const cooks=new Map(), mine={cook:'',seat:-1,price:0}, Y={G:null,F:null,live:null}, YD=__LAZY__("data/yatai.json"); let tellT=0;
  // the real cart: the game's own meshes, pictures and materials, made as they are asked for
  const RL={D:null,G:null,sx:1,tex:new Map(),mat:new Map(),geo:new Map(),obj:new Map(),box:new Map()};
  const dec=(t,T)=>{ const b=atob(t), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i); return new T(u.buffer); };
  const texOf=k=>{ const e=k&&RL.D.tex[k]; if(!e)return null; let t=RL.tex.get(k); if(!t){ t=new THREE.TextureLoader().load(e.u); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; t.flipY=!!e.y; if(e.w)t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(e.r[0],e.r[1]); RL.tex.set(k,t); } return t; };
  const matOf=d=>{ const k=JSON.stringify(d); let m=RL.mat.get(k); if(!m){ const f=d[2]|0, o={color:d[0],map:texOf(d[1]),transparent:!!(f&2),opacity:d[3]==null?1:d[3],side:f&4?THREE.DoubleSide:THREE.FrontSide,vertexColors:!!(f&8)}; m=f&1?new THREE.MeshBasicMaterial(o):new THREE.MeshLambertMaterial(d[4]?{...o,emissive:d[4]}:o); RL.mat.set(k,m); } return m; };
  const geoOf=k=>{ let g=RL.geo.get(k); if(g!==undefined)return g; const e=RL.D.lib[k]; if(!e){ RL.geo.set(k,null); return null; } g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(dec(e.p,Float32Array),3)); g.setAttribute('normal',new THREE.BufferAttribute(dec(e.n,Int8Array),3,true)); g.setAttribute('uv',new THREE.BufferAttribute(dec(e.uv,Float32Array),2));
    if(e.i)g.setIndex(new THREE.BufferAttribute(dec(e.i,Uint16Array),1)); if(e.c)g.setAttribute('color',new THREE.BufferAttribute(dec(e.c,Uint8Array),3,true)); for(const q of e.g||[])g.addGroup(q[0],q[1],q[2]); RL.geo.set(k,g); return g; };
  const boxOf=d=>{ const k=d.join(); let g=RL.box.get(k); if(!g)RL.box.set(k,g=new THREE.BoxGeometry(d[0]||.001,d[1]||.001,d[2]||.001)); return g; };
  const realCart=()=>{ const D=RL.D, F=Y.F, o=F.pw(CU,CV+.55), G0=RL.G=new THREE.Group(); G0.name='yatai-cart'; RL.sx=F.eu[0]*F.ev[1]-F.eu[1]*F.ev[0]<0?-1:1;   // the game's metres, never mirrored
    G0.matrixAutoUpdate=false; G0.matrix.makeBasis(new THREE.Vector3(F.eu[0]*RL.sx*MW,0,F.eu[1]*RL.sx*MW),new THREE.Vector3(0,MW,0),new THREE.Vector3(F.ev[0]*MW,0,F.ev[1]*MW)).setPosition(o[0],0,o[1]); Y.G.add(G0);
    for(const c of D.cart){ const a=dec(c.p,Int16Array), p=new Float32Array(a.length); for(let i=0;i<a.length;i++)p[i]=a[i]/2000; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(p,3)); g.setAttribute('normal',new THREE.BufferAttribute(dec(c.n,Int8Array),3,true)); g.setAttribute('uv',new THREE.BufferAttribute(dec(c.uv,Float32Array),2)); g.setIndex(new THREE.BufferAttribute(dec(c.i,c.w?Uint32Array:Uint16Array),1)); if(c.c)g.setAttribute('color',new THREE.BufferAttribute(dec(c.c,Uint8Array),3,true));
      const m=new THREE.Mesh(g,matOf(D.mats[c.m])); m.userData.own=1; G0.add(m); } };
  const thing=id=>{ let o=RL.obj.get(id); if(!o){ o=new THREE.Group(); o.visible=false; RL.obj.set(id,o); RL.G.add(o); } return o; };
  const things=i=>{ if(!RL.G||!i)return; if(Array.isArray(i.ids)){ const ids=new Set(i.ids.map(String)); for(const [id,o] of RL.obj)if(!ids.has(id)){ o.removeFromParent(); RL.obj.delete(id); } }
    for(const l of Array.isArray(i.l)?i.l:[]){ if(!Array.isArray(l)||!Array.isArray(l[1]))continue; const o=thing(String(l[0])); o.clear();
      for(const p of l[1].slice(0,40)){ if(!Array.isArray(p)||!Array.isArray(p[1])||!Array.isArray(p[2]))continue; const g=geoOf(String(p[0]))||(Array.isArray(p[3])?boxOf(p[3]):null); if(!g)continue; const multi=Array.isArray(p[1][0]), m=new THREE.Mesh(g,multi&&g.groups.length?p[1].map(matOf):matOf(multi?p[1][0]:p[1])), t=p[2]; m.position.set(+t[0]||0,+t[1]||0,+t[2]||0); m.quaternion.set(+t[3]||0,+t[4]||0,+t[5]||0,t[6]==null?1:+t[6]).normalize(); m.scale.set(+t[7]||1,+t[8]||1,+t[9]||1); o.add(m); } o.userData.look=1; }
    for(const t of Array.isArray(i.s)?i.s:[]){ if(!Array.isArray(t))continue; const o=thing(String(t[0])), U=o.userData; U.p=[+t[1]||0,+t[2]||0,+t[3]||0]; U.q=new THREE.Quaternion(+t[4]||0,+t[5]||0,+t[6]||0,t[7]==null?1:+t[7]).normalize(); if(!U.at){ U.at=1; o.position.set(U.p[0],U.p[1],U.p[2]); o.quaternion.copy(U.q); } o.scale.set(+t[8]||1,+t[9]||1,+t[10]||1); o.visible=!!U.look; } };
  const glide=dt=>{ if(!RL.G)return; const k=Math.min(1,dt*16); for(const o of RL.obj.values()){ const U=o.userData; if(!U.p)continue; o.visible=!!U.look; o.position.x+=(U.p[0]-o.position.x)*k; o.position.y+=(U.p[1]-o.position.y)*k; o.position.z+=(U.p[2]-o.position.z)*k; o.quaternion.slerp(U.q,k); } };
  const unreal=()=>{ for(const g of RL.geo.values())if(g)g.dispose(); for(const g of RL.box.values())g.dispose(); for(const t of RL.tex.values())t.dispose(); for(const m of RL.mat.values())m.dispose(); if(RL.G)RL.G.traverse(o=>{ if(o.userData.own)o.geometry.dispose(); }); RL.geo.clear(); RL.box.clear(); RL.tex.clear(); RL.mat.clear(); RL.obj.clear(); RL.G=null; };
  const inside=()=>ROOMS.offIn&&ROOMS.offIn()==='alley', cash=y=>Math.max(1,Math.round((+y||0)/100));
  // the cart's own metres (x across, y up, z from the counter back to the cook) to the alley's
  const at=(x,y,z)=>{ const p=Y.F.pw(CU+x*RL.sx,CV+z+.55); return [p[0],y*MW,p[1]]; }, put=(o,x,y,z)=>{ const v=at(x,y,z); o.position.set(v[0],v[1],v[2]); return o; };
  const make=id=>{ const mat=c=>new THREE.MeshLambertMaterial({color:c}), box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w*MW,h*MW,d*MW),m), k={id,t:0,grp:new THREE.Group(),seats:[],said:''}; Y.G.add(k.grp);
    for(let i=0;i<3;i++){ const s=new THREE.Group(), leg=box(.3,.3,.34,mat(0x2a2c34)), body=box(.36,.42,.26,mat(0x6a5a48)), head=box(.24,.24,.24,mat(0xe0b088)); leg.position.y=.15*MW; body.position.y=.5*MW; head.position.y=.84*MW; s.add(leg,body,head); s.visible=false; k.grp.add(s); k.seats.push({s,body}); }
    cooks.set(id,k); return k; };
  const liveCook=()=>{ const now=performance.now(); for(const k of cooks.values())if(now-k.t<3000)return k; return null; };
  const happen=(from,e)=>{ const me=ONLINE.me; if(e.ok&&e.ok.to===me){ mine.cook=from; mine.seat=e.ok.seat|0; say('YOU TAKE A STOOL AT THE RAMEN CART. THE COOK HAS SEEN YOU.'); }
    else if(e.no&&e.no.to===me){ mine.cook=''; mine.seat=-1; say('NO SEAT AT THE CART: '+String(e.no.why||'').toUpperCase()+'.','#c8a090'); }
    else if(e.ord&&e.ord.to===me){ mine.price=cash(e.ord.price); say('YOU ORDER '+String(e.ord.text||'RAMEN').toUpperCase()+'. IT WILL BE $'+mine.price+'.'); }
    else if(e.r&&e.r.to===me){ const pay=e.r.pay?cash(e.r.pay):0, paid=pay&&INV.pay(pay); say('YOUR BOWL: '+String(e.r.verdict||'').toUpperCase()+' ('+(e.r.score|0)+'/100). '+(pay?(paid?'YOU PAY $'+pay+'.':'YOU CANNOT COVER THE $'+pay+'.'):'YOU DO NOT PAY FOR THAT.')+(Array.isArray(e.r.issues)&&e.r.issues.length?' '+e.r.issues.join('; ').toUpperCase():'')); }
    else if(e.gone&&e.gone.to===me){ mine.cook=''; mine.seat=-1; say(e.gone.angry?'YOU GIVE UP WAITING AND LEAVE THE CART.':'YOU GET UP FROM THE CART.'); } };
  ONLINE.hear.yt=m=>{ const d=m.d, id=m.from&&String(m.from); if(!id||!d||typeof d!=='object')return; if(d.e){ happen(id,d.e); return; } if(d.g||!Y.lamp)return; if(d.i){ things(d.i); return; } const k=cooks.get(id)||make(id); k.t=performance.now(); k.grp.visible=true;
    if(Y.lamp)Y.lamp.intensity=d.o?12:6;
    k.seats.forEach(s=>{ s.s.visible=false; }); for(const c of Array.isArray(d.cs)?d.cs:[]){ if(!Array.isArray(c)||!c[1])continue; const S=k.seats[c[0]|0]; if(!S||c[6])continue; S.s.visible=true; put(S.s,(d.seats&&+d.seats[c[0]|0])||0,.55,-1.2); S.body.material.color.setHex(c[1]===2?0x4a7a4a:c[5]<35?0x9a3a2a:0x6a5a48); }
    if(d.say&&d.say.text&&inside()){ const line=String(d.say.who||'').toUpperCase().slice(0,24)+': '+String(d.say.text).slice(0,180); if(line!==k.said){ k.said=line; say('AT THE RAMEN CART · '+line); } } };
  // the alley itself
  const furnish=()=>{ '@later'; const F=Y.F=frame(), K=IKIT.room(F,o=>Y.G.add(o)), {box,cyl,glow,use,sol}=K, BR=0x4a2e26, BR2=0x3a2a2a, GR=0x23252b, WD=0x70462a, WL=0xa87646, DK=0x34221a, RF=0x7a2620, H=7;
    box(-3,-1,W+3,D+1,-.1,0,GR); box(-3,D*.45,W+3,D*.5,0,.012,0x16171b);   // wet ground, the gutter
    box(-3,-.5,W+3,0,0,H,BR); box(-3,D,W+3,D+.5,0,H,BR2); box(W,0,W+.5,D,0,H,BR); sol(-3,-.5,W+3,0); sol(-3,D,W+3,D+.5); sol(W,0,W+.5,D); sol(-.5,0,-.2,D);
    for(let f=0;f<2;f++)for(let u=1.5;u<W;u+=2.6){ box(u,-.02,u+1,0.04,3.2+f*2.2,4.6+f*2.2,(u*7+f*3|0)%5===0?0x8a6a38:0x0a0b0e); box(u+.6,D-.04,u+1.6,D+.02,3.2+f*2.2,4.6+f*2.2,(u*5+f|0)%6===0?0x5a7088:0x0a0b0e); }
    for(let f=0;f<2;f++){ box(11.2,D-1.0,14.2,D,3+f*2.4,3.06+f*2.4,0x15171a); for(let i=0;i<=6;i++)box(11.2+i*.5,D-1.02,11.23+i*.5,D-.98,3.06+f*2.4,3.9+f*2.4,0x15171a); box(11.2,D-1.02,14.2,D-.98,3.9+f*2.4,3.93+f*2.4,0x15171a); }   // a fire escape
    box(3.2,-.04,4.2,.06,0,2.1,0x3a2a22); glow(()=>{ box(3.3,.06,4.1,.1,2.5,2.9,0xff3a2a); box(12.1,D-.08,12.2,D-.04,2.4,2.5,0xffc070); }); box(12,D-.06,13,D+.04,0,2.1,0x2a3440);   // the bar's back door under its red sign; a door under a bulb
    box(13.2,.1,15.1,1.1,0,1.1,0x24503a); box(13.2,.1,15.1,1.1,1.1,1.16,0x15171a); sol(13.2,.1,15.1,1.1); for(const [u,v] of [[5.2,.5],[5.9,.55],[10.6,D-.5]]){ cyl(u,v,.24,0,.75,0x4a4e52,.26); sol(u-.25,v-.25,u+.25,v+.25); }
    for(const [u,v,s] of [[2.2,D-.7,.5],[2.9,D-.6,.4],[15,D-.9,.55]])box(u-s/2,v-s/2,u+s/2,v+s/2,0,s*.8,0x8a6a44);
    for(let i=0;i<9;i++)box(-.42,.4+i*.9,-.38,.44+i*.9,0,2.6,0x5a5e64); box(-.42,0,-.38,D,2.56,2.6,0x5a5e64);   // the fence at the dead end
    const x0=CU-1.2, x1=CU+1.2, y0=CV, y1=CV+1.6; sol(x0,y0-.28,x1,y1);
    for(const sx of [-.72,0,.72]){ use('A STOOL AT THE RAMEN CART',CU+sx,y0-.62,.5,1.1,()=>{ if(mine.seat>=0){ ONLINE.send({t:'yt',d:{g:{stand:1}}}); return; } if(!liveCook())return say('NOBODY IS WORKING THE RAMEN CART.','#c8a090'); const v=F.pw(CU+sx,y0-.95); pos.x=v[0]; pos.z=v[1]; ONLINE.send({t:'yt',d:{g:{sit:1}}}); say("YOU WAIT TO CATCH THE COOK'S EYE."); },1.6); }
    use('THE RAMEN CART (WORK IT)',CU,y1+.5,1.6,1.4,()=>{ if(liveCook())return say('SOMEONE IS ALREADY COOKING AT THE CART. TAKE A STOOL.'); say('YOU DUCK UNDER THE NOREN AND TIE ON THE APRON.'); const v=F.pw(CU,y0+1.0); pos.x=v[0]; pos.z=v[1]; setTimeout(()=>STORE.holo.go({name:"YATAI '86",page:'/holo?g=sushi'}),150); },1.8);
    use('THE STREET (LEAVE THE ALLEY)',W-.9,D/2,1.4,1.8,()=>ROOMS.exit('alley'),1.8);
    Y.lamp=new THREE.PointLight(0xff8a50,6,14*MW,1.2); { const p=F.pw(CU,y0-.3); Y.lamp.position.set(p[0],2.1*MW,p[1]); } Y.G.add(Y.lamp);
    { const p=F.pw(3.7,.5), l=new THREE.PointLight(0xff3020,9,12*MW,1.2); l.position.set(p[0],2.7*MW,p[1]); Y.G.add(l); const q=F.pw(12.2,D-.5), l2=new THREE.PointLight(0xffb060,8,12*MW,1.2); l2.position.set(q[0],2.4*MW,q[1]); Y.G.add(l2); }
    Y.G.add(new THREE.HemisphereLight(0x8a9cc8,0x23252c,1.5)); cooks.clear(); K.flush(); if(RL.D)realCart(); };
  const reg=()=>{ if(ROOMS.off.alley)return true; if(!SHARED.BOD||!SHARED.BOD.XS)return false; const F=frame(), sp=F.pw(W-2,D/2), a=F.pw(-3,-1), b=F.pw(W+3,D+1), S=MAPSTAIR;
    ROOMS.off.alley={name:'THE DARK ALLEY',box:{x0:Math.min(a[0],b[0]),z0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),z1:Math.max(a[1],b[1]),y0:-1,y1:9*MW},noCeil:true,need:()=>Promise.all([LOAD('later'),YD().then(d=>{ RL.D=d; })]),
      build:()=>{ const P=ROOMS.part(Y.G=Object.assign(new THREE.Group(),{name:'alley-in'}),furnish); scene.add(Y.G); return P; },unbuild:()=>{ unreal(); if(Y.G)Y.G.removeFromParent(); Y.G=null; Y.lamp=null; cooks.clear(); mine.seat=-1; },
      spawn:[sp[0],sp[1],0,F.hd(-1,0)],out:[SHARED.BOD.XS((S.x0+S.x1)/2),SHARED.BOD.ZS(S.y1+1.2),0,0]};
    if(ROOMS.reset)ROOMS.reset(); return true; };
  { let done=false; SYS.add('life',dt=>{ if(!done)done=reg(); const now=performance.now(); for(const k of cooks.values())if(k.grp.visible&&now-k.t>3000)k.grp.visible=false; glide(dt||0);
      if(inside()&&Y.F&&(tellT-=dt||0)<=0){ tellT=.5; const F=Y.F, o=F.pw(0,0), u=((pos.x-o[0])*F.eu[0]+(pos.z-o[1])*F.eu[1])/MW, v=((pos.x-o[0])*F.ev[0]+(pos.z-o[1])*F.ev[1])/MW, c=F.pw(CU,CV+1.0);   // where you stand, in the cart's own metres, and where its cook stands in the section
        ONLINE.send({t:'yt',d:{g:{p:[+((u-CU)*RL.sx).toFixed(2),+(v-CV-.55).toFixed(2)],w:[+c[0].toFixed(2),+c[1].toFixed(2),0,+F.hd(0,-1).toFixed(2),'up','alley']}}}); } },'146bg-yatai'); }
  MODS.yatai={real:()=>{ let n=0, m=0, miss=0; for(const o of RL.obj.values()){ if(o.visible)n++; m+=o.children.length; } for(const g of RL.geo.values())if(!g)miss++; return {cart:RL.G?RL.G.children.filter(o=>o.userData.own).length:0,things:n,meshes:m,miss}; },lamp:()=>Y.lamp?Y.lamp.intensity:0,feed:m=>ONLINE.hear.yt(m),cooks,at,mine,me:()=>ONLINE.me,money:()=>INV.money(),inside,enter:()=>ROOMS.enter('alley')}; }
