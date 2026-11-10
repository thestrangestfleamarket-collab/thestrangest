// THE LINES: LINES holds what characters say and shows it over their heads.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, LEVELS, LINES, LOOKS, SFX} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
Object.assign(LINES,{log:[]});
{ const POOL={
    greet:['Hello, {{name}}.','You again. Good.','Welcome to the market.','Watch your step out here.','Quiet tonight, isn\'t it?','Looking for something?','Hm? Oh. Hello.','Don\'t mind me.','The dragons are out again.','Mind the stairs down there.','Nice to see a face.','Hey there, {{name}}.'],
    report:['Unit reporting. Threat down.','All clear on the street.','Logged. Resuming patrol.','Intruder neutralised.','Sector quiet.','Back on the beat.'],
    fox:['Welcome, welcome.','Everything\'s fresh. Mostly.','Cash only, friend.','Don\'t touch the top shelf.','Back again, {{name}}?','The radio\'s free. The rest isn\'t.'],
    golem:['Stones? We buy stones.','Show us what glitters, {{name}}.','Rare ones, rarer coin.','Crystals sing in the dark. We listen.','The cave keeps us. We keep the cave.','Fair price. Always fair.','Hmm. Grind. Hmm.'],
    gd_pub:['The keep is this way, friend.','Mind the stair. It bites.','All quiet above. Below is another matter.','Welcome to the castle, {{name}}.','Stay on the wall. The dragons like the towers.','Old Ember is in. Mind your manners.','Looking for work? The keep posts bounties.','Keep your blade sheathed up here.'],
    gd_up:['Up you come, {{name}}.','Someone comes. Good, it\'s you.','Back from below? You look it.','Hold. Ah. Pass, friend.','Mind the gate as you go.','The stair is yours.'],
    thanks:['Thanks, {{name}}.','Much obliged.','There you go.','Read it before the rain does.','Come back tomorrow, it\'s all new.','Keep the change. No, wait.'],
    mushroom:['Mushrooms. Fresh picked.','These ones glow a little.','Try one. Or don\'t.','Found them under the bridge.','Only the red ones bite.','For you, {{name}}, half price.'],
    courier:['Parcel for... no, not you.','Coming through!','Sign here. No, here.','Left at the door, {{name}}. As usual.','Can\'t stop, it\'s fragile.','Beep beep.'],
  };
  const RECENT_MAX=14; let recent=[]; try{ recent=JSON.parse(SAVE.get('recent')||'[]')||[]; }catch(e){ recent=[]; }
  const hashS=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const fill=(s,ctx)=>s.replace(/\{\{(\w+)\}\}/g,(m,k)=>ctx[k]);
  LINES.pools=POOL; LINES.add=(k,arr)=>{ POOL[k]=(POOL[k]||[]).concat(arr); };
  LINES.pick=(k,ctx={},seed)=>{ '@later'; const pool=POOL[k]||[]; if(!pool.length)return '';
    const fits=pool.filter(s=>!/\{\{(\w+)\}\}/.test(s.replace(/\{\{(\w+)\}\}/g,(m,q)=>ctx[q]?'':m)));
    const use=fits.length?fits:pool.filter(s=>!/\{\{/.test(s)); if(!use.length)return '';
    const fresh=use.filter(s=>!recent.includes(s)), opts=fresh.length?fresh:use, i=seed!=null?hashS(String(seed))%opts.length:Math.floor(Math.random()*opts.length), line=opts[i];
    recent.push(line); while(recent.length>RECENT_MAX)recent.shift(); SAVE.set('recent',JSON.stringify(recent)); return fill(line,ctx); };
  LINES.recent=()=>recent.slice();
  const st=document.createElement('style'); st.textContent='.said2{position:fixed;transform:translate(-50%,-100%);font:12px var(--pixel);color:var(--fg);background:var(--panel);border:2px solid var(--line);padding:3px 7px;pointer-events:none;z-index:14;white-space:nowrap;max-width:240px}'; document.head.appendChild(st);
  const ON=[], MAX=3, V=new THREE.Vector3();
  const you=()=>(LOOKS.L&&LOOKS.L.name)||'';
  LINES.say=(N,k,ctx)=>{ '@later'; if(!N||!N.g)return ''; const text=POOL[k]?LINES.pick(k,Object.assign({name:you()},ctx||{})):String(k); if(!text)return '';
    const sg=LINES.signs&&LINES.signs(N,text); if(sg)text=sg;   // (a townsperson who signs: their line as far as you read signs, no voice; 146zs)
    const old=ON.findIndex(o=>o.N===N); if(old>=0){ ON[old].el.remove(); ON.splice(old,1); } while(ON.length>=MAX){ ON[0].el.remove(); ON.shift(); }
    const el=document.createElement('div'); el.className='said2'; document.body.appendChild(el);
    const o={N,el,text,n:0,t:0,life:Math.max(1.5,Math.min(4.5,text.length/40+.8)),voice:sg?null:N.voice||(N.voice=SFX.voiceOf(N.key||N.name))}; ON.push(o);
    LINES.log.push({who:N.key||N.name,pool:POOL[k]?k:null,text,at:Date.now(),h:typeof CLOCK!=='undefined'?+CLOCK.h.toFixed(2):null}); if(LINES.log.length>100)LINES.log.shift(); return text; };
  LINES.tick=dt=>{ if(!ON.length)return; const r=renderer.domElement.getBoundingClientRect();
    for(let i=ON.length-1;i>=0;i--){ const o=ON[i], N=o.N; o.t+=dt;
      const n=Math.min(o.text.length,Math.floor(o.t*40)); if(n>o.n){ if(o.voice&&((n&1)===0||n===o.text.length))SFX.blip(o.voice,{at:{x:N.st.x,z:N.st.z},far:14*TILE}); o.n=n; o.el.textContent=o.text.slice(0,n); }
      const shown=N.g.visible&&!N.far&&N.lv===SHARED.LVL&&(!N.g.parent||N.g.parent.visible)&&LEVELS.drawn(N.g); if(!shown||o.t>o.life+o.text.length/40){ o.el.remove(); ON.splice(i,1); continue; }
      V.set(N.st.x,N.g.position.y+(N.H||1.8)*1.06,N.st.z).project(SHARED.cam); const off=V.z>1||V.x<-1.2||V.x>1.2||V.y<-1.2||V.y>1.2; o.el.hidden=off; if(off)continue;
      o.el.style.left=Math.round(r.left+(V.x+1)/2*r.width)+'px'; o.el.style.top=Math.round(r.top+(1-V.y)/2*r.height)+'px'; } };
  LINES.speaking=()=>ON.length;
}
