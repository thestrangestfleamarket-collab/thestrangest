// THE CRT TV: a big old set on its wooden stand in every apartment, four channels of public-domain cartoons (data/tv.json, the Internet Archive's) each on the real clock so every set shows the same moment; double-click it for power, channel and volume.
import {THREE} from './003-shx.js';
import {SFX, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const TVJ=__LAZY__("data/tv.json");
  const CRT={data:null,on:false,ch:0,vol:.5,snow:0,unit:null}; window.CRT=CRT;
  const EPOCH=Date.UTC(2026,10,5);
  const chan=()=>CRT.data&&CRT.data.channels[CRT.ch];
  // what a channel shows now: its shows one after another from a fixed start, looped
  const nowOn=(C,t=Date.now())=>{ const L=C.shows.reduce((a,s)=>a+s.len,0); let r=((t-EPOCH)/1000)%L; if(r<0)r+=L; for(const s of C.shows){ if(r<s.len)return {s,off:r}; r-=s.len; } return {s:C.shows[0],off:0}; };
  CRT.nowOn=nowOn;

  /* ---------- one picture for every set: the video, or snow between shows and while it tunes ---------- */
  const V=document.createElement('video'); V.playsInline=true; V.preload='auto'; V.crossOrigin='anonymous'; V.muted=false;
  const vt=new THREE.VideoTexture(V); vt.colorSpace=THREE.SRGBColorSpace; vt.minFilter=vt.magFilter=THREE.LinearFilter;
  const sc=document.createElement('canvas'); sc.width=96; sc.height=72; const st=new THREE.CanvasTexture(sc); st.colorSpace=THREE.SRGBColorSpace; st.magFilter=THREE.NearestFilter;
  const snow=()=>{ '@later'; const g=sc.getContext('2d'), im=g.createImageData(96,72); for(let i=0;i<96*72;i++){ const v=Math.random()*210|0; im.data[i*4]=im.data[i*4+1]=v; im.data[i*4+2]=v+12; im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const C=chan(); if(C){ g.fillStyle='rgba(0,0,0,.55)'; g.fillRect(4,4,30,14); g.fillStyle='#7dff8a'; g.font='bold 11px monospace'; g.fillText('CH '+C.ch,6,15); } st.needsUpdate=true; };
  const screens=new Set();
  let src='', sync=0;
  const url=s=>(location.protocol==='file:'?'https://archive.org/download/':'/film/')+s.id+'/'+s.file;
  const stop=()=>{ if(src){ V.pause(); V.removeAttribute('src'); V.load(); src=''; } };
  const tune=()=>{ '@later'; const C=chan(); if(!C||!CRT.on){ stop(); return; } const {s,off}=nowOn(C), u=url(s);
    if(u!==src){ src=u; V.src=u; V.currentTime=off; CRT.snow=.7; } V.volume=CRT.vol; const p=V.play(); if(p&&p.catch)p.catch(()=>{});
    if(V.readyState>0&&!V.seeking&&Math.abs(off-V.currentTime)>4)V.currentTime=off; };
  const look=()=>{ for(const m of screens){ const live=CRT.on&&CRT.snow<=0&&V.readyState>=2; m.map=CRT.on?(live?vt:st):null; m.color.setRGB(CRT.on?1:.05,CRT.on?1:.06,CRT.on?1:.07); m.needsUpdate=true; } };
  CRT.power=on=>{ CRT.on=on==null?!CRT.on:!!on; if(CRT.on){ CRT.snow=.5; snow(); tune(); } else stop(); look(); draw(); };
  CRT.channel=k=>{ const n=CRT.data?CRT.data.channels.length:1; CRT.ch=((k%n)+n)%n; if(!CRT.on)CRT.on=true; src=''; CRT.snow=.6; snow(); tune(); look(); draw(); if(SFX)SFX.play('click',{vol:.5,vary:.2}); };
  CRT.volume=v=>{ CRT.vol=Math.max(0,Math.min(1,v)); V.volume=CRT.vol; };
  const load=()=>CRT.data?Promise.resolve(CRT.data):TVJ().then(d=>{ CRT.data=d; return d; });

  /* ---------- the control panel ---------- */
  const P=document.createElement('div'); P.id='crtp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);width:min(360px,92vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent='#crtp .row{display:flex;align-items:center;gap:6px;margin:8px 0;flex-wrap:wrap} #crtp .row>span:first-child{width:74px} #crtp input[type=range]{flex:1} #crtp .btn{font:inherit;padding:5px 8px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #crtp .btn.on{background:#3b2a1e;color:#ece5d3} #crtp .mclose{float:right} #crtp .now{margin-top:6px;min-height:28px;color:#6a4a32}';
  document.head.appendChild(css); document.body.appendChild(P);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const draw=()=>{ '@later'; if(P.hidden||!CRT.data)return; const C=chan(), n=C&&nowOn(C).s;
    P.innerHTML=`<div><b>THE CRT TV</b> <button class="btn mclose" data-a="close">DONE</button></div>
      <div class="row"><span>POWER</span><button class="btn ${CRT.on?'on':''}" data-a="on">ON</button><button class="btn ${CRT.on?'':'on'}" data-a="off">OFF</button></div>
      <div class="row"><span>CHANNEL</span><button class="btn" data-a="dn">&lt;</button>${CRT.data.channels.map((c,i)=>`<button class="btn ${CRT.on&&i===CRT.ch?'on':''}" data-c="${i}">${c.ch}</button>`).join('')}<button class="btn" data-a="up">&gt;</button></div>
      <div class="row"><span>VOLUME</span><input type="range" min="0" max="100" value="${Math.round(CRT.vol*100)}" data-k="vol"><span>${Math.round(CRT.vol*100)}%</span></div>
      <div class="now">${CRT.on&&C?`CH ${C.ch} · ${esc(C.name)}<br>NOW: ${esc(n.title)}${n.year?' ('+n.year+')':''}`:'THE SET IS OFF.'}</div>`; };
  CRT.open=()=>load().then(()=>{ P.hidden=false; draw(); }).catch(e=>console.warn('CRT: the channels did not load',e)); CRT.close=()=>{ P.hidden=true; };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b)return; const a=b.dataset.a;
    if(a==='close')return CRT.close(); if(a==='on')CRT.power(true); else if(a==='off')CRT.power(false); else if(a==='up')CRT.channel(CRT.ch+1); else if(a==='dn')CRT.channel(CRT.ch-1); else if(b.dataset.c!=null)CRT.channel(+b.dataset.c); });
  P.addEventListener('input',e=>{ const t=e.target; if(t.dataset.k!=='vol')return; CRT.volume(+t.value/100); if(t.nextElementSibling)t.nextElementSibling.textContent=t.value+'%'; });

  /* ---------- the set and its stand, in your apartment by the living room's wall ---------- */
  for(const k of ['CRT TV'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const U0=c.Lx-.56, V0=c.Ly-.66, RY=-Math.PI/2;   // in the back corner of the living room's far wall, facing into the room (owner, 9 Nov 2026)
    const wood=mat([92,58,34]), woodD=mat([60,38,22]), black=mat([28,28,30]), grey=mat([58,58,62]), chrome=mat([176,178,184]), grille=mat([40,40,42]);
    cap('CRT TV',()=>{ const g=new THREE.Group(); g.position.set(U0,0,V0); g.rotation.y=RY; cur().add(g);
      // the stand: a low walnut cabinet, an open shelf with the tape deck, two doors below
      const SW=1.06, SD=.5, SH=.56; p(rbox(SW,.04,SD,.008),wood,0,SH-.02,0,0,g); p(rbox(SW,.04,SD,.008),wood,0,.06,0,0,g);
      for(const s of [-1,1])p(rbox(.04,SH-.04,SD,.006),wood,s*(SW/2-.02),SH/2,0,0,g); p(rbox(SW,SH-.04,.02,.004),woodD,0,SH/2,-SD/2+.01,0,g); p(rbox(SW-.08,.025,SD-.04,.004),wood,0,.33,0,0,g);
      for(const s of [-1,1]){ p(rbox(SW/2-.05,.22,.02,.006),wood,s*SW/4,.19,SD/2-.01,0,g); p(rbox(.012,.06,.012,.003),chrome,s*.05,.19,SD/2+.004,0,g); }
      for(const s of [-1,1])for(const t of [-1,1])p(new THREE.CylinderGeometry(.018,.014,.04,8),woodD,s*(SW/2-.06),.02,t*(SD/2-.06),0,g);
      p(rbox(.42,.08,.3,.006),black,-.2,.39,.02,0,g); p(rbox(.18,.012,.006,.002),grey,-.25,.4,.172,0,g); keep(p(new THREE.PlaneGeometry(.05,.016),new THREE.MeshBasicMaterial({color:0x5aff7a}),-.05,.4,.1715,0,g,false));
      for(let i=0;i<3;i++)p(rbox(.02,.15,.12,.003),mat([[40,40,46],[150,40,40],[50,70,120]][i]),.18+i*.04,.43,0,0,g);
      // the set: a deep black cabinet, the curved glass, the speaker grille and the buttons under it
      const T=new THREE.Group(); T.position.set(0,SH,0); g.add(T); const BW=.84, BH=.7, BD=.36;
      p(rbox(BW,BH,BD,.03),black,0,BH/2+.02,.06,0,T); p(rbox(BW*.74,BH*.76,.32,.04),black,0,BH*.48+.02,-.24,0,T); p(rbox(BW*.5,BH*.5,.12,.03),grey,0,BH*.46+.02,-.44,0,T);
      p(rbox(.66,.52,.02,.03),grey,-.02,BH*.58+.02,.245,0,T); for(const s of [-1,1])p(rbox(.03,.012,.03,.003),grey,s*.32,.012,.12,0,T);
      const glass=keep(p(new THREE.SphereGeometry(1,20,14,-.42,.84,Math.PI/2-.32,.64),new THREE.MeshBasicMaterial({color:0x0d0f11}),-.02,BH*.58+.02,.2,0,T,false)); glass.scale.set(.6*1.25,.47*1.5,.07); glass.userData.screen=1;
      p(rbox(.66,.09,.012,.004),grille,-.02,.1,.245,0,T); for(let i=0;i<6;i++)p(rbox(.6,.004,.004,.001),grey,-.02,.065+i*.014,.252,0,T);
      for(let i=0;i<4;i++)p(new THREE.CylinderGeometry(.013,.013,.016,10).rotateX(Math.PI/2),chrome,.22+i*.034,.1,.25,0,T); keep(p(new THREE.CircleGeometry(.007,10),new THREE.MeshBasicMaterial({color:0xff3a2a}),.36,.1,.252,0,T,false)).userData.led=1;
      const L=new THREE.PointLight(0x9ab8e0,0,2.8*c.M,2); L.position.set(0,BH*.58,.6); L.userData.tv=1; L.userData.flame=1; T.add(L);
      solid(U0-SD/2,V0-SW/2,U0+SD/2,V0+SW/2,SH+BH+.02); },{wire:'crt',bake:true}); });

  ROOMK.wires.crt=(un,c)=>{ '@later'; let G=null, L=null, led=null; un.obj.traverse(o=>{ if(o.userData.screen){ o.material=o.material.clone(); G=o; } if(o.isLight&&o.userData.tv)L=o; if(o.userData.led){ o.material=o.material.clone(); led=o; } }); if(!G)return;
    screens.add(G.material); CRT.unit=un; look();
    c.hit(un,()=>'CRT TV: '+(CRT.on?'CH '+(chan()?chan().ch:''):'OFF'),()=>{ CRT.open(); if(SFX)SFX.play('click',{vol:.6,vary:.2}); });
    let fl=0; un.tick=dt=>{ fl+=dt; if(L)L.intensity=CRT.on?.7+.25*Math.sin(fl*9)*Math.sin(fl*2.3):0; if(led)led.material.color.setHex(CRT.on?0x5aff7a:0xff3a2a); }; };

  // each frame while you are home: the picture keeps its moment, snow while it tunes, and it stops when you leave
  let sT=0; SYS.add('places',dt=>{ const home=!!(MODS.apts&&MODS.apts.inReal); if(!home){ if(CRT.on){ CRT.on=false; stop(); look(); } if(!P.hidden)P.hidden=true; return; }
    if(!CRT.on)return; if(CRT.snow>0){ CRT.snow-=dt||0; snow(); if(CRT.snow<=0)look(); }
    else if(V.readyState<2){ snow(); look(); } else if(screens.size&&[...screens][0].map!==vt)look();
    if((sT-=dt||0)<=0){ sT=1; const C=chan(); if(C&&nowOn(C).s&&url(nowOn(C).s)!==src){ CRT.snow=.4; } tune(); draw(); } },'150fa-crt');
  window.CRTDBG=()=>({on:CRT.on,ch:CRT.ch,vol:CRT.vol,src,ready:V.readyState,unit:!!CRT.unit,screens:screens.size,panel:!P.hidden,data:!!CRT.data,thing:UI.things.some(t=>/^CRT TV/.test(t.name))});
}
