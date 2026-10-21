

import * as THREE from 'three';
const SHARED={}; window.SHARED=SHARED;
const SHX=window.SHX={miss:[],seen:new Set(),on:new URLSearchParams(location.search).get('shx')!=='0'};
{ const R=String.prototype.replace, P=THREE.Material.prototype, D=Object.getOwnPropertyDescriptor(P,'onBeforeCompile');
  let cur=null;
  const rep=function(a,b){ if(cur&&typeof a==='string'&&a.length>8&&this.length>200&&this.indexOf(a)<0&&(a.startsWith('#include <')||/gl_FragColor|vec[34] |float |void main/.test(a))){
      const k=a.slice(0,60)+' ('+(cur.name||cur.type)+')'; if(!SHX.seen.has(k)){ SHX.seen.add(k); SHX.miss.push(k); console.warn('SHADER EDIT MISSED: '+k); } } return R.call(this,a,b); };
  if(SHX.on&&D&&typeof D.value==='function')Object.defineProperty(P,'onBeforeCompile',{configurable:true,
    get(){ return this._obc||D.value; },
    set(f){ if(typeof f!=='function'){ this._obc=f; return; } const m=this, w=function(sh,r){ const pc=cur; cur=m; String.prototype.replace=rep; try{ return f.call(this,sh,r); } finally{ cur=pc; if(!cur)String.prototype.replace=R; } };
      w.toString=()=>f.toString(); this._obc=w; }}); }
