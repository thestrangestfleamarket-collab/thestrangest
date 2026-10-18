// ---- WHAT THEY SAY (owner, 17 Oct 2026, from his physician game's reflections and reviews: pools of lines, a line dropped if its blank can't
// be filled, the ones said lately set aside, the pick stable from a hash when it should be): the start of TODO.md's talking characters
// ("anything they say will be saved and logged and anything that can be reused will be reused"). LINES.pick(pool, {name}) gives a line:
// never one of the last fourteen said (kept in the save: SAVE's `recent`) while any other fits; LINES.say(N, pool) shows it over the
// character's head for as long as it takes to read (the game's clamp: the length over forty a second, plus a little, 1.5 to 4.5 s), typed out
// at forty a second with a voice blip every other letter (SFX.blip, each character's own voice from a hash of his name), quieter as he's far.
// A character says a line when you walk up and wave to him (ui.js), when a guard has seen a troublemaker off (npc-skel.js: cheer), when a
// droid reports (npc-droids.js), when a troublemaker shoves you (npc-skel.js). Lines said are logged (LINES.log, the last hundred) for the day
// they're kept for real. Nothing on screen while nobody speaks; at most three speaking at once. ----
const LINES={log:[]};
{ const POOL={
    greet:['Hello, {{name}}.','You again. Good.','Welcome to the market.','Watch your step out here.','Quiet tonight, isn\'t it?','Looking for something?','Hm? Oh. Hello.','Don\'t mind me.','The dragons are out again.','Mind the stairs down there.','Nice to see a face.','Hey there, {{name}}.'],
    cheer:['And stay down!','That\'s the last of him.','All clear.','Back to the beat.','They never learn.','Ha! Off he goes.','Street\'s safe, {{name}}.','Nothing to see.'],
    report:['Unit reporting. Threat down.','All clear on the street.','Logged. Resuming patrol.','Intruder neutralised.','Sector quiet.','Back on the beat.'],
    trouble:['Move it!','Out of my way!','Hah!','Gimme that!','Boo!'],
    fox:['Welcome, welcome.','Everything\'s fresh. Mostly.','Cash only, friend.','Don\'t touch the top shelf.','Back again, {{name}}?','The radio\'s free. The rest isn\'t.'],
    golem:['Stones? We buy stones.','Show us what glitters, {{name}}.','Rare ones, rarer coin.','Crystals sing in the dark. We listen.','The cave keeps us. We keep the cave.','Fair price. Always fair.','Hmm. Grind. Hmm.'],
    mushroom:['Mushrooms. Fresh picked.','These ones glow a little.','Try one. Or don\'t.','Found them under the bridge.','Only the red ones bite.','For you, {{name}}, half price.'],
  };
  const RECENT_MAX=14; let recent=[]; try{ recent=JSON.parse(SAVE.get('recent')||'[]')||[]; }catch(e){ recent=[]; }
  const hashS=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const fill=(s,ctx)=>s.replace(/\{\{(\w+)\}\}/g,(m,k)=>ctx[k]);
  LINES.pools=POOL; LINES.add=(k,arr)=>{ POOL[k]=(POOL[k]||[]).concat(arr); };
  // a line from a pool: only those whose blanks the moment can fill; not said lately if any other fits; by a seed's hash if given, else at random
  LINES.pick=(k,ctx={},seed)=>{ const pool=POOL[k]||[]; if(!pool.length)return '';
    const fits=pool.filter(s=>!/\{\{(\w+)\}\}/.test(s.replace(/\{\{(\w+)\}\}/g,(m,q)=>ctx[q]?'':m)));   // (a blank left unfilled: not this one)
    const use=fits.length?fits:pool.filter(s=>!/\{\{/.test(s)); if(!use.length)return '';
    const fresh=use.filter(s=>!recent.includes(s)), opts=fresh.length?fresh:use, i=seed!=null?hashS(String(seed))%opts.length:Math.floor(Math.random()*opts.length), line=opts[i];
    recent.push(line); while(recent.length>RECENT_MAX)recent.shift(); SAVE.set('recent',JSON.stringify(recent)); return fill(line,ctx); };
  LINES.recent=()=>recent.slice();
  // ---- SAID OVER HIS HEAD: a small label at his head, typed out, blipped, gone when read
  const st=document.createElement('style'); st.textContent='.said2{position:fixed;transform:translate(-50%,-100%);font:12px var(--pixel);color:var(--fg);background:var(--panel);border:2px solid var(--line);padding:3px 7px;pointer-events:none;z-index:14;white-space:nowrap;max-width:240px}'; document.head.appendChild(st);
  const ON=[], MAX=3, V=new THREE.Vector3();
  const you=()=>(typeof LOOKS!=='undefined'&&LOOKS.L&&LOOKS.L.name)||'';
  LINES.say=(N,k,ctx)=>{ if(!N||!N.g)return ''; const text=POOL[k]?LINES.pick(k,Object.assign({name:you()},ctx||{})):String(k); if(!text)return '';
    const old=ON.findIndex(o=>o.N===N); if(old>=0){ ON[old].el.remove(); ON.splice(old,1); } while(ON.length>=MAX){ ON[0].el.remove(); ON.shift(); }
    const el=document.createElement('div'); el.className='said2'; document.body.appendChild(el);
    const o={N,el,text,n:0,t:0,life:Math.max(1.5,Math.min(4.5,text.length/40+.8)),voice:N.voice||(N.voice=SFX.voiceOf(N.key||N.name))}; ON.push(o);
    LINES.log.push({who:N.key||N.name,pool:POOL[k]?k:null,text,at:Date.now(),h:typeof CLOCK!=='undefined'?+CLOCK.h.toFixed(2):null}); if(LINES.log.length>100)LINES.log.shift(); return text; };
  LINES.tick=dt=>{ if(!ON.length)return; const r=renderer.domElement.getBoundingClientRect();
    for(let i=ON.length-1;i>=0;i--){ const o=ON[i], N=o.N; o.t+=dt;
      const n=Math.min(o.text.length,Math.floor(o.t*40)); if(n>o.n){ if((n&1)===0||n===o.text.length)SFX.blip(o.voice,{at:{x:N.st.x,z:N.st.z},far:14*TILE}); o.n=n; o.el.textContent=o.text.slice(0,n); }
      const shown=N.g.visible&&!N.far&&N.lv===LVL&&(!N.g.parent||N.g.parent.visible); if(!shown||o.t>o.life+o.text.length/40){ o.el.remove(); ON.splice(i,1); continue; }
      V.set(N.st.x,N.g.position.y+(N.H||1.8)*1.06,N.st.z).project(cam); const off=V.z>1||V.x<-1.2||V.x>1.2||V.y<-1.2||V.y>1.2; o.el.hidden=off; if(off)continue;
      o.el.style.left=Math.round(r.left+(V.x+1)/2*r.width)+'px'; o.el.style.top=Math.round(r.top+(1-V.y)/2*r.height)+'px'; } };
  LINES.speaking=()=>ON.length;
}
