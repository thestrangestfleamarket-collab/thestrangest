// THE TABLE RADIO (owner, 9 Nov 2026: the old game's apartment radio, "each apartment's radio playing the market's stations"): a wooden set on its side table in every apartment, the cars' stations (RADIO, 150p) heard from where it stands; double-click it for power, station and volume, kept with your layout so a visitor hears your station.
import {THREE} from './003-shx.js';
import {RADIO, SFX, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const RS={on:false,st:1,vol:.6,data:null}; window.TRADIO=RS;
  const home=()=>!!(MODS.apts&&MODS.apts.inReal), live=un=>!!(ROOMK.api&&ROOMK.api.units().includes(un)&&!un.gone);
  const S=()=>RS.data&&RS.data.stations[RS.st-1], label=()=>'TABLE RADIO: '+(RS.on&&S()?S().call:'OFF');
  const ths=new Set(), relabel=()=>{ for(const t of ths)t.name=label(); };
  const changed=()=>{ relabel(); draw(); ROOMK.save(); };
  RS.power=on=>{ RS.on=on==null?!RS.on:!!on; RADIO.wake(); changed(); if(SFX)SFX.play('click',{vol:.6,vary:.2}); };
  RS.tune=n=>{ const L=RS.data?RS.data.stations.length:4; RS.st=((n-1)%L+L)%L+1; RS.on=true; RADIO.wake(); changed(); if(SFX)SFX.play('click',{vol:.5,vary:.3}); };
  RS.volume=v=>{ RS.vol=Math.max(0,Math.min(1,v)); ROOMK.save(); };

  /* ---------- the panel, as the TV's ---------- */
  const P=document.createElement('div'); P.id='radp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);width:min(360px,92vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent='#radp .row{display:flex;align-items:center;gap:6px;margin:8px 0;flex-wrap:wrap} #radp .row>span:first-child{width:74px} #radp input[type=range]{flex:1} #radp .btn{font:inherit;padding:5px 8px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #radp .btn.on{background:#3b2a1e;color:#ece5d3} #radp .mclose{float:right} #radp .now{margin-top:6px;min-height:28px;color:#6a4a32} #radp .st{display:flex;flex-direction:column;gap:4px;flex:1} #radp .st .btn{text-align:left}';
  document.head.appendChild(css); document.body.appendChild(P);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const draw=()=>{ '@later'; if(P.hidden||!RS.data)return; const C=S(), n=C&&RADIO.nowAt(C);
    P.innerHTML=`<div><b>THE TABLE RADIO</b> <button class="btn mclose" data-a="close">DONE</button></div>
      <div class="row"><span>POWER</span><button class="btn ${RS.on?'on':''}" data-a="on">ON</button><button class="btn ${RS.on?'':'on'}" data-a="off">OFF</button></div>
      <div class="row"><span>STATION</span><div class="st">${RS.data.stations.map((s,i)=>`<button class="btn ${RS.on&&i+1===RS.st?'on':''}" data-s="${i+1}">${esc(s.call)} · ${esc(s.name)}</button>`).join('')}</div></div>
      <div class="row"><span>VOLUME</span><input type="range" min="0" max="100" value="${Math.round(RS.vol*100)}" data-k="vol"><span>${Math.round(RS.vol*100)}%</span></div>
      <div class="now">${RS.on&&C?`${esc(C.call)} · ${esc(C.name)}<br>NOW: ${esc(n?n.title:'')}${n&&n.year?' ('+n.year+')':''}`:'THE RADIO IS OFF.'}</div>`; };
  RS.open=()=>RADIO.load().then(d=>{ RS.data=d; P.hidden=false; draw(); relabel(); }).catch(e=>console.warn('RADIO: the stations did not load',e)); RS.close=()=>{ P.hidden=true; };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b)return; const a=b.dataset.a;
    if(a==='close')return RS.close(); if(a==='on')RS.power(true); else if(a==='off')RS.power(false); else if(b.dataset.s!=null)RS.tune(+b.dataset.s); });
  P.addEventListener('input',e=>{ const t=e.target; if(t.dataset.k!=='vol')return; RS.volume(+t.value/100); if(t.nextElementSibling)t.nextElementSibling.textContent=t.value+'%'; });

  /* ---------- what it looks like: a walnut cabinet radio, cloth speaker behind three bars, a lit slide-rule dial, two knobs, on a small side table ---------- */
  const DIAL=[55,160], MARK=[62,88,118,146];   // where the needle stands for each station (kc on the dial)
  const xOn=k=>(k-DIAL[0])/(DIAL[1]-DIAL[0]);
  const cloth=()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); g.fillStyle='#b39462'; g.fillRect(0,0,64,64);
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){ const w=((x>>1)+(y>>1))&1, n=(Math.sin(x*1.7+y*.3)+Math.sin(y*2.1))*6; const v=(w?-14:10)+n; g.fillStyle=`rgb(${179+v|0},${148+v|0},${98+v*.8|0})`; g.fillRect(x,y,1,1); }
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,3); return t; };
  const dialTex=()=>{ const c=document.createElement('canvas'); c.width=256; c.height=112; const g=c.getContext('2d'), gr=g.createLinearGradient(0,0,0,112); gr.addColorStop(0,'#f6dfa2'); gr.addColorStop(1,'#e2b964'); g.fillStyle=gr; g.fillRect(0,0,256,112);
    g.fillStyle='#4a2c14'; g.strokeStyle='#4a2c14'; g.lineWidth=2; g.beginPath(); g.moveTo(10,62); g.lineTo(246,62); g.stroke(); g.font='bold 15px monospace'; g.textAlign='center';
    for(let k=55;k<=160;k+=5){ const x=10+xOn(k)*236, big=k%20===0||k===55; g.fillRect(x-1,big?48:54,2,big?14:8); if(big&&k>55)g.fillText(String(k),x,40); }
    g.font='bold 13px monospace'; const calls=['WJAZ','WRTZ','KRAG','WOPR']; MARK.forEach((k,i)=>{ const x=10+xOn(k)*236; g.fillText(calls[i],x,86); g.fillRect(x-2,66,4,6); });
    g.font='bold 11px monospace'; g.fillText('KILOCYCLES',128,104); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  for(const k of ['TABLE RADIO'])ROOMK.always.add(k);   // in every apartment from the start (owner, 9 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const U0=.3, V0=c.Ly*.36, RY=Math.PI/2;   // against the west wall between its two front windows, facing into the room
    const wood=mat([112,64,34]), woodD=mat([66,38,20]), veneer=mat([156,98,52]), bake=mat([46,26,16]), cream=mat([224,212,186]), brass=mat([196,158,82]);
    const TW=.56, TD=.4, TH=.6;
    cap('TABLE RADIO',()=>{ const g=new THREE.Group(); g.position.set(U0,0,V0); g.rotation.y=RY; cur().add(g);
      // the side table: a top with a rounded edge, an apron, four tapered legs and a low shelf
      p(rbox(TW,.035,TD,.012),wood,0,TH-.018,0,0,g); p(rbox(TW-.06,.07,TD-.06,.006),woodD,0,TH-.07,0,0,g); p(rbox(TW-.08,.02,TD-.08,.006),wood,0,.16,0,0,g);
      for(const s of [-1,1])for(const t of [-1,1])p(new THREE.CylinderGeometry(.018,.012,TH-.035,8),woodD,s*(TW/2-.04),(TH-.035)/2,t*(TD/2-.04),0,g);
      // the set on it
      const R=new THREE.Group(); R.position.set(0,TH,-.02); g.add(R); const W=.44, H=.25, D=.2, B0=.025, yc=B0+H/2, f=D/2;
      p(rbox(W+.02,B0,D+.01,.008),woodD,0,B0/2,0,0,R); p(rbox(W,H,D,.03),wood,0,yc,0,0,R); p(rbox(W+.02,.02,D+.012,.008),woodD,0,B0+H+.006,0,0,R);
      for(const s of [-1,1])p(rbox(.012,H-.02,.012,.004),woodD,s*(W/2-.012),yc,f-.004,0,R);
      p(rbox(W-.04,H-.05,.01,.004),veneer,0,yc,f,0,R);
      // the speaker: cloth behind a frame and three bars
      const cx=-.1, cy=yc+.005; p(new THREE.PlaneGeometry(.17,.16),new THREE.MeshLambertMaterial({map:cloth()}),cx,cy,f+.0055,0,R,false);
      for(const [w,h,x,y] of [[.19,.012,cx,cy+.086],[.19,.012,cx,cy-.086],[.012,.17,cx-.092,cy],[.012,.17,cx+.092,cy]])p(rbox(w,h,.014,.003),woodD,x,y,f+.007,0,R);
      for(const x of [-.045,0,.045])p(rbox(.012,.16,.012,.004),woodD,cx+x,cy,f+.01,0,R);
      // the dial: a brass bezel, the lit scale and its needle
      const dx=.1, dy=yc+.035; p(rbox(.178,.09,.01,.004),brass,dx,dy,f+.004,0,R);
      const dial=keep(p(new THREE.PlaneGeometry(.16,.07),new THREE.MeshBasicMaterial({map:dialTex(),color:0x3a3024}),dx,dy,f+.0095,0,R,false)); dial.userData.dial=1;
      const nd=keep(p(new THREE.BoxGeometry(.003,.056,.002),new THREE.MeshBasicMaterial({color:0xb02018}),dx-.08+.16*xOn(MARK[0]),dy+.002,f+.011,0,R,false)); nd.userData.needle=1; nd.userData.x0=dx-.08;
      // the knobs: tuning and volume, a cream cap on each
      for(const [x,k] of [[.05,'tune'],[.15,'vol']]){ const kn=new THREE.Group(); kn.position.set(x,yc-.07,f+.005); R.add(kn); kn.userData.knob=k;
        keep(p(new THREE.CylinderGeometry(.021,.024,.026,16).rotateX(Math.PI/2),bake,0,0,.013,0,kn)); keep(p(new THREE.CylinderGeometry(.012,.012,.006,12).rotateX(Math.PI/2),cream,0,0,.028,0,kn)); keep(p(rbox(.004,.014,.004,.001),cream,0,.012,.027,0,kn)); }
      p(rbox(.05,.012,.004,.002),brass,-.1,yc-.088,f+.006,0,R);   // the little brass plate under the cloth
      for(const s of [-1,1])p(rbox(.02,.01,.02,.003),woodD,s*(W/2-.03),-.002+.005,0,0,R);
      const L=new THREE.PointLight(0xffb45a,0,1.4*c.M,2); L.position.set(dx,dy,f+.12); L.userData.flame=1; L.userData.radio=1; R.add(L);
      solid(U0-TD/2,V0-TW/2,U0+TD/2,V0+TW/2,TH+B0+H+.02); },{wire:'tradio',bake:true}); });

  ROOMK.wires.tradio=(un,c)=>{ '@later'; let dial=null, nd=null, L=null; const kn={}; un.obj.traverse(o=>{ if(o.userData.dial){ o.material=o.material.clone(); dial=o; } if(o.userData.needle)nd=o; if(o.userData.knob)kn[o.userData.knob]=o; if(o.isLight&&o.userData.radio)L=o; }); if(!dial)return;
    const th=c.hit(un,label,()=>{ RS.open(); if(SFX)SFX.play('click',{vol:.6,vary:.2}); }); ths.add(th);
    const at=new THREE.Vector3(), id='apt-radio:'+un.id;
    RADIO.src.set(id,{id,st:()=>RS.on?RS.st:0,get vol(){ return RS.vol; },R:9*c.M,
      here:()=>{ if(!live(un)){ RADIO.src.delete(id); ths.delete(th); return false; } return home(); },
      at:()=>{ (dial||un.obj).getWorldPosition(at); return at; }});
    const dim=new THREE.Color(0x3a3024), lit=new THREE.Color(0xfff2d0); let fl=0, ln=0;
    un.tick=dt=>{ fl+=dt; const on=RS.on, tx=nd.userData.x0+.16*xOn(MARK[(RS.st-1)%4]); nd.position.x+=(tx-nd.position.x)*Math.min(1,dt*4);
      ln+=((on?1:0)-ln)*Math.min(1,dt*3); dial.material.color.copy(dim).lerp(lit,ln); if(L)L.intensity=ln*(.35+.02*Math.sin(fl*13));
      if(kn.tune)kn.tune.rotation.z=-(RS.st-1)*1.2; if(kn.vol)kn.vol.rotation.z=-RS.vol*4; }; };

  // kept with your layout: a visitor's game plays the owner's station
  ROOMK.keep.push({ out:L=>{ L.radio={on:RS.on?1:0,st:RS.st,vol:Math.round(RS.vol*100)/100}; },
    in:L=>{ const r=L.radio||{}; RS.on=!!r.on; RS.st=Math.max(1,Math.min(9,r.st|0||1)); RS.vol=r.vol!=null?Math.max(0,Math.min(1,+r.vol||0)):.6; relabel(); draw(); } });
  let dT=0; SYS.add('places',dt=>{ if(!home()){ if(!P.hidden)P.hidden=true; return; } if(!P.hidden&&(dT-=dt||0)<=0){ dT=2; draw(); } },'150fb-radio');
  window.TRADIODBG=()=>({on:RS.on,st:RS.st,vol:RS.vol,panel:!P.hidden,data:!!RS.data,srcs:[...RADIO.src.keys()].filter(k=>k.startsWith('apt-radio:')),thing:UI.things.some(t=>/^TABLE RADIO/.test(t.name)),mix:MODS.cars&&MODS.cars.radio&&MODS.cars.radio()});
}
