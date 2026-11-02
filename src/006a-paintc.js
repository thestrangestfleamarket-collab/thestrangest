// THE PAINT CACHE: painted ground patches kept in IndexedDB (gzip) so a second visit skips the painting; ?paintc=0 turns it off.
import {QS, SYS} from './006-map-pre.js';
const PAINTC=(()=>{ const V='__BUILDV__', DB='market-paint', ST='p', KEY='ground', M=new Map(), NEW=[], P={hit:0,miss:0,bad:0,ms:0,loaded:0,saved:0};
  const off=QS.get('paintc')==='0'||typeof indexedDB==='undefined'||typeof DecompressionStream==='undefined';
  const idb=()=>new Promise((res,rej)=>{ const r=indexedDB.open(DB,1); r.onupgradeneeded=()=>r.result.createObjectStore(ST); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
  const tx=(db,mode,fn)=>new Promise((res,rej)=>{ const t=db.transaction(ST,mode), s=t.objectStore(ST), q=fn(s); t.oncomplete=()=>res(q&&q.result); t.onerror=()=>rej(t.error); t.onabort=()=>rej(t.error); });
  const load=async()=>{ if(off)return; const t0=performance.now(); try{ const db=await idb(), rec=await tx(db,'readonly',s=>s.get(KEY)); db.close(); if(!rec||rec.v!==V||!rec.blob)return;
      const buf=new Uint8Array(await new Response(rec.blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()); let o=0;
      for(const [k,w,h] of rec.idx){ const n=w*h*4; M.set(k,{w,h,d:buf.subarray(o,o+n)}); o+=n; } P.loaded=M.size; }catch(e){ M.clear(); } P.ms=Math.round(performance.now()-t0); };
  const ready=Promise.race([load(),new Promise(r=>setTimeout(r,4000))]);
  const spot=(k,w,h)=>{ let s=0; for(let i=0;i<k.length;i++)s=Math.imul(s^k.charCodeAt(i),16777619); const out=[]; for(let n=0;n<48;n++){ s=Math.imul(s^n,16777619)>>>0; out.push([s%w,(s>>>11)%h]); } return out; };
  const same=(d,w,i,j,v)=>{ const k=(j*w+i)*4; if(!v||v.h)return d[k]===0&&d[k+1]===0&&d[k+2]===0&&d[k+3]===0; return d[k]===Math.round(v[0])&&d[k+1]===Math.round(v[1])&&d[k+2]===Math.round(v[2])&&d[k+3]===255; };
  const get=(k,w,h,fn)=>{ const c=M.get(k); if(!c||c.w!==w||c.h!==h){ P.miss++; return null; }
    for(const [i,j] of spot(k,w,h))if(!same(c.d,w,i,j,fn(i,j))){ P.bad++; M.delete(k); return null; }
    P.hit++; const im=new ImageData(w,h); im.data.set(c.d); return im; };
  const put=(k,im)=>{ if(!off)NEW.push([k,im]); };
  const save=async()=>{ if(off||!NEW.length&&P.bad===0)return; try{ const all=new Map(); for(const [k,c] of M)all.set(k,[c.w,c.h,c.d]); for(const [k,im] of NEW)all.set(k,[im.width,im.height,im.data]);
      const idx=[], parts=[]; for(const [k,[w,h,d]] of all){ idx.push([k,w,h]); parts.push(d); } NEW.length=0;
      const blob=await new Response(new Blob(parts).stream().pipeThrough(new CompressionStream('gzip'))).blob();
      const db=await idb(); await tx(db,'readwrite',s=>s.put({v:V,idx,blob},KEY)); db.close(); P.saved=idx.length; }catch(e){} };
  const later=()=>SYS.onStart(()=>(window.requestIdleCallback||setTimeout)(()=>save(),{timeout:20000}),'006a-paintc');
  if(!off)setTimeout(later,5000);
  return {ready,get,put,save,P}; })();
window.PAINTC=PAINTC;
export {PAINTC};
