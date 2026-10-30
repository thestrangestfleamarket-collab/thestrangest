// YOUR CANDLES: a beeswax candle (146za) is a thing for your apartment — DECORATE shows it as YOURS; its flame flickers (no light of its own, so it costs nothing).
import {THREE} from './003-shx.js';
import {SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const FL=new Set();
  const make=()=>{ const g=new THREE.Group(), w=new THREE.Mesh(new THREE.CylinderGeometry(.03,.032,.14,12),new THREE.MeshStandardMaterial({color:0xf2d890,roughness:.6})); w.position.y=.07; g.add(w);
    const s=new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.012,14),new THREE.MeshStandardMaterial({color:0x8a7a5a,roughness:.5,metalness:.4})); s.position.y=.006; g.add(s);
    const f=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),new THREE.MeshBasicMaterial({color:0xffc060})); f.scale.y=1.8; f.position.y=.165; f.name='candleFlame'; g.add(f); return g; };
  ROOMK.parts.push(ctx=>{ const {R}=ctx, k='bk:candle'; if(R.kinds[k])return; const D={kind:k,name:'BEESWAX CANDLE',own:'wax_candle',loose:false,m:0,wire:'candle',sol:[[-.05,-.05,.05,.05,.17]],shf:[],dept:'garden',deptName:'GARDEN'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=make(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; });
  ROOMK.wires.candle=un=>{ const f=un.obj.getObjectByName('candleFlame'); if(f)FL.add({f,un,s:Math.random()*9}); };
  SYS.add('life',()=>{ if(!FL.size)return; const t=performance.now()/1000; for(const L of FL){ if(L.un.gone||!L.un.obj.parent){ FL.delete(L); continue; } L.f.scale.set(1+.12*Math.sin(t*13+L.s),1.8+.3*Math.sin(t*9+L.s*2),1); } },'150l-candles');
}
