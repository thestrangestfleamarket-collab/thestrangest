// IMPORT MUSIC (owner, 12 Nov 2026: "add an IMPORT MUSIC button ... upload sheet music or tab and have your character play it"): MUSICIN, a music file (MusicXML, MIDI, Guitar Pro, ABC, a text tab) read into a piece kept on your account, fitted to each instrument but the drums as its book's pieces are (the hands and fingers solved on it), under YOUR MUSIC in every book; free to play at any skill; those near fetch a piece when its owner plays it.
import {INSTR, MUSICIN} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {GUITAR} from './146zob-guitar.js';
window.MUSICIN=MUSICIN;
{ const MAX=12, MAXN=1500, ROOM=250000, say=(t,c)=>SAY(t,c||'#e8e2cc');
  // a piece as kept: {id, name, by, n:[dt, midi, length, hand ...]} in centiseconds; hand 0 the left, 1 the right, 2 to 7 a tab's own string 1 to 6
  const txt=t=>String(t||'').replace(/\s+/g,' ').trim();
  const clean=p=>{ if(!p||typeof p!=='object'||!Array.isArray(p.n)||p.n.length<4||p.n.length>MAXN*4||!/^\d{1,12}$/.test(String(p.id)))return null;
    const n=[]; for(let i=0;i+3<p.n.length;i+=4)n.push(Math.max(0,Math.min(6000,p.n[i]|0)),Math.max(0,Math.min(127,p.n[i+1]|0)),Math.max(3,Math.min(600,p.n[i+2]|0)),Math.max(0,Math.min(7,p.n[i+3]|0)));
    return {id:String(p.id),name:txt(p.name).slice(0,60)||'A PIECE',by:txt(p.by).slice(0,40),n}; };
  const open=p=>{ const o=[], n=p.n; let t=0; for(let i=0;i+3<n.length;i+=4){ t+=n[i]; o.push({t,m:n[i+1],d:n[i+2],h:n[i+3]}); } return o; };
  const chords=ns=>{ const G=[]; for(const n of ns){ const g=G[G.length-1]; if(g&&n.t-g[0].t<3)g.push(n); else G.push([n]); } return G; };
  // into an instrument's range by whole octaves; what is still outside is left out
  const octs=(ns,LO,HI)=>{ let lo=127, hi=0, sh=0; for(const n of ns){ lo=Math.min(lo,n.m); hi=Math.max(hi,n.m); } while(lo+sh<LO)sh+=12; while(hi+sh>HI&&lo+sh-12>=LO)sh-=12; return ns.map(n=>({...n,m:n.m+sh})).filter(n=>n.m>=LO&&n.m<=HI); };

  /* ---------- a piece fitted to each instrument, as tools/*-songs-bake.py fit the books' ---------- */
  const FIT={};
  // the piano: a hand each note (the file's own parts, else by pitch), no hand holding more than five
  FIT.piano=ns=>{ ns=ns.filter(n=>n.m>=21&&n.m<=108).map(n=>({...n,h:n.h>1?+(n.m>=60):n.h}));
    for(const g of chords(ns))for(const [s,o] of [[1,0],[0,1]]){ const h=g.filter(n=>n.h===s).sort((a,b)=>a.m-b.m); while(h.length>5)(s?h.shift():h.pop()).h=o; }
    const out=[]; let last=ns.length?ns[0].t:0; for(const n of ns){ out.push(n.t-last,n.m,n.d,20+n.h); last=n.t; } return out; };
  // the violin, the flute, the trumpet: the tune alone, the top note of the right hand at each moment
  FIT.mel=ns=>{ let R=ns.filter(n=>n.h===1); if(R.length<ns.length*.25)R=ns; const mel=[];
    for(const n of R){ const l=mel[mel.length-1]; if(l&&n.t-l.t<=3){ if(n.m>l.m){ l.m=n.m; l.d=n.d; } } else mel.push({t:n.t,m:n.m,d:n.d}); }
    const out=[]; let last=mel.length?mel[0].t:0; mel.forEach((n,i)=>{ const d=mel[i+1]?Math.max(4,Math.min(n.d,mel[i+1].t-n.t)):n.d; out.push(n.t-last,n.m,d); last=n.t; }); return out; };
  // the harp: each note a string and its pedal; a chord its pedals cannot reach is left out
  const LET=[0,2,4,5,7,9,11], spell=pc=>{ const o=[]; LET.forEach((n,li)=>{ for(const p of [-1,0,1])if((n+p+12)%12===pc)o.push([li,p]); }); return o; }, strOf=(m,li,p)=>Math.floor((m-p-36)/12)*7+li;
  FIT.harp=ns=>{ ns=octs(ns,36,93); const ped=[0,0,0,0,0,0,0], last=ped.map(()=>-900), out=[]; let tl=ns.length?ns[0].t:0;
    for(const g of chords(ns)){ const t=g[0].t, ms=[...new Set(g.map(n=>n.m))].sort((a,b)=>a-b), L=ms.filter(m=>m<60), R=ms.filter(m=>m>=60); while(L.length>4)L.splice(L.length>>1,1); while(R.length>4)R.splice(R.length>>1,1);
      const want={}, got=[]; let ok=true;
      for(const m of [...L,...R]){ let best=null; for(const [li,p] of spell(m%12)){ const s=strOf(m,li,p); if(s<0||s>=34)continue; let c=ped[li]===p?0:t-last[li]>20?1:99; if(li in want&&want[li]!==p)c=99; c+=Math.abs(p)*.01; if(!best||c<best[0])best=[c,li,p,s]; }
        if(!best||best[0]>=99){ ok=false; break; } want[best[1]]=best[2]; got.push([m,best[1],best[2],best[3]]); }
      if(!ok)continue; const dur={}; for(const n of g)dur[n.m]=n.d;
      got.forEach(([m,li,p,s],i)=>{ ped[li]=p; last[li]=t; out.push(i?0:t-tl,s,p+1,Math.min(dur[m]||40,500),m<60?0:1); }); tl=t; }
    return out; };
  // the guitar: a tab's own strings and frets; else every chord on strings and frets within a hand's span, the hand moving as little as it can over the whole piece
  const OPEN=[64,59,55,50,45,40], FMAX=19;
  FIT.guitar=ns=>{ const out=[];
    if(ns.length&&ns.every(n=>n.h>1&&n.m-OPEN[n.h-2]>=0&&n.m-OPEN[n.h-2]<=FMAX)){ let last=ns[0].t; for(const g of chords(ns)){ const seen=new Set(); g.forEach(n=>{ if(seen.has(n.h))return; out.push(seen.size?0:g[0].t-last,n.h-1,n.m-OPEN[n.h-2],Math.min(n.d,400)); seen.add(n.h); }); last=g[0].t; } return out; }
    ns=octs(ns,40,OPEN[0]+FMAX);
    const cands=ps=>{ const opts=ps.map(p=>OPEN.map((o,s)=>[s,p-o]).filter(c=>c[1]>=0&&c[1]<=FMAX)), res=[], cur=[];
      const go=i=>{ if(i===ps.length){ const fr=cur.map(c=>c[1]).filter(k=>k>0); if(!fr.length||Math.max(...fr)-Math.min(...fr)<=4)res.push(cur.slice()); return; } for(const c of opts[i])if(!cur.some(x=>x[0]===c[0])){ cur.push(c); go(i+1); cur.pop(); } };
      go(0); const sum=c=>c.reduce((a,x)=>a+x[1],0); return res.sort((a,b)=>sum(a)-sum(b)).slice(0,40); };
    const at=c=>{ const f=c.map(x=>x[1]).filter(k=>k>0); return f.length?Math.min(...f):null; };
    let prev=[{v:0,p:null,path:null}];
    for(const ch of chords(ns)){ let ps=[...new Set(ch.map(n=>n.m))].sort((a,b)=>b-a).slice(0,6), cs=cands(ps); while(!cs.length&&ps.length>1){ ps.splice(ps.length>>1,1); cs=cands(ps); } if(!cs.length)continue;
      const nxt=[]; for(const c of cs){ const p=at(c), mk=Math.max(0,...c.map(x=>x[1])), base=c.reduce((a,x)=>a+x[1],0)*.18+mk*.25+(mk-(p||mk))*.3+(mk<=5?0:.4*(mk-5)); let best=null;
        for(const q of prev){ const mv=p==null||q.p==null?0:Math.abs(p-q.p)*(.5+.1*Math.abs(p-q.p)), v=q.v+base+mv; if(!best||v<best.v)best={v,p:p!=null?p:q.p,path:{up:q.path,ch,ps,c}}; }
        nxt.push(best); }
      prev=nxt.sort((a,b)=>a.v-b.v).slice(0,25); }
    const path=[]; for(let q=prev[0].path;q;q=q.up)path.unshift(q); let last=path.length?path[0].ch[0].t:0;
    for(const {ch,ps,c} of path){ const dur={}; for(const n of ch)dur[n.m]=n.d; c.forEach(([s,k],i)=>out.push(i?0:ch[0].t-last,s+1,k,Math.min(dur[ps[i]]||30,400))); last=ch[0].t; }
    return out; };

  /* ---------- in the books: every instrument's but the drums', a piece fitted the first time it is wanted ---------- */
  const BOOKS=()=>{ const L=[{id:'guitar',B:GUITAR.BOOK,f:'notes',fit:FIT.guitar}]; for(const K of Object.values(INSTR.KINDS))if(K.id!=='drums')L.push({id:K.id,B:K.BOOK,f:'n',fit:K.mel?FIT.mel:FIT[K.id]}); return L.filter(b=>b.fit); };
  const IDX={}, put=(b,key,p,free)=>{ const M=IDX[b.id]||(IDX[b.id]=new Map()); let i=M.get(key);
    if(i==null){ const ns=open(p), l=ns[ns.length-1], T={name:p.name,by:p.by,imp:p.id,free,kept:true,secs:Math.round((l.t+l.d)/100)}; let v=null; Object.defineProperty(T,b.f,{get:()=>v||(v=b.fit(open(p))),enumerable:true}); i=b.B.length; b.B.push(T); M.set(key,i); }
    return i; };
  const fill=()=>{ INSTR.fillSongs(); GUITAR.fillSongs(); };
  let LIST=[]; try{ LIST=(JSON.parse(OWNED.get('music')||'[]')||[]).map(clean).filter(Boolean).slice(0,MAX); }catch(e){}
  for(const p of LIST)for(const b of BOOKS())put(b,'me|'+p.id,p,1);
  const add=p=>{ p=clean(p); if(!p)return 'THAT FILE HAS NO NOTES TO PLAY.'; if(LIST.length>=MAX||JSON.stringify([...LIST,p]).length>ROOM)return 'YOUR MUSIC IS FULL: REMOVE A PIECE FIRST.';
    LIST.push(p); OWNED.set('music',JSON.stringify(LIST)); let at={}; for(const b of BOOKS())at[b.id]=put(b,'me|'+p.id,p,1); fill(); return at; };
  const remove=id=>{ LIST=LIST.filter(p=>p.id!==id); OWNED.set('music',JSON.stringify(LIST)); for(const b of BOOKS()){ const M=IDX[b.id], i=M&&M.get('me|'+id); if(i!=null){ b.B[i].free=0; M.delete('me|'+id); } } fill(); };
  // another player's piece, fetched the first time they play it near you: its place in that instrument's book, or -1
  const THEIRS=new Map();
  MUSICIN.theirs=(who,pid,kind)=>{ const b=BOOKS().find(b=>b.id===kind), key=who+'|'+pid; if(!b||!/^\d{1,12}$/.test(String(pid))||!/^https?:$/.test(location.protocol))return Promise.resolve(-1);
    let q=THEIRS.get(key); if(!q){ q=fetch('/owned',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({music:who,p:String(pid)})}).then(r=>r.ok?r.json():null).then(j=>clean(j&&j.piece)).catch(()=>null); THEIRS.set(key,q); q.then(p=>{ if(!p)THEIRS.delete(key); }); }
    return q.then(p=>{ if(!p)return -1; const i=put(b,key,p,2); return b.B[i][b.f].length?i:-1; }); };
  Object.assign(MUSICIN,{FIT,MAX,list:()=>LIST,saved:()=>OWNED.get('music'),add,remove,clean});

  /* ---------- the window and the readers (fetched when IMPORT MUSIC is first pressed) ---------- */
  const WIN=()=>{ '@music';
    const esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
    // a MIDI file's parts (the drums left out)
    const midi=async buf=>{ const M=await import('https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.28/+esm'), Midi=M.Midi||M.default.Midi, J=new Midi(buf);
      return {name:J.name||'',by:'',tracks:J.tracks.filter(t=>t.notes.length&&t.channel!==9&&!(t.instrument&&t.instrument.percussion)).map(t=>({name:t.name||t.instrument&&t.instrument.name||'',notes:t.notes.map(n=>({t:n.time,m:n.midi,d:n.duration}))}))}; };
    // ABC: abcjs plays it into a MIDI file
    const abc=async text=>{ const M=await import('https://cdn.jsdelivr.net/npm/abcjs@6.7.2/+esm'), A=M.synth?M:M.default, b=A.synth.getMidiFile(text,{midiOutputType:'binary'}), R=await midi(b[0]||b), g=k=>(text.match(new RegExp('^'+k+':\\s*(.+)$','m'))||[])[1]||'';
      R.name=g('T'); R.by=g('C'); return R; };
    // Guitar Pro and MusicXML: alphaTab reads the score and plays it out (repeats, ties and tempo as written)
    const score=async bytes=>{ const M=await import('https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.9.0/+esm'), A=M.importer?M:M.default, S=A.importer.ScoreLoader.loadScoreFromBytes(bytes), N=[], TP=[];
      const h=new Proxy({},{get:(o,k)=>k==='addNote'?(tr,s,l,key,v,ch)=>{ if(ch!==9)N.push([tr,s,l,key]); }:k==='addTempo'?(tk,bpm)=>{ TP.push([tk,bpm]); }:()=>{}});
      new A.midi.MidiFileGenerator(S,null,h).generate(); TP.sort((a,b)=>a[0]-b[0]);
      const sec=tk=>{ let s=0, at=0, bpm=120; for(const [t,b] of TP){ if(t>=tk)break; s+=(t-at)*60/(bpm*960); at=t; bpm=b; } return s+(tk-at)*60/(bpm*960); };
      const tracks=S.tracks.map(t=>({name:t.name||'',notes:[]})); for(const [tr,s,l,key] of N)if(tracks[tr]){ const t=sec(s); tracks[tr].notes.push({t,m:key,d:sec(s+l)-t}); }
      return {name:S.title||'',by:S.music||S.artist||'',tracks:tracks.filter(t=>t.notes.length)}; };
    // a text tab: blocks of six lines, the top one the first string; each column a step of time, a bar line none
    const tab=(text,step)=>{ const rows=text.split(/\r?\n/).map(l=>{ const m=l.match(/^\s*[A-Ga-g]?[#b]?\s*[|:]?([-0-9hpbrsxHPBRSX\/\\~^()<>*.=|: ]{8,})\s*$/); return m&&m[1].includes('-')?m[1]:null; }), notes=[]; let t0=0;
      for(let i=0;i+5<rows.length;i++){ if(!rows.slice(i,i+6).every(Boolean)||i&&rows[i-1])continue; const B=rows.slice(i,i+6), W=Math.max(...B.map(r=>r.length)); let q=0;
        for(let c=0;c<W;c++){ if(B.some(r=>r[c]==='|'))continue;
          B.forEach((r,s)=>{ if(!/\d/.test(r[c]||'')||/\d/.test(r[c-1]||''))return; let k=+r[c]; if(/\d/.test(r[c+1]||'')&&k*10+ +r[c+1]<=24)k=k*10+ +r[c+1]; notes.push({t:t0+q*step,m:OPEN[s]+k,d:2,s}); }); q++; }
        t0+=q*step; i+=5; }
      for(let s=0;s<6;s++){ const L=notes.filter(n=>n.s===s).sort((a,b)=>a.t-b.t); L.forEach((n,i)=>{ if(L[i+1])n.d=Math.min(2,L[i+1].t-n.t); }); }
      return {name:'',by:'',tab:1,tracks:notes.length?[{name:'TAB',notes}]:[]}; };
    const read=async(bytes,text,step)=>{ if(bytes){ const hd=String.fromCharCode(...bytes.slice(0,4)); if(hd==='MThd')return midi(bytes); const t=new TextDecoder().decode(bytes.slice(0,4000));
        if(hd.startsWith('PK')||hd.startsWith('BCF')||bytes[0]<32||/<score-|<\?xml/.test(t))return score(bytes); text=new TextDecoder().decode(bytes); }
      if(/^X:\s*\d+/m.test(text)||/^K:\s*[A-Ga-g]/m.test(text))return abc(text); return tab(text,step); };
    // the parts chosen, as a piece: a hand each note (two parts or more: the higher part the right hand), its first 1,500 notes
    const piece=(R,pick,name)=>{ const TR=pick<0?R.tracks:[R.tracks[pick]], mean=TR.map(T=>T.notes.reduce((a,n)=>a+n.m,0)/T.notes.length), right=mean.indexOf(Math.max(...mean)), ns=[];
      TR.forEach((T,ti)=>{ for(const n of T.notes)ns.push({t:Math.round(n.t*100),m:n.m,d:Math.round(n.d*100),h:n.s!=null?2+n.s:TR.length<2?+(n.m>=60):ti===right?1:mean[ti]<mean[right]-2?0:+(n.m>=60)}); });
      ns.sort((a,b)=>a.t-b.t||a.m-b.m); const n=[]; let last=ns.length?ns[0].t:0; for(const x of ns.slice(0,MAXN)){ n.push(x.t-last,x.m,x.d,x.h); last=x.t; }
      return {id:String(Date.now()%1e9)+String(100+Math.floor(Math.random()*900)),name:name||R.name||'A PIECE',by:R.by||'',n}; };

    const css=document.createElement('style'); css.textContent=`#mui{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9;zoom:var(--uiz,1);background:#0b0d13f2;border:2px solid #2a3040;padding:8px 10px;color:#e8e2cc;font:9px Silkscreen,monospace;width:min(460px,calc(100vw - 32px));max-height:80vh;overflow:auto;box-sizing:border-box}
      #mui .r{display:flex;flex-wrap:wrap;gap:3px 5px;align-items:center;margin:4px 0} #mui button{font:inherit;color:inherit;background:#161a24;border:2px solid #2a3040;padding:3px 6px;cursor:pointer} #mui button.go{background:#2c4a36;border-color:#5fa06e}
      #mui select,#mui input[type=text],#mui textarea{font:inherit;color:inherit;background:#0b0d13;border:2px solid #2a3040;padding:3px;box-sizing:border-box} #mui textarea{width:100%;height:70px;font-family:monospace;font-size:10px;white-space:pre} #mui input[type=text]{flex:1;min-width:120px}
      #mui .d{opacity:.6} #mui .h{flex:1;font-size:11px} #mui .bad{color:#c8a090} #mui .l{justify-content:space-between;border-top:1px solid #2a3040;padding-top:4px}`;
    document.head.appendChild(css);
    let PN=null, R=null, kind='';
    const $=q=>PN.querySelector(q), msg=(t,bad)=>{ const el=$('#muimsg'); el.textContent=t; el.className=bad?'bad':'d'; };
    const draw=()=>{ const got=$('#muigot'); got.hidden=!R;
      if(R){ $('#muiname').value=(R.name||'').replace(/\s+/g,' ').trim().slice(0,60); const n=R.tracks.length; $('#muipart').innerHTML=(n>1?'<option value="-1">ALL PARTS</option>':'')+R.tracks.map((t,i)=>`<option value="${i}">${esc((t.name||'PART '+(i+1)).toUpperCase())} · ${t.notes.length} NOTES</option>`).join(''); $('#muipart').value=n>2?'0':n>1?'-1':'0'; }
      const L=MUSICIN.list(); $('#muilist').innerHTML=`<div class="r d">YOUR MUSIC · ${L.length} OF ${MAX}</div>`+L.map(p=>`<div class="r l"><span>${esc(p.name.toUpperCase())}${p.by?' · '+esc(p.by.toUpperCase()):''}</span><button data-rm="${p.id}">REMOVE</button></div>`).join(''); };
    const take=async(bytes,text)=>{ msg('READING…'); R=null; draw(); try{ const r=await read(bytes,text,+$('#muistep').value); if(!r.tracks.length)throw new Error('none'); R=r; msg(r.tracks.reduce((a,t)=>a+t.notes.length,0)+' NOTES READ. NAME IT AND ADD IT TO THE BOOK.'); }
      catch(e){ console.warn('import music',e); msg('THAT COULD NOT BE READ AS MUSIC. TRY MUSICXML, MIDI, GUITAR PRO, ABC OR A SIX-LINE TEXT TAB.',1); } draw(); };
    const make=()=>{ PN=document.createElement('div'); PN.id='mui'; document.body.appendChild(PN);
      PN.innerHTML=`<div class="r"><span class="h">IMPORT MUSIC</span><button id="muix" title="esc">CLOSE</button></div>
        <div class="r"><button id="muipick" class="go">CHOOSE A FILE</button><span class="d">MUSICXML · MXL · MIDI · GUITAR PRO · ABC · TEXT TAB</span><input type="file" id="muifile" hidden accept=".mid,.midi,.xml,.musicxml,.mxl,.gp,.gp3,.gp4,.gp5,.gpx,.abc,.txt,.tab"></div>
        <textarea id="muitext" aria-label="pasted music" placeholder="OR PASTE ABC OR A TEXT TAB HERE" spellcheck="false"></textarea>
        <div class="r"><button id="muiread">READ WHAT IS PASTED</button><span class="d">TAB SPEED</span><select id="muistep" aria-label="tab speed"><option value=".2">SLOW</option><option value=".14" selected>MEDIUM</option><option value=".1">FAST</option></select></div>
        <div class="r" id="muimsg"></div>
        <div id="muigot" hidden><div class="r"><span class="d">NAME</span><input type="text" id="muiname" maxlength="60" aria-label="name"></div><div class="r"><span class="d">PART</span><select id="muipart" aria-label="part"></select><button id="muiadd" class="go">ADD TO THE BOOK</button></div></div>
        <div id="muilist"></div>`;
      PN.addEventListener('keydown',e=>{ if(e.key==='Escape')MUSICIN.close(); e.stopPropagation(); });
      $('#muifile').onchange=async e=>{ const f=e.target.files[0]; e.target.value=''; if(!f)return; if(f.size>8<<20)return msg('THAT FILE IS TOO BIG (8 MB AT MOST).',1); await take(new Uint8Array(await f.arrayBuffer())); if(R&&!R.name)R.name=f.name.replace(/\.[a-z0-9]+$/i,''), draw(); };
      PN.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return;
        if(b.id==='muix')MUSICIN.close(); else if(b.id==='muipick')$('#muifile').click(); else if(b.id==='muiread'){ const t=$('#muitext').value; if(t.trim())take(null,t); else msg('PASTE ABC OR A TEXT TAB FIRST.',1); }
        else if(b.dataset.rm){ MUSICIN.remove(b.dataset.rm); draw(); }
        else if(b.id==='muiadd'&&R){ const p=piece(R,+$('#muipart').value,$('#muiname').value.trim()), at=MUSICIN.add(p); if(typeof at==='string')return msg(at,1);
          const el=document.querySelector(kind==='guitar'?'#gtsong':'#insong'); if(el&&at[kind]!=null)el.value=at[kind];
          say(p.name.toUpperCase()+' IS IN THE BOOK UNDER YOUR MUSIC, FOR EVERY INSTRUMENT BUT THE DRUMS.','#7fd0ff'); R=null; $('#muitext').value=''; msg(''); MUSICIN.close(); } }); };
    return {open:k=>{ kind=k; if(!PN)make(); PN.hidden=false; R=null; msg(''); draw(); },close:()=>{ if(PN)PN.hidden=true; },read,piece}; };
  let W=null;
  MUSICIN.open=async k=>{ await LOAD('music'); (W||(W=WIN())).open(k); };
  MUSICIN.close=()=>{ if(W)W.close(); };
  MUSICIN.read=async(bytes,text,pick=-1,name='',step=.14)=>{ await LOAD('music'); W=W||WIN(); const R=await W.read(bytes,text,step); return R.tracks.length?W.piece(R,pick,name):null; }; }
