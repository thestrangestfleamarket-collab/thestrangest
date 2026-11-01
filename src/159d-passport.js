// THE PASSPORT: every player is issued one at first login (a number, the home section, the date; the name and look are yours), kept with your things and shown from the pack. Every station exit has a gate: a forcefield across the way out that opens six seconds for everyone when a passport is shown at the machine beside it; coming in from the street is always free.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, LOOKS, ONLINE, pos, SFX, UI} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {MAPG, SOL, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
{
  const T=TILE, OPEN=6, V3=THREE.Vector3, esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'), say=(t,c)=>FORAGE.say(t,c||'#c8c2b0');
  FORAGE.add({names:{passport:'PASSPORT'},prices:{passport:0}});
  let P=null; try{ P=JSON.parse(OWNED.get('passport')||'null'); }catch(e){}
  if(!P||!P.no){ const home=(SHARED.SECTION&&SHARED.SECTION.id)||'A', day=new Date().toISOString().slice(0,10); P={no:String(1000+Math.floor(Math.random()*9000)),issued:day,home,stamps:{[home]:day}}; OWNED.set('passport',JSON.stringify(P)); }
  PASSPORT.P=P; const save=()=>OWNED.set('passport',JSON.stringify(P));
  (async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,250)); if(!FORAGE.has('passport')){ FORAGE.give('passport',1); FORAGE.draw(); } })();
  PASSPORT.stamp=id=>{ if(!id||P.stamps[id])return; P.stamps[id]=new Date().toISOString().slice(0,10); save(); say('YOUR PASSPORT IS STAMPED: SECTION '+id+'.','#7dffa8'); };
  const sp=document.createElement('div'); sp.id='passportw'; sp.hidden=true;
  sp.style.cssText='position:fixed;inset:0;z-index:22;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45);font:11px Silkscreen,monospace;color:#ece5d3;zoom:var(--uiz,1)';
  sp.addEventListener('click',e=>{ if(e.target===sp)PASSPORT.close(); }); sp.addEventListener('keydown',e=>{ if(e.key==='Escape')PASSPORT.close(); e.stopPropagation(); }); document.body.appendChild(sp);
  const draw=()=>{ const name=((LOOKS.L&&LOOKS.L.name)||'').trim()||'A TENANT', st=Object.keys(P.stamps);
    sp.innerHTML=`<div style="display:flex;box-shadow:0 20px 60px #000;position:relative"><button class="pX" style="position:absolute;right:-2px;top:-34px;font:inherit;color:#c9ccd6;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer">X</button>
      <div style="width:280px;height:400px;background:#17352a;border:3px solid #0d2419;padding:22px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between"><div style="color:#c9b46a;letter-spacing:3px;text-align:center">THE STRANGEST<br>FLEA MARKET</div><div style="width:100px;height:100px;border:3px solid #c9b46a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#c9b46a;font-size:32px">✶</div><div style="color:#c9b46a;font-size:16px;letter-spacing:4px">PASSPORT</div><div style="color:#7dffa8;font-size:10px;opacity:.8">SECTION ${esc(P.home)} · ISSUED AT THE DOOR</div></div>
      <div style="width:300px;height:400px;background:#ece5d3;color:#1a1a1a;border:3px solid #0d2419;border-left:0;padding:18px;box-sizing:border-box;line-height:1.7"><div style="display:flex;gap:12px"><div style="width:80px;height:100px;background:#2a2e3a;border:2px solid #555;display:flex;align-items:end;justify-content:center;color:#9aa;font-size:9px">YOUR LOOK</div><div><div style="color:#666;font-size:9px">NAME</div><div style="font-size:14px">${esc(name)}</div><div style="color:#666;font-size:9px;margin-top:6px">CITIZEN NO.</div><div>${esc(P.no)}</div><div style="color:#666;font-size:9px;margin-top:6px">HOME</div><div>SECTION ${esc(P.home)}</div></div></div>
        <div style="color:#666;font-size:9px;margin-top:10px">ISSUED</div><div>${esc(P.issued)} · AT THE DOOR</div><div style="color:#666;font-size:9px;margin-top:10px">STAMPS · SECTIONS VISITED</div><div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap">${st.map(k=>`<div title="${esc(P.stamps[k])}" style="width:42px;height:42px;border:2px dashed #3aa866;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#3aa866;transform:rotate(${(k.charCodeAt(0)*37)%30-15}deg)">${esc(k)}</div>`).join('')}</div>
        <div style="margin-top:14px;border-top:2px solid #1a1a1a;padding-top:6px;font-size:9px;color:#444">P&lt;TSFM&lt;&lt;${esc(name.replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(0,12))}&lt;&lt;&lt;&lt;&lt;&lt;&lt;${esc(P.no)}${esc(P.home)}</div><div style="margin-top:10px;font-size:9px;color:#666">SHOW IT AT A STATION'S MACHINE TO LEAVE</div></div></div>`;
    sp.querySelector('.pX').onclick=()=>PASSPORT.close(); };
  PASSPORT.open=()=>{ sp.hidden=false; sp.style.display='flex'; draw(); }; PASSPORT.close=()=>{ sp.hidden=true; sp.style.display='none'; };
  FORAGE.ACT.passport=()=>PASSPORT.open(); FORAGE.ROWB.push(id=>id==='passport'?[['SHOW','passport']]:[]);
  // the gates: a hex forcefield across each station's exit, solid while closed; a machine beside it
  const [fcv,ftex]=(()=>{ const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d'); g.clearRect(0,0,512,512); g.strokeStyle='rgba(110,210,255,.85)'; g.lineWidth=2; const r=22;
    for(let j=0;j<16;j++)for(let i=0;i<16;i++){ const x=i*r*1.73+(j%2?r*.866:0), y=j*r*1.5; g.beginPath(); for(let k=0;k<6;k++){ const an=Math.PI/6+k*Math.PI/3; g.lineTo(x+r*Math.cos(an),y+r*Math.sin(an)); } g.closePath(); g.stroke(); }
    const gr=g.createLinearGradient(0,0,0,512); gr.addColorStop(0,'rgba(60,160,255,.1)'); gr.addColorStop(1,'rgba(60,160,255,.3)'); g.fillStyle=gr; g.fillRect(0,0,512,512); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return [c,t]; })();
  const gates=[]; PASSPORT.gates=gates;
  const quad=(A,B,C,D,mat)=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([...A,...B,...C,...A,...C,...D],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); return new THREE.Mesh(geo,mat); };
  const mk=st=>{ const a0=LOOP.MID, a1=LOOP.MID+3, mat=new THREE.MeshBasicMaterial({map:ftex,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
    const me=quad(st.P(.15,a0,0),st.P(.15,a1,0),st.P(.15,a1,72),st.P(.15,a0,72),mat); MAPG.down.add(me); const L=new THREE.PointLight(0x4fb8ff,1.2,4*T); L.position.set(...st.P(1,(a0+a1)/2,40)); MAPG.down.add(L);
    const p=st.P(-.15,a0,0), q=st.P(.45,a1,0), box=[Math.min(p[0],q[0]),Math.min(p[2],q[2]),Math.max(p[0],q[0]),Math.max(p[2],q[2])];
    const hb=new THREE.Mesh(new THREE.BoxGeometry(.6*T,1.9*T,.7*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(...st.P(.4,a0-.68,24)); MAPG.down.add(hb);
    const g={st,me,L,box,until:0,said:0,hb}; const A=new V3(...st.P(0,a0,0)), B=new V3(...st.P(1,a0,0)).sub(A); g.u=()=>new V3(pos.x,A.y,pos.z).sub(A).dot(B)/B.lengthSq();
    UI.thing({name:'PASSPORT MACHINE',pick:true,obj:hb,reach:1.1*T,near:2.2*T,tall:1.6*T,act:()=>{ if(!FORAGE.has('passport'))return say('YOU HAVE NO PASSPORT. EVERY TENANT IS ISSUED ONE AT THE DOOR.','#e5403a'); ONLINE.put('gate:'+st.id,Date.now()); SFX.play('latch',{vol:.5}); say('THE GATE READS YOUR PASSPORT AND OPENS FOR '+OPEN+' SECONDS. GO.','#7fd8ff'); }});
    gates.push(g); closeG(g); return g; };
  const openG=(g,until)=>{ g.until=until; const i=SOL.down.indexOf(g.box); if(i>=0)SOL.down.splice(i,1); g.me.visible=false; g.L.visible=false; };
  const closeG=g=>{ g.until=0; if(!SOL.down.includes(g.box))SOL.down.push(g.box); g.me.visible=true; g.L.visible=true; };
  PASSPORT.openAt=(st,until)=>{ const g=gates.find(q=>q.st===st); if(g)openG(g,until); };
  SYS.add('world',(k,v)=>{ if(!k.startsWith('gate:'))return; const g=gates.find(q=>'gate:'+q.st.id===k); if(g&&Date.now()-v<OPEN*1000)openG(g,v+OPEN*1000); },'159d-passport');
  let bl=0; SYS.add('places',dt=>{ if(!LOOP.STA||!MAPG.down)return; for(const st of LOOP.STA)if(st.P&&!gates.some(g=>g.st===st))mk(st); const now=Date.now(); bl+=dt;
    for(const g of gates){ if(g.until&&now>g.until)closeG(g); if(g.until)continue; const u=g.u(), inB=pos.x>g.box[0]-1.2*T&&pos.x<g.box[2]+1.2*T&&pos.z>g.box[1]-1.2*T&&pos.z<g.box[3]+1.2*T;
      if(inB&&u<.1){ const i=SOL.down.indexOf(g.box); if(i>=0)SOL.down.splice(i,1); } else if(!SOL.down.includes(g.box))SOL.down.push(g.box);   // in from the street is free: the field lets you through when you come from the hall side
      g.me.material.opacity=.7+.25*Math.sin(bl*4); if(inB&&u>.1&&SHARED.LVL==='down'&&now-g.said>5000){ g.said=now; say('THE GATE: SHOW YOUR PASSPORT AT THE MACHINE TO LEAVE.','#7fd8ff'); } } },'159d-gates');
  window.PASSPORT=PASSPORT;
}
