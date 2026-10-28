// THE CINEMA: the movie theatre screen plays a schedule of public-domain films (the Internet Archive's) at the same moment for everyone, or a YouTube link an admin puts on; its marquee, poster and showtimes outside follow it.
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, CLOCK, pos, SIGNS, UI} from './003b-systems.js';
import {renderer, scene, ShaderPass} from './004-main.js';
import {FADE, SOL, STORE, SYS, TILE} from './006-map-pre.js';

{ const SB='https://jvcetttmqseoteidfggn.supabase.co', KEY='sb_publishable_UkzD8hOizW1hPr6hm3duQQ_07ZodPik', LS='sb-jvcetttmqseoteidfggn-auth-token', ROW='theatre';
  const jw=t=>{ try{ return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){ return {}; } };
  const ck=()=>{ const m=/(?:^|;\s*)tsfm-pass=([^;]+)/.exec(document.cookie); return m?decodeURIComponent(m[1]):''; };
  let T=''; const renew=async()=>{ '@later'; const s=JSON.parse(localStorage.getItem(LS)||'null'); if(!s||!s.refresh_token)return '';
    const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})}); if(!r.ok)return '';
    const n=await r.json(); localStorage.setItem(LS,JSON.stringify({...s,...n})); document.cookie='tsfm-pass='+n.access_token+'; path=/; max-age=3600; secure; samesite=strict'; return T=n.access_token; };
  const tok=async()=>{ '@later'; let t=ck()||T; if(t.startsWith('dev:'))return ''; if(!t||(jw(t).exp||0)*1000<Date.now()+60000)t=await renew().catch(()=>''); return t; };
  const vid=u=>{ u=String(u||'').trim(); const m=/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(u)||/^([A-Za-z0-9_-]{11})$/.exec(u); return m?m[1]:''; };

  // the schedule: free films one after another from a fixed start, each in a slot of its length and a short break rounded up to the quarter hour (so everyone sees the same showing)
  const FILMS=[['his_girl_friday','his_girl_friday.mp4','HIS GIRL FRIDAY',1940,5505],['house_on_haunted_hill_ipod','house_on_haunted_hill.mp4','HOUSE ON HAUNTED HILL',1959,4483],
    ['TheGeneral1926','The_General_1926_720p.mp4','THE GENERAL',1926,4732],['gullivers_travels1939','gullivers_travels1939.mp4',"GULLIVER'S TRAVELS",1939,4360],
    ['dressed_to_kill','dressed_to_kill.mp4','DRESSED TO KILL',1946,4290],['Killers_from_space','Killers_from_space.mp4','KILLERS FROM SPACE',1954,4255],
    ['lost_world','lost_world.mp4','THE LOST WORLD',1925,4085],['TheStranger_0','The_Stranger.mp4','THE STRANGER',1946,5473],
    ['my_favorite_brunette','my_favorite_brunette.mp4','MY FAVORITE BRUNETTE',1947,5212],['suddenly','suddenly.mp4','SUDDENLY',1954,4533],
    ['ThePhantomoftheOpera','Phantom_of_the_Opera_512kb.mp4','THE PHANTOM OF THE OPERA',1925,6389],['DasKabinettdesDoktorCaligariTheCabinetofDrCaligari','The_Cabinet_of_Dr._Caligari_512kb.mp4','THE CABINET OF DR. CALIGARI',1919,3061]]
    .map(([id,file,title,year,len])=>({id,file,title,year,len,slot:Math.ceil((len+600)/900)*900}));
  const EPOCH=Date.UTC(2026,9,28), CYCLE=FILMS.reduce((a,f)=>a+f.slot,0)*1000;
  const showAt=t=>{ const k=Math.floor((t-EPOCH)/CYCLE), r=t-EPOCH-k*CYCLE; let s0=EPOCH+k*CYCLE, a=0; for(let i=0;i<FILMS.length;i++){ const f=FILMS[i]; if(r<a+f.slot*1000)return {i,f,start:s0+a}; a+=f.slot*1000; } return {i:0,f:FILMS[0],start:s0}; };
  CINEMA.films=FILMS; CINEMA.showAt=showAt;
  CINEMA.upcoming=(n=6,t=Date.now())=>{ const o=[]; let s=showAt(t); for(let k=0;k<n;k++){ o.push({title:s.f.title,year:s.f.year,id:s.f.id,start:s.start,end:s.start+s.f.len*1000}); s=showAt(s.start+s.f.slot*1000+1); } return o; };
  // a YouTube link an admin plays takes over for up to four hours, then the schedule comes back
  const ytOn=()=>{ const c=cur(); return !!vid(c.video_id)&&!!c.started_at&&Date.now()-Date.parse(c.started_at)<4*3600e3; };
  const film=()=>{ const s=showAt(Date.now()), off=(Date.now()-s.start)/1000; return off<s.f.len?{...s,off}:null; };
  CINEMA.playing=()=>{ if(ytOn())return {yt:true,title:CINEMA.ytTitle||''}; const f=film(); return f?{title:f.f.title,year:f.f.year,id:f.f.id}:null; };
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
  let vf=1, fv=null; const applySnd=()=>{ try{ if(player){ if(snd.on){ player.unMute(); player.setVolume(Math.round(snd.vol*vf)); } else player.mute(); } }catch(e){} if(fv){ fv.muted=!snd.on; fv.volume=Math.min(1,snd.vol*vf/100); } };
  CINEMA.sound=(on,vol)=>{ if(on!=null)snd.on=!!on; if(vol!=null)snd.vol=Math.max(0,Math.min(100,+vol)); saveSnd(); applySnd(); };

  // the player is a 16:9 page behind the game's picture, seen only through the screen (the picture is see-through there); the clip keeps it inside the game's frame
  const W0=1280, H0=720;
  let clip=null, wrap=null, holder=null, player=null, soundBtn=null, haveVid='', ytP=null, making=false;
  const ensureYT=()=>ytP||(ytP=new Promise(res=>{ if(window.YT&&window.YT.Player)return res(); const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{ try{ prev&&prev(); }catch(e){} res(); }; const s=document.createElement('script'); s.src='https://www.youtube.com/iframe_api'; s.async=1; document.head.appendChild(s); }));
  const mkWrap=()=>{ if(wrap)return; clip=document.createElement('div'); clip.id='cinema';
    clip.style.cssText='position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none;display:none';
    wrap=document.createElement('div'); wrap.style.cssText='position:absolute;left:0;top:0;width:'+W0+'px;height:'+H0+'px;transform-origin:0 0;overflow:hidden;background:#000;will-change:transform';
    holder=document.createElement('div'); holder.style.cssText='position:absolute;inset:0;width:100%;height:100%'; wrap.appendChild(holder);
    if(!document.getElementById('cinema-css')){ const st=document.createElement('style'); st.id='cinema-css'; st.textContent='@keyframes cmgrain{0%{background-position:0 0}20%{background-position:-61px 37px}40%{background-position:43px -83px}60%{background-position:-97px -21px}80%{background-position:71px 89px}100%{background-position:0 0}}@keyframes cmflick{0%,100%{opacity:.02}13%{opacity:.05}27%{opacity:.01}52%{opacity:.04}71%{opacity:.02}88%{opacity:.05}}'; document.head.appendChild(st); }
    const nz=document.createElement('canvas'); nz.width=nz.height=192; { const g=nz.getContext('2d'), d=g.createImageData(192,192); for(let i=0;i<d.data.length;i+=4){ const v=Math.random()*255|0; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255; } g.putImageData(d,0,0); }
    const lay=css=>{ const d=document.createElement('div'); d.style.cssText='position:absolute;inset:0;pointer-events:none;'+css; wrap.appendChild(d); return d; };
    lay('background:radial-gradient(circle,rgba(0,0,0,.28) .8px,rgba(0,0,0,0) 1.4px) 0 0/5px 5px;opacity:.3');
    lay('background:url('+nz.toDataURL()+') 0 0/384px 384px;mix-blend-mode:overlay;opacity:.07;animation:cmgrain .42s steps(1) infinite');
    lay('background:radial-gradient(ellipse 60% 55% at 50% 47%,rgba(255,246,228,0) 0%,rgba(0,0,0,0) 55%,rgba(0,0,0,.5) 100%);box-shadow:inset 0 0 90px 18px rgba(0,0,0,.6)');
    lay('background:#000;animation:cmflick 2.3s steps(1) infinite');
    soundBtn=document.createElement('button'); soundBtn.textContent='🔇 tap for sound';
    soundBtn.style.cssText='position:fixed;left:0;top:0;transform:translate(-50%,-100%);display:none;z-index:3;pointer-events:auto;font:600 13px system-ui;color:#fff;background:rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.4);border-radius:999px;padding:6px 14px;cursor:pointer';
    soundBtn.onclick=()=>CINEMA.sound(true,null); document.body.appendChild(soundBtn);
    fv=document.createElement('video'); fv.muted=true; fv.playsInline=true; fv.preload='auto'; fv.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:fill;background:#000;display:none'; wrap.insertBefore(fv,wrap.firstChild);
    fv.addEventListener('loadedmetadata',()=>{ if(fv.videoWidth&&fv.videoHeight)aspect=fv.videoWidth/fv.videoHeight; });
    clip.appendChild(wrap); const stg=document.getElementById('stage')||document.body; stg.insertBefore(clip,stg.firstChild); };
  // the scheduled film: its file from the Internet Archive, kept at the showing's moment
  let fvSrc='', fvSync=0;
  const playFilm=f=>{ const src='https://archive.org/download/'+f.f.id+'/'+f.f.file; holder.style.display='none'; fv.style.display='block'; try{ player&&player.pauseVideo(); }catch(e){}
    if(fvSrc!==src){ fvSrc=src; fv.src=src; fv.currentTime=f.off; applySnd(); }
    const now=performance.now(); if(now-fvSync>1500){ fvSync=now; if(fv.readyState>0&&Math.abs(fv.currentTime-f.off)>2)fv.currentTime=f.off; if(fv.paused)fv.play().catch(()=>{}); } return fv.readyState>=2; };
  const stopFilm=()=>{ if(fv&&!fv.paused)fv.pause(); if(fv)fv.style.display='none'; if(holder)holder.style.display=''; };
  let vOK=false, vFail='', tries=0, t0=0; const HOSTS=['https://www.youtube-nocookie.com','https://www.youtube.com'];
  const makePlayer=async id=>{ '@later'; mkWrap();
    if(player){ if(id!==haveVid){ haveVid=id; vOK=false; vFail=''; tries=0; t0=performance.now(); try{ player.loadVideoById({videoId:id,startSeconds:offset()}); }catch(e){} }
      else if(!vOK&&!vFail&&performance.now()-t0>15000)retry(id); return; }
    if(making)return; making=true; await ensureYT(); haveVid=id; vOK=false; t0=performance.now();
    player=new window.YT.Player(holder,{videoId:id,host:HOSTS[Math.min(tries,HOSTS.length-1)],width:'100%',height:'100%',
      playerVars:{autoplay:1,mute:1,controls:0,rel:0,playsinline:1,modestbranding:1,disablekb:1,fs:0,iv_load_policy:3,cc_load_policy:0,origin:location.origin},
      events:{onReady:e=>{ try{ e.target.mute(); e.target.seekTo(offset(),true); e.target.playVideo(); e.target.unloadModule('captions'); e.target.unloadModule('cc'); }catch(x){} applySnd(); },
        onStateChange:e=>{ if(e.data===1){ vOK=true; vFail=''; } if(e.data===window.YT.PlayerState.ENDED)onEnded(); },
        onError:e=>{ if(e.data===101||e.data===150)vFail='this video only plays on YouTube'; else retry(haveVid); }}}); };
  const retry=id=>{ '@later'; if(tries>=HOSTS.length-1){ if(!vOK)vFail=vFail||'the video could not load here'; return; } tries++; try{ player.destroy(); }catch(e){} player=null; making=false;
    holder=document.createElement('div'); holder.style.cssText='position:absolute;inset:0;width:100%;height:100%'; wrap.insertBefore(holder,wrap.firstChild); makePlayer(id); };
  const onEnded=async()=>{ '@later'; if(adm)await push({video_id:''}); };   // a YouTube link played to its end: back to the schedule

  // the four corners of a plane on the page, and a homography that maps the video's own rectangle (no black bars) onto them
  const corners=me=>{ const g=me.geometry.parameters, r=renderer.domElement.getBoundingClientRect(); me.updateMatrixWorld(); const V=new THREE.Vector3();
    const P=(sx,sy)=>{ V.set(sx*g.width/2,sy*g.height/2,0).applyMatrix4(me.matrixWorld).project(SHARED.cam); return {x:(V.x+1)/2*r.width,y:(1-V.y)/2*r.height,u:(V.x+1)/2,v:(V.y+1)/2}; };
    return {r,q:[P(-1,1),P(1,1),P(1,-1),P(-1,-1)]}; };
  const coef=(p0,p1,p2,p3)=>{ const dx1=p1.x-p2.x, dx2=p3.x-p2.x, dx3=p0.x-p1.x+p2.x-p3.x, dy1=p1.y-p2.y, dy2=p3.y-p2.y, dy3=p0.y-p1.y+p2.y-p3.y; let g=0, h=0;
    if(Math.abs(dx3)>1e-6||Math.abs(dy3)>1e-6){ const det=(dx1*dy2-dx2*dy1)||1e-9; g=(dx3*dy2-dx2*dy3)/det; h=(dx1*dy3-dx3*dy1)/det; }
    return [p1.x-p0.x+g*p1.x,p3.x-p0.x+h*p3.x,p0.x,p1.y-p0.y+g*p1.y,p3.y-p0.y+h*p3.y,p0.y,g,h]; };
  const ap=(k,u,v)=>{ const w=k[6]*u+k[7]*v+1; return {x:(k[0]*u+k[1]*v+k[2])/w,y:(k[3]*u+k[4]*v+k[5])/w}; };
  const m3d=k=>'matrix3d('+[k[0]/W0,k[3]/W0,0,k[6]/W0, k[1]/H0,k[4]/H0,0,k[7]/H0, 0,0,1,0, k[2],k[5],0,1].map(v=>+v.toFixed(6)).join(',')+')';
  let aspect=16/9, aspId='';
  const sniff=id=>{ if(aspId===id)return; aspId=id; aspect=16/9; if(location.protocol==='file:')return; const im=new Image();
    im.onload=()=>{ try{ const c=document.createElement('canvas'), w=c.width=im.width, h=c.height=im.height, g=c.getContext('2d'); g.drawImage(im,0,0); const d=g.getImageData(0,0,w,h).data;
      const dark=(x0,y0,x1,y1)=>{ let m=0; for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){ const i=(y*w+x)*4; m=Math.max(m,d[i],d[i+1],d[i+2]); } return m<26; };
      let t=0, b=0, l=0, r=0; while(t<h/2&&dark(0,t,w,t+1))t++; while(b<h/2&&dark(0,h-1-b,w,h-b))b++; while(l<w/2&&dark(l,0,l+1,h))l++; while(r<w/2&&dark(w-1-r,0,w-r,h))r++;
      const cw=w-l-r, ch=h-t-b; if(aspId===id&&cw>w*.3&&ch>h*.3)aspect=Math.max(.45,Math.min(2.6,cw/ch)); }catch(e){} }; im.src='/yt/'+id+'.jpg'; };
  const vrect=()=>aspect>=W0/H0?{x:0,y:(H0-W0/aspect)/2,w:W0,h:W0/aspect}:{x:(W0-H0*aspect)/2,y:0,w:H0*aspect,h:H0};
  const placeOver=(me,dim=1,ok=true)=>{ const {r,q}=corners(me), cv=renderer.domElement, k=coef(q[0],q[1],q[2],q[3]), V=vrect();
    clip.style.left=r.left+'px'; clip.style.top=r.top+'px'; clip.style.width=r.width+'px'; clip.style.height=r.height+'px'; clip.style.borderRadius=getComputedStyle(cv.parentElement||cv).borderRadius;
    const u0=-V.x/V.w, u1=(W0-V.x)/V.w, v0=-V.y/V.h, v1=(H0-V.y)/V.h;
    wrap.style.transform=m3d(coef(ap(k,u0,v0),ap(k,u1,v0),ap(k,u1,v1),ap(k,u0,v1))); wrap.style.filter='brightness('+((cur().brightness??.8)*dim)+') contrast(1.08) saturate(1.02) blur(.4px)';
    if(CUT){ CUT.uniforms.uOn.value=ok?1:0; q.forEach((p,i)=>CUT.uniforms.uQ.value[i].set(p.u,p.v)); }
    soundBtn.textContent=vFail?vFail.toUpperCase():'🔇 tap for sound'; soundBtn.style.pointerEvents=vFail?'none':'auto';
    if(vFail||ok&&!snd.on){ const b=ap(k,.5,1); soundBtn.style.display='block'; soundBtn.style.left=(r.left+b.x)+'px'; soundBtn.style.top=(r.top+b.y-6)+'px'; } else soundBtn.style.display='none'; };
  // the screen's see-through face (the video shows through it, darker at its edges) and the last pass that keeps the rest of the picture solid
  const HOLE=new THREE.ShaderMaterial({blending:THREE.NoBlending,depthWrite:true,vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'varying vec2 vU; void main(){ vec2 d=(vU-.5)*vec2(1.,1.12); float v=smoothstep(.12,.62,length(d)); float a=.04+.45*v*v; gl_FragColor=vec4(0.,0.,0.,a); }'});
  let CUT=null;
  const CUTH='uniform float uOn; uniform vec2 uQ[4]; float cutS(vec2 a,vec2 b,vec2 p){ return (b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x); }',
    CUTC='{ vec4 c=gl_FragColor; float a=1.; vec3 rgb=c.rgb; if(uOn>.5){ float s0=cutS(uQ[0],uQ[1],vUv), s1=cutS(uQ[1],uQ[2],vUv), s2=cutS(uQ[2],uQ[3],vUv), s3=cutS(uQ[3],uQ[0],vUv); if((s0>=0.&&s1>=0.&&s2>=0.&&s3>=0.)||(s0<=0.&&s1<=0.&&s2<=0.&&s3<=0.)){ a=c.a; if(a<.99)rgb=vec3(0.); } } gl_FragColor=vec4(rgb,a); }';
  const mkCut=()=>{ if(CUT||!SHARED.composer)return; CUT=new ShaderPass({uniforms:{tDiffuse:{value:null},uOn:{value:0},uQ:{value:[0,1,2,3].map(()=>new THREE.Vector2())}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'uniform sampler2D tDiffuse; varying vec2 vUv; '+CUTH+'\nvoid main(){ gl_FragColor=texture2D(tDiffuse,vUv); '+CUTC+' }'});
    SHARED.composer.addPass(CUT); SHARED.fold('cut',CUT,{head:CUTH,code:CUTC,uniforms:{uOn:CUT.uniforms.uOn,uQ:CUT.uniforms.uQ}}); };
  const facing=me=>{ me.updateMatrixWorld(); const n=new THREE.Vector3(0,0,1).transformDirection(me.matrixWorld), p=new THREE.Vector3().setFromMatrixPosition(me.matrixWorld); return n.dot(new THREE.Vector3().subVectors(SHARED.cam.position,p))>0; };

  // the screen's see-through face, the whole screen, and a double-click on it for the settings
  let holeM=null;
  const buildHole=m=>{ if(holeM)return; const fm=m.fm; fm.updateMatrixWorld(); const w=fm.geometry.parameters.width/2, h=fm.geometry.parameters.height/2, N=new THREE.Vector3(0,0,1).transformDirection(fm.matrixWorld);
    holeM=new THREE.Mesh(new THREE.PlaneGeometry(1,1),HOLE); holeM.quaternion.copy(fm.quaternion); holeM.position.setFromMatrixPosition(fm.matrixWorld).addScaledVector(N,.02); holeM.visible=false; holeM.u={w:w*2,h:h*2}; scene.add(holeM);
    const hb=new THREE.Mesh(new THREE.BoxGeometry(w*2,h*2,.3*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.quaternion.copy(fm.quaternion); hb.position.copy(holeM.position); scene.add(hb);
    UI.thing({name:'THE SCREEN',ghost:1,obj:hb,reach:40*TILE,near:40*TILE,tall:h*2,act:()=>openMenu()}); };
  const fitHole=()=>{ const u=holeM.u; holeM.scale.set(u.w,u.h,1); };

  let lastSync=0, adminThings=false;
  let signT=0;
  // the ticket fox stands at the box office window facing the street; the theatre's door takes a ticket
  CINEMA.dbg=()=>({box:box_o&&[+box_o.x.toFixed(2),+box_o.z.toFixed(2),box_o.ox,box_o.oz],marquee:canopy&&canopy.box.position.toArray().map(v=>+v.toFixed(2)),times:!!times,fox:!!foxN});
  let foxN=null; CINEMA.toon=(k,N)=>{ if(k==='ticketfox')foxN=N; };
  const fox=()=>{ const N=foxN; if(!N||!box_o||!N.st)return; const s=N.st, b=box_o, x=b.x-b.ox*.2*TILE, z=b.z-b.oz*.2*TILE;
    N.home={id:'ticketfox',x,z,r:0}; s.x=x; s.z=z; s.to=null; s.hold=true; s.face={x:x+b.ox*5*TILE,z:z+b.oz*5*TILE}; };
  const F0=()=>window.FORAGE; let named=false;
  const gate=()=>{ const I=window.INV, n=I&&I.items&&I.items.ticket|0, say=t=>F0()&&F0().say&&F0().say(t);
    if(n>0){ I.add('ticket',-1); if(F0()&&F0().draw)F0().draw(); const P=CINEMA.playing(); say('YOU HAND OVER A TICKET'+(P&&P.title?' FOR '+P.title:'')+'.'); return true; }
    say('YOU NEED A TICKET. THE FOX AT THE BOX OFFICE SELLS THEM.'); return false; };
  const tick=()=>{ if(STORE.gate&&!STORE.gate.theatre)STORE.gate.theatre=gate; const mt=STORE.main&&STORE.main.theatre; CINEMA.on=false; if(!mt||!mt.fm)return; if(performance.now()-signT>5000){ signT=performance.now(); sign(); } fox();
    if(!named&&F0()&&F0().add){ named=true; F0().add({names:{ticket:'MOVIE TICKET'},prices:{ticket:5}}); }
    const up=SHARED.LVL==='up'; if(canopy){ canopy.box.visible=canopy.pool.visible=up; const h=CLOCK.h??12; canopy.pool.material.opacity=h<6.5||h>18.5?1:.3; } if(post){ post.group.visible=up; if(post.front)post.front.visible=up; }
    if(CINEMA.admin&&!adminThings&&canopy&&post){ adminThings=true;
      UI.thing({name:'THE MARQUEE',ghost:1,obj:canopy.box,reach:2.2*TILE,near:6*TILE,tall:1,act:()=>editMarquee()});
      UI.thing({name:'THE POSTER',ghost:1,obj:post.group,reach:1.6*TILE,near:5*TILE,tall:1,act:()=>editPoster()}); }
    const yt=ytOn(), id=yt?vid(cur().video_id):'', fl=yt?null:film(), now=performance.now();
    const tgt=up&&holeM&&mt.R.inside(pos.x,pos.z)?holeM:null; if(holeM)holeM.visible=false;
    if(!tgt||!(id||fl)||FADE.busy){ if(CUT)CUT.uniforms.uOn.value=0; if(soundBtn)soundBtn.style.display='none'; if(clip&&clip.style.display!=='none'){ clip.style.display='none'; try{ player&&player.pauseVideo(); }catch(e){} stopFilm(); } return; }
    mkWrap(); mkCut(); let ok;
    if(fl){ ok=playFilm(fl); vFail=''; } else { stopFilm(); makePlayer(id); sniff(id); ok=vOK&&!vFail; }
    CINEMA.on=ok; fitHole(); if(ok)tgt.visible=true;
    if(facing(tgt)){ clip.style.display='block'; placeOver(tgt,1,ok); } else { clip.style.display='none'; soundBtn.style.display='none'; if(CUT)CUT.uniforms.uOn.value=0; }
    if(id)    sync(); };
  const sync=()=>{ const now=performance.now(); if(now-lastSync>1500&&player&&player.getCurrentTime){ lastSync=now;
      try{ const want=offset(), is=player.getCurrentTime(); if(Math.abs(is-want)>1.6)player.seekTo(want,true); if(player.getPlayerState&&player.getPlayerState()!==1)player.playVideo(); }catch(e){} } };
  CINEMA.tick=tick;

  const onRec=()=>{ const id=vid(cur().video_id);
    if(id!==titleId){ titleId=id; CINEMA.title='';
      if(id)fetch('https://www.youtube.com/oembed?format=json&url=https://youtu.be/'+id).then(r=>r.ok?r.json():null).then(j=>{ if(j&&j.title){ CINEMA.ytTitle=j.title; sign(); } }).catch(()=>{}); }
    sign(); };

  // the front: a lit marquee box over the doors (the video's title unless an admin wrote its lines) and a lit poster case on the wall
  let canopy=null, post=null, times=null, box_o=null; const ovr={text:null,bri:null,col:null};
  const canv=(w,h)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const tex=new THREE.CanvasTexture(cv); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; tex.colorSpace=THREE.SRGBColorSpace; return {cv,g:cv.getContext('2d'),tex}; };
  const FACE='"Arial Narrow","Helvetica Neue",Arial,sans-serif';
  const fit=(g,t,maxW,px)=>{ let s=px; do{ g.font='900 '+Math.round(s)+'px '+FACE; s-=1; }while(g.measureText(t).width>maxW&&s>8); };
  const qz=v=>Math.min(255,Math.round(v/56)*56), nextF=()=>{ const P=CINEMA.playing(); return P&&!P.yt?P:CINEMA.upcoming(1)[0]; }, title=()=>(ytOn()?CINEMA.ytTitle||'THE STRANGEST CINEMA':nextF().title).toUpperCase();
  const split2=t=>{ if(t.length<=34)return [t]; const m=t.length/2; let b=-1; for(let i=0;i<t.length;i++)if(t[i]===' '&&(b<0||Math.abs(i-m)<Math.abs(b-m)))b=i; return b<0?[t]:[t.slice(0,b),t.slice(b+1)]; };
  const own=k=>String(cur()[k]||'').trim();
  const lines=()=>{ const o=ovr.text!=null?ovr.text:own('marquee'); return o?o.toUpperCase().split('\n').map(s=>s.trim()).filter(Boolean).slice(0,3):['NOW SHOWING',...split2(title())].slice(0,3); };
  const litBg=(g,W,H)=>{ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#d9e6f5'); gr.addColorStop(.5,'#f6faff'); gr.addColorStop(1,'#d9e6f5'); g.fillStyle=gr; g.fillRect(0,0,W,H); };
  const rails=(g,W,H,n)=>{ g.fillStyle='rgba(60,70,84,.5)'; for(let i=1;i<n;i++){ const y=Math.round(6+i*(H-12)/n); g.fillRect(0,y-1,W,2); } g.fillStyle='#8f98a3'; g.fillRect(0,0,W,6); g.fillRect(0,H-6,W,6); };
  const drawCanopy=()=>{ const {front,side}=canopy, L=lines(), n=L.length, auto=!own('marquee');
    { const {g,cv,tex}=front, W=cv.width, H=cv.height, rh=(H-12)/n; litBg(g,W,H); rails(g,W,H,n); g.fillStyle='#111214'; g.textAlign='center'; g.textBaseline='middle'; if('letterSpacing' in g)g.letterSpacing='3px';
      L.forEach((t,i)=>{ fit(g,t,W-80,rh*(auto&&n>1&&i===0?.5:.74)); g.fillText(t,W/2,6+rh*(i+.54)); }); tex.needsUpdate=true; }
    { const {g,cv,tex}=side; litBg(g,cv.width,cv.height); rails(g,cv.width,cv.height,n); tex.needsUpdate=true; } };
  const posterSrc=()=>{ const o=own('poster'), y=vid(o); if(o)return y?'/yt/'+y+'.jpg':o; if(ytOn())return '/yt/'+vid(cur().video_id)+'.jpg'; return '/ia/'+nextF().id+'.jpg'; };
  const drawPoster=()=>{ const {g,cv,tex}=post, W=cv.width, H=cv.height, src=posterSrc(), mine=!!own('poster');   // the picture fills the whole case, black behind it
    g.fillStyle='#000'; g.fillRect(0,0,W,H); g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle='#d8a845'; fit(g,'COMING SOON',W-40,40); g.fillText('COMING SOON',W/2,H*.42); g.fillStyle='#faf8f0'; fit(g,title(),W-30,22); g.fillText(title(),W/2,H*.56); tex.needsUpdate=true;
    if(!src)return; const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>{ if(posterSrc()!==src)return; try{ g.fillStyle='#000'; g.fillRect(0,0,W,H); const s=Math.max(W/img.width,H/img.height), dw=img.width*s, dh=img.height*s; g.drawImage(img,(W-dw)/2,(H-dh)/2,dw,dh);
      if(!mine){ const d=g.getImageData(0,0,W,H), a=d.data; for(let i=0;i<a.length;i+=4){ a[i]=qz(a[i]); a[i+1]=qz(a[i+1]); a[i+2]=qz(a[i+2]); } g.putImageData(d,0,0); } }catch(e){} tex.needsUpdate=true; };
    img.src=src; };
  // the street front under the marquee (owner, 27 Oct 2026): dark stone and gold, glass double doors with push bars under a lit ENTRANCE, backlit poster cases
  const storefront=({at,ry,tw,Yb,bx,bz,alongX,R,Wb,cS,post})=>{ const F=new THREE.Group(), dS=alongX?bx:bz, sg=Math.sign(cS-dS||1), s0=alongX?R.x0:R.z0, s1=alongX?R.x1:R.z1, lo=Math.min(s0,s1), hi=Math.max(s0,s1), y0=Yb(0), top=Yb(97);
    const OUT=.11*tw, put=(me,s,out,y)=>{ me.position.copy(at(s,OUT+out,y)); me.rotation.y=ry; F.add(me); return me; }, flat=(w,h,m)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),m), blk=(w,h,d,c)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));
    const glow=m=>new THREE.MeshBasicMaterial({map:m.tex,toneMapped:false}), L=s=>sg*s;
    { const px=96/tw, W=Math.round(Wb*px), H=Math.round((top-y0)*px), c=canv(W,H), g=c.g, band=Math.round(H*.07), kick=Math.round(H*.06);
      g.fillStyle='#141217'; g.fillRect(0,0,W,H); for(let i=0;i<W*H/60;i++){ const v=24+Math.random()*22|0; g.fillStyle=`rgb(${v},${v-2},${v+3})`; g.fillRect(Math.random()*W|0,Math.random()*H|0,1,1); }
      g.fillStyle='#0b0a0d'; for(let x=0;x<W;x+=Math.round(px*tw*.9))g.fillRect(x,band,2,H-band-kick);
      g.fillStyle='#7a1e24'; g.fillRect(0,0,W,band); g.fillStyle='#c9a24a'; g.fillRect(0,band-4,W,4); g.fillRect(0,0,W,3); for(let x=0;x<W;x+=band){ g.beginPath(); g.moveTo(x,band-4); g.lineTo(x+band/2,6); g.lineTo(x+band,band-4); g.fill(); }
      g.fillStyle='#8a6a32'; g.fillRect(0,H-kick,W,kick); g.fillStyle='#c9a24a'; g.fillRect(0,H-kick,W,3); c.tex.magFilter=THREE.LinearFilter; c.tex.needsUpdate=true;
      const me=put(flat(Wb,top-y0,new THREE.MeshLambertMaterial({map:c.tex,emissive:0x0c0a0c})),cS,.015*tw,(y0+top)/2); me.receiveShadow=true; }
    { const dw=1.5*tw, dh=Yb(80)-y0, BR=0x6b4a28, br=.07*tw, lc=canv(128,256), g=lc.g, gr=g.createLinearGradient(0,0,0,256);   // the doors: warm lobby light behind glass
      gr.addColorStop(0,'#3a2a1c'); gr.addColorStop(.55,'#b07a3c'); gr.addColorStop(1,'#e8b56a'); g.fillStyle=gr; g.fillRect(0,0,128,256); g.fillStyle='rgba(255,240,210,.18)'; g.beginPath(); g.moveTo(14,0); g.lineTo(44,0); g.lineTo(8,256); g.lineTo(0,256); g.fill(); lc.tex.needsUpdate=true;
      put(flat(dw+.2*tw,Yb(95)-y0,new THREE.MeshBasicMaterial({color:0x050405})),dS,.02*tw,(y0+Yb(95))/2);
      for(const k of [-1,1]){ put(flat(dw/2-br,dh-br,glow(lc)),dS+L(k*dw/4),.05*tw,y0+dh/2); const bar=put(blk(.04*tw,.05*tw,.08*tw,0xd9b45a),dS+L(k*(dw/2-.16*tw)),.11*tw,y0+dh*.5); bar.scale.y=dh*.35/(.05*tw); }
      for(const s of [-dw/2,0,dw/2])put(blk(br,Yb(95)-y0,.1*tw,BR),dS+L(s),.06*tw,(y0+Yb(95))/2);
      put(blk(dw+br,br,.1*tw,BR),dS,.06*tw,Yb(80)); put(blk(dw+br,br,.1*tw,BR),dS,.06*tw,Yb(95)-br/2);
      const tc=canv(512,96); { const g2=tc.g; g2.fillStyle='#120d08'; g2.fillRect(0,0,512,96); g2.fillStyle='#ffd27a'; g2.textAlign='center'; g2.textBaseline='middle'; if('letterSpacing' in g2)g2.letterSpacing='10px'; fit(g2,'ENTRANCE',440,58); g2.fillText('ENTRANCE',256,50); tc.tex.needsUpdate=true; }
      put(flat(dw-br,Yb(95)-Yb(80)-br*1.5,glow(tc)),dS,.05*tw,(Yb(80)+Yb(95))/2); }
    const ph=Yb(78)-Yb(18), pw=ph*27/40, hc=canv(64,64); { const g=hc.g, gr=g.createRadialGradient(32,32,4,32,32,32); gr.addColorStop(0,'rgba(255,236,200,.5)'); gr.addColorStop(1,'rgba(255,236,200,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); hc.tex.needsUpdate=true; }
    const halo=new THREE.MeshBasicMaterial({map:hc.tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}), pm=new THREE.MeshBasicMaterial({map:post.tex,toneMapped:false}), rim=new THREE.MeshBasicMaterial({color:0xfff2d8,toneMapped:false}), cases=[];
    for(const o of [1.95,6.9]){ const s=dS+L(o*tw); if(s-pw/2-.25*tw<lo||s+pw/2+.25*tw>hi)continue; const yc=(Yb(18)+Yb(78))/2, G=new THREE.Group();   // a lightbox: the poster lit from behind, a bright edge where the light spills round it
      const fr=blk(pw+.18*tw,ph+.18*tw,.12*tw,0x0c0b0d); fr.position.z=.06*tw; const r=flat(pw+.05*tw,ph+.05*tw,rim); r.position.z=.121*tw; const p=flat(pw,ph,pm); p.position.z=.123*tw; const h=flat(pw*2,ph*1.5,halo); h.position.z=.02*tw;
      G.add(h,fr,r,p); G.position.copy(at(s,OUT,yc)); G.rotation.y=ry; F.add(G); cases.push(G); }
    post.group=cases[0]||F; scene.add(F); return F; };
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
    post={...canv(270,400),key:''}; post.front=storefront({at,ry,tw,Yb,bx,bz,alongX,R,Wb,cS,post});
    const dS=alongX?bx:bz, ph=Yb(70)-Yb(14), pw=ph*27/40;
    { const bS=dS-Math.sign(cS-dS||1)*2.6*tw, bw2=pw*1.7, bc=canv(612,400), fr=new THREE.Mesh(new THREE.BoxGeometry(bw2*1.06,ph*1.06,.06*tw),new THREE.MeshLambertMaterial({color:0x2a2d33}));
      const pn=new THREE.Mesh(new THREE.PlaneGeometry(bw2,ph),new THREE.MeshBasicMaterial({map:bc.tex})); pn.position.z=.035*tw; const g2=new THREE.Group(); g2.add(fr,pn);
      g2.position.copy(at(bS,.14*tw,(Yb(70)+Yb(14))/2)); g2.rotation.y=ry; scene.add(g2); times={...bc,group:g2,key:''}; }
    // the box office on the pavement: a red booth with an open window over a counter, its sign on the roof, the showtimes on a screen inside behind the fox who sells the tickets
    { const kS=dS+Math.sign(cS-dS||1)*4.4*tw, kc=at(kS,2.6*tw,0), W=2.4*tw, D=1.7*tw, H=Yb(104)-Yb(0), y0=SHARED.groundY(kc.x,kc.z), G=new THREE.Group(); G.position.set(kc.x,y0,kc.z); G.rotation.y=ry; scene.add(G);
      const RED=new THREE.MeshLambertMaterial({color:0x7a1e26}), TRIM=new THREE.MeshLambertMaterial({color:0xc9a24a}), DARK=new THREE.MeshLambertMaterial({color:0x1c1416});
      const bx=(w,h,d,m,x,y,z)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; G.add(me); return me; };
      bx(W,H,.08*tw,RED,0,H/2,-D/2); for(const sx of [-1,1])bx(.08*tw,H,D,RED,sx*W/2,H/2,0);
      bx(W,H*.42,.1*tw,RED,0,H*.21,D/2); bx(W*1.04,.06*tw,.42*tw,TRIM,0,H*.43,D/2+.1*tw); bx(W*1.12,.1*tw,D*1.2,DARK,0,H+.05*tw,.08*tw); bx(W*1.12,.03*tw,D*1.2,TRIM,0,H,.08*tw);
      for(const sx of [-1,1])bx(.07*tw,H*.58,.07*tw,TRIM,sx*(W/2-.04*tw),H*.71,D/2);
      const sg=canv(512,128); { const g=sg.g; g.fillStyle='#5a0f16'; g.fillRect(0,0,512,128); g.strokeStyle='#e8c060'; g.lineWidth=6; g.strokeRect(6,6,500,116); g.fillStyle='#ffd77a'; g.textAlign='center'; g.textBaseline='middle'; fit(g,'BOX OFFICE',440,78); g.fillText('BOX OFFICE',256,66); sg.tex.needsUpdate=true; }
      const sign_=new THREE.Mesh(new THREE.BoxGeometry(W*.9,W*.9/4,.1*tw),[DARK,DARK,DARK,DARK,new THREE.MeshBasicMaterial({map:sg.tex}),DARK]); sign_.position.set(0,H+.1*tw+W*.9/8,D/2-.1*tw); G.add(sign_);
      const sc=canv(612,400), scr=new THREE.Mesh(new THREE.PlaneGeometry(W*.78,W*.78*400/612),new THREE.MeshBasicMaterial({map:sc.tex})); scr.position.set(0,H*.68,-D/2+.06*tw); G.add(scr);
      bx(W*.82,W*.78*400/612+.08*tw,.04*tw,DARK,0,H*.68,-D/2+.03*tw);
      box_o={G,sc,key:'',x:kc.x,z:kc.z,ox,oz};
      const c4=[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2+.2*tw],[-W/2,D/2+.2*tw]].map(([x,z])=>new THREE.Vector3(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),ry).add(kc));
      const r4=[Math.min(...c4.map(v=>v.x)),Math.min(...c4.map(v=>v.z)),Math.max(...c4.map(v=>v.x)),Math.max(...c4.map(v=>v.z))]; SOL.up.push(r4); }
    SIGNS.list.push({me:box,name:'THEATRE MARQUEE',place:'street',get:()=>({text:ovr.text,bri:ovr.bri,col:ovr.col}),
      set:o=>{ ovr.text=o&&o.text!=null?o.text:null; ovr.bri=o&&o.bri!=null?o.bri:null; ovr.col=o&&o.col!=null?o.col:null;
        const c=new THREE.Color(ovr.col||'#ffffff').multiplyScalar(ovr.bri==null?1:ovr.bri); for(const i of [0,1,4]){ const mm=box.material[i]; if(mm&&mm.color)mm.color.copy(c); } canopy.key=''; sign(); }});
    sign(); };
  const sign=()=>{ if(canopy){ const k=lines().join('|'); if(k!==canopy.key){ canopy.key=k; drawCanopy(); } }
    if(post){ const k=posterSrc()+'|'+title()+'|'+own('poster'); if(k!==post.key){ post.key=k; drawPoster(); } }
    if(box_o){ const k=CINEMA.upcoming(1)[0].start+'|'+ytOn(); if(k!==box_o.key){ box_o.key=k; CINEMA.drawTimes(box_o.sc.g,box_o.sc.cv.width,box_o.sc.cv.height); box_o.sc.tex.needsUpdate=true; } }
    if(times){ const k=CINEMA.upcoming(1)[0].start+'|'+ytOn(); if(k!==times.key){ times.key=k; CINEMA.drawTimes(times.g,times.cv.width,times.cv.height); times.tex.needsUpdate=true; } } };
  // the showtimes, as the board by the door and the box office's screen draw them: the film on now and the next ones, in the viewer's own time
  CINEMA.drawTimes=(g,W,H,n=6)=>{ const L=CINEMA.upcoming(n), P=CINEMA.playing(), hm=t=>new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}).toUpperCase();
    g.fillStyle='#0b0c10'; g.fillRect(0,0,W,H); g.fillStyle='#d8a845'; g.fillRect(0,0,W,H*.15); g.fillStyle='#0b0c10'; g.textAlign='center'; g.textBaseline='middle'; fit(g,'SHOWTIMES',W*.8,H*.1); g.fillText('SHOWTIMES',W/2,H*.075);
    const rh=(H*.83)/n; L.forEach((f,i)=>{ const y=H*.17+rh*(i+.5), now=i===0&&P&&!P.yt&&P.id===f.id; g.fillStyle=now?'#2a1e10':i%2?'#111318':'#0d0f13'; g.fillRect(0,y-rh/2,W,rh);
      g.textAlign='left'; g.fillStyle=now?'#ffcf6a':'#e8e4da'; fit(g,now?'NOW':hm(f.start),W*.24,rh*.5); g.fillText(now?'NOW':hm(f.start),W*.04,y);
      g.fillStyle=now?'#ffcf6a':'#c9c3b6'; fit(g,f.title+' ('+f.year+')',W*.66,rh*.44); g.fillText(f.title+' ('+f.year+')',W*.3,y); }); };

  // double-click the screen: sound and the timeline for everyone, a YouTube link and the brightness for admins; admins also double-click the marquee and the poster
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const DLG='position:fixed;z-index:9;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,420px);max-height:86vh;overflow:auto;background:#141018;color:#f3e7dd;border:2px solid #bc923a;border-radius:12px;padding:16px;font:14px/1.5 system-ui';
  const BTN='font:600 13px system-ui;border:0;border-radius:6px;cursor:pointer;', RED=BTN+'background:#b22133;color:#fff;', DIM=BTN+'background:transparent;color:#c3a7a0;border:1px solid #3a2130;';
  const FLD='width:100%;box-sizing:border-box;font:inherit;background:#0e0a10;color:#f3e7dd;border:1px solid #3a2130;border-radius:6px;padding:7px';
  const LBL='display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#c3a7a0';
  const box_=()=>{ const d=document.createElement('div'); d.style.cssText=DLG; document.body.appendChild(d); for(const ev of ['keydown','keyup'])d.addEventListener(ev,e=>e.stopPropagation()); return d; };
  let dlg=null, edlg=null, tlT=0;
  const openMenu=async()=>{ '@later'; const a=await isAdmin(), c=cur(), yt=ytOn(), P=CINEMA.playing(); if(!dlg)dlg=box_();
    dlg.innerHTML=`<div style="font:600 18px system-ui;color:#d8a845;margin-bottom:4px">THE SCREEN${a?' · admin':''}</div><div style="color:#c3a7a0;margin-bottom:10px">${P?'NOW: '+esc(P.title)+(P.year?' ('+P.year+')':''):'BETWEEN SHOWINGS'}</div>
      <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #3a2130"><label><input id="cmsnd" type="checkbox" ${snd.on?'checked':''}> sound</label>
        <label style="display:block;margin-top:6px">Volume <span id="cmvv" style="color:#d8a845">${snd.vol}%</span><br><input id="cmv" type="range" min="0" max="100" value="${snd.vol}" style="width:100%"></label>
        <label style="display:block;margin-top:8px">Timeline <span id="cmtv" style="color:#d8a845">0:00 / 0:00</span>${a?'':' <span style="color:#8f7470;font-size:12px">(admins move it, for everyone)</span>'}<br><input id="cmt" type="range" min="0" max="1000" value="0" style="width:100%" ${a?'':'disabled'}></label></div>`+(a?`
      <label style="${LBL}">Play a YouTube link instead (for up to 4 hours)</label>
      <div style="display:flex;gap:6px;margin:4px 0 8px"><input id="cmu" placeholder="youtube.com/watch?v=..." style="${FLD};flex:1;min-width:0"><button id="cmplay" style="${RED}padding:0 12px">PLAY</button></div>
      ${yt?`<div style="margin-bottom:12px"><button id="cmsched" style="${DIM}padding:6px 10px">BACK TO THE SCHEDULE</button></div>`:''}
      <div style="margin-bottom:10px"><label style="flex:1;min-width:120px">Brightness <span id="cmbv" style="color:#d8a845">${Math.round((c.brightness??.8)*100)}%</span><br><input id="cmb" type="range" min="20" max="120" value="${Math.round((c.brightness??.8)*100)}" style="width:100%"></label></div>
`:'')+`
      <div style="display:flex;justify-content:flex-end;margin-top:10px"><button id="cmclose" style="${DIM}padding:8px 14px">CLOSE</button></div>
      <div id="cmsay" style="color:#8f7470;font-size:12px;margin-top:8px"></div>`;
    const $=s=>dlg.querySelector(s), say=t=>{ $('#cmsay').textContent=t; };
    $('#cmsnd').onchange=e=>CINEMA.sound(e.target.checked,null); $('#cmv').oninput=e=>{ $('#cmvv').textContent=e.target.value+'%'; CINEMA.sound(null,+e.target.value); };
    $('#cmclose').onclick=()=>{ dlg.style.display='none'; if(tlT){ clearInterval(tlT); tlT=0; } };
    const fmt=s=>{ s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }, F_=()=>!ytOn()&&film(), dur=()=>{ const f=F_(); if(f)return f.f.len; try{ return player&&player.getDuration?player.getDuration()||0:0; }catch(e){ return 0; } }; let drag=false;
    if(tlT)clearInterval(tlT); tlT=setInterval(()=>{ if(dlg.style.display==='none'){ clearInterval(tlT); tlT=0; return; } const d=dur(); let t=0; const f=F_(); if(f)t=f.off; else try{ t=player&&player.getCurrentTime?player.getCurrentTime()||0:0; }catch(e){}
      if(!drag&&d)$('#cmt').value=Math.round(t/d*1000); $('#cmtv').textContent=fmt(t)+' / '+fmt(d); },500);
    $('#cmt').oninput=e=>{ drag=true; const d=dur(); $('#cmtv').textContent=fmt(+e.target.value/1000*d)+' / '+fmt(d); };
    $('#cmt').onchange=async e=>{ drag=false; if(!a||F_())return; const sec=+e.target.value/1000*dur(); try{ player.seekTo(sec,true); }catch(x){} say('...'); say(await push({started_at:new Date(Date.now()-sec*1000).toISOString()})?'moved for everyone':'could not'); };
    if(a){ $('#cmb').oninput=e=>$('#cmbv').textContent=e.target.value+'%'; $('#cmb').onchange=e=>push({brightness:+e.target.value/100});
      if($('#cmsched'))$('#cmsched').onclick=async()=>{ say('...'); say(await push({video_id:''})?'back to the schedule':'could not'); };
      $('#cmplay').onclick=async()=>{ const id=vid($('#cmu').value); if(!id){ say('not a YouTube link'); return; } say('...'); say(await push({video_id:id,started_at:new Date().toISOString()})?'playing for everyone':'could not save (log in as admin)'); };
    }
    dlg.style.display='block'; };
  CINEMA.openMenu=openMenu;
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
    for(const [x,z] of m.exits||[]){ const hb=new THREE.Mesh(new THREE.BoxGeometry(.5*TILE,2.4*TILE,1.2*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,1.2*TILE,z); scene.add(hb); UI.thing({name:'EXIT',ghost:1,obj:hb,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act:()=>STORE.exit('theatre')}); }
    buildSigns(m); buildHole(m); };

  window.CINEMA=CINEMA; SYS.add('places',()=>{ mkCut(); attach(); tick(); },'059f-cinema');
  (async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,250)); await LOAD('later'); isAdmin().then(a=>{ CINEMA.admin=!!a; }); pull(); setInterval(()=>{ if(document.visibilityState!=='hidden')pull(); },5000); })();   // after the start, so the later chunk is not pulled in early
}
