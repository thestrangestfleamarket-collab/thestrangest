// THE COMPANION DRONE: what PIP (111dd-flybot) does besides talk: a double click opens its menu (WHERE IS, HOW DO I, WHAT'S THIS, TIPS), it leads you to a place, zaps whatever hits you and patches you up when you are low.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, GUIDE, NPCS, ONLINE, pos, ROOMS, SFX, TALK, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
{ const T=TILE, B=ONLINE.bot, ZAPCD=8, HEALCD=45, ME={key:'pip',name:'PIP',voice:SFX.voiceOf('pip','high'),st:{x:0,z:0}};
  let lead=null, zapT=0, healT=0, beamT=0, gi=0, last=0;
  const at=()=>{ const R=B.mine(); return R&&R.g.position; };
  const unbr=s=>String(s||'').replace(/\[([^\]]+)\]/g,'$1');

  /* ---------- the beam: one thin box, a zap at what hit you or a mend on you ---------- */
  const beam=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:.85,depthWrite:false})); beam.visible=false; scene.add(beam);
  const shoot=(x,y,z,c)=>{ const a=at(); if(!a)return; const L=Math.hypot(x-a.x,y-a.y,z-a.z)||1; beam.position.set((a.x+x)/2,(a.y+y)/2,(a.z+z)/2); beam.scale.set(.035*T,.035*T,L); beam.lookAt(x,y,z); beam.material.color.set(c); beam.visible=true; beamT=.4; };

  /* ---------- guarding: a blow that gets past your own guard is zapped back (the attacker staggers as from a parry) ---------- */
  SYS.onStart(()=>{ const g0=VIT.guard; VIT.guard=(d,from)=>{ const g=g0?g0(d,from):{d}; if(!B.on||g.parry||!(g.d>=.02)||zapT>0||VIT.dead||!from||from.x==null)return g;
    zapT=ZAPCD; shoot(from.x,(SHARED.py||0)+.9*T,from.z,0x9fe8ff); SFX.play('laser',{vol:.5,vary:.2}); B.tell(['Back off!','Zap! Leave my friend alone.','Not on my watch!'][Math.floor(Math.random()*3)]); return {d:g.d*.3,parry:true}; }; },'111de-companion guard');

  /* ---------- leading: it flies a little ahead of you toward the place until you are there ---------- */
  const aim=(x,z)=>{ if(!lead)return null; const dx=lead.x-x, dz=lead.z-z, d=Math.hypot(dx,dz); if(d<1e-3)return null; const k=Math.min(d,2.6*T)/d; return {x:x+dx*k,z:z+dz*k}; };
  const steps=(x,z)=>Math.round(Math.hypot(x-pos.x,z-pos.z)/T);
  const goLead=n=>{ const p=(UI.places?UI.places():[]).find(q=>q[0]===n); if(!p)return 'I can\'t find '+n+' on my map.';
    const lv=p[3]==='down'?'down':'up'; if(ROOMS.cur&&ROOMS.cur.off)return 'Let\'s step outside first, then ask me again.';
    if(lv!==SHARED.LVL||p[4]==='off'){ setTimeout(()=>UI.goPlace&&UI.goPlace(n),1200); return n+' is a way off. Hold on, I\'ll take you there.'; }
    lead={name:n,x:p[1],z:p[2]}; return 'Follow me to '+n+'! It\'s about '+steps(p[1],p[2])+' steps.'; };

  SYS.add('life',()=>{ const now=performance.now(), dt=Math.min(.2,(now-(last||now))/1000); last=now; zapT-=dt; healT-=dt;
    if(beamT>0&&(beamT-=dt)<=0)beam.visible=false;
    const R=B.mine(); if(!R){ lead=null; return; } R.aim=lead?aim:null; ME.st.x=R.g.position.x; ME.st.z=R.g.position.z;
    if(lead){ if(SHARED.LVL==='down'||ROOMS.cur&&ROOMS.cur.off){ lead=null; } else if(steps(lead.x,lead.z)<=2){ B.tell('Here we are: '+lead.name+'.'); lead=null; } }
    if(!VIT.dead&&!(VIT.out>0)&&VIT.hp<.35&&healT<=0){ healT=HEALCD; VIT.heal(.3); shoot(pos.x,(SHARED.py||0)+.9*T,pos.z,0x8af0a0); SFX.play('chirp',{vol:.4}); B.tell('Hold still, patching you up.'); } },'111de-companion');

  /* ---------- what it knows: what is near, a tip for now, a guide book chapter ---------- */
  const near=()=>{ let best=null, bd=6*T; for(const n of NPCS.all()){ if(!n.g||!n.g.visible||!n.st||(n.lv||'up')!==SHARED.LVL)continue; const d=Math.hypot(n.st.x-pos.x,n.st.z-pos.z); if(d<bd){ bd=d; best={n}; } }
    const v=new THREE.Vector3(); for(const th of UI.things||[]){ if(th.quiet||th.name==='YOU'||!th.obj||!th.obj.visible)continue; th.obj.getWorldPosition(v); const d=Math.hypot(v.x-pos.x,v.z-pos.z); if(d<bd){ bd=d; best={th}; } } return best; };
  const where=()=>{ let n='', d=1e18; for(const p of UI.places?UI.places():[]){ const q=Math.hypot(p[1]-pos.x,p[2]-pos.z); if(q<d){ d=q; n=p[0]; } } return n||'THE STREET'; };
  const what=()=>{ const b=near(); if(!b)return 'Nothing close by. We\'re near '+where()+'.';
    if(b.th)return 'That\'s '+b.th.name+'. Double-click it to use it.';
    const n=b.n, nm=String(n.name||n.key||'someone').toUpperCase();
    if(/^(ogre|skeleton|slime|dragon|rat|frog|bat|wasp|spider|snake|golem|wolf|bear)/i.test(n.key||''))return 'Careful, that\'s a '+nm+'. If it goes for you, I\'ll zap it.';
    return TALK.sells(n)?'That\'s '+nm+'. They sell things: double-click them to see.':'That\'s '+nm+'. They\'re from around here.'; };
  const tip=()=>{ const L=[], h=CLOCK.h;
    if(VIT.hp<.6)L.push('You\'re hurt. Sitting on a bench or a bed mends you faster.');
    if(VIT.sta<.3)L.push('You\'re out of breath. Stop for a moment and your stamina fills again.');
    if(h!=null&&(h>=20||h<6))L.push('It\'s night. Some shops are shut till morning.');
    if(SHARED.LVL==='down')L.push('We\'re underground. The stairs take you back up to the street.');
    const C=GUIDE.G&&GUIDE.G.chapters; if(C&&C.length){ const c=C[Math.floor(Math.random()*C.length)]; L.push(c.title+': '+unbr(c.steps[0]||c.what)); }
    L.push('Ask me WHERE IS and I\'ll fly you there.','If something hits you, I zap it back. I need a few seconds between zaps.');
    return L[Math.floor(Math.random()*L.length)]; };
  const chapter=()=>{ const c=GUIDE.G&&GUIDE.G.chapters[gi]; return c?c.title+'. '+c.what+' '+c.steps.map((s,i)=>(i+1)+'. '+unbr(s)).join(' '):'My guide book is still loading. Ask me again in a moment.'; };
  Object.assign(TALK.vars,{piphi:()=>(lead?'Still heading to '+lead.name+'. ':'')+'What do you need?'+(ONLINE.on?' (Type @ and a question in the chat to ask me anything.)':''),pipwhat:what,piptip:tip,pipguide:chapter,piplead:()=>ME.leadSay||''});
  Object.assign(TALK.ops,{piplead:a=>{ ME.leadSay=goLead(a); },pipguide:a=>{ gi=+a||0; },pipstop:()=>{ lead=null; },pipoff:()=>{ lead=null; B.set(false); TALK.close(); SAY('PIP FLIES OFF. CALL IT BACK FROM THE MENU\'S CHAT.','#7ef0c8'); }});

  /* ---------- the menu: its lines for the talk window, made fresh each time you double-click it ---------- */
  const pages=(lines,pre,head,items)=>{ const N=6; for(let k=0;k*N<items.length||k===0;k++){ const o=items.slice(k*N,k*N+N); if((k+1)*N<items.length)o.push({t:'MORE...',go:pre+(k+1)}); o.push({t:'BACK',go:'hi'}); lines[pre+k]={say:k?'And more:':head,opts:o}; } };
  const script=()=>{ const back={t:'BACK',go:'hi'}, top=[{t:'WHERE IS...',go:'w0'},{t:'HOW DO I...',go:'h0'},{t:'WHAT\'S THIS?',go:'what'},{t:'ANY TIPS?',go:'tip'}];
    if(lead)top.unshift({t:'STOP LEADING',do:'pipstop',go:'hi'}); top.push({t:'GO AWAY FOR NOW',do:'pipoff'},{t:'BYE',go:'bye'});
    const lines={hi:{say:'{piphi}',opts:top},what:{say:'{pipwhat}',opts:[{t:'AND NOW?',go:'what'},back]},tip:{say:'{piptip}',opts:[{t:'ANOTHER',go:'tip'},back]},
      lead:{say:'{piplead}',opts:[]},how:{say:'{pipguide}',opts:[{t:'SOMETHING ELSE',go:'h0'},back]},bye:{say:'Call me any time.',opts:[]}};
    const seen=new Set(), P=(UI.places?UI.places():[]).filter(p=>!seen.has(p[0])&&seen.add(p[0]));
    pages(lines,'w','Where to?',P.map(p=>({t:p[0],do:'piplead',arg:p[0],go:'lead'})));
    pages(lines,'h','What do you want to learn?',((GUIDE.G&&GUIDE.G.chapters)||[]).map((c,i)=>({t:c.title,do:'pipguide',arg:String(i),go:'how'})));
    return {start:'hi',lines}; };
  const hid=document.createElement('div');
  const open=async()=>{ if(!B.on||VIT.dead)return; if(!GUIDE.G&&GUIDE.open)try{ await GUIDE.open(hid); }catch(e){} ME.talk=script(); TALK.talk(ME); };
  const none=new THREE.Group(); none.visible=false;
  UI.thing({name:'PIP',quiet:1,far:1,get obj(){ const R=B.mine(); return R?R.g:none; },act:open});
  B.open=open;

  // the first time you play it says hello
  SYS.onStart(()=>setTimeout(()=>{ try{ if(B.on&&SAVE.get('flybothi')!=='1'){ SAVE.set('flybothi','1'); B.tell('Hi, I\'m PIP, your drone. Double-click me if you need help.'); } }catch(e){} },4000),'111de-companion hello');
  window.PIPDBG=()=>({on:B.on,lead,zapT,healT,beam:beam.visible,talk:TALK.on}); }
