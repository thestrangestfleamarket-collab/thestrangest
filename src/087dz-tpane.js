// TWEAKPANE: TPANE fetches Tweakpane once, when an editor panel first opens, and dresses its panels in the game's green window look.
const TPANE={};
{ let M=null;
  const css=document.createElement('style'); css.textContent=`.tpg{--tp-base-background-color:transparent;--tp-base-shadow-color:transparent;--tp-base-border-radius:0;--tp-blade-border-radius:0;--tp-base-font-family:inherit;--tp-blade-value-width:170px;--tp-container-unit-size:26px;
--tp-container-background-color:rgba(125,255,168,.06);--tp-container-background-color-hover:rgba(125,255,168,.12);--tp-container-background-color-focus:rgba(125,255,168,.16);--tp-container-background-color-active:rgba(125,255,168,.2);--tp-container-foreground-color:#7dffa8;
--tp-button-background-color:transparent;--tp-button-background-color-hover:#7dffa8;--tp-button-background-color-focus:#7dffa8;--tp-button-background-color-active:#7dffa8;--tp-button-foreground-color:#7dffa8;
--tp-input-background-color:#031a0d;--tp-input-background-color-hover:#0a2a16;--tp-input-background-color-focus:#0a2a16;--tp-input-background-color-active:#0d3a1f;--tp-input-foreground-color:#7dffa8;
--tp-label-foreground-color:#5fcf88;--tp-groove-foreground-color:#3aa866;--tp-monitor-background-color:#031a0d;--tp-monitor-foreground-color:#5fcf88}
.tpg .tp-lblv_l{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tpg .tp-sldv_k::after{background-color:#7dffa8}.tpg .tp-sldv_k::before{background-color:#3aa866}`;
  document.head.appendChild(css);
  TPANE.load=async()=>{ '@later'; if(!M)M=await import('https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js'); return M; };
  // a new pane in el (dressed); an old one there is dropped first, keeping whether it was folded
  TPANE.make=async(el,opt={})=>{ '@later'; const T=await TPANE.load(); el.classList.add('tpg'); const old=el.__tp; if(old){ if(opt.expanded===undefined&&opt.title)opt.expanded=old.expanded; old.dispose(); }
    return el.__tp=new T.Pane({container:el,...opt}); };
  // an object whose keys read and write through get/set, for addBinding on live settings: TPANE.live({k:[()=>v, v=>...]})
  TPANE.live=o=>{ const V={}; for(const k in o)Object.defineProperty(V,k,{enumerable:true,get:o[k][0],set:o[k][1]}); return V; }; }
export {TPANE};
