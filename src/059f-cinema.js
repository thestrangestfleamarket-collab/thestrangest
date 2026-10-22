// THE CINEMA: the movie theatre screen plays one shared YouTube reel at the same timecode for everyone; admins set it by double-clicking the screen.
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, pos, UI} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {FADE, STORE, SYS, TILE} from './006-map-pre.js';

{ const SB='https://jvcetttmqseoteidfggn.supabase.co', KEY='sb_publishable_UkzD8hOizW1hPr6hm3duQQ_07ZodPik', LS='sb-jvcetttmqseoteidfggn-auth-token', ROW='theatre';
  const jw=t=>{ try{ return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){ return {}; } };
  const ck=()=>{ const m=/(?:^|;\s*)tsfm-pass=([^;]+)/.exec(document.cookie); return m?decodeURIComponent(m[1]):''; };
  let T=''; const renew=async()=>{ '@later'; const s=JSON.parse(localStorage.getItem(LS)||'null'); if(!s||!s.refresh_token)return '';
    const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})}); if(!r.ok)return '';
    const n=await r.json(); localStorage.setItem(LS,JSON.stringify({...s,...n})); document.cookie='tsfm-pass='+n.access_token+'; path=/; max-age=3600; secure; samesite=strict'; return T=n.access_token; };
  const tok=async()=>{ '@later'; let t=ck()||T; if(t.startsWith('dev:'))return ''; if(!t||(jw(t).exp||0)*1000<Date.now()+60000)t=await renew().catch(()=>''); return t; };
  const vid=u=>{ u=String(u||'').trim(); const m=/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(u)||/^([A-Za-z0-9_-]{11})$/.exec(u); return m?m[1]:''; };

  let rec=null, adm=null;
  const DEF={id:ROW,playlist:[],idx:0,video_id:'',started_at:null,size:1,brightness:.8,loop:true,autoplay:true};
  const cur=()=>rec||DEF; CINEMA.now=()=>cur(); CINEMA.title='';

  const pull=async()=>{ '@later'; try{ const r=await fetch(SB+'/rest/v1/now_playing?select=*&id=eq.'+ROW,{headers:{apikey:KEY}}); if(!r.ok)return;
    const a=await r.json(); rec=a[0]||null; onRec(); }catch(e){} };
  const push=async patch=>{ '@later'; const t=await tok(); if(!t)return false; try{
    const r=await fetch(SB+'/rest/v1/now_playing?id=eq.'+ROW,{method:'PATCH',headers:{apikey:KEY,Authorization:'Bearer '+t,'content-type':'application/json',Prefer:'return=representation'},body:JSON.stringify({...patch,updated_at:new Date().toISOString()})});
    if(!r.ok)return false; const a=await r.json(); if(a[0]){ rec=a[0]; onRec(); } return true; }catch(e){ return false; } };
  CINEMA.push=push;
  const isAdmin=async()=>{ '@later'; if(adm!=null)return adm; const t=await tok(); if(!t)return adm=false;
    try{ const r=await fetch(SB+'/rest/v1/admins?select=user_id&user_id=eq.'+jw(t).sub,{headers:{apikey:KEY,Authorization:'Bearer '+t}}); adm=r.ok&&(await r.json()).length>0; }catch(e){ adm=false; } return adm; };
  CINEMA.isAdmin=isAdmin;

  const startMs=()=>{ const s=cur().started_at; return s?Date.parse(s):0; };
  const offset=()=>{ const s=startMs(); return s?Math.max(0,(Date.now()-s)/1000):0; };

  let wrap=null, holder=null, player=null, soundBtn=null, haveVid='', ytP=null, making=false;
  const ensureYT=()=>ytP||(ytP=new Promise(res=>{ if(window.YT&&window.YT.Player)return res(); const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{ try{ prev&&prev(); }catch(e){} res(); }; const s=document.createElement('script'); s.src='https://www.youtube.com/iframe_api'; s.async=1; document.head.appendChild(s); }));
  const mkWrap=()=>{ if(wrap)return; wrap=document.createElement('div'); wrap.id='cinema';
    wrap.style.cssText='position:fixed;z-index:1;pointer-events:none;display:none;overflow:hidden;background:#000';
    holder=document.createElement('div'); holder.style.cssText='position:absolute;inset:0;width:100%;height:100%'; wrap.appendChild(holder);
    soundBtn=document.createElement('button'); soundBtn.textContent='🔇 tap for sound';
    soundBtn.style.cssText='position:absolute;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:auto;font:600 13px system-ui;color:#fff;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.4);border-radius:999px;padding:6px 12px;cursor:pointer';
    soundBtn.onclick=()=>{ try{ player.unMute(); player.setVolume(100); }catch(e){} soundBtn.style.display='none'; }; wrap.appendChild(soundBtn);
    document.body.appendChild(wrap); };
  const makePlayer=async id=>{ '@later'; mkWrap(); if(player){ if(id!==haveVid){ haveVid=id; try{ player.loadVideoById({videoId:id,startSeconds:offset()}); }catch(e){} } return; }
    if(making)return; making=true; await ensureYT();
    player=new window.YT.Player(holder,{videoId:id,host:'https://www.youtube-nocookie.com',width:'100%',height:'100%',
      playerVars:{autoplay:1,mute:1,controls:0,rel:0,playsinline:1,modestbranding:1,disablekb:1,fs:0,iv_load_policy:3},
      events:{onReady:e=>{ haveVid=id; try{ e.target.mute(); e.target.seekTo(offset(),true); e.target.playVideo(); }catch(x){} },
        onStateChange:e=>{ if(e.data===window.YT.PlayerState.ENDED)onEnded(); }}}); };
  const onEnded=async()=>{ '@later'; const c=cur(), pl=c.playlist||[];
    if(adm&&pl.length>1){ const last=(c.idx|0)+1>=pl.length; if(last&&c.loop===false)return; const ni=last?0:(c.idx|0)+1, nid=vid(pl[ni]&&(pl[ni].url||pl[ni].id||pl[ni]));
      if(nid)await push({idx:ni,video_id:nid,started_at:new Date().toISOString()}); }
    else if(c.loop!==false&&player){ try{ player.seekTo(0,true); player.playVideo(); }catch(e){} } };

  const corners=fm=>{ const w=fm.geometry.parameters.width/2, h=fm.geometry.parameters.height/2, p=fm.position, out=[];
    for(const sx of [-1,1])for(const sy of [-1,1])out.push(new THREE.Vector3(p.x+sx*w,p.y+sy*h,p.z)); return out; };
  const placeOver=fm=>{ const cv=renderer.domElement, r=cv.getBoundingClientRect(); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(const c of corners(fm)){ const v=c.clone().project(SHARED.cam), sx=r.left+(v.x+1)/2*r.width, sy=r.top+(1-v.y)/2*r.height; x0=Math.min(x0,sx); x1=Math.max(x1,sx); y0=Math.min(y0,sy); y1=Math.max(y1,sy); }
    const sz=Math.max(.4,Math.min(1,cur().size??1)), cx=(x0+x1)/2, cy=(y0+y1)/2, ww=(x1-x0)*sz, hh=(y1-y0)*sz;
    wrap.style.left=Math.round(cx-ww/2)+'px'; wrap.style.top=Math.round(cy-hh/2)+'px'; wrap.style.width=Math.round(ww)+'px'; wrap.style.height=Math.round(hh)+'px';
    wrap.style.filter='brightness('+(cur().brightness??.8)+')'; };

  let lastSync=0;
  const tick=()=>{ const mt=STORE.main&&STORE.main.theatre; CINEMA.on=false; if(!mt||!mt.fm)return;
    const up=SHARED.LVL==='up'; if(marq)marq.mesh.visible=up; if(post)post.mesh.visible=up;
    const inside=SHARED.LVL==='up'&&mt.R.inside(pos.x,pos.z), id=vid(cur().video_id);
    if(!inside||!id||FADE.busy){ if(wrap&&wrap.style.display!=='none'){ wrap.style.display='none'; try{ player&&player.pauseVideo(); }catch(e){} } return; }
    CINEMA.on=true; mkWrap(); wrap.style.display='block'; placeOver(mt.fm); makePlayer(id);
    const now=performance.now(); if(now-lastSync>1500&&player&&player.getCurrentTime){ lastSync=now;
      try{ const want=offset(), is=player.getCurrentTime(); if(Math.abs(is-want)>1.6)player.seekTo(want,true); if(player.getPlayerState&&player.getPlayerState()!==1)player.playVideo(); }catch(e){} } };
  CINEMA.tick=tick;

  const onRec=()=>{ const id=vid(cur().video_id); CINEMA.title='';
    if(id)fetch('https://www.youtube.com/oembed?format=json&url=https://youtu.be/'+id).then(r=>r.ok?r.json():null).then(j=>{ if(j&&j.title){ CINEMA.title=j.title; sign(); } }).catch(()=>{});
    sign(); };
  let marq=null, post=null;
  const makePanel=(w,h,pw,ph)=>{ const cv=document.createElement('canvas'); cv.width=pw; cv.height=ph; const g=cv.getContext('2d');
    const tex=new THREE.CanvasTexture(cv); tex.magFilter=tex.minFilter=THREE.NearestFilter; tex.generateMipmaps=false; tex.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex})); return {cv,g,tex,mesh}; };
  const fit=(g,t,maxW,px)=>{ let s=px; do{ g.font='bold '+Math.round(s)+'px system-ui'; s-=1; }while(g.measureText(t).width>maxW&&s>8); };
  const qz=v=>Math.min(255,Math.round(v/56)*56), title=()=>(CINEMA.title||'THE STRANGEST CINEMA').toUpperCase();
  const drawMarq=()=>{ if(!marq)return; const {g,cv,tex}=marq, W=cv.width, H=cv.height; g.fillStyle='#141018'; g.fillRect(0,0,W,H); g.fillStyle='#20161e'; g.fillRect(8,8,W-16,H-16);
    g.fillStyle='#ffd98a'; for(let x=16;x<W-12;x+=26){ g.beginPath(); g.arc(x,9,4,0,7); g.fill(); g.beginPath(); g.arc(x,H-9,4,0,7); g.fill(); }
    g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#f6ba2c'; g.font='bold '+Math.round(H*0.2)+'px system-ui'; g.fillText('NOW SHOWING',W/2,H*0.3);
    g.fillStyle='#faf8f0'; fit(g,title(),W-28,H*0.4); g.fillText(title(),W/2,H*0.66); tex.needsUpdate=true; };
  const drawPoster=()=>{ if(!post)return; const {g,cv,tex}=post, W=cv.width, H=cv.height, band=Math.round(H*0.17), id=vid(cur().video_id);
    const cap=()=>{ g.fillStyle='#0f1218'; g.fillRect(0,H-band,W,band); g.fillStyle='#faf8f0'; g.textAlign='center'; g.textBaseline='middle'; fit(g,title(),W-12,band*0.5); g.fillText(title(),W/2,H-band/2); tex.needsUpdate=true; };
    g.fillStyle='#2b3340'; g.fillRect(0,0,W,H-band); cap();
    if(!id)return; const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>{ try{ g.drawImage(img,0,0,W,H-band); const d=g.getImageData(0,0,W,H-band), a=d.data; for(let i=0;i<a.length;i+=4){ a[i]=qz(a[i]); a[i+1]=qz(a[i+1]); a[i+2]=qz(a[i+2]); } g.putImageData(d,0,0); }catch(e){} cap(); };
    img.src='/yt/'+id+'.jpg'; };
  const buildSigns=m=>{ const dd=(STORE.main.doors||[]).find(d=>d[0]==='THE MOVIE THEATRE'); if(!dd||marq)return; const fm=m.fm, fw=fm.geometry.parameters.width, fh=fm.geometry.parameters.height;
    const bx=dd[3], bz=dd[4]; let ox=dd[1]-bx, oz=dd[2]-bz; const L=Math.hypot(ox,oz)||1; ox/=L; oz/=L; const sx=-oz, sz=ox;
    marq=makePanel(fw*0.78,fw*0.195,512,128); const my=fm.position.y+fh*0.22; marq.mesh.position.set(bx+ox*0.3,my,bz+oz*0.3); marq.mesh.lookAt(bx+ox*2,my,bz+oz*2); scene.add(marq.mesh);
    post=makePanel(fw*0.16,fw*0.227,240,340); const py=fm.position.y-fh*0.02, po=fw*0.34; post.mesh.position.set(bx+sx*po+ox*0.3,py,bz+sz*po+oz*0.3); post.mesh.lookAt(bx+sx*po+ox*2,py,bz+sz*po+oz*2); scene.add(post.mesh);
    sign(); };
  const sign=()=>{ drawMarq(); drawPoster(); };

  let dlg=null; const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const openAdmin=async()=>{ '@later'; if(!await isAdmin())return; const c=cur();
    if(!dlg){ dlg=document.createElement('div');
      dlg.style.cssText='position:fixed;z-index:9;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,420px);max-height:86vh;overflow:auto;background:#141018;color:#f3e7dd;border:2px solid #bc923a;border-radius:12px;padding:16px;font:14px/1.5 system-ui';
      document.body.appendChild(dlg); for(const ev of ['keydown','keyup'])dlg.addEventListener(ev,e=>e.stopPropagation()); }
    dlg.innerHTML=`<div style="font:600 18px system-ui;color:#d8a845;margin-bottom:10px">SCREEN · admin</div>
      <label style="display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#c3a7a0">Play a YouTube link</label>
      <div style="display:flex;gap:6px;margin:4px 0 12px"><input id="cmu" placeholder="youtube.com/watch?v=..." style="flex:1;min-width:0;font:inherit;background:#0e0a10;color:#f3e7dd;border:1px solid #3a2130;border-radius:6px;padding:7px"><button id="cmplay" style="font:600 13px system-ui;background:#b22133;color:#fff;border:0;border-radius:6px;padding:0 12px;cursor:pointer">PLAY</button></div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">
        <label style="flex:1;min-width:120px">Size <span id="cmsv" style="color:#d8a845">${Math.round((c.size??1)*100)}%</span><br><input id="cms" type="range" min="40" max="100" value="${Math.round((c.size??1)*100)}" style="width:100%"></label>
        <label style="flex:1;min-width:120px">Brightness <span id="cmbv" style="color:#d8a845">${Math.round((c.brightness??.8)*100)}%</span><br><input id="cmb" type="range" min="20" max="120" value="${Math.round((c.brightness??.8)*100)}" style="width:100%"></label></div>
      <div style="margin-bottom:10px"><label><input id="cmloop" type="checkbox" ${c.loop!==false?'checked':''}> loop</label> &nbsp; <label><input id="cmauto" type="checkbox" ${c.autoplay!==false?'checked':''}> autoplay on enter</label></div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><button id="cmrestart" style="font:600 13px system-ui;background:#271522;color:#f3e7dd;border:1px solid #3a2130;border-radius:6px;padding:6px 10px;cursor:pointer">RESTART FOR EVERYONE</button><span style="color:#8f7470;font-size:12px">resets the shared time to now</span></div>
      <label style="display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#c3a7a0">Playlist (one link per line)</label>
      <textarea id="cmpl" rows="4" style="width:100%;box-sizing:border-box;font:13px monospace;background:#0e0a10;color:#f3e7dd;border:1px solid #3a2130;border-radius:6px;padding:7px;margin:4px 0">${esc((c.playlist||[]).map(p=>p.url||p.id||p).join('\n'))}</textarea>
      <div style="display:flex;gap:6px;justify-content:space-between;margin-top:8px"><button id="cmsave" style="font:600 13px system-ui;background:#b22133;color:#fff;border:0;border-radius:6px;padding:8px 14px;cursor:pointer">SAVE PLAYLIST</button><button id="cmclose" style="font:600 13px system-ui;background:transparent;color:#c3a7a0;border:1px solid #3a2130;border-radius:6px;padding:8px 14px;cursor:pointer">CLOSE</button></div>
      <div id="cmsay" style="color:#8f7470;font-size:12px;margin-top:8px"></div>`;
    const $=s=>dlg.querySelector(s), say=t=>{ $('#cmsay').textContent=t; };
    $('#cms').oninput=e=>$('#cmsv').textContent=e.target.value+'%'; $('#cmb').oninput=e=>$('#cmbv').textContent=e.target.value+'%';
    $('#cms').onchange=e=>push({size:+e.target.value/100}); $('#cmb').onchange=e=>push({brightness:+e.target.value/100});
    $('#cmloop').onchange=e=>push({loop:e.target.checked}); $('#cmauto').onchange=e=>push({autoplay:e.target.checked});
    $('#cmplay').onclick=async()=>{ const id=vid($('#cmu').value); if(!id){ say('not a YouTube link'); return; } say('...'); say(await push({video_id:id,started_at:new Date().toISOString()})?'playing for everyone':'could not save (log in as admin)'); };
    $('#cmrestart').onclick=async()=>{ say('...'); say(await push({started_at:new Date().toISOString()})?'restarted':'could not'); };
    $('#cmsave').onclick=async()=>{ const list=$('#cmpl').value.split('\n').map(s=>s.trim()).filter(Boolean).map(u=>({url:u,id:vid(u)})).filter(p=>p.id); say('...'); say(await push({playlist:list,idx:0})?'saved '+list.length:'could not save'); };
    $('#cmclose').onclick=()=>{ dlg.style.display='none'; };
    dlg.style.display='block'; };
  CINEMA.openAdmin=openAdmin;

  let attached=false;
  const attach=()=>{ if(attached)return; const m=STORE.main&&STORE.main.theatre; if(!m||!m.fm)return; attached=true;
    const fm=m.fm, hb=new THREE.Mesh(new THREE.BoxGeometry(fm.geometry.parameters.width,fm.geometry.parameters.height,.4*TILE),new THREE.MeshBasicMaterial({visible:false}));
    hb.position.copy(fm.position); scene.add(hb);
    UI.thing({name:'THE SCREEN',ghost:1,obj:hb,reach:3.2*TILE,near:6.5*TILE,tall:fm.geometry.parameters.height,act:async()=>{ if(await isAdmin())openAdmin(); }}); buildSigns(m); };

  window.CINEMA=CINEMA; SYS.add('places',()=>{ attach(); tick(); },'059f-cinema');
  isAdmin(); pull(); setInterval(()=>{ if(document.visibilityState!=='hidden')pull(); },5000);
}
