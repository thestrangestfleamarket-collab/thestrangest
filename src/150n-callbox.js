// THE FRONT DOOR AND THE CALLBOX: your flat's front door goes straight out to the street (no hall, stairs or lift; owner, 10 Nov 2026); your mailbox and the notice board hang by it; the callbox beside the house's street door lists who lives there, rings one, and their buzzer lets you in or not.
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const APTS=MODS.apts, H={built:false}, CALL={ring:null,ask:null,sent:[]}; window.CALLBOX=CALL;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])), say=(t,c)=>SAY(t,c||'#f2c14e');
  ROOMK.parts.push(c=>{ '@apts'; const {apt,M,W,part,mat,Lx,Ly,du}=c;
    const box=(u0,va,u1,vb,y0,y1,m,cast=true)=>part(new THREE.BoxGeometry(u1-u0,y1-y0,vb-va),m,(u0+u1)/2,(y0+y1)/2,(va+vb)/2,0,apt,cast);
    const hitAt=(u,h,v,w,hh,d,name,act)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w*M,hh*M,d*M),new THREE.MeshBasicMaterial({visible:false})); hb.position.copy(W(u,h,v)); scene.add(hb); UI.thing({name,ghost:1,obj:hb,reach:1.6*M,near:2.8*M,tall:hh*M,act}); };
    if(APTS.frontDoor)APTS.frontDoor.set(false);
    hitAt(du,1.15,Ly-.2,1.2,2.3,.8,'FRONT DOOR',()=>{ if(!APTS.inReal)return; SFX.play('latch',{at:W(du,1.1,Ly),vol:.8}); APTS.exitReal('OUT TO THE STREET'); });
    if(STORE.furnish&&STORE.furnish.hall)STORE.furnish.hall({box,hitAt,mat,v1:Ly,EW:du-2.8,us:2*3.4-1.6-(du-2.8)});   // the mailboxes between the writing desk and the door, the notice board over the desk
    H.built=true; });

  /* ---------- the callbox on the street ---------- */
  const P=document.createElement('div'); P.id='callbox'; P.hidden=true; P.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);min-width:min(340px,92vw);max-width:92vw;max-height:64vh;overflow:auto;padding:12px 14px;background:#020a06f2;border:2px solid #1f6b43;color:#7dffa8;font:11px/1.7 Silkscreen,monospace;letter-spacing:1px;z-index:40';
  const Q=document.createElement('div'); Q.id='buzzer'; Q.hidden=true; Q.setAttribute('role','alertdialog'); Q.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);padding:12px 16px;background:#020a06f2;border:2px solid #f2c14e;color:#f4f2ea;font:11px/1.7 Silkscreen,monospace;letter-spacing:1px;z-index:42;text-align:center';
  document.body.append(P,Q);
  const BT='font:inherit;letter-spacing:1px;padding:2px 9px;border:2px solid #1f6b43;background:transparent;color:#7dffa8;cursor:pointer';
  const whereOf=id=>{ const o=ONLINE.others&&ONLINE.others.get(id); return !o?'offline':o.p&&o.p.rm==='apt:'+id?'home':'out'; };
  CALL.rows=async()=>{ const L=[], seen=new Set(); for(const t of (ONLINE.tenants?await ONLINE.tenants():[])){ if(t.id===ONLINE.me||seen.has(t.id))continue; seen.add(t.id); L.push({id:t.id,name:t.name,at:whereOf(t.id)}); }
    if(ONLINE.others)for(const [id,o] of ONLINE.others)if(!seen.has(id)&&id!==ONLINE.me){ seen.add(id); L.push({id,name:o.name||'A NEIGHBOUR',at:whereOf(id)}); }
    const k={home:0,out:1,offline:2}; return L.sort((a,b)=>k[a.at]-k[b.at]||(a.name<b.name?-1:1)); };
  const draw=async()=>{ '@later'; const L=await CALL.rows(), R=CALL.ring; if(P.hidden)return;
    P.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px"><b>CALLBOX · ${esc(APTS.houseName||'THE TOWER')}</b><button data-a="x" style="${BT}">X</button></div>`+
      (R?`<div style="margin:8px 0;color:#f2c14e">RINGING ${esc(R.name)}… <button data-a="hang" style="${BT}">HANG UP</button></div>`:'')+
      `<div style="display:flex;justify-content:space-between;gap:12px;border-top:1px solid #12402a;padding:5px 0"><span>${esc(ONLINE.myName&&ONLINE.myName()||'YOU')} <span style="color:#3f9c6a">(YOU)</span></span><button data-a="in" style="${BT}">GO IN</button></div>`+
      L.map(t=>`<div style="display:flex;justify-content:space-between;gap:12px;border-top:1px solid #12402a;padding:5px 0"><span>${esc(t.name)} <span style="color:#3f9c6a">${t.at.toUpperCase()}</span></span>${t.at==='offline'?'<span style="color:#3f9c6a">—</span>':`<button data-ring="${esc(t.id)}" data-n="${esc(t.name)}" style="${BT}">RING</button>`}</div>`).join('')+
      (L.length?'':'<div style="border-top:1px solid #12402a;padding:5px 0;color:#3f9c6a">NO NEIGHBOURS YET.</div>'); };
  CALL.open=()=>{ P.hidden=false; draw(); }; CALL.close=()=>{ P.hidden=true; };
  CALL.ringTo=(id,name)=>{ if(!(ONLINE.on&&ONLINE.send)){ say('THE CALLBOX NEEDS THE BLOCK: YOU ARE NOT ONLINE.','#c8a090'); return false; } CALL.ring={id:String(id),name:String(name||'A NEIGHBOUR'),until:performance.now()+20000}; ONLINE.send({t:'ring',op:'ask',to:CALL.ring.id}); SFX.play('click',{vol:.4}); draw(); return true; };
  const done=t=>{ CALL.ring=null; if(t)say(t,'#c8a090'); draw(); };
  P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const a=b.dataset.a; if(a==='x')return CALL.close(); if(a==='hang')return done(); if(a==='in'){ CALL.close(); return APTS.enterReal(); } if(b.dataset.ring)CALL.ringTo(b.dataset.ring,b.dataset.n); });
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&!P.hidden){ CALL.close(); e.stopImmediatePropagation(); } },true);
  // the buzzer: wherever you are, someone at your door; LET IN brings them to your flat
  const asked=()=>{ const A=CALL.ask; if(!A){ Q.hidden=true; return; } Q.innerHTML=`<div style="color:#f2c14e">BZZZT</div><div>${esc(A.name)} IS AT YOUR DOOR.</div><div style="margin-top:8px;display:flex;gap:8px;justify-content:center"><button data-a="yes" style="${BT};border-color:#f2c14e;color:#f2c14e">LET IN</button><button data-a="no" style="${BT}">NOT NOW</button></div>`; Q.hidden=false; };
  Q.addEventListener('click',e=>{ const b=e.target.closest('[data-a]'), A=CALL.ask; if(!b||!A)return; ONLINE.send({t:'ring',op:b.dataset.a,to:A.from}); CALL.ask=null; asked(); });
  setInterval(()=>{ const n=performance.now(); if(CALL.ask&&n>CALL.ask.until){ CALL.ask=null; asked(); } if(CALL.ring&&n>CALL.ring.until)done('NOBODY ANSWERS.'); },1000);
  ONLINE.hear.ring=m=>{ '@later'; const op=m.op, from=String(m.from||'');
    if(op==='ask'){ CALL.ask={from,name:String(m.name||'A NEIGHBOUR').toUpperCase(),until:performance.now()+25000}; SFX.play('click',{vol:.7,pitch:.5}); asked(); return; }
    const R=CALL.ring; if(!R||R.id!==from)return;
    if(op==='yes'){ CALL.ring=null; CALL.close(); say(R.name.toUpperCase()+' BUZZES YOU IN.'); ONLINE.visit(R.id,R.name); }
    else done(op==='gone'?'NOBODY HOME.':R.name.toUpperCase()+': NOT NOW.'); };
  let made=false; SYS.add('places',()=>{ if(made||!UI.thing||!APTS||!APTS.doorW||!APTS.T)return; made=true;
    const T=APTS.T, L=T.L, B=SHARED.BOD, at=(du,dv)=>{ const p=T.pt((L.x0+L.x1)/2+du,L.y1+dv); return [B.X(p[0]),B.Z(p[1])]; }, [x,z]=at(1.25,.06), [fx,fz]=at(1.25,1), y=APTS.doorW[1]+1.35*TILE;
    const g=new THREE.Group(); g.position.set(x,y,z); g.lookAt(fx,y,fz); const M=c=>new THREE.MeshLambertMaterial({color:c}), add=(w,h,d,c,px,py,pz)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w*TILE,h*TILE,d*TILE),M(c)); m.position.set(px*TILE,py*TILE,pz*TILE); g.add(m); return m; };
    add(.34,.52,.06,0xb8bcc6,0,0,0); add(.2,.12,.02,0x20222a,0,.14,.035); for(let i=0;i<4;i++){ add(.16,.045,.02,0xf4f0e0,-.04,.02-i*.07,.035); add(.045,.045,.03,0xc8a040,.11,.02-i*.07,.035); } scene.add(g);
    const hb=new THREE.Mesh(new THREE.BoxGeometry(.6*TILE,.9*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,y,z); scene.add(hb); CALL.at=[x,y,z];
    UI.thing({name:'CALLBOX',ghost:1,obj:hb,reach:1.4*TILE,near:2.6*TILE,tall:.9*TILE,act:CALL.open}); },'150n-callbox');
  window.HALLDBG=()=>({built:H.built,real:!!APTS.inReal,things:UI.things.filter(t=>['FRONT DOOR','YOUR MAILBOX','THE NOTICE BOARD','CALLBOX','ELEVATOR','STAIRS DOWN TO THE STREET'].includes(t.name)).map(t=>t.name),panel:!P.hidden,buzzer:!Q.hidden,ring:CALL.ring&&CALL.ring.id,
    use:n=>{ const t=UI.things.find(t=>t.name===n); if(t)t.act(); return !!t; }});
}
