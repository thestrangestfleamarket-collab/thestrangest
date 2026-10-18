// ONE CHECK FOR EVERY SHADER EDIT (owner, 18 Oct 2026, "fix all 1-8", the third: "patches made by search-and-replace on three's shader text
// fail silently"): a material's onBeforeCompile edits three's chunks by their text (`.replace('#include <x>', ...)`), and when the text it looks
// for isn't there (another edit took it first, a three.js upgrade renamed it) the edit does nothing and nothing says so: the near-side cut and
// the roof both broke that way. Every onBeforeCompile given to any material is wrapped once, here, before anything is made: while it runs, a
// string replace whose anchor is a chunk (`#include <...>`) or a GLSL line it was meant to find, and that isn't in the shader, is reported once
// as `SHADER EDIT MISSED: <anchor> (<material>)` and counted in SHX.miss (tests/shxcheck.cjs warms every material and lists them). Three's own
// program cache keys on the function's text, so the wrapper keeps the original's.
const SHX=window.SHX={miss:[],seen:new Set(),on:new URLSearchParams(location.search).get('shx')!=='0'};
{ const R=String.prototype.replace, P=THREE.Material.prototype, D=Object.getOwnPropertyDescriptor(P,'onBeforeCompile');
  let cur=null;   // (the material whose edit is running)
  const rep=function(a,b){ if(cur&&typeof a==='string'&&a.length>8&&this.length>200&&this.indexOf(a)<0&&(a.startsWith('#include <')||/gl_FragColor|vec[34] |float |void main/.test(a))){
      const k=a.slice(0,60)+' ('+(cur.name||cur.type)+')'; if(!SHX.seen.has(k)){ SHX.seen.add(k); SHX.miss.push(k); console.warn('SHADER EDIT MISSED: '+k); } } return R.call(this,a,b); };
  if(SHX.on&&D&&typeof D.value==='function')Object.defineProperty(P,'onBeforeCompile',{configurable:true,
    get(){ return this._obc||D.value; },
    set(f){ if(typeof f!=='function'){ this._obc=f; return; } const m=this, w=function(sh,r){ const pc=cur; cur=m; String.prototype.replace=rep; try{ return f.call(this,sh,r); } finally{ cur=pc; if(!cur)String.prototype.replace=R; } };
      w.toString=()=>f.toString(); this._obc=w; }}); }
