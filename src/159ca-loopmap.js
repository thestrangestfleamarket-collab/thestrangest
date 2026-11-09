// THE LOOP MAP: the square map sign on a platform's end wall is a thing: double-click it for the close-up window (all eight sections with the trains on the loop, this section, the next trains here, the schedule at every station, details).
import {SHARED} from './003-shx.js';
import {pos, TEXT, UI} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {TRAINS} from './009c-trains.js';
const LOOPMAP={};
{
  const T=TILE, esc=TEXT.esc;
  const sp=document.createElement('div'); sp.id='loopmap'; sp.hidden=true;
  sp.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(980px,96vw);max-height:92vh;overflow:auto;z-index:21;padding:14px 18px;box-sizing:border-box;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#7dffa8;background:rgba(3,26,13,.97);box-shadow:inset 0 0 0 2px #3aa866,0 20px 60px #000;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>{ if(e.key==='Escape')LOOPMAP.close(); e.stopPropagation(); }); sp.addEventListener('keyup',e=>e.stopPropagation());
  const closeB=document.createElement('button'); closeB.className='pX'; closeB.textContent='X'; closeB.style.cssText='position:absolute;right:10px;top:10px;font:inherit;color:#7dffa8;background:#031a0d;border:2px solid #3aa866;padding:3px 8px;cursor:pointer'; closeB.onclick=()=>LOOPMAP.close();
  const body=document.createElement('div'); sp.append(closeB,body);
  const cv=document.createElement('canvas'); cv.width=520; cv.height=300; cv.style.cssText='width:520px;max-width:100%;display:block;background:#061a0e';
  const mmss=s=>{ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  const clock=()=>{ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
  const here=()=>LOOPMAP.at||(LOOP.here&&LOOP.here(pos.x,pos.z).st)||LOOP.STA[0];
  const C1='#f0a72a', C2='#38b7a6';
  const drawAll=st=>{ '@later'; const g=cv.getContext('2d'), secs=(SHARED.SECTIONS&&SHARED.SECTIONS.list)||[], W=cv.width, H=cv.height; g.fillStyle='#061a0e'; g.fillRect(0,0,W,H); if(!secs.length)return;
    const x0=Math.min(...secs.map(s=>s.x0)), x1=Math.max(...secs.map(s=>s.x1)), y0=Math.min(...secs.map(s=>s.y0)), y1=Math.max(...secs.map(s=>s.y1)), X=x=>20+(x-x0)/(x1-x0)*(W-40), Y=y=>20+(y1-y)/(y1-y0)*(H-40);
    for(const s of secs){ g.fillStyle=s.id===st.id?'#1d4a2c':'#0f2d1a'; g.fillRect(X(s.x0)+2,Y(s.y1)+2,X(s.x1)-X(s.x0)-4,Y(s.y0)-Y(s.y1)-4); g.fillStyle='#7dffa8'; g.font='bold 18px Silkscreen,monospace'; g.fillText(s.id,X(s.x0)+10,Y(s.y1)+24); }
    for(const [k,col] of [['outer',C1],['inner',C2]]){ const t=LOOP.TRK[k]; if(!t)continue; g.strokeStyle=col; g.lineWidth=3; g.beginPath(); for(let s=0;s<=t.L;s+=3){ const o=t.pt(s); s?g.lineTo(X(o.x),Y(o.y)):g.moveTo(X(o.x),Y(o.y)); } g.stroke(); }
    for(const d of LOOP.D.stations){ const s=LOOP.STA.find(q=>q.id===d.id); const x=X(d.x), y=Y(LOOP.D.tracks.inner[d.side]+(d.side==='south'?-8.7:8.7)); g.fillStyle=d.id===st.id?'#e7685a':s?'#050505':'#1a2a1f'; g.beginPath(); g.arc(x,y,6,0,7); g.fill(); g.strokeStyle=s?'#f6f6f1':'#3aa866'; g.lineWidth=2; g.stroke(); g.fillStyle=s?'#f6f6f1':'#3aa866'; g.font='10px Silkscreen,monospace'; g.fillText(d.id+' '+d.name,x+9,y+(d.side==='south'?14:-6)); }
    for(const tn of TRAINS.list){ const c=tn.at; if(!c)continue; g.fillStyle=tn.id===1?C1:C2; g.fillRect(X(LOOP.MX(c.x))-6,Y(LOOP.MY(c.z))-4,12,8); } };
  const draw=()=>{ '@later'; if(sp.hidden||!LOOP.STA||!LOOP.STA.length)return; const st=here(), now=TRAINS.now();
    const next=TRAINS.list.map(tn=>{ const u=TRAINS.until(tn,st,now), e=tn.tbl.find(q=>q.st===st), to=e?e.nx.name:st.name; return `<tr><td style="padding:4px;border-bottom:2px solid #0d3a1f;color:${tn.id===1?C1:C2}">● ${tn.id}</td><td style="padding:4px;border-bottom:2px solid #0d3a1f">${tn.dir>0?'↻':'↺'} TRAIN ${tn.id}</td><td style="padding:4px;border-bottom:2px solid #0d3a1f">TO ${esc(to)}</td><td style="padding:4px;border-bottom:2px solid #0d3a1f;text-align:right;color:#d8ffe4">${u.now?'NOW · DOORS OPEN '+mmss(u.left):u.left<45?'ARRIVING':mmss(u.left)}</td></tr>`; }).join('');
    const sched=[...LOOP.D.stations].sort((a,b)=>a.id<b.id?-1:1).map(d=>{ const s=LOOP.STA.find(q=>q.id===d.id); const cells=TRAINS.list.map(tn=>{ if(!s)return '<td style="text-align:right;color:#1f5a35">—</td>'; const u=TRAINS.until(tn,s,now); return `<td style="text-align:right;color:${tn.id===1?C1:C2}">${u.now?'NOW':mmss(u.left)}</td>`; }).join(''); return `<tr style="${d.id===st.id?'color:#d8ffe4':''}"><td>${d.id}</td><td>${esc(d.name)}${s?'':' <span style="color:#1f5a35">(CLOSED)</span>'}</td>${cells}</tr>`; }).join('');
    const lap=TRAINS.list[0]?TRAINS.list[0].lap:0, dwell=LOOP.D.dwell||60;
    body.innerHTML=`<div style="display:flex;justify-content:space-between;color:#d8ffe4;font-size:20px;letter-spacing:3px;border-bottom:2px solid #0d3a1f;padding:0 40px 8px 0">[ THE LOOP ] <span style="font-size:13px;color:#3aa866">SECTION ${esc(st.id)} · ${esc(st.name)} · ${clock()}</span></div>
      <div style="display:flex;gap:18px;margin-top:12px;flex-wrap:wrap"><div><div style="color:#3aa866;margin-bottom:6px">ALL EIGHT SECTIONS</div><div id="lmap"></div></div>
        <div style="flex:1;min-width:300px"><div style="color:#3aa866;margin-bottom:6px">THIS SECTION · ${esc(st.id)}</div><div style="height:150px;background:#061a0e;position:relative;overflow:hidden">
          <div style="position:absolute;left:30px;top:50px;right:30px;height:50px;background:#1d4a2c"></div><div style="position:absolute;left:30px;top:38px;right:30px;height:4px;background:${C1}"></div><div style="position:absolute;left:30px;top:108px;right:30px;height:4px;background:${C2}"></div>
          <div style="position:absolute;left:46px;top:62px;color:#d8ffe4">PLATFORM ${esc(st.id)} · ${esc(st.name)}</div><div style="position:absolute;right:40px;top:20px;color:#bff2b0;font-size:10px">▲ EXIT ${esc(st.id)}1 · ${esc(st.street||st.name)}</div>
          <div style="position:absolute;left:150px;top:80px;width:10px;height:10px;border-radius:50%;background:#e7685a"></div><div style="position:absolute;left:164px;top:78px;color:#e7685a;font-size:10px">YOU ARE HERE</div></div>
          <div style="margin-top:10px;color:#3aa866">NEXT TRAINS HERE</div><table style="width:100%;border-collapse:collapse;margin-top:4px">${next}</table></div></div>
      <div style="display:flex;gap:18px;margin-top:12px;flex-wrap:wrap"><div style="flex:1;min-width:300px"><div style="color:#3aa866">SCHEDULE · NEXT CALL AT EVERY STATION</div>
        <table style="width:100%;border-collapse:collapse;margin-top:4px"><tr style="color:#3aa866"><td></td><td></td><td style="text-align:right;color:${C1}">● 1 ↻</td><td style="text-align:right;color:${C2}">● 2 ↺</td></tr>${sched}</table></div>
        <div style="width:300px"><div style="color:#3aa866">DETAILS</div><div style="line-height:1.9;margin-top:4px">TWO TRAINS, ONE EACH WAY ROUND<br>${dwell} S AT EVERY STATION<br>A LAP: ${lap?(lap/60).toFixed(1):'?'} MIN<br>EXIT ${esc(st.id)}1 ▲ ${esc(st.street||st.name)}<br>SECTIONS OPEN: ${LOOP.STA.map(s=>s.id).join(' ')}<br><span style="color:#d8ffe4">ESC CLOSES</span></div></div></div>`;
    body.querySelector('#lmap').appendChild(cv); drawAll(st); };
  LOOPMAP.open=st=>{ LOOPMAP.at=st||null; sp.hidden=false; draw(); }; LOOPMAP.close=()=>{ sp.hidden=true; };
  let tick=0; SYS.add('places',dt=>{ if(sp.hidden)return; if((tick+=dt)<1)return; tick=0; draw(); },'159ca-loopmap');
  const seen=new Set(); SYS.add('places',()=>{ for(const st of LOOP.STA||[]){ if(seen.has(st)||!st.signs||!st.signs.map)continue; seen.add(st); for(const me of st.signs.map.me)UI.thing({name:'THE LOOP MAP',pick:true,obj:me,reach:1.2*T,near:2.4*T,tall:2*T,act:()=>LOOPMAP.open(st)}); } },'159ca-loopmap-signs');
  window.LOOPMAP=LOOPMAP;
}
