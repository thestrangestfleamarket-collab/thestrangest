// THE EXCHANGE MACHINES (owner, 11 Nov 2026; the old game's, 11 Oct 2026): dark steel cabinets with one all-seeing eye, stood about the streets (world.json exchange); put a thing in, the eye values it, pays half its value and the thing is gone (the Block takes it and pays, worker/door.js exch; off the website the page does).
import {SHARED, THREE} from './003-shx.js';
import {ARCHI, FORAGE, INV, ITEMS, ONLINE, pos, SFX, SHOPS, TEXT, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, SOL, SYS, TILE} from './006-map-pre.js';
const EXCH={PAYS:.5,list:[]};
{ const T=TILE, M=T/.84, esc=TEXT.esc, val=id=>{ const v=+(ITEMS.prop&&ITEMS.prop(id,'value')); return v>0&&!ARCHI(id)?v:0; }, pays=id=>Math.max(1,Math.floor(val(id)*EXCH.PAYS));
  const say=t=>SAY(t,'#f2c14e'), nm=id=>FORAGE.name?FORAGE.name(id):String(id).toUpperCase(), redraw=()=>{ if(SHOPS.draw)SHOPS.draw(); if(FORAGE.draw)FORAGE.draw(); };
  const paid=(id,n,v)=>{ say(`THE EYE NARROWS. CLUNK: ${n>1?n+' ':''}${nm(id)} ${n>1?'ARE':'IS'} GONE, $${v} DROPS INTO THE TRAY.`); if(window.SFX)SFX.play('clunk',{vol:.5}); redraw(); };
  EXCH.N={name:'EXCHANGE MACHINE',machine:1,trade:{sells:[],buys:['exchange']}};
  SHOPS.exchRows=row=>{ const mine=Object.keys(INV.items).filter(id=>INV.items[id]>0&&val(id)).sort();
    return `<div class="shh">THE EYE PAYS</div>`+(mine.length?mine.map(id=>row(id,`<u>x${INV.items[id]}</u><i>$${pays(id)}</i>`,`data-exch="${esc(id)}"`)).join(''):`<div class="shh" style="opacity:.6">YOU CARRY NOTHING IT WANTS</div>`); };
  SHOPS.exchAsk=(id,n)=>`PUT ${n>1?n+' ':''}${nm(id)} IN FOR $${pays(id)*n}? ${n>1?'THEY ARE':'IT IS'} GONE FOR GOOD.`;
  EXCH.put=(id,n=1)=>{ n=Math.min(n,INV.items[id]||0); if(n<1||!val(id))return false; FORAGE.take(id,n); if(INV.save)INV.save();
    if(ONLINE.on){ ONLINE.send({t:'xm',op:'sell',item:id,n}); redraw(); return true; }
    const v=pays(id)*n; INV.cash=(INV.cash||0)+v; if(INV.save)INV.save(); paid(id,n,v); return true; };
  SHOPS.exchDo=EXCH.put;
  ONLINE.hear.xm=m=>{ '@later';
    if(m.op==='paid'){ INV.cash=(INV.cash||0)+Math.max(0,+m.cash||0); if(INV.save)INV.save(); paid(m.item,m.n,m.cash); return; }
    if(m.op==='back'){ for(const k in m.items||{})FORAGE.give(k,m.items[k]); if(INV.save)INV.save(); say('THE EXCHANGE MACHINE: '+String(m.why||'NO').toUpperCase()+'.'); redraw(); } };
  // the cabinets: as tall as you, the eye in a brass ring, a slot under it and a tray at the foot; the iris turns to whoever is near
  const at=(LEVEL.exchange&&LEVEL.exchange.at)||[];
  if(at.length){ const cv=document.createElement('canvas'); cv.width=128; cv.height=256; const g=cv.getContext('2d'), disc=(c,x,y,r,col)=>{ c.fillStyle=col; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); };
    g.fillStyle='#363a42'; g.fillRect(0,0,128,256); g.fillStyle='#2c3037'; for(let i=0;i<70;i++)g.fillRect((i*53)%124,(i*97)%252,3+(i%3),2);
    g.fillStyle='#80703c'; g.fillRect(0,12,128,3); g.fillRect(0,156,128,3);
    disc(g,64,84,52,'#968046'); disc(g,64,84,45,'#1a1c20'); disc(g,64,84,43,'#e2ded2');
    g.fillStyle='#101012'; g.fillRect(34,170,60,8); g.fillStyle='#968046'; g.fillRect(30,166,68,2); g.fillRect(30,180,68,2);
    g.fillStyle='#1e1e20'; g.fillRect(28,208,72,26); g.fillStyle='#695a31'; g.fillRect(28,228,72,8);
    const ev=document.createElement('canvas'); ev.width=64; ev.height=64; const e=ev.getContext('2d'); disc(e,32,32,31,'#4696aa'); disc(e,32,32,27,'#3c8496'); disc(e,32,32,13,'#0c0c0e'); disc(e,23,22,6,'#fafaf0');
    const tex=c=>{ const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; t.generateMipmaps=false; t.minFilter=THREE.LinearFilter; return t; };
    const face=new THREE.MeshLambertMaterial({map:tex(cv)}), iris=new THREE.MeshLambertMaterial({map:tex(ev),alphaTest:.5}), steel=new THREE.MeshLambertMaterial({color:0x363a42}), brass=new THREE.MeshLambertMaterial({color:0x968046}), hid=new THREE.MeshBasicMaterial({visible:false});
    const root=MAPG.bodega||MAPG.street||scene, Bd=SHARED.BOD, W=.9, D=.6, H=1.8, EY=H*(1-84/256), K=H/256;
    for(const o of at){ const x=Bd.XS(o.x), z=Bd.ZS(o.y), y=SHARED.groundY?SHARED.groundY(x,z):0, G=new THREE.Group(); G.position.set(x,y,z); G.rotation.y=o.rot||0;
      const box=(w,h,d,px,py,pz,m)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w*M,h*M,d*M),m); me.position.set(px*M,py*M,pz*M); me.castShadow=me.receiveShadow=true; G.add(me); return me; };
      box(W,H,D,0,H/2,0,steel); box(W*.84,.1,D*.84,0,H+.05,0,brass); box(W*.6,.06,.12,0,.28,D/2+.06,brass);
      const p=new THREE.Mesh(new THREE.PlaneGeometry(W*M,H*M),face); p.position.set(0,H/2*M,(D/2+.004)*M); G.add(p);
      const ir=new THREE.Mesh(new THREE.PlaneGeometry(58*K*M,58*K*M),iris); ir.position.set(0,EY*M,(D/2+.008)*M); G.add(ir);
      const hb=box(W,H+.1,D,0,H/2,0,hid); hb.castShadow=hb.receiveShadow=false; root.add(G);
      const c=Math.abs(Math.cos(G.rotation.y)), s=Math.abs(Math.sin(G.rotation.y)), rx=(c*W+s*D)/2*M, rz=(s*W+c*D)/2*M; SOL.up.push([x-rx,z-rz,x+rx,z+rz]); FIX.up.push([x-rx,z-rz,y,x+rx,z+rz,y+H*M]);
      UI.thing({name:'EXCHANGE MACHINE',obj:hb,reach:1.6*T,near:2.6*T,tall:(H+.2)*M,act:()=>SHOPS.open(EXCH.N)}); EXCH.list.push({x,z,G,ir,ex:0,ey:0}); }
    const v=new THREE.Vector3(), R=12*T, RUN=14*K*M;
    SYS.add('life',()=>{ for(const m of EXCH.list){ const dx=pos.x-m.x, dz=pos.z-m.z; if(dx*dx+dz*dz>R*R)continue;
      m.G.worldToLocal(v.set(pos.x,m.G.position.y+(SHARED.py||0)+1.5*M,pos.z)); const l=Math.hypot(v.x,v.z)||1, ex=Math.round(v.x/l*RUN/(K*M))*K*M, ey=v.z>0?Math.round(Math.max(-1,Math.min(1,(v.y-EY*M)/l))*RUN/(K*M))*K*M:0;
      if(ex!==m.ex||ey!==m.ey){ m.ex=ex; m.ey=ey; m.ir.position.x=v.z>0?ex:Math.sign(ex)*RUN; m.ir.position.y=EY*M+ey; } } },'159ba-exchange'); }
  FORAGE.HELP.push('EXCHANGE MACHINES: the steel cabinets with one eye, about the streets. Double click one and put a thing in: the eye pays half its worth and the thing is gone for good.');
  window.EXCH=EXCH; window.EXCHDBG=()=>({want:at.length,at:EXCH.list.map(m=>[+(m.x/T).toFixed(1),+(m.z/T).toFixed(1)]),things:UI.things.filter(t=>t.name==='EXCHANGE MACHINE').length,eye:EXCH.list.map(m=>[+m.ir.position.x.toFixed(3),+m.ir.position.y.toFixed(3)])}); }
