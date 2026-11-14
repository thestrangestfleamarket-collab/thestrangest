// THE DARK ALLEY: a place off the map (GO TO it from the map): a wet service alley at night, brick on both sides, a bar's back door, dumpsters, and the ramen cart. Use the cart to work it (YATAI '86, as a holodeck program does). While a tenant is working it, everyone in the alley sees it happen at the cart: the lanterns lit, steam, the cook's two hands, the bowls, who sits on which stool, what is said; a tenant who takes a stool is the cook's customer (an order, a bowl, and they pay for it); and the cook sees and hears whoever is in the alley (the cook's page's word through the section, t 'yt')
import {SHARED, THREE} from './003-shx.js';
import {INV, ONLINE, pos, ROOMS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MAPSTAIR, MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
{ const T=TILE, MW=TILE/.84, W=16, D=8, CU=8, CV=4.6, OX=()=>SHARED.BOD.XS(-3900), OZ=()=>SHARED.BOD.ZS(0), say=(t,c)=>SAY(t,c||'#ffb070');
  const frame=()=>{ const o=[OX(),OZ()]; return IKIT.frame({x0:0,y0:0,x1:1,y1:1},(x,y)=>[o[0]+x*W*MW,o[1]+y*D*MW]); };
  const cooks=new Map(), mine={cook:'',seat:-1,price:0}, Y={G:null,F:null,live:null}; let tellT=0;
  const inside=()=>ROOMS.offIn&&ROOMS.offIn()==='alley', cash=y=>Math.max(1,Math.round((+y||0)/100));
  // the cart's own metres (x across, y up, z from the counter back to the cook) to the alley's
  const at=(x,y,z)=>{ const p=Y.F.pw(CU+x,CV+z+.55); return [p[0],y*MW,p[1]]; }, put=(o,x,y,z)=>{ const v=at(x,y,z); o.position.set(v[0],v[1],v[2]); return o; };
  const make=id=>{ const mat=c=>new THREE.MeshLambertMaterial({color:c}), box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w*MW,h*MW,d*MW),m), k={id,t:0,grp:new THREE.Group(),hands:[],seats:[],bowls:[],said:''}; Y.G.add(k.grp);
    k.steam=[0,1].map(i=>{ const s=put(box(.3,.5,.3,new THREE.MeshBasicMaterial({color:0xdfe6ea,transparent:true,opacity:.22,depthWrite:false})),-.9,1.45,.1+i*.4); k.grp.add(s); return s; });
    for(let i=0;i<2;i++){ const h=box(.12,.12,.12,mat(0xe8b890)), it=box(.18,.1,.18,mat(0xf1ede2)); it.visible=false; h.add(it); it.position.y=.11*MW; k.grp.add(h); k.hands.push({h,it}); }
    for(let i=0;i<3;i++){ const s=new THREE.Group(), leg=box(.3,.3,.34,mat(0x2a2c34)), body=box(.36,.42,.26,mat(0x6a5a48)), head=box(.24,.24,.24,mat(0xe0b088)); leg.position.y=.15*MW; body.position.y=.5*MW; head.position.y=.84*MW; s.add(leg,body,head); s.visible=false; k.grp.add(s); k.seats.push({s,body}); }
    for(let i=0;i<8;i++){ const b=box(.2,.09,.2,mat(0xf1ede2)), soup=box(.16,.02,.16,mat(0xc99a3c)); soup.position.y=.05*MW; b.add(soup); b.visible=false; k.grp.add(b); k.bowls.push({b,soup}); }
    cooks.set(id,k); return k; };
  const liveCook=()=>{ const now=performance.now(); for(const k of cooks.values())if(now-k.t<3000)return k; return null; };
  const happen=(from,e)=>{ const me=ONLINE.me; if(e.ok&&e.ok.to===me){ mine.cook=from; mine.seat=e.ok.seat|0; say('YOU TAKE A STOOL AT THE RAMEN CART. THE COOK HAS SEEN YOU.'); }
    else if(e.no&&e.no.to===me){ mine.cook=''; mine.seat=-1; say('NO SEAT AT THE CART: '+String(e.no.why||'').toUpperCase()+'.','#c8a090'); }
    else if(e.ord&&e.ord.to===me){ mine.price=cash(e.ord.price); say('YOU ORDER '+String(e.ord.text||'RAMEN').toUpperCase()+'. IT WILL BE $'+mine.price+'.'); }
    else if(e.r&&e.r.to===me){ const pay=e.r.pay?cash(e.r.pay):0, paid=pay&&INV.pay(pay); say('YOUR BOWL: '+String(e.r.verdict||'').toUpperCase()+' ('+(e.r.score|0)+'/100). '+(pay?(paid?'YOU PAY $'+pay+'.':'YOU CANNOT COVER THE $'+pay+'.'):'YOU DO NOT PAY FOR THAT.')+(Array.isArray(e.r.issues)&&e.r.issues.length?' '+e.r.issues.join('; ').toUpperCase():'')); }
    else if(e.gone&&e.gone.to===me){ mine.cook=''; mine.seat=-1; say(e.gone.angry?'YOU GIVE UP WAITING AND LEAVE THE CART.':'YOU GET UP FROM THE CART.'); } };
  ONLINE.hear.yt=m=>{ const d=m.d, id=m.from&&String(m.from); if(!id||!d||typeof d!=='object')return; if(d.e){ happen(id,d.e); return; } if(d.g||!Y.lamp)return; const k=cooks.get(id)||make(id); k.t=performance.now(); k.grp.visible=true;
    const open=!!d.o; if(Y.lamp)Y.lamp.intensity=open?12:6; const hot=Array.isArray(d.b)&&d.b.some(Boolean); k.steam.forEach(s=>{ s.visible=hot; });
    (Array.isArray(d.hands)?d.hands:[]).slice(0,2).forEach((q,i)=>{ const H=k.hands[i]; if(!Array.isArray(q))return; H.h.visible=true; put(H.h,+q[0]||0,+q[1]||1,+q[2]||0); H.it.visible=!!q[3]; }); for(let i=(d.hands||[]).length;i<2;i++)k.hands[i].h.visible=false;
    k.seats.forEach(s=>{ s.s.visible=false; }); for(const c of Array.isArray(d.cs)?d.cs:[]){ if(!Array.isArray(c)||!c[1])continue; const S=k.seats[c[0]|0]; if(!S||c[6])continue; S.s.visible=true; put(S.s,(d.seats&&+d.seats[c[0]|0])||0,.55,-1.2); S.body.material.color.setHex(c[1]===2?0x4a7a4a:c[5]<35?0x9a3a2a:0x6a5a48); }
    k.bowls.forEach(b=>{ b.b.visible=false; }); (Array.isArray(d.bowls)?d.bowls:[]).slice(0,8).forEach((q,i)=>{ const B=k.bowls[i]; if(!Array.isArray(q))return; B.b.visible=true; put(B.b,+q[0]||0,(+q[1]||.9)+.03,+q[2]||0); B.soup.visible=q[3]===1||q[3]===2; B.b.material.color.setHex(q[3]===3?0x9a9484:0xf1ede2); });
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
    // the cart: counter, posts, roof, noren, lanterns, pots, stools
    const x0=CU-1.2, x1=CU+1.2, y0=CV, y1=CV+1.6; box(x0,y0,x1,y1,0,.86,WD); box(x0-.1,y0-.28,x1+.1,y0,.78,.98,WL); box(x0,y0,x1,y1,.86,.92,WL); sol(x0,y0-.28,x1,y1);
    for(const [a,b] of [[x0,y0],[x1-.08,y0],[x0,y1-.08],[x1-.08,y1-.08]])box(a,b,a+.08,b+.08,.92,2.6,DK); box(x0-.3,y0-.45,x1+.3,y1+.3,2.6,2.74,RF); box(x0+.15,y0-.1,x1-.15,y1,2.74,2.9,RF); box(x0-.02,y0-.06,x1+.02,y0-.02,2.2,2.6,0xb01e1a);
    glow(()=>{ box(x0-.2,y0-.34,x0+.04,y0-.1,1.75,2.15,0xff5c30); box(x1-.04,y0-.34,x1+.2,y0-.1,1.75,2.15,0xff5c30); });
    box(x0+.2,y0+.5,x0+.65,y0+.95,.92,1.22,0x969aa0); box(x0+.8,y0+.5,x0+1.25,y0+.95,.92,1.26,0x969aa0); box(x1-.7,y0+.45,x1-.2,y0+1.0,.92,1.02,0xe6e2d6);
    for(const sx of [-.72,0,.72]){ cyl(CU+sx,y0-.62,.16,0,.62,0x8a2420,.16); use('A STOOL AT THE RAMEN CART',CU+sx,y0-.62,.5,1.1,()=>{ if(mine.seat>=0){ ONLINE.send({t:'yt',d:{g:{stand:1}}}); return; } if(!liveCook())return say('NOBODY IS WORKING THE RAMEN CART.','#c8a090'); const v=F.pw(CU+sx,y0-.95); pos.x=v[0]; pos.z=v[1]; ONLINE.send({t:'yt',d:{g:{sit:1}}}); say("YOU WAIT TO CATCH THE COOK'S EYE."); },1.6); }
    use('THE RAMEN CART (WORK IT)',CU,y1+.5,1.6,1.4,()=>{ if(liveCook())return say('SOMEONE IS ALREADY COOKING AT THE CART. TAKE A STOOL.'); say('YOU DUCK UNDER THE NOREN AND TIE ON THE APRON.'); const v=F.pw(CU,y0+1.0); pos.x=v[0]; pos.z=v[1]; setTimeout(()=>STORE.holo.go({name:"YATAI '86",page:'/holo?g=sushi'}),150); },1.8);
    use('THE STREET (LEAVE THE ALLEY)',W-.9,D/2,1.4,1.8,()=>ROOMS.exit('alley'),1.8);
    Y.lamp=new THREE.PointLight(0xff8a50,6,14*MW,1.2); { const p=F.pw(CU,y0-.3); Y.lamp.position.set(p[0],2.1*MW,p[1]); } Y.G.add(Y.lamp);
    { const p=F.pw(3.7,.5), l=new THREE.PointLight(0xff3020,9,12*MW,1.2); l.position.set(p[0],2.7*MW,p[1]); Y.G.add(l); const q=F.pw(12.2,D-.5), l2=new THREE.PointLight(0xffb060,8,12*MW,1.2); l2.position.set(q[0],2.4*MW,q[1]); Y.G.add(l2); }
    Y.G.add(new THREE.HemisphereLight(0x8a9cc8,0x23252c,1.5)); cooks.clear(); K.flush(); };
  const reg=()=>{ if(ROOMS.off.alley)return true; if(!SHARED.BOD||!SHARED.BOD.XS)return false; const F=frame(), sp=F.pw(W-2,D/2), a=F.pw(-3,-1), b=F.pw(W+3,D+1), S=MAPSTAIR;
    ROOMS.off.alley={name:'THE DARK ALLEY',box:{x0:Math.min(a[0],b[0]),z0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),z1:Math.max(a[1],b[1]),y0:-1,y1:9*MW},noCeil:true,need:()=>LOAD('later'),
      build:()=>{ const P=ROOMS.part(Y.G=Object.assign(new THREE.Group(),{name:'alley-in'}),furnish); scene.add(Y.G); return P; },unbuild:()=>{ if(Y.G)Y.G.removeFromParent(); Y.G=null; Y.lamp=null; cooks.clear(); mine.seat=-1; },
      spawn:[sp[0],sp[1],0,F.hd(-1,0)],out:[SHARED.BOD.XS((S.x0+S.x1)/2),SHARED.BOD.ZS(S.y1+1.2),0,0]};
    if(ROOMS.reset)ROOMS.reset(); return true; };
  { let done=false; SYS.add('life',dt=>{ if(!done)done=reg(); const now=performance.now(); for(const k of cooks.values())if(k.grp.visible&&now-k.t>3000)k.grp.visible=false;
      if(inside()&&Y.F&&(tellT-=dt||0)<=0){ tellT=.5; const F=Y.F, o=F.pw(0,0), u=((pos.x-o[0])*F.eu[0]+(pos.z-o[1])*F.eu[1])/MW, v=((pos.x-o[0])*F.ev[0]+(pos.z-o[1])*F.ev[1])/MW, c=F.pw(CU,CV+1.0);   // where you stand, in the cart's own metres, and where its cook stands in the section
        ONLINE.send({t:'yt',d:{g:{p:[+(u-CU).toFixed(2),+(v-CV-.55).toFixed(2)],w:[+c[0].toFixed(2),+c[1].toFixed(2),0,+F.hd(0,-1).toFixed(2),'up','alley']}}}); } },'146bg-yatai'); }
  MODS.yatai={lamp:()=>Y.lamp?Y.lamp.intensity:0,feed:m=>ONLINE.hear.yt(m),cooks,at,mine,me:()=>ONLINE.me,money:()=>INV.money(),inside,enter:()=>ROOMS.enter('alley')}; }
