// THE PS2 FILTER ON MENUS: PS2.menu, the filter's look laid over every open window and the HUD (everything on the page but the game's picture) as an SVG filter, on or off with its own level, and PS2.words, the same over the words in the world (PS2 FILTER tab); the same five parts as the game's, at their own strengths.
import {PS2} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {PAD} from './075-main-13.js';
{
  const M=PS2.menu={on:false,k:1}, W=PS2.words={on:false,k:1};
  try{ M.on=SAVE.get('ps2m')==='1'; const k=parseFloat(SAVE.get('ps2mk')); if(k>=0&&k<=2)M.k=k; W.on=SAVE.get('ps2w')==='1'; const w=parseFloat(SAVE.get('ps2wk')); if(w>=0&&w<=2)W.k=w; }catch(e){}
  const NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg'), st=document.createElement('style');
  svg.setAttribute('width','0'); svg.setAttribute('height','0'); svg.setAttribute('aria-hidden','true'); svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  st.textContent='.ps2m{filter:url(#ps2mf)}#wlabels.ps2w>*{filter:url(#ps2wf)}'; document.head.appendChild(st); document.body.appendChild(svg);
  const keys={}, fs={};
  const build=(name,k)=>{ const T=PS2.tune(k), c=T.pix?Math.max(2,Math.round(innerHeight/Math.round(240/T.k))):0, Q=T.Q, n=Q>=1?Math.max(2,Math.round(256/Q)):0;
    const K=T.K, id=[c,n,...K].join(','); if(id===keys[name])return; keys[name]=id; let f='', last='SourceGraphic', i=0; const nx=()=>'r'+(++i);
    if(c){ const h=Math.floor(c/2), o=nx(); f+=`<feFlood x="${h}" y="${h}" width="1" height="1"/><feComposite width="${c}" height="${c}"/><feTile result="t${i}"/><feComposite in="${last}" in2="t${i}" operator="in"/><feMorphology operator="dilate" radius="${h}" result="${o}"/>`; last=o; }
    if(n){ const tv=Array.from({length:n},(_,j)=>(j/(n-1)).toFixed(4)).join(' '), o=nx(); f+=`<feComponentTransfer in="${last}" result="${o}"><feFuncR type="discrete" tableValues="${tv}"/><feFuncG type="discrete" tableValues="${tv}"/><feFuncB type="discrete" tableValues="${tv}"/></feComponentTransfer>`; last=o; }
    if(K[0]){ const s=Math.max(1,c), b=nx(), e=nx(), o=nx(), w=Math.min(.9,.5*K[0]), we=Math.min(.3,.05*K[0]);
      f+=`<feGaussianBlur in="${last}" stdDeviation="${(.6*s*K[0]).toFixed(2)} 0" result="${b}"/><feOffset in="${last}" dx="${-3*s}" dy="0" result="${e}"/><feComposite in="${last}" in2="${b}" operator="arithmetic" k2="${(1-w).toFixed(3)}" k3="${w.toFixed(3)}" result="${o}"/>`;
      const o2=nx(); f+=`<feComposite in="${o}" in2="${e}" operator="arithmetic" k2="${(1-we).toFixed(3)}" k3="${we.toFixed(3)}" result="${o2}"/>`; last=o2; }
    if(K[1]){ const d=Math.max(1,c)*Math.min(2,K[1]), r=nx(), g=nx(), b=nx(), s=nx(), o=nx(), w=Math.min(.8,.35*K[1]);
      f+=`<feColorMatrix in="${last}" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/><feOffset dx="${d.toFixed(2)}" result="${r}"/><feColorMatrix in="${last}" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="${g}"/><feColorMatrix in="${last}" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"/><feOffset dx="${(-d).toFixed(2)}" result="${b}"/>`;
      f+=`<feComposite in="${r}" in2="${g}" operator="arithmetic" k2="1" k3="1"/><feComposite in2="${b}" operator="arithmetic" k2="1" k3="1" result="${s}"/><feComposite in="${last}" in2="${s}" operator="arithmetic" k2="${(1-w).toFixed(3)}" k3="${w.toFixed(3)}" result="${o}"/>`; last=o; }
    if(K[2]){ const z=nx(), o=nx(), a=Math.min(.4,.07*K[2]);   // still, and none on black (owner, 2 Nov 2026)
      f+=`<feTurbulence type="fractalNoise" baseFrequency="${(.9/Math.max(1,c)).toFixed(3)}" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 .5" result="${z}"/>`;
      f+=`<feComposite in="${last}" in2="${z}" operator="arithmetic" k1="${(2*a).toFixed(3)}" k2="${(1-a).toFixed(3)}"/><feComposite in2="${last}" operator="in" result="${o}"/>`; last=o; }
    fs[name]=`<filter id="${name}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">${f||'<feOffset/>'}</filter>`; svg.innerHTML=Object.values(fs).join(''); };
  const tagged=new Set();
  const area=e=>{ const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
  const hud=want=>{ for(const e of document.body.children){ if(want.has(e)||e.hidden||/^(stage|loading|subfade|wlabels)$/.test(e.id)||!(e instanceof HTMLElement)||!e.getClientRects().length)continue;
      if(area(e))want.add(e); else for(const c of e.children)if(c instanceof HTMLElement&&area(c))want.add(c); } };   // a box of no size would clip its own filter: its children wear it
  const words=()=>{ const b=document.getElementById('wlabels'), on=W.on&&PS2.on&&W.k>.01; if(on)build('ps2wf',W.k); if(b)b.classList.toggle('ps2w',on); };
  const apply=()=>{ const want=M.on&&PS2.on&&M.k>.01&&PAD.panels?new Set(PAD.panels()):new Set(); if(M.on&&PS2.on&&M.k>.01)hud(want);
    if(want.size)build('ps2mf',M.k); words(); for(const e of tagged)if(!want.has(e)){ e.classList.remove('ps2m'); tagged.delete(e); } for(const e of want)if(!tagged.has(e)){ e.classList.add('ps2m'); tagged.add(e); } };
  M.set=on=>{ M.on=!!on; M.save(); apply(); };
  M.save=()=>{ try{ SAVE.set('ps2m',M.on?'1':'0'); SAVE.set('ps2mk',String(M.k)); }catch(e){} keys.ps2mf=''; apply(); };
  W.set=on=>{ W.on=!!on; W.save(); };
  W.save=()=>{ try{ SAVE.set('ps2w',W.on?'1':'0'); SAVE.set('ps2wk',String(W.k)); }catch(e){} keys.ps2wf=''; apply(); };
  addEventListener('resize',()=>{ keys.ps2mf=keys.ps2wf=''; });
  SYS.every(apply,250,'162ab-ps2menus');
}
