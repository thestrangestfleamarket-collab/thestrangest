// THE CRT TV: a big old set on its wooden stand in every apartment, shared by everyone in the room (data/tv.json: public-domain cartoons and shows from the Internet Archive, each channel on the real clock; THE GUIDE plays any cartoon, show or film on demand); double-click it for power, channel, volume, the guide, a close-up and full screen.
import {THREE} from './003-shx.js';
import {CINEMA, ONLINE, SFX, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const TVJ=__LAZY__("data/tv.json");
  const CRT={data:null,on:false,chn:2,vol:.5,pick:null,t0:0,snow:0,err:false,unit:null}; window.CRT=CRT;
  const EPOCH=Date.UTC(2026,10,5);
  const home=()=>!!(MODS.apts&&MODS.apts.inReal);
  const chans=()=>CRT.data?CRT.data.channels:[];
  const chan=()=>chans().find(c=>c.ch===CRT.chn)||chans()[0];
  // what a channel shows now: its shows one after another from a fixed start, looped
  const nowOn=(C,t=Date.now())=>{ if(!C||!C.shows||!C.shows.length)return null; const L=C.shows.reduce((a,s)=>a+s.len,0); let r=((t-EPOCH)/1000)%L; if(r<0)r+=L; for(const s of C.shows){ if(r<s.len)return {s,off:r}; r-=s.len; } return {s:C.shows[0],off:0}; };
  CRT.nowOn=nowOn;
  // what this set shows now: on THE GUIDE a pick (from when it was picked) or the guide's own page, else the channel's loop
  const live=(t=Date.now())=>{ const p=CRT.pick; if(!p)return null; const off=(t-CRT.t0)/1000; return off>=-5&&off<p.len?Math.max(0,off):null; };
  const showing=(t=Date.now())=>{ const C=chan(); if(!C)return null; if(C.guide){ const off=live(t); return off!=null?{s:CRT.pick,off,demand:true}:{guide:true}; } return nowOn(C,t); };

  /* ---------- the picture: one shader for the set in the room and the close-up (a curved tube, scanlines, the phosphor grille, the glass) ---------- */
  const U={uMap:{value:null},uOn:{value:0},uT:{value:0},uAsp:{value:1},uLive:{value:0}};
  const MAT=new THREE.ShaderMaterial({uniforms:U,vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`uniform sampler2D uMap; uniform float uOn, uT, uAsp, uLive; varying vec2 vU;
      vec2 bend(vec2 u){ u=u*2.-1.; vec2 o=abs(u.yx)/vec2(4.4,3.8); u+=u*o*o; return u*.5+.5; }
      float rbox(vec2 u,float r){ vec2 q=abs(u-.5)*2.-(1.-r); return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
      void main(){
        vec2 u=bend(vU); float m=1.-smoothstep(-.012,.01,rbox(u,.16));
        float sy=max(.004,smoothstep(.12,.85,uOn)), sx=max(.006,smoothstep(0.,.3,uOn)); vec2 c=(u-.5)/vec2(sx,sy), p=c+.5;
        float inn=step(abs(c.x),.5)*step(abs(c.y),.5);
        vec2 q=p; if(uAsp>1.)q.y=(p.y-.5)*uAsp+.5; else q.x=(p.x-.5)/uAsp+.5; float lb=step(0.,q.y)*step(q.y,1.)*step(0.,q.x)*step(q.x,1.);
        float ab=.0024*uLive; vec3 col=vec3(texture2D(uMap,q+vec2(ab,0.)).r,texture2D(uMap,q).g,texture2D(uMap,q-vec2(ab,0.)).b);
        col=pow(col,vec3(.92))*1.18;
        float L=262., f=fwidth(p.y*L); col*=mix(1.,.6+.4*(.5+.5*cos(p.y*L*6.2832)),1.-smoothstep(.35,.9,f));
        float X=p.x*420., fx=fwidth(X), k=fract(X); vec3 gr=vec3(step(k,.333),step(.333,k)*step(k,.667),step(.667,k)); col*=mix(vec3(1.),.45+.85*gr,(1.-smoothstep(.25,.7,fx))*.55);
        col*=.965+.035*sin(uT*47.+p.y*9.); col*=1.+.05*smoothstep(.92,1.,fract(p.y*.6-uT*.09));
        col*=pow(clamp(16.*u.x*u.y*(1.-u.x)*(1.-u.y),0.,1.),.2);
        col=mix(col,vec3(1.,1.,.96),(1.-sy)*.9);
        col*=inn*lb*step(.001,uOn);
        vec3 glass=vec3(.026,.031,.032)+vec3(.075,.085,.085)*(1.-smoothstep(0.,.5,length((vU-vec2(.27,.8))*vec2(1.,1.5))))+vec3(.018)*smoothstep(.4,1.,vU.y);
        gl_FragColor=vec4((glass+col)*m+vec3(.008)*(1.-m),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});

  /* ---------- what feeds it: the video, snow (between shows, while it tunes, no signal), THE GUIDE's page ---------- */
  const V=document.createElement('video'); V.playsInline=true; V.preload='auto'; V.crossOrigin='anonymous'; V.muted=false;
  V.addEventListener('error',()=>{ if(src)CRT.err=true; });
  const vt=new THREE.VideoTexture(V); vt.colorSpace=THREE.SRGBColorSpace; vt.minFilter=vt.magFilter=THREE.LinearFilter;
  const sc=document.createElement('canvas'); sc.width=96; sc.height=72; const st=new THREE.CanvasTexture(sc); st.colorSpace=THREE.SRGBColorSpace; st.magFilter=THREE.NearestFilter;
  const gc=document.createElement('canvas'); gc.width=384; gc.height=288; const gt=new THREE.CanvasTexture(gc); gt.colorSpace=THREE.SRGBColorSpace;
  const snow=()=>{ '@later'; const g=sc.getContext('2d'), im=g.createImageData(96,72); for(let i=0;i<96*72;i++){ const v=Math.random()*210|0; im.data[i*4]=im.data[i*4+1]=v; im.data[i*4+2]=v+12; im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const C=chan(); g.font='bold 11px monospace'; if(C){ g.fillStyle='rgba(0,0,0,.55)'; g.fillRect(4,4,36,14); g.fillStyle='#7dff8a'; g.fillText('CH '+C.ch,6,15); }
    if(CRT.err){ g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(14,30,68,14); g.fillStyle='#fff'; g.fillText('NO SIGNAL',20,41); } st.needsUpdate=true; };
  let src='';
  const url=s=>(location.protocol==='file:'?'https://archive.org/download/':'/film/')+s.id+'/'+s.file;
  const stop=()=>{ if(src){ V.pause(); V.removeAttribute('src'); V.load(); src=''; } };
  const tune=()=>{ '@later'; const sh=CRT.on&&home()?showing():null; if(!sh||sh.guide){ stop(); return; } const u=url(sh.s);
    if(u!==src){ src=u; CRT.err=false; V.src=u; V.currentTime=sh.off; CRT.snow=Math.max(CRT.snow,.5); }
    V.volume=CRT.vol; if(V.paused){ const p=V.play(); if(p&&p.catch)p.catch(()=>{ V.muted=true; V.play().catch(()=>{}); addEventListener('pointerdown',()=>{ V.muted=false; },{once:true}); }); }
    if(V.readyState>0&&!V.seeking&&Math.abs(sh.off-V.currentTime)>4)V.currentTime=sh.off; };
  const look=()=>{ const sh=CRT.on&&CRT.data?showing():null; let m=null, lv=0;
    if(sh&&sh.guide)m=gt; else if(CRT.on){ lv=CRT.snow<=0&&!CRT.err&&V.readyState>=2?1:0; m=lv?vt:st; }
    U.uMap.value=m; U.uLive.value=lv; U.uAsp.value=lv&&V.videoWidth&&V.videoHeight?(V.videoWidth/V.videoHeight)/(4/3):1; };
  const load=()=>CRT.data?Promise.resolve(CRT.data):TVJ().then(d=>{ CRT.data=d; L_=null; return d; });

  // everything THE GUIDE can play: every channel's cartoons and shows, and the cinema's films
  let L_=null; const lists=()=>{ if(L_)return L_; const o={cartoons:[],shows:[],movies:[]};
    for(const c of chans()){ if(c.guide)continue; for(const s of c.shows)(o[c.kind==='shows'?'shows':'cartoons']).push({id:s.id,file:s.file,title:s.title,year:s.year||0,len:s.len,grp:c.kind==='shows'?(s.series||c.name):c.name}); }
    for(const f of (CINEMA.films||[]))o.movies.push({id:f.id,file:f.file,title:f.title,year:f.year||0,len:f.len,grp:'FEATURE FILMS'});
    o.shows.sort((a,b)=>a.grp<b.grp?-1:a.grp>b.grp?1:0); o.movies.sort((a,b)=>a.title<b.title?-1:1); return L_=o; };
  const fit=(s,g,w)=>{ if(g.measureText(s).width<=w)return s; while(s.length>1&&g.measureText(s+'…').width>w)s=s.slice(0,-1); return s+'…'; };
  let gy=0; const guidePic=()=>{ '@later'; const g=gc.getContext('2d'), W=384, H=288, A=lists(), all=[...A.cartoons,...A.shows,...A.movies];
    g.fillStyle='#0b1c5e'; g.fillRect(0,0,W,H); g.fillStyle='#1f43b0'; g.fillRect(0,0,W,30); g.fillStyle='#ffd23a'; g.font='bold 18px monospace'; g.fillText('THE GUIDE',10,22);
    const d=new Date(); g.fillStyle='#fff'; g.font='bold 14px monospace'; const tm=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}); g.fillText(tm,W-10-g.measureText(tm).width,21);
    let y=36; for(const C of chans()){ if(C.guide)continue; const n=nowOn(C); g.fillStyle='#c89a1c'; g.fillRect(6,y,44,24); g.fillStyle='#1a1205'; g.font='bold 13px monospace'; g.fillText('CH'+C.ch,10,y+17);
      g.fillStyle='#fff'; g.font='bold 11px monospace'; g.fillText(fit(C.name,g,320),58,y+10); g.fillStyle='#9fd0ff'; g.font='11px monospace'; g.fillText(fit(n?n.s.title:'',g,320),58,y+22); y+=28; }
    g.fillStyle='#1f43b0'; g.fillRect(0,y+2,W,18); g.fillStyle='#ffd23a'; g.font='bold 12px monospace'; g.fillText('ON DEMAND · '+all.length+' TO PICK',8,y+15);
    const top=y+22, bot=H-18; g.save(); g.beginPath(); g.rect(0,top,W,bot-top); g.clip(); g.font='12px monospace';
    if(all.length){ const lh=16, tot=all.length*lh, o=gy%tot; for(let i=0;;i++){ const yy=top+12+i*lh-o; if(yy>bot+lh)break; const it=all[((i%all.length)+all.length)%all.length]; g.fillStyle=i%2?'#d8e6ff':'#fff'; g.fillText(fit(it.title+(it.year?' ('+it.year+')':''),g,W-16),8,yy); } }
    g.restore(); g.fillStyle='#091442'; g.fillRect(0,bot,W,18); g.fillStyle='#7dff8a'; g.font='bold 11px monospace'; g.fillText('PICK ANYTHING: DOUBLE-CLICK THE SET',8,bot+13); gt.needsUpdate=true; };

  /* ---------- shared: everyone in the apartment watches the same; kept with the owner's layout, told to the room as it changes ---------- */
  const okPick=p=>p&&typeof p==='object'&&/^[A-Za-z0-9_.-]{1,80}$/.test(p.id||'')&&/^[A-Za-z0-9_.-]{1,120}\.mp4$/.test(p.file||'')&&+p.len>0?{id:p.id,file:p.file,title:String(p.title||'').slice(0,90),year:+p.year||0,len:+p.len}:null;
  const wire=()=>({on:CRT.on?1:0,ch:CRT.chn,p:CRT.pick,t0:Math.round(CRT.t0)});
  const set=w=>{ w=w||{}; const was=JSON.stringify(wire()); CRT.on=!!w.on; CRT.chn=Math.max(0,Math.min(99,w.ch|0))||2; CRT.pick=okPick(w.p); CRT.t0=+w.t0||0;
    if(JSON.stringify(wire())!==was){ if(CRT.on)CRT.snow=Math.max(CRT.snow,.4); if(CRT.on&&home()&&CRT.data){ tune(); look(); } draw(1); } };
  const share=()=>{ ROOMK.save(); if(ONLINE.on&&ONLINE.send&&home())ONLINE.send({t:'tv',...wire()}); };
  ONLINE.hear.tv=m=>{ if(!home())return; set(m); if(!ROOMK.guest())ROOMK.save(); };
  ROOMK.keep.push({ out:L=>{ L.tv=wire(); }, in:L=>{ set(L.tv); } });
  const others=()=>{ const me='apt:'+(ONLINE.me||''); for(const o of ONLINE.others.values())if(o.p&&o.p.rm===me)return true; return false; };

  const changed=()=>{ CRT.snow=Math.max(CRT.snow,.5); snow(); tune(); look(); draw(1); share(); };
  CRT.power=on=>{ CRT.on=on==null?!CRT.on:!!on; if(CRT.on)changed(); else { stop(); look(); draw(1); share(); } };
  CRT.channel=n=>{ CRT.chn=n; CRT.on=true; changed(); if(SFX)SFX.play('click',{vol:.5,vary:.2}); };
  CRT.step=d=>{ const C=chans(); if(!C.length)return; const i=Math.max(0,C.indexOf(chan())); CRT.channel(C[((i+d)%C.length+C.length)%C.length].ch); };
  CRT.choose=it=>{ const G=chans().find(c=>c.guide), p=okPick(it); if(!G||!p)return; CRT.chn=G.ch; CRT.on=true; CRT.pick=p; CRT.t0=Date.now(); changed(); if(SFX)SFX.play('click',{vol:.6,vary:.2}); };
  CRT.unpick=()=>{ CRT.pick=null; changed(); };
  CRT.volume=v=>{ CRT.vol=Math.max(0,Math.min(1,v)); V.volume=CRT.vol; };

  /* ---------- the control panel ---------- */
  const P=document.createElement('div'); P.id='crtp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(400px,92vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent=`#crtp .row{display:flex;align-items:center;gap:6px;margin:8px 0;flex-wrap:wrap} #crtp .row>span:first-child{width:74px} #crtp input[type=range]{flex:1} #crtp .btn{font:inherit;padding:5px 8px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #crtp .btn.on{background:#3b2a1e;color:#ece5d3} #crtp .mclose{float:right} #crtp .now{margin-top:6px;min-height:28px;color:#6a4a32}
    #crtp .gl{max-height:34vh;overflow-y:auto;border:1px solid currentColor;padding:4px;margin-top:6px} #crtp .gl h4{margin:8px 2px 3px;font:inherit;opacity:.7} #crtp .gl .it{display:block;width:100%;text-align:left;margin:2px 0;padding:4px 6px} #crtp .gl .it small{float:right;opacity:.7}
    #crtw{position:fixed;inset:0;z-index:60;background:radial-gradient(ellipse at 50% 46%,#1c2433 0%,#07080b 62%,#000 100%);display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:default}
    #crtw .tv{position:relative;flex:none;background:linear-gradient(180deg,#3c3a3e,#1c1b1e 55%,#121113);border-radius:5%/6.5%;box-shadow:0 40px 120px #000,0 0 160px rgba(120,160,220,.12),inset 0 2px 0 #5b595e,inset 0 -4px 10px #000}
    #crtw .tv canvas{display:block;border-radius:2.5%/3.3%;box-shadow:0 0 0 3px #0b0b0c,0 0 0 7px #2a292c}
    #crtw .tv .knobs{position:absolute;right:6%;bottom:2.6%;display:flex;gap:1.4vmin} #crtw .tv .knobs i{display:block;width:3.2vmin;height:3.2vmin;border-radius:50%;background:radial-gradient(circle at 35% 30%,#aaa,#333 60%,#111)} #crtw .tv .brand{position:absolute;left:7%;bottom:3.6%;font:bold 1.6vmin monospace;letter-spacing:.4vmin;color:#8d8a80}
    #crtw .bar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:6px;flex-wrap:wrap;justify-content:center;transition:opacity .4s;z-index:40} #crtw #crtp{left:auto!important;right:12px!important;top:12px!important;transform:none!important;width:min(330px,38vw)!important;max-height:calc(100vh - 90px);overflow-y:auto} #crtw #crtp .gl{max-height:none} #crtw.idle .bar{opacity:0} #crtw.idle{cursor:none}
    #crtw .bar button{font:11px Silkscreen,monospace;letter-spacing:.4px;padding:6px 10px;color:#ece5d3;background:rgba(20,18,16,.78);border:2px solid #ece5d3;cursor:pointer} #crtw .bar button:hover{background:#ece5d3;color:#3b2a1e}`;
  document.head.appendChild(css); document.body.appendChild(P);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const mins=s=>Math.max(1,Math.round(s/60))+' MIN';
  let tab='cartoons';
  const nowLine=()=>{ const C=chan(), sh=CRT.on&&C?showing():null;
    return !CRT.on||!C?'THE SET IS OFF.':`CH ${C.ch} · ${esc(C.name)}<br>`+(sh&&sh.guide?'THE GUIDE: PICK SOMETHING BELOW.':sh?`${sh.demand?'ON DEMAND':'NOW'}: ${esc(sh.s.title)}${sh.s.year?' ('+sh.s.year+')':''} · ${Math.floor(sh.off/60)}/${mins(sh.s.len)}`:'')+`<br><span style="opacity:.7">${ROOMK.guest()?'YOUR HOST\'S SET: EVERYONE HERE SEES THE SAME.':'EVERYONE IN YOUR APARTMENT SEES THE SAME.'}</span>`; };
  const draw=full=>{ '@later'; if(P.hidden||!CRT.data)return; const C=chan(), nw=P.querySelector('.now');
    if(!full&&nw){ nw.innerHTML=nowLine(); return; }
    const gl=P.querySelector('.gl'), keep=gl?gl.scrollTop:0, A=lists(), L=A[tab]||[], cur=live()!=null&&CRT.pick;
    let rows='', grp=null; L.forEach((it,i)=>{ if(it.grp!==grp){ grp=it.grp; rows+=`<h4>${esc(grp)}</h4>`; } rows+=`<button class="btn it ${cur&&cur.id===it.id&&cur.file===it.file?'on':''}" data-g="${i}">${esc(it.title)}${it.year?' ('+it.year+')':''}<small>${mins(it.len)}</small></button>`; });
    P.innerHTML=`<div><b>THE CRT TV</b> <button class="btn mclose" data-a="close">DONE</button></div>
      <div class="row"><span>POWER</span><button class="btn ${CRT.on?'on':''}" data-a="on">ON</button><button class="btn ${CRT.on?'':'on'}" data-a="off">OFF</button></div>
      <div class="row"><span>CHANNEL</span><button class="btn" data-a="dn">&lt;</button>${chans().map(c=>`<button class="btn ${CRT.on&&c===C?'on':''}" data-c="${c.ch}" title="${esc(c.name)}">${c.ch}</button>`).join('')}<button class="btn" data-a="up">&gt;</button></div>
      <div class="row"><span>VOLUME</span><input type="range" min="0" max="100" value="${Math.round(CRT.vol*100)}" data-k="vol"><span>${Math.round(CRT.vol*100)}%</span></div>
      <div class="row"><span>WATCH</span>${W.open?'<button class="btn" data-a="room">BACK TO THE ROOM</button>':'<button class="btn" data-a="zoom">ZOOM IN</button>'}<button class="btn ${W.full?'on':''}" data-a="full">FULL SCREEN</button></div>
      <div class="now">${nowLine()}</div>
      ${C&&C.guide?`<div class="row" style="margin-top:10px">${['cartoons','shows','movies'].map(k=>`<button class="btn ${tab===k?'on':''}" data-t="${k}">${k.toUpperCase()} ${A[k].length}</button>`).join('')}${cur?'<button class="btn" data-a="unpick">STOP</button>':''}</div><div class="gl">${rows||'NOTHING HERE YET.'}</div>`:''}`;
    const g2=P.querySelector('.gl'); if(g2)g2.scrollTop=keep; };
  CRT.open=()=>load().then(()=>{ P.hidden=false; if(chan()&&chan().guide&&!lists()[tab].length)tab='cartoons'; draw(1); }).catch(e=>console.warn('CRT: the channels did not load',e)); CRT.close=()=>{ P.hidden=true; };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b)return; const a=b.dataset.a;
    if(a==='close')return CRT.close(); if(a==='on')CRT.power(true); else if(a==='off')CRT.power(false); else if(a==='up')CRT.step(1); else if(a==='dn')CRT.step(-1);
    else if(a==='zoom')CRT.watch(true); else if(a==='room')CRT.watch(false); else if(a==='full')CRT.full(); else if(a==='unpick')CRT.unpick();
    else if(b.dataset.c!=null)CRT.channel(+b.dataset.c); else if(b.dataset.t){ tab=b.dataset.t; draw(1); const g=P.querySelector('.gl'); if(g)g.scrollTop=0; }
    else if(b.dataset.g!=null){ const it=(lists()[tab]||[])[+b.dataset.g]; if(it)CRT.choose(it); } });
  P.addEventListener('input',e=>{ const t=e.target; if(t.dataset.k!=='vol')return; CRT.volume(+t.value/100); if(t.nextElementSibling)t.nextElementSibling.textContent=t.value+'%'; });

  /* ---------- the close-up: the set's front filling your view, zoom in until the picture fills it, full screen ---------- */
  const W={open:false,full:false,z:1,el:null,R:null,sc:null,cam:null,raf:0,idle:0};
  const h0=()=>Math.min(innerHeight*.74,innerWidth*.86*.75);
  const fill=()=>Math.max(innerHeight/h0(),innerWidth*.75/h0());
  const place=()=>{ if(!W.el||!W.R)return; const h=Math.round(h0()*W.z), w=Math.round(h*4/3), tv=W.el.querySelector('.tv'), pad=Math.round(h*.07);
    tv.style.padding=pad+'px '+pad+'px '+Math.round(h*.13)+'px'; W.R.setPixelRatio(Math.min(devicePixelRatio||1,2,2600/w)); W.R.setSize(w,h); };
  const zoom=k=>{ W.z=Math.max(.6,Math.min(4,W.z*k)); place(); };
  const wbuild=()=>{ '@later'; if(W.el)return; const el=W.el=document.createElement('div'); el.id='crtw'; el.hidden=true;
    el.innerHTML=`<div class="tv"><canvas></canvas><span class="brand">STRANGEST</span><span class="knobs"><i></i><i></i></span></div><div class="bar"><button data-w="dn">&lt; CH</button><button data-w="up">CH &gt;</button><button data-w="guide">GUIDE</button><button data-w="menu">MENU</button><button data-w="out">ZOOM −</button><button data-w="in">ZOOM +</button><button data-w="full">FULL SCREEN</button><button data-w="x">✕ BACK</button></div>`;
    document.body.appendChild(el);
    W.R=new THREE.WebGLRenderer({canvas:el.querySelector('canvas'),antialias:false}); W.R.outputColorSpace=THREE.SRGBColorSpace; W.R.toneMapping=THREE.NoToneMapping;
    W.sc=new THREE.Scene(); W.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,2); W.cam.position.z=1; const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),MAT); q.frustumCulled=false; W.sc.add(q);
    el.querySelector('.bar').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const a=b.dataset.w;
      if(a==='dn')CRT.step(-1); else if(a==='up')CRT.step(1); else if(a==='guide'){ const G=chans().find(c=>c.guide); if(G)CRT.channel(G.ch); CRT.open(); } else if(a==='menu'){ if(P.hidden)CRT.open(); else CRT.close(); }
      else if(a==='in')zoom(1.2); else if(a==='out')zoom(1/1.2); else if(a==='full')CRT.full(); else if(a==='x')CRT.watch(false); });
    for(const ev of ['pointerdown','mousedown','click','dblclick','contextmenu','pointerup','mouseup'])el.addEventListener(ev,e=>{ if(!P.contains(e.target))e.stopPropagation(); });
    el.addEventListener('wheel',e=>{ if(P.contains(e.target))return; e.preventDefault(); e.stopPropagation(); zoom(e.deltaY<0?1.12:1/1.12); },{passive:false});
    el.addEventListener('pointermove',()=>{ W.idle=0; el.classList.remove('idle'); });
    addEventListener('resize',()=>{ if(W.open){ if(W.full)W.z=fill(); place(); } }); };
  const loop=()=>{ if(!W.open)return; W.raf=requestAnimationFrame(loop); W.R.render(W.sc,W.cam); };
  CRT.watch=on=>{ '@later'; on=on==null?!W.open:!!on; if(on===W.open)return draw(1);
    if(on){ wbuild(); W.open=true; W.z=1; W.el.hidden=false; W.el.appendChild(P); place(); loop(); if(!CRT.on)CRT.power(true); }
    else { W.open=false; W.full=false; cancelAnimationFrame(W.raf); if(document.fullscreenElement)document.exitFullscreen().catch(()=>{}); W.el.hidden=true; document.body.appendChild(P); }
    draw(1); };
  CRT.full=on=>{ '@later'; on=on==null?!W.full:!!on; if(on&&!W.open)CRT.watch(true); W.full=on;
    try{ if(on&&!document.fullscreenElement&&W.el.requestFullscreen)W.el.requestFullscreen().catch(()=>{}); else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{}); }catch(e){}
    W.z=on?fill():1; place(); setTimeout(()=>{ if(W.open){ W.z=W.full?fill():W.z; place(); } },250); draw(1); };
  document.addEventListener('fullscreenchange',()=>{ if(W.open&&!document.fullscreenElement&&W.full){ W.full=false; W.z=1; place(); draw(1); } });
  addEventListener('keydown',e=>{ if(!W.open||/^F\d+$/.test(e.key)||e.key==='Tab'||(e.target&&e.target.closest&&e.target.closest('input,textarea')))return; const k=e.key;
    if(k==='Escape')CRT.watch(false); else if(k==='ArrowRight'||k==='ArrowUp')CRT.step(1); else if(k==='ArrowLeft'||k==='ArrowDown')CRT.step(-1);
    else if(k==='+'||k==='=')zoom(1.2); else if(k==='-'||k==='_')zoom(1/1.2); else if(k==='f'||k==='F')CRT.full(); else if(k==='g'||k==='G'){ if(P.hidden)CRT.open(); else CRT.close(); }
    e.stopImmediatePropagation(); e.preventDefault(); },true);

  /* ---------- the set and its stand, in your apartment's living room corner ---------- */
  const glassGeo=(w,h,b)=>{ const g=new THREE.PlaneGeometry(w,h,20,15), p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i)/(w/2), y=p.getY(i)/(h/2); p.setZ(i,b*(1-.5*(x*x+y*y))); } g.computeVertexNormals(); return g; };
  const rr=(s,w,h,r,cx=0,cy=0)=>{ const x=cx-w/2, y=cy-h/2; s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r); s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h); s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r); s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y); return s; };
  for(const k of ['CRT TV'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const U0=c.Lx-.64, V0=c.Ly-.34, RY=Math.PI;   // in the back corner of the living room's far wall, facing into the room (owner, 9 Nov 2026)
    const wood=mat([92,58,34]), woodD=mat([60,38,22]), black=mat([28,28,30]), shell=mat([36,35,38]), grey=mat([58,58,62]), chrome=mat([176,178,184]), grille=mat([22,22,24]);
    cap('CRT TV',()=>{ const g=new THREE.Group(); g.position.set(U0,0,V0); g.rotation.y=RY; cur().add(g);
      // the stand: a low walnut cabinet, an open shelf with the tape deck, two doors below
      const SW=1.06, SD=.5, SH=.56; p(rbox(SW,.04,SD,.008),wood,0,SH-.02,0,0,g); p(rbox(SW,.04,SD,.008),wood,0,.06,0,0,g);
      for(const s of [-1,1])p(rbox(.04,SH-.04,SD,.006),wood,s*(SW/2-.02),SH/2,0,0,g); p(rbox(SW,SH-.04,.02,.004),woodD,0,SH/2,-SD/2+.01,0,g); p(rbox(SW-.08,.025,SD-.04,.004),wood,0,.33,0,0,g);
      for(const s of [-1,1]){ p(rbox(SW/2-.05,.22,.02,.006),wood,s*SW/4,.19,SD/2-.01,0,g); p(rbox(.012,.06,.012,.003),chrome,s*.05,.19,SD/2+.004,0,g); }
      for(const s of [-1,1])for(const t of [-1,1])p(new THREE.CylinderGeometry(.018,.014,.04,8),woodD,s*(SW/2-.06),.02,t*(SD/2-.06),0,g);
      p(rbox(.42,.08,.3,.006),black,-.2,.39,.02,0,g); p(rbox(.18,.012,.006,.002),grey,-.25,.4,.172,0,g); keep(p(new THREE.PlaneGeometry(.05,.016),new THREE.MeshBasicMaterial({color:0x5aff7a}),-.05,.4,.1715,0,g,false));
      for(let i=0;i<3;i++)p(rbox(.02,.15,.12,.003),mat([[40,40,46],[150,40,40],[50,70,120]][i]),.18+i*.04,.43,0,0,g);
      // the set: a rounded cabinet, a moulded bezel round a 4:3 tube, its curved glass, the tapered tube housing behind, the dial column on the right, rabbit ears on top
      const T=new THREE.Group(); T.position.set(0,SH,0); g.add(T); const BW=.86, BH=.72, BD=.38, FZ=.2, SX=-.07, SY=.44, SWo=.6, SHo=.45;
      p(rbox(BW,BH,BD,.05),shell,0,BH/2+.02,FZ-BD/2,0,T);
      const S=rr(new THREE.Shape(),BW-.02,BH-.02,.06,0,BH/2+.02); S.holes.push(rr(new THREE.Path(),SWo,SHo,.05,SX,SY));
      p(new THREE.ExtrudeGeometry(S,{depth:.022,bevelEnabled:true,bevelThickness:.01,bevelSize:.012,bevelSegments:2,curveSegments:6}),black,0,0,FZ+.01,0,T);
      const glass=keep(p(glassGeo(SWo+.03,SHo+.03,.032),MAT,SX,SY,FZ+.004,0,T,false)); glass.userData.screen=1;
      const back=new THREE.CylinderGeometry(.17,.36,.3,4,1).rotateX(-Math.PI/2).rotateZ(Math.PI/4); back.scale(1.18,.95,1); p(back,shell,SX*.4,SY-.02,FZ-BD-.15,0,T);
      const CX=SX+SWo/2+(BW/2-(SX+SWo/2))/2+.005;
      p(new THREE.CylinderGeometry(.05,.054,.03,24).rotateX(Math.PI/2),grey,CX,.56,FZ+.045,0,T); p(rbox(.014,.07,.02,.004),chrome,CX,.56,FZ+.064,0,T);
      p(new THREE.CylinderGeometry(.03,.033,.026,20).rotateX(Math.PI/2),grey,CX,.42,FZ+.043,0,T); p(rbox(.008,.04,.016,.003),chrome,CX,.42,FZ+.058,0,T);
      for(let i=0;i<6;i++)p(rbox(.1,.008,.01,.002),grille,CX,.31-i*.022,FZ+.036,0,T);
      p(rbox(.05,.024,.016,.004),chrome,CX-.012,.13,FZ+.04,0,T); keep(p(new THREE.CircleGeometry(.007,10),new THREE.MeshBasicMaterial({color:0xff3a2a}),CX+.035,.13,FZ+.034,0,T,false)).userData.led=1;
      for(const s of [-1,1])p(rbox(.05,.02,.05,.006),black,s*(BW/2-.08),.01,FZ-BD/2,0,T);
      p(new THREE.SphereGeometry(.05,14,8,0,Math.PI*2,0,Math.PI/2),black,.16,BH+.02,-.02,0,T);
      for(const s of [-1,1]){ const r=new THREE.Group(); r.position.set(.16,BH+.05,-.02); r.rotation.set(-.18,0,s*.5); T.add(r); p(new THREE.CylinderGeometry(.004,.005,.56,6),chrome,0,.28,0,0,r); p(new THREE.SphereGeometry(.009,8,6),chrome,0,.56,0,0,r); }
      const L=new THREE.PointLight(0x9ab8e0,0,2.8*c.M,2); L.position.set(SX,SY,.6); L.userData.tv=1; L.userData.flame=1; T.add(L);
      solid(U0-SW/2,V0-SD/2,U0+SW/2,V0+SD/2,SH+BH+.02); },{wire:'crt',bake:true}); });

  ROOMK.wires.crt=(un,c)=>{ '@later'; let G=null, L=null, led=null; un.obj.traverse(o=>{ if(o.userData.screen)G=o; if(o.isLight&&o.userData.tv)L=o; if(o.userData.led){ o.material=o.material.clone(); led=o; } }); if(!G)return;
    CRT.unit=un; look();
    c.hit(un,()=>{ const C=chan(), sh=CRT.on&&C?showing():null; return 'CRT TV: '+(CRT.on?'CH '+(C?C.ch:'')+(sh&&sh.demand?' · '+sh.s.title:''):'OFF'); },()=>{ CRT.open(); if(SFX)SFX.play('click',{vol:.6,vary:.2}); });
    let fl=0; un.tick=dt=>{ fl+=dt; if(L)L.intensity=U.uOn.value*(.7+.25*Math.sin(fl*9)*Math.sin(fl*2.3)); if(led)led.material.color.setHex(CRT.on?0x5aff7a:0xff3a2a); }; };

  // each frame while you are home: the tube warms up and collapses, the picture keeps its moment, snow while it tunes; out of the apartment it stops (the state stays)
  let sT=0, gT=0, hT=0, rT=0, ld=false;
  const run=dt=>{ '@later'; if(CRT.snow>0){ CRT.snow-=dt; snow(); if(CRT.snow<=0)look(); } else if(CRT.err||(src&&V.readyState<2)){ if((gT-=dt)<=0){ gT=.08; snow(); } look(); } else if(U.uMap.value===st&&V.readyState>=2)look();
    const sh=showing(); if(sh&&sh.guide){ gy+=dt*14; if((hT-=dt)<=0){ hT=.12; guidePic(); } if(U.uMap.value!==gt)look(); }
    if((sT-=dt)<=0){ sT=1; tune(); look(); draw(); }
    if(W.open&&(W.idle+=dt)>3&&W.full)W.el.classList.add('idle'); };
  SYS.add('places',dt=>{ dt=dt||0; if(!home()){ if(src)stop(); if(!P.hidden)P.hidden=true; if(W.open)CRT.watch(false); U.uOn.value=CRT.on?1:0; return; }
    U.uT.value+=dt; const tg=CRT.on?1:0; if(U.uOn.value!==tg)U.uOn.value=tg?Math.min(1,U.uOn.value+dt/.7):Math.max(0,U.uOn.value-dt/.35);
    if(!ROOMK.guest()&&ONLINE.on&&(rT-=dt)<=0){ rT=6; if(others())ONLINE.send({t:'tv',...wire()}); }
    if(!CRT.on)return; if(!CRT.data){ if(!ld){ ld=true; load().then(()=>{ tune(); look(); draw(1); }).catch(()=>{ ld=false; }); } return; }
    run(dt); },'150fa-crt');
  window.CRTDBG=()=>({on:CRT.on,ch:CRT.chn,vol:CRT.vol,pick:CRT.pick&&CRT.pick.title,live:live()!=null,src,ready:V.readyState,unit:!!CRT.unit,panel:!P.hidden,data:!!CRT.data,watch:W.open,full:W.full,zoom:W.z,
    pic:U.uMap.value===vt?'video':U.uMap.value===gt?'guide':U.uMap.value===st?'snow':'none',pow:U.uOn.value,lists:CRT.data?Object.fromEntries(Object.entries(lists()).map(([k,v])=>[k,v.length])):null,thing:UI.things.some(t=>/^CRT TV/.test(t.name))});
}
