// THE CINEMA: the movie theatre screen plays a schedule of public-domain films (the Internet Archive's) at the same moment for everyone, or a YouTube link an admin puts on; its marquee and poster outside follow it.
import {SHARED, THREE} from './003-shx.js';
import {BUGS, CINEMA, FORAGE, INV, LITE, pos, PS2, SIGNS, TEXT, UI} from './003b-systems.js';
import {renderer, scene, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {FADE, SOL, STORE, SYS, TILE} from './006-map-pre.js';

{ const ROW='theatre';
  const vid=u=>{ u=String(u||'').trim(); const m=/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(u)||/^([A-Za-z0-9_-]{11})$/.exec(u); return m?m[1]:''; };

  // the schedule: free films one after another from a fixed start, each in a slot of its length and a short break rounded up to the quarter hour (so everyone sees the same showing)
  const FILMS=[['his_girl_friday','his_girl_friday.mp4','HIS GIRL FRIDAY',1940,5505],['house_on_haunted_hill_ipod','house_on_haunted_hill.mp4','HOUSE ON HAUNTED HILL',1959,4483],
    ['TheGeneral1926','The_General_1926_720p.mp4','THE GENERAL',1926,4732],['gullivers_travels1939','gullivers_travels1939.mp4',"GULLIVER'S TRAVELS",1939,4360],
    ['dressed_to_kill','dressed_to_kill.mp4','DRESSED TO KILL',1946,4290],['Killers_from_space','Killers_from_space.mp4','KILLERS FROM SPACE',1954,4255],
    ['lost_world','lost_world.mp4','THE LOST WORLD',1925,4085],['TheStranger_0','The_Stranger.mp4','THE STRANGER',1946,5473],
    ['my_favorite_brunette','my_favorite_brunette.mp4','MY FAVORITE BRUNETTE',1947,5212],['suddenly','suddenly.mp4','SUDDENLY',1954,4533],
    ['ThePhantomoftheOpera','Phantom_of_the_Opera_512kb.mp4','THE PHANTOM OF THE OPERA',1925,6389],['DasKabinettdesDoktorCaligariTheCabinetofDrCaligari','The_Cabinet_of_Dr._Caligari_512kb.mp4','THE CABINET OF DR. CALIGARI',1919,3061]]
    .map(([id,file,title,year,len])=>({id,file,title,year,len,slot:Math.ceil((len+600)/900)*900}));
  const EPOCH=Date.UTC(2026,9,28);
  // the playlist: an admin's own list from the screen's menu (shared, on the screen's record), else the free films above
  let plK='', PL=FILMS, CYCLE=0; const slotOf=len=>Math.ceil((len+600)/900)*900;
  const list=()=>{ '@later'; const p=cur().playlist, k=JSON.stringify(p||null); if(k!==plK){ plK=k; PL=Array.isArray(p)&&p.filter(f=>f&&f.id&&f.file&&f.len>0).length?p.filter(f=>f&&f.id&&f.file&&f.len>0).map(f=>({id:f.id,file:f.file,title:String(f.title||f.id).toUpperCase(),year:f.year||'',len:+f.len,slot:slotOf(+f.len)})):FILMS; CYCLE=PL.reduce((a,f)=>a+f.slot,0)*1000; } return PL; };
  const showAt=t=>{ const L=list(), k=Math.floor((t-EPOCH)/CYCLE), r=t-EPOCH-k*CYCLE; let s0=EPOCH+k*CYCLE, a=0; for(let i=0;i<L.length;i++){ const f=L[i]; if(r<a+f.slot*1000)return {i,f,start:s0+a}; a+=f.slot*1000; } return {i:0,f:L[0],start:s0}; };
  CINEMA.films=FILMS; CINEMA.list=()=>list(); CINEMA.showAt=showAt;
  CINEMA.upcoming=(n=6,t=Date.now())=>{ const o=[]; let s=showAt(t); for(let k=0;k<Math.min(n,list().length*2);k++){ o.push({title:s.f.title,year:s.f.year,id:s.f.id,start:s.start,end:s.start+s.f.len*1000}); s=showAt(s.start+s.f.slot*1000+1); } return o; };
  // a YouTube link an admin plays takes over for up to four hours, then the schedule comes back
  const ytOn=()=>{ const c=cur(); return !!vid(c.video_id)&&!!c.started_at&&Date.now()-Date.parse(c.started_at)<4*3600e3; };
  const film=()=>{ const s=showAt(Date.now()), off=(Date.now()-s.start)/1000; return off<s.f.len?{...s,off}:null; };
  CINEMA.playing=()=>{ if(ytOn())return {yt:true,title:CINEMA.ytTitle||''}; const f=film(); return f?{title:f.f.title,year:f.f.year,id:f.f.id}:null; };
  let rec=null, adm=null, titleId='';
  const DEF={id:ROW,playlist:[],idx:0,video_id:'',started_at:null,size:1,brightness:.8,loop:true,autoplay:true,marquee:'',poster:''};
  const cur=()=>rec||DEF; CINEMA.now=()=>cur(); CINEMA.title=''; CINEMA._set=r=>{ rec=r; onRec(); };

  const pull=async()=>{ if(location.protocol==='file:')return; try{ const r=await fetch('/now'); if(!r.ok)return;
    const a=await r.json(); rec=a[0]||null; onRec(); }catch(e){} };
  const push=async patch=>{ '@later'; if(!BUGS.sb)return false; try{   // the site's one client to the server (136a)
    const r=await BUGS.sb('/rest/v1/now_playing?id=eq.'+ROW,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...patch,updated_at:new Date().toISOString()})});
    const a=await r.json(); if(a[0]){ rec=a[0]; onRec(); } return true; }catch(e){ return false; } };
  CINEMA.push=push;
  const isAdmin=async()=>{ if(adm!=null)return adm; try{ adm=!!(BUGS.owner&&await BUGS.owner()); }catch(e){ adm=false; } return adm; };
  CINEMA.isAdmin=isAdmin;

  const startMs=()=>{ const s=cur().started_at; return s?Date.parse(s):0; };
  const offset=()=>{ if(B)return B.live?0:Math.max(0,+B.off()||0); const s=startMs(); return s?Math.max(0,(Date.now()-s)/1000):0; };
  // another screen borrowing the player (the CRT TV): {id, live, off(), vol 0..1, me (a plane) or box {el, rect, radius}}, renewed each frame while it shows
  let B=null, lent=null, lentOk=false, lastMe=null, scan=null, sndK='';
  CINEMA.lend=r=>{ lent={...r,age:0}; return {ok:lentOk,fail:!!vFail}; };

  // sound is each viewer's own (browsers only let it on after a tap)
  let snd={on:false,vol:80}; try{ const s=JSON.parse(SAVE.get('cinema')||'null'); if(s)snd={on:!!s.on,vol:Math.max(0,Math.min(100,+s.vol||80))}; }catch(e){}
  const saveSnd=()=>{ SAVE.set('cinema',JSON.stringify(snd)); };
  let vf=1, fv=null; const applySnd=()=>{ try{ if(player){ if(snd.on){ player.unMute(); player.setVolume(Math.round(B?B.vol*100:snd.vol*vf)); } else player.mute(); } }catch(e){} if(fv){ fv.muted=!snd.on; fv.volume=Math.min(1,B?B.vol:snd.vol*vf/100); } };
  CINEMA.sound=(on,vol)=>{ if(on!=null)snd.on=!!on; if(vol!=null)snd.vol=Math.max(0,Math.min(100,+vol)); saveSnd(); applySnd(); };

  // the player is a 16:9 page behind the game's picture, seen only through the screen (the picture is see-through there); the clip keeps it inside the game's frame
  const W0=1280, H0=720, HCSS='position:absolute;left:0;top:-10px;width:100%;height:calc(100% + 20px)';
  let clip=null, wrap=null, holder=null, player=null, soundBtn=null, haveVid='', ytP=null, making=false;
  const ensureYT=()=>ytP||(ytP=new Promise(res=>{ if(window.YT&&window.YT.Player)return res(); const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{ try{ prev&&prev(); }catch(e){} res(); }; const s=document.createElement('script'); s.src='https://www.youtube.com/iframe_api'; s.async=1; document.head.appendChild(s); }));
  const mkWrap=()=>{ '@later'; if(wrap)return; clip=document.createElement('div'); clip.id='cinema';
    clip.style.cssText='position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none;display:none';
    wrap=document.createElement('div'); wrap.style.cssText='position:absolute;left:0;top:0;width:'+W0+'px;height:'+H0+'px;transform-origin:0 0;overflow:hidden;background:#000;will-change:transform';
    holder=document.createElement('div'); holder.style.cssText=HCSS; wrap.appendChild(holder);
    if(!document.getElementById('cinema-css')){ const st=document.createElement('style'); st.id='cinema-css'; st.textContent='@keyframes cmgrain{0%{background-position:0 0}20%{background-position:-61px 37px}40%{background-position:43px -83px}60%{background-position:-97px -21px}80%{background-position:71px 89px}100%{background-position:0 0}}@keyframes cmflick{0%,100%{opacity:.02}13%{opacity:.05}27%{opacity:.01}52%{opacity:.04}71%{opacity:.02}88%{opacity:.05}}'; document.head.appendChild(st); }
    const nz=document.createElement('canvas'); nz.width=nz.height=192; { const g=nz.getContext('2d'), d=g.createImageData(192,192); for(let i=0;i<d.data.length;i+=4){ const v=Math.random()*255|0; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255; } g.putImageData(d,0,0); }
    const lay=css=>{ const d=document.createElement('div'); d.style.cssText='position:absolute;inset:0;pointer-events:none;'+css; wrap.appendChild(d); return d; };
    lay('background:radial-gradient(circle,rgba(0,0,0,.28) .8px,rgba(0,0,0,0) 1.4px) 0 0/5px 5px;opacity:.3');
    lay('background:url('+nz.toDataURL()+') 0 0/384px 384px;mix-blend-mode:overlay;opacity:.07;animation:cmgrain .42s steps(1) infinite');
    lay('background:radial-gradient(ellipse 60% 55% at 50% 47%,rgba(255,246,228,0) 0%,rgba(0,0,0,0) 55%,rgba(0,0,0,.5) 100%);box-shadow:inset 0 0 90px 18px rgba(0,0,0,.6)');
    lay('background:#000;animation:cmflick 2.3s steps(1) infinite');
    scan=lay('background:repeating-linear-gradient(0deg,rgba(0,0,0,.32) 0 1px,rgba(0,0,0,0) 1px 3px);display:none');
    soundBtn=document.createElement('button'); soundBtn.textContent='🔇 tap for sound';
    soundBtn.style.cssText='position:fixed;left:0;top:0;transform:translate(-50%,-100%);display:none;z-index:62;pointer-events:auto;font:600 13px system-ui;color:#fff;background:rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.4);border-radius:999px;padding:6px 14px;cursor:pointer';
    soundBtn.onclick=()=>CINEMA.sound(true,null); document.body.appendChild(soundBtn);
    fv=document.createElement('video'); fv.muted=true; fv.playsInline=true; fv.preload='auto'; fv.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:fill;background:#000;display:none'; wrap.insertBefore(fv,wrap.firstChild);
    clip.appendChild(wrap); const stg=document.getElementById('stage')||document.body; stg.insertBefore(clip,stg.firstChild); };
  // the scheduled film: its file from the Internet Archive, kept at the showing's moment
  let fvSrc='', fvSync=0;
  const playFilm=f=>{ '@later'; const src=(location.protocol==='file:'?'https://archive.org/download/':'/film/')+f.f.id+'/'+f.f.file; holder.style.display='none'; fv.style.display='block'; try{ player&&player.pauseVideo(); }catch(e){}
    if(fvSrc!==src){ fvSrc=src; fv.src=src; fv.currentTime=f.off; applySnd(); }
    const now=performance.now(); if(now-fvSync>1000){ fvSync=now; if(fv.paused)fv.play().catch(()=>{});
      if(fv.readyState>0&&!fv.seeking){ const d=f.off-fv.currentTime; if(Math.abs(d)>5){ fv.playbackRate=1; fv.currentTime=f.off+(fv.readyState<3?3:1); } else fv.playbackRate=Math.abs(d)<.3?1:1+Math.max(-.1,Math.min(.1,d*.05)); } } return fv.readyState>=2; };
  const stopFilm=()=>{ if(fv&&!fv.paused)fv.pause(); if(fv)fv.style.display='none'; if(holder)holder.style.display=''; };
  let vOK=false, vFail='', tries=0, t0=0; const HOSTS=['https://www.youtube-nocookie.com','https://www.youtube.com'];
  const makePlayer=async id=>{ '@later'; mkWrap();
    if(player){ if(id!==haveVid){ haveVid=id; vOK=false; vFail=''; tries=0; t0=performance.now(); try{ player.loadVideoById(B&&B.live?{videoId:id}:{videoId:id,startSeconds:offset()}); }catch(e){} }
      else if(!vOK&&!vFail&&performance.now()-t0>15000)retry(id); return; }
    if(making)return; making=true; await ensureYT(); haveVid=id; vOK=false; t0=performance.now();
    player=new window.YT.Player(holder,{videoId:id,host:HOSTS[Math.min(tries,HOSTS.length-1)],width:'100%',height:'100%',
      playerVars:{autoplay:1,mute:1,controls:0,rel:0,playsinline:1,modestbranding:1,disablekb:1,fs:0,iv_load_policy:3,cc_load_policy:0,origin:location.origin},
      events:{onReady:e=>{ try{ e.target.mute(); if(!(B&&B.live))e.target.seekTo(offset(),true); e.target.playVideo(); e.target.unloadModule('captions'); e.target.unloadModule('cc'); }catch(x){} applySnd(); },
        onStateChange:e=>{ if(e.data===1){ vOK=true; vFail=''; } if(e.data===window.YT.PlayerState.ENDED)onEnded(); },
        onError:e=>{ if(e.data===101||e.data===150)vFail='this video only plays on YouTube'; else retry(haveVid); }}}); };
  const retry=id=>{ '@later'; if(tries>=HOSTS.length-1){ if(!vOK)vFail=vFail||'the video could not load here'; return; } tries++; try{ player.destroy(); }catch(e){} player=null; making=false;
    holder=document.createElement('div'); holder.style.cssText=HCSS; wrap.insertBefore(holder,wrap.firstChild); makePlayer(id); };
  const onEnded=async()=>{ if(adm&&!B)await push({video_id:''}); };   // a YouTube link played to its end: back to the schedule

  // the four corners of a plane on the page, and a homography that maps the video's own rectangle (no black bars) onto them
  // an edge of the screen past the camera would fold the picture: only the part in front of the camera is mapped (s: that part of the screen, 0..1 across and down)
  const corners=me=>{ '@later'; const g=me.geometry.parameters, r=renderer.domElement.getBoundingClientRect(), C=SHARED.cam; me.updateMatrixWorld(); C.updateMatrixWorld(); const V=new THREE.Vector3();
    const zc=(sx,sy)=>V.set(sx*g.width/2,sy*g.height/2,0).applyMatrix4(me.matrixWorld).applyMatrix4(C.matrixWorldInverse).z;
    let a=-1, b=1, c=-1, d=1; if(!C.isOrthographicCamera){ const z0=zc(0,0), zx=zc(1,0)-z0, zy=zc(0,1)-z0, m=-(C.near*2+.02*TILE);
      const cut=(k,o,lo,hi)=>{ const t=(m-z0-Math.abs(o))/k; return k>0?[lo,Math.min(hi,t)]:k<0?[Math.max(lo,t),hi]:z0+Math.abs(o)<m?[lo,hi]:[1,-1]; };
      if(Math.abs(zx)>=Math.abs(zy))[a,b]=cut(zx,zy,-1,1); else [c,d]=cut(zy,zx,-1,1); if(!(b>a&&d>c))return null; }
    const P=(sx,sy)=>{ V.set(sx*g.width/2,sy*g.height/2,0).applyMatrix4(me.matrixWorld).project(C); return {x:(V.x+1)/2*r.width,y:(1-V.y)/2*r.height,u:(V.x+1)/2,v:(V.y+1)/2}; };
    return {r,q:[P(a,d),P(b,d),P(b,c),P(a,c)],s:[(a+1)/2,(b+1)/2,(1-d)/2,(1-c)/2]}; };
  const coef=(p0,p1,p2,p3)=>{ '@later'; const dx1=p1.x-p2.x, dx2=p3.x-p2.x, dx3=p0.x-p1.x+p2.x-p3.x, dy1=p1.y-p2.y, dy2=p3.y-p2.y, dy3=p0.y-p1.y+p2.y-p3.y; let g=0, h=0;
    if(Math.abs(dx3)>1e-6||Math.abs(dy3)>1e-6){ const det=(dx1*dy2-dx2*dy1)||1e-9; g=(dx3*dy2-dx2*dy3)/det; h=(dx1*dy3-dx3*dy1)/det; }
    return [p1.x-p0.x+g*p1.x,p3.x-p0.x+h*p3.x,p0.x,p1.y-p0.y+g*p1.y,p3.y-p0.y+h*p3.y,p0.y,g,h]; };
  const ap=(k,u,v)=>{ const w=k[6]*u+k[7]*v+1; return {x:(k[0]*u+k[1]*v+k[2])/w,y:(k[3]*u+k[4]*v+k[5])/w}; };
  const m3d=k=>'matrix3d('+[k[0]/W0,k[3]/W0,0,k[6]/W0, k[1]/H0,k[4]/H0,0,k[7]/H0, 0,0,1,0, k[2],k[5],0,1].map(v=>+v.toFixed(6)).join(',')+')';
  let aspect=16/9, aspId='';
  const sniff=id=>{ '@later'; if(aspId===id)return; aspId=id; aspect=16/9; ytCol=null; if(location.protocol==='file:')return; const im=new Image();
    im.onload=()=>{ try{ const c=document.createElement('canvas'), w=c.width=im.width, h=c.height=im.height, g=c.getContext('2d'); g.drawImage(im,0,0); const d=g.getImageData(0,0,w,h).data; { let r=0,gg=0,b=0; for(let i=0;i<d.length;i+=16){ r+=d[i]; gg+=d[i+1]; b+=d[i+2]; } const n=d.length/16*255; if(aspId===id)ytCol=[r/n,gg/n,b/n]; }
      const dark=(x0,y0,x1,y1)=>{ let m=0; for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){ const i=(y*w+x)*4; m=Math.max(m,d[i],d[i+1],d[i+2]); } return m<26; };
      let t=0, b=0, l=0, r=0; while(t<h/2&&dark(0,t,w,t+1))t++; while(b<h/2&&dark(0,h-1-b,w,h-b))b++; while(l<w/2&&dark(l,0,l+1,h))l++; while(r<w/2&&dark(w-1-r,0,w-r,h))r++;
      const cw=w-l-r, ch=h-t-b; if(aspId===id&&cw>w*.3&&ch>h*.3)aspect=Math.max(.45,Math.min(2.6,cw/ch)); }catch(e){} }; im.src='/yt/'+id+'.jpg'; };
  const vrect=()=>aspect>=W0/H0?{x:0,y:(H0-W0/aspect)/2,w:W0,h:W0/aspect}:{x:(W0-H0*aspect)/2,y:0,w:H0*aspect,h:H0};
  const placeOver=(me,dim=1,ok=true)=>{ '@later'; const cq=corners(me); if(!cq){ clip.style.display='none'; soundBtn.style.display='none'; if(CUT)CUT.uniforms.uOn.value=0; if(PS2.keepAlpha)PS2.keepAlpha(false); return; }
    const {r,q,s}=cq, cv=renderer.domElement, k0=coef(q[0],q[1],q[2],q[3]), V=fv&&fv.style.display==='block'?{x:0,y:0,w:W0,h:H0}:vrect(), at=(u,v)=>ap(k0,(u-s[0])/(s[1]-s[0]),(v-s[2])/(s[3]-s[2]));
    clip.style.left=r.left+'px'; clip.style.top=r.top+'px'; clip.style.width=r.width+'px'; clip.style.height=r.height+'px'; clip.style.borderRadius=getComputedStyle(cv.parentElement||cv).borderRadius;
    const u0=-V.x/V.w, u1=(W0-V.x)/V.w, v0=-V.y/V.h, v1=(H0-V.y)/V.h;
    wrap.style.transform=m3d(coef(at(u0,v0),at(u1,v0),at(u1,v1),at(u0,v1))); wrap.style.filter='brightness('+((B?1:(cur().brightness??.8))*dim)+') contrast(1.08) saturate(1.02) blur(.4px)';
    if(PS2.keepAlpha)PS2.keepAlpha(ok); if(CUT){ CUT.uniforms.uOn.value=ok?1:0; q.forEach((p,i)=>CUT.uniforms.uQ.value[i].set(p.u,p.v)); }
    const wait=!ok&&!vFail;   // the film still on its way: say so on the screen
    soundBtn.textContent=vFail?(B?'NO SIGNAL':vFail.toUpperCase()):wait?(B?'TUNING IN…':'LOADING FILM…'):'🔇 tap for sound'; soundBtn.style.pointerEvents=vFail||wait?'none':'auto';
    if(vFail||wait||ok&&!snd.on){ const b=at(.5,wait?(s[2]+s[3])/2:Math.min(1,s[3])); soundBtn.style.display='block'; soundBtn.style.left=(r.left+b.x)+'px'; soundBtn.style.top=(r.top+b.y-(wait?-16:6))+'px'; } else soundBtn.style.display='none'; };
  // the screen's see-through face (the video shows through it, darker at its edges) and the last pass that keeps the rest of the picture solid
  const HOLE=new THREE.ShaderMaterial({blending:THREE.NoBlending,depthWrite:true,vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'varying vec2 vU; void main(){ vec2 d=(vU-.5)*vec2(1.,1.12); float v=smoothstep(.12,.62,length(d)); float a=.04+.45*v*v; gl_FragColor=vec4(0.,0.,0.,a); }'});
  CINEMA.HOLE=HOLE;
  let CUT=null;
  const CUTH='uniform float uOn; uniform vec2 uQ[4]; float cutS(vec2 a,vec2 b,vec2 p){ return (b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x); }',
    CUTC='{ vec4 c=gl_FragColor; float a=1.; vec3 rgb=c.rgb; if(uOn>.5){ float s0=cutS(uQ[0],uQ[1],vUv), s1=cutS(uQ[1],uQ[2],vUv), s2=cutS(uQ[2],uQ[3],vUv), s3=cutS(uQ[3],uQ[0],vUv); if((s0>=0.&&s1>=0.&&s2>=0.&&s3>=0.)||(s0<=0.&&s1<=0.&&s2<=0.&&s3<=0.)){ a=c.a; if(a<.99)rgb=vec3(0.); } } gl_FragColor=vec4(rgb,a); }';
  const mkCut=()=>{ if(CUT||!SHARED.composer)return; CUT=new ShaderPass({uniforms:{tDiffuse:{value:null},uOn:{value:0},uQ:{value:[0,1,2,3].map(()=>new THREE.Vector2())}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'uniform sampler2D tDiffuse; varying vec2 vUv; '+CUTH+'\nvoid main(){ gl_FragColor=texture2D(tDiffuse,vUv); '+CUTC+' }'});
    SHARED.composer.addPass(CUT); SHARED.fold('cut',CUT,{head:CUTH,code:CUTC,uniforms:{uOn:CUT.uniforms.uOn,uQ:CUT.uniforms.uQ}}); };
  const facing=me=>{ me.updateMatrixWorld(); const n=new THREE.Vector3(0,0,1).transformDirection(me.matrixWorld), p=new THREE.Vector3().setFromMatrixPosition(me.matrixWorld); return n.dot(new THREE.Vector3().subVectors(SHARED.cam.position,p))>0; };

  // the screen's see-through face, the whole screen, and a double-click on it for the settings
  let holeM=null, lgt=null;
  // the room lit by the picture: its average colour, read a few times a second (a film from our own site; a YouTube picture can't be read, so its poster's colour)
  const LC=new THREE.Color(0,0,0), LT=new THREE.Color(); let lsT=0, scv=null, ytCol=null;
  const glow=(on,fl)=>{ '@later'; if(!lgt)return; const now=performance.now();
    if(!on)LT.setRGB(0,0,0); else if(now-lsT>100){ lsT=now; let c=null;
      if(fl&&fv&&fv.readyState>=2)try{ scv=scv||Object.assign(document.createElement('canvas'),{width:8,height:5}); const g=scv.getContext('2d',{willReadFrequently:true}); g.drawImage(fv,0,0,8,5); const d=g.getImageData(0,0,8,5).data; let r=0,gg=0,b=0; for(let i=0;i<d.length;i+=4){ r+=d[i]; gg+=d[i+1]; b+=d[i+2]; } const n=d.length/4*255; c=[r/n,gg/n,b/n]; }catch(e){ c=null; }
      c=c||ytCol||[.45,.47,.55]; LT.setRGB(c[0],c[1],c[2]).convertSRGBToLinear(); }
    LC.lerp(LT,.12); const m=Math.max(LC.r,LC.g,LC.b); if(m<.004){ lgt.intensity=0; return; } lgt.color.setRGB(LC.r/m,LC.g/m,LC.b/m); lgt.intensity=9*Math.sqrt(m)*(cur().brightness??.8); };
  // full screen: the picture over the whole page, the game behind it
  let full=false, xBtn=null;
  CINEMA.fullscreen=on=>{ '@later'; full=!!on; mkWrap();
    if(!xBtn){ xBtn=document.createElement('button'); xBtn.textContent='✕ LEAVE FULL SCREEN'; xBtn.style.cssText='position:fixed;right:16px;top:16px;z-index:62;display:none;font:600 13px system-ui;color:#fff;background:rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.4);border-radius:999px;padding:6px 14px;cursor:pointer'; xBtn.onclick=()=>CINEMA.fullscreen(false); document.body.appendChild(xBtn); }
    clip.style.position=full?'fixed':'absolute'; clip.style.zIndex=full?'60':''; clip.style.background=full?'#000':''; xBtn.style.display=full?'block':'none';
    if(full)document.body.appendChild(clip); else { const stg=document.getElementById('stage')||document.body; stg.insertBefore(clip,stg.firstChild); }
    try{ if(full&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{}); else if(!full&&document.fullscreenElement)document.exitFullscreen().catch(()=>{}); }catch(e){} };
  CINEMA.isFull=()=>full; CINEMA.light=()=>lgt;
  document.addEventListener('fullscreenchange',()=>{ if(!document.fullscreenElement&&full)CINEMA.fullscreen(false); });
  const fullPlace=()=>{ '@later'; const W=innerWidth, H=innerHeight, V=fv&&fv.style.display==='block'?{x:0,y:0,w:W0,h:H0}:vrect(), k=Math.min(W/V.w,H/V.h);
    Object.assign(clip.style,{display:'block',left:'0px',top:'0px',width:W+'px',height:H+'px',borderRadius:'0'});
    wrap.style.transform='translate('+((W-V.w*k)/2-V.x*k)+'px,'+((H-V.h*k)/2-V.y*k)+'px) scale('+k+')'; wrap.style.filter='none';
    if(CUT)CUT.uniforms.uOn.value=0; if(PS2.keepAlpha)PS2.keepAlpha(false);
    if(vFail||!snd.on){ soundBtn.textContent=vFail?vFail.toUpperCase():'🔇 tap for sound'; Object.assign(soundBtn.style,{display:'block',left:W/2+'px',top:(H-16)+'px'}); } else soundBtn.style.display='none'; };
  const buildHole=m=>{ '@later'; if(holeM)return; const fm=m.fm; fm.updateMatrixWorld(); const w=fm.geometry.parameters.width/2, h=fm.geometry.parameters.height/2, N=new THREE.Vector3(0,0,1).transformDirection(fm.matrixWorld);
    holeM=new THREE.Mesh(new THREE.PlaneGeometry(1,1),HOLE);
    lgt=new THREE.PointLight(0xffffff,0,w*7,1.2); lgt.userData.in=()=>CINEMA.on; lgt.position.setFromMatrixPosition(fm.matrixWorld).addScaledVector(N,w*.9); lgt.position.y-=h*.3; LITE.recs.push(lgt); holeM.quaternion.copy(fm.quaternion); holeM.position.setFromMatrixPosition(fm.matrixWorld).addScaledVector(N,.02); holeM.visible=false; holeM.u={w:w*2,h:h*2}; scene.add(holeM);
    const hb=new THREE.Mesh(new THREE.BoxGeometry(w*2,h*2,.3*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.quaternion.copy(fm.quaternion); hb.position.copy(holeM.position); scene.add(hb);
    UI.thing({name:'THE SCREEN',ghost:1,obj:hb,reach:40*TILE,near:40*TILE,tall:h*2,act:()=>openMenu()}); };
  const fitHole=()=>{ const u=holeM.u; holeM.scale.set(u.w,u.h,1); };

  let lastSync=0, adminThings=false;
  let signT=0;
  // the ticket fox stands at the box office window facing the street; the theatre's door takes a ticket (owner, 10 Nov 2026)
  CINEMA.EXT=1.1;   // how far the ground floor steps out from the building, in tiles (the street door is moved out with it)
  CINEMA.boxG=()=>box_o&&box_o.G; CINEMA.dbg=()=>({box:box_o&&[+box_o.x.toFixed(2),+box_o.z.toFixed(2),box_o.ox,box_o.oz],marquee:canopy&&canopy.box.position.toArray().map(v=>+v.toFixed(2)),neon:!!neon,fox:!!foxN});
  let foxN=null; CINEMA.toon=(k,N)=>{ if(k==='ticketfox'){ foxN=N; N.g.userData.seenOut=true; } };
  const fox=()=>{ const N=foxN; if(!N||!box_o||!N.st)return; const s=N.st, b=box_o, x=b.x-b.ox*.15*TILE, z=b.z-b.oz*.15*TILE;
    N.home={id:'ticketfox',x,z,r:0}; s.x=x; s.z=z; s.to=null; s.hold=true; s.face={x:x+b.ox*5*TILE,z:z+b.oz*5*TILE}; };
  let named=false;
  const gate=()=>{ '@later'; const n=INV.items&&INV.items.ticket|0, say=t=>FORAGE.say&&FORAGE.say(t);
    if(n>0){ INV.add('ticket',-1); if(FORAGE.draw)FORAGE.draw(); const P=CINEMA.playing(); say('YOU HAND OVER A TICKET'+(P&&P.title?' FOR '+P.title:'')+'.'); return true; }
    say('YOU NEED A TICKET. THE FOX AT THE BOX OFFICE SELLS THEM.'); return false; };
  const tick=()=>{ if(STORE.gate&&!STORE.gate.theatre)STORE.gate.theatre=gate; const mt=STORE.main&&STORE.main.theatre; CINEMA.on=false; if(lastMe)lastMe.visible=false; B=null; lentOk=false; const lb=lent&&lent.age++<3&&!FADE.busy?lent:null; if(lent&&lent.age>3)lent=null; if(!mt||!mt.fm){ if(lb)lendTick(lb); else idle(); return; } if(performance.now()-signT>5000){ signT=performance.now(); sign(); } fox();
    if(!named&&FORAGE.add){ named=true; FORAGE.add({names:{ticket:'MOVIE TICKET'},prices:{ticket:5}}); }
    const up=SHARED.LVL==='up'; if(canopy){ canopy.box.visible=up; } if(post){ post.group.visible=up; if(post.front)post.front.visible=up&&!mt.R.inside(pos.x,pos.z); } if(box_o)box_o.G.visible=up;
    if(neon){ neon.me.visible=neon.rail.visible=up; const t=performance.now(); if(up&&t>neon.t){ neon.on=!neon.on&&Math.random()<.45; neon.t=t+(neon.on?40+Math.random()*140:250+Math.random()*2800); neonShow(); } }
    if(CINEMA.admin&&!adminThings&&canopy&&post){ adminThings=true;
      UI.thing({name:'THE MARQUEE',ghost:1,obj:canopy.box,reach:2.2*TILE,near:6*TILE,tall:1,act:()=>editMarquee()});
      UI.thing({name:'THE POSTER',ghost:1,obj:post.group,reach:1.6*TILE,near:5*TILE,tall:1,act:()=>editPoster()}); }
    const yt=ytOn(), id=yt?vid(cur().video_id):'', fl=yt?null:film(), now=performance.now();
    const tgt=up&&holeM&&mt.R.inside(pos.x,pos.z)?holeM:null; if(holeM)holeM.visible=false;
    if((!tgt||!(id||fl))&&lb)return lendTick(lb);
    if(!tgt||!(id||fl)||FADE.busy){ idle(); return; }
    mkWrap(); mkCut(); unseat(); scan.style.display='none'; let ok;
    if(fl){ ok=playFilm(fl); vFail=''; } else { stopFilm(); makePlayer(id); sniff(id); ok=vOK&&!vFail; }
    CINEMA.on=ok; fitHole(); if(ok)tgt.visible=true;
    glow(ok,fl);
    if(full)fullPlace(); else if(facing(tgt)){ clip.style.display='block'; placeOver(tgt,1,ok); } else { clip.style.display='none'; soundBtn.style.display='none'; if(CUT)CUT.uniforms.uOn.value=0; if(PS2.keepAlpha)PS2.keepAlpha(false); }
    if(id)    sync(); };
  const idle=()=>{ if(CUT)CUT.uniforms.uOn.value=0; if(PS2.keepAlpha)PS2.keepAlpha(false); if(soundBtn)soundBtn.style.display='none'; if(full)CINEMA.fullscreen(false); glow(false); if(clip&&clip.style.display!=='none'){ clip.style.display='none'; try{ player&&player.pauseVideo(); }catch(e){} stopFilm(); } };
  // the player back on the game's page (it sits inside a borrower's close-up while that is open)
  const unseat=()=>{ if(!clip||full)return; const stg=document.getElementById('stage')||document.body; if(clip.parentNode!==stg){ stg.insertBefore(clip,stg.firstChild); clip.style.position='absolute'; clip.style.zIndex=''; } if(soundBtn.parentNode!==document.body)document.body.appendChild(soundBtn); };
  const boxPlace=(bx,ok)=>{ '@later'; const r=bx.rect, V=vrect(), k=Math.min(r.width/V.w,r.height/V.h); if(clip.parentNode!==bx.el){ bx.el.appendChild(clip); bx.el.appendChild(soundBtn); }
    Object.assign(clip.style,{position:'fixed',zIndex:'1',display:ok?'block':'none',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:bx.radius||'0'});
    wrap.style.transform='translate('+((r.width-V.w*k)/2-V.x*k)+'px,'+((r.height-V.h*k)/2-V.y*k)+'px) scale('+k+')'; wrap.style.filter='contrast(1.08) saturate(1.05) blur(.35px)'; if(CUT)CUT.uniforms.uOn.value=0; if(PS2.keepAlpha)PS2.keepAlpha(false);
    if(vFail||!ok||!snd.on){ soundBtn.textContent=vFail?'NO SIGNAL':!ok?'TUNING IN…':'🔇 tap for sound'; soundBtn.style.pointerEvents=ok&&!vFail?'auto':'none'; Object.assign(soundBtn.style,{display:'block',left:(r.left+r.width/2)+'px',top:(r.top+r.height-10)+'px'}); } else soundBtn.style.display='none'; };
  const lendTick=b=>{ '@later'; B=b; glow(false); if(full)CINEMA.fullscreen(false); mkWrap(); mkCut(); stopFilm(); makePlayer(b.id); sniff(b.id); const ok=lentOk=vOK&&!vFail, sk=b.vol+'|'+ok+'|'+b.id; if(sk!==sndK){ sndK=sk; applySnd(); } scan.style.display=b.crt?'':'none';
    if(b.box)boxPlace(b.box,ok); else { unseat(); lastMe=b.me; if(b.me&&facing(b.me)){ if(ok)b.me.visible=true; clip.style.display='block'; placeOver(b.me,b.dim||1,ok); } else { clip.style.display='none'; soundBtn.style.display='none'; if(CUT)CUT.uniforms.uOn.value=0; if(PS2.keepAlpha)PS2.keepAlpha(false); } }
    if(!b.live)sync(); };
  const sync=()=>{ '@later'; const now=performance.now(); if(now-lastSync>1500&&player&&player.getCurrentTime){ lastSync=now;
      try{ const is=player.getCurrentTime(), st=player.getPlayerState?player.getPlayerState():1;
        if(!B&&Date.now()<startMs()){ if(st===1)player.pauseVideo(); if(is>.5)player.seekTo(0,true); return; }
        if(st===3)return; const d=offset()-is;
        if(Math.abs(d)>6){ player.setPlaybackRate(1); player.seekTo(offset()+2,true); } else player.setPlaybackRate(Math.abs(d)<.6?1:d>0?1.25:.75);
        if(st!==1)player.playVideo(); }catch(e){} } };
  CINEMA.tick=tick;

  const onRec=()=>{ const id=vid(cur().video_id);
    if(id!==titleId){ titleId=id; CINEMA.title='';
      if(id)fetch('https://www.youtube.com/oembed?format=json&url=https://youtu.be/'+id).then(r=>r.ok?r.json():null).then(j=>{ if(j&&j.title){ CINEMA.ytTitle=j.title; sign(); } }).catch(()=>{}); }
    sign(); };

  // the front, THE FLEA PIT (owner, 10 Nov 2026): a hand-lettered marquee over the doors (the film's title unless an admin wrote its lines), a pink FLEA PIT neon with a dead letter, a crooked poster case
  let canopy=null, post=null, box_o=null, neon=null; const ovr={text:null,bri:null,col:null};
  const canv=(w,h)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const tex=new THREE.CanvasTexture(cv); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; tex.colorSpace=THREE.SRGBColorSpace; return {cv,g:cv.getContext('2d'),tex}; };
  const FACE='"Arial Narrow","Helvetica Neue",Arial,sans-serif';
  const fit=(g,t,maxW,px)=>{ let s=px; do{ g.font='900 '+Math.round(s)+'px '+FACE; s-=1; }while(g.measureText(t).width>maxW&&s>8); };
  const qz=v=>Math.min(255,Math.round(v/56)*56), nextF=()=>{ const P=CINEMA.playing(); return P&&!P.yt?P:CINEMA.upcoming(1)[0]; }, title=()=>(ytOn()?CINEMA.ytTitle||'THE STRANGEST CINEMA':nextF().title).toUpperCase();
  const split2=t=>{ if(t.length<=34)return [t]; const m=t.length/2; let b=-1; for(let i=0;i<t.length;i++)if(t[i]===' '&&(b<0||Math.abs(i-m)<Math.abs(b-m)))b=i; return b<0?[t]:[t.slice(0,b),t.slice(b+1)]; };
  const own=k=>String(cur()[k]||'').trim();
  const lines=()=>{ const o=ovr.text!=null?ovr.text:own('marquee'); return o?o.toUpperCase().split('\n').map(s=>s.trim()).filter(Boolean).slice(0,3):['NOW SHOWING',...split2(title())].slice(0,3); };
  const rnd=a=>()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };   // seeded, so every player sees the same front
  const HAND='Impact,"Haettenschweiler","Arial Narrow",sans-serif';
  // a line of hand-painted letters, each a little off its neighbours
  const hand=(g,t,cx,cy,maxW,h,R)=>{ g.font='900 '+Math.round(h)+'px '+HAND; const w=g.measureText(t).width, s=Math.min(1,maxW/Math.max(1,w)); g.save(); g.translate(cx,cy); g.scale(s,1); let x=-w/2;
    for(const ch of t){ const cw=g.measureText(ch).width; g.save(); g.translate(x+cw/2,(R()-.5)*h*.1); g.rotate((R()-.5)*.12); g.fillText(ch,0,0); g.restore(); x+=cw; } g.restore(); };
  // the marquee's board: old cream enamel, stained, rust running from the top
  const board=(g,W,H,R)=>{ g.fillStyle='#e4d8b6'; g.fillRect(0,0,W,H);
    for(let i=0;i<46;i++){ const x=R()*W, y=R()*H, r=(.03+R()*.14)*H, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(116,90,48,.24)'); gr.addColorStop(1,'rgba(116,90,48,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r); }
    g.fillStyle='rgba(104,64,34,.3)'; for(let i=0;i<9;i++){ const x=R()*W; g.fillRect(x,0,3+R()*6,H*(.15+R()*.5)); }
    g.fillStyle='#4a2c1e'; g.fillRect(0,0,W,10); g.fillRect(0,H-10,W,10); };
  const drawCanopy=()=>{ '@later'; const {front,side}=canopy, L=lines(), n=L.length, auto=!own('marquee'), R=rnd(L.join('').length*131+7);
    { const {g,cv,tex}=front, W=cv.width, H=cv.height, rh=(H-20)/n; board(g,W,H,R); g.fillStyle='#16110d'; g.textAlign='center'; g.textBaseline='middle';
      L.forEach((t,i)=>{ hand(g,t,W/2,10+rh*(i+.55),W-110,rh*(auto&&n>1&&i===0?.46:.7),R); }); tex.needsUpdate=true; }
    { const {g,cv,tex}=side; board(g,cv.width,cv.height,R); tex.needsUpdate=true; } };
  const posterSrc=()=>{ const o=own('poster'), y=vid(o); if(o)return y?'/yt/'+y+'.jpg':o; if(ytOn())return '/yt/'+vid(cur().video_id)+'.jpg'; return '/ia/'+nextF().id+'.jpg'; };
  // the picture without its dark bars or border (a letterboxed thumbnail, a poster scanned with a black edge)
  const trim=img=>{ '@later'; const w=img.width, h=img.height; try{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.drawImage(img,0,0); const d=g.getImageData(0,0,w,h).data;
      const dark=(x0,y0,x1,y1)=>{ let n=0, m=0; for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){ const i=(y*w+x)*4; m++; if(Math.max(d[i],d[i+1],d[i+2])>40)n++; } return n<m*.03; };
      let t=0, b=0, l=0, r=0; while(t<h*.3&&dark(0,t,w,t+1))t++; while(b<h*.3&&dark(0,h-1-b,w,h-b))b++; while(l<w*.3&&dark(l,t,l+1,h-b))l++; while(r<w*.3&&dark(w-1-r,t,w-r,h-b))r++;
      return [l,t,w-l-r,h-t-b]; }catch(e){ return [0,0,w,h]; } };
  const drawPoster=()=>{ '@later'; const {g,cv,tex}=post, W=cv.width, H=cv.height, src=posterSrc(), mine=!!own('poster');   // the picture fills the whole case, black behind it
    g.fillStyle='#000'; g.fillRect(0,0,W,H); g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle='#d8a845'; fit(g,'COMING SOON',W-40,40); g.fillText('COMING SOON',W/2,H*.42); g.fillStyle='#faf8f0'; fit(g,title(),W-30,22); g.fillText(title(),W/2,H*.56); tex.needsUpdate=true;
    if(!src)return; const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>{ if(posterSrc()!==src)return; try{ g.fillStyle='#000'; g.fillRect(0,0,W,H); const c=trim(img), s=Math.max(W/c[2],H/c[3]), dw=c[2]*s, dh=c[3]*s; g.drawImage(img,c[0],c[1],c[2],c[3],(W-dw)/2,(H-dh)/2,dw,dh);
      if(!mine){ const d=g.getImageData(0,0,W,H), a=d.data; for(let i=0;i<a.length;i+=4){ a[i]=qz(a[i]); a[i+1]=qz(a[i+1]); a[i+2]=qz(a[i+2]); } g.putImageData(d,0,0); } }catch(e){} tex.needsUpdate=true; };
    img.src=src; };
  // the ground floor stepped out to the pavement: old green paint under layers of torn posters, two wooden doors under a bare bulb, a crooked poster case ringed with bulbs, the box office set into it
  // a w by h sheet with a window cut in it (the box office), its picture still spread over the whole sheet
  const holed=(w,h,cx,cy,hw,hh)=>{ '@later'; const S=new THREE.Shape([new THREE.Vector2(-w/2,-h/2),new THREE.Vector2(w/2,-h/2),new THREE.Vector2(w/2,h/2),new THREE.Vector2(-w/2,h/2)]);
    S.holes.push(new THREE.Path([new THREE.Vector2(cx-hw,cy-hh),new THREE.Vector2(cx-hw,cy+hh),new THREE.Vector2(cx+hw,cy+hh),new THREE.Vector2(cx+hw,cy-hh)])); const g=new THREE.ShapeGeometry(S), P=g.attributes.position, U=g.attributes.uv;
    for(let i=0;i<P.count;i++)U.setXY(i,P.getX(i)/w+.5,P.getY(i)/h+.5); return g; };
  const POSTC=['#c8463c','#3c6ea8','#d8b040','#6a9a48','#a050a0','#e07a30','#2a2a2a','#e8e0c8','#58a8a0','#b03060'];
  const storefront=({at,ry,tw,Yb,Wb,cS,dS,dir,EXT,lo,hi,post})=>{ '@later'; const F=new THREE.Group(), y0=Yb(0), top=Yb(118), R=rnd(97), L=v=>dir*v;
    const put=(me,s,out,y)=>{ me.position.copy(at(s,out,y)); me.rotation.y=ry; F.add(me); return me; }, flat=(w,h,m)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),m), blk=(w,h,d,c)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));
    const glow=m=>new THREE.MeshBasicMaterial({map:m.tex,toneMapped:false}), bS=dS+L(-3.2*tw), pS=dS+L(3.4*tw), BW=2.3*tw, win={y0:Yb(36),y1:Yb(84)}, dw=1.7*tw, dh=Yb(84)-y0;
    { const px=64/tw, W=Math.round(Wb*px), H=Math.round((top-y0)*px), c=canv(W,H), g=c.g, U=s=>(Wb/2+(s-cS)*dir)*px, kick=Math.round(H*.07);
      g.fillStyle='#3d4b43'; g.fillRect(0,0,W,H); for(let i=0;i<W*H/90;i++){ const v=R(); g.fillStyle=v<.5?'rgba(20,28,24,.18)':'rgba(140,150,130,.12)'; g.fillRect(R()*W|0,R()*H|0,1+R()*3|0,1+R()*3|0); }
      for(let i=0;i<10;i++){ const x=R()*W, y=R()*H*.8, w=(.4+R()*1.2)*tw*px, h=(.3+R()*.8)*tw*px; g.fillStyle='#6e3a2c'; g.fillRect(x,y,w,h); g.fillStyle='#4e2a20'; for(let r=y;r<y+h;r+=8)g.fillRect(x,r,w,1); for(let r=y,k=0;r<y+h;r+=8,k++)for(let q=x+(k&1?8:0);q<x+w;q+=16)g.fillRect(q,r,1,8); }   // the paint gone, the brick under it
      for(let i=0;i<34;i++){ const w=(.55+R()*.65)*tw*px, h=w*(1.25+R()*.3), x=R()*(W-w), y=H*.06+R()*(H*.72-h), col=POSTC[R()*POSTC.length|0], tilt=(R()-.5)*.1, torn=R();   // the posters, one over another, torn
        g.save(); g.translate(x+w/2,y+h/2); g.rotate(tilt); g.beginPath(); g.moveTo(-w/2,-h/2); for(let k=0;k<=8;k++)g.lineTo(-w/2+w*k/8,-h/2+(R()-.5)*4); const cut=torn<.4?h*(.2+R()*.5):0;
        for(let k=0;k<=10;k++)g.lineTo(w/2+(R()-.5)*3,-h/2+(h-cut)*k/10); for(let k=8;k>=0;k--)g.lineTo(-w/2+w*k/8,h/2-cut+(R()-.5)*(cut?14:3)); g.closePath(); g.fillStyle=col; g.fill(); g.clip();
        g.fillStyle='rgba(255,250,235,.22)'; g.fillRect(-w/2,-h/2,w,h); g.fillStyle=R()<.5?'rgba(20,16,14,.75)':'rgba(250,240,220,.8)'; g.fillRect(-w*.38,-h*.38,w*.76,h*.12); g.fillRect(-w*.3,-h*.2,w*.6,h*.05);
        g.fillStyle='rgba(20,16,14,.35)'; g.beginPath(); g.arc((R()-.5)*w*.3,h*.08,w*.22,0,7); g.fill(); g.fillStyle='rgba(20,16,14,.5)'; for(let k=0;k<3;k++)g.fillRect(-w*.34,h*.3+k*h*.05,w*.68*(.5+R()*.5),2); g.restore(); }
      g.strokeStyle='rgba(230,230,220,.55)'; g.lineWidth=3; for(let i=0;i<4;i++){ g.beginPath(); let x=R()*W, y=H*.55+R()*H*.3; g.moveTo(x,y); for(let k=0;k<6;k++){ x+=10+R()*16; y+=(R()-.5)*22; g.lineTo(x,y); } g.stroke(); }   // a few tags
      g.fillStyle='#4a3022'; g.fillRect(0,H-kick,W,kick); g.fillStyle='rgba(150,80,40,.45)'; for(let i=0;i<W/30;i++)g.fillRect(R()*W,H-kick,2+R()*5,kick*R());
      g.fillStyle='#1c1d1a'; g.fillRect(0,0,W,Math.round(H*.035)); c.tex.magFilter=THREE.LinearFilter; c.tex.needsUpdate=true;
      const me=put(new THREE.Mesh(holed(Wb,top-y0,(bS-cS)*dir,(win.y0+win.y1)/2-(y0+top)/2,BW/2-.12*tw,(win.y1-win.y0)/2),new THREE.MeshLambertMaterial({map:c.tex,emissive:0x0b0c0b})),cS,EXT,(y0+top)/2); me.receiveShadow=true; }
    put(blk(Wb+.12*tw,.22*tw,EXT+.18*tw,0x24231f),cS,(EXT+.18*tw)/2,top+.1*tw);   // the cornice
    for(const s of [lo+.04*tw,hi-.04*tw])put(blk(.08*tw,top-y0,EXT+.02*tw,0x343f39),s,(EXT+.02*tw)/2,(y0+top)/2);
    { const DT=canv(64,160), g=DT.g; g.fillStyle='#5a3b27'; g.fillRect(0,0,64,160); for(let x=0;x<64;x+=16){ g.fillStyle='#3a2416'; g.fillRect(x,0,2,160); }   // the doors: planks, the old green paint coming off
      for(let i=0;i<40;i++){ g.fillStyle=R()<.7?'#46604e':'#2f2016'; g.fillRect(R()*64,R()*160,2+R()*10,2+R()*14); } DT.tex.needsUpdate=true;
      const lc=canv(32,48), lg=lc.g, gr=lg.createLinearGradient(0,0,0,48); gr.addColorStop(0,'#5a4020'); gr.addColorStop(1,'#d8a050'); lg.fillStyle=gr; lg.fillRect(0,0,32,48); lg.fillStyle='rgba(60,50,30,.5)'; for(let i=0;i<30;i++)lg.fillRect(R()*32,R()*48,2,2); lc.tex.needsUpdate=true;
      put(flat(dw+.26*tw,Yb(92)-y0,new THREE.MeshBasicMaterial({color:0x080605})),dS,EXT+.01*tw,(y0+Yb(92))/2);
      for(const k of [-1,1]){ const s=dS+L(k*dw/4); put(new THREE.Mesh(new THREE.BoxGeometry(dw/2-.05*tw,dh,.08*tw),new THREE.MeshLambertMaterial({map:DT.tex})),s,EXT+.05*tw,y0+dh/2);
        put(flat(dw*.24,dh*.26,glow(lc)),s,EXT+.095*tw,y0+dh*.7); put(blk(.05*tw,.06*tw,.07*tw,0xa88438),dS+L(k*.13*tw),EXT+.12*tw,y0+dh*.47); }
      const nc=canv(128,48), ng=nc.g; ng.fillStyle='#e8dcc0'; ng.fillRect(0,0,128,48); ng.fillStyle='#1a1410'; ng.textAlign='center'; ng.textBaseline='middle'; hand(ng,'NO REFUNDS',64,25,116,30,R); nc.tex.needsUpdate=true;
      put(flat(.62*tw,.23*tw,new THREE.MeshLambertMaterial({map:nc.tex})),dS+L(dw/4),EXT+.1*tw,y0+dh*.45).rotation.z=-.06;
      put(blk(.06*tw,.06*tw,.3*tw,0x2a2a2a),dS,EXT+.15*tw,Yb(96)); put(new THREE.Mesh(new THREE.SphereGeometry(.1*tw,10,8),new THREE.MeshBasicMaterial({color:0xffe0a0,toneMapped:false})),dS,EXT+.3*tw,Yb(93)); }
    { const ph=Yb(78)-Yb(22), pw=ph*27/40, yc=(Yb(22)+Yb(78))/2, G=new THREE.Group(), pm=new THREE.MeshBasicMaterial({map:post.tex,toneMapped:false});   // the poster case: a wooden box hung a little crooked, bulbs round it, not all of them working
      if(pS-pw/2-.4*tw>lo&&pS+pw/2+.4*tw<hi){ const fr=blk(pw+.32*tw,ph+.32*tw,.14*tw,0x3c2618); fr.position.z=.07*tw; const p=flat(pw,ph,pm); p.position.z=.142*tw; G.add(fr,p);
        const on=new THREE.MeshBasicMaterial({color:0xffe6a8,toneMapped:false}), off=new THREE.MeshLambertMaterial({color:0x403a34}), bg=new THREE.SphereGeometry(.05*tw,8,6), hw=pw/2+.1*tw, hh=ph/2+.1*tw, per=2*(hw+hh)*2, n=22;
        for(let i=0;i<n;i++){ let d=i/n*per, x, y; if(d<2*hw){ x=-hw+d; y=hh; } else if((d-=2*hw)<2*hh){ x=hw; y=hh-d; } else if((d-=2*hh)<2*hw){ x=hw-d; y=-hh; } else { d-=2*hw; x=-hw; y=-hh+d; }
          const b=new THREE.Mesh(bg,i%7===3||i%9===5?off:on); b.position.set(x,y,.16*tw); G.add(b); }
        G.rotation.z=.04; const H=new THREE.Group(); H.add(G); H.position.copy(at(pS,EXT,yc)); H.rotation.y=ry; F.add(H); post.group=H; } }
    post.group=post.group||F; scene.add(F); return {F,bS,BW,win}; };
  // the box office set into the wall: a chicken-wire window over a low counter with a bell and a cash tin, the ticket fox behind it, the showtimes on an old television at the back
  const boxOffice=({at,ry,tw,Yb,EXT,bS,BW,win,ox,oz})=>{ '@later'; const D=EXT-.12*tw, H=Yb(104)-Yb(0), kc=at(bS,EXT-D/2,0), y0=SHARED.groundY(kc.x,kc.z), G=new THREE.Group(), R=rnd(31); G.position.set(kc.x,y0,kc.z); G.rotation.y=ry; scene.add(G);
    const WALL=new THREE.MeshLambertMaterial({color:0x343f39}), WOOD=new THREE.MeshLambertMaterial({color:0x5a3b27}), IN=new THREE.MeshLambertMaterial({color:0x6a4a38}),
      GL=new THREE.MeshPhongMaterial({color:0xb8c0a8,specular:0x606050,shininess:30,transparent:true,opacity:.16,depthWrite:false});
    const bx=(w,h,d,m,x,y,z)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; G.add(me); return me; };
    const W=BW, cy=win.y0-Yb(0), gy=win.y1-Yb(0);
    bx(W,H,.08*tw,IN,0,H/2,-D/2); for(const sx of [-1,1])bx(.12*tw,H,D+.02*tw,WALL,sx*(W/2-.06*tw),H/2,0); bx(W,.08*tw,D,WALL,0,H-.04*tw,0); bx(W,H-gy,.12*tw,WALL,0,(H+gy)/2,D/2-.05*tw);
    bx(W,cy,.12*tw,WALL,0,cy/2,D/2-.05*tw);   // the booth's front stands a hair proud of the wall it is set in bx(W*1.04,.06*tw,.36*tw,WOOD,0,cy,D/2-.1*tw);
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(W-.24*tw,gy-cy-.06*tw),GL); gl.position.set(0,(cy+gy)/2,D/2-.07*tw); G.add(gl);
    const wc=canv(128,128), wg=wc.g; wg.strokeStyle='rgba(110,108,96,.85)'; wg.lineWidth=1.5; for(let k=-128;k<256;k+=16){ wg.beginPath(); wg.moveTo(k,0); wg.lineTo(k+128,128); wg.stroke(); wg.beginPath(); wg.moveTo(k+128,0); wg.lineTo(k,128); wg.stroke(); }
    wc.tex.wrapS=wc.tex.wrapT=THREE.RepeatWrapping; wc.tex.generateMipmaps=true; wc.tex.minFilter=THREE.LinearMipmapLinearFilter; wc.tex.magFilter=THREE.LinearFilter; wc.tex.repeat.set((W-.24*tw)/(.9*tw),(gy-cy)/(.9*tw)); wc.tex.needsUpdate=true;
    const wire=new THREE.Mesh(new THREE.PlaneGeometry(W-.24*tw,gy-cy-.06*tw),new THREE.MeshBasicMaterial({map:wc.tex,transparent:true,depthWrite:false})); wire.position.set(0,(cy+gy)/2,D/2-.075*tw); G.add(wire);
    const hole=new THREE.Mesh(new THREE.PlaneGeometry(.5*tw,.12*tw),new THREE.MeshBasicMaterial({color:0x0b0b0d})); hole.position.set(0,cy+.08*tw,D/2-.065*tw); G.add(hole);
    bx(.14*tw,.05*tw,.14*tw,new THREE.MeshLambertMaterial({color:0xc8a040}),-W*.3,cy+.05*tw,D/2-.2*tw); bx(.1*tw,.02*tw,.1*tw,new THREE.MeshLambertMaterial({color:0x8a6a28}),-W*.3,cy+.09*tw,D/2-.2*tw);   // the bell
    bx(.36*tw,.14*tw,.24*tw,new THREE.MeshLambertMaterial({color:0x2e5a3a}),W*.28,cy+.1*tw,D/2-.24*tw);   // the cash tin
    const sg=canv(512,112); { const g=sg.g; g.fillStyle='#d8ccae'; g.fillRect(0,0,512,112); g.fillStyle='rgba(110,80,40,.25)'; for(let i=0;i<30;i++)g.fillRect(R()*512,R()*112,4+R()*30,2+R()*10); g.fillStyle='#8a1e24'; g.textAlign='center'; g.textBaseline='middle'; hand(g,'BOX OFFICE',256,58,460,78,R); sg.tex.needsUpdate=true; }
    const sign_=new THREE.Mesh(new THREE.PlaneGeometry(W*.86,W*.86*112/512),new THREE.MeshLambertMaterial({map:sg.tex})); sign_.position.set(0,(H+gy)/2+.04*tw,D/2+.012*tw); sign_.rotation.z=.025; G.add(sign_);
    const tc=canv(160,96); { const g=tc.g; g.fillStyle='#f0e6c8'; g.fillRect(0,0,160,96); g.fillStyle='#16110d'; g.textAlign='center'; g.textBaseline='middle'; hand(g,'TIX $5',80,50,144,62,R); tc.tex.needsUpdate=true; }
    const tix=new THREE.Mesh(new THREE.PlaneGeometry(.52*tw,.31*tw),new THREE.MeshLambertMaterial({map:tc.tex})); tix.position.set(W/2-.5*tw,gy-.32*tw,D/2-.05*tw); tix.rotation.z=-.09; G.add(tix);
    const sc=canv(612,400), sw=W*.36, sh_=sw*400/612, tvx=W*.24, tvy=Yb(78)-Yb(0);   // an old television on a shelf, the showtimes on it
    bx(sw+.2*tw,sh_+.2*tw,.5*tw,new THREE.MeshLambertMaterial({color:0x4a3a2a}),tvx,tvy,-D/2+.3*tw); bx(sw+.5*tw,.05*tw,.6*tw,WOOD,tvx,tvy-sh_/2-.13*tw,-D/2+.3*tw);
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh_),new THREE.MeshBasicMaterial({map:sc.tex})); scr.position.set(tvx,tvy,-D/2+.56*tw); G.add(scr);
    bx(.03*tw,.3*tw,.03*tw,new THREE.MeshLambertMaterial({color:0x222222}),0,H-.2*tw,0); const bulb=new THREE.Mesh(new THREE.SphereGeometry(.07*tw,8,6),new THREE.MeshBasicMaterial({color:0xffe0a0,toneMapped:false})); bulb.position.set(0,H-.4*tw,0); G.add(bulb);
    G.updateMatrixWorld(); const lamp=new THREE.PointLight(0xffc88a,4,3*tw,1.6); lamp.position.set(0,H*.8,0).applyMatrix4(G.matrixWorld); LITE.recs.push(lamp);
    G.traverse(o=>{ o.userData.seenOut=true; }); return {G,sc,key:'',x:kc.x,z:kc.z,ox,oz}; };
  // the neon on top of the marquee: FLEA PIT in pink tubes, its I gone dark (it catches now and then)
  const neonDraw=(c,on)=>{ '@later'; const g=c.g, W=c.cv.width, H=c.cv.height, T='FLEA PIT'; g.clearRect(0,0,W,H); g.font='900 '+Math.round(H*.74)+'px '+HAND; g.textBaseline='middle'; g.lineJoin='round';
    const w=g.measureText(T).width, sc=Math.min(1,(W-60)/w); g.save(); g.translate(W/2,H/2+4); g.scale(sc,1); let x=-w/2;
    for(let i=0;i<T.length;i++){ const ch=T[i], cw=g.measureText(ch).width, dead=i===6&&!on; g.textAlign='center';
      if(ch!==' '){ if(!dead){ g.shadowColor='#ff3c7c'; g.shadowBlur=26; g.strokeStyle='#ff4f8a'; g.lineWidth=13; g.strokeText(ch,x+cw/2,0); g.shadowBlur=8; g.strokeStyle='#ffd0e0'; g.lineWidth=4; g.strokeText(ch,x+cw/2,0); }
        else { g.shadowBlur=0; g.strokeStyle='#5a2a3c'; g.lineWidth=11; g.strokeText(ch,x+cw/2,0); g.strokeStyle='#7a4a5a'; g.lineWidth=3; g.strokeText(ch,x+cw/2,0); } }
      x+=cw; } g.restore(); c.tex.needsUpdate=true; };
  const neonShow=()=>{ neon.me.material.map=(neon.on?neon.lit:neon.dead).tex; if(neon.light)neon.light.intensity=neon.on?3.2:2.6; };   // the sign is drawn once each way and swapped, never redrawn
  const buildSigns=()=>{ '@later'; if(canopy)return; const SD=STORE.streetDoor&&STORE.streetDoor.theatre, LT=STORE.main&&STORE.main.lot&&STORE.main.lot('theatre',300); if(!SD||!LT)return;
    const B=SHARED.BOD, Yb=B.Y, tw=Math.abs(B.X(1)-B.X(0)), bx=B.X(SD.door[0]), bz=B.Z(SD.door[1]); let ox=B.X(SD.out[0])-bx, oz=B.Z(SD.out[1])-bz; const l=Math.hypot(ox,oz)||1; ox/=l; oz/=l;
    const alongX=Math.abs(oz)>=Math.abs(ox), ry=Math.atan2(ox,oz), e=alongX?[B.Z(LT.y0),B.Z(LT.y1)]:[B.X(LT.x0),B.X(LT.x1)], oc=alongX?B.Z(SD.out[1]):B.X(SD.out[0]), f0=Math.abs(e[0]-oc)<Math.abs(e[1]-oc)?e[0]:e[1];
    const s0=alongX?B.X(LT.x0):B.Z(LT.y0), s1=alongX?B.X(LT.x1):B.Z(LT.y1), lo=Math.min(s0,s1), hi=Math.max(s0,s1), Wb=hi-lo, cS=(lo+hi)/2, dS=alongX?bx:bz, dir=alongX?Math.cos(ry):-Math.sin(ry), EXT=CINEMA.EXT*tw;
    const at=(s,out,y)=>alongX?new THREE.Vector3(s,y,f0+oz*out):new THREE.Vector3(f0+ox*out,y,s);
    { const a=at(lo,0,0), b=at(hi,EXT,0); SOL.up.push([Math.min(a.x,b.x),Math.min(a.z,b.z),Math.max(a.x,b.x),Math.max(a.z,b.z)]); }   // the stepped-out ground floor is solid
    const cw=Math.min(Wb*.7,13*tw), ch=Yb(138)-Yb(102), cd=1.5*tw, front=canv(2048,Math.round(2048*ch/cw)), side=canv(64,256), sof=canv(512,64), dark=new THREE.MeshLambertMaterial({color:0x2a2420});
    { const g=sof.g, R=rnd(5); g.fillStyle='#2e2a26'; g.fillRect(0,0,512,64); for(let r=0;r<2;r++)for(let x=24;x<512;x+=44){ g.fillStyle=R()<.22?'#4a443c':'#fff0cc'; g.beginPath(); g.arc(x+(r?22:0),18+r*28,4,0,7); g.fill(); } sof.tex.needsUpdate=true; }
    const box=new THREE.Mesh(new THREE.BoxGeometry(cw,ch,cd),[new THREE.MeshBasicMaterial({map:side.tex}),new THREE.MeshBasicMaterial({map:side.tex}),dark,new THREE.MeshBasicMaterial({map:sof.tex}),new THREE.MeshBasicMaterial({map:front.tex}),dark]);
    box.position.copy(at(cS,EXT+cd/2+.02,Yb(120))); box.rotation.y=ry; scene.add(box);
    canopy={box,front,side,key:''};
    { const nw=Math.min(cw*.7,7*tw), nh=nw*.26, c=canv(1024,Math.round(1024*nh/nw)), me=new THREE.Mesh(new THREE.PlaneGeometry(nw,nh),new THREE.MeshBasicMaterial({map:c.tex,transparent:true,toneMapped:false,depthWrite:false}));
      me.position.copy(at(cS,EXT+cd*.55,Yb(138)+nh/2+.05*tw)); me.rotation.y=ry; scene.add(me);
      const rail=new THREE.Mesh(new THREE.BoxGeometry(nw*.9,.06*tw,.08*tw),dark); rail.position.copy(at(cS,EXT+cd*.5,Yb(138)+.05*tw)); rail.rotation.y=ry; scene.add(rail);
      const light=new THREE.PointLight(0xff4f8a,3,7*tw,1.6); light.position.copy(at(cS,EXT+cd+1.2*tw,Yb(150))); LITE.recs.push(light);
      const lit=c, dead=canv(lit.cv.width,lit.cv.height); neonDraw(lit,true); neonDraw(dead,false); neon={lit,dead,me,rail,light,on:false,t:0}; neonShow(); }
    post={...canv(270,400),key:''}; const fr=storefront({at,ry,tw,Yb,Wb,cS,dS,dir,EXT,lo,hi,post}); post.front=fr.F;
    box_o=boxOffice({at,ry,tw,Yb,EXT,bS:fr.bS,BW:fr.BW,win:fr.win,ox,oz});
    SIGNS.list.push({me:box,name:'THEATRE MARQUEE',place:'street',get:()=>({text:ovr.text,bri:ovr.bri,col:ovr.col}),
      set:o=>{ ovr.text=o&&o.text!=null?o.text:null; ovr.bri=o&&o.bri!=null?o.bri:null; ovr.col=o&&o.col!=null?o.col:null;
        const c=new THREE.Color(ovr.col||'#ffffff').multiplyScalar(ovr.bri==null?1:ovr.bri); for(const i of [0,1,4]){ const mm=box.material[i]; if(mm&&mm.color)mm.color.copy(c); } canopy.key=''; sign(); }});
    if(TEXT.cur['sign.THEATRE MARQUEE']!=null)SIGNS.list[SIGNS.list.length-1].set({text:TEXT.cur['sign.THEATRE MARQUEE']});
    sign(); };
  const sign=()=>{ '@later'; if(canopy){ const k=lines().join('|'); if(k!==canopy.key){ canopy.key=k; drawCanopy(); } }
    if(post){ const k=posterSrc()+'|'+title()+'|'+own('poster'); if(k!==post.key){ post.key=k; drawPoster(); } }
    if(box_o){ const k=CINEMA.upcoming(1)[0].start+'|'+ytOn(); if(k!==box_o.key){ box_o.key=k; CINEMA.drawTimes(box_o.sc.g,box_o.sc.cv.width,box_o.sc.cv.height); box_o.sc.tex.needsUpdate=true; } } };
  // the showtimes, as the box office's screen draws them: the film on now and the next ones, in the viewer's own time
  CINEMA.drawTimes=(g,W,H,n=6)=>{ '@later'; const L=CINEMA.upcoming(n), P=CINEMA.playing(), hm=t=>new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}).toUpperCase();
    g.fillStyle='#0b0c10'; g.fillRect(0,0,W,H); g.fillStyle='#d8a845'; g.fillRect(0,0,W,H*.15); g.fillStyle='#0b0c10'; g.textAlign='center'; g.textBaseline='middle'; fit(g,'SHOWTIMES',W*.8,H*.1); g.fillText('SHOWTIMES',W/2,H*.075);
    const rh=(H*.83)/n; L.forEach((f,i)=>{ const y=H*.17+rh*(i+.5), now=i===0&&P&&!P.yt&&P.id===f.id; g.fillStyle=now?'#2a1e10':i%2?'#111318':'#0d0f13'; g.fillRect(0,y-rh/2,W,rh);
      g.textAlign='left'; g.fillStyle=now?'#ffcf6a':'#e8e4da'; fit(g,now?'NOW':hm(f.start),W*.24,rh*.5); g.fillText(now?'NOW':hm(f.start),W*.04,y);
      g.fillStyle=now?'#ffcf6a':'#c9c3b6'; fit(g,f.title+' ('+f.year+')',W*.66,rh*.44); g.fillText(f.title+' ('+f.year+')',W*.3,y); }); };

  // double-click the screen: sound and the timeline for everyone, a YouTube link and the brightness for admins; admins also double-click the marquee and the poster
  const esc=TEXT.esc;
  const DLG='position:fixed;z-index:9;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,420px);max-height:86vh;overflow:auto;background:#141018;color:#f3e7dd;border:2px solid #bc923a;border-radius:12px;padding:16px;font:14px/1.5 system-ui';
  const BTN='font:600 13px system-ui;border:0;border-radius:6px;cursor:pointer;', RED=BTN+'background:#b22133;color:#fff;', DIM=BTN+'background:transparent;color:#c3a7a0;border:1px solid #3a2130;';
  const FLD='width:100%;box-sizing:border-box;font:inherit;background:#0e0a10;color:#f3e7dd;border:1px solid #3a2130;border-radius:6px;padding:7px';
  const LBL='display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#c3a7a0';
  const box_=()=>{ const d=document.createElement('div'); d.id='cinemap'; d.style.cssText=DLG; document.body.appendChild(d); for(const ev of ['keydown','keyup'])d.addEventListener(ev,e=>e.stopPropagation()); return d; };
  let dlg=null, edlg=null, tlT=0;
  const openMenu=async()=>{ '@later'; const a=await isAdmin(), c=cur(), yt=ytOn(), P=CINEMA.playing(); if(!dlg)dlg=box_();
    dlg.innerHTML=`<h3 style="margin:0 0 4px">THE SCREEN${a?' · ADMIN':''}</h3><div style="color:#c3a7a0;margin-bottom:10px">${P?'NOW: '+esc(P.title)+(P.year?' ('+P.year+')':''):'BETWEEN SHOWINGS'}</div>
      <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #3a2130"><label><input id="cmsnd" type="checkbox" ${snd.on?'checked':''}> sound</label>
        <label style="display:block;margin-top:6px">Volume <span id="cmvv" style="color:#d8a845">${snd.vol}%</span><br><input id="cmv" type="range" min="0" max="100" value="${snd.vol}" style="width:100%"></label>
        <label style="display:block;margin-top:8px">Timeline <span id="cmtv" style="color:#d8a845">0:00 / 0:00</span>${a?'':' <span style="color:#8f7470;font-size:12px">(admins move it, for everyone)</span>'}<br><input id="cmt" type="range" min="0" max="1000" value="0" style="width:100%" ${a?'':'disabled'}></label></div>`+(a?`
      <label style="${LBL}">Play a YouTube link instead (for up to 4 hours)</label>
      <div style="display:flex;gap:6px;margin:4px 0 8px"><input id="cmu" placeholder="youtube.com/watch?v=..." style="${FLD};flex:1;min-width:0"><button id="cmplay" style="${RED}padding:0 12px">PLAY</button></div>
      ${yt?`<div style="margin-bottom:12px"><button id="cmsched" style="${DIM}padding:6px 10px">BACK TO THE SCHEDULE</button></div>`:''}
      <div style="margin-bottom:10px"><label style="flex:1;min-width:120px">Brightness <span id="cmbv" style="color:#d8a845">${Math.round((c.brightness??.8)*100)}%</span><br><input id="cmb" type="range" min="20" max="120" value="${Math.round((c.brightness??.8)*100)}" style="width:100%"></label></div>
      <label style="${LBL}">The playlist, in order, for everyone (the showtimes follow it)</label>
      <div id="cmpl" style="max-height:170px;overflow:auto;margin:4px 0 6px;border:1px solid #3a2130"></div>
      <select id="cmadd" style="${FLD};width:100%;margin-bottom:6px"><option value="">+ add a free film</option>${FILMS.map((f,i)=>`<option value="${i}">${esc(f.title)} (${f.year})</option>`).join('')}</select>
      <div style="display:flex;gap:6px;margin-bottom:6px"><input id="cmia" placeholder="+ a film from archive.org/details/..." style="${FLD};flex:1;min-width:0"><button id="cmiadd" style="${DIM}padding:0 10px">ADD</button></div>
      <div style="display:flex;gap:6px;margin-bottom:12px"><button id="cmplsave" style="${RED}padding:6px 10px">SAVE THE PLAYLIST</button><button id="cmplfree" style="${DIM}padding:6px 10px">THE FREE FILMS</button></div>
`:'')+`
      <div style="display:flex;justify-content:space-between;margin-top:10px"><button id="cmfull" style="${RED}padding:8px 14px">FULL SCREEN</button><button id="cmclose" style="${DIM}padding:8px 14px">CLOSE</button></div>
      <div id="cmsay" style="color:#8f7470;font-size:12px;margin-top:8px"></div>`;
    const $=s=>dlg.querySelector(s), say=t=>{ $('#cmsay').textContent=t; };
    $('#cmsnd').onchange=e=>CINEMA.sound(e.target.checked,null); $('#cmv').oninput=e=>{ $('#cmvv').textContent=e.target.value+'%'; CINEMA.sound(null,+e.target.value); };
    $('#cmfull').onclick=()=>{ $('#cmclose').onclick(); CINEMA.fullscreen(true); };
    $('#cmclose').onclick=()=>{ dlg.style.display='none'; };
    const fmt=s=>{ s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }, F_=()=>!ytOn()&&film(), dur=()=>{ const f=F_(); if(f)return f.f.len; try{ return player&&player.getDuration?player.getDuration()||0:0; }catch(e){ return 0; } }; let drag=false;
    if(!tlT){ tlT=1; SYS.every(()=>{ if(!dlg||dlg.style.display==='none')return; const d=dur(); let t=0; const f=F_(); if(f)t=f.off; else try{ t=player&&player.getCurrentTime?player.getCurrentTime()||0:0; }catch(e){}
      if(!drag&&d)$('#cmt').value=Math.round(t/d*1000); $('#cmtv').textContent=fmt(t)+' / '+fmt(d); },500,'059f-cinema timeline'); }
    $('#cmt').oninput=e=>{ drag=true; const d=dur(); $('#cmtv').textContent=fmt(+e.target.value/1000*d)+' / '+fmt(d); };
    $('#cmt').onchange=async e=>{ drag=false; if(!a||F_())return; const sec=+e.target.value/1000*dur(); try{ player.seekTo(sec,true); }catch(x){} say('...'); say(await push({started_at:new Date(Date.now()-sec*1000).toISOString()})?'moved for everyone':'could not'); };
    if(a){ $('#cmb').oninput=e=>$('#cmbv').textContent=e.target.value+'%'; $('#cmb').onchange=e=>push({brightness:+e.target.value/100});
      let pl=list().map(f=>({id:f.id,file:f.file,title:f.title,year:f.year,len:f.len}));
      const hms=s=>Math.floor(s/3600)+':'+String(Math.floor(s%3600/60)).padStart(2,'0');
      const drawPL=()=>{ $('#cmpl').innerHTML=pl.map((f,i)=>`<div style="display:flex;gap:6px;align-items:center;padding:3px 6px;${i%2?'background:#1a1016':''}"><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i+1}. ${esc(f.title)}${f.year?' ('+f.year+')':''} <span style="color:#8f7470">${hms(f.len)}</span></span><button data-u="${i}" style="${DIM}padding:0 6px">▲</button><button data-d="${i}" style="${DIM}padding:0 6px">▼</button><button data-x="${i}" style="${DIM}padding:0 6px">✕</button></div>`).join('')||'<div style="padding:6px;color:#8f7470">empty: the free films play</div>';
        $('#cmpl').querySelectorAll('button').forEach(b=>b.onclick=()=>{ const u=b.dataset.u, d=b.dataset.d, x=b.dataset.x; if(u!=null&&+u>0)pl.splice(+u-1,0,pl.splice(+u,1)[0]); if(d!=null&&+d<pl.length-1)pl.splice(+d+1,0,pl.splice(+d,1)[0]); if(x!=null)pl.splice(+x,1); drawPL(); }); };
      drawPL();
      $('#cmadd').onchange=e=>{ const f=FILMS[+e.target.value]; if(f){ pl.push({id:f.id,file:f.file,title:f.title,year:f.year,len:f.len}); drawPL(); } e.target.value=''; };
      $('#cmiadd').onclick=async()=>{ const m=/archive\.org\/(?:details|download|embed)\/([A-Za-z0-9_.-]+)/.exec($('#cmia').value)||/^([A-Za-z0-9_.-]+)$/.exec($('#cmia').value.trim()); if(!m){ say('not an archive.org link'); return; } say('...');
        try{ const j=await (await fetch('https://archive.org/metadata/'+m[1])).json(), F=(j.files||[]).filter(f=>/\.mp4$/i.test(f.name)), f=F.find(f=>/h\.264/i.test(f.format||''))||F[0];
          const len=f&&(/:/.test(f.length||'')?String(f.length).split(':').reduce((a,v)=>a*60+ +v,0):+f.length);
          if(!f||!(len>0)){ say('no film file found there'); return; } const md=j.metadata||{};
          pl.push({id:m[1],file:f.name,title:String([].concat(md.title||m[1])[0]).toUpperCase().slice(0,60),year:(String(md.date||md.year||'').match(/\d{4}/)||[''])[0],len:Math.round(len)}); $('#cmia').value=''; drawPL(); say('added: save to play it'); }catch(x){ say('could not read that film'); } };
      $('#cmplsave').onclick=async()=>{ say('...'); say(await push({playlist:pl})?'the playlist is on, for everyone':SQLHINT); };
      $('#cmplfree').onclick=async()=>{ say('...'); if(await push({playlist:[]})){ pl=FILMS.map(f=>({id:f.id,file:f.file,title:f.title,year:f.year,len:f.len})); drawPL(); say('back to the free films'); } else say(SQLHINT); };
      if($('#cmsched'))$('#cmsched').onclick=async()=>{ say('...'); say(await push({video_id:''})?'back to the schedule':'could not'); };
      $('#cmplay').onclick=async()=>{ const id=vid($('#cmu').value); if(!id){ say('not a YouTube link'); return; } say('...'); say(await push({video_id:id,started_at:new Date(Date.now()+8000).toISOString()})?'playing for everyone':'could not save (log in as admin)'); };
    }
    dlg.style.display='block'; };
  CINEMA.openMenu=openMenu;
  const SQLHINT='could not save (has supabase/cinema.sql been run?)';
  const mini=(head,body,wire)=>{ '@later'; if(!edlg)edlg=box_();
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
  SYS.onStart(async()=>{ await LOAD('later'); isAdmin().then(a=>{ CINEMA.admin=!!a; }); pull(); SYS.every(pull,5000,'059f-cinema pull'); },'059f-cinema');   // after the start, so the later chunk is not pulled in early
}
