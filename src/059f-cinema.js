// THE CINEMA: the movie theatre screen plays one shared YouTube reel at the same timecode for everyone, thrown from the projection booth (its projector holds the settings); its marquee and poster outside follow what plays.
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, CLOCK, pos, ROOMS, SIGNS, UI} from './003b-systems.js';
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
  let vf=1; const applySnd=()=>{ try{ if(player){ if(snd.on){ player.unMute(); player.setVolume(Math.round(snd.vol*vf)); } else player.mute(); } }catch(e){} };
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
    clip.appendChild(wrap); const stg=document.getElementById('stage')||document.body; stg.insertBefore(clip,stg.firstChild); };
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
  const onEnded=async()=>{ '@later'; const c=cur(), pl=c.playlist||[];
    if(adm&&pl.length>1){ const last=(c.idx|0)+1>=pl.length; if(last&&c.loop===false)return; const ni=last?0:(c.idx|0)+1, nid=vid(pl[ni]&&(pl[ni].url||pl[ni].id||pl[ni]));
      if(nid)await push({idx:ni,video_id:nid,started_at:new Date().toISOString()}); }
    else if(c.loop!==false&&player){ try{ player.seekTo(0,true); player.playVideo(); }catch(e){} } };

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
  const mkCut=()=>{ if(CUT||!SHARED.composer)return; CUT=new ShaderPass({uniforms:{tDiffuse:{value:null},uOn:{value:0},uQ:{value:[0,1,2,3].map(()=>new THREE.Vector2())}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'uniform sampler2D tDiffuse; uniform float uOn; uniform vec2 uQ[4]; varying vec2 vUv; float s(vec2 a,vec2 b,vec2 p){ return (b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x); }\n'
      +'void main(){ vec4 c=texture2D(tDiffuse,vUv); float a=1.; vec3 rgb=c.rgb; if(uOn>.5){ float s0=s(uQ[0],uQ[1],vUv), s1=s(uQ[1],uQ[2],vUv), s2=s(uQ[2],uQ[3],vUv), s3=s(uQ[3],uQ[0],vUv); if((s0>=0.&&s1>=0.&&s2>=0.&&s3>=0.)||(s0<=0.&&s1<=0.&&s2<=0.&&s3<=0.)){ a=c.a; if(a<.99)rgb=vec3(0.); } } gl_FragColor=vec4(rgb,a); }'});
    SHARED.composer.addPass(CUT); };
  const facing=me=>{ me.updateMatrixWorld(); const n=new THREE.Vector3(0,0,1).transformDirection(me.matrixWorld), p=new THREE.Vector3().setFromMatrixPosition(me.matrixWorld); return n.dot(new THREE.Vector3().subVectors(SHARED.cam.position,p))>0; };

  // the projector at the back: a flickering beam to the screen, and the box it comes from
  let rig=null;
  const BEAM={on:true,power:1,warm:.5,flicker:.5,spill:1}; let beamLive=null;
  const bcfg=()=>({...BEAM,...(cur().beam||{}),...(beamLive||{})});
  let holeM=null;
  const buildRig=m=>{ if(rig||!m.port)return; const fm=m.fm; fm.updateMatrixWorld(); const w=fm.geometry.parameters.width/2, h=fm.geometry.parameters.height/2, P=new THREE.Vector3(...m.port);
    const W_=(x,y,z=0)=>new THREE.Vector3(x,y,z).applyMatrix4(fm.matrixWorld), p=W_(0,0), N=new THREE.Vector3(0,0,1).transformDirection(fm.matrixWorld);
    const Q=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([sx,sy])=>W_(sx*w,sy*h));
    const g=new THREE.BufferGeometry(), ps=[], cs=[], A=[.5,.5,.5], B=[.14,.14,.14];
    for(let i=0;i<4;i++){ const q0=Q[i], q1=Q[(i+1)%4]; ps.push(P.x,P.y,P.z,q0.x,q0.y,q0.z,q1.x,q1.y,q1.z); cs.push(...A,...B,...B); }
    g.setAttribute('position',new THREE.Float32BufferAttribute(ps,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));
    const beam=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.05,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    const lens=new THREE.Mesh(new THREE.SphereGeometry(.06,8,8),new THREE.MeshBasicMaterial({color:0xfff4d0})); lens.position.copy(P);
    const gc=canv(256,144); { const g=gc.g, gr=g.createRadialGradient(128,72,20,128,72,128); gr.addColorStop(0,'rgba(220,226,240,.9)'); gr.addColorStop(.45,'rgba(200,210,230,.35)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,256,144); gc.tex.needsUpdate=true; }
    const halo=new THREE.Mesh(new THREE.PlaneGeometry(w*2.6,h*2.4),new THREE.MeshBasicMaterial({map:gc.tex,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false})); halo.quaternion.copy(fm.quaternion); halo.position.copy(p).addScaledVector(N,.01);
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(w*2.2,w*1.1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:gc.tex,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false})); pool.rotation.y=fm.rotation.y; pool.position.copy(p).addScaledVector(N,w*.55); pool.position.y=.04;
    rig=new THREE.Group(); rig.add(beam,lens,halo,pool); rig.visible=false; scene.add(rig);
    holeM=new THREE.Mesh(new THREE.PlaneGeometry(1,1),HOLE); holeM.quaternion.copy(fm.quaternion); holeM.position.copy(p).addScaledVector(N,.02); holeM.visible=false; holeM.u={w:w*2,h:h*2}; scene.add(holeM);
    const spill=new THREE.PointLight(0xc8d4ff,0,w*5,1.4); spill.position.copy(p).addScaledVector(N,w*.9); spill.position.y-=h*.2; scene.add(spill); rig.u={beam,halo,pool,spill,lv:.5}; };
  const fitHole=()=>{ const u=holeM.u, sz=Math.max(.4,Math.min(1,cur().size??1)); let hw=u.w, hh=u.w/aspect; if(hh>u.h){ hh=u.h; hw=u.h*aspect; } holeM.scale.set(hw*sz,hh*sz,1); };
  const bcol=c=>new THREE.Color().setRGB(.62+.16*c.warm,.64+.02*c.warm,.76-.32*c.warm);
  const animRig=now=>{ if(!rig)return; const u=rig.u, c=bcfg(); if(!rig.visible){ u.spill.intensity=0; return; } const t=now/1000; u.lv+=(Math.random()-.5)*.06*c.flicker*2; u.lv=Math.max(.25,Math.min(1,u.lv+(.6-u.lv)*.01));
    const f=1+(.06*Math.sin(t*23)+.04*Math.sin(t*5.1))*c.flicker*2, b=(cur().brightness??.8)*(.6+.4*u.lv)*f; u.beam.visible=!!c.on; u.beam.material.color.copy(bcol(c)); u.beam.material.opacity=(.008+.008*b)*c.power;
    u.halo.material.opacity=(.03+.05*b)*c.spill; u.pool.material.opacity=(.02+.04*b)*c.spill; u.spill.intensity=3*b*c.spill; u.spill.color.copy(bcol(c)).lerp(new THREE.Color(0xc8d4ff),.6); };

  let lastSync=0, adminThings=false;
  const tick=()=>{ const mt=STORE.main&&STORE.main.theatre; CINEMA.on=false; if(!mt||!mt.fm)return;
    const up=SHARED.LVL==='up'; if(canopy){ canopy.box.visible=canopy.pool.visible=up; const h=CLOCK.h??12; canopy.pool.material.opacity=h<6.5||h>18.5?1:.3; } if(post)post.group.visible=up;
    if(CINEMA.admin&&!adminThings&&canopy&&post){ adminThings=true;
      UI.thing({name:'THE MARQUEE',ghost:1,obj:canopy.box,reach:2.2*TILE,near:6*TILE,tall:1,act:()=>editMarquee()});
      UI.thing({name:'THE POSTER',ghost:1,obj:post.group,reach:1.6*TILE,near:5*TILE,tall:1,act:()=>editPoster()}); }
    const inB=ROOMS.offIn&&ROOMS.offIn()==='booth', id=vid(cur().video_id), nvf=inB?.35:1, now=performance.now(); if(nvf!==vf){ vf=nvf; applySnd(); }
    if(inB)booth.anim(now);
    const tgt=inB?booth.port:up&&holeM&&mt.R.inside(pos.x,pos.z)?holeM:null;
    if(holeM)holeM.visible=false; if(booth.port&&booth.glass)booth.port.material=booth.glass;
    if(!tgt||!id||FADE.busy){ if(CUT)CUT.uniforms.uOn.value=0; if(soundBtn)soundBtn.style.display='none'; if(clip&&clip.style.display!=='none'){ clip.style.display='none'; try{ player&&player.pauseVideo(); }catch(e){} } if(rig){ rig.visible=!1; animRig(0); } return; }
    mkWrap(); mkCut(); makePlayer(id); sniff(id); const ok=vOK&&!vFail; CINEMA.on=ok; if(tgt===holeM)fitHole(); if(ok){ if(tgt!==holeM)tgt.material=HOLE; tgt.visible=true; }
    if(rig){ rig.visible=!inB; animRig(now); }
    if(facing(tgt)){ clip.style.display='block'; placeOver(tgt,inB?.6:1,ok); } else { clip.style.display='none'; soundBtn.style.display='none'; if(CUT)CUT.uniforms.uOn.value=0; }
    sync(); };
  const sync=()=>{ const now=performance.now(); if(now-lastSync>1500&&player&&player.getCurrentTime){ lastSync=now;
      try{ const want=offset(), is=player.getCurrentTime(); if(Math.abs(is-want)>1.6)player.seekTo(want,true); if(player.getPlayerState&&player.getPlayerState()!==1)player.playVideo(); }catch(e){} } };
  CINEMA.tick=tick;

  const onRec=()=>{ const id=vid(cur().video_id);
    if(id!==titleId){ titleId=id; CINEMA.title='';
      if(id)fetch('https://www.youtube.com/oembed?format=json&url=https://youtu.be/'+id).then(r=>r.ok?r.json():null).then(j=>{ if(j&&j.title){ CINEMA.title=j.title; sign(); } }).catch(()=>{}); }
    sign(); };

  // the front: a lit marquee box over the doors (the video's title unless an admin wrote its lines) and a lit poster case on the wall
  let canopy=null, post=null; const ovr={text:null,bri:null,col:null};
  const canv=(w,h)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const tex=new THREE.CanvasTexture(cv); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; tex.colorSpace=THREE.SRGBColorSpace; return {cv,g:cv.getContext('2d'),tex}; };
  const FACE='"Arial Narrow","Helvetica Neue",Arial,sans-serif';
  const fit=(g,t,maxW,px)=>{ let s=px; do{ g.font='900 '+Math.round(s)+'px '+FACE; s-=1; }while(g.measureText(t).width>maxW&&s>8); };
  const qz=v=>Math.min(255,Math.round(v/56)*56), title=()=>(CINEMA.title||'THE STRANGEST CINEMA').toUpperCase();
  const split2=t=>{ if(t.length<=34)return [t]; const m=t.length/2; let b=-1; for(let i=0;i<t.length;i++)if(t[i]===' '&&(b<0||Math.abs(i-m)<Math.abs(b-m)))b=i; return b<0?[t]:[t.slice(0,b),t.slice(b+1)]; };
  const own=k=>String(cur()[k]||'').trim();
  const lines=()=>{ const o=ovr.text!=null?ovr.text:own('marquee'); return o?o.toUpperCase().split('\n').map(s=>s.trim()).filter(Boolean).slice(0,3):['NOW SHOWING',...split2(title())].slice(0,3); };
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
    SIGNS.list.push({me:box,name:'THEATRE MARQUEE',place:'street',get:()=>({text:ovr.text,bri:ovr.bri,col:ovr.col}),
      set:o=>{ ovr.text=o&&o.text!=null?o.text:null; ovr.bri=o&&o.bri!=null?o.bri:null; ovr.col=o&&o.col!=null?o.col:null;
        const c=new THREE.Color(ovr.col||'#ffffff').multiplyScalar(ovr.bri==null?1:ovr.bri); for(const i of [0,1,4]){ const mm=box.material[i]; if(mm&&mm.color)mm.color.copy(c); } canopy.key=''; sign(); }});
    sign(); };
  const sign=()=>{ if(canopy){ const k=lines().join('|'); if(k!==canopy.key){ canopy.key=k; drawCanopy(); } }
    if(post){ const k=posterSrc()+'|'+title()+'|'+own('poster'); if(k!==post.key){ post.key=k; drawPoster(); } } };

  // double-click the projector in the booth: sound and the timeline for everyone, the rest for admins; admins also double-click the marquee and the poster
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const DLG='position:fixed;z-index:9;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,420px);max-height:86vh;overflow:auto;background:#141018;color:#f3e7dd;border:2px solid #bc923a;border-radius:12px;padding:16px;font:14px/1.5 system-ui';
  const BTN='font:600 13px system-ui;border:0;border-radius:6px;cursor:pointer;', RED=BTN+'background:#b22133;color:#fff;', DIM=BTN+'background:transparent;color:#c3a7a0;border:1px solid #3a2130;';
  const FLD='width:100%;box-sizing:border-box;font:inherit;background:#0e0a10;color:#f3e7dd;border:1px solid #3a2130;border-radius:6px;padding:7px';
  const LBL='display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#c3a7a0';
  const box_=()=>{ const d=document.createElement('div'); d.style.cssText=DLG; document.body.appendChild(d); for(const ev of ['keydown','keyup'])d.addEventListener(ev,e=>e.stopPropagation()); return d; };
  let dlg=null, edlg=null, tlT=0;
  const openMenu=async()=>{ '@later'; const a=await isAdmin(), c=cur(), B=bcfg(); if(!dlg)dlg=box_();
    dlg.innerHTML=`<div style="font:600 18px system-ui;color:#d8a845;margin-bottom:10px">THE PROJECTOR${a?' · admin':''}</div>
      <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #3a2130"><label><input id="cmsnd" type="checkbox" ${snd.on?'checked':''}> sound</label>
        <label style="display:block;margin-top:6px">Volume <span id="cmvv" style="color:#d8a845">${snd.vol}%</span><br><input id="cmv" type="range" min="0" max="100" value="${snd.vol}" style="width:100%"></label>
        <label style="display:block;margin-top:8px">Timeline <span id="cmtv" style="color:#d8a845">0:00 / 0:00</span>${a?'':' <span style="color:#8f7470;font-size:12px">(admins move it, for everyone)</span>'}<br><input id="cmt" type="range" min="0" max="1000" value="0" style="width:100%" ${a?'':'disabled'}></label></div>`+(a?`
      <label style="${LBL}">Play a YouTube link</label>
      <div style="display:flex;gap:6px;margin:4px 0 12px"><input id="cmu" placeholder="youtube.com/watch?v=..." style="${FLD};flex:1;min-width:0"><button id="cmplay" style="${RED}padding:0 12px">PLAY</button></div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">
        <label style="flex:1;min-width:120px">Size <span id="cmsv" style="color:#d8a845">${Math.round((c.size??1)*100)}%</span><br><input id="cms" type="range" min="40" max="100" value="${Math.round((c.size??1)*100)}" style="width:100%"></label>
        <label style="flex:1;min-width:120px">Brightness <span id="cmbv" style="color:#d8a845">${Math.round((c.brightness??.8)*100)}%</span><br><input id="cmb" type="range" min="20" max="120" value="${Math.round((c.brightness??.8)*100)}" style="width:100%"></label></div>
      <label style="${LBL}">Projector light</label>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin:4px 0 10px">
        <label style="flex:1 1 100%"><input id="cmbon" type="checkbox" ${B.on?'checked':''}> beam on</label>
        <label style="flex:1;min-width:120px">Beam <span id="cmbpv" style="color:#d8a845">${Math.round(B.power*100)}%</span><br><input id="cmbp" type="range" min="0" max="200" value="${Math.round(B.power*100)}" style="width:100%"></label>
        <label style="flex:1;min-width:120px">Warmth <span id="cmbwv" style="color:#d8a845">${Math.round(B.warm*100)}%</span><br><input id="cmbw" type="range" min="0" max="100" value="${Math.round(B.warm*100)}" style="width:100%"></label>
        <label style="flex:1;min-width:120px">Flicker <span id="cmbfv" style="color:#d8a845">${Math.round(B.flicker*100)}%</span><br><input id="cmbf" type="range" min="0" max="100" value="${Math.round(B.flicker*100)}" style="width:100%"></label>
        <label style="flex:1;min-width:120px">Glow on the room <span id="cmbsv" style="color:#d8a845">${Math.round(B.spill*100)}%</span><br><input id="cmbs" type="range" min="0" max="200" value="${Math.round(B.spill*100)}" style="width:100%"></label></div>
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
      const bset=(k,v)=>{ beamLive={...bcfg(),[k]:v}; }, bsave=async()=>{ say('...'); const ok=await push({beam:bcfg()}); if(ok)beamLive=null; say(ok?'light saved for everyone':SQLHINT); };
      $('#cmbon').onchange=e=>{ bset('on',e.target.checked); bsave(); };
      for(const [id,k] of [['cmbp','power'],['cmbw','warm'],['cmbf','flicker'],['cmbs','spill']]){ $('#'+id).oninput=e=>{ $('#'+id+'v').textContent=e.target.value+'%'; bset(k,+e.target.value/100); }; $('#'+id).onchange=bsave; }
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

  // the projection booth (an inside off the map, in through the door in the hall): the old projector throws the picture through its port; double-click it for the settings
  const booth={port:null,anim:()=>{}}; let BS=[];
  booth.build=BB=>{ '@later'; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Y=SHARED.BOD.Y, tw=Math.abs(X(1)-X(0)), x0=X(BB.x0), x1=X(BB.x1), zN=Z(BB.y0), zS=Z(BB.y1), H=Y(170), G=new THREE.Group(); G.name='booth-in'; scene.add(G);
    return ROOMS.part(G,()=>{ const L=(c,o={})=>new THREE.MeshLambertMaterial({color:c,...o}), add=(geo,mat,x,y,z,o={})=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); if(o.rx)m.rotation.x=o.rx; if(o.rz)m.rotation.z=o.rz; if(o.ry)m.rotation.y=o.ry; m.castShadow=!o.flat; m.receiveShadow=true; scene.add(m); return m; };
      const tex=(w,h,f,rx=1,ry=1)=>{ const c=canv(w,h); f(c.g,w,h); c.tex.wrapS=c.tex.wrapT=THREE.RepeatWrapping; c.tex.repeat.set(rx,ry); c.tex.needsUpdate=true; return c.tex; };
      const flo=tex(256,256,(g,w,h)=>{ g.fillStyle='#46464a'; g.fillRect(0,0,w,h); for(let i=0;i<2600;i++){ g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'90,90,96')+','+(Math.random()*.25)+')'; g.fillRect(Math.random()*w,Math.random()*h,2,2); } for(let i=0;i<5;i++){ const gr=g.createRadialGradient(0,0,0,0,0,30+Math.random()*30); gr.addColorStop(0,'rgba(0,0,0,.35)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.save(); g.translate(Math.random()*w,Math.random()*h); g.fillStyle=gr; g.fillRect(-60,-60,120,120); g.restore(); } },(x1-x0)/(3*tw),(zS-zN)/(3*tw));
      const blk=(rx,ry)=>tex(256,128,(g,w,h)=>{ g.fillStyle='#3a3e3c'; g.fillRect(0,0,w,h); for(let r=0;r<8;r++)for(let c=-1;c<5;c++){ const x=c*64+(r&1?32:0), v=84+Math.random()*14|0; g.fillStyle='rgb('+(v-4)+','+(v+4)+','+(v-2)+')'; g.fillRect(x+2,r*16+2,60,12); } },rx,ry);
      add(new THREE.PlaneGeometry(x1-x0,zS-zN).rotateX(-Math.PI/2),L(0xffffff,{map:flo}),(x0+x1)/2,.01,(zN+zS)/2,{flat:1});
      const wall=(w,h,x,z,ry,rx,ry2)=>{ const m=add(new THREE.BoxGeometry(w,h,.1*tw),L(0xffffff,{map:blk(rx,ry2)}),x,h/2,z,{ry,flat:1}); m.castShadow=false; return m; };
      wall(x1-x0,H,(x0+x1)/2,zN-.05*tw,0,(x1-x0)/(2.6*tw),H/(1.3*tw)); wall(zS-zN,H,x0-.05*tw,(zN+zS)/2,Math.PI/2,(zS-zN)/(2.6*tw),H/(1.3*tw)); wall(zS-zN,H,x1+.05*tw,(zN+zS)/2,Math.PI/2,(zS-zN)/(2.6*tw),H/(1.3*tw)); wall(x1-x0,Y(22),(x0+x1)/2,zS+.05*tw,0,(x1-x0)/(2.6*tw),.15);
      const px=X(BB.x0+3), vx=X(BB.x0+1.4), py=Y(66);
      for(const [x,on] of [[px,1],[vx,0]]){ add(new THREE.BoxGeometry(.9*tw,Y(30),.06*tw),L(0x121214),x,py,zN+.03*tw,{flat:1}); const gl=add(new THREE.PlaneGeometry(.7*tw,Y(21)),new THREE.MeshBasicMaterial({color:on?0xfff1d0:0x0a0a10}),x,py,zN+.07*tw,{flat:1}); if(!on){ booth.port=gl; booth.glass=gl.material; } }
      const DK=L(0x2a2d2f), GN=L(0x5f726a), CH=L(0xc8ced3), cxp=px, cz=Z(BB.y0+2.1);
      add(new THREE.BoxGeometry(.95*tw,Y(4),1.2*tw),DK,cxp,Y(2),cz);
      add(new THREE.CylinderGeometry(.18*tw,.24*tw,Y(28),12),GN,cxp,Y(18),cz);
      add(new THREE.BoxGeometry(.5*tw,Y(20),.66*tw),GN,cxp,Y(42),cz-.05*tw);
      add(new THREE.BoxGeometry(.6*tw,Y(32),.56*tw),DK,cxp,Y(46),cz+.58*tw);
      add(new THREE.CylinderGeometry(.1*tw,.1*tw,H-Y(62),10),DK,cxp,(H+Y(62))/2,cz+.58*tw);
      for(const s of [-1,1])for(let k=0;k<4;k++)add(new THREE.BoxGeometry(.02*tw,Y(2),.32*tw),new THREE.MeshBasicMaterial({color:0xff9a3c}),cxp+s*.305*tw,Y(40+k*4.5),cz+.58*tw,{flat:1});
      add(new THREE.CylinderGeometry(.07*tw,.08*tw,.45*tw,14),CH,cxp,Y(44),cz-.58*tw,{rx:Math.PI/2}); add(new THREE.CircleGeometry(.065*tw,14),new THREE.MeshBasicMaterial({color:0xfff4d8}),cxp,Y(44),cz-.81*tw,{ry:Math.PI,flat:1});
      const rt=tex(128,128,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); g.fillStyle='#c9ced2'; g.beginPath(); g.arc(64,64,62,0,7); g.fill(); g.fillStyle='#3a2a1e'; g.beginPath(); g.arc(64,64,48,0,7); g.fill(); g.fillStyle='#9aa1a6'; g.beginPath(); g.arc(64,64,30,0,7); g.fill();
        g.fillStyle='#2a2d30'; for(let k=0;k<5;k++){ g.save(); g.translate(64,64); g.rotate(k*1.2566); g.beginPath(); g.ellipse(0,-17,6,10,0,0,7); g.fill(); g.restore(); } g.fillStyle='#6d7378'; g.beginPath(); g.arc(64,64,6,0,7); g.fill(); });
      const RM=[CH,L(0xffffff,{map:rt}),L(0xffffff,{map:rt})]; reels.length=0;
      for(const dz of [-.42,.36]){ const r=add(new THREE.CylinderGeometry(.4*tw,.4*tw,.08*tw,24),RM,cxp,Y(70),cz+dz*tw,{rz:Math.PI/2}); reels.push(r); add(new THREE.BoxGeometry(.04*tw,Y(18),.05*tw),DK,cxp-.06*tw,Y(57),cz+dz*.6*tw); }
      for(const [a,b] of [[[-.7,62],[-.25,50]],[[.66,62],[.2,50]]]){ const A=new THREE.Vector3(cxp+.03*tw,Y(a[1]),cz+a[0]*tw), Bv=new THREE.Vector3(cxp+.03*tw,Y(b[1]),cz+b[0]*tw), m=add(new THREE.BoxGeometry(.012*tw,.012*tw,A.distanceTo(Bv)),L(0x2a1a10),(A.x+Bv.x)/2,(A.y+Bv.y)/2,(A.z+Bv.z)/2,{flat:1}); m.lookAt(Bv); }
      const bc=new THREE.BufferGeometry(), gp=new THREE.Vector3(cxp,Y(44),cz-.82*tw), gw=.3*tw, gh=Y(9), Q=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([a,b])=>[px+a*gw,py+b*gh,zN+.08*tw]), ps=[];
      for(let i=0;i<4;i++){ const a=Q[i], b=Q[(i+1)%4]; ps.push(gp.x,gp.y,gp.z,...a,...b); } bc.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));
      const bm=new THREE.Mesh(bc,new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); scene.add(bm);
      const bx0=X(BB.x1-.75), bz0=Z(BB.y0+.6), bz1=Z(BB.y0+3.6);
      add(new THREE.BoxGeometry(.7*tw,Y(4),bz1-bz0),L(0x3b2c22),bx0,Y(38),(bz0+bz1)/2); for(const z of [bz0+.1*tw,bz1-.1*tw])add(new THREE.BoxGeometry(.6*tw,Y(36),.06*tw),DK,bx0,Y(18),z);
      for(const z of [bz0+.6*tw,bz1-.7*tw])add(new THREE.CylinderGeometry(.25*tw,.25*tw,.05*tw,20),RM,bx0,Y(48),z,{rz:Math.PI/2});
      for(let k=0;k<6;k++)add(new THREE.CylinderGeometry(.3*tw,.3*tw,Y(5),18),CH,X(BB.x1-.6)+(k%2)*.05*tw,Y(2.6+k*5.2),Z(BB.y1-.9));
      add(new THREE.CylinderGeometry(.16*tw,.16*tw,Y(30),10),L(0x5a2a22),X(BB.x0+2),Y(15),Z(BB.y0+3));
      add(new THREE.ConeGeometry(.16*tw,Y(10),12,1,true),L(0x2c3230,{side:THREE.DoubleSide}),bx0,Y(78),(bz0+bz1)/2); add(new THREE.SphereGeometry(.05*tw,8,6),new THREE.MeshBasicMaterial({color:0xffd9a0}),bx0,Y(74),(bz0+bz1)/2,{flat:1});
      const lamp=new THREE.PointLight(0xffb870,9,6*TILE,1.5); const tube=new THREE.PointLight(0xdfe8ff,6,7*TILE,1.5); tube.position.set((x0+x1)/2,Y(150),(zN+zS)/2); scene.add(tube); lamp.position.set(bx0,Y(72),(bz0+bz1)/2); scene.add(lamp);
      const glo=new THREE.PointLight(0xff9440,2.4,2.4*TILE,1.6); glo.position.set(cxp,Y(46),cz+.58*tw); scene.add(glo);
      if(post){ add(new THREE.PlaneGeometry(.9*tw,.9*tw*40/27),new THREE.MeshBasicMaterial({map:post.tex}),x0+.02*tw,Y(72),Z(BB.y0+3.6),{ry:Math.PI/2,flat:1}); }
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1.1*tw,Y(90),2.2*tw),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(cxp,Y(45),cz); scene.add(hb);
      UI.thing({name:'THE PROJECTOR',obj:hb,reach:1.8*TILE,near:3.2*TILE,tall:Y(90),act:()=>openMenu()});
      const R4=(a,b,c,d)=>[Math.min(a,c),Math.min(b,d),Math.max(a,c),Math.max(b,d)]; BS=[R4(cxp-.48*tw,cz-.95*tw,cxp+.48*tw,cz+.95*tw),R4(bx0-.36*tw,bz0,bx0+.36*tw,bz1),R4(X(BB.x1-.95),Z(BB.y1-1.25),X(BB.x1-.25),Z(BB.y1-.55))]; SOL.up.push(...BS);
      booth.anim=now=>{ const on=!!vid(cur().video_id); if(on)for(const r of reels)r.rotation.x-=.035*(r===reels[0]?1:1.3); const c=bcfg(); bm.visible=on&&!!c.on; bm.material.color.copy(bcol(c)); bm.material.opacity=(.05+(.02*Math.sin(now/1000*23)+.012*Math.sin(now/1000*7))*c.flicker*2)*c.power; glo.intensity=2.6+.3*Math.sin(now/1000*17); };
    }); };
  const reels=[];
  booth.unbuild=()=>{ '@later'; for(const r of BS){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } BS=[]; booth.port=null; booth.glass=null; booth.anim=()=>{}; reels.length=0; };
  CINEMA.booth=booth;

  let attached=false;
  const attach=()=>{ if(attached)return; const m=STORE.main&&STORE.main.theatre; if(!m||!m.fm)return; attached=true;
    for(const [x,z] of m.exits||[]){ const hb=new THREE.Mesh(new THREE.BoxGeometry(.5*TILE,2.4*TILE,1.2*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,1.2*TILE,z); scene.add(hb); UI.thing({name:'EXIT',ghost:1,obj:hb,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act:()=>STORE.exit('theatre')}); }
    buildSigns(m); buildRig(m); };

  window.CINEMA=CINEMA; SYS.add('places',()=>{ mkCut(); attach(); tick(); },'059f-cinema');
  (async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,250)); await LOAD('later'); isAdmin().then(a=>{ CINEMA.admin=!!a; }); pull(); setInterval(()=>{ if(document.visibilityState!=='hidden')pull(); },5000); })();   // after the start, so the later chunk is not pulled in early
}
