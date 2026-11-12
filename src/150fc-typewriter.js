// THE TYPEWRITER: a 1930s manual on its writing desk against the study's back wall in every apartment, a chair before it; double-click to type: the carriage steps a letter a key, the bell rings before the margin, the line locks until you return the carriage, backspace only overstrikes; a page pulled out is yours to hang (DECORATE).
import {THREE} from './003-shx.js';
import {keys, SFX, UI} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
const TYPER={pages:[],st:null,carX:42.5,on:false}; window.TYPER=TYPER;
{ const COLS=85, ROWS=66, LM=10, RM=75, BELL=RM-5, TOP=3, PITCH=.00254;   // pica on letter paper: 10 to the inch, 6 lines to the inch
  const b36=(n,w)=>n.toString(36).padStart(w,'0');
  // a strike is 7 characters: column, row (two each, base 36), ink, jitter, the letter
  const enc=k=>b36(k.c,2)+b36(k.r,2)+b36(k.i,1)+b36(k.j,1)+k.ch, dec=s=>{ const out=[]; for(let o=0;o+7<=s.length;o+=7)out.push({c:parseInt(s.substr(o,2),36),r:parseInt(s.substr(o+2,2),36),i:parseInt(s[o+4],36),j:parseInt(s[o+5],36),ch:s[o+6]}); return out; };
  TYPER.enc=enc; TYPER.dec=dec; TYPER.G={COLS,ROWS,LM,RM,BELL,TOP};
  // a strike's look from its seed: ink from the blow and the ribbon, a little off the line, a little turned
  const look=k=>{ const a=(k.j*7919%36)/36, b=(k.j*104729%36)/36; return {a:.3+.7*k.i/35,dx:(a-.5)*.9,dy:(b-.5)*1.3,rot:(a-b)*.05}; };
  const ink=(g,k,cw,lh)=>{ const L=look(k); g.save(); g.globalAlpha=L.a; g.translate((k.c+.5)*cw+L.dx*cw/9.6,(k.r+.78)*lh+L.dy*lh/16); g.rotate(L.rot); g.fillText(k.ch,0,0); g.restore(); };
  const paint=(g,ks,cw,lh)=>{ g.fillStyle='#1c1a26'; g.font=`${Math.round(lh*.92)}px "Courier New",Courier,monospace`; g.textAlign='center'; g.textBaseline='alphabetic'; for(const k of ks)ink(g,k,cw,lh); };
  const sheet=(c,ks)=>{ const g=c.getContext('2d'); g.fillStyle='#f4efe2'; g.fillRect(0,0,c.width,c.height); const cw=c.width/COLS, lh=c.height/ROWS; paint(g,ks,cw,lh); };
  TYPER.paint=paint; TYPER.ink=ink; TYPER.sheet=sheet;
  const MAXP=10;
  try{ TYPER.pages=JSON.parse(OWNED.get('pages')||'[]')||[]; }catch(e){ TYPER.pages=[]; }
  try{ TYPER.st=JSON.parse(OWNED.get('typer')||'null'); }catch(e){ TYPER.st=null; }
  if(!TYPER.st||typeof TYPER.st.s!=='string')TYPER.st={s:'',col:LM,row:TOP,rib:1,sheet:true};
  TYPER.carX=TYPER.st.col;
  let svT=0; TYPER.save=()=>{ clearTimeout(svT); svT=setTimeout(()=>{ try{ OWNED.set('typer',JSON.stringify(TYPER.st)); }catch(e){} },800); };
  TYPER.savePages=()=>{ let P=TYPER.pages.slice(-MAXP); while(P.length>1&&JSON.stringify(P).length>200000)P=P.slice(1); TYPER.pages=P; try{ OWNED.set('pages',JSON.stringify(P)); }catch(e){} };

  /* ---------- a page you pulled out: a sheet pinned to the wall, the room editor's PAGES ---------- */
  const pinned=p=>{ '@later'; const G=new THREE.Group(), c=document.createElement('canvas'); c.width=340; c.height=440; sheet(c,dec(p.s)); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;     const m=new THREE.Mesh(new THREE.PlaneGeometry(.216,.279),new THREE.MeshLambertMaterial({map:t})); m.position.z=.004; G.add(m);
    for(const x of [-.07,.07]){ const pin=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),new THREE.MeshLambertMaterial({color:0xb83a2c})); pin.position.set(x,.12,.008); G.add(pin); } return G; };
  const kind=(R,p)=>{ '@later'; const k='pg:'+p.id; if(R.kinds[k])return; const D={kind:k,name:'PAGE: '+(p.t||'TYPED PAGE'),own:p.id,loose:false,m:0,wire:null,sol:[],shf:[],mount:'wall',dept:'pages',deptName:'PAGES'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=pinned(p); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; };
  TYPER.kind=p=>{ const A=ROOMK.api; if(A&&A.R)kind(A.R,p); };
  for(const k of ['WRITING DESK'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(ctx=>{ for(const p of TYPER.pages)kind(ctx.R,p); });

  /* ---------- the writing desk and the machine on it, the chair before it ---------- */
  ROOMK.parts.push(c=>{ '@apts'; const {R,part,mat,rbox,cap,cur,solid,thing,bake,Ly}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const U0=3.4, V0=Ly-.33, DW=1.02, DD=.56, DH=.74;
    const wood=mat([104,64,38]), woodD=mat([70,42,24]), brass=mat([196,160,84]), enamel=mat([22,22,25]), chrome=mat([192,194,198]), rubber=mat([34,32,32]), keyT=mat([236,230,214]), paper=mat([244,239,226]), ribbon=mat([150,30,30]), felt=mat([46,70,52]);
    cap('WRITING DESK',()=>{ const D=new THREE.Group(); D.position.set(U0,0,V0); D.rotation.y=Math.PI; cur().add(D);
      p(rbox(DW,.035,DD,.008),wood,0,DH-.018,0,0,D); p(rbox(DW-.04,.1,DD-.04,.006),woodD,0,DH-.09,0,0,D);
      p(rbox(.38,.08,.02,.004),wood,.22,DH-.09,DD/2-.01,0,D); p(rbox(.07,.012,.012,.003),brass,.22,DH-.09,DD/2+.004,0,D);
      for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const l=p(new THREE.CylinderGeometry(.022,.015,DH-.14,10),wood,x*(DW/2-.05),(DH-.14)/2,z*(DD/2-.05),0,D); }
      p(rbox(DW-.12,.02,.02,.004),woodD,0,.16,-DD/2+.06,0,D); p(rbox(.4,.004,.3,.002),felt,0,DH+.002,.04,0,D);
      // the machine: black enamel, four rows of glass-topped keys, the basket of typebars under its hood, the ribbon spools, the carriage
      const T=new THREE.Group(); T.position.set(0,DH+.004,.04); D.add(T); T.userData.typer=1;
      p(rbox(.38,.05,.3,.02),enamel,0,.025,0,0,T); p(rbox(.34,.07,.16,.03),enamel,0,.07,-.05,0,T); p(rbox(.4,.03,.06,.01),enamel,0,.12,-.1,0,T);
      p(new THREE.CylinderGeometry(.11,.11,.3,20,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateX(Math.PI/2),enamel,0,.08,.0,0,T);
      for(let r=0;r<4;r++){ const n=[10,11,10,9][r]; for(let i=0;i<n;i++){ const x=(i-(n-1)/2)*.03+(r%2)*.006, z=.135-r*.03, y=.035+r*.016;
          p(new THREE.CylinderGeometry(.0018,.0018,.02,5),chrome,x,y-.012,z,0,T); p(new THREE.CylinderGeometry(.011,.011,.006,14),chrome,x,y,z,0,T); p(new THREE.CylinderGeometry(.009,.009,.007,14),keyT,x,y+.001,z,0,T); } }
      p(rbox(.18,.012,.022,.005),keyT,0,.025,.155,0,T); p(rbox(.2,.004,.004,.001),chrome,0,.018,.155,0,T);
      for(const s of [-1,1]){ p(new THREE.CylinderGeometry(.032,.032,.012,18),ribbon,s*.12,.142,-.03,0,T); p(new THREE.CylinderGeometry(.006,.006,.016,8),chrome,s*.12,.146,-.03,0,T); }
      p(rbox(.22,.004,.008,.001),ribbon,0,.142,-.03,0,T);
      // the carriage rides on its rail: the platen and its knobs, the return lever, the paper bail, the paper table, the sheet
      p(rbox(.42,.012,.02,.004),chrome,0,.14,-.115,0,T);
      const C=new THREE.Group(); C.position.set(0,.16,-.12); T.add(C); C.userData.carriage=1;
      keep(p(new THREE.CylinderGeometry(.026,.026,.44,20).rotateZ(Math.PI/2),rubber,0,0,0,0,C)); for(const s of [-1,1]){ keep(p(new THREE.CylinderGeometry(.022,.022,.03,16).rotateZ(Math.PI/2),enamel,s*.24,0,0,0,C)); keep(p(new THREE.CylinderGeometry(.008,.008,.02,10).rotateZ(Math.PI/2),chrome,s*.22,0,0,0,C)); }
      keep(p(new THREE.CylinderGeometry(.0025,.0025,.4,6).rotateZ(Math.PI/2),chrome,0,.018,.026,0,C)); for(const x of [-.08,.08])keep(p(new THREE.CylinderGeometry(.006,.006,.012,10).rotateZ(Math.PI/2),rubber,x,.018,.027,0,C));
      const lev=new THREE.Group(); lev.position.set(-.235,.012,.01); C.add(lev); keep(p(rbox(.006,.006,.07,.002),chrome,0,0,.035,0,lev)); keep(p(rbox(.006,.03,.006,.002),chrome,0,.014,.07,0,lev)); keep(p(new THREE.SphereGeometry(.007,8,6),chrome,0,.03,.07,0,lev)); lev.rotation.y=-.35;
      keep(p(rbox(.36,.004,.1,.002),enamel,0,.035,-.05,0,C)).rotation.x=.6;
      const sh=keep(p(new THREE.PlaneGeometry(.216,1),paper,0,.03,-.022,0,C,false)); sh.rotation.x=-.25; sh.geometry.translate(0,.5,0); sh.userData.paper=1; sh.material=sh.material.clone(); sh.material.side=THREE.DoubleSide;
      solid(U0-DW/2,V0-DD/2,U0+DW/2,V0+DD/2,DH); },{wire:'typer',bake:true});
    { const g=thing(U0,0,V0-.68,Math.PI), b=mat([92,56,32]), d=mat([60,36,20]); const PP=(geo,m,x,y,z)=>{ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; g.add(me); return me; };
      for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const l=PP(new THREE.CylinderGeometry(.016,.013,.45,8),d,x*.17,.225,z*.17); l.rotation.z=x*.05; l.rotation.x=-z*.05; }
      PP(new THREE.CylinderGeometry(.21,.2,.04,24),b,0,.465,0); PP(new THREE.TorusGeometry(.17,.012,6,20,Math.PI),d,0,.75,.17).rotation.set(0,0,0);
      for(const x of [-.17,.17])PP(new THREE.CylinderGeometry(.012,.012,.3,8),d,x,.63,.17); for(const x of [-.07,0,.07])PP(new THREE.CylinderGeometry(.008,.008,.26,6),d,x,.63,.18);
      PP(new THREE.TorusGeometry(.17,.008,6,24),d,0,.2,0).rotation.x=Math.PI/2;
      bake(g); R.loose.push([g,'CHAIR',5,true]); } });

  // the machine in the room follows the one in the window: the carriage slides with each letter, the sheet rises line by line
  ROOMK.wires.typer=(un,c)=>{ '@later'; let C=null, P=null; un.obj.traverse(o=>{ if(o.userData.carriage)C=o; if(o.userData.paper)P=o; }); TYPER.unit=un;
    c.hit(un,()=>'TYPEWRITER',()=>{ TYPER.open(); });
    un.tick=()=>{ const s=TYPER.st; if(C)C.position.x=(42.5-TYPER.carX)*PITCH; if(P){ P.visible=!!(s&&s.sheet); P.scale.y=Math.min(.26,.03+((TYPER.rowY??(s?s.row:TOP))-TOP)*.279/ROWS); } }; };

  let V=null; TYPER.open=()=>{ (typeof LOAD==='function'?LOAD('typer'):Promise.resolve()).then(()=>{ if(!V)V=TYPER.view(); V.open(); }).catch(e=>console.warn('TYPER: the window did not load',e)); };
  TYPER.close=()=>{ if(V)V.close(); };

  /* ---------- the window: the paper in the machine as you see it over the keys, the keyboard and the typebars under it ---------- */
  TYPER.view=()=>{ '@typer'; const G=TYPER.G, st=()=>TYPER.st;
    const box=document.createElement('div'); box.id='typerp'; box.hidden=true; box.tabIndex=-1;
    box.style.cssText='position:fixed;left:50%;top:6%;transform:translateX(-50%);width:min(820px,96vw);z-index:22;padding:10px 12px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1);outline:none';
    const css=document.createElement('style'); css.textContent='#typerp .btn{font:inherit;padding:5px 9px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer;margin-left:6px} #typerp .btn:disabled{opacity:.4;cursor:default} #typerp canvas{display:block;width:100%;background:#222} #typerp .bar{display:flex;align-items:center;gap:4px;margin-bottom:8px} #typerp .bar b{flex:1} #typerp .tip{margin-top:6px;color:#6a4a32;min-height:14px}';
    document.head.appendChild(css);
    box.innerHTML='<div class="bar"><b>THE TYPEWRITER</b><span data-n></span><button class="btn" data-a="new">NEW SHEET</button><button class="btn" data-a="out">PULL OUT THE PAGE</button><button class="btn" data-a="close">DONE</button></div><canvas width="780" height="300" data-p></canvas><canvas width="780" height="230" data-k></canvas><div class="tip" data-t></div><textarea data-in aria-label="type" style="position:absolute;left:0;top:0;width:1px;height:1px;opacity:0;border:0;padding:0;resize:none"></textarea>';
    document.body.appendChild(box);
    const IN=box.querySelector('[data-in]'), PC=box.querySelector('[data-p]'), KC=box.querySelector('[data-k]'), tip=box.querySelector('[data-t]'), nEl=box.querySelector('[data-n]');
    const CW=14.4, LH=24, paperC=document.createElement('canvas'); paperC.width=G.COLS*CW; paperC.height=G.ROWS*LH;
    let ks=[];   // the strikes on the sheet in the machine
    const redraw=()=>{ ks=TYPER.dec(st().s); TYPER.sheet(paperC,ks); };
    const say=t=>{ tip.textContent=t||''; };
    const snd=(k,o)=>{ if(SFX)SFX.play(k,o); };

    /* the carriage: the mainspring pulls it a letter on as each typebar lets go (a stiff spring, a little overshoot); thrown back by the lever it runs to the margin stop and bounces */
    let x=st().col, v=0, rowY=st().row, rv=0, lastT=0, bellAt=-1, bars=[], pressed=null, ret=false;
    TYPER.carX=x; TYPER.rowY=rowY;
    const ROWS4=['1234567890-','QWERTYUIOP','ASDFGHJKL;','ZXCVBNM,./'];
    const keyPos=ch=>{ const u=ch.toUpperCase(); for(let r=0;r<4;r++){ const i=ROWS4[r].indexOf(u); if(i>=0)return {r,i,n:ROWS4[r].length}; } return null; };
    const step=dt=>{ const s=st(), k=2600, c=2*.42*Math.sqrt(k);
      if(ret){ x+=v*dt; v*=Math.exp(-1.2*dt); if(x<=G.LM){ x=G.LM; v=-v*.28; ret=false; snd('thud',{vol:.4,vary:.2}); } }
      else { const a=k*(s.col-x)-c*v; v+=a*dt; x+=v*dt; }
      const rk=900, rc=2*.6*Math.sqrt(rk); rv+=(rk*(s.row-rowY)-rc*rv)*dt; rowY+=rv*dt;
      TYPER.carX=x; TYPER.rowY=rowY; for(const b of bars)b.t+=dt; bars=bars.filter(b=>b.t<.16); };
    const strike=ch=>{ const s=st(); if(!s.sheet){ say('THERE IS NO PAPER IN THE MACHINE: NEW SHEET.'); return; }
      if(s.row>=G.ROWS-1){ say('THE PAGE IS FULL: PULL IT OUT.'); snd('clunk',{vol:.3}); return; }
      if(s.col>=G.RM){ say('THE MARGIN STOP: THE KEYS ARE LOCKED. RETURN THE CARRIAGE (ENTER).'); snd('clunk',{vol:.3,vary:.1}); bars.push({ch,t:0,jam:true}); return; }
      const now=performance.now(), fast=Math.min(1,(now-lastT)/220); lastT=now;
      const kk={c:s.col,r:s.row,i:Math.max(0,Math.min(35,Math.round((.55+.25*fast+.2*Math.random())*s.rib*35))),j:Math.floor(Math.random()*36),ch};
      if(ch!==' '){ s.s+=TYPER.enc(kk); ks.push(kk); const g=paperC.getContext('2d'); TYPER.paint(g,[kk],CW,LH); s.rib=Math.max(.35,s.rib-.00004); bars.push({ch,t:0}); snd('click',{vol:.5,vary:.3,pitch:1.4}); }
      else snd('click',{vol:.25,vary:.2,pitch:.7});
      s.col++; if(s.col===G.BELL&&bellAt!==s.row){ bellAt=s.row; snd('blip',{vol:.6,pitch:2.2}); TYPER.bells=(TYPER.bells||0)+1; say('DING: FIVE LETTERS TO THE MARGIN.'); }
      pressed={ch,t:performance.now()}; TYPER.save(); };
    const back=()=>{ const s=st(); if(s.col>G.LM){ s.col--; snd('click',{vol:.3,pitch:.9}); TYPER.save(); } };
    const cr=()=>{ const s=st(); if(!s.sheet)return; if(s.row<G.ROWS-1)s.row++; const d=x-G.LM; s.col=G.LM; bellAt=-1; if(d>0){ ret=true; v=-Math.max(20,d*4); } snd('page',{vol:.4,vary:.2}); say(''); TYPER.save(); };
    const tab=()=>{ const s=st(); const n=Math.min(G.RM,G.LM+Math.floor((s.col-G.LM)/8+1)*8); s.col=n; TYPER.save(); };
    TYPER.key=e=>{ if(box.hidden)return false; const k=e.key;
      if(k==='Escape'){ close(); return true; }
      if(e.ctrlKey||e.metaKey||e.altKey)return false;
      if(k==='Enter'){ cr(); return true; } if(k==='Backspace'){ back(); return true; } if(k==='Tab'){ tab(); return true; }
      if(k.length===1&&k>=' '&&k<='~'){ if(!e.repeat)strike(k); return true; } return true; };
    // the keys come to a hidden text box, which the game's own keys leave alone; nothing is ever written into it
    IN.addEventListener('keydown',e=>{ if(TYPER.key(e))e.preventDefault(); e.stopPropagation(); }); IN.addEventListener('keyup',e=>e.stopPropagation()); IN.addEventListener('input',()=>{ IN.value=''; });
    box.addEventListener('mousedown',e=>{ if(!e.target.closest('button'))setTimeout(()=>IN.focus(),0); });

    /* drawing: the sheet scrolls past a fixed printing point (the paper moves, not the type); the platen, the bail and its rollers, the type guide */
    const drawPaper=()=>{ const g=PC.getContext('2d'), W=PC.width, H=PC.height, px=W/2, py=H*.62; g.fillStyle='#2a2522'; g.fillRect(0,0,W,H);
      const s=st(); if(s.sheet){ const ox=px-(x+.5)*CW, oy=py-(rowY+.78)*LH; g.save(); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=10; g.drawImage(paperC,ox,oy); g.restore(); }
      const pl=g.createLinearGradient(0,py+8,0,H); pl.addColorStop(0,'#3a3634'); pl.addColorStop(.35,'#121110'); pl.addColorStop(1,'#050505'); g.fillStyle=pl; g.fillRect(0,py+10,W,H-py-10);
      g.fillStyle='rgba(200,200,205,.9)'; g.fillRect(0,py-LH*2.2,W,3); for(const rx of [px-180,px+180]){ g.fillStyle='#1b1b1b'; g.beginPath(); g.ellipse(rx,py-LH*2.2+1,10,6,0,0,7); g.fill(); }
      g.fillStyle='rgba(190,192,198,.85)'; g.beginPath(); g.moveTo(px-18,py+14); g.lineTo(px-5,py-2); g.lineTo(px+5,py-2); g.lineTo(px+18,py+14); g.closePath(); g.fill();
      g.fillStyle='rgba(150,30,30,.75)'; g.fillRect(px-14,py+2,28,7);
      for(const b of bars){ const k=Math.sin(Math.min(1,b.t/.16)*Math.PI); if(k<=0)continue; g.fillStyle='rgba(30,30,32,'+(.9*k)+')'; g.fillRect(px-6,py+10-26*k,12,26*k); }
      g.fillStyle='#d8c890'; g.font='11px monospace'; g.textAlign='left'; g.fillText('COL '+(s.col-G.LM+1)+' / '+(G.RM-G.LM)+'   LINE '+(s.row-G.TOP+1),10,16);
      const scale=W/(G.COLS*1.2); g.fillStyle='#8a8070'; g.fillRect(0,H-14,W,14); for(let i=0;i<=G.COLS;i+=5){ const xx=px+(i-x)*CW; if(xx<0||xx>W)continue; g.fillStyle='#2a2522'; g.fillRect(xx,H-14,1,i%10?5:9); }
      for(const [m,cl] of [[G.LM,'#2a6a9a'],[G.RM,'#9a3a2a']]){ const xx=px+(m-x)*CW; g.fillStyle=cl; g.fillRect(xx-2,H-14,4,14); } };
    const drawKeys=()=>{ const g=KC.getContext('2d'), W=KC.width, H=KC.height; g.fillStyle='#ece5d3'; g.fillRect(0,0,W,H);
      const cx=W/2, s=st(), cxo=(42.5-x)*3; g.fillStyle='#161618'; g.fillRect(cx-300+cxo,6,600,18); g.fillStyle='#bfc1c6'; g.fillRect(cx-310+cxo,10,10,10); g.fillRect(cx+300+cxo,10,10,10);
      g.save(); g.translate(cx-322+cxo,12); g.rotate(ret?-.9:-.35); g.fillStyle='#c0c2c6'; g.fillRect(0,-2,-40,4); g.beginPath(); g.arc(-40,0,5,0,7); g.fill(); g.restore();
      g.fillStyle='#1a1a1d'; g.beginPath(); g.ellipse(cx,104,250,74,0,Math.PI,0); g.fill();
      for(let i=0;i<44;i++){ const a=Math.PI+(i+.5)/44*Math.PI, r=66, hit=bars.find(b=>(b.ch.toUpperCase().charCodeAt(0)*7)%44===i), k=hit?Math.sin(Math.min(1,hit.t/.16)*Math.PI):0;
        const x0=cx+Math.cos(a)*230, y0=104+Math.sin(a)*r, x1=cx+Math.cos(a)*170*(1-k), y1=104+Math.sin(a)*48*(1-k)-k*70; g.strokeStyle=hit?'#e8e2d0':'#55575c'; g.lineWidth=hit?3:2; g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke(); }
      g.fillStyle='#202024'; g.fillRect(cx-280,104,560,H-104); const pt=pressed&&performance.now()-pressed.t<110?pressed.ch.toUpperCase():null;
      for(let r=0;r<4;r++){ const row=ROWS4[r], y=128+r*24; for(let i=0;i<row.length;i++){ const xx=cx+(i-(row.length-1)/2)*40+r*8, down=pt===row[i]?3:0;
          g.fillStyle='#9a9ca2'; g.beginPath(); g.arc(xx,y+down,12,0,7); g.fill(); g.fillStyle='#f1ecdc'; g.beginPath(); g.arc(xx,y+down,9.5,0,7); g.fill(); g.fillStyle='#1c1a26'; g.font='bold 10px monospace'; g.textAlign='center'; g.fillText(row[i],xx,y+down+3.5); } }
      g.fillStyle=pt===' '?'#c8c2b0':'#e4dfcf'; g.fillRect(cx-110,H-14,220,9); g.strokeStyle='#9a9ca2'; g.strokeRect(cx-110,H-14,220,9); };
    let raf=0, t0=0; const loop=t=>{ if(box.hidden){ raf=0; return; } const dt=Math.min(.05,t0?(t-t0)/1000:.016); t0=t; for(let i=0;i<4;i++)step(dt/4); drawPaper(); drawKeys(); raf=requestAnimationFrame(loop); };
    const count=()=>{ nEl.textContent=TYPER.pages.length?TYPER.pages.length+' PAGE'+(TYPER.pages.length>1?'S':'')+' KEPT':''; box.querySelector('[data-a=out]').disabled=!st().sheet||!st().s; };
    const pullOut=()=>{ const s=st(); if(!s.sheet||!s.s)return; const ks2=TYPER.dec(s.s), lines={}; for(const k of ks2)(lines[k.r]=lines[k.r]||[])[k.c]=k.ch;
      const first=Object.keys(lines).map(Number).sort((a,b)=>a-b)[0], t=first==null?'':Array.from(lines[first],q=>q||' ').join('').trim().slice(0,28).toUpperCase();
      const p={id:'pg'+Date.now().toString(36),at:Date.now(),t:t||'TYPED PAGE',s:s.s}; TYPER.pages.push(p); TYPER.savePages(); TYPER.kind(p);
      Object.assign(s,{s:'',col:G.LM,row:G.TOP,sheet:false}); redraw(); snd('page',{vol:.6}); say('THE PAGE IS YOURS: HANG IT FROM DECORATE (PAGES).'); count(); TYPER.save(); };
    const fresh=()=>{ Object.assign(st(),{s:'',col:G.LM,row:G.TOP,sheet:true}); x=G.LM; v=0; rowY=G.TOP; redraw(); snd('page',{vol:.5}); say('A FRESH SHEET, ROLLED IN TO THE THIRD LINE.'); count(); TYPER.save(); };
    box.addEventListener('click',e=>{ const b=e.target.closest('button[data-a]'); if(!b)return; const a=b.dataset.a; if(a==='close')close(); else if(a==='new')fresh(); else if(a==='out')pullOut(); IN.focus(); });
    KC.addEventListener('mousedown',e=>{ const r=KC.getBoundingClientRect(), mx=(e.clientX-r.left)*KC.width/r.width, my=(e.clientY-r.top)*KC.height/r.height; if(my<40&&mx<KC.width/2-240)cr(); });   // the return lever
    const open=()=>{ redraw(); x=st().col; rowY=st().row; v=rv=0; box.hidden=false; count(); say(st().sheet?'TYPE. ENTER RETURNS THE CARRIAGE; BACKSPACE ONLY STEPS BACK.':'NO PAPER: NEW SHEET.'); if(keys&&keys.clear)keys.clear();
      TYPER.on=true; IN.focus(); if(!raf)raf=requestAnimationFrame(loop); };
    const close=()=>{ box.hidden=true; TYPER.on=false; IN.blur(); TYPER.save(); };
    TYPER.step=step; TYPER.strike=strike; TYPER.cr=cr; TYPER.back=back; TYPER.pullOut=pullOut; TYPER.fresh=fresh;
    return {open,close}; };

  SYS.add('places',()=>{ if(TYPER.on&&!(MODS.apts&&MODS.apts.inReal))TYPER.close(); },'150fc-typewriter');
  window.TYPERDBG=()=>({on:TYPER.on,unit:!!TYPER.unit,col:TYPER.st.col,row:TYPER.st.row,carX:+TYPER.carX.toFixed(2),n:TYPER.dec(TYPER.st.s).length,sheet:TYPER.st.sheet,pages:TYPER.pages.length,bells:TYPER.bells||0,thing:UI.things.some(t=>t.name==='TYPEWRITER')});
}
