// THE LANYARD STRING: LANYARD hangs the passport's two front strands and its badge on a body as a real string (owner, 8 Nov 2026: "should be a real string that dangles, not a preset shape ... on top of the clothes layer"): a few points a strand under gravity, pinned where the neck loop ends, kept outside what the body wears, the badge swinging on them; drawn after the clothes.
import {THREE} from './003-shx.js';
import {W3} from './003b-systems.js';
import {renderer} from './004-main.js';
const LANYARD={}; window.LANYARD=LANYARD;
{ const V3=THREE.Vector3, M4=THREE.Matrix4, M3=THREE.Matrix3;
  const LIVE=new Set();
  const mat=c=>new THREE.MeshToonMaterial({color:c,vertexColors:c==null,gradientMap:W3.GP,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  // spec (from the avatar's geometry, 111c): rest points of each strand from its pin to the clip, the badge's height, the body's outline (rad), the way the face looks (S), the chest's reshape, the badge's look
  LANYARD.add=(me,PM,spec)=>{ if(!spec)return null; const n=spec.L.length, NP=2*n, X=new Float32Array(NP*3), O=new Float32Array(NP*3);
    const B=2*(n-1), C=B+1, idx=(s,i)=>i===n-1?B:s===0?i:(n-1)+i;   // strand s's i-th point (its last is the clip, shared); C the badge's foot
    const REST=[...spec.L.slice(0,-1),...spec.R.slice(0,-1),spec.L[n-1],[spec.L[n-1][0],spec.L[n-1][1]-spec.H,spec.L[n-1][2]]];
    const LEN=[]; for(let s=0;s<2;s++)for(let i=0;i<n-1;i++){ const a=(s?spec.R:spec.L)[i], b=(s?spec.R:spec.L)[i+1]; LEN.push([idx(s,i),idx(s,i+1),Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])*1.03]); }
    LEN.push([B,C,spec.H]);
    const sh=spec.shape, Ai=sh?new M3().copy(sh.A).invert():null;
    // a point in the chest's rest space pushed out of the body to at least off past what is worn there
    const U=new V3(), out=(q,off)=>{ if(sh)U.copy(q).sub(sh.O1).applyMatrix3(Ai).add(sh.O); else U.copy(q); const a=Math.atan2(U.x,U.z), t=spec.S>0?a:Math.PI-a, r=Math.hypot(U.x,U.z), m=spec.rad(U.y,t)+off;
      if(r<m&&r>1e-5){ U.x*=m/r; U.z*=m/r; if(sh)q.copy(U).sub(sh.O).applyMatrix3(sh.A).add(sh.O1); else q.copy(U); return true; } return false; };
    // the strands: a line a strand, one pixel wide however near (owner, 8 Nov 2026: "lanyard string should be thinner")
    const NS=2*(n-1), sp=new Float32Array(NS*2*3);
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
    const sm=new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:spec.col})); sm.frustumCulled=false; sm.renderOrder=2; sm.name='lanyard'; sm.castShadow=false;
    // the badge: its own picture (spec.badge: [x0,y0,x1,y1,z,hex] in the card's frame, the clip at its top)
    const bp=[], bc=[]; for(const [x0,y0,x1,y1,z,h] of spec.badge){ const c=new THREE.Color('#'+h); for(const [x,y] of [[x0,y0],[x1,y0],[x1,y1],[x0,y0],[x1,y1],[x0,y1]]){ bp.push(x,y,z); bc.push(c.r,c.g,c.b); } }
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3)); bg.setAttribute('color',new THREE.Float32BufferAttribute(bc,3)); bg.computeVertexNormals();
    const bm=new THREE.Mesh(bg,mat(null)); bm.frustumCulled=false; bm.renderOrder=2; bm.matrixAutoUpdate=false; bm.name='badge'; bm.castShadow=true;
    const st={me,PM,sm,bm,X,O,t:0,on:false};
    const M=new M4(), Mi=new M4(), Wi=new M4(), P=new V3(), Q=new V3(), G=new V3(), D=new V3(), Y=new V3(), Z=new V3(), Xa=new V3();
    let fr=-1, last=0; st.Mi=Mi; st.foot=()=>new V3().fromArray(X,C*3).applyMatrix4(Mi); st.clip=()=>new V3().fromArray(X,B*3).applyMatrix4(Mi);   // (the badge's foot on the chest's own frame)
    sm.onBeforeRender=()=>{ const f=renderer.info.render.frame; if(f===fr)return; fr=f; me.updateWorldMatrix(true,false);
      M.multiplyMatrices(me.matrixWorld,PM.value[1]); Mi.copy(M).invert(); Wi.copy(me.matrixWorld).invert(); const k=new V3().setFromMatrixColumn(M,1).length();
      const now=performance.now()/1e3; let dt=now-last; last=now;
      if(!st.on||dt>3){ st.on=true; for(let i=0;i<NP;i++){ P.fromArray(REST[i]).applyMatrix4(M); P.toArray(X,i*3); P.toArray(O,i*3); } dt=1/60; }
      // in steps of a sixtieth of a second, however long the frame took (at most eight a frame)
      const ns=Math.min(8,Math.max(1,Math.round(dt*60))), h=1/60; G.set(0,-9.8*k*h*h,0);
      for(let step=0;step<ns;step++){ st.n=(st.n||0)+1;
      // move: what each point carried on, a little lost to the air, gravity
      for(let i=0;i<NP;i++){ const o=i*3, x=X[o], y=X[o+1], z=X[o+2]; X[o]+= (x-O[o])*.97+G.x; X[o+1]+=(y-O[o+1])*.97+G.y; X[o+2]+=(z-O[o+2])*.97+G.z; O[o]=x; O[o+1]=y; O[o+2]=z; }
      for(let it=0;it<8;it++){
        for(const s of [0,1]){ P.fromArray((s?spec.R:spec.L)[0]).applyMatrix4(M); P.toArray(X,idx(s,0)*3); }   // (pinned where the loop round the neck ends)
        for(const [a,b,l] of LEN){ P.fromArray(X,a*3); Q.fromArray(X,b*3); D.subVectors(Q,P); const d=D.length()||1e-6, L=l*k; if(d<=L&&b!==C)continue; const e=(d-L)/d, wa=a===idx(0,0)||a===idx(1,0)?0:b===C?.3:.5, wb=1-wa;
          P.addScaledVector(D,e*wa); Q.addScaledVector(D,-e*wb); P.toArray(X,a*3); Q.toArray(X,b*3); }
        for(let i=0;i<NP;i++){ Q.fromArray(X,i*3).applyMatrix4(Mi); if(out(Q,i>=B?.018:.014)){ Q.applyMatrix4(M); Q.toArray(X,i*3); if(it===7)for(let j=0;j<3;j++)O[i*3+j]+=(X[i*3+j]-O[i*3+j])*.6; } } } }   // (against what you wear it neither bounces nor slides freely)
      // the lines, in the body mesh's own space
      for(let s=0;s<2;s++)for(let i=0;i<n-1;i++){ const o=(s*(n-1)+i)*6; Z.fromArray(X,idx(s,i)*3).applyMatrix4(Wi); Z.toArray(sp,o); Z.fromArray(X,idx(s,i+1)*3).applyMatrix4(Wi); Z.toArray(sp,o+3); }
      sg.attributes.position.needsUpdate=true;
      // the badge: hung from the clip, down to its foot, facing out from the chest
      P.fromArray(X,B*3); Q.fromArray(X,C*3); Y.subVectors(P,Q).normalize(); Z.set(0,0,spec.S).transformDirection(M); Z.addScaledVector(Y,-Z.dot(Y)).normalize(); Xa.crossVectors(Y,Z);
      bm.matrix.makeBasis(Xa.multiplyScalar(k),Y.multiplyScalar(k),Z.multiplyScalar(k)).setPosition(P); bm.matrix.premultiply(Wi); };
    me.add(sm); me.add(bm); LIVE.add(st); sm.addEventListener('removed',()=>LIVE.delete(st)); PM.lanyard=st; return st; };
  LANYARD.live=()=>[...LIVE];
}
export {LANYARD};
