// THE CINEMA: the movie theatre screen plays one shared YouTube reel at the same timecode for everyone, projected from the back; its marquee and poster outside follow what plays.
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, CLOCK, pos, UI} from './003b-systems.js';
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

  let rec=null, adm=null, titleId='';
  const DEF={id:ROW,playlist:[],idx:0,video_id:'',started_at:null,size:1,brightness:.8,loop:true,autoplay:true,marquee:'',poster:''};
  const cur=()=>rec||DEF; CINEMA.now=()=>cur(); CINEMA.title=''; CINEMA._set=r=>{ rec=r; onRec(); };

  const pull=async()=>{ '@later'; if(location.protocol==='file:')return; try{ const r=await fetch('/now'); if(!r.ok)return;
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

  // sound is each viewer's own (browsers only let it on after a tap)
  let snd={on:false,vol:80}; try{ const s=JSON.parse(localStorage.getItem('cinema-snd')||'null'); if(s)snd={on:!!s.on,vol:Math.max(0,Math.min(100,+s.vol||80))}; }catch(e){}
  const saveSnd=()=>{ try{ localStorage.setItem('cinema-snd',JSON.stringify(snd)); }catch(e){} };
  const applySnd=()=>{ try{ if(player){ if(snd.on){ player.unMute(); player.setVolume(snd.vol); } else player.mute(); } }catch(e){} if(soundBtn)soundBtn.style.display=snd.on?'none':'block'; };
  CINEMA.sound=(on,vol)=>{ if(on!=null)snd.on=!!on; if(vol!=null)snd.vol=Math.max(0,Math.min(100,+vol)); saveSnd(); applySnd(); };

  // the player is a 16:9 page drawn onto the screen; the clip keeps it inside the game's frame
  const W0=1280, H0=720;
  let clip=null, wrap=null, holder=null, player=null, soundBtn=null, haveVid='', ytP=null, making=false;
  const ensureYT=()=>ytP||(ytP=new Promise(res=>{ if(window.YT&&window.YT.Player)return res(); const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{ try{ prev&&prev(); }catch(e){} res(); }; const s=document.createElement('script'); s.src='https://www.youtube.com/iframe_api'; s.async=1; document.head.appendChild(s); }));
  const mkWrap=()=>{ if(wrap)return; clip=document.createElement('div'); clip.id='cinema';
    clip.style.cssText='position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none;z-index:1;display:none';
    wrap=document.createElement('div'); wrap.style.cssText='position:absolute;left:0;top:0;width:'+W0+'px;height:'+H0+'px;transform-origin:0 0;overflow:hidden;background:#000;will-change:transform';
    holder=document.createElement('div'); holder.style.cssText='position:absolute;inset:0;width:100%;height:100%'; wrap.appendChild(holder);
    const veil=document.createElement('div'); veil.style.cssText='position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 52%,rgba(0,0,0,.55) 100%),repeating-linear-gradient(0deg,rgba(0,0,0,.07) 0 2px,rgba(0,0,0,0) 2px 5px)'; wrap.appendChild(veil);
    soundBtn=document.createElement('button'); soundBtn.textContent='🔇 tap for sound';
    soundBtn.style.cssText='position:absolute;left:50%;bottom:28px;transform:translateX(-50%);pointer-events:auto;font:600 34px system-ui;color:#fff;background:rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.4);border-radius:999px;padding:14px 30px;cursor:pointer';
    soundBtn.onclick=()=>CINEMA.sound(true,null); wrap.appendChild(soundBtn);
    clip.appendChild(wrap); document.body.appendChild(clip); };
  const makePlayer=async id=>{ '@later'; mkWrap(); if(player){ if(id!==haveVid){ haveVid=id; try{ player.loadVideoById({videoId:id,startSeconds:offset()}); }catch(e){} } return; }
    if(making)return; making=true; await ensureYT();
    player=new window.YT.Player(holder,{videoId:id,host:'https://www.youtube-nocookie.com',width:'100%',height:'100%',
      playerVars:{autoplay:1,mute:1,controls:0,rel:0,playsinline:1,modestbranding:1,disablekb:1,fs:0,iv_load_policy:3,cc_load_policy:0},
      events:{onReady:e=>{ haveVid=id; try{ e.target.mute(); e.target.seekTo(offset(),true); e.target.playVideo(); e.target.unloadModule('captions'); e.target.unloadModule('cc'); }catch(x){} applySnd(); },
        onStateChange:e=>{ if(e.data===window.YT.PlayerState.ENDED)onEnded(); }}}); };
  const onEnded=async()=>{ '@later'; const c=cur(), pl=c.playlist||[];
    if(adm&&pl.length>1){ const last=(c.idx|0)+1>=pl.length; if(last&&c.loop===false)return; const ni=last?0:(c.idx|0)+1, nid=vid(pl[ni]&&(pl[ni].url||pl[ni].id||pl[ni]));
      if(nid)await push({idx:ni,video_id:nid,started_at:new Date().toISOString()}); }
    else if(c.loop!==false&&player){ try{ player.seekTo(0,true); player.playVideo(); }catch(e){} } };

  // the four corners of the screen plane on the page, and a homography that maps the player onto them
  const quad=fm=>{ const w=fm.geometry.parameters.width/2, h=fm.geometry.parameters.height/2, p=fm.position, r=renderer.domElement.getBoundingClientRect();
    const P=(sx,sy)=>{ const v=new THREE.Vector3(p.x+sx*w,p.y+sy*h,p.z).project(SHARED.cam); return {x:(v.x+1)/2*r.width,y:(1-v.y)/2*r.height}; };
    return {r,q:[P(-1,1),P(1,1),P(1,-1),P(-1,-1)]}; };
  const homog=(p0,p1,p2,p3)=>{ const dx1=p1.x-p2.x, dx2=p3.x-p2.x, dx3=p0.x-p1.x+p2.x-p3.x, dy1=p1.y-p2.y, dy2=p3.y-p2.y, dy3=p0.y-p1.y+p2.y-p3.y; let a,b,c,d,e,f,g,h;
    if(Math.abs(dx3)<1e-6&&Math.abs(dy3)<1e-6){ a=p1.x-p0.x; b=p3.x-p0.x; c=p0.x; d=p1.y-p0.y; e=p3.y-p0.y; f=p0.y; g=0; h=0; }
    else{ const det=(dx1*dy2-dx2*dy1)||1e-9; g=(dx3*dy2-dx2*dy3)/det; h=(dx1*dy3-dx3*dy1)/det; a=p1.x-p0.x+g*p1.x; b=p3.x-p0.x+h*p3.x; c=p0.x; d=p1.y-p0.y+g*p1.y; e=p3.y-p0.y+h*p3.y; f=p0.y; }
    return 'matrix3d('+[a/W0,d/W0,0,g/W0, b/H0,e/H0,0,h/H0, 0,0,1,0, c,f,0,1].map(v=>+v.toFixed(6)).join(',')+')'; };
  const placeOver=fm=>{ let {r,q}=quad(fm); const sz=Math.max(.4,Math.min(1,cur().size??1)), cv=renderer.domElement;
    clip.style.left=r.left+'px'; clip.style.top=r.top+'px'; clip.style.width=r.width+'px'; clip.style.height=r.height+'px'; clip.style.borderRadius=getComputedStyle(cv.parentElement||cv).borderRadius;
    if(sz<1){ const cx=(q[0].x+q[2].x)/2, cy=(q[0].y+q[2].y)/2; q=q.map(p=>({x:cx+(p.x-cx)*sz,y:cy+(p.y-cy)*sz})); }
    wrap.style.transform=homog(q[0],q[1],q[2],q[3]); wrap.style.filter='brightness('+(cur().brightness??.8)+') contrast(1.06) saturate(1.05)'; };

  // the projector at the back: a flickering beam to the screen, and the box it comes from
  let rig=null;
  const buildRig=m=>{ if(rig||!m.port)return; const fm=m.fm, w=fm.geometry.parameters.width/2, h=fm.geometry.parameters.height/2, p=fm.position, P=new THREE.Vector3(...m.port);
    const Q=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([sx,sy])=>new THREE.Vector3(p.x+sx*w,p.y+sy*h,p.z));
    const g=new THREE.BufferGeometry(), ps=[], cs=[], A=[1,.95,.78], B=[.1,.09,.07];
    for(let i=0;i<4;i++){ const q0=Q[i], q1=Q[(i+1)%4]; ps.push(P.x,P.y,P.z,q0.x,q0.y,q0.z,q1.x,q1.y,q1.z); cs.push(...A,...B,...B); }
    g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));
    const beam=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.05,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    const dir=new THREE.Vector3().subVectors(p,P).normalize();
    const box=new THREE.Mesh(new THREE.BoxGeometry(.42,.3,.5),new THREE.MeshLambertMaterial({color:0x1c1715})); box.position.copy(P).addScaledVector(dir,-.1); box.lookAt(p);
    const lens=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),new THREE.MeshBasicMaterial({color:0xfff4d0})); lens.position.copy(P).addScaledVector(dir,.2);
    rig=new THREE.Group(); rig.add(beam,box,lens); rig.visible=false; scene.add(rig); rig.u={beam}; };
  const animRig=now=>{ if(!rig||!rig.visible)return; const t=now/1000; rig.u.beam.material.opacity=.048+.012*Math.sin(t*21)+.008*Math.sin(t*5.3); };

  let lastSync=0, adminThings=false;
  const tick=()=>{ const mt=STORE.main&&STORE.main.theatre; CINEMA.on=false; if(!mt||!mt.fm)return;
    const up=SHARED.LVL==='up'; if(canopy){ canopy.box.visible=canopy.pool.visible=up; const h=CLOCK.h??12; canopy.pool.material.opacity=h<6.5||h>18.5?1:.3; } if(post)post.group.visible=up;
    if(CINEMA.admin&&!adminThings&&canopy&&post){ adminThings=true;
      UI.thing({name:'THE MARQUEE',ghost:1,obj:canopy.box,reach:2.2*TILE,near:6*TILE,tall:1,act:()=>editMarquee()});
      UI.thing({name:'THE POSTER',ghost:1,obj:post.group,reach:1.6*TILE,near:5*TILE,tall:1,act:()=>editPoster()}); }
    const inside=up&&mt.R.inside(pos.x,pos.z), id=vid(cur().video_id);
    if(!inside||!id||FADE.busy){ if(clip&&clip.style.display!=='none'){ clip.style.display='none'; try{ player&&player.pauseVideo(); }catch(e){} } if(rig)rig.visible=false; return; }
    CINEMA.on=true; mkWrap(); clip.style.display='block'; placeOver(mt.fm); makePlayer(id); if(rig){ rig.visible=true; animRig(performance.now()); }
    const now=performance.now(); if(now-lastSync>1500&&player&&player.getCurrentTime){ lastSync=now;
      try{ const want=offset(), is=player.getCurrentTime(); if(Math.abs(is-want)>1.6)player.seekTo(want,true); if(player.getPlayerState&&player.getPlayerState()!==1)player.playVideo(); }catch(e){} } };
  CINEMA.tick=tick;

  const onRec=()=>{ const id=vid(cur().video_id);
    if(id!==titleId){ titleId=id; CINEMA.title='';
      if(id)fetch('https://www.youtube.com/oembed?format=json&url=https://youtu.be/'+id).then(r=>r.ok?r.json():null).then(j=>{ if(j&&j.title){ CINEMA.title=j.title; sign(); } }).catch(()=>{}); }
    sign(); };

  // the front: a lit marquee box over the doors (the video's title unless an admin wrote its lines) and a lit poster case on the wall
  let canopy=null, post=null;
  const canv=(w,h)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const tex=new THREE.CanvasTexture(cv); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; tex.colorSpace=THREE.SRGBColorSpace; return {cv,g:cv.getContext('2d'),tex}; };
  const FACE='"Arial Narrow","Helvetica Neue",Arial,sans-serif';
  const fit=(g,t,maxW,px)=>{ let s=px; do{ g.font='900 '+Math.round(s)+'px '+FACE; s-=1; }while(g.measureText(t).width>maxW&&s>8); };
  const qz=v=>Math.min(255,Math.round(v/56)*56), title=()=>(CINEMA.title||'THE STRANGEST CINEMA').toUpperCase();
  const split2=t=>{ if(t.length<=34)return [t]; const m=t.length/2; let b=-1; for(let i=0;i<t.length;i++)if(t[i]===' '&&(b<0||Math.abs(i-m)<Math.abs(b-m)))b=i; return b<0?[t]:[t.slice(0,b),t.slice(b+1)]; };
  const own=k=>String(cur()[k]||'').trim();
  const lines=()=>{ const o=own('marquee'); return o?o.toUpperCase().split('\n').map(s=>s.trim()).filter(Boolean).slice(0,3):['NOW SHOWING',...split2(title())].slice(0,3); };
  const litBg=(g,W,H)=>{ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#d9e6f5'); gr.addColorStop(.5,'#f6faff'); gr.addColorStop(1,'#d9e6f5'); g.fillStyle=gr; g.fillRect(0,0,W,H); };
  const rails=(g,W,H,n)=>{ g.fillStyle='rgba(60,70,84,.5)'; for(let i=1;i<n;i++){ const y=Math.round(6+i*(H-12)/n); g.fillRect(0,y-1,W,2); } g.fillStyle='#8f98a3'; g.fillRect(0,0,W,6); g.fillRect(0,H-6,W,6); };
  const drawCanopy=()=>{ const {front,side}=canopy, L=lines(), n=L.length, auto=!own('marquee');
    { const {g,cv,tex}=front, W=cv.width, H=cv.height, rh=(H-12)/n; litBg(g,W,H); rails(g,W,H,n); g.fillStyle='#111214'; g.textAlign='center'; g.textBaseline='middle'; if('letterSpacing' in g)g.letterSpacing='3px';
      L.forEach((t,i)=>{ fit(g,t,W-80,rh*(auto&&n>1&&i===0?.5:.74)); g.fillText(t,W/2,6+rh*(i+.54)); }); tex.needsUpdate=true; }
    { const {g,cv,tex}=side; litBg(g,cv.width,cv.height); rails(g,cv.width,cv.height,n); tex.needsUpdate=true; } };
  const posterSrc=()=>{ const o=own('poster'), y=vid(o); if(o)return y?'/yt/'+y+'.jpg':o; const id=vid(cur().video_id); return id?'/yt/'+id+'.jpg':''; };
  const drawPoster=()=>{ const {g,cv,tex}=post, W=cv.width, H=cv.height, src=posterSrc(), mine=!!own('poster'), band=mine?0:Math.round(H*.16);
    const cap=()=>{ if(band){ g.fillStyle='#0f1218'; g.fillRect(0,H-band,W,band); g.fillStyle='#faf8f0'; g.textAlign='center'; g.textBaseline='middle'; fit(g,title(),W-16,band*.5); g.fillText(title(),W/2,H-band/2); } tex.needsUpdate=true; };
    const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#3a2633'); gr.addColorStop(1,'#141019'); g.fillStyle=gr; g.fillRect(0,0,W,H);
    g.fillStyle='#d8a845'; g.textAlign='center'; g.textBaseline='middle'; fit(g,'COMING SOON',W-40,40); g.fillText('COMING SOON',W/2,H*.42); cap();
    if(!src)return; const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>{ if(posterSrc()!==src)return; try{ const ih=H-band, s=Math.max(W/img.width,ih/img.height), dw=img.width*s, dh=img.height*s; g.drawImage(img,(W-dw)/2,(ih-dh)/2,dw,dh);
      if(!mine){ const d=g.getImageData(0,0,W,ih), a=d.data; for(let i=0;i<a.length;i+=4){ a[i]=qz(a[i]); a[i+1]=qz(a[i+1]); a[i+2]=qz(a[i+2]); } g.putImageData(d,0,0); } }catch(e){} cap(); };
    img.src=src; };
  const buildSigns=m=>{ if(canopy)return; const dd=(STORE.main.doors||[]).find(d=>d[0]==='THE MOVIE THEATRE'); if(!dd)return;
    const Yb=SHARED.BOD.Y, tw=Math.abs(SHARED.BOD.X(1)-SHARED.BOD.X(0)), R=m.R, bx=dd[3], bz=dd[4]; let ox=dd[1]-bx, oz=dd[2]-bz; const L=Math.hypot(ox,oz)||1; ox/=L; oz/=L;
    const alongX=Math.abs(oz)>=Math.abs(ox), Wb=alongX?R.x1-R.x0:R.z1-R.z0, cS=alongX?(R.x0+R.x1)/2:(R.z0+R.z1)/2, ry=Math.atan2(ox,oz);
    const at=(s,out,y)=>alongX?new THREE.Vector3(s,y,bz+oz*out):new THREE.Vector3(bx+ox*out,y,s);
    const cw=Wb*.74, ch=Yb(140)-Yb(98), cd=1.5*tw, front=canv(2048,Math.round(2048*ch/cw)), side=canv(64,256), sof=canv(512,64), dark=new THREE.MeshLambertMaterial({color:0x26282c});
    { const g=sof.g; g.fillStyle='#2e3136'; g.fillRect(0,0,512,64); g.fillStyle='#fff3d6'; for(let r=0;r<2;r++)for(let x=24;x<512;x+=44){ g.beginPath(); g.arc(x+(r?22:0),18+r*28,4,0,7); g.fill(); } sof.tex.needsUpdate=true; }
    const box=new THREE.Mesh(new THREE.BoxGeometry(cw,ch,cd),[new THREE.MeshBasicMaterial({map:side.tex}),new THREE.MeshBasicMaterial({map:side.tex}),dark,new THREE.MeshBasicMaterial({map:sof.tex}),new THREE.MeshBasicMaterial({map:front.tex}),dark]);
    box.position.copy(at(cS,cd/2+.02,Yb(119))); box.rotation.y=ry; scene.add(box);
    const pl=canv(512,128); { const g=pl.g; for(let i=0;i<5;i++){ const x=52+i*102, gr=g.createRadialGradient(x,64,0,x,64,60); gr.addColorStop(0,'rgba(255,233,184,.55)'); gr.addColorStop(1,'rgba(255,233,184,0)'); g.fillStyle=gr; g.fillRect(x-60,4,120,120); } pl.tex.needsUpdate=true; }
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(cw,cd*1.4).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:pl.tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    const gp=at(cS,cd*.7,0); gp.y=SHARED.groundY(gp.x,gp.z)+.03; pool.position.copy(gp); pool.rotation.y=ry; scene.add(pool); canopy={box,pool,front,side,key:''};
    const dS=alongX?bx:bz, pS=dS+Math.sign(cS-dS||1)*2.3*tw, ph=Yb(70)-Yb(14), pw=ph*27/40, pc=canv(270,400);
    const frame=new THREE.Mesh(new THREE.BoxGeometry(pw*1.12,ph*1.08,.06*tw),new THREE.MeshLambertMaterial({color:0xb7bdc5}));
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:pc.tex})); plane.position.z=.035*tw;
    const group=new THREE.Group(); group.add(frame,plane); group.position.copy(at(pS,.14*tw,(Yb(70)+Yb(14))/2)); group.rotation.y=ry; scene.add(group); post={...pc,group,key:''};
    sign(); };
  const sign=()=>{ if(canopy){ const k=lines().join('|'); if(k!==canopy.key){ canopy.key=k; drawCanopy(); } }
    if(post){ const k=posterSrc()+'|'+title()+'|'+own('poster'); if(k!==post.key){ post.key=k; drawPoster(); } } };

  // double-click the screen: sound and the timeline for everyone, the rest for admins; admins also double-click the marquee and the poster
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const DLG='position:fixed;z-index:9;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,420px);max-height:86vh;overflow:auto;background:#141018;color:#f3e7dd;border:2px solid #bc923a;border-radius:12px;padding:16px;font:14px/1.5 system-ui';
  const BTN='font:600 13px system-ui;border:0;border-radius:6px;cursor:pointer;', RED=BTN+'background:#b22133;color:#fff;', DIM=BTN+'background:transparent;color:#c3a7a0;border:1px solid #3a2130;';
  const FLD='width:100%;box-sizing:border-box;font:inherit;background:#0e0a10;color:#f3e7dd;border:1px solid #3a2130;border-radius:6px;padding:7px';
  const LBL='display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#c3a7a0';
  const box_=()=>{ const d=document.createElement('div'); d.style.cssText=DLG; document.body.appendChild(d); for(const ev of ['keydown','keyup'])d.addEventListener(ev,e=>e.stopPropagation()); return d; };
  let dlg=null, edlg=null, tlT=0;
  const openMenu=async()=>{ '@later'; const a=await isAdmin(), c=cur(); if(!dlg)dlg=box_();
    dlg.innerHTML=`<div style="font:600 18px system-ui;color:#d8a845;margin-bottom:10px">THE SCREEN${a?' · admin':''}</div>
      <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #3a2130"><label><input id="cmsnd" type="checkbox" ${snd.on?'checked':''}> sound</label>
        <label style="display:block;margin-top:6px">Volume <span id="cmvv" style="color:#d8a845">${snd.vol}%</span><br><input id="cmv" type="range" min="0" max="100" value="${snd.vol}" style="width:100%"></label>
        <label style="display:block;margin-top:8px">Timeline <span id="cmtv" style="color:#d8a845">0:00 / 0:00</span>${a?'':' <span style="color:#8f7470;font-size:12px">(admins move it, for everyone)</span>'}<br><input id="cmt" type="range" min="0" max="1000" value="0" style="width:100%" ${a?'':'disabled'}></label></div>`+(a?`
      <label style="${LBL}">Play a YouTube link</label>
      <div style="display:flex;gap:6px;margin:4px 0 12px"><input id="cmu" placeholder="youtube.com/watch?v=..." style="${FLD};flex:1;min-width:0"><button id="cmplay" style="${RED}padding:0 12px">PLAY</button></div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">
        <label style="flex:1;min-width:120px">Size <span id="cmsv" style="color:#d8a845">${Math.round((c.size??1)*100)}%</span><br><input id="cms" type="range" min="40" max="100" value="${Math.round((c.size??1)*100)}" style="width:100%"></label>
        <label style="flex:1;min-width:120px">Brightness <span id="cmbv" style="color:#d8a845">${Math.round((c.brightness??.8)*100)}%</span><br><input id="cmb" type="range" min="20" max="120" value="${Math.round((c.brightness??.8)*100)}" style="width:100%"></label></div>
      <div style="margin-bottom:10px"><label><input id="cmloop" type="checkbox" ${c.loop!==false?'checked':''}> loop</label> &nbsp; <label><input id="cmauto" type="checkbox" ${c.autoplay!==false?'checked':''}> autoplay on enter</label></div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><button id="cmrestart" style="${DIM}padding:6px 10px">RESTART FOR EVERYONE</button><span style="color:#8f7470;font-size:12px">resets the shared time to now</span></div>
      <label style="${LBL}">Playlist (one link per line)</label>
      <textarea id="cmpl" rows="4" style="${FLD};font:13px monospace;margin:4px 0">${esc((c.playlist||[]).map(p=>p.url||p.id||p).join('\n'))}</textarea>
      <div style="margin-top:8px"><button id="cmsave" style="${RED}padding:8px 14px">SAVE PLAYLIST</button></div>`:'')+`
      <div style="display:flex;justify-content:flex-end;margin-top:10px"><button id="cmclose" style="${DIM}padding:8px 14px">CLOSE</button></div>
      <div id="cmsay" style="color:#8f7470;font-size:12px;margin-top:8px"></div>`;
    const $=s=>dlg.querySelector(s), say=t=>{ $('#cmsay').textContent=t; };
    $('#cmsnd').onchange=e=>CINEMA.sound(e.target.checked,null); $('#cmv').oninput=e=>{ $('#cmvv').textContent=e.target.value+'%'; CINEMA.sound(null,+e.target.value); };
    $('#cmclose').onclick=()=>{ dlg.style.display='none'; if(tlT){ clearInterval(tlT); tlT=0; } };
    const fmt=s=>{ s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }, dur=()=>{ try{ return player&&player.getDuration?player.getDuration()||0:0; }catch(e){ return 0; } }; let drag=false;
    if(tlT)clearInterval(tlT); tlT=setInterval(()=>{ if(dlg.style.display==='none'){ clearInterval(tlT); tlT=0; return; } const d=dur(); let t=0; try{ t=player&&player.getCurrentTime?player.getCurrentTime()||0:0; }catch(e){}
      if(!drag&&d)$('#cmt').value=Math.round(t/d*1000); $('#cmtv').textContent=fmt(t)+' / '+fmt(d); },500);
    $('#cmt').oninput=e=>{ drag=true; const d=dur(); $('#cmtv').textContent=fmt(+e.target.value/1000*d)+' / '+fmt(d); };
    $('#cmt').onchange=async e=>{ drag=false; if(!a)return; const sec=+e.target.value/1000*dur(); try{ player.seekTo(sec,true); }catch(x){} say('...'); say(await push({started_at:new Date(Date.now()-sec*1000).toISOString()})?'moved for everyone':'could not'); };
    if(a){ $('#cms').oninput=e=>$('#cmsv').textContent=e.target.value+'%'; $('#cmb').oninput=e=>$('#cmbv').textContent=e.target.value+'%';
      $('#cms').onchange=e=>push({size:+e.target.value/100}); $('#cmb').onchange=e=>push({brightness:+e.target.value/100});
      $('#cmloop').onchange=e=>push({loop:e.target.checked}); $('#cmauto').onchange=e=>push({autoplay:e.target.checked});
      $('#cmplay').onclick=async()=>{ const id=vid($('#cmu').value); if(!id){ say('not a YouTube link'); return; } say('...'); say(await push({video_id:id,started_at:new Date().toISOString()})?'playing for everyone':'could not save (log in as admin)'); };
      $('#cmrestart').onclick=async()=>{ say('...'); say(await push({started_at:new Date().toISOString()})?'restarted':'could not'); };
      $('#cmsave').onclick=async()=>{ const list=$('#cmpl').value.split('\n').map(s=>s.trim()).filter(Boolean).map(u=>({url:u,id:vid(u)})).filter(p=>p.id); say('...'); say(await push({playlist:list,idx:0})?'saved '+list.length:'could not save'); }; }
    dlg.style.display='block'; };
  CINEMA.openMenu=openMenu; CINEMA.openAdmin=openMenu;
  const SQLHINT='could not save (has supabase/cinema.sql been run?)';
  const mini=(head,body,wire)=>{ if(!edlg)edlg=box_();
    edlg.innerHTML=`<div style="font:600 18px system-ui;color:#d8a845;margin-bottom:10px">${head} · admin</div>${body}
      <div style="display:flex;gap:6px;justify-content:space-between;margin-top:10px"><span><button id="ezsave" style="${RED}padding:8px 14px">SAVE</button> <button id="ezauto" style="${DIM}padding:8px 12px">FROM THE VIDEO</button></span><button id="ezclose" style="${DIM}padding:8px 14px">CLOSE</button></div>
      <div id="ezsay" style="color:#8f7470;font-size:12px;margin-top:8px"></div>`;
    const $=s=>edlg.querySelector(s), say=t=>{ $('#ezsay').textContent=t; }; $('#ezclose').onclick=()=>{ edlg.style.display='none'; }; wire($,say); edlg.style.display='block'; };
  const editMarquee=()=>{ '@later'; mini('THE MARQUEE',`<label style="${LBL}">Its lines (up to 3)</label><textarea id="ezt" rows="3" maxlength="120" style="${FLD};margin-top:4px">${esc(own('marquee'))}</textarea>
      <div style="color:#8f7470;font-size:12px;margin-top:4px">Empty shows the playing video's title${CINEMA.title?': '+esc(CINEMA.title):''}.</div>`,
    ($,say)=>{ $('#ezsave').onclick=async()=>{ say('...'); say(await push({marquee:$('#ezt').value.trim()})?'saved':SQLHINT); };
      $('#ezauto').onclick=async()=>{ $('#ezt').value=''; say('...'); say(await push({marquee:''})?'showing the video title':SQLHINT); }; }); };
  const editPoster=()=>{ '@later'; mini('THE POSTER',`<label style="${LBL}">A YouTube link or an image link</label><input id="ezu" value="${esc(own('poster'))}" placeholder="youtube.com/watch?v=... or https://.../poster.jpg" style="${FLD};margin-top:4px">
      <div style="color:#8f7470;font-size:12px;margin-top:4px">Empty shows the playing video's picture. An image link must allow other sites to show it.</div>`,
    ($,say)=>{ $('#ezsave').onclick=async()=>{ say('...'); say(await push({poster:$('#ezu').value.trim()})?'saved':SQLHINT); };
      $('#ezauto').onclick=async()=>{ $('#ezu').value=''; say('...'); say(await push({poster:''})?'showing the video picture':SQLHINT); }; }); };

  let attached=false;
  const attach=()=>{ if(attached)return; const m=STORE.main&&STORE.main.theatre; if(!m||!m.fm)return; attached=true;
    const fm=m.fm, hb=new THREE.Mesh(new THREE.BoxGeometry(fm.geometry.parameters.width,fm.geometry.parameters.height,.4*TILE),new THREE.MeshBasicMaterial({visible:false}));
    hb.position.copy(fm.position); scene.add(hb);
    UI.thing({name:'THE SCREEN',ghost:1,obj:hb,reach:3.2*TILE,near:6.5*TILE,tall:fm.geometry.parameters.height,act:()=>openMenu()}); buildSigns(m); buildRig(m); };

  window.CINEMA=CINEMA; SYS.add('places',()=>{ attach(); tick(); },'059f-cinema');
  (async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,250)); await LOAD('later'); isAdmin().then(a=>{ CINEMA.admin=!!a; }); pull(); setInterval(()=>{ if(document.visibilityState!=='hidden')pull(); },5000); })();   // after the start, so the later chunk is not pulled in early
}
