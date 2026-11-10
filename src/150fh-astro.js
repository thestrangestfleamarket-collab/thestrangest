// ASTRONOMY AT THE TELESCOPE: the skill (the bigger eyepieces open as it grows; the Professor teaches it), the observing logbook, a camera on the eyepiece (astrophotos sold like any print) and the star party (share your eyepiece: whoever you invite sees what you see, and you can hand them the tube).
import {FORAGE, INVITES, ONLINE, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {MODS} from './006-map-pre.js';
import {PHOTOS} from './146m-prints.js';
import {FIRSTS} from './150fcz-firsts.js';
import {SCOPE} from './150fd-scope.js';
const ASTRO={}; window.ASTRO=ASTRO;
{ const KEY='astro', S={v:1,seen:{},n:{},day:''};
  try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){}
  const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(S)); }catch(e){} }, esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const sk=k=>FORAGE.sk?FORAGE.sk(k):0;

  /* ---------- the skill: what each eyepiece asks of you ---------- */
  const NEED={100:40,200:70};
  SCOPE.magOK=m=>sk('astro')>=(NEED[m]||0); SCOPE.magNote=m=>'SKILL '+NEED[m];
  FORAGE.HELP.push('ASTRONOMY: the telescope in your apartment. Each new thing you find and hold in the middle of the eyepiece goes in your logbook and teaches the skill (the rarer, the more); 100X needs 40, 200X needs 70. The Professor gives lessons. A camera on the eyepiece takes prints of what you see, sold like any photograph.');

  // what a thing in the eyepiece is: its logbook group and how rare it is
  const SOL=['moon','sun','me','ve','ma','ju','sa','ur','ne'], TIER={moon:'c',sun:'c',me:'r',ve:'c',ma:'c',ju:'c',sa:'r',ur:'s',ne:'s'};
  const GRP={sol:'SOLAR SYSTEM',deep:'DEEP SKY',star:'BRIGHT STARS',move:'MOVING THINGS'};
  const what=(id,o)=>{ if(!id)return null; const A=SCOPE.astro;
    if(SOL.includes(id))return {g:'sol',tier:TIER[id],name:A.BODY[id].name,exp:'short'};
    if(id.startsWith('star:')){ const n=SCOPE.stars&&SCOPE.stars.named[+id.slice(5)]; return n&&{g:'star',tier:'c',name:n[2],exp:'mid'}; }
    const t=SCOPE.data&&(SCOPE.data.sky||[]).find(x=>x.id===id&&x.ra!=null); if(t)return {g:'deep',tier:t.kind==='cluster'?'c':'r',name:t.name,exp:'long'};
    if(o&&o.cat)return {g:'move',tier:o.tier||'r',name:o.name||id,exp:o.cat==='comet'||o.cat==='aurora'?'long':'mid',cat:o.cat};
    return null; };
  const total=g=>g==='sol'?SOL.length:g==='deep'?((SCOPE.data&&SCOPE.data.sky)||[]).filter(x=>x.ra!=null&&!SOL.includes(x.id)).length:g==='star'?((SCOPE.stars&&SCOPE.stars.named)||[]).length:0;
  const count=g=>Object.values(S.seen).filter(r=>r.g===g).length;

  /* ---------- the log: something held in the middle a moment, clearly seen ---------- */
  let cur='', hold=0, lookT=0;
  const log=(key,W)=>{ S.seen[key]={g:W.g,t:Date.now(),name:W.name}; save(); const d={c:10,r:35,s:60}[W.tier]||20; for(let i=0;i<2;i++)FORAGE.use('astro',d-25,d+25);
    SAY('IN YOUR LOGBOOK: '+W.name+' ('+GRP[W.g]+').','#c8e0ff'); if(SCOPE.isOpen())SCOPE.view.panel(); };
  const look=(C,dt)=>{ if((lookT-=dt)>0)return; lookT=.25; const step=.25;
    let id=SCOPE.centre, o=SCOPE.centreObj; const blur=Math.abs(SCOPE.focus-.18)*SCOPE.mag*.45, clear=C.cover<.6&&(SCOPE.glare||0)<.3&&blur<3;
    if(!id&&SCOPE.stars){ const q=SCOPE.radec(), N=SCOPE.stars.named||[], lim=C.fov*.12; let best=-1, bd=1e9; for(let i=0;i<N.length;i++){ const dr=Math.abs(N[i][1]-q.dec), da=Math.abs(((N[i][0]-q.ra+540)%360)-180)*Math.cos(q.dec*Math.PI/180), d=Math.hypot(da,dr); if(d<bd){ bd=d; best=i; } } if(best>=0&&bd<lim)id='star:'+best; }
    const W=what(id,o), ok=W&&clear&&(id!=='sun'||SCOPE.filter)&&!(o&&o.mag!=null&&o.mag>C.lim+1);
    if(!ok){ cur=''; hold=0; return; } if(cur===id)hold+=step; else { cur=id; hold=0; }
    if(hold<1.5)return;
    if(id==='sa'&&SCOPE.mag>=50)FIRSTS.mark('rings'); if(id==='ju'&&SCOPE.mag>=25&&C.cover<.3)FIRSTS.mark('moons'); if(W.g==='deep')FIRSTS.mark('deep');
    const key=W.cat?W.cat+':'+W.name:id; if(!S.seen[key])log(key,W); };

  /* ---------- the camera on the eyepiece: short exposures stacked (the air's tremble averages out), long ones gathered (faint things come up; without the clock drive, stars trail) ---------- */
  const EXPS=[['1/250',.004],['1/60',1/60],['1 S',1],['30 S',30]]; let expI=1, busy=false;
  const IDEAL={short:[0,1],mid:[1,2],long:[3,3]};
  ASTRO.shoot=async()=>{ if(busy||!SCOPE.isOpen())return null; busy=true;
    try{ const cv=SCOPE.view.cv, exp=EXPS[expI][1], id=SCOPE.centre, o=SCOPE.centreObj, W=what(id,o), n=exp<.1?8:6, OW=192, OH=144;
      const acc=document.createElement('canvas'); acc.width=OW; acc.height=OH; const a=acc.getContext('2d'); a.fillStyle='#000'; a.fillRect(0,0,OW,OH);
      const s=Math.min(cv.width,cv.height)*.62, sw=s, sh=s*.75, sx=(cv.width-sw)/2, sy=(cv.height-sh)/2, gain=exp>=1?Math.min(3.2,1+Math.log2(exp*2+1)*.45):1, drift=!SCOPE.track&&exp>=1?Math.min(40,exp*.6):0;
      for(let i=0;i<n;i++){ await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        if(exp<.1){ a.globalAlpha=1/(i+1); a.globalCompositeOperation='source-over'; } else { a.globalAlpha=gain/n; a.globalCompositeOperation='lighter'; }
        a.drawImage(cv,sx,sy,sw,sh,drift*i/(n-1),0,OW,OH); }
      a.globalAlpha=1; a.globalCompositeOperation='source-over';
      let src; try{ src=acc.toDataURL('image/jpeg',.85); }catch(e){ SAY('THE CAMERA COULD NOT DEVELOP THAT ONE.','#c8a090'); return null; }
      const blur=Math.abs(SCOPE.focus-.18)*SCOPE.mag*.45, fq=blur<1.5?1:Math.max(.2,1-(blur-1.5)/8), want=W?IDEAL[W.exp]:[0,3], eq=expI>=want[0]&&expI<=want[1]?1:Math.abs(expI-(expI<want[0]?want[0]:want[1]))===1?.6:.3, tq=drift>0&&W&&W.exp!=='short'?.4:1;
      const day=new Date().toDateString(); if(S.day!==day){ S.day=day; S.n={}; } const kind=W?(W.cat?W.cat+':':'')+W.name:'sky', rep=Math.max(.25,Math.pow(.8,S.n[kind]||0)); S.n[kind]=(S.n[kind]||0)+1; save();
      const base=W?{c:6,r:16,s:45}[W.tier]:1, qual=fq*eq*tq, v=Math.max(1,Math.round(base*qual*(.5+sk('photo')/100)*(1+sk('astro')/200)*rep));
      const p={id:'photo_'+Date.now().toString(36)+Math.floor(Math.random()*1e3),cap:((W?W.name:'THE NIGHT SKY')+' · '+new Date().toLocaleDateString('en-US',{day:'numeric',month:'short'}).toUpperCase()).slice(0,30),src,v,sub:'sky_'+(id||'sky'),tier:W?W.tier:'c'};
      PHOTOS.own(p); const d={c:10,r:35,s:60}[p.tier]; FORAGE.use('photo',d-30,d+30,qual>.8?5:0);
      SAY('A PRINT: '+p.cap+' — WORTH ABOUT $'+v+(qual<.6?' (SOFT, OR THE WRONG EXPOSURE)':'')+'.','#c8b0ff'); if(SFX)SFX.play('click',{vol:.6,vary:.1}); return p; }
    finally{ busy=false; } };

  /* ---------- the star party: your eyepiece shared, theirs followed ---------- */
  const party={on:false,w:new Map(),ctl:''}; let watch=null, steer=null, sendT=0, keepJD=null;
  const me=()=>ONLINE.me||'';
  SCOPE.lead=()=>{ if(watch&&watch.st&&watch.st.ctl!==me())return {alt:watch.st.alt,az:watch.st.az};
    if(party.on&&party.ctl&&steer&&performance.now()-steer.t<2500)return {alt:steer.alt,az:steer.az}; return null; };
  ONLINE.hear.sky=m=>{ if(!watch||m.id!==watch.id)return; if(!m.on){ ASTRO.leave(true); return; } watch.st=m; SCOPE.mag=m.mag; SCOPE.focus=m.f; SCOPE.filter=!!m.fl; SCOPE.fixJD=m.jd; };
  ONLINE.hear.skyw=m=>{ if(!party.on)return; if(m.op==='join'){ party.w.set(m.id,m.name||'A TENANT'); SAY((m.name||'A TENANT')+' IS LOOKING THROUGH YOUR TELESCOPE.','#c8e0ff'); }
    else if(m.op==='leave'){ party.w.delete(m.id); if(party.ctl===m.id)party.ctl=''; } else if(m.op==='steer'&&party.ctl===m.id)steer={alt:m.alt,az:m.az,t:performance.now()};
    if(SCOPE.isOpen())SCOPE.view.panel(); };
  const tick=dt=>{ if((sendT-=dt)>0||!ONLINE.on)return; sendT=.25;
    if(party.on)ONLINE.send({t:'sky',on:1,alt:SCOPE.alt,az:SCOPE.az,mag:SCOPE.mag,f:SCOPE.focus,fl:SCOPE.filter?1:0,jd:SCOPE.jd(),ctl:party.ctl});
    if(watch&&watch.st&&watch.st.ctl===me())ONLINE.send({t:'skyw',to:watch.id,op:'steer',alt:SCOPE.alt,az:SCOPE.az}); };
  ASTRO.share=on=>{ party.on=on; if(!on){ if(ONLINE.on)ONLINE.send({t:'sky',on:0,alt:0,az:0,mag:25,f:0,jd:2.46e6,ctl:''}); party.w.clear(); party.ctl=''; } };
  ASTRO.watch=async(id,name)=>{ if(!(MODS.apts&&MODS.apts.inReal)&&MODS.apts&&MODS.apts.enterReal)await MODS.apts.enterReal(); keepJD=SCOPE.fixJD||null; watch={id,name:name||'A TENANT',st:null};
    await SCOPE.open(); if(ONLINE.send)ONLINE.send({t:'skyw',to:id,op:'join',alt:0,az:0}); SAY('YOU ARE LOOKING THROUGH '+watch.name+"'S TELESCOPE.",'#c8e0ff'); SCOPE.view.panel(); };
  ASTRO.leave=gone=>{ if(!watch)return; if(!gone&&ONLINE.send)ONLINE.send({t:'skyw',to:watch.id,op:'leave',alt:0,az:0}); if(gone)SAY(watch.name+' PUT THEIR TELESCOPE AWAY.','#c8e0ff'); watch=null; SCOPE.fixJD=keepJD; keepJD=null; if(SCOPE.isOpen())SCOPE.view.panel(); };
  INVITES.kinds.sky={what:()=>'TO A STAR PARTY AT THE TELESCOPE',go:(d,v)=>ASTRO.watch(v.from,v.name)};
  ASTRO.party=()=>({on:party.on,watchers:[...party.w.values()],ctl:party.ctl,watching:watch&&{id:watch.id,name:watch.name,got:!!watch.st}});

  /* ---------- the panel: the skill and logbook, the camera, the party, tonight's firsts ---------- */
  let inviting=false;
  SCOPE.ext.push({
    panel:()=>{ const v=sk('astro');
      let h=`<div class="row"><b>ASTRONOMY ${v.toFixed(1)}</b><div style="height:7px;background:#cdbf9f"><i style="display:block;height:100%;width:${Math.min(100,v)}%;background:#3b2a1e"></i></div>
        <div class="info" style="margin-top:4px">${Object.keys(GRP).map(g=>`<div style="display:flex;justify-content:space-between"><span>${GRP[g]}</span><span>${count(g)}${total(g)?' / '+total(g):''}</span></div>`).join('')}</div></div>`;
      h+=`<div class="row"><b>CAMERA</b>${EXPS.map(([n],i)=>`<button class="btn ${i===expI?'on':''}" data-x="astro-exp" data-i="${i}">${n}</button>`).join('')}<button class="btn" data-x="astro-shot"${busy?' disabled':''}>TAKE PHOTO</button></div>`;
      if(watch)h+=`<div class="row"><b>STAR PARTY</b><div class="info">LOOKING THROUGH ${esc(watch.name)}'S TELESCOPE${watch.st&&watch.st.ctl===me()?' · YOU HAVE THE TUBE':''}${watch.st?'':' · WAITING FOR THEM…'}</div><button class="btn" data-x="astro-leave">LEAVE</button></div>`;
      else { const L=party.on?[...party.w].map(([id,n])=>`<div style="display:flex;justify-content:space-between"><span>● ${esc(n)}</span><span>${party.ctl===id?'HAS THE TUBE':'WATCHING'}</span></div>`).join(''):'';
        h+=`<div class="row"><b>STAR PARTY</b>${L?`<div class="info">${L}</div>`:''}<button class="btn ${party.on?'on':''}" data-x="astro-share">${party.on?'SHARING':'SHARE'}</button><button class="btn" data-x="astro-invite">INVITE</button>${party.on&&party.w.size?`<button class="btn" data-x="astro-give">${party.ctl?'TAKE IT BACK':'HAND IT OVER'}</button>`:''}`;
        if(inviting){ const E=INVITES.everyone?INVITES.everyone():[]; h+=`<div class="info" style="max-height:120px;overflow:auto;border:2px solid #3b2a1e;background:#f6f1e4;padding:2px 4px;margin-top:4px">${E.length?E.map(p=>`<div data-x="astro-to" data-id="${esc(p.id)}" data-n="${esc(p.name)}" style="cursor:pointer;padding:2px 0">${esc(p.name)}</div>`).join(''):'NOBODY ELSE IS ONLINE.'}</div>`; }
        h+='</div>'; }
      return h+`<div class="row"><button class="btn" data-x="astro-firsts">TONIGHT'S FIRSTS</button></div>`; },
    click:b=>{ const x=b.dataset.x; if(!x||!x.startsWith('astro-'))return false;
      if(x==='astro-exp')expI=+b.dataset.i; else if(x==='astro-shot'){ ASTRO.shoot(); }
      else if(x==='astro-share')ASTRO.share(!party.on); else if(x==='astro-leave')ASTRO.leave();
      else if(x==='astro-invite')inviting=!inviting; else if(x==='astro-to'){ if(!party.on)ASTRO.share(true); INVITES.send(b.dataset.id,b.dataset.n,'sky',{}); inviting=false; }
      else if(x==='astro-give'){ const ids=[...party.w.keys()]; party.ctl=party.ctl?'':ids[0]||''; steer=null; } else if(x==='astro-firsts')FIRSTS.show(); return true; },
    draw:C=>{ look(C,C.dt||0); tick(C.dt||0); },
    close:()=>{ if(watch)ASTRO.leave(); if(party.on)ASTRO.share(false); inviting=false; } });
  ASTRO.dbg=()=>({skill:sk('astro'),seen:{...S.seen},n:{...S.n},party:ASTRO.party(),exp:EXPS[expI][0]});
  ASTRO.exp=i=>{ expI=Math.max(0,Math.min(EXPS.length-1,i)); };
}
