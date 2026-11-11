// THE SKATE PIT: a large concrete bowl sunk in a concrete deck, out in the open in a section's Central Park (sections.places id 'skatepit'): a deep end, a shallow end and a pocket meeting in hips, steel coping round the lip, a ledge on the deck, all ridden; tall tube lamps light it after dark.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SECTIONS, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {SKATE} from './111fd-skatepark.js';
const PIT={}; window.PIT=PIT;
{ const MH=TILE/.84, MV=ZU*24/.84;
  const S=(SECTIONS.places||[]).find(q=>q.id==='skatepit');
  // the bowl's lobes in metres from the place's middle (u along the map's x, v along its y): [u, v, radius, depth]; where they meet the lower wins (hips)
  const LOBES=[[-7,1,10,3.2],[8,-2,8,1.9],[5,8.5,5,1.5]], CELL=.2, COPE=.07;
  const LEDGES=[[-20,-13,-10,-12.2,.45],[12,12.5,20,13.3,.45]];   // [u0,v0,u1,v1,top]
  const LAMPS=[[-21,14],[-6,14.5],[9,15],[21,8],[21,-8],[6,-14.5],[-10,-14.5],[-21.5,-1]], LAMPI=40, TUBE=[2.4,4.9], POLE=5.2;
  let WX=0, WZ=0, G=null, LT=[], TUBEM=null, tick=null, B=null;
  const X=u=>WX+u*MH, Z=v=>WZ+v*MH, Y=y=>y*MV;
  // the bowl's height at a spot (metres, 0 the deck): each lobe a flat bottom rising in a quarter circle to a short vertical at its lip
  const lobeH=(u,v,[cu,cv,R,D])=>{ const s=R-Math.hypot(u-cu,v-cv); if(s<=0)return 0; const r=D*.9; return s>=r?-D:-D+r-Math.sqrt(r*r-(r-s)*(r-s)); };
  const depth=(u,v)=>{ let h=0; for(const L of LOBES){ const q=lobeH(u,v,L); if(q<h)h=q; } return h; };
  const inside=(u,v,skip)=>LOBES.some((L,i)=>i!==skip&&Math.hypot(u-L[0],v-L[1])<L[2]);
  PIT.ground=(x,z)=>{ const u=(x-WX)/MH, v=(z-WZ)/MH; let h=depth(u,v); if(h===0)for(const b of LEDGES)if(u>b[0]&&u<b[2]&&v>b[1]&&v<b[3])h=b[4]; return Y(h); };
  const pic=(n,f)=>{ const c=document.createElement('canvas'); c.width=c.height=n; f(c.getContext('2d'),n); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const rnd=i=>{ const s=Math.sin(i*127.1+311.7)*43758.5453; return s-Math.floor(s); };
  const build=()=>{ '@skatepark';
    G=new THREE.Group(); G.name='skatepit'; scene.add(G); const hu=S.w*.84/2, hv=S.d*.84/2;
    // poured concrete, the kit's pale grey: soft blotches, fine grit, faint pour joints
    const conc=pic(256,(c,n)=>{ c.fillStyle='#e4e7ea'; c.fillRect(0,0,n,n); for(let s=0;s<40;s++){ const g=c.createRadialGradient(rnd(s)*n,rnd(s+.4)*n,0,rnd(s)*n,rnd(s+.4)*n,10+rnd(s+.9)*40); g.addColorStop(0,rnd(s*3)<.5?'rgba(140,146,152,.07)':'rgba(255,255,255,.08)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,n,n); }
      for(let s=0;s<2400;s++){ c.fillStyle=rnd(s*1.7)<.5?'rgba(90,96,102,.12)':'rgba(255,255,255,.16)'; c.fillRect(rnd(s*2.3)*n,rnd(s*5.1)*n,1,1); } c.fillStyle='rgba(110,116,122,.3)'; c.fillRect(0,0,n,1); c.fillRect(0,0,1,n); });
    const cm=new THREE.MeshLambertMaterial({map:conc,vertexColors:true});
    // the bowl: a height grid over the lobes' bounds, shaded darker with depth
    let u0=1e9, v0=1e9, u1=-1e9, v1=-1e9; for(const [cu,cv,R] of LOBES){ u0=Math.min(u0,cu-R-.6); v0=Math.min(v0,cv-R-.6); u1=Math.max(u1,cu+R+.6); v1=Math.max(v1,cv+R+.6); }
    u0=Math.floor(u0/CELL)*CELL; v0=Math.floor(v0/CELL)*CELL; const nu=Math.ceil((u1-u0)/CELL), nv=Math.ceil((v1-v0)/CELL); u1=u0+nu*CELL; v1=v0+nv*CELL;
    { const P=new Float32Array((nu+1)*(nv+1)*3), U=new Float32Array((nu+1)*(nv+1)*2), C=new Float32Array((nu+1)*(nv+1)*3), I=[];
      for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){ const k=j*(nu+1)+i, u=u0+i*CELL, v=v0+j*CELL, h=depth(u,v), sh=1-Math.min(.22,-h*.07);
        P.set([X(u),Y(h+.02),Z(v)],k*3); U.set([(u+(h<0?-h*.7:0))/3,(v+(h<0?-h*.7:0))/3],k*2); C.set([sh*.97,sh*.99,sh],k*3); }
      for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){ const a=j*(nu+1)+i, b=a+1, c=a+nu+1, d=c+1; I.push(a,c,b,b,c,d); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('uv',new THREE.BufferAttribute(U,2)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(I); g.computeVertexNormals(); g.computeBoundingSphere();
      const m=new THREE.Mesh(g,cm); m.receiveShadow=true; m.castShadow=true; G.add(m); }
    // the deck round it: flat slabs to the place's edge
    const flat=(a,b,c,d,y0,y1)=>{ const g=new THREE.BoxGeometry((c-a)*MH,(y1-y0)*MV,(d-b)*MH), uv=g.attributes.uv; for(let q=0;q<uv.count;q++)uv.setXY(q,uv.getX(q)*(c-a)/3,uv.getY(q)*(d-b)/3);
      const col=new Float32Array(uv.count*3).fill(1); g.setAttribute('color',new THREE.BufferAttribute(col,3)); const m=new THREE.Mesh(g,cm); m.position.set(X((a+c)/2),Y((y0+y1)/2),Z((b+d)/2)); m.receiveShadow=true; G.add(m); return m; };
    for(const [a,b,c,d] of [[-hu,-hv,hu,v0],[-hu,v1,hu,hv],[-hu,v0,u0,v1],[u1,v0,hu,v1]])if(c>a&&d>b)flat(a,b,c,d,-.05,.02);
    for(const [a,b,c,d,t] of LEDGES){ const m=flat(a,b,c,d,0,t); m.castShadow=true; }
    // the coping: a steel pipe round each lobe's lip where no other lobe opens, and the grind lines on it (quarter pipes: kind 2)
    const steel=new THREE.MeshLambertMaterial({color:0x8d969e}), runs=[];
    LOBES.forEach(([cu,cv,R],li)=>{ const N=Math.max(24,Math.round(R*2*Math.PI/.5)); let run=[];
      for(let i=0;i<=N;i++){ const t=i/N*Math.PI*2, u=cu+Math.cos(t)*R, v=cv+Math.sin(t)*R; if(inside(u,v,li)){ if(run.length>1)runs.push(run); run=[]; } else run.push([u,v]); } if(run.length>1)runs.push(run); });
    for(const run of runs){ const pts=run.map(([u,v])=>new THREE.Vector3(X(u),Y(COPE*.6),Z(v))); const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*2,COPE*MH,6,false); const m=new THREE.Mesh(tg,steel); m.castShadow=true; G.add(m);
      for(let i=1;i<run.length;i++)SKATE.rails.push({a:[X(run[i-1][0]),Y(COPE),Z(run[i-1][1])],b:[X(run[i][0]),Y(COPE),Z(run[i][1])],kind:2,pit:true}); }
    for(const [a,b,c,d,t] of LEDGES){ for(const v of [b+.04,d-.04])SKATE.rails.push({a:[X(a),Y(t),Z(v)],b:[X(c),Y(t),Z(v)],kind:1,pit:true}); }
    // the tube lamps: a dark pole, its upper part a glowing tube, a cap
    const pole=new THREE.MeshLambertMaterial({color:0x2a2c30}), tg=new THREE.CylinderGeometry(.09*MH,.09*MH,(TUBE[1]-TUBE[0])*MV,10);
    TUBEM={day:new THREE.MeshLambertMaterial({color:0xd8d4cc}),night:new THREE.MeshBasicMaterial({color:0xfff6e6,fog:false,toneMapped:false}),on:null,tubes:[],halos:[]};
    const halo=new THREE.SpriteMaterial({map:pic(64,(c,n)=>{ const g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2); g.addColorStop(0,'rgba(255,226,180,.55)'); g.addColorStop(.35,'rgba(255,200,140,.18)'); g.addColorStop(1,'rgba(255,190,120,0)'); c.fillStyle=g; c.fillRect(0,0,n,n); }),blending:THREE.AdditiveBlending,depthWrite:false,fog:false,transparent:true});
    for(const [u,v] of LAMPS){ const p=new THREE.Mesh(new THREE.BoxGeometry(.16*MH,TUBE[0]*MV,.16*MH),pole); p.position.set(X(u),Y(TUBE[0]/2),Z(v)); p.castShadow=true; G.add(p);
      const t=new THREE.Mesh(tg,TUBEM.day); t.position.set(X(u),Y((TUBE[0]+TUBE[1])/2),Z(v)); G.add(t); TUBEM.tubes.push(t);
      const h=new THREE.Sprite(halo); h.scale.set(1.6*MH,(TUBE[1]-TUBE[0]+1.4)*MV,1); h.position.copy(t.position); h.visible=false; h.raycast=()=>{}; G.add(h); TUBEM.halos.push(h);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(.2*MH,(POLE-TUBE[1])*MV,.2*MH),pole); cap.position.set(X(u),Y((TUBE[1]+POLE)/2),Z(v)); G.add(cap);
      SOL.up.push([X(u)-.12*MH,Z(v)-.12*MH,X(u)+.12*MH,Z(v)+.12*MH]); }
    ROOMS.grounds.push({...B,ground:PIT.ground});
    tick=()=>{ const n=CLOCK.dark?CLOCK.dark():false; if(TUBEM.on===n)return; TUBEM.on=n; for(const t of TUBEM.tubes)t.material=n?TUBEM.night:TUBEM.day; for(const h of TUBEM.halos)h.visible=n; for(const l of LT)l.intensity=n?LAMPI:0; };
    return ROOMS.part(G,()=>{ LT=LAMPS.map(([u,v])=>{ const l=new THREE.PointLight(0xffdcae,0,16*TILE,1.6); l.position.set(X(u),Y(TUBE[0]+.9),Z(v)); scene.add(l); return l; }); },null); };
  PIT.dbg=()=>({built:!!G,lamps:LT.filter(l=>l.intensity>0).length,lampN:LAMPS.length,lit:TUBEM&&TUBEM.on,rails:(SKATE.rails||[]).filter(r=>r.pit).length,coping:(SKATE.rails||[]).filter(r=>r.pit&&r.kind===2).length,at:(u,v)=>[X(u),Z(v)],lobes:LOBES,ledge:LEDGES[0],LAMPI});
  SYS.add('dress',()=>tick&&tick(),'111fda-skatepit');
  if(S&&SECTIONS.home.id===S.section){ WX=SHARED.BOD.XS(S.x); WZ=SHARED.BOD.ZS(S.y); const hu=S.w*.84/2, hv=S.d*.84/2; B={x0:X(-hu),z0:Z(-hv),x1:X(hu),z1:Z(hv)};
    STORE.places.push(['THE SKATE PIT',X(0),Z(hv+1.5),'up','see',null,null,[S.x,S.y]]);
    SYS.onStart(()=>LOAD('skatepark').then(()=>{ build(); PIT.ready=true; }).catch(e=>console.warn('PIT',e)),'111fda-skatepit'); }
}
