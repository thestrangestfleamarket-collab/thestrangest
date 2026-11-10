// THE PASSPORT: every player is issued one at first login, a card in the map's look (a number, the home section, the date; your photo, name, address, date of birth, height, eyes and hair from what you are; the login and the day it was made from the server; your hand, LEFT or RIGHT, chosen here: it holds, swings, punches and picks up), kept with your things and shown from the pack. Every station exit has a gate: a forcefield across the way out, unseen until you walk into it without showing your passport, that opens six seconds for everyone when a passport is shown at the machine beside it; coming in from the street is always free.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, LOOKS, MOTION, ONLINE, PASSPORT, pos, SFX, st, TEXT, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {MAPG, SECTION, SOL, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {APTS} from './059a-apts.js';
import {DESIGN} from './102b-designer.js';
import {BODIES} from './111a-bodies.js';
import {AVATAR} from './111c-avatar.js';
{
  const T=TILE, OPEN=6, V3=THREE.Vector3, esc=TEXT.esc, say=(t,c)=>SAY(t,c||'#c8c2b0');
  FORAGE.add({names:{passport:'PASSPORT'},prices:{passport:0}});
  let P=null; try{ P=JSON.parse(OWNED.get('passport')||'null'); }catch(e){}
  const sno=OWNED.me&&OWNED.me.no!=null?String(OWNED.me.no):null;   // the server numbers citizens in order; the single-file page draws one
  if(!P||!P.no){ const home=SECTION.id, j=OWNED.me&&OWNED.me.joined?new Date(OWNED.me.joined):new Date(), day=(isNaN(j)?new Date():j).toISOString().slice(0,10); P={no:sno||String(1000+Math.floor(Math.random()*9000)),issued:day,home,stamps:{[home]:day}}; OWNED.set('passport',JSON.stringify(P)); }
  else if(sno&&P.no!==sno){ P.no=sno; OWNED.set('passport',JSON.stringify(P)); }
  PASSPORT.P=P; const save=()=>OWNED.set('passport',JSON.stringify(P));
  st.hand=OWNED.get('hand')==='L'?'L':'R'; Object.defineProperty(PASSPORT,'hand',{get:()=>st.hand==='L'?'L':'R'}); PASSPORT.setHand=h=>{ h=h==='L'?'L':'R'; if(st.hand===h)return; st.hand=h; OWNED.set('hand',h); if(!sp.hidden)draw(); };
  const day=t=>{ const d=new Date(t); return isNaN(d)?'':d.toISOString().slice(0,10); };
  SYS.onStart(()=>{ if(!FORAGE.has('passport'))FORAGE.give('passport',1); },'159d-passport');
  PASSPORT.stamp=id=>{ if(!id||P.stamps[id])return; P.stamps[id]=new Date().toISOString().slice(0,10); save(); say('YOUR PASSPORT IS STAMPED: SECTION '+id+'.','#7dffa8'); };
  const sp=document.createElement('div'); sp.id='passportw'; sp.hidden=true;
  sp.style.cssText='position:fixed;inset:0;z-index:22;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45);zoom:var(--uiz,1)';
  sp.addEventListener('click',e=>{ if(e.target===sp)PASSPORT.close(); }); sp.addEventListener('keydown',e=>{ if(e.key==='Escape')PASSPORT.close(); e.stopPropagation(); }); sp.addEventListener('keyup',e=>e.stopPropagation()); document.body.appendChild(sp); { const st=document.createElement('style'); st.textContent=`#passportw .pX{font:13px 'Share Tech Mono',ui-monospace,monospace;color:#7dffa8;background:#010805;border:2px solid #3aa866;width:28px;height:28px;cursor:pointer}#passportw .pX:hover{background:#7dffa8;color:#020a06}`; document.head.appendChild(st); }
  // the card (owner, 7 Nov 2026: "C, no stamps, include other details like height, hair color, eye color, etc. address, etc. all passport/dl style info"): the menus' green look (10 Nov 2026); your photo from your look as it is; every line from what you are
  const HAIRN=[['1d1712','BLK'],['3b2a1e','BRO'],['5a3a24','BRO'],['8a5a32','AUB'],['b98a4e','BLN'],['d8c28a','BLN'],['8c8c8c','GRY'],['e8e4dc','WHI']];
  const rgb=h=>[0,2,4].map(i=>parseInt(String(h||'000000').slice(i,i+2),16)), near=(h,L)=>{ const a=rgb(h); let b=L[0], d=1e9; for(const e of L){ const c=rgb(e[0]), q=(a[0]-c[0])**2+(a[1]-c[1])**2+(a[2]-c[2])**2; if(q<d){ d=q; b=e; } } return b[1]; };
  const usd=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(5,7)+'/'+d.slice(8,10)+'/'+d.slice(0,4):'—';
  const addr=()=>{ const F=APTS.flatOf&&APTS.flatOf(APTS.num); if(!APTS.num||!F||!(F.floor>0))return 'NO FLAT YET'; return 'APT '+F.floor+(F.side?'B':'A')+' · THE TOWER, MARKET ST'; };
  const lb=(n,k)=>`<div style="font-size:8.5px;font-weight:900;letter-spacing:1.1px;color:#3aa866">${n?`<span style="color:#ffd27a;margin-right:3px">${n}</span>`:''}${k}</div>`;
  const K=(n,k,v,x='')=>`<div style="${x}">${lb(n,k)}<div style="font-size:14px;font-weight:900;letter-spacing:.4px;line-height:1.15">${v}</div></div>`;
  const IN=(f,v,x='',t='text')=>`<input class="pE" data-f="${f}" type="${t}" value="${esc(v)}" spellcheck="false" autocomplete="off" style="${x}">`;
  const SEL=(f,v,L)=>`<select class="pE" data-f="${f}">${L.map(([k,t])=>`<option value="${esc(k)}"${String(k)===String(v)?' selected':''}>${esc(t)}</option>`).join('')}</select>`;
  const uniq=L=>{ const o=[]; for(const [h,t] of L)if(!o.some(e=>e[1]===t))o.push([h,t]); return o; };
  const inch=L=>Math.round(67*(L.h||100)/100), HTS=[]; for(let n=60;n<=74;n++)HTS.push([n,Math.floor(n/12)+"'-"+String(n%12).padStart(2,'0')+'"']);
  const wgt=L=>P.wgt||Math.round(155*((L.h||100)/100)**2*[.85,1,1.2][L.b==null?1:L.b]);   // (until you write your own: from your height and build)
  const snap=()=>{ const c=!sp.hidden&&sp.querySelector('.pPh'); if(c)photo(c,'b:avatar:'+(AVATAR.code?AVATAR.code():''),P.pose||'',null).catch(e=>console.warn('PASSPORT photo',e)); };   // (the photo of you as you are now, whole, in your chosen pose)
  const look=o=>Promise.resolve(AVATAR.set&&AVATAR.set(o)).catch(e=>console.warn('PASSPORT look',e)).then(()=>{ if(!sp.hidden)draw(); setTimeout(snap,400); });
  const edit=async(f,v)=>{ const L=AVATAR.L?AVATAR.L():{};
    if(f==='name'){ const r=PASSPORT.claim?await PASSPORT.claim(v):{ok:false,why:'offline'}; if(r.ok&&LOOKS.setName)LOOKS.setName(r.name); else say(r.why==='taken'?'THAT NAME IS TAKEN.':r.why==='offline'?'THE MARKET CANNOT BE REACHED.':r.why==='busy'?'TOO MANY TRIES. WAIT A MINUTE.':'A NAME IS 3 TO 16 LETTERS OR DIGITS.','#e5403a'); return draw(); }
    if(f==='a1'||f==='a2'){ P[f]=String(v).toUpperCase().slice(0,32).trim(); save(); return draw(); }
    if(f==='dob'){ if(v===''||(/^\d{4}-\d\d-\d\d$/.test(v)&&v>='1900-01-01'&&v<=new Date().toISOString().slice(0,10)))PASSPORT.set({dob:v}); else draw(); return; }
    if(f==='wgt'){ const n=Math.round(+v); if(n>=60&&n<=600)PASSPORT.set({wgt:n}); else draw(); return; }
    if(f==='f')return look({f:v==='F'?'f':'m'});
    if(f==='h')return look({h:Math.min(110,Math.max(90,Math.round(+v*100/67)))});
    if(f==='b')return look({b:+v});
    if(f==='eye')return look({eye:v});
    if(f==='hair')return look({hair:v});
    if(f==='pose'){ P.pose=POSES.some(p=>p[0]===v)?v:''; save(); return draw(); } };
  const draw=()=>{ '@later'; const name=((LOOKS.L&&LOOKS.L.name)||'').trim().toUpperCase()||'A TENANT', L=AVATAR.L?AVATAR.L():{}, sex=L.f==='f'?'F':'M', dob=P.dob||'', hand=st.hand==='L'?'L':'R';
    const EY=uniq(AVATAR.EYES||[['2a2019','BRN']]), HR=uniq(HAIRN), ey=near(L.eye||'2a2019',EY), hr=near(L.hair,HR);
    const hb=h=>`<button class="pH" data-h="${h}" style="font:11px 'Share Tech Mono',ui-monospace,monospace;padding:3px 9px;cursor:pointer;border:2px solid #3aa866;margin-right:4px;background:${hand===h?'#7dffa8':'transparent'};color:${hand===h?'#020a06':'#7dffa8'}">${h}</button>`;
    const ce='text-align:center;text-transform:uppercase';
    sp.innerHTML=`<style>#passportw .pE{color-scheme:dark;font:inherit;font-weight:900;color:inherit;background:transparent;border:0;border-bottom:1.5px dashed transparent;padding:0;margin:0;width:100%;box-sizing:border-box;outline:none;border-radius:0;-webkit-appearance:none;appearance:none;cursor:text}#passportw select.pE{cursor:pointer}#passportw input[type=number].pE{-moz-appearance:textfield}#passportw .pE::-webkit-inner-spin-button{-webkit-appearance:none}#passportw .pE:hover,#passportw .pE:focus{border-bottom-color:#3aa866;background:#0d3a1f}#passportw select.pE option{background:#031a0d;color:#7dffa8}</style><div style="position:relative"><div style="width:360px;background:#031a0d;color:#7dffa8;overflow:hidden;position:relative;box-shadow:inset 0 0 0 2px #3aa866,0 20px 60px #000;font-family:'Share Tech Mono',ui-monospace,monospace;letter-spacing:1px">
      <div style="background:#7dffa8;color:#020a06;font-weight:400;letter-spacing:3px;font-size:17px;padding:12px 18px;text-align:center">THE STRANGEST FLEA MARKET</div>
      <div style="padding:22px 26px;display:flex;flex-direction:column;align-items:center;gap:12px">
        <canvas class="pPh" width="150" height="200" style="border:2px solid #3aa866;background:#0d3a1f;image-rendering:pixelated;display:block"></canvas>
        <div style="width:100%;font-size:30px;font-weight:900;letter-spacing:.4px">${IN('name',name,ce)}</div>
        <div style="font-size:15px;font-weight:900;color:#ffd27a">CITIZEN ${esc(P.no)} · TENANT</div>
        <div style="width:100%;font-size:13px;font-weight:900;line-height:1.4">${IN('a1',P.a1||addr(),ce)}${IN('a2',P.a2||'SECTION '+P.home+', NEW YORK',ce)}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px 18px;width:100%;margin-top:8px">
          ${K(5,'DOB',IN('dob',dob,'font-size:12px','date'))}${K(15,'SEX',SEL('f',sex,[['M','M'],['F','F']]))}${K(16,'HGT',SEL('h',inch(L),HTS))}
          ${K(17,'WGT',`<span style="display:flex;align-items:baseline">${IN('wgt',wgt(L),'width:38px','number')}<span>LB</span></span>`)}${K(18,'EYES',SEL('eye',EY.find(e=>e[1]===ey)[0],EY))}${K(19,'HAIR',SEL('hair',HR.find(e=>e[1]===hr)[0],HR))}
          ${K('','BUILD',SEL('b',L.b==null?1:L.b,(AVATAR.BUILDN||['SLIM','MEDIUM','BROAD']).map((t,i)=>[i,t])))}${K(3,'ISSUED',usd(P.issued))}${K(4,'EXPIRES','NEVER')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;width:100%;margin-top:6px"><div>${lb('','HAND')}${hb('R')}${hb('L')}</div><div style="min-width:110px">${lb('','PHOTO POSE')}${SEL('pose',P.pose||'',POSES)}</div>
          <div style="font-family:'Brush Script MT','Segoe Script','Snell Roundhand',cursive;font-size:${Math.min(30,Math.round(320/Math.max(4,name.length)))}px;line-height:1;color:#d8ffe4;white-space:nowrap">${esc(name.charAt(0)+name.slice(1).toLowerCase())}</div></div>
      </div></div><button class="pX" style="position:absolute;right:-6px;top:-38px">X</button></div>`;
    sp.querySelector('.pX').onclick=()=>PASSPORT.close(); sp.querySelectorAll('.pH').forEach(b=>{ b.onclick=()=>PASSPORT.setHand(b.dataset.h); });
    sp.querySelectorAll('.pE').forEach(e=>{ e.onchange=()=>edit(e.dataset.f,e.value); if(e.tagName==='INPUT')e.onkeydown=k=>{ if(k.key==='Enter')e.blur(); }; });
    snap(); };   // (the photo of you as you are now: the designer's portrait, shoulders and up)
  PASSPORT.set=o=>{ Object.assign(P,o); save(); if(!sp.hidden)draw(); };
  PASSPORT.open=()=>{ sp.hidden=false; sp.style.display='flex'; draw(); }; PASSPORT.close=()=>{ sp.hidden=true; sp.style.display='none'; };
  // the photo: your whole body in the pose you choose for it (owner, 8 Nov 2026: "show the full avatar in the photo on badge, and let players choose their default pose"), from a copy of the body posed apart from the street
  const POSES=[['','STANDING'],['greet','WAVE'],['foldArms','ARMS FOLDED'],['cheer','CHEER'],['fistPump','FIST PUMP',.65],['dab','DAB'],['powerUp','POWER UP'],['confused','CONFUSED'],['angry','ANGRY',.35],['guard','GUARD']];   // (each held at the moment of its move that reads best: the middle unless given)
  PASSPORT.POSES=POSES; PASSPORT.photo=(c,look,pose)=>photo(c,look,pose,null);
  const photo=async(c,look,pose,live)=>{ '@later'; if(!c)return; const g2=c.getContext('2d'), m=/^b:avatar:(.*)$/.exec(String(look||'')), base=BODIES.by.avatar, body=m&&base&&base.variant?base.variant(m[1]):null;
    if(!body){ if(live&&DESIGN.snapOf){ DESIGN.snapOf(g2,c.width,c.height,live); fitPic(c); } return; }
    const S=RIG.create(); S.target=0; if(pose&&POSES.some(p=>p[0]===pose)){ const I=await MOTION.ensure(); if(RIG.MOVES['mc_'+pose]){ RIG.begin(S,'mc_'+pose); const d=(I[pose]&&I[pose].dur)||1; const k=PASSPORT.poseAt!=null?PASSPORT.poseAt:(POSES.find(p=>p[0]===pose)[2]??.5); for(let t=0;t<d*k;t+=1/30)RIG.step(S,1/30); } } else for(let i=0;i<10;i++)RIG.step(S,1/30);
    const M=BODIES.mesh(body), G=new THREE.Group(); G.add(M.me); M.me.frustumCulled=false; BODIES.pose(RIG.pose(S,true),M.PM,body,S); G.updateMatrixWorld(true);
    const bx=new THREE.Box3(), v=new V3(); const IV=new THREE.Matrix4(); M.PM.value.forEach((m4,i)=>bx.expandByPoint(body.binv?v.setFromMatrixPosition(IV.copy(body.binv[i]).invert()).applyMatrix4(m4):v.setFromMatrixPosition(m4))); const h=bx.max.y-bx.min.y; bx.max.y+=.4*h; bx.min.y-=.07*h; bx.expandByVector(v.set(.2*h,0,.2*h));   // (framed on the posed bones, with room for the whole head above the head bone and the soles below)
    try{ DESIGN.snapOf(g2,c.width,c.height,G,{box:bx}); } finally{ G.remove(M.me); } fitPic(c); };
  const fitPic=c=>{ const W=c.width, H=c.height, g=c.getContext('2d'), d=g.getImageData(0,0,W,H).data; let x0=W,y0=H,x1=-1,y1=-1;   // the whole figure in the frame: cropped to what was drawn, scaled to fit with a margin
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>8){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } if(x1<0)return;
    const w=x1-x0+1, h=y1-y0+1, k=Math.min(W*.86/w,H*.84/h), t=document.createElement('canvas'); t.width=w; t.height=h; t.getContext('2d').drawImage(c,x0,y0,w,h,0,0,w,h);
    g.clearRect(0,0,W,H); g.imageSmoothingEnabled=false; g.drawImage(t,0,0,w,h,Math.round((W-w*k)/2),Math.round(H-H*.06-h*k),Math.round(w*k),Math.round(h*k)); };
  // in your pack, never leaves you (no dropping, no trading); the lanyard is gone (owner, 8 Nov 2026)
  FORAGE.ACT.passport=()=>PASSPORT.open(); FORAGE.ROWB.push(id=>id==='passport'?[['SHOW','passport']]:[]);
  // another player's card (owner, 8 Nov 2026: "if you double click on another player it shows their id on your screen"): what their card says travels with them (ONLINE.mine.id), the rest is read from their look
  const cardOf=()=>[P.no,P.a1||addr(),P.a2||'SECTION '+P.home+', NEW YORK',P.dob||'',P.wgt||'',P.issued||'',P.pose||''].map(v=>String(v).replace(/\|/g,' ')).join('|');
  ONLINE.mine.id=cardOf;
  PASSPORT.show=o=>{ '@later'; if(!o)return; const a=String(o.x&&o.x.id||'').split('|'), lk=String(o.look||''), m=/^b:avatar:(.*)$/.exec(lk), L=m&&AVATAR.decode?AVATAR.decode(m[1]):null;
    const name=(o.name||'A TENANT').toUpperCase(), v=t=>esc(t||'—');
    const EY=uniq(AVATAR.EYES||[['2a2019','BRN']]), HR=uniq(HAIRN);
    const sex=L?(L.f==='f'?'F':'M'):'—', hgt=L?(HTS.find(e=>e[0]===inch(L))||[0,'—'])[1]:'—', w=a[4]||(L?Math.round(155*((L.h||100)/100)**2*[.85,1,1.2][L.b==null?1:L.b]):''), ey=L?near(L.eye||'2a2019',EY):'—', hr=L?near(L.hair,HR):'—', bd=L?(AVATAR.BUILDN||['SLIM','MEDIUM','BROAD'])[L.b==null?1:L.b]:'—';
    sp.innerHTML=`<div style="position:relative"><div style="width:360px;background:#031a0d;color:#7dffa8;overflow:hidden;position:relative;box-shadow:inset 0 0 0 2px #3aa866,0 20px 60px #000;font-family:'Share Tech Mono',ui-monospace,monospace;letter-spacing:1px;text-transform:uppercase">
      <div style="background:#7dffa8;color:#020a06;font-weight:400;letter-spacing:3px;font-size:17px;padding:12px 18px;text-align:center">THE STRANGEST FLEA MARKET</div>
      <div style="padding:22px 26px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center">
        <canvas class="pPh" width="150" height="200" style="border:2px solid #3aa866;background:#0d3a1f;image-rendering:pixelated;display:block"></canvas>
        <div style="font-size:30px;font-weight:900;letter-spacing:.4px">${esc(name)}</div>
        <div style="font-size:15px;font-weight:900;color:#ffd27a">CITIZEN ${v(a[0])} · TENANT</div>
        <div style="font-size:13px;font-weight:900;line-height:1.4">${v(a[1])}<br>${v(a[2])}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px 18px;width:100%;margin-top:8px;text-align:left">
          ${K(5,'DOB',esc(usd(a[3])))}${K(15,'SEX',sex)}${K(16,'HGT',esc(hgt))}${K(17,'WGT',w?esc(w)+' LB':'—')}${K(18,'EYES',ey)}${K(19,'HAIR',hr)}${K('','BUILD',esc(bd))}${K(3,'ISSUED',esc(usd(a[5])))}${K(4,'EXPIRES','NEVER')}
        </div>
        <div style="display:flex;gap:8px;margin-top:6px"><button class="pT" style="font:12px 'Share Tech Mono',ui-monospace,monospace;letter-spacing:2px;padding:5px 12px;cursor:pointer;border:2px solid #3aa866;background:transparent;color:#7dffa8">ASK TO TRADE</button></div>
      </div></div><button class="pX" style="position:absolute;right:-6px;top:-38px">X</button></div>`;
    sp.hidden=false; sp.style.display='flex'; sp.querySelector('.pX').onclick=()=>PASSPORT.close(); sp.querySelector('.pT').onclick=()=>{ PASSPORT.close(); if(PASSPORT.trade)PASSPORT.trade(o); };
    photo(sp.querySelector('.pPh'),lk,a[6]||'',o.fig&&o.fig.g).catch(e=>console.warn('PASSPORT their photo',e)); };
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
    const g={st,me,L,box,until:0,said:0,hb,vis:0}; const A=new V3(...st.P(0,a0,0)), B=new V3(...st.P(1,a0,0)).sub(A); g.u=()=>new V3(pos.x,A.y,pos.z).sub(A).dot(B)/B.lengthSq();
    UI.thing({name:'PASSPORT MACHINE',pick:true,obj:hb,reach:1.1*T,near:2.2*T,tall:1.6*T,act:()=>{ if(!FORAGE.has('passport'))return say('YOU HAVE NO PASSPORT. EVERY TENANT IS ISSUED ONE AT THE DOOR.','#e5403a'); ONLINE.put('gate:'+st.id,Date.now()); SFX.play('latch',{vol:.5}); say('THE GATE READS YOUR PASSPORT AND OPENS FOR '+OPEN+' SECONDS. GO.','#7fd8ff'); }});
    gates.push(g); closeG(g); return g; };
  const openG=(g,until)=>{ g.until=until; const i=SOL.down.indexOf(g.box); if(i>=0)SOL.down.splice(i,1); g.me.visible=false; g.L.visible=false; };
  const closeG=g=>{ g.until=0; if(!SOL.down.includes(g.box))SOL.down.push(g.box); g.vis=0; g.me.visible=false; g.L.visible=false; };
  PASSPORT.openAt=(st,until)=>{ const g=gates.find(q=>q.st===st); if(g)openG(g,until); };
  SYS.add('world',(k,v)=>{ if(!k.startsWith('gate:'))return; const g=gates.find(q=>'gate:'+q.st.id===k); if(g&&Date.now()-v<OPEN*1000)openG(g,v+OPEN*1000); },'159d-passport');
  let bl=0; SYS.add('places',dt=>{ if(!LOOP.STA||!MAPG.down)return; for(const st of LOOP.STA)if(st.P&&!gates.some(g=>g.st===st))mk(st); const now=Date.now(); bl+=dt;
    for(const g of gates){ if(g.until&&now>g.until)closeG(g); if(g.until)continue; const u=g.u(), inB=pos.x>g.box[0]-1.2*T&&pos.x<g.box[2]+1.2*T&&pos.z>g.box[1]-1.2*T&&pos.z<g.box[3]+1.2*T;
      if(inB&&u<.1){ const i=SOL.down.indexOf(g.box); if(i>=0)SOL.down.splice(i,1); } else if(!SOL.down.includes(g.box))SOL.down.push(g.box);   // in from the street is free: the field lets you through when you come from the hall side
      const push=inB&&u>.1&&SHARED.LVL==='down'; g.vis=Math.max(0,Math.min(1,g.vis+(push?dt*4:-dt*1.2))); g.me.visible=g.L.visible=g.vis>0; g.me.material.opacity=g.vis*(.7+.25*Math.sin(bl*4)); g.L.intensity=1.2*g.vis;   // the field shows only to someone walking into it
      if(push&&now-g.said>5000){ g.said=now; say('THE GATE: SHOW YOUR PASSPORT AT THE MACHINE TO LEAVE.','#7fd8ff'); } } },'159d-gates');
  window.PASSPORT=PASSPORT;
}
