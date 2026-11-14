// THE RAMEN CART, LIVE: while a tenant works YATAI '86 from the platform's cart, everyone else in the section sees it happen there: the lanterns lit, steam off the pots, the cook's two hands and what they hold, the bowls on the counter, who sits on which stool, and what is said (their page's word through the holodeck's shell, t 'yt')
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, pos} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {MAPG, MODS, SYS, TILE} from './006-map-pre.js';
{ const M=SHARED.METRO, C=M&&M.CART;
  if(C){ const T=TILE, K=2.6/2.4, U=34.7, cooks=new Map(), g=new THREE.Group(); MAPG.down.add(g);
    // the cart's own metres (x across, y up, z from the counter back to the cook) to the platform's
    const at=(x,y,z)=>M.V(C.x+x*K,C.y0+(z+.55)*K,y*U), put=(o,x,y,z)=>{ const v=at(x,y,z); o.position.set(v[0],v[1],v[2]); return o; };
    const mat=c=>new THREE.MeshLambertMaterial({color:c}), glowM=new THREE.MeshBasicMaterial({color:0xffa060,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
    const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w*T,h*T,d*T),m);
    const make=id=>{ const k={id,t:0,grp:new THREE.Group(),hands:[],seats:[],bowls:[],said:''}; g.add(k.grp);
      k.lamp=new THREE.PointLight(0xff7a40,0,5*T); put(k.lamp,0,2.1,-.9); k.grp.add(k.lamp); k.glow=put(box(.5,.5,.5,glowM),0,2.0,-1.0); k.grp.add(k.glow);
      k.steam=[0,1].map(i=>{ const s=put(box(.3,.5,.3,new THREE.MeshBasicMaterial({color:0xdfe6ea,transparent:true,opacity:.22,depthWrite:false})),-.9,1.45,.1+i*.4); k.grp.add(s); return s; });
      for(let i=0;i<2;i++){ const h=box(.14,.14,.14,mat(0xe8b890)), it=box(.2,.12,.2,mat(0xf1ede2)); it.visible=false; h.add(it); it.position.y=.12*T; k.grp.add(h); k.hands.push({h,it}); }
      for(let i=0;i<3;i++){ const s=new THREE.Group(), leg=box(.3,.3,.34,mat(0x2a2c34)), body=box(.36,.42,.26,mat(0x6a5a48)), head=box(.24,.24,.24,mat(0xe0b088)); leg.position.y=.15*T; body.position.y=.5*T; head.position.y=.84*T; s.add(leg,body,head); s.visible=false; k.grp.add(s); k.seats.push({s,body}); }
      for(let i=0;i<8;i++){ const b=box(.2,.09,.2,mat(0xf1ede2)), soup=box(.16,.02,.16,mat(0xc99a3c)); soup.position.y=.05*T; b.add(soup); b.visible=false; k.grp.add(b); k.bowls.push({b,soup}); }
      cooks.set(id,k); return k; };
    const near=()=>{ const v=at(0,0,0); return Math.hypot(pos.x-v[0],pos.z-v[2])<14*T; };
    ONLINE.hear.yt=m=>{ const d=m.d, id=m.from&&String(m.from); if(!id||!d||typeof d!=='object')return; const k=cooks.get(id)||make(id); k.t=performance.now(); k.grp.visible=true;
      const open=!!d.o; k.lamp.intensity=open?1.4:.25; k.glow.visible=open; const hot=Array.isArray(d.b)&&d.b.some(Boolean); k.steam.forEach(s=>{ s.visible=hot; });
      (Array.isArray(d.hands)?d.hands:[]).slice(0,2).forEach((q,i)=>{ const H=k.hands[i]; if(!Array.isArray(q))return; H.h.visible=true; put(H.h,+q[0]||0,+q[1]||1,+q[2]||0); H.it.visible=!!q[3]; }); for(let i=(d.hands||[]).length;i<2;i++)k.hands[i].h.visible=false;
      k.seats.forEach(s=>{ s.s.visible=false; }); for(const c of Array.isArray(d.cs)?d.cs:[]){ if(!Array.isArray(c)||!c[1])continue; const S=k.seats[c[0]|0]; if(!S)continue; S.s.visible=true; put(S.s,(d.seats&&+d.seats[c[0]|0])||0,.55,-1.2); S.body.material.color.setHex(c[1]===2?0x4a7a4a:c[5]<35?0x9a3a2a:0x6a5a48); }
      k.bowls.forEach(b=>{ b.b.visible=false; }); (Array.isArray(d.bowls)?d.bowls:[]).slice(0,8).forEach((q,i)=>{ const B=k.bowls[i]; if(!Array.isArray(q))return; B.b.visible=true; put(B.b,+q[0]||0,(+q[1]||.9)+.03,+q[2]||0); B.soup.visible=q[3]===1||q[3]===2; B.b.material.color.setHex(q[3]===3?0x9a9484:0xf1ede2); });
      if(d.say&&d.say.text&&near()){ const line=String(d.say.who||'').toUpperCase().slice(0,24)+': '+String(d.say.text).slice(0,180); if(line!==k.said){ k.said=line; SAY('AT THE RAMEN CART · '+line,'#ffb070'); } } };
    MODS.yatai={feed:m=>ONLINE.hear.yt(m),cooks,at};
    SYS.add('life',()=>{ const now=performance.now(); for(const k of cooks.values())if(k.grp.visible&&now-k.t>3000)k.grp.visible=false; },'146bg-yatai'); } }
