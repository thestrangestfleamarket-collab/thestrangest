// THE MAP: a folded 1986 visitor's brochure. MAP on the pager (or Shift+M, or a click on the minimap) brings it up folded and it unfolds over the screen: the street level painted flat, every place numbered in its own colour, a guide column; F flips it to THE LOOP on the back; a click on a place or a station goes there; ESC folds it away.
import {SHARED} from './003-shx.js';
import {FORAGE, HANDHELD, keys, ONLINE, PARK, pos, ROOMS, TEXT, UI} from './003b-systems.js';
import {LEVEL, MODS, SECTION, SECTIONS, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
{ SYS.onStart(async()=>{ await LOAD('later'); if(FORAGE.has('map'))FORAGE.take('map',FORAGE.has('map')); },'141e-map');
  for(const [k,d] of Object.entries({'bro.title1':'THE STRANGEST','bro.title2':'FLEA MARKET','bro.sub':"VISITOR'S MAP & GUIDE · NEW YORK",'bro.sec':'SECTION {id} · {a} · {b}','bro.poi':'POINTS OF INTEREST','bro.flip':'FLIP FOR THE LOOP','bro.flip2':'the subway is on the back of this map · F',
    'bro.here':'YOU ARE HERE','bro.hours':'THE HOURS','bro.hours2':'SUNRISE · DAY · SUNSET · NIGHT, one real hour each','bro.foot':'FREE · TAKE ONE · PRINTED AT THE BODEGA · 1986','bro.loop':'THE LOOP','bro.loop2':'THE SUBWAY UNDER THE RING STREETS · {n} STATIONS · TWO TRAINS','bro.loop3':'one station a section: its letter is the section it serves',
    'bro.train':'TRAIN {n} · TO {next}','bro.track1':'TRAIN 1 · the outer track','bro.track2':'TRAIN 2 · the inner track','bro.stop':'A STOP AT EVERY STATION · a click on one rides there','bro.quiet':'the grey stations are sections not built yet','bro.back':'F FLIPS BACK TO THE MAP','bro.hint':'CLICK A PLACE TO GO THERE · WHEEL ZOOMS · F FLIPS IT · ESC FOLDS IT AWAY',
    'bro.cover3':"VISITOR'S MAP\n& GUIDE",'bro.cover4':'THE MAP ON ONE SIDE\nTHE LOOP ON THE OTHER','bro.free':'FREE · TAKE ONE','bro.ny':'NEW YORK','bro.ed':'1986 EDITION','bro.under':'underground','bro.water':'THE HUDSON'}))TEXT.t(k,d);
  const css=document.createElement('style'); css.textContent=`#bro{position:fixed;inset:0;z-index:30;perspective:1600px;background:rgba(6,8,14,.55);overflow:hidden;user-select:none;touch-action:none} #bro[hidden]{display:none}
    #bro .sh{position:absolute;left:0;top:0;width:320px;height:720px;transform-style:preserve-3d;transform-origin:0 0;will-change:transform}
    #bro .pn{position:absolute;left:0;top:0;width:320px;height:720px;transform-style:preserve-3d;transform-origin:0 50%} #bro .pn .pn{left:100%}
    #bro .fc{position:absolute;inset:0;backface-visibility:hidden;overflow:hidden;background:#f6f4ec;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)} #bro .fc.bk{transform:rotateY(180deg)} #bro .fc svg{position:absolute;left:0;top:0;width:320px;height:720px;display:block}
    #bro .fc i{position:absolute;top:0;bottom:0;width:22px;pointer-events:none} #bro .fc i.l{left:0;background:linear-gradient(90deg,rgba(0,0,0,.16),rgba(0,0,0,0))} #bro .fc i.r{right:0;background:linear-gradient(270deg,rgba(0,0,0,.1),rgba(0,0,0,0))}
    #bro .fc u{position:absolute;left:0;right:0;top:50%;height:14px;margin-top:-7px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.09) 50%,rgba(255,255,255,.12) 60%,rgba(0,0,0,0));pointer-events:none}
    #bro svg{fill:#111} #bro svg text{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;letter-spacing:.4px} #bro svg [data-go],#bro svg [data-st]{cursor:pointer} #bro svg [data-go]:hover,#bro svg [data-st]:hover{opacity:.75}
    #bro .hint{position:absolute;z-index:2;left:50%;bottom:10px;transform:translateX(-50%) translateZ(2px);font:9px Silkscreen,monospace;letter-spacing:1px;color:#f2c14e;text-shadow:1px 1px 0 #000;white-space:nowrap;pointer-events:none}`;
  document.head.appendChild(css);
  const W=document.createElement('div'); W.id='bro'; W.hidden=true; W.setAttribute('role','dialog'); W.setAttribute('aria-label','Map'); document.body.appendChild(W);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const PAL=['#ff7a1a','#00a65a','#ffd400','#8b3fc6','#0066cc','#ff3fa4'], DARK={'#ffd400':1}, PAPER='#f6f4ec', INK='#111', RED='#e21b1b', BLUE='#0066cc';
  const KC={void:PAPER,lot:'#e8e6de',water:'#1e88e5',quay:'#b9b7b0',road:PAPER,alley:'#dedcd4',walk:'#e2e0d8',land:'#d3e6b6',lawn:'#79c143',way:'#cfcac0',wall:INK};
  const txt=(t,x,y,sz,o={})=>`<text x="${x}" y="${y}" font-size="${sz}"${o.a?` text-anchor="${o.a}"`:''}${o.f?` fill="${o.f}"`:''}${o.w?` font-weight="${o.w}"`:''}${o.ls?` letter-spacing="${o.ls}"`:''}${o.op?` opacity="${o.op}"`:''}${o.x?' '+o.x:''}>${esc(t)}</text>`;
  const bullet=(n,x,y,r,col,fs,extra='')=>`<g${extra}><circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="${INK}" stroke-width="1.5"/>${txt(n,x,+y+fs*.36,fs,{a:'middle',f:DARK[col]?INK:'#fff'})}</g>`;
  const star=(x,y,r)=>`<polygon points="${[0,1,2,3,4,5,6,7,8,9].map(i=>{ const a=-Math.PI/2+i*Math.PI/5, q=i%2?r*.45:r; return (x+Math.cos(a)*q).toFixed(1)+','+(y+Math.sin(a)*q).toFixed(1); }).join(' ')}" fill="${RED}" stroke="${PAPER}" stroke-width="1.5"/>`;
  let PL=[], G=null;   // the numbered places and the sheet's geometry, made each time it opens
  /* ---------- the front: the map on the left, the guide column on the right ---------- */
  const front=()=>{ const Q=UI.mapPlan(), T=TILE, OX=SHARED.BOD.OX, OY=SHARED.BOD.OY, f=Math.min(960/Q.W,720/Q.H), mw=Q.W*f, mh=Q.H*f, my=(720-mh)/2, X=px=>px*f, Y=py=>my+py*f, TX=tx=>X(Q.sx(tx)), TY=ty=>Y(Q.sy(ty)), WX=x=>TX(OX+x/T), WY=z=>TY(OY+z/T);
    G={Q,f,mw,mh,my,toWorld:(sx,sy)=>{ const [tx,ty]=Q.tile(sx/f,(sy-my)/f); return [(tx-OX)*T,(ty-OY)*T]; }};
    const cv=document.createElement('canvas'); cv.width=Q.W; cv.height=Q.H; const g=cv.getContext('2d'), im=g.createImageData(Q.W,Q.H), RGB=Q.KN.map(k=>{ const c=KC[k]||PAPER; return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]; });
    for(let i=0,n=Q.W*Q.H;i<n;i++){ const c=RGB[Q.K[i]]; im.data[i*4]=c[0]; im.data[i*4+1]=c[1]; im.data[i*4+2]=c[2]; im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const S=[]; S.push(`<rect width="1280" height="720" fill="${PAPER}"/><image href="${cv.toDataURL()}" x="0" y="${my}" width="${mw}" height="${mh}" style="image-rendering:pixelated" preserveAspectRatio="none"/>`);
    // the ring street's kerbs
    const SM=MODS.sections; if(SM&&SM.road&&SM.inner)for(const r of [SM.road,SM.inner])S.push(`<rect x="${TX(r.x0)}" y="${TY(r.y1)}" width="${TX(r.x1)-TX(r.x0)}" height="${TY(r.y0)-TY(r.y1)}" fill="none" stroke="${INK}" stroke-width="2.5"/>`);
    // the places: UI's own list, each with a colour; its building (the box at its door) takes the colour too
    const seen=new Set(), spots=[]; PL=UI.places().filter(p=>p[0]!=='THE STREET'&&!seen.has(p[0])&&seen.add(p[0])).map(p=>{ let [name,x,z,lv]=p; const id=lv!=='down'&&ROOMS.boxAt?ROOMS.boxAt(x,z):null, o=id&&ROOMS.off[id]&&ROOMS.off[id].out; if(o){ x=o[0]; z=o[1]; lv=o[2]||'up'; } return {name,x,z,lv:lv==='down'?'down':'up'}; })
      .filter(p=>!spots.some(q=>Math.hypot(q[0]-p.x,q[1]-p.z)<1)&&spots.push([p.x,p.z])).map((p,i)=>({...p,n:i+1,col:p.lv==='down'?INK:PAL[i%PAL.length]}));   // an inside's spot is off the map: its door on the street stands for it; two at one door are one
    // the buildings: the level file's places (map tiles), then the plan's other boxes where no place stands; a place's building takes its colour, by name or by its door
    const B=LEVEL.places.filter(p=>p.kind!=='passage').map(p=>({x0:p.x0,y0:p.y1!=null?p.y0:LEVEL.block.back,x1:p.x1,y1:p.y1!=null?p.y1:LEVEL.block.front,n:p.name||'',k:p.kind==='fair'||p.kind==='lot'?'lot':p.kind==='stairs'?'stairs':'bld',place:null}));   // a fair or a lot is open ground, named; stairs a dark mark
    for(const b of Q.B){ if(b.k==='bld'&&!B.some(q=>q.x0<b.x1-.5&&b.x0<q.x1-.5&&q.y0<b.y1-.5&&b.y0<q.y1-.5))B.push({...b,place:null}); }
    for(const p of PL){ if(p.lv==='down')continue; const b=B.find(b=>!b.place&&b.n&&b.n.toUpperCase()===p.name.toUpperCase()); if(b)b.place=p; }
    for(const p of PL){ if(p.lv==='down'||B.some(b=>b.place===p))continue; const tx=OX+p.x/T, ty=OY+p.z/T, b=B.find(b=>!b.place&&tx>b.x0-2.5&&tx<b.x1+2.5&&ty>b.y0-2.5&&ty<b.y1+2.5); if(b)b.place=p; }
    for(const b of B){ const x=TX(b.x0), y=TY(b.y1), w=TX(b.x1)-x, h=TY(b.y0)-y; if(w<1.5||h<1.5)continue;
      if(b.k==='lot'){ S.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${b.place?b.place.col:'#eceae2'}" fill-opacity=".6" stroke="${INK}" stroke-width="1.2" stroke-dasharray="4 3"${b.place?` data-go="${esc(b.place.name)}"`:''}/>`); if(b.n&&!b.place)S.push(txt(b.n,x+w/2,y+h/2+3,Math.min(9,w/b.n.length*1.6),{a:'middle',op:.8,x:w<h?`transform="rotate(-90 ${(x+w/2).toFixed(1)} ${(y+h/2).toFixed(1)})"`:''})); continue; }
      S.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${b.place?b.place.col:b.k==='stairs'?INK:'#d8d6ce'}" stroke="${INK}" stroke-width="1.2"${b.place?` data-go="${esc(b.place.name)}"`:''}/>`); }
    for(const [n,x,y] of Q.L2)S.push(txt(n,TX(x),TY(y)+4,12,{a:'middle',ls:3}));
    { const P=PARK, park=PL.find(p=>/PARK$/.test(p.name)); if(park&&P.x0!=null)S.push(txt(park.name,TX((P.x0+P.x1)/2+P.ox),TY((P.y0+P.y1)/2+P.oy)+10,28,{a:'middle',f:'#2c5e1a',op:.8})); }
    if(SM&&SM.road&&SM.inner){ const ST=SECTIONS.streets||{}, rd=SM.road, inn=SM.inner, F=Q.F, cx=(Math.max(F.x0,inn.x0)+Math.min(F.x1,inn.x1))/2, cy=(Math.max(F.y0,inn.y0)+Math.min(F.y1,inn.y1))/2, inF=(x,y)=>x>F.x0&&x<F.x1&&y>F.y0&&y<F.y1;   // the ring streets' names where their bands cross this section
      for(const [n,x,y,r] of [[ST.south,cx,(rd.y0+inn.y0)/2,0],[ST.north,cx,(rd.y1+inn.y1)/2,0],[ST.west,(rd.x0+inn.x0)/2,cy,-90],[ST.east,(rd.x1+inn.x1)/2,cy,-90]])if(n&&inF(x,y)&&!Q.L2.some(l=>l[0]===n))S.push(txt(n,TX(x),TY(y)+4,12,{a:'middle',ls:3,x:r?`transform="rotate(${r} ${TX(x)} ${TY(y)})"`:''})); }
    for(const o of (ONLINE.others?[...ONLINE.others.values()]:[])){ if(!o.p)continue; S.push(`<circle cx="${WX(o.p.x).toFixed(1)}" cy="${WY(o.p.z).toFixed(1)}" r="4" fill="${BLUE}" stroke="${PAPER}" stroke-width="1.2"/>${txt(o.name||'',WX(o.p.x),WY(o.p.z)-7,7,{a:'middle'})}`); }
    for(const p of PL)S.push(bullet(p.n,WX(p.x).toFixed(1),WY(p.z).toFixed(1),8,p.col,10,` data-go="${esc(p.name)}"`));
    if(SHARED.LVL==='up'&&!ROOMS.cur){ S.push(star(WX(pos.x),WY(pos.z),10)); S.push(txt(TEXT.t('bro.here'),WX(pos.x),WY(pos.z)+21,8,{a:'middle',f:RED})); }
    S.push(`<g transform="translate(${mw-40} 40)"><circle r="20" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><polygon points="0,-16 5,0 0,4 -5,0" fill="${RED}"/><polygon points="0,16 5,0 0,-4 -5,0" fill="${INK}" opacity=".5"/>${txt('N',0,-24,10,{a:'middle'})}</g>`);
    // the guide column
    const gx=mw+18, gw=1280-gx-16, cx=gx+gw/2, ST=SECTIONS.streets||{};
    S.push(`<line x1="${mw+4}" y1="0" x2="${mw+4}" y2="720" stroke="${INK}" stroke-width="1" opacity=".3"/><rect x="${gx}" y="18" width="${gw}" height="10" fill="${INK}"/>`);
    S.push(txt(TEXT.t('bro.title1'),cx,70,26,{a:'middle'})+txt(TEXT.t('bro.title2'),cx,98,26,{a:'middle'})+txt(TEXT.t('bro.sub'),cx,120,10,{a:'middle',ls:2})+txt(TEXT.t('bro.sec',null,{id:SECTION.id,a:ST.south||'',b:ST.west||''}),cx,134,9,{a:'middle',ls:1}));
    S.push(`<line x1="${gx}" y1="148" x2="${gx+gw}" y2="148" stroke="${INK}" stroke-width="2"/>`+txt(TEXT.t('bro.poi'),gx,168,11,{ls:2}));
    const cols=gw>=420?2:1, per=Math.ceil(PL.length/cols), cw=gw/cols, rh=Math.min(13.6,400/per);
    PL.forEach((p,i)=>{ const c=Math.floor(i/per), x=gx+c*cw, y=188+(i%per)*rh; S.push(`<g data-go="${esc(p.name)}">`+bullet(p.n,x+9,y-3.5,6,p.col,7.5)+`<text x="${x+21}" y="${y}" font-size="9">${esc(p.name)}${p.lv==='down'?`<tspan font-weight="400" opacity=".8"> · ${esc(TEXT.t('bro.under'))}</tspan>`:''}</text></g>`); });
    S.push(`<g data-flip="1" style="cursor:pointer"><rect x="${gx}" y="578" width="${gw}" height="56" fill="${INK}"/><polygon points="${gx+gw-24},590 ${gx+gw-12},606 ${gx+gw-24},622" fill="${PAPER}"/>${txt(TEXT.t('bro.flip'),gx+12,602,15,{f:PAPER})}${txt(TEXT.t('bro.flip2'),gx+12,620,8.5,{f:PAPER,w:'600'})}</g>`);
    S.push(txt(TEXT.t('bro.hours'),gx,676,9.5,{ls:2})+txt(TEXT.t('bro.hours2'),gx,690,8,{w:'600'})+txt(TEXT.t('bro.foot'),cx,712,7,{a:'middle',w:'600',ls:1}));
    return S.join(''); };
  /* ---------- the back: the cover on the left panel, THE LOOP across the other three ---------- */
  const back=()=>{ const S=[]; S.push(`<rect width="1280" height="720" fill="${PAPER}"/>`);
    // the cover
    S.push(`<g fill="${INK}"><rect x="0" y="238" width="320" height="50"/>${[[18,198,26,40],[50,178,18,60],[74,210,30,28],[110,158,22,80],[138,190,34,48],[180,170,16,68],[202,204,40,34],[248,184,20,54],[274,214,30,24]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}<rect x="121" y="136" width="2" height="22"/></g><g fill="${PAPER}">${[[22,208],[30,208],[22,222],[54,188],[60,200],[116,170],[122,184],[116,198],[142,200],[158,212],[184,178],[184,192],[252,194],[258,210]].map(([a,b])=>`<rect x="${a}" y="${b}" width="4" height="5"/>`).join('')}</g>`);
    S.push(txt(TEXT.t('bro.ny'),22,46,15,{ls:4})+txt(TEXT.t('bro.ed'),298,44,11,{a:'end',f:RED,ls:2})+`<rect x="22" y="290" width="276" height="6" fill="${INK}"/>`+txt(TEXT.t('bro.title1'),22,330,20,{f:RED,ls:4})+txt(TEXT.t('bro.title2').split(' ')[0],22,372,36)+txt(TEXT.t('bro.title2').split(' ').slice(1).join(' '),22,410,36));
    TEXT.t('bro.cover3').split('\n').forEach((l,i)=>S.push(txt(l,22,486+i*19,13,{w:'600',ls:3})));
    S.push(`<rect x="22" y="540" width="276" height="46" fill="none" stroke="${INK}" stroke-width="2"/>`); TEXT.t('bro.cover4').split('\n').forEach((l,i)=>S.push(txt(l,32,559+i*15,10,{w:'600',ls:2})));
    S.push(`<rect x="22" y="658" width="166" height="28" fill="${RED}"/>`+txt(TEXT.t('bro.free'),105,677,12,{a:'middle',f:PAPER,ls:3}));
    // THE LOOP: the section grid, the park, the two tracks, every station
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
  /* ---------- the sheet: four panels on a zigzag fold; the fold, the flip, the zoom ---------- */
  let SH=null, up=false, flipped=false, busy=false, k=1, ox=0, oy=0, z=1, px=0, py=0, raf=0, cur=0;   // cur: how far unfolded, 0 to 1
  const fit=()=>{ k=Math.min(innerWidth/1280,innerHeight/720); ox=(innerWidth-1280*k)/2; oy=(innerHeight-720*k)/2; };
  const pose=(t,a)=>{ cur=t; const th=180*(1-t), s0=.36*k, sc=s0+(k-s0)*t, x=(innerWidth-330*s0)*(1-t)+ox*t, y=(innerHeight-730*s0)*(1-t)+oy*t, rz=-6*(1-t), rx=8*(1-t);
    SH.style.transform=`translate(${px}px,${py}px) scale(${z}) translate(${x}px,${y}px) scale(${sc}) rotateZ(${rz}deg) rotateX(${rx}deg) translate(640px,360px) rotateY(${a}deg) translate(-640px,-360px)`;
    SH.querySelectorAll('.pn').forEach((p,i)=>{ if(i)p.style.transform=`rotateY(${(i%2?-1:1)*th}deg)`; }); };
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, anim=(ms,f,done)=>{ cancelAnimationFrame(raf); const t0=performance.now(); const step=()=>{ const t=Math.min(1,(performance.now()-t0)/ms); f(ease(t)); if(t<1)raf=requestAnimationFrame(step); else done&&done(); }; step(); };
  const build=()=>{ const F=front(), K=back(); SH=document.createElement('div'); SH.className='sh'; let parent=SH;
    for(let i=0;i<4;i++){ const p=document.createElement('div'); p.className='pn'; p.innerHTML=`<div class="fc"><svg viewBox="${i*320} 0 320 720">${F}</svg><u></u>${i?'<i class="l"></i>':''}${i<3?'<i class="r"></i>':''}</div><div class="fc bk"><svg viewBox="${(3-i)*320} 0 320 720">${K}</svg>${i<3?'<u></u><i class="l"></i>':''}</div>`; parent.appendChild(p); parent=p; }
    W.innerHTML=''; W.appendChild(SH); W.insertAdjacentHTML('beforeend',`<div class="hint">${esc(TEXT.t('bro.hint'))}</div>`); };
  const open=()=>{ if(up)return close(); if(busy)return; up=true; busy=true; flipped=false; z=1; px=py=0; keys.clear(); fit(); build(); W.hidden=false; pose(0,0); anim(1100,t=>pose(t,0),()=>{ busy=false; }); };
  const close=()=>{ if(!up)return; busy=true; const a0=flipped?180:0, c=cur; anim(300+500*c,t=>pose(c*(1-t),a0*(1-t)),()=>{ W.hidden=true; W.innerHTML=''; SH=null; up=false; busy=false; }); };   // one motion: turned back and folded together, from wherever it is
  const flip=()=>{ if(!up||busy)return; busy=true; const a0=flipped?180:0, a1=flipped?0:180; anim(600,t=>pose(1,a0+(a1-a0)*t),()=>{ flipped=!flipped; busy=false; }); };
  const go=f=>{ if(busy)return; busy=true; const a0=flipped?180:0; anim(350,t=>pose(1-t,a0*(1-t)),()=>{ W.hidden=true; W.innerHTML=''; SH=null; up=false; busy=false; f(); }); };   // a quick fold, then there
  { let dr=null, moved=false; W.addEventListener('pointerdown',e=>{ dr={x:e.clientX,y:e.clientY,px,py}; moved=false; });
    W.addEventListener('pointermove',e=>{ if(!dr)return; if(Math.abs(e.clientX-dr.x)+Math.abs(e.clientY-dr.y)>5)moved=true; if(moved&&z>1&&!busy){ px=dr.px+e.clientX-dr.x; py=dr.py+e.clientY-dr.y; pose(1,flipped?180:0); } });
    W.addEventListener('pointerup',()=>{ dr=null; });
    W.addEventListener('wheel',e=>{ e.preventDefault(); if(!up||busy)return; const z0=z; z=Math.min(3,Math.max(1,z*(e.deltaY<0?1.25:.8))); if(z===1){ px=py=0; } else { px=e.clientX-(e.clientX-px)*z/z0; py=e.clientY-(e.clientY-py)*z/z0; } pose(1,flipped?180:0); },{passive:false});
    W.addEventListener('click',e=>{ if(moved||busy||!up)return; const el=e.target.closest?e.target.closest('[data-go],[data-st],[data-flip]'):null;
      if(el&&el.dataset.flip)return flip();
      if(el&&el.dataset.go){ const n=el.dataset.go; return go(()=>UI.goPlace(n)); }
      if(el&&el.dataset.st){ const st=(LOOP.STA||[]).find(q=>q.id===el.dataset.st); if(!st)return; return go(()=>{ if(st.old)return UI.goTo(MODS.station.plat.x,MODS.station.plat.z,'down'); const p=st.P(LOOP.LEN/2,LOOP.MID,0); UI.goTo(p[0],p[2],'down'); }); }
      if(flipped||!G)return; const svg=e.target.closest&&e.target.closest('svg'); if(!svg||!svg.closest('.fc')||svg.closest('.fc').classList.contains('bk'))return;   // a plain click on the map: go there
      const r=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal, sx=vb.x+(e.clientX-r.left)/r.width*vb.width, sy=(e.clientY-r.top)/r.height*vb.height; if(sx>G.mw||sy<G.my||sy>G.my+G.mh)return;
      const [x,zz]=G.toWorld(sx,sy); go(()=>UI.goTo(x,zz,'up')); }); }
  addEventListener('keydown',e=>{ const key=(e.key||'').toLowerCase(), sm=e.shiftKey&&key==='m'&&!e.ctrlKey&&!e.metaKey&&!e.altKey;
    if(sm){ if(e.repeat||(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]')))return; e.preventDefault(); e.stopImmediatePropagation(); if(up)return close(); if(UI.menuOpen)UI.toggleMenu(); return open(); }
    if(!up)return; e.preventDefault(); e.stopImmediatePropagation(); if(e.repeat)return;
    if(key==='escape'){ close(); if(HANDHELD.back)HANDHELD.back(); } else if(key==='f')flip(); },true);
  addEventListener('keyup',e=>{ if(up)e.stopImmediatePropagation(); },true);
  addEventListener('resize',()=>{ if(up&&!busy){ fit(); pose(1,flipped?180:0); } });
  UI.mapWindow=()=>{ if(!up)open(); };
  UI.brochure={open,close,flip,up:()=>up,flipped:()=>flipped,places:()=>PL.map(p=>p.name)};
  window.BRODBG=()=>({up,flipped,busy,places:PL.length,go:document.querySelectorAll('#bro [data-go]').length,st:document.querySelectorAll('#bro [data-st]').length}); }
