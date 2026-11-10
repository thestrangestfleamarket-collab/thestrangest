// THE MAP: a folded 1986 visitor's brochure. MAP in the menu (or Shift+M, or a click on the minimap) brings it up, unfolded over the screen at once (no motion, owner 4 Nov 2026): the street level painted flat, every place numbered in its own colour, a guide column; F flips it to THE SUBWAY on the back; a click on a place or a station goes there; ESC puts it away.
import {SHARED} from './003-shx.js';
import {FORAGE, keys, MARKS, ONLINE, PARK, pos, ROOMS, TEXT, UI} from './003b-systems.js';
import {LEVEL, MODS, SECTION, SECTIONS, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {STALL} from './081-stalls.js';
{ SYS.onStart(async()=>{ await LOAD('later'); if(FORAGE.has('map'))FORAGE.take('map',FORAGE.has('map')); },'141e-map');
  for(const [k,d] of Object.entries({'bro.title1':'THE STRANGEST','bro.title2':'FLEA MARKET','bro.sub':"VISITOR'S MAP & GUIDE · NEW YORK",'bro.sec':'SECTION {id} · {a} · {b}','bro.poi':'POINTS OF INTEREST',
    'bro.here':'YOU ARE HERE','bro.hours':'THE HOURS','bro.hours2':'the sky keeps real Central time, one clock for everyone','bro.foot':'FREE · TAKE ONE · PRINTED AT THE BODEGA · 1986','bro.loop':'THE SUBWAY','bro.loop2':'THE SUBWAY UNDER THE RING STREETS · {n} STATIONS · TWO TRAINS','bro.loop3':'one station a section: its letter is the section it serves',
    'bro.train':'TRAIN {n} · TO {next}','bro.track1':'TRAIN 1 · the outer track','bro.track2':'TRAIN 2 · the inner track','bro.stop':'A STOP AT EVERY STATION · a click on one rides there','bro.quiet':'the grey stations are sections not built yet','bro.back':'F FLIPS BACK TO THE MAP','bro.hint':'CLICK A PLACE TO GO THERE · WHEEL ZOOMS · F FLIPS IT · ESC PUTS IT AWAY',
    'bro.cover3':"VISITOR'S MAP\n& GUIDE",'bro.cover4':'THE MAP ON ONE SIDE\nTHE SUBWAY ON THE OTHER','bro.free':'FREE · TAKE ONE','bro.ny':'NEW YORK','bro.ed':'1986 EDITION','bro.under':'underground','bro.water':'THE HUDSON','bro.goto':'GO TO','bro.choose':'CHOOSE A PLACE...','bro.lake':'THE LAKE','bro.alley':'THE ALLEY','bro.prom':'THE PROMENADE','bro.ff':'FORCEFIELD · THE EDGE OF THE SECTION','bro.g.outside':'OUTSIDE','bro.g.inside':'INSIDE','bro.g.underground':'UNDERGROUND','bro.g.else':'ELSEWHERE','bro.find':'TYPE A NAME...','bro.neighbours':'NEIGHBOURS ONLINE','bro.online':'online'}))TEXT.t(k,d);
  const css=document.createElement('style'); css.textContent=`#bro{position:fixed;inset:0;z-index:30;perspective:1600px;background:rgba(6,8,14,.55);overflow:hidden;user-select:none;touch-action:none} #bro[hidden]{display:none}
    #bro .sh{position:absolute;left:0;top:0;width:320px;height:720px;transform-style:preserve-3d;transform-origin:0 0;will-change:transform}
    #bro .pn{position:absolute;left:0;top:0;width:320px;height:720px;transform-style:preserve-3d;transform-origin:0 50%} #bro .pn .pn{left:100%}
    #bro .fc{position:absolute;inset:0;backface-visibility:hidden;overflow:hidden;background:#f6f4ec;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)} #bro .fc.bk{transform:rotateY(180deg)} #bro .fc svg{position:absolute;left:0;top:0;width:320px;height:720px;display:block}
    #bro .fc i{position:absolute;top:0;bottom:0;width:22px;pointer-events:none} #bro .fc i.l{left:0;background:linear-gradient(90deg,rgba(0,0,0,.16),rgba(0,0,0,0))} #bro .fc i.r{right:0;background:linear-gradient(270deg,rgba(0,0,0,.1),rgba(0,0,0,0))}
    #bro .fc u{position:absolute;left:0;right:0;top:50%;height:14px;margin-top:-7px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.09) 50%,rgba(255,255,255,.12) 60%,rgba(0,0,0,0));pointer-events:none}
    #bro svg{fill:#111} #bro svg text{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;letter-spacing:.4px} #bro svg [data-go],#bro svg [data-st]{cursor:pointer} #bro svg [data-go]:hover,#bro svg [data-st]:hover{opacity:.75}
    #bro .gob{position:absolute;transform:translateZ(2px);backface-visibility:hidden;font:900 9px 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.6px;color:#111} #bro .gob[hidden]{display:none}
    #bro .gob>button{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;width:100%;height:100%;padding:0 7px;background:#111;color:#f6f4ec;cursor:pointer;letter-spacing:2px} #bro .gob>button:hover{background:#e21b1b}
    #bro .gol{position:absolute;left:0;right:0;top:100%;margin-top:3px;max-height:470px;overflow:auto;background:#f6f4ec;border:2px solid #111;box-shadow:3px 3px 0 rgba(0,0,0,.25)} #bro .gol[hidden]{display:none}
    #bro .gol input{all:unset;box-sizing:border-box;display:block;width:100%;padding:4px 7px;border-bottom:1.5px solid #111;background:#ece9df;color:#111;font:inherit;letter-spacing:1px} #bro .gol input::placeholder{color:#777}
    #bro .gor{display:flex;align-items:center;gap:7px;padding:2px 7px;cursor:pointer;white-space:nowrap} #bro .gor:hover,#bro .gor.on{background:#111;color:#f6f4ec} #bro .gor i{flex:none;width:13px;height:13px;border-radius:50%;border:1.3px solid #111;font:900 7px 'Helvetica Neue',Arial,sans-serif;font-style:normal;display:flex;align-items:center;justify-content:center;color:#fff} #bro .gor span{opacity:.6;font-weight:600;margin-left:auto}
    #bro .gol h6{margin:0;padding:3px 7px 1px;font:inherit;letter-spacing:2px;opacity:.55}
    #bro .hint{position:absolute;z-index:2;left:50%;bottom:10px;transform:translateX(-50%) translateZ(2px);font:9px Silkscreen,monospace;letter-spacing:1px;color:#f2c14e;text-shadow:1px 1px 0 #000;white-space:nowrap;pointer-events:none}`;
  document.head.appendChild(css);
  const W=document.createElement('div'); W.id='bro'; W.hidden=true; W.setAttribute('role','dialog'); W.setAttribute('aria-label','Map'); document.body.appendChild(W);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const PAL=['#ff7a1a','#00a65a','#ffd400','#8b3fc6','#0066cc','#ff3fa4'], DARK={'#ffd400':1}, PAPER='#f6f4ec', INK='#111', RED='#e21b1b', BLUE='#0066cc';
  const KC={void:PAPER,lot:'#e8e6de',water:'#1e88e5',quay:'#b9b7b0',road:PAPER,alley:'#dedcd4',walk:'#e2e0d8',land:'#d3e6b6',lawn:'#79c143',way:'#cfcac0',wall:INK};
  const txt=(t,x,y,sz,o={})=>`<text x="${x}" y="${y}" font-size="${sz}"${o.a?` text-anchor="${o.a}"`:''}${o.f?` fill="${o.f}"`:''}${o.w?` font-weight="${o.w}"`:''}${o.ls?` letter-spacing="${o.ls}"`:''}${o.op?` opacity="${o.op}"`:''}${o.x?' '+o.x:''}>${esc(t)}</text>`;
  const bullet=(n,x,y,r,col,fs,extra='')=>`<g${extra}><circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="${INK}" stroke-width="1.5"/>${txt(n,x,+y+fs*.36,fs,{a:'middle',f:DARK[col]?INK:'#fff'})}</g>`;
  const star=(x,y,r)=>`<polygon points="${[0,1,2,3,4,5,6,7,8,9].map(i=>{ const a=-Math.PI/2+i*Math.PI/5, q=i%2?r*.45:r; return (x+Math.cos(a)*q).toFixed(1)+','+(y+Math.sin(a)*q).toFixed(1); }).join(' ')}" fill="${RED}" stroke="${PAPER}" stroke-width="1.5"/>`;
  let PL=[], LN=[], LG=[], G=null;   // the numbered places and the sheet's geometry, made each time it opens
  /* ---------- the front: the map on the left, the guide column on the right ---------- */
  const front=()=>{ '@later'; const Q=UI.mapPlan(), T=TILE, OX=SHARED.BOD.OX, OY=SHARED.BOD.OY, E=(LEVEL.edge&&LEVEL.edge.lines)||[], F=Q.F;
    // the map cropped to the section (its forcefields and the houses on them), a little of the backdrop round it
    const ex=E.flatMap(l=>[l[0],l[2]]), ey=E.flatMap(l=>[l[1],l[3]]), vx0=Math.max(F.x0,(ex.length?Math.min(...ex):F.x0)-22), vx1=Math.min(F.x1,(ex.length?Math.max(...ex):F.x1)+4), vy0=Math.max(F.y0,(LEVEL.block&&LEVEL.block.walk?Math.min(...LEVEL.block.walk):F.y0)-16), vy1=Math.min(F.y1,(ey.length?Math.max(...ey):F.y1)+5);
    const f=Math.min(720/(vx1-vx0),720/(vy1-vy0)), mw=(vx1-vx0)*f, mh=720, my=0, TX=tx=>(tx-vx0)*f, TY=ty=>(vy1-ty)*f, WX=x=>TX(OX+x/T), WY=z=>TY(OY+z/T);
    G={Q,f,mw,mh,my,toWorld:(sx,sy)=>[(vx0+sx/f-OX)*T,(vy1-sy/f-OY)*T]};
    const cv=document.createElement('canvas'); cv.width=Q.W; cv.height=Q.H; const g=cv.getContext('2d'), im=g.createImageData(Q.W,Q.H), RGB=Q.KN.map(k=>{ const c=KC[k]||PAPER; return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]; });
    for(let i=0,n=Q.W*Q.H;i<n;i++){ const c=RGB[Q.K[i]]; im.data[i*4]=c[0]; im.data[i*4+1]=c[1]; im.data[i*4+2]=c[2]; im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const S=[]; S.push(`<rect width="1280" height="720" fill="${PAPER}"/><image href="${cv.toDataURL()}" x="${TX(F.x0).toFixed(1)}" y="${TY(F.y1).toFixed(1)}" width="${(Q.W/Q.S*f).toFixed(1)}" height="${(Q.H/Q.S*f).toFixed(1)}" style="image-rendering:pixelated" preserveAspectRatio="none"/>`);
    // past the forcefields: washed out (seen, never walked)
    const CH=[]; if(E.length){ CH.push(E[0]); for(let k=1;k<E.length;k++){ const q=CH[CH.length-1], n=E.find(l=>!CH.includes(l)&&Math.abs(l[0]-q[2])<.01&&Math.abs(l[1]-q[3])<.01); if(!n)break; CH.push(n); } }   // the outer loop of the edges (lines that join end to end from the first); any others stand inside it
    const ring=CH.length?CH.map((l,i)=>(i?'L':'M')+TX(l[0]).toFixed(1)+' '+TY(l[1]).toFixed(1)+' L'+TX(l[2]).toFixed(1)+' '+TY(l[3]).toFixed(1)).join(' '):'', lines=E.map(l=>'M'+TX(l[0]).toFixed(1)+' '+TY(l[1]).toFixed(1)+' L'+TX(l[2]).toFixed(1)+' '+TY(l[3]).toFixed(1)).join(' ');
    if(ring)S.push(`<path d="M0 0H${mw.toFixed(1)}V720H0Z ${ring} L${TX(CH[0][0]).toFixed(1)} ${TY(CH[0][1]).toFixed(1)}Z" fill="${PAPER}" fill-opacity=".62" fill-rule="evenodd"/>`);
    const SM=MODS.sections; if(SM&&SM.road&&SM.inner)for(const r of [SM.road,SM.inner])S.push(`<rect x="${TX(r.x0)}" y="${TY(r.y1)}" width="${TX(r.x1)-TX(r.x0)}" height="${TY(r.y0)-TY(r.y1)}" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".5"/>`);
    // the buildings: the level file's places, then the plan's other boxes where none stands
    const B=LEVEL.places.filter(p=>p.kind!=='passage'&&!p.away).map(p=>({x0:p.x0,y0:p.y1!=null?p.y0:LEVEL.block.back,x1:p.x1,y1:p.y1!=null?p.y1:LEVEL.block.front,n:p.name||'',k:p.kind==='fair'||p.kind==='lot'?'lot':p.kind==='stairs'?'stairs':'bld',place:null}));
    for(const s of STALL.made)if(s.name){ const a=OX+s.bx[0]/T, b=OX+s.bx[2]/T, c=OY+s.bx[1]/T, d=OY+s.bx[3]/T; B.push({x0:Math.min(a,b),x1:Math.max(a,b),y0:Math.min(c,d)-.6,y1:Math.max(c,d)+.6,n:s.name,k:'bld',place:null}); }   // the park wall's stalls
    for(const b of Q.B){ if(b.k==='bld'&&!B.some(q=>q.x0<b.x1-.5&&b.x0<q.x1-.5&&q.y0<b.y1-.5&&b.y0<q.y1-.5))B.push({...b,place:null}); }
    // the places: every one GO TO lists; an inside stands at its door on the street; places in one building (or at one door) share its number, which sits on the building
    const AP=MODS.apts&&MODS.apts.doorW, P=PARK, BL=LEVEL.block||{}, ST=SECTIONS.streets||{};
    const spotOf=p=>{ let [name,x,z,lv]=p; if(lv==='down')return {x,z,lv:'down'}; if(AP&&(name==='YOUR APARTMENT'||(MODS.firev&&name===MODS.firev.name)))return {x:AP[0],z:AP[2],lv:'up'}; const id=ROOMS.boxAt?ROOMS.boxAt(x,z):null, o=id&&ROOMS.off[id]&&ROOMS.off[id].out; if(o){ x=o[0]; z=o[1]; } else if(id)return null; return {x,z,lv:'up',rid:id||null}; };
    const bldOf=(name,sp)=>{ if(sp.lv==='down')return null; const tx=OX+sp.x/T, ty=OY+sp.z/T; return B.find(b=>b.n&&b.n.toUpperCase()===name.toUpperCase())||B.find(b=>b.k!=='stairs'&&tx>b.x0-2.5&&tx<b.x1+2.5&&ty>b.y0-2.5&&ty<b.y1+2.5)||null; };
    const area=s=>{ if(s.lv==='down')return 'UNDERGROUND'; const tx=s.b?(s.b.x0+s.b.x1)/2:OX+s.x/T, ty=s.b?(s.b.y0+s.b.y1)/2:OY+s.z/T; if(BL.alley&&ty<BL.alley[1])return 'HUDSON'; if(P.y0!=null&&ty<P.y0+P.oy)return 'MARKET'; if(P.x0!=null&&tx<P.x0+P.ox)return 'WEST'; return 'PARK'; };
    const seen=new Set(), all=[]; for(const p of UI.places()){ const name=p[0]; if(seen.has(name))continue; seen.add(name); const sp=spotOf(p); if(!sp){ all.push({name,s:null}); continue; } const b=bldOf(name,sp);
      let s=all.map(q=>q.s).find(q=>q&&(sp.rid&&q.rid===sp.rid||(b?q.b===b:!q.b&&q.lv===sp.lv&&Math.hypot(q.x-sp.x,q.z-sp.z)<1))); if(!s){ s={...sp,b,name}; s.a=area(s); s.tx=b?(b.x0+b.x1)/2:OX+sp.x/T; } all.push({name,s}); }
    const AREAS=[['MARKET',ST.south||'MARKET ST'],['HUDSON',TEXT.t('bro.water')],['WEST',ST.west||'WEST ST'],['PARK',(UI.places().find(p=>/PARK$/.test(p[0]))||['CENTRAL PARK'])[0]],['UNDERGROUND',TEXT.t('bro.g.underground')],['ELSE',TEXT.t('bro.g.else')]];
    const LS=AREAS.map(([k,lab])=>[lab,all.filter(o=>(o.s?o.s.a:'ELSE')===k).sort((a,b)=>a.s&&b.s?a.s.tx-b.s.tx:0)]).filter(([,L])=>L.length);
    PL=[]; for(const [,L] of LS)for(const o of L)if(o.s&&!PL.includes(o.s)){ PL.push(o.s); o.s.n=PL.length; o.s.col=o.s.lv==='down'?INK:PAL[(o.s.n-1)%PAL.length]; if(o.s.b)o.s.b.place=o.s; }
    LG=LS; LN=LS.flatMap(([,L])=>L.map(o=>o.name));
    const fit=(n,w,h,max)=>{ const L=Math.max(w,h); return Math.max(4,Math.min(max,L/Math.max(1,n.length)*1.3,Math.min(w,h)*.7)); };
    for(const b of B){ const x=TX(b.x0), y=TY(b.y1), w=TX(b.x1)-x, h=TY(b.y0)-y; if(w<1.5||h<1.5||x>mw)continue; const go=b.place?` data-go="${esc(b.place.name)}"`:'', rot=h>w*1.3?` transform="rotate(-90 ${(x+w/2).toFixed(1)} ${(y+h/2).toFixed(1)})"`:'';
      if(b.k==='lot'){ S.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${b.place?b.place.col:'#eceae2'}" fill-opacity=".6" stroke="${INK}" stroke-width="1.2" stroke-dasharray="4 3"${go}/>`); }
      else S.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${b.place?b.place.col:b.k==='stairs'?INK:'#d8d6ce'}" stroke="${INK}" stroke-width="1.2"${go}/>`);
      if(b.n&&!b.place&&b.k!=='stairs'){ const fs=fit(b.n,w,h,8); S.push(txt(b.n,x+w/2,y+h/2+fs*.36,fs,{a:'middle',op:.7,x:rot})); } }
    // the section's own ground named: the park, its lake, the streets, the alley, the promenade, the river
    const lab=(n,tx,ty,sz,o={})=>{ if(n&&tx>vx0&&tx<vx1&&ty>vy0&&ty<vy1)S.push(txt(n,TX(tx),TY(ty)+sz*.36,sz,{a:'middle',ls:o.ls??2,...o,x:o.r?`transform="rotate(${o.r} ${TX(tx).toFixed(1)} ${TY(ty).toFixed(1)})"`:''})); };
    if(P.x0!=null)lab(AREAS[3][1],(P.x0+P.x1)/2+P.ox,(P.y0+P.y1)/2+P.oy-8,26,{f:'#2c5e1a',op:.8,ls:1});
    { const wi=Q.KN.indexOf('water'); let sx=0,sy=0,n=0; for(let j=0;j<Q.H;j+=2)for(let i=0;i<Q.W;i+=2){ if(Q.K[j*Q.W+i]!==wi)continue; const [tx,ty]=Q.tile(i,j); if(P.x0!=null&&tx>P.x0+P.ox&&tx<P.x1+P.ox&&ty>P.y0+P.oy&&ty<P.y1+P.oy&&tx<vx1){ sx+=tx; sy+=ty; n++; } } if(n>200)lab(TEXT.t('bro.lake'),sx/n,sy/n,12,{f:'#fff',ls:3}); }
    const mx=(Math.max(vx0,ex.length?Math.min(...ex):vx0)+Math.min(vx1,ex.length?Math.max(...ex):vx1))/2;
    if(BL.alley)lab(TEXT.t('bro.alley'),mx-40,(BL.alley[0]+BL.alley[1])/2,6,{op:.7});
    if(BL.walk)lab(TEXT.t('bro.prom'),mx-40,(BL.walk[0]+BL.walk[1])/2,10,{ls:4,op:.8});
    lab(TEXT.t('bro.water'),mx,(vy0+(BL.walk?BL.walk[0]:vy0))/2,16,{f:'#fff',ls:8});
    for(const [n,x,y] of Q.L2)lab(n,x,y,11,{ls:3,r:-90});
    if(SM&&SM.road&&SM.inner){ const ST=SECTIONS.streets||{}, rd=SM.road, inn=SM.inner, cx=(Math.max(vx0,inn.x0)+Math.min(vx1,inn.x1))/2, cy=(Math.max(vy0,inn.y0)+Math.min(vy1,inn.y1))/2;   // the ring streets' names where their bands cross this section
      for(const [n,x,y,r] of [[ST.south,cx,(rd.y0+inn.y0)/2,0],[ST.north,cx,(rd.y1+inn.y1)/2,0],[ST.west,(rd.x0+inn.x0)/2,cy,-90],[ST.east,(rd.x1+inn.x1)/2,cy,-90]])if(!Q.L2.some(l=>l[0]===n))lab(n,x,y,12,{ls:3,r}); }
    if(lines)S.push(`<path d="${lines}" fill="none" stroke="#12b5cf" stroke-width="2.5" stroke-dasharray="7 4"/>`);
    for(const o of (ONLINE.others?[...ONLINE.others.values()]:[])){ if(!o.p)continue; S.push(`<circle cx="${WX(o.p.x).toFixed(1)}" cy="${WY(o.p.z).toFixed(1)}" r="4" fill="${BLUE}" stroke="${PAPER}" stroke-width="1.2"/>${txt(o.name||'',WX(o.p.x),WY(o.p.z)-7,7,{a:'middle'})}`); }
    for(const M of MARKS){ const x=WX(M.x), y=WY(M.z); if(x<0||x>mw||y<0||y>720)continue; S.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path d="M0 0 L-7 -12 A8 8 0 1 1 7 -12 Z" fill="#1fa35a" stroke="${PAPER}" stroke-width="1.5"/><circle cy="-16" r="3" fill="${PAPER}"/></g>`+txt('INVITED: '+(M.name||''),x,y-28,8,{a:'middle',f:'#1fa35a'})); }   // an invitation's place: a green pin
    for(const p of PL){ if(p.lv==='down')continue; const b=B.find(q=>q.place===p), x=b?(TX(b.x0)+TX(b.x1))/2:WX(p.x), y=b?(TY(b.y0)+TY(b.y1))/2:WY(p.z), r=b?Math.max(4.5,Math.min(8.5,(TX(b.x1)-TX(b.x0))/2-.5,(TY(b.y0)-TY(b.y1))/2-.5)):8.5; if(x<0||x>mw||y<0||y>720)continue; S.push(bullet(p.n,x.toFixed(1),y.toFixed(1),r.toFixed(1),p.col,r*(p.n>9?1.05:1.2),` data-go="${esc(p.name)}"`)); }   // a narrow shop's number shrinks to fit it
    { const C=ROOMS.cur, R=C&&ROOMS.off[C.off||C.lz||C.id], o=R&&R.out, at=o?((o[2]||'up')==='up'?[o[0],o[1]]:null):SHARED.LVL==='up'&&!(C&&C.off)?[pos.x,pos.z]:null;
      if(at){ const x=WX(at[0]), y=WY(at[1]); if(x>0&&x<mw&&y>0&&y<720){ S.push(star(x,y,10)); S.push(txt(TEXT.t('bro.here'),x,y+21,8,{a:'middle',f:RED})); } } }
    S.push(`<g transform="translate(${mw-34} 34)"><circle r="20" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><polygon points="0,-16 5,0 0,4 -5,0" fill="${RED}"/><polygon points="0,16 5,0 0,-4 -5,0" fill="${INK}" opacity=".5"/>${txt('N',0,-24,10,{a:'middle'})}</g>`);
    // the guide column: the title, GO TO (the drop-down, laid over the sheet), the places by group
    const gx=mw+18, gw=1280-gx-16, cx=gx+gw/2;
    S.push(`<rect x="${mw}" y="0" width="${1280-mw}" height="720" fill="${PAPER}"/><line x1="${mw+4}" y1="0" x2="${mw+4}" y2="720" stroke="${INK}" stroke-width="1" opacity=".3"/><rect x="${gx}" y="18" width="${gw}" height="10" fill="${INK}"/>`);
    S.push(txt(TEXT.t('bro.title1'),cx,62,24,{a:'middle'})+txt(TEXT.t('bro.title2'),cx,88,24,{a:'middle'})+txt(TEXT.t('bro.sub'),cx,107,9.5,{a:'middle',ls:2})+txt(TEXT.t('bro.sec',null,{id:SECTION.id,a:ST.south||'',b:ST.west||''}),cx,121,8,{a:'middle',ls:2,w:'600'}));
    S.push(`<line x1="${gx}" y1="132" x2="${gx+gw}" y2="132" stroke="${INK}" stroke-width="2"/>`+txt(TEXT.t('bro.goto'),gx,152,11,{ls:2}));
    G.sel={x:gx+62,y:139,w:gw-62,h:18};
    S.push(`<line x1="${gx}" y1="168" x2="${gx+gw}" y2="168" stroke="${INK}" stroke-width="1" opacity=".4"/>`+txt(TEXT.t('bro.poi'),gx,185,11,{ls:2}));
    const HH=1.5, gh=LS.map(([,L])=>L.length+HH), tot=gh.reduce((a,b)=>a+b,0); let CM=gh.map(()=>0), best=tot; for(let m=0;m<1<<gh.length;m+=2){ let a=0; gh.forEach((h,i)=>{ if(m>>i&1)a+=h; }); const w=Math.max(a,tot-a); if(w<best-1e-9){ best=w; CM=gh.map((_,i)=>m>>i&1); } }   // two columns, the groups shared between them so neither runs long (owner, 8 Nov 2026: "too much empty space")
    const cw=gw/2, rh=Math.min(21,430/best), fz=Math.min(12,Math.max(9,rh*.62));
    LS.forEach(([k,L],i)=>{ const c=CM[i], r0=gh.slice(0,i).reduce((a,b,j)=>a+(CM[j]===c?b:0),0), x=gx+c*cw; let y=202+r0*rh;
      S.push(`<rect x="${x}" y="${(y-8).toFixed(1)}" width="${cw-14}" height="11" fill="${INK}"/>`+txt(k,x+4,(y+.5).toFixed(1),8,{f:PAPER,ls:2})); y+=HH*rh;
      for(const {name,s} of L){ S.push(`<g data-go="${esc(name)}">`+(s?bullet(s.n,x+9,(y-fz*.38).toFixed(1),fz*.66,s.col,fz*.82):'')+`<text x="${x+23}" y="${y.toFixed(1)}" font-size="${fz.toFixed(1)}">${esc(name)}</text></g>`); y+=rh; } });
    S.push(`<line x1="${gx}" y1="652" x2="${gx+40}" y2="652" stroke="#12b5cf" stroke-width="2.5" stroke-dasharray="7 4"/>`+txt(TEXT.t('bro.ff'),gx+48,655,8,{w:'600'}));
    S.push(txt(TEXT.t('bro.hours'),gx,676,9.5,{ls:2})+txt(TEXT.t('bro.hours2'),gx,690,8,{w:'600'})+txt(TEXT.t('bro.foot'),cx,712,7,{a:'middle',w:'600',ls:1}));
    return S.join(''); };
  /* ---------- the back: the cover on the left panel, THE SUBWAY across the other three ---------- */
  const back=()=>{ '@later'; const S=[]; S.push(`<rect width="1280" height="720" fill="${PAPER}"/>`);
    // the cover
    S.push(`<g fill="${INK}"><rect x="0" y="238" width="320" height="50"/>${[[18,198,26,40],[50,178,18,60],[74,210,30,28],[110,158,22,80],[138,190,34,48],[180,170,16,68],[202,204,40,34],[248,184,20,54],[274,214,30,24]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}<rect x="121" y="136" width="2" height="22"/></g><g fill="${PAPER}">${[[22,208],[30,208],[22,222],[54,188],[60,200],[116,170],[122,184],[116,198],[142,200],[158,212],[184,178],[184,192],[252,194],[258,210]].map(([a,b])=>`<rect x="${a}" y="${b}" width="4" height="5"/>`).join('')}</g>`);
    S.push(txt(TEXT.t('bro.ny'),22,46,15,{ls:4})+txt(TEXT.t('bro.ed'),298,44,11,{a:'end',f:RED,ls:2})+`<rect x="22" y="290" width="276" height="6" fill="${INK}"/>`+txt(TEXT.t('bro.title1'),22,330,20,{f:RED,ls:4})+txt(TEXT.t('bro.title2').split(' ')[0],22,372,36)+txt(TEXT.t('bro.title2').split(' ').slice(1).join(' '),22,410,36));
    TEXT.t('bro.cover3').split('\n').forEach((l,i)=>S.push(txt(l,22,486+i*19,13,{w:'600',ls:3})));
    S.push(`<rect x="22" y="540" width="276" height="46" fill="none" stroke="${INK}" stroke-width="2"/>`); TEXT.t('bro.cover4').split('\n').forEach((l,i)=>S.push(txt(l,32,559+i*15,10,{w:'600',ls:2})));
    S.push(`<rect x="22" y="658" width="166" height="28" fill="${RED}"/>`+txt(TEXT.t('bro.free'),105,677,12,{a:'middle',f:PAPER,ls:3}));
    // THE SUBWAY: the section grid, the park, the two tracks, every station
    const D=LOOP.D, SE=SECTIONS, gr=SE.grid, cols=gr.cols, rows=gr.rows, x0=400, y0=122, gw=800, gh=476, tw=gw/cols, th=gh/rows, loaded=new Set(SE.loaded.map(b=>b.id)), home=SECTION.id;
    S.push(`<rect x="${x0}" y="96" width="${gw}" height="26" fill="#1e88e5"/><rect x="${x0}" y="${y0+gh}" width="${gw}" height="26" fill="#1e88e5"/>`+txt(TEXT.t('bro.water'),x0+gw/2,y0+gh+18,9,{a:'middle',f:'#fff',ls:3}));
    for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){ const id=SE.ids[c][r], x=x0+c*tw, y=y0+(rows-1-r)*th; S.push(`<rect x="${x}" y="${y}" width="${tw}" height="${th}" fill="${id===home?'#ffe9e9':loaded.has(id)?'#eceae2':'#f1efe8'}" stroke="${INK}" stroke-width="2"/>`+txt(id,x+tw/2,r?y+60:y+th-32,44,{a:'middle',op:id===home?.5:.18})); }
    S.push(`<rect x="${x0+70}" y="${y0+100}" width="${gw-140}" height="${gh-200}" rx="26" fill="#79c143" stroke="#5aa832" stroke-width="3"/>`+txt((PL.find(p=>/PARK$/.test(p.name))||{name:''}).name,x0+gw/2,y0+gh/2+10,30,{a:'middle',f:'#2c5e1a',op:.8}));
    S.push(`<rect x="${x0+38}" y="${y0+54}" width="${gw-76}" height="${gh-108}" rx="48" fill="none" stroke="${RED}" stroke-width="9"/><rect x="${x0+56}" y="${y0+72}" width="${gw-112}" height="${gh-144}" rx="40" fill="none" stroke="${BLUE}" stroke-width="9"/>`);
    const arrow=(x,y,a,c)=>`<polygon points="-9,-6 7,0 -9,6" fill="${c}" transform="translate(${x} ${y}) rotate(${a})"/>`, t1=D.trains[0].dir, t2=D.trains[1].dir;
    S.push(arrow(x0+gw*.9,y0+54,t1>0?0:180,RED)+arrow(x0+gw*.1,y0+gh-54,t1>0?180:0,RED)+arrow(x0+gw*.5,y0+72,t2>0?0:180,BLUE)+arrow(x0+gw*.5,y0+gh-72,t2>0?180:0,BLUE));
    const next=(SHARED.METRO&&SHARED.METRO.nextHere&&SHARED.METRO.nextHere())||null;
    for(const st of D.stations){ const c=SE.ids.findIndex(col=>col.includes(st.id)), r=SE.ids[c].indexOf(st.id), x=x0+c*tw+tw/2, top=r===rows-1, ya=top?y0+54:y0+gh-54, yb=top?y0+72:y0+gh-72, cy=top?y0+26:y0+gh-26, on=loaded.has(st.id);
      S.push(`<line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" stroke="${PAPER}" stroke-width="6" stroke-linecap="round"/>`);
      S.push(`<g${on?` data-st="${esc(st.id)}"`:''}><circle cx="${x}" cy="${cy}" r="15" fill="${st.id===home?RED:on?INK:'#bbb'}"/>${txt(st.id,x,cy+6,16,{a:'middle',f:'#fff'})}${txt(st.name,x+22,cy+4,11,{f:on?INK:'#999'})}</g>`); }
    { const c=SE.ids.findIndex(col=>col.includes(home)), r=SE.ids[c].indexOf(home), x=x0+c*tw+tw/2-30, y=r===rows-1?y0+26:y0+gh-26; S.push(star(x,y,11)+txt(TEXT.t('bro.here'),x,y+24,8,{a:'middle',f:RED})); }
    S.push(`<rect x="336" y="18" width="928" height="10" fill="${INK}"/>`+txt(TEXT.t('bro.loop'),400,76,42)+txt(TEXT.t('bro.loop2',null,{n:D.stations.length}),760,70,10,{ls:1.5})+txt(TEXT.t('bro.loop3'),760,84,8.5,{w:'600'}));
    S.push(`<line x1="400" y1="640" x2="1200" y2="640" stroke="${INK}" stroke-width="2"/><line x1="400" y1="662" x2="440" y2="662" stroke="${RED}" stroke-width="9"/><line x1="400" y1="690" x2="440" y2="690" stroke="${BLUE}" stroke-width="9"/>`);
    S.push(txt(next?TEXT.t('bro.train',null,{n:1,next:next[0]}):TEXT.t('bro.track1'),450,666,9.5)+txt(next?TEXT.t('bro.train',null,{n:2,next:next[1]}):TEXT.t('bro.track2'),450,694,9.5));
    S.push(txt(TEXT.t('bro.stop'),800,666,9.5)+txt(TEXT.t('bro.quiet'),800,682,8.5,{w:'600'})+txt(TEXT.t('bro.back'),1200,712,8,{a:'end',ls:2}));
    return S.join(''); };
  /* ---------- the sheet: four panels on a zigzag fold, shown open; the flip, the zoom (no motion: it appears and disappears, owner 4 Nov 2026) ---------- */
  let SH=null, up=false, flipped=false, k=1, ox=0, oy=0, z=1, px=0, py=0;
  const fit=()=>{ k=Math.min(innerWidth/1280,innerHeight/720); ox=(innerWidth-1280*k)/2; oy=(innerHeight-720*k)/2; };
  const pose=(t,a)=>{ '@later'; const th=180*(1-t), s0=.36*k, sc=s0+(k-s0)*t, x=(innerWidth-330*s0)*(1-t)+ox*t, y=(innerHeight-730*s0)*(1-t)+oy*t, rz=-6*(1-t), rx=8*(1-t);
    SH.style.transform=`translate(${px}px,${py}px) scale(${z}) translate(${x}px,${y}px) scale(${sc}) rotateZ(${rz}deg) rotateX(${rx}deg) translate(640px,360px) rotateY(${a}deg) translate(-640px,-360px)`;
    SH.querySelectorAll('.pn').forEach((p,i)=>{ if(i)p.style.transform=`rotateY(${(i%2?-1:1)*th}deg)`; }); };
  const build=()=>{ '@later'; const F=front(), K=back(); SH=document.createElement('div'); SH.className='sh'; let parent=SH;
    for(let i=0;i<4;i++){ const p=document.createElement('div'); p.className='pn'; p.innerHTML=`<div class="fc"><svg viewBox="${i*320} 0 320 720">${F}</svg><u></u>${i?'<i class="l"></i>':''}${i<3?'<i class="r"></i>':''}</div><div class="fc bk"><svg viewBox="${(3-i)*320} 0 320 720">${K}</svg>${i<3?'<u></u><i class="l"></i>':''}</div>`; parent.appendChild(p); parent=p; }
    if(G&&G.sel){ const q=G.sel, box=document.createElement('div'); box.className='gob'; Object.assign(box.style,{left:q.x+'px',top:q.y+'px',width:q.w+'px',height:q.h+'px'});   // GO TO: every place the game registers, A to Z, with its number on the map, and your neighbours' apartments (owner, 8 Nov 2026)
      const key=n=>n.replace(/^THE /,''), items=LG.flatMap(([,L])=>L.map(o=>({name:o.name,n:o.s?o.s.n:null,col:o.s?o.s.col:null}))).sort((a,b)=>key(a.name).localeCompare(key(b.name)));
      // every tenant's apartment: those online now (marked) and the rest from the server's list
      let TL=[]; const apts=[], ALL=[...items], mkApts=()=>{ if(!ONLINE.visit)return; const on=ONLINE.others?[...ONLINE.others.values()].filter(o=>o&&o.id&&o.name):[], seen=new Set(on.map(o=>o.id));
        apts.length=0; for(const o of on)apts.push({name:o.name.toUpperCase()+"'S APARTMENT",visit:o,on:1}); for(const t of TL)if(!seen.has(t.id)){ seen.add(t.id); apts.push({name:String(t.name).toUpperCase()+"'S APARTMENT",visit:t}); }
        apts.sort((a,b)=>a.name.localeCompare(b.name)); ALL.length=items.length; ALL.push(...apts); }; mkApts();
      const row=(o,i)=>`<div class="gor" data-goto="${esc(o.name)}" data-i="${i}">${o.n!=null?`<i style="background:${o.col};${DARK[o.col]?'color:#111':''}">${o.n}</i>`:'<i style="background:#fff"></i>'}${esc(o.name)}${o.on?'<span>'+esc(TEXT.t('bro.online'))+'</span>':''}</div>`;
      box.innerHTML=`<button type="button" aria-haspopup="listbox"><b>${esc(TEXT.t('bro.choose'))}</b><b>▾</b></button><div class="gol" hidden role="listbox"><input type="text" placeholder="${esc(TEXT.t('bro.find'))}" aria-label="${esc(TEXT.t('bro.find'))}"><div class="gox"></div></div>`;
      const L=box.querySelector('.gol'), F=box.querySelector('input'), X=box.querySelector('.gox');
      const fill=()=>{ mkApts(); const f=F.value.trim().toUpperCase(), pick=o=>!f||o.name.includes(f); X.innerHTML=items.map((o,i)=>[o,i]).filter(([o])=>pick(o)).map(([o,i])=>row(o,i)).join('')+(apts.some(pick)?`<h6>${esc(TEXT.t('bro.neighbours'))}</h6>`+apts.map((o,i)=>[o,items.length+i]).filter(([o])=>pick(o)).map(([o,i])=>row(o,i)).join(''):''); };
      const toggle=()=>{ L.hidden=!L.hidden; if(!L.hidden){ F.value=''; fill(); F.focus(); if(ONLINE.tenants)ONLINE.tenants().then(l=>{ TL=l||[]; if(!L.hidden)fill(); }); } };
      box.querySelector('button').onclick=e=>{ e.stopPropagation(); toggle(); };
      F.oninput=fill;
      X.onclick=e=>{ e.stopPropagation(); const r=e.target.closest('.gor'); if(!r)return; const o=ALL[+r.dataset.i]; if(!o)return; go(()=>o.visit?ONLINE.visit(o.visit.id,o.visit.name):UI.goName(o.name)); };
      for(const ev of ['pointerdown','click','wheel'])box.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
      SH.appendChild(box); }
    W.innerHTML=''; W.appendChild(SH); W.insertAdjacentHTML('beforeend',`<div class="hint">${esc(TEXT.t('bro.hint'))}</div>`); };
  const open=()=>{ if(up)return close(); up=true; flipped=false; z=1; px=py=0; keys.clear(); fit(); build(); W.hidden=false; pose(1,0); };
  const close=()=>{ if(!up)return; W.hidden=true; W.innerHTML=''; SH=null; up=false; };
  const flip=()=>{ if(!up)return; flipped=!flipped; pose(1,flipped?180:0); const sel=SH&&SH.querySelector('.gob'); if(sel){ sel.hidden=flipped; const l=sel.querySelector('.gol'); if(l)l.hidden=true; } };
  const go=f=>{ close(); f(); };
  { let dr=null, moved=false; W.addEventListener('pointerdown',e=>{ dr={x:e.clientX,y:e.clientY,px,py}; moved=false; });
    W.addEventListener('pointermove',e=>{ if(!dr)return; if(Math.abs(e.clientX-dr.x)+Math.abs(e.clientY-dr.y)>5)moved=true; if(moved&&z>1){ px=dr.px+e.clientX-dr.x; py=dr.py+e.clientY-dr.y; pose(1,flipped?180:0); } });
    W.addEventListener('pointerup',()=>{ dr=null; });
    W.addEventListener('wheel',e=>{ e.preventDefault(); if(!up)return; const z0=z; z=Math.min(3,Math.max(1,z*(e.deltaY<0?1.25:.8))); if(z===1){ px=py=0; } else { px=e.clientX-(e.clientX-px)*z/z0; py=e.clientY-(e.clientY-py)*z/z0; } pose(1,flipped?180:0); },{passive:false});
    W.addEventListener('click',e=>{ '@later'; if(moved||!up)return; const el=e.target.closest?e.target.closest('[data-go],[data-st],[data-flip]'):null;
      if(el&&el.dataset.flip)return flip();
      if(el&&el.dataset.go){ const n=el.dataset.go; return go(()=>(UI.goName||UI.goPlace)(n)); }
      if(el&&el.dataset.st){ const st=(LOOP.STA||[]).find(q=>q.id===el.dataset.st); if(!st)return; return go(()=>{ if(st.old)return UI.goTo(MODS.station.plat.x,MODS.station.plat.z,'down'); const p=st.P(LOOP.LEN/2,LOOP.MID,0); UI.goTo(p[0],p[2],'down'); }); }
      if(flipped||!G)return; const svg=e.target.closest&&e.target.closest('svg'); if(!svg||!svg.closest('.fc')||svg.closest('.fc').classList.contains('bk'))return;   // a plain click on the map: go there
      const r=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal, sx=vb.x+(e.clientX-r.left)/r.width*vb.width, sy=(e.clientY-r.top)/r.height*vb.height; if(sx>G.mw||sy<G.my||sy>G.my+G.mh)return;
      const [x,zz]=G.toWorld(sx,sy); go(()=>UI.goTo(x,zz,'up')); }); }
  addEventListener('keydown',e=>{ const key=(e.key||'').toLowerCase(), sm=e.shiftKey&&key==='m'&&!e.ctrlKey&&!e.metaKey&&!e.altKey;
    if(sm){ if(e.repeat||(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]')))return; e.preventDefault(); e.stopImmediatePropagation(); if(up)return close(); if(UI.menuOpen)UI.toggleMenu(); return open(); }
    if(!up)return; e.stopImmediatePropagation(); if(e.target&&e.target.matches&&e.target.matches('#bro input')&&key!=='escape'){ if(key==='enter'){ const r=W.querySelector('.gor'); if(r)r.click(); } return; } e.preventDefault(); if(e.repeat)return;   // the drop-down keeps its own keys
    if(key==='escape'){ close(); } else if(key==='f')flip(); },true);
  addEventListener('keyup',e=>{ if(up)e.stopImmediatePropagation(); },true);
  addEventListener('resize',()=>{ if(up){ fit(); pose(1,flipped?180:0); } });
  UI.mapWindow=()=>{ if(!up)open(); };
  UI.brochure={open,close,flip,up:()=>up,flipped:()=>flipped,places:()=>LN.slice()};
  window.BRODBG=()=>({up,flipped,places:LN.length,spots:PL.length,sel:(()=>{ const b=document.querySelector('#bro .gob'); if(!b)return 0; const l=b.querySelector('.gol'), h=l.hidden; l.hidden=false; b.querySelector('input').dispatchEvent(new Event('input')); const n=b.querySelectorAll('.gor').length; l.hidden=h; return n; })(),go:document.querySelectorAll('#bro [data-go]').length,st:document.querySelectorAll('#bro [data-st]').length}); }
