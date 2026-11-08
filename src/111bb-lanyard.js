// THE LANYARD STRING: LANYARD hangs the passport's two front strands and its badge on a body (owner, 8 Nov 2026: a real string on top of the clothes; then "barely swing, string 2x thicker, use simple rendering and physics"): each point springs back to where it hangs on the chest, so it only lags a little when you move; the strands a flat ribbon (cord, flat strap or bead chain, 111c's spec.st), drawn after the clothes.
import {THREE} from './003-shx.js';
import {W3} from './003b-systems.js';
import {renderer} from './004-main.js';
const LANYARD={}; window.LANYARD=LANYARD;
{ const V3=THREE.Vector3, M4=THREE.Matrix4;
  const LIVE=new Set();
  const mat=c=>new THREE.MeshToonMaterial({color:c,vertexColors:c==null,gradientMap:W3.GP,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  // spec (from the avatar's geometry, 111c): rest points of each strand from its pin to the clip, the badge's height, the body's outline (rad), the way the face looks (S), the chest's reshape, the badge's look
  LANYARD.add=(me,PM,spec)=>{ if(!spec)return null; const n=spec.L.length, NP=2*n, X=new Float32Array(NP*3), O=new Float32Array(NP*3);
    const B=2*(n-1), C=B+1, idx=(s,i)=>i===n-1?B:s===0?i:(n-1)+i;   // strand s's i-th point (its last is the clip, shared); C the badge's foot
    const REST=[...spec.L.slice(0,-1),...spec.R.slice(0,-1),spec.L[n-1],[spec.L[n-1][0],spec.L[n-1][1]-spec.H,spec.L[n-1][2]]];
    // the strands: a flat ribbon twice the old line's width (a bead chain a short piece a link)
    const NS=2*(n-1), sp=new Float32Array(NS*6*3), HW=spec.hw||.0024, LINK=spec.st===2?.55:1;
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
    const sm=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:spec.col,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})); sm.frustumCulled=false; sm.renderOrder=2; sm.name='lanyard'; sm.castShadow=false;
    // the badge: its own picture (spec.badge: [x0,y0,x1,y1,z,hex] in the card's frame, the clip at its top)
    const bp=[], bc=[]; for(const [x0,y0,x1,y1,z,h] of spec.badge){ const c=new THREE.Color('#'+h); for(const [x,y] of [[x0,y0],[x1,y0],[x1,y1],[x0,y0],[x1,y1],[x0,y1]]){ bp.push(x,y,z); bc.push(c.r,c.g,c.b); } }
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3)); bg.setAttribute('color',new THREE.Float32BufferAttribute(bc,3)); bg.computeVertexNormals();
    const bm=new THREE.Mesh(bg,mat(null)); bm.frustumCulled=false; bm.renderOrder=2; bm.matrixAutoUpdate=false; bm.name='badge'; bm.castShadow=true;
    const st={me,PM,sm,bm,X,O,t:0,on:false};
    const M=new M4(), Mi=new M4(), Wi=new M4(), P=new V3(), Q=new V3(), D=new V3(), Y=new V3(), Z=new V3(), Xa=new V3();
    let fr=-1, last=0; st.Mi=Mi; st.foot=()=>new V3().fromArray(X,C*3).applyMatrix4(Mi); st.clip=()=>new V3().fromArray(X,B*3).applyMatrix4(Mi);   // (the badge's foot on the chest's own frame)
    sm.onBeforeRender=()=>{ const f=renderer.info.render.frame; if(f===fr)return; fr=f; me.updateWorldMatrix(true,false);
      M.multiplyMatrices(me.matrixWorld,PM.value[1]); Mi.copy(M).invert(); Wi.copy(me.matrixWorld).invert(); const k=new V3().setFromMatrixColumn(M,1).length();
      const now=performance.now()/1e3; let dt=now-last; last=now;
      if(!st.on||dt>3){ st.on=true; for(let i=0;i<NP;i++){ P.fromArray(REST[i]).applyMatrix4(M); P.toArray(X,i*3); P.toArray(O,i*3); } dt=1/60; }
      // in steps of a sixtieth of a second (at most eight a frame): each point lags a little behind where it hangs, damped hard, so it barely swings
      const ns=Math.min(8,Math.max(1,Math.round(dt*60)));
      for(let step=0;step<ns;step++){ st.n=(st.n||0)+1;
        for(let i=0;i<NP;i++){ const o=i*3; P.fromArray(REST[i]).applyMatrix4(M); if(i===idx(0,0)||i===idx(1,0)){ P.toArray(X,o); P.toArray(O,o); continue; }
          for(let j=0;j<3;j++){ const x=X[o+j], v=(x-O[o+j])*.55; O[o+j]=x; X[o+j]=x+v+(P.getComponent(j)-x)*.22; } } }
      // the ribbon, in the body mesh's own space
      Xa.set(0,0,spec.S).transformDirection(M);   // (the chest's outward way: the ribbon lies flat on it)
      for(let s=0;s<2;s++)for(let i=0;i<n-1;i++){ const o=(s*(n-1)+i)*18; P.fromArray(X,idx(s,i)*3); Q.fromArray(X,idx(s,i+1)*3); D.subVectors(Q,P);
        if(LINK<1){ const m=(1-LINK)/2; P.addScaledVector(D,m); Q.addScaledVector(D,-m); }
        Y.crossVectors(D,Xa).normalize().multiplyScalar(HW*k); const c=[P.clone().add(Y),P.clone().sub(Y),Q.clone().sub(Y),Q.clone().add(Y)];
        [0,1,2,0,2,3].forEach((q,j)=>{ Z.copy(c[q]).applyMatrix4(Wi); Z.toArray(sp,o+j*3); }); }
      sg.attributes.position.needsUpdate=true;
      // the badge: hung from the clip, down to its foot, facing out from the chest
      P.fromArray(X,B*3); Q.fromArray(X,C*3); Y.subVectors(P,Q).normalize(); Z.set(0,0,spec.S).transformDirection(M); Z.addScaledVector(Y,-Z.dot(Y)).normalize(); Xa.crossVectors(Y,Z);
      bm.matrix.makeBasis(Xa.multiplyScalar(k),Y.multiplyScalar(k),Z.multiplyScalar(k)).setPosition(P); bm.matrix.premultiply(Wi); };
    me.add(sm); me.add(bm); LIVE.add(st); sm.addEventListener('removed',()=>LIVE.delete(st)); PM.lanyard=st; return st; };
  LANYARD.live=()=>[...LIVE];
}
export {LANYARD};
