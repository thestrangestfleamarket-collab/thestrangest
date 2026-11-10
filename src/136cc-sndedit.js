// THE SOUND EDITOR: ADMIN > SOUND EDITOR, every sound in the game: hear it, upload takes, delete them, trim them, set its level and pitch, add a new name; SAVE FOR EVERYONE keeps it in /shared/sounds.json for every player, EXPORT FOR CODE downloads it for tools/sfx-bake.py.
import {ONLINE, SFX, SNDED, TEXT} from './003b-systems.js';
{ const FILE='/shared/sounds.json', esc=TEXT.esc, web=/^https?:$/.test(location.protocol), W=520, H=70;
  let host=null, bound=null, cur=null, say='', find='', work={};
  const copy=o=>JSON.parse(JSON.stringify(o)), same=()=>JSON.stringify(work)===JSON.stringify(SFX.shared.set);
  const ent=k=>work[k]||(work[k]={}), takes=k=>work[k]&&work[k].takes?work[k].takes:SFX.takeList(k).map(q=>({...q}));
  const ctx=()=>SFX.wake();
  const kind=k=>{ const w=work[k]; if(w&&w.takes)return w.takes.length?w.takes.length+' TAKE'+(w.takes.length>1?'S':'')+' (YOURS)':SFX.recipe(k)?'MADE IN CODE':'SILENT'; const T=SFX.takes(k); return T?T.length+' RECORDED':SFX.recipe(k)?'MADE IN CODE':'NEW'; };
  // a take's waveform, the trimmed parts dimmed
  const wave=(cv,k,i)=>{ const c=ctx(); if(!c)return; const q=takes(k)[i], b=q&&SFX.take(c,{...q,a:0,z:0}); const g=cv.getContext('2d'); g.fillStyle='#15171e'; g.fillRect(0,0,W,H);
    if(!b){ g.fillStyle='#8a8f9c'; g.font='12px monospace'; g.fillText('LOADING...',8,20); setTimeout(()=>cv.isConnected&&wave(cv,k,i),400); return; }
    const x=b.buf.getChannelData(0), sr=b.buf.sampleRate, i0=Math.floor(b.t*sr), n=Math.floor(b.L*sr), a=(q.a||0)/b.L*W, z=W-(q.z||0)/b.L*W; g.fillStyle='#f2c14e';
    for(let px=0;px<W;px++){ let m=0; for(let j=Math.floor(px/W*n);j<Math.floor((px+1)/W*n);j++)m=Math.max(m,Math.abs(x[i0+j]||0)); const h=Math.max(1,m*H); g.globalAlpha=px<a||px>z?.25:1; g.fillRect(px,(H-h)/2,1,h); }
    g.globalAlpha=1; g.fillStyle='#7dffa8'; g.fillRect(a,0,2,H); g.fillRect(z-2,0,2,H); cv.dataset.len=b.L; };
  const slider=(f,lo,hi,st,v,lab)=>'<div class="row"><span>'+lab+'</span><input type="range" data-f="'+f+'" min="'+lo+'" max="'+hi+'" step="'+st+'" value="'+v+'" style="--p:'+((v-lo)/(hi-lo)*100).toFixed(1)+'%"><span class="dim" data-v="'+f+'" style="min-width:3.5em;text-align:right">'+(+v).toFixed(2)+'</span></div>';
  const draw=()=>{ if(!host||!host.isConnected)return; const names=SFX.all().filter(k=>!find||k.includes(find));
    let right='<div class="dim">PICK A SOUND</div>';
    if(cur){ const o=SFX.setOf(cur), w=work[cur]||{}, T=takes(cur);
      right='<b style="color:#f2c14e">'+esc(cur)+'</b> <span class="dim">'+kind(cur)+'</span><div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0"><button class="btn" data-act="play">PLAY</button><button class="btn" data-act="upload">UPLOAD A TAKE</button><button class="btn" data-act="replace">REPLACE ALL</button><button class="btn" data-act="reset">BACK TO THE GAME\'S</button></div>'
        +slider('lvl',0,2,.05,w.lvl??o.lvl??1,'LEVEL')+slider('pitch',.5,2,.05,w.pitch??o.pitch??1,'PITCH')
        +(T.length?T.map((q,i)=>'<div style="margin:8px 0"><div class="row"><span>TAKE '+(i+1)+(q.f?' (UPLOADED)':'')+'</span><button class="btn" data-take="'+i+'" data-do="play">PLAY</button><button class="btn" data-take="'+i+'" data-do="del">DELETE</button></div><canvas data-wave="'+i+'" width="'+W+'" height="'+H+'" style="display:block;width:100%;max-width:'+W+'px;cursor:ew-resize;touch-action:none"></canvas><div class="dim">DRAG NEAR AN EDGE TO TRIM IT</div></div>').join(''):'<div class="dim">NO RECORDING: '+(SFX.recipe(cur)?'THE GAME\'S MADE SOUND PLAYS':'IT IS SILENT')+'</div>'); }
    host.innerHTML='<h3>SOUND EDITOR</h3><div class="dim">every sound in the game; what you change plays at once for you, SAVE FOR EVERYONE keeps it for every player; EXPORT FOR CODE downloads it to bake into the game\'s files</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0"><button class="btn" data-act="save">SAVE FOR EVERYONE</button><button class="btn" data-act="undo">UNDO UNSAVED</button><button class="btn" data-act="export">EXPORT FOR CODE</button></div><div class="dim ssay">'+esc(say)+(same()?'':' · NOT SAVED YET')+'</div>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1 1 180px;max-height:60vh;overflow:auto"><input class="sfind" placeholder="FIND" value="'+esc(find)+'" style="width:100%;margin-bottom:4px"><div class="row"><input class="snew" placeholder="new_name" style="flex:1"><button class="btn" data-act="new">ADD</button></div>'
      +names.map(k=>'<button class="btn" data-pick="'+esc(k)+'" aria-pressed="'+(k===cur)+'" style="display:block;width:100%;text-align:left;margin:2px 0">'+esc(k)+(work[k]?' ✎':'')+'</button>').join('')+'</div><div style="flex:3 1 300px">'+right+'</div></div>'
      +'<input type="file" class="sfile" accept="audio/*,.mp3,.ogg,.wav,.m4a" hidden>';
    host.querySelectorAll('[data-wave]').forEach(cv=>wave(cv,cur,+cv.dataset.wave)); };
  // what you change plays at once (for you) before it is saved for everyone
  const live=()=>{ SFX.shared.set=copy(work); };
  const post=(body,f=FILE,type='application/json')=>fetch(f,{method:'POST',credentials:'same-origin',headers:{'content-type':type},body}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); });
  const tell=p=>p.then(()=>{ say='SAVED FOR EVERYONE'; },e=>{ say='NOT SAVED: '+String(e&&e.message||e).toUpperCase(); }).then(draw);
  const saved={};   // what is saved for everyone, to put back with UNDO
  const reload=()=>SFX.loadShared().then(S=>{ Object.assign(saved,{set:copy(S.set)}); work=copy(S.set); draw(); });
  // an upload: checked by the browser's own decoder, stored as its own shared file, then a take of this sound
  const upload=(k,replace)=>{ const inp=host.querySelector('.sfile'); inp.value=''; inp.onchange=async()=>{ const f=inp.files[0]; if(!f)return; if(f.size>8<<20){ say='TOO BIG (8 MB AT MOST)'; draw(); return; }
    const buf=await f.arrayBuffer(); try{ await ctx().decodeAudioData(buf.slice(0)); }catch(e){ say='NOT A SOUND THE BROWSER CAN PLAY'; draw(); return; }
    const ext=(/\.(mp3|ogg|wav|m4a|opus|webm)$/i.exec(f.name)||[,'mp3'])[1].toLowerCase(), name='snd-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+'.'+ext;
    say='UPLOADING...'; draw();
    if(web)try{ await post(buf,'/shared/'+name,f.type||'audio/mpeg'); }catch(e){ say='NOT UPLOADED: '+String(e.message||e).toUpperCase(); draw(); return; }
    else SFX.files[name]={buf:await ctx().decodeAudioData(buf.slice(0)),busy:false};
    const e=ent(k), T=replace?[]:takes(k); T.push({f:name}); e.takes=T; live(); say='UPLOADED (SAVE FOR EVERYONE TO KEEP IT)'; draw(); }; inp.click(); };
  const exportIt=async()=>{ say='GATHERING...'; draw(); const files={};
    for(const k in work)for(const q of work[k].takes||[])if(q.f&&!files[q.f]){ try{ const r=await fetch('/shared/'+q.f,{credentials:'same-origin'}); const b=new Uint8Array(await r.arrayBuffer()); let s=''; for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode.apply(null,b.subarray(i,i+32768)); files[q.f]=btoa(s); }catch(e){} }
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify({v:1,set:work,files})],{type:'application/json'})); a.download='sounds-export.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    say='EXPORTED: python3 tools/sfx-bake.py --shared sounds-export.json'; draw(); };
  // dragging on a waveform trims the nearer end
  let drag=null;
  const at=(cv,e)=>{ const r=cv.getBoundingClientRect(); return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)); };
  SNDED.panel=el=>{ host=el; if(!SNDED.got){ SNDED.got=true; reload(); } draw(); if(bound===el)return; bound=el;
    el.addEventListener('input',e=>{ const t=e.target; if(t.matches('.sfind')){ find=t.value.trim().toLowerCase(); const p=t.selectionStart; draw(); const n=host.querySelector('.sfind'); n.focus(); n.setSelectionRange(p,p); return; }
      if(t.dataset.f&&cur){ const v=+t.value; el.querySelector('[data-v="'+t.dataset.f+'"]').textContent=v.toFixed(2); t.style.setProperty('--p',((v-t.min)/(t.max-t.min)*100)+'%'); const w=ent(cur); if(v===1)delete w[t.dataset.f]; else w[t.dataset.f]=v; if(!Object.keys(w).length)delete work[cur]; live(); } });
    el.addEventListener('change',e=>{ if(e.target.dataset.f)draw(); });
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-pick],[data-act],[data-take]'); if(!b)return; ctx();
      if(b.dataset.pick){ cur=b.dataset.pick; SFX.bankLoad&&ctx()&&SFX.bankLoad(ctx()); draw(); return; }
      if(b.dataset.take!=null&&cur){ const i=+b.dataset.take, T=takes(cur); if(b.dataset.do==='play'){ const c=ctx(), v=c&&SFX.take(c,T[i]); if(v){ const s=c.createBufferSource(), g=c.createGain(); s.buffer=v.buf; s.playbackRate.value=SFX.setOf(cur).pitch||1; g.gain.value=SFX.fxLevel(cur); s.connect(g).connect(SFX.out(c)); s.start(0,v.t,v.L); } return; }
        T.splice(i,1); ent(cur).takes=T; live(); say='TAKE DELETED'; draw(); return; }
      const a=b.dataset.act;
      if(a==='save'){ say='SAVING...'; draw(); const body=JSON.stringify({v:1,set:work}); tell((web?post(body):Promise.resolve()).then(()=>{ SFX.shared.set=copy(work); saved.set=copy(work); if(ONLINE.put&&ONLINE.on)ONLINE.put('snd',Date.now()); })); return; }
      if(a==='undo'){ work=copy(saved.set||{}); live(); say='BACK TO WHAT IS SAVED'; draw(); return; }
      if(a==='export'){ exportIt(); return; }
      if(a==='new'){ const n=(host.querySelector('.snew').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'_').slice(0,32); if(!n)return; if(!SFX.has(n))ent(n).takes=[]; cur=n; live(); draw(); return; }
      if(!cur)return;
      if(a==='play'){ SFX.play(cur,{raw:false}); return; }
      if(a==='upload'||a==='replace'){ upload(cur,a==='replace'); return; }
      if(a==='reset'){ delete work[cur]; live(); say='BACK TO THE GAME\'S OWN (SAVE TO KEEP IT)'; draw(); } });
    el.addEventListener('pointerdown',e=>{ const cv=e.target.closest('[data-wave]'); if(!cv||!cur)return; const L=+cv.dataset.len||0; if(!L)return; const i=+cv.dataset.wave, T=takes(cur), q=T[i], u=at(cv,e), a=(q.a||0)/L, z=1-(q.z||0)/L;
      drag={cv,i,L,end:Math.abs(u-a)<=Math.abs(u-z)?'a':'z'}; cv.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove',e=>{ if(!drag)return; const u=at(drag.cv,e), T=takes(cur), q=T[drag.i]; if(drag.end==='a')q.a=Math.min(u*drag.L,drag.L-(q.z||0)-.02); else q.z=Math.min((1-u)*drag.L,drag.L-(q.a||0)-.02); if(q.a<=0)delete q.a; if(q.z<=0)delete q.z; ent(cur).takes=T; live(); wave(drag.cv,cur,drag.i); });
    el.addEventListener('pointerup',()=>{ if(drag){ drag=null; draw(); } });
    for(const ev of ['keydown','keyup'])el.addEventListener(ev,e=>{ if(e.target.matches('input,select'))e.stopPropagation(); }); };
  window.SNDED=SNDED;
}
