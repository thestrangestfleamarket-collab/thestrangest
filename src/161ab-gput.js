// THE GPU TIMER: GPUT reads the GPU's own time for the frame and for each full-screen pass (EXT_disjoint_timer_query_webgl2, where the browser has it), smoothed, and the renderer's name; the stat line shows it and AUTO QUALITY steps on the slower of the CPU's and the GPU's frame.
import {SHARED} from './003-shx.js';
import {GPUT, LOOK, PS2} from './003b-systems.js';
import {renderer} from './004-main.js';
import {QS, SYS} from './006-map-pre.js';
import {OUTL} from './072-walker3d.js';
Object.assign(GPUT,{on:false,ms:{},frame:0,name:'',q:[],cur:0});
{ const gl=renderer.getContext(); try{ const D=gl.getExtension('WEBGL_debug_renderer_info'); GPUT.name=String(D?gl.getParameter(D.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||''); }catch(e){}
  const name=(p,i)=>p===SHARED.RPASS?'SCENE':window.OUTL&&p===OUTL.sp?'OUTLINE':PS2&&p===PS2.sp?'PS2':LOOK&&p===LOOK.sp?'LOOK':p.constructor&&p.constructor.name==='OutputPass'?'OUTPUT':'PASS '+i;
  const wrap=(o,k,nm)=>{ '@later'; const f=o[k]; if(!f||f.__gt)return; const w=function(...a){ const X=GPUT.X; if(!GPUT.on||!X||GPUT.cur)return f.apply(this,a); const q=gl.createQuery(); gl.beginQuery(X.TIME_ELAPSED_EXT,q); GPUT.cur=1;
      try{ return f.apply(this,a); } finally{ gl.endQuery(X.TIME_ELAPSED_EXT); GPUT.cur=0; GPUT.q.push([q,typeof nm==='function'?nm.apply(this,a):nm]); if(GPUT.q.length>48){ const [old]=GPUT.q.shift(); gl.deleteQuery(old); } } }; w.__gt=1; o[k]=w; };
  GPUT.poll=()=>{ '@later'; const X=GPUT.X; if(!X)return; const bad=gl.getParameter(X.GPU_DISJOINT_EXT), frame={}; let any=false;
    while(GPUT.q.length&&gl.getQueryParameter(GPUT.q[0][0],gl.QUERY_RESULT_AVAILABLE)){ const [q,nm]=GPUT.q.shift(); if(!bad){ frame[nm]=(frame[nm]||0)+gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6; any=true; } gl.deleteQuery(q); }
    if(!any)return; let sum=0; for(const k in frame){ GPUT.ms[k]=GPUT.ms[k]==null?frame[k]:GPUT.ms[k]*.9+frame[k]*.1; sum+=frame[k]; } GPUT.frame=GPUT.frame?GPUT.frame*.9+sum*.1:sum; };
  GPUT.start=()=>{ GPUT.X=GPUT.X||(gl.getExtension&&gl.getExtension('EXT_disjoint_timer_query_webgl2')); if(!GPUT.X)return false; GPUT.on=true; const C=SHARED.composer; if(C)C.passes.forEach((p,i)=>wrap(p,'render',name(p,i))); return true; };
  GPUT.stop=()=>{ GPUT.on=false; };
  SYS.onStart(()=>{ if(QS.get('gput')!=='0')GPUT.start(); }); SYS.add('every',()=>{ if(GPUT.on)GPUT.poll(); },'161ab-gput');
  window.GPUT=GPUT; }
