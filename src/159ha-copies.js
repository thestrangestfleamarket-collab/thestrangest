// PAINTING COPIES: masterworks to copy (data/copies.json: 50 public-domain works from the Art Institute of Chicago and the Met, five a band of ten PAINTING levels, SONGBK's rule), each shown faintly over your canvas (stronger as your skill grows), scored on FINISH against the work (a pass from its band's mark), signed as a copy you can hang, give or sell.
import {SHARED} from './003-shx.js';
import {FORAGE, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SONGBK} from './146znz-songbook.js';
import {PAINTER} from './159g-paint.js';
import {PAINTINGS} from './159h-paintings.js';
const COPIES={}; window.COPIES=COPIES;
{ const DATA=__LAZY__("data/copies.json"), K='paint', CANS=['canvas_m','canvas_s','canvas_w','canvas_t','paper'];
  let W=null, BOOK=null, wait=null;
  const load=()=>W?Promise.resolve(W):wait||(wait=DATA().then(d=>{ W=d; BOOK=d.map((w,i)=>({name:w.t,by:w.a,lvl:w.b*10+1+(i%5)*2,w})); return W; }));
  const sk=()=>FORAGE.sk(K)||0, S=()=>FORAGE.S.copies||(FORAGE.S.copies={});
  const mark=b=>40+b*5;   // the score a copy needs to pass: 40% in the first band, 85% in the last
  const guideA=()=>.2+.45*Math.min(100,sk())/100;   // the skill's help: the masterwork shows stronger over the canvas (20% at 0, 65% at 100)
  const byId=i=>W&&W.find(w=>w.id===i), T=w=>BOOK.find(t=>t.w===w);
  const pic=async src=>{ const im=new Image(); im.src=src; await im.decode(); return im; };
  const mk=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };

  /* ---------- the score: both pictures in cells (8, 16 and 32 along the longer side), each cell's colour distance, against how far a blank canvas is ---------- */
  const grid=(src,w,h)=>{ const c=mk(w,h), x=c.getContext('2d',{willReadFrequently:true}); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high'; x.drawImage(src,0,0,w,h); return x.getImageData(0,0,w,h).data; };
  const dist=(a,i,b,j)=>{ const rm=(a[i]+b[j])/2, dr=a[i]-b[j], dg=a[i+1]-b[j+1], db=a[i+2]-b[j+2]; return Math.sqrt((2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db); };
  const cells=(d,w,h,N)=>{ const nx=w>=h?N:Math.max(1,Math.round(N*w/h)), ny=w>=h?Math.max(1,Math.round(N*h/w)):N, o=new Float32Array(nx*ny*4);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const c=(Math.floor(y*ny/h)*nx+Math.floor(x*nx/w))*4, p=(y*w+x)*4; o[c]+=d[p]; o[c+1]+=d[p+1]; o[c+2]+=d[p+2]; o[c+3]++; }
    for(let c=0;c<o.length;c+=4){ const n=o[c+3]||1; o[c]/=n; o[c+1]/=n; o[c+2]/=n; } return o; };
  const score=(img,ref,bg)=>{ const L=64, w=ref.width>=ref.height?L:Math.max(1,Math.round(L*ref.width/ref.height)), h=ref.width>=ref.height?Math.max(1,Math.round(L*ref.height/ref.width)):L;
    const a=grid(img,w,h), b=grid(ref,w,h), n=parseInt(String(bg||'#f4efe4').slice(1),16), B=[n>>16&255,n>>8&255,n&255,1]; let tot=0;
    for(const N of [8,16,32]){ const A=cells(a,w,h,N), R=cells(b,w,h,N); let e=0, e0=0, k=0; for(let c=0;c<A.length;c+=4){ e+=dist(A,c,R,c); e0+=dist(B,0,R,c); k++; }
      tot+=Math.max(0,Math.min(1,1-(e/k)/Math.max(e0/k,120))); }
    return Math.round(tot/3*100); };

  /* ---------- the hooks the paintings (159h) call: the guide, the note on FINISH, the judging ---------- */
  PAINTINGS.copy=COPIES;
  COPIES.guide=async i=>{ '@later'; await load(); const w=byId(i); if(!w)return null; try{ return {img:await pic(w.i),a:+guideA().toFixed(2),on:true}; }catch(e){ return null; } };
  COPIES.note=i=>{ const w=byId(i); return w?`A COPY AFTER ${w.a.toUpperCase()}: ON SIGNING IT IS SCORED AGAINST THE MASTERWORK (A PASS FROM ${mark(w.b)}%). IT IS SIGNED BY YOU AND MARKED AS A COPY.`:null; };
  COPIES.judge=async(i,img,bg)=>{ '@later'; await load(); const w=byId(i); if(!w)return null; let s=0; try{ s=score(img,await pic(w.i),bg); }catch(e){ console.warn('copy score',e); }
    const b=w.b, m=mark(b), pass=s>=m, t=T(w), l=t.lvl, R=S(); R[i]=Math.max(R[i]||0,s); FORAGE.save();
    for(let k=0,n=1+Math.floor(s/34);k<n;k++)FORAGE.use(K,l-30,l+20,0,{ok:pass,win:2.5});
    const said=pass?`A FINE COPY: ${s}% LIKE “${w.t.toUpperCase()}” (A PASS FROM ${m}%). SIGNED AS A COPY, IN YOUR PACK: HANG IT, GIVE IT OR SELL IT.`
      :`${s}% LIKE “${w.t.toUpperCase()}”: NOT CLOSE ENOUGH TO PASS (${m}%). STILL YOURS TO HANG OR SELL; TRY IT AGAIN.`;
    return {i,s,b,a:w.a.toUpperCase().slice(0,40),pass,mark:m,said}; };

  /* ---------- the COPY list: at the easel, or COPY on a canvas in your pack ---------- */
  const ui=document.createElement('div'); ui.id='copyp'; ui.hidden=true; ui.setAttribute('role','dialog'); ui.setAttribute('aria-label','Copy a masterwork');
  const st=document.createElement('style'); st.textContent=`
  #copyp{position:fixed;inset:0;z-index:44;display:grid;grid-template-rows:auto minmax(0,1fr);gap:8px;padding:12px;box-sizing:border-box;background:rgba(2,6,4,.94);font:13px/1.35 'Share Tech Mono',ui-monospace,monospace;letter-spacing:1px;color:#7dffa8;text-transform:uppercase}
  #copyp[hidden]{display:none}
  #copyp *{box-sizing:border-box}
  #copyp .cbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#020a06;box-shadow:inset 0 0 0 2px #3aa866;padding:6px 8px}
  #copyp .cbar b{font-weight:normal;font-size:16px;letter-spacing:3px}
  #copyp .cbar span{color:#3aa866;margin-right:auto}
  #copyp button{font:inherit;color:#7dffa8;background:transparent;border:0;padding:5px 8px;cursor:pointer;text-transform:uppercase;letter-spacing:1px}
  #copyp button:hover{color:#020a06;background:#7dffa8}
  #copyp button:focus-visible{outline:2px solid #d8ffe4;outline-offset:1px}
  #copyp .clist{overflow:auto;display:grid;gap:10px;align-content:start}
  #copyp h4{font:inherit;font-size:12px;color:#3aa866;margin:4px 0 0;letter-spacing:2px}
  #copyp h4.lock{color:#245c3a}
  #copyp .cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
  #copyp .cw{display:grid;grid-template-rows:120px auto;gap:4px;text-align:left;background:#020a06;box-shadow:inset 0 0 0 2px #0d3a1f;padding:6px;text-transform:none}
  #copyp .cw img{width:100%;height:120px;object-fit:contain;background:#16181c}
  #copyp .cw .ct{color:#d8ffe4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #copyp .cw .ca,#copyp .cw .cm{color:#3aa866;font-size:11px}
  #copyp .cw:hover .ca,#copyp .cw:hover .cm,#copyp .cw:hover .ct{color:#020a06}`;
  document.head.appendChild(st); document.body.appendChild(ui);
  const esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
  let canFor=null;
  const close=()=>{ if(ui.hidden)return; ui.hidden=true; ui.innerHTML=''; if(UI.gamewin==='copy')UI.gamewin=null; SHARED.covered=!!PAINTER.isOpen; };
  addEventListener('keydown',e=>{ if(!ui.hidden&&e.key==='Escape'){ e.stopImmediatePropagation(); close(); } },true);
  ui.addEventListener('keydown',e=>e.stopPropagation());
  ui.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.x!=null)return close(); if(b.dataset.free!=null){ close(); return PAINTINGS.atEasel(); } if(b.dataset.w!=null){ const i=b.dataset.w; close(); COPIES.begin(i,canFor); } });
  COPIES.list=async can=>{ '@later'; if(PAINTER.isOpen)return; await load(); canFor=can&&PAINTINGS.CAN[can]?can:null;
    const sts=SONGBK.state(K,BOOK), m=SONGBK.mine(K), R=S(); let h='';
    for(let b=0;b<=9;b++){ const L=BOOK.filter(t=>t.w.b===b); if(!L.length)continue;
      if(b>m){ h+=`<h4 class="lock">LEVEL ${b*10}-${b*10+10} · ${L.length} WORKS · OPENS AT PAINTING ${b*10}</h4>`; continue; }
      h+=`<h4>LEVEL ${b*10}-${b*10+10} · A PASS FROM ${mark(b)}%</h4><div class="cg">`+L.filter(t=>sts.get(t)!=='lock').map(t=>{ const w=t.w;
        return `<button class="cw" data-w="${esc(w.id)}" title="${esc(w.t)}"><img alt="" src="${w.i}"><div><div class="ct">${esc(w.t)}</div><div class="ca">${esc(w.a)}${w.d?', '+esc(w.d):''}</div><div class="cm">${esc(w.m)} · ${esc(w.lic)}${R[w.id]!=null?' · BEST '+R[w.id]+'%':''}</div></div></button>`; }).join('')+'</div>'; }
    ui.innerHTML=`<div class="cbar"><b>[ COPY A MASTERWORK ]</b><span>PAINTING ${sk().toFixed(1)} · THE GUIDE SHOWS AT ${Math.round(guideA()*100)}% · ${canFor?esc(PAINTINGS.CAN[canFor].n):'ANY CANVAS IN YOUR PACK'}</span>${canFor?'':'<button data-free>PAINT FREELY</button>'}<button data-x>CLOSE</button></div><div class="clist">${h}</div>`;
    ui.hidden=false; if(!UI.gamewin)UI.gamewin='copy'; SHARED.covered=true; const f=ui.querySelector('.cw'); if(f)f.focus({preventScroll:true}); };
  COPIES.begin=async(i,can)=>{ '@later'; await load(); const w=byId(i); if(!w)return; const t=T(w);
    if(!SONGBK.can(K,BOOK,t))return SAY(`“${w.t.toUpperCase()}” OPENS AT PAINTING ${w.b*10}.`,'#c8a090');
    can=can&&FORAGE.has(can)?can:CANS.find(k=>FORAGE.has(k)); if(!can)return SAY('YOU NEED A CANVAS TO COPY ON. THE PROFESSOR AT THE BOOKSTORE SELLS THEM.','#c8a090');
    return PAINTINGS.start(can,{i:w.id,t:`${w.t.toUpperCase().slice(0,36)}, AFTER ${w.a.toUpperCase()}`.slice(0,60),w:w.w,h:w.h}); };
  COPIES.ready=load; COPIES.score=score; COPIES.mark=mark; COPIES.guideA=guideA;
  COPIES.dbg=()=>({works:W?W.length:0,skill:sk(),guide:guideA(),open:BOOK?BOOK.filter(t=>SONGBK.can(K,BOOK,t)).map(t=>t.w.id):[],best:{...S()},list:!ui.hidden});
}
