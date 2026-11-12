// THE MAP: a section of the ESC menu in its green look (owner, 10 Nov 2026: "B"): STREET (the street level, every place numbered on its building), SUBWAY, UNDERGROUND and GO TO (every place A to Z and the tenants' apartments); Shift+M, MAP on the quick bar or a click on the minimap opens it; a click on a place or on the map goes there.
import {SHARED} from './003-shx.js';
import {FORAGE, MARKS, ONLINE, PARK, pos, ROOMS, TEXT, UI} from './003b-systems.js';
import {LEVEL, MODS, SECTION, SECTIONS, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {STALL} from './081-stalls.js';
{ SYS.onStart(async()=>{ await LOAD('later'); if(FORAGE.has('map'))FORAGE.take('map',FORAGE.has('map')); },'141e-map');
  for(const [k,d] of Object.entries({'bro.here':'YOU ARE HERE','bro.loop':'THE SUBWAY','bro.loop2':'UNDER THE RING STREETS · {n} STATIONS · TWO TRAINS','bro.loop3':'one station a section: its letter is the section it serves',
    'bro.train':'TRAIN {n} · TO {next}','bro.track1':'TRAIN 1 · the outer track','bro.track2':'TRAIN 2 · the inner track','bro.stop':'A STOP AT EVERY STATION · click one to ride there','bro.quiet':'the dim stations are sections not built yet',
    'bro.hint':'CLICK A PLACE TO GO THERE · WHEEL ZOOMS · DRAG MOVES','bro.water':'THE HUDSON','bro.lake':'THE LAKE','bro.alley':'THE ALLEY','bro.prom':'THE PROMENADE','bro.g.underground':'UNDERGROUND','bro.g.else':'ELSEWHERE',
    'bro.find':'TYPE A NAME...','bro.myapt':'MY APARTMENT','bro.neighbours':'NEIGHBOURS','bro.online':'online','bro.dun':'THE DUNGEON','bro.dun2':'its plan shows once you have been down'}))TEXT.t(k,d);
  const css=document.createElement('style'); css.textContent=`#dbro svg.mv{display:block;margin:0 auto;width:auto;max-width:100%;height:calc(92vh - 215px);min-height:280px;background:#010805;box-shadow:inset 0 0 0 2px #3aa866;cursor:grab;touch-action:none;user-select:none;fill:#7dffa8}
    #dbro svg.mv text{font-family:var(--pixel);letter-spacing:1px} #dbro svg [data-go],#dbro svg [data-st]{cursor:pointer} #dbro svg [data-go]:hover,#dbro svg [data-st]:hover{opacity:.7} #dbro svg .nb:hover rect{fill:#7dffa8} #dbro svg .nb:hover text{fill:#020a06}
    #dbro .hint{margin-top:8px;font-size:13px} #dbro .gof{box-sizing:border-box;width:100%;font:inherit;color:var(--mt);background:var(--mb);border:2px solid var(--mi);padding:6px 8px;margin-bottom:8px} #dbro .gof::placeholder{color:var(--md)} #dbro .goapt{margin-bottom:8px}
    #dbro .gor{display:flex;gap:10px;align-items:center;padding:4px;cursor:pointer;white-space:nowrap} #dbro .gor i{font-style:normal;flex:none;width:28px;text-align:right;color:var(--md)} #dbro .gor span{margin-left:auto;color:var(--md)}
    #dbro .gor:hover{background:var(--mf);color:var(--mk)} #dbro .gor:hover i,#dbro .gor:hover span{color:var(--mk)} #dbro canvas.dun{display:block;max-width:100%;image-rendering:pixelated;filter:sepia(1) hue-rotate(75deg) saturate(1.6);box-shadow:0 0 0 2px #3aa866}`;
  document.head.appendChild(css);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const C={f:'#7dffa8',i:'#3aa866',b:'#031a0d',o:'#d8ffe4',e:'#0d3a1f',k:'#020a06',y:'#ffd27a'};   // the menu's own colours
  const KC={void:'#010805',lot:'#04170b',water:'#0b3b33',quay:'#0d2a1a',road:'#0a1f12',alley:'#0c2414',walk:'#0f2c1a',land:'#0a2a16',lawn:'#0d3a1f',way:'#1d5a33',wall:'#3aa866',fair:'#0f2c1a'};
  const txt=(t,x,y,sz,o={})=>`<text x="${x}" y="${y}" font-size="${sz}"${o.a?` text-anchor="${o.a}"`:''}${o.f?` fill="${o.f}"`:''}${o.ls?` letter-spacing="${o.ls}"`:''}${o.op?` opacity="${o.op}"`:''}${o.x?' '+o.x:''}>${esc(t)}</text>`;
  const num=(n,x,y,r,extra='')=>{ const w=r*(String(n).length>1?2.3:1.8), h=r*1.8; return `<g class="nb"${extra}><rect x="${(x-w/2).toFixed(1)}" y="${(y-h/2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${C.k}" stroke="${C.f}" stroke-width="1.2"/>${txt(n,x.toFixed(1),(y+r*.4).toFixed(1),(r*1.15).toFixed(1),{a:'middle',f:C.f})}</g>`; };
  const star=(x,y,r)=>`<polygon points="${[0,1,2,3,4,5,6,7,8,9].map(i=>{ const a=-Math.PI/2+i*Math.PI/5, q=i%2?r*.45:r; return (x+Math.cos(a)*q).toFixed(1)+','+(y+Math.sin(a)*q).toFixed(1); }).join(' ')}" fill="${C.y}" stroke="${C.k}" stroke-width="1.5"/>`;
  let PL=[], LN=[], LG=[], G=null;   // the numbered places and the street's geometry, made each time it shows
  /* ---------- STREET: the section cropped to its forcefields, the buildings, every place numbered ---------- */
  const street=()=>{ '@later'; const Q=UI.mapPlan(), T=TILE, OX=SHARED.BOD.OX, OY=SHARED.BOD.OY, E=(LEVEL.edge&&LEVEL.edge.lines)||[], F=Q.F;
    // the map cropped to the section (its forcefields and the houses on them), a little of the backdrop round it
    const ex=E.flatMap(l=>[l[0],l[2]]), ey=E.flatMap(l=>[l[1],l[3]]), vx0=Math.max(F.x0,(ex.length?Math.min(...ex):F.x0)-22), vx1=Math.min(F.x1,(ex.length?Math.max(...ex):F.x1)+4), vy0=Math.max(F.y0,(LEVEL.block&&LEVEL.block.walk?Math.min(...LEVEL.block.walk):F.y0)-16), vy1=Math.min(F.y1,(ey.length?Math.max(...ey):F.y1)+5);
    const f=Math.min(720/(vx1-vx0),720/(vy1-vy0)), mw=(vx1-vx0)*f, mh=720, my=0, TX=tx=>(tx-vx0)*f, TY=ty=>(vy1-ty)*f, WX=x=>TX(OX+x/T), WY=z=>TY(OY+z/T);
    G={Q,f,mw,mh,my,toWorld:(sx,sy)=>[(vx0+sx/f-OX)*T,(vy1-sy/f-OY)*T]};
    const cv=document.createElement('canvas'); cv.width=Q.W; cv.height=Q.H; const g=cv.getContext('2d'), im=g.createImageData(Q.W,Q.H), RGB=Q.KN.map(k=>{ const c=KC[k]||KC.void; return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]; });
    for(let i=0,n=Q.W*Q.H;i<n;i++){ const c=RGB[Q.K[i]]; im.data[i*4]=c[0]; im.data[i*4+1]=c[1]; im.data[i*4+2]=c[2]; im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const S=[]; S.push(`<rect width="${mw.toFixed(1)}" height="720" fill="${KC.void}"/><image href="${cv.toDataURL()}" x="${TX(F.x0).toFixed(1)}" y="${TY(F.y1).toFixed(1)}" width="${(Q.W/Q.S*f).toFixed(1)}" height="${(Q.H/Q.S*f).toFixed(1)}" style="image-rendering:pixelated" preserveAspectRatio="none"/>`);
    // past the forcefields: washed out (seen, never walked)
    const CH=[]; if(E.length){ CH.push(E[0]); for(let k=1;k<E.length;k++){ const q=CH[CH.length-1], n=E.find(l=>!CH.includes(l)&&Math.abs(l[0]-q[2])<.01&&Math.abs(l[1]-q[3])<.01); if(!n)break; CH.push(n); } }   // the outer loop of the edges (lines that join end to end from the first); any others stand inside it
    const ring=CH.length?CH.map((l,i)=>(i?'L':'M')+TX(l[0]).toFixed(1)+' '+TY(l[1]).toFixed(1)+' L'+TX(l[2]).toFixed(1)+' '+TY(l[3]).toFixed(1)).join(' '):'', lines=E.map(l=>'M'+TX(l[0]).toFixed(1)+' '+TY(l[1]).toFixed(1)+' L'+TX(l[2]).toFixed(1)+' '+TY(l[3]).toFixed(1)).join(' ');
    if(ring)S.push(`<path d="M0 0H${mw.toFixed(1)}V720H0Z ${ring} L${TX(CH[0][0]).toFixed(1)} ${TY(CH[0][1]).toFixed(1)}Z" fill="${KC.void}" fill-opacity=".62" fill-rule="evenodd"/>`);
    const SM=MODS.sections; if(SM&&SM.road&&SM.inner)for(const r of [SM.road,SM.inner])S.push(`<rect x="${TX(r.x0)}" y="${TY(r.y1)}" width="${TX(r.x1)-TX(r.x0)}" height="${TY(r.y0)-TY(r.y1)}" fill="none" stroke="${C.i}" stroke-width="1.5" opacity=".6"/>`);
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
    PL=[]; for(const [,L] of LS)for(const o of L)if(o.s&&!PL.includes(o.s)){ PL.push(o.s); o.s.n=PL.length; if(o.s.b)o.s.b.place=o.s; }
    LG=LS; LN=LS.flatMap(([,L])=>L.map(o=>o.name));
    const fit=(n,w,h,max)=>{ const L=Math.max(w,h); return Math.max(4,Math.min(max,L/Math.max(1,n.length)*1.3,Math.min(w,h)*.7)); };
    for(const b of B){ const x=TX(b.x0), y=TY(b.y1), w=TX(b.x1)-x, h=TY(b.y0)-y; if(w<1.5||h<1.5||x>mw)continue; const go=b.place?` data-go="${esc(b.place.name)}"`:'', rot=h>w*1.3?` transform="rotate(-90 ${(x+w/2).toFixed(1)} ${(y+h/2).toFixed(1)})"`:'';
      if(b.k==='lot')S.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${b.place?C.e:'none'}" stroke="${C.i}" stroke-width="1.2" stroke-dasharray="4 3"${go}/>`);
      else S.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${b.place?C.e:b.k==='stairs'?C.i:'#06200f'}" stroke="${b.place?C.f:C.i}" stroke-width="1.2"${go}/>`);
      if(b.n&&!b.place&&b.k!=='stairs'){ const fs=fit(TEXT.bare(b.n),w,h,8); S.push(txt(TEXT.bare(b.n),x+w/2,y+h/2+fs*.36,fs,{a:'middle',f:C.i,x:rot})); } }
    // the section's own ground named: the park, its lake, the streets, the alley, the promenade, the river
    const lab=(n,tx,ty,sz,o={})=>{ if(n&&tx>vx0&&tx<vx1&&ty>vy0&&ty<vy1)S.push(txt(n,TX(tx),TY(ty)+sz*.36,sz,{a:'middle',ls:o.ls??2,...o,x:o.r?`transform="rotate(${o.r} ${TX(tx).toFixed(1)} ${TY(ty).toFixed(1)})"`:''})); };
    if(P.x0!=null)lab(AREAS[3][1],(P.x0+P.x1)/2+P.ox,(P.y0+P.y1)/2+P.oy-8,26,{f:C.f,op:.85,ls:3});
    { const wi=Q.KN.indexOf('water'); let sx=0,sy=0,n=0; for(let j=0;j<Q.H;j+=2)for(let i=0;i<Q.W;i+=2){ if(Q.K[j*Q.W+i]!==wi)continue; const [tx,ty]=Q.tile(i,j); if(P.x0!=null&&tx>P.x0+P.ox&&tx<P.x1+P.ox&&ty>P.y0+P.oy&&ty<P.y1+P.oy&&tx<vx1){ sx+=tx; sy+=ty; n++; } } if(n>200)lab(TEXT.t('bro.lake'),sx/n,sy/n,12,{f:C.f,ls:3}); }
    const mx=(Math.max(vx0,ex.length?Math.min(...ex):vx0)+Math.min(vx1,ex.length?Math.max(...ex):vx1))/2;
    if(BL.alley)lab(TEXT.t('bro.alley'),mx-40,(BL.alley[0]+BL.alley[1])/2,6,{f:C.i});
    if(BL.walk)lab(TEXT.t('bro.prom'),mx-40,(BL.walk[0]+BL.walk[1])/2,10,{ls:4,f:C.i});
    lab(TEXT.t('bro.water'),mx,(vy0+(BL.walk?BL.walk[0]:vy0))/2,16,{f:C.f,ls:8});
    for(const [n,x,y] of Q.L2)lab(n,x,y,11,{ls:3,r:-90,f:C.i});
    if(SM&&SM.road&&SM.inner){ const ST=SECTIONS.streets||{}, rd=SM.road, inn=SM.inner, cx=(Math.max(vx0,inn.x0)+Math.min(vx1,inn.x1))/2, cy=(Math.max(vy0,inn.y0)+Math.min(vy1,inn.y1))/2;   // the ring streets' names where their bands cross this section
      for(const [n,x,y,r] of [[ST.south,cx,(rd.y0+inn.y0)/2,0],[ST.north,cx,(rd.y1+inn.y1)/2,0],[ST.west,(rd.x0+inn.x0)/2,cy,-90],[ST.east,(rd.x1+inn.x1)/2,cy,-90]])if(!Q.L2.some(l=>l[0]===n))lab(n,x,y,12,{ls:3,r,f:C.i}); }
    if(lines)S.push(`<path d="${lines}" fill="none" stroke="${C.f}" stroke-width="2" stroke-dasharray="8 5" opacity=".75"/>`);
    for(const o of (ONLINE.others?[...ONLINE.others.values()]:[])){ if(!o.p)continue; S.push(`<circle cx="${WX(o.p.x).toFixed(1)}" cy="${WY(o.p.z).toFixed(1)}" r="4" fill="${C.o}" stroke="${C.k}" stroke-width="1.2"/>${txt(o.name||'',WX(o.p.x),WY(o.p.z)-7,7,{a:'middle',f:C.o})}`); }
    for(const M of MARKS){ const x=WX(M.x), y=WY(M.z); if(x<0||x>mw||y<0||y>720)continue; S.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path d="M0 0 L-7 -12 A8 8 0 1 1 7 -12 Z" fill="${C.f}" stroke="${C.k}" stroke-width="1.5"/><circle cy="-16" r="3" fill="${C.k}"/></g>`+txt('INVITED: '+(M.name||''),x,y-28,8,{a:'middle',f:C.f})); }   // an invitation's place: a pin
    for(const p of PL){ if(p.lv==='down')continue; const b=B.find(q=>q.place===p), x=b?(TX(b.x0)+TX(b.x1))/2:WX(p.x), y=b?(TY(b.y0)+TY(b.y1))/2:WY(p.z), r=b?Math.max(4.5,Math.min(8.5,(TX(b.x1)-TX(b.x0))/2.3-.5,(TY(b.y0)-TY(b.y1))/2-.5)):8.5; if(x<0||x>mw||y<0||y>720)continue; S.push(num(p.n,x,y,r,` data-go="${esc(p.name)}"`)); }   // a narrow shop's number shrinks to fit it
    { const Cu=ROOMS.cur, R=Cu&&ROOMS.off[Cu.off||Cu.lz||Cu.id], o=R&&R.out, at=o?((o[2]||'up')==='up'?[o[0],o[1]]:null):SHARED.LVL==='up'&&!(Cu&&Cu.off)?[pos.x,pos.z]:null;
      if(at){ const x=WX(at[0]), y=WY(at[1]); if(x>0&&x<mw&&y>0&&y<720){ S.push(star(x,y,10)); S.push(txt(TEXT.t('bro.here'),x,y+21,8,{a:'middle',f:C.y})); } } }
    S.push(`<g transform="translate(${mw-34} 34)"><circle r="20" fill="${C.k}" stroke="${C.i}" stroke-width="1.5"/><polygon points="0,-16 5,0 0,4 -5,0" fill="${C.f}"/><polygon points="0,16 5,0 0,-4 -5,0" fill="${C.i}" opacity=".6"/>${txt('N',0,-24,10,{a:'middle',f:C.i})}</g>`);
    return `<svg class="mv" viewBox="0 0 ${mw.toFixed(1)} 720" preserveAspectRatio="xMidYMid meet" style="aspect-ratio:${mw.toFixed(1)}/720"><clipPath id="mvc"><rect width="${mw.toFixed(1)}" height="720"/></clipPath><g clip-path="url(#mvc)">${S.join('')}</g></svg>`; };
  /* ---------- SUBWAY: the section grid, the park, the two tracks, every station ---------- */
  const subway=()=>{ '@later'; const S=[], D=LOOP.D, SE=SECTIONS, gr=SE.grid, cols=gr.cols, rows=gr.rows, x0=400, y0=122, gw=800, gh=476, tw=gw/cols, th=gh/rows, loaded=new Set(SE.loaded.map(b=>b.id)), home=SECTION.id, OFF='#1d5a33';
    S.push(`<rect x="380" y="0" width="840" height="720" fill="${KC.void}"/><rect x="${x0}" y="96" width="${gw}" height="26" fill="${KC.water}"/><rect x="${x0}" y="${y0+gh}" width="${gw}" height="26" fill="${KC.water}"/>`+txt(TEXT.t('bro.water'),x0+gw/2,y0+gh+18,9,{a:'middle',f:C.f,ls:3}));
    for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){ const id=SE.ids[c][r], x=x0+c*tw, y=y0+(rows-1-r)*th; S.push(`<rect x="${x}" y="${y}" width="${tw}" height="${th}" fill="${id===home?C.e:loaded.has(id)?'#06200f':C.b}" stroke="${C.i}" stroke-width="2"/>`+txt(id,x+tw/2,r?y+60:y+th-32,44,{a:'middle',f:C.f,op:id===home?.5:.18})); }
    S.push(`<rect x="${x0+70}" y="${y0+100}" width="${gw-140}" height="${gh-200}" rx="26" fill="#0a2a16" stroke="${OFF}" stroke-width="3"/>`+txt((PL.find(p=>/PARK$/.test(p.name))||{name:''}).name,x0+gw/2,y0+gh/2+10,30,{a:'middle',f:C.i,ls:3}));
    S.push(`<rect x="${x0+38}" y="${y0+54}" width="${gw-76}" height="${gh-108}" rx="48" fill="none" stroke="${C.f}" stroke-width="9"/><rect x="${x0+56}" y="${y0+72}" width="${gw-112}" height="${gh-144}" rx="40" fill="none" stroke="${C.i}" stroke-width="9"/>`);
    const arrow=(x,y,a,c)=>`<polygon points="-9,-6 7,0 -9,6" fill="${c}" stroke="${C.k}" transform="translate(${x} ${y}) rotate(${a})"/>`, t1=D.trains[0].dir, t2=D.trains[1].dir;
    S.push(arrow(x0+gw*.9,y0+54,t1>0?0:180,C.f)+arrow(x0+gw*.1,y0+gh-54,t1>0?180:0,C.f)+arrow(x0+gw*.5,y0+72,t2>0?0:180,C.i)+arrow(x0+gw*.5,y0+gh-72,t2>0?180:0,C.i));
    const next=(SHARED.METRO&&SHARED.METRO.nextHere&&SHARED.METRO.nextHere())||null;
    for(const st of D.stations){ const c=SE.ids.findIndex(col=>col.includes(st.id)), r=SE.ids[c].indexOf(st.id), x=x0+c*tw+tw/2, top=r===rows-1, ya=top?y0+54:y0+gh-54, yb=top?y0+72:y0+gh-72, cy=top?y0+26:y0+gh-26, on=loaded.has(st.id);
      S.push(`<line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" stroke="${C.i}" stroke-width="12" stroke-linecap="round"/><line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" stroke="${C.k}" stroke-width="6" stroke-linecap="round"/>`);
      S.push(`<g${on?` data-st="${esc(st.id)}"`:''}><circle cx="${x}" cy="${cy}" r="15" fill="${st.id===home?C.f:C.k}" stroke="${on?C.f:OFF}" stroke-width="2"/>${txt(st.id,x,cy+6,16,{a:'middle',f:st.id===home?C.k:on?C.f:OFF})}${txt(st.name,x+22,cy+4,11,{f:on?C.f:OFF})}</g>`); }
    { const c=SE.ids.findIndex(col=>col.includes(home)), r=SE.ids[c].indexOf(home), x=x0+c*tw+tw/2-30, y=r===rows-1?y0+26:y0+gh-26; S.push(star(x,y,11)+txt(TEXT.t('bro.here'),x,y+24,8,{a:'middle',f:C.y})); }
    S.push(txt(TEXT.t('bro.loop'),400,70,36,{f:C.f,ls:6})+txt(TEXT.t('bro.loop2',null,{n:D.stations.length}),760,64,11,{ls:1.5,f:C.f})+txt(TEXT.t('bro.loop3'),760,80,10,{f:C.i}));
    S.push(`<line x1="400" y1="640" x2="1200" y2="640" stroke="${C.i}" stroke-width="2"/><line x1="400" y1="662" x2="440" y2="662" stroke="${C.f}" stroke-width="9"/><line x1="400" y1="690" x2="440" y2="690" stroke="${C.i}" stroke-width="9"/>`);
    S.push(txt(next?TEXT.t('bro.train',null,{n:1,next:next[0]}):TEXT.t('bro.track1'),450,666,11,{f:C.f})+txt(next?TEXT.t('bro.train',null,{n:2,next:next[1]}):TEXT.t('bro.track2'),450,694,11,{f:C.f}));
    S.push(txt(TEXT.t('bro.stop'),800,666,11,{f:C.f})+txt(TEXT.t('bro.quiet'),800,684,10,{f:C.i}));
    return `<svg class="mv" viewBox="380 0 840 720" preserveAspectRatio="xMidYMid meet" style="aspect-ratio:840/720">${S.join('')}</svg>`; };
  /* ---------- UNDERGROUND: its places, and the dungeon's plan once it has been built ---------- */
  const under=()=>{ '@later'; const L=(LG.find(([k])=>k===TEXT.t('bro.g.underground'))||[,[]])[1], E=TEXT.esc||esc;
    let h=`<h3>${E(TEXT.t('bro.g.underground'))}</h3>`+L.map(o=>`<div class="gor" data-go="${E(o.name)}"><i>${o.s?o.s.n:''}</i>${E(TEXT.bare(o.name))}</div>`).join('');
    const P=MODS.dunMap&&MODS.dunMap.plan(); h+=`<h3>${E(TEXT.t('bro.dun'))}</h3>`+(P?'<canvas class="dun"></canvas>':`<div class="dim">${E(TEXT.t('bro.dun2'))}</div>`);
    return [h,P]; };
  /* ---------- GO TO: every place the game registers, A to Z, with its number, and every tenant's apartment (owner, 8 and 9 Nov 2026) ---------- */
  let TL=[]; const gotoItems=()=>{ const key=TEXT.bare, items=LG.flatMap(([,L])=>L.map(o=>({name:o.name,n:o.s?o.s.n:null}))).sort((a,b)=>key(a.name).localeCompare(key(b.name))), apts=[];
    if(ONLINE.visit){ const on=ONLINE.others?[...ONLINE.others.values()].filter(o=>o&&o.id&&o.name):[], seen=new Set(on.map(o=>o.id));
      for(const o of on)apts.push({name:o.name.toUpperCase()+"'S APARTMENT",visit:o,on:1}); for(const t of TL)if(!seen.has(t.id)){ seen.add(t.id); apts.push({name:String(t.name).toUpperCase()+"'S APARTMENT",visit:t}); }
      apts.sort((a,b)=>a.name.localeCompare(b.name)); }
    return {items,apts,all:items.concat(apts)}; };
  const gotoRows=(f='')=>{ const {items,apts,all}=gotoItems(), F=f.trim().toUpperCase(), pick=o=>!F||o.name.includes(F), row=o=>`<div class="gor" data-i="${all.indexOf(o)}" data-n="${esc(o.name)}"><i>${o.n!=null?o.n:''}</i>${esc(TEXT.bare(o.name))}${o.on?'<span>'+esc(TEXT.t('bro.online'))+'</span>':''}</div>`;
    const A=apts.filter(pick); return {all,html:items.filter(pick).map(row).join('')+(A.length?`<h3>${esc(TEXT.t('bro.neighbours'))}</h3>`+A.map(row).join(''):''),n:items.filter(pick).length+A.length}; };
  /* ---------- the pane: drawn when its tab shows; the wheel zooms the picture, a drag moves it, a click goes there ---------- */
  let H=null, T='street', VB=null, VB0=null, ALL=[];
  const go=f=>{ if(UI.menuOpen)UI.toggleMenu(); f(); };
  const svgPt=(svg,e)=>{ const p=svg.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const setVB=()=>{ const s=H&&H.querySelector('svg.mv'); if(s&&VB)s.setAttribute('viewBox',VB.map(v=>v.toFixed(1)).join(' ')); };
  const wire=host=>{ if(host._bro)return; host._bro=1; let dr=null, moved=false;
    host.addEventListener('pointerdown',e=>{ const s=e.target.closest&&e.target.closest('svg.mv'); if(!s)return; dr={x:e.clientX,y:e.clientY,vb:VB.slice(),k:VB[2]/s.getBoundingClientRect().width}; moved=false; });
    host.addEventListener('pointermove',e=>{ if(!dr)return; if(Math.abs(e.clientX-dr.x)+Math.abs(e.clientY-dr.y)>5)moved=true; if(moved&&VB[2]<VB0[2]){ VB[0]=Math.max(VB0[0],Math.min(VB0[0]+VB0[2]-VB[2],dr.vb[0]-(e.clientX-dr.x)*dr.k)); VB[1]=Math.max(VB0[1],Math.min(VB0[1]+VB0[3]-VB[3],dr.vb[1]-(e.clientY-dr.y)*dr.k)); setVB(); } });
    addEventListener('pointerup',()=>{ dr=null; });
    host.addEventListener('wheel',e=>{ const s=e.target.closest&&e.target.closest('svg.mv'); if(!s||!VB)return; e.preventDefault(); const p=svgPt(s,e), k=e.deltaY<0?.8:1.25, w=Math.min(VB0[2],Math.max(VB0[2]/4,VB[2]*k)), h=w*VB0[3]/VB0[2];
      VB=[Math.max(VB0[0],Math.min(VB0[0]+VB0[2]-w,p.x-(p.x-VB[0])*w/VB[2])),Math.max(VB0[1],Math.min(VB0[1]+VB0[3]-h,p.y-(p.y-VB[1])*h/VB[3])),w,h]; setVB(); },{passive:false});
    host.addEventListener('click',e=>{ '@later'; if(moved){ moved=false; return; } const el=e.target.closest?e.target.closest('[data-go],[data-st],[data-i]'):null;
      if(el&&el.dataset.go){ const n=el.dataset.go; return go(()=>(UI.goName||UI.goPlace)(n)); }
      if(el&&el.dataset.i!=null){ const o=ALL[+el.dataset.i]; if(o)go(()=>o.visit?ONLINE.visit(o.visit.id,o.visit.name):UI.goName(o.name)); return; }
      if(el&&el.dataset.st){ const st=(LOOP.STA||[]).find(q=>q.id===el.dataset.st); if(!st)return; return go(()=>{ if(st.old)return UI.goTo(MODS.station.plat.x,MODS.station.plat.z,'down'); const p=st.P(LOOP.LEN/2,LOOP.MID,0); UI.goTo(p[0],p[2],'down'); }); }
      const s=e.target.closest&&e.target.closest('svg.mv'); if(T!=='street'||!s||!G)return; const p=svgPt(s,e); if(p.x<0||p.x>G.mw||p.y<0||p.y>720)return;   // a plain click on the street: go there
      const [x,zz]=G.toWorld(p.x,p.y); go(()=>UI.goTo(x,zz,'up')); }); };
  const into=(host,tab)=>{ '@later'; H=host; T=tab||'street'; wire(host); const pic=street(); let h='';
    if(T==='street'||T==='subway'){ h=(T==='street'?pic:subway())+`<div class="dim hint">${esc(TEXT.t('bro.hint'))}</div>`; host.innerHTML=h; const s=host.querySelector('svg.mv'), v=s.viewBox.baseVal; VB0=[v.x,v.y,v.width,v.height]; VB=VB0.slice(); return; }
    VB=VB0=null;
    if(T==='under'){ const [u,P]=under(); host.innerHTML=u; const c=host.querySelector('canvas.dun'); if(c&&P){ c.width=P.cv.width; c.height=P.cv.height; const g=c.getContext('2d'); g.drawImage(P.cv,0,0); g.font='9px "Share Tech Mono",monospace'; g.textAlign='center'; g.fillStyle=C.f; for(const n of P.names)g.fillText(n.nm,n.x,n.y);
      if(SHARED.LVL==='down'&&MODS.dungeon&&MODS.dungeon.in&&MODS.dungeon.in()){ g.fillStyle=C.y; g.fillRect(P.wx(pos.x)-4,P.wz(pos.z)-4,8,8); } } return; }
    host.innerHTML=`<button class="btn goapt" data-go="YOUR APARTMENT">${esc(TEXT.t('bro.myapt'))}</button><input class="gof" type="text" placeholder="${esc(TEXT.t('bro.find'))}" aria-label="${esc(TEXT.t('bro.find'))}"><div class="gox"></div>`;
    const F=host.querySelector('.gof'), X=host.querySelector('.gox'), fill=()=>{ const r=gotoRows(F.value); ALL=r.all; X.innerHTML=r.html; };
    fill(); F.oninput=fill; for(const ev of ['keydown','keyup'])F.addEventListener(ev,e=>{ if(e.key==='Escape')return; e.stopPropagation(); if(ev==='keydown'&&e.key==='Enter'){ const r=X.querySelector('.gor'); if(r)r.click(); } });
    setTimeout(()=>F.focus(),0); if(ONLINE.tenants)ONLINE.tenants().then(l=>{ TL=l||[]; if(H===host&&T==='goto'&&host.contains(F))fill(); }); };
  const isUp=()=>!!(UI.menuOpen&&UI.menuNow&&(UI.menuNow()||[])[0]==='map');
  const open=(tab)=>UI.menuTab('map',tab||'street'), close=()=>{ if(isUp())UI.toggleMenu(); };
  addEventListener('keydown',e=>{ const key=(e.key||'').toLowerCase(); if(!(e.shiftKey&&key==='m'&&!e.ctrlKey&&!e.metaKey&&!e.altKey))return; if(e.repeat||(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]')))return;
    e.preventDefault(); e.stopImmediatePropagation(); if(isUp())close(); else open(); },true);
  UI.mapWindow=()=>{ if(!isUp())open(); };
  UI.brochure={open:t=>open(t),close,flip:()=>open(T==='subway'?'street':'subway'),up:isUp,flipped:()=>isUp()&&T==='subway',tab:()=>T,places:()=>LN.slice(),into};
  window.BRODBG=()=>({up:isUp(),tab:T,flipped:isUp()&&T==='subway',places:LN.length,spots:PL.length,sel:gotoRows().n,go:H?H.querySelectorAll('[data-go]').length:0,st:H?H.querySelectorAll('[data-st]').length:0}); }
