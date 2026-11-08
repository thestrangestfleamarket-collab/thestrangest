// THE FAR CITY (owner, 8 Nov 2026: "the map should have a baked in nyc skyline that goes on for as far as you can see until it fades out (real world) ... the stuff that you cant reach should be low res until its just baked shapes towards the end, ie 1 building could be 6-10 triangles total"): past the backdrop, the city to the end of the view as plain shapes (ten triangles a building, one draw), fading into the horizon's colour; past that a painted skyline all the way round, drawn once. The plan of it is data/world.json edge.city (tiles).
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, SKY, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, QS, SYS, TILE, ZU} from './006-map-pre.js';
{ const C=LEVEL.edge&&LEVEL.edge.city; if(C&&!QS.has('nocity')){ const T=TILE, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS;
  let sd=C.seed||7; const rnd=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const [cx,cy]=C.center, near=C.near, wet=C.water||[], cl=C.clusters||[];
  const inBox=(x,y,b)=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3], isWet=y=>wet.some(([a,b])=>y>a&&y<b);
  // how tall the city stands at a spot: its own ground height, raised near its clusters of towers (map tiles)
  const tall=(x,y)=>{ let h=C.base[0]+rnd()*(C.base[1]-C.base[0]); for(const [qx,qy,peak,r] of cl){ const d2=((x-qx)**2+(y-qy)**2)/(r*r); h=Math.max(h,peak*Math.exp(-d2)*(.45+.55*rnd())); } return h; };
  /* ---------- the plain shapes: a block every so many tiles, two to four buildings on it ---------- */
  const B=[]; const [BX,BY]=C.block;
  for(let gx=cx-C.R;gx<cx+C.R;gx+=BX)for(let gy=cy-C.R;gy<cy+C.R;gy+=BY){ const mx=gx+BX/2, my=gy+BY/2; if(Math.hypot(mx-cx,my-cy)>C.R||inBox(mx,my,near)||isWet(my))continue;
    const low=C.lowY!=null&&my<C.lowY; let x=gx+3; while(x<gx+BX-6){ const w=Math.min(gx+BX-3-x,8+rnd()*18), d=(BY-6)*(.55+.45*rnd()); let h=tall(x+w/2,my); if(low)h*=C.lowK; if(rnd()<.12)h*=.4; const room=gx+BX-3-x, ww=Math.min(room,Math.max(w,h*.3)), dd=Math.max(d,Math.min(BY-6,h*.3)); h=Math.min(h,3.2*Math.max(ww,dd));
      B.push([x+ww/2,gy+3+dd/2,ww,dd,Math.max(3,h),rnd()]); x+=ww+1+rnd()*2; } }
  // one box without its floor: five faces, ten triangles
  const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0); { const ix=geo.index.array, keep=[]; for(let i=0;i<ix.length;i+=3){ const f=Math.floor(i/6); if(f!==3)keep.push(ix[i],ix[i+1],ix[i+2]); } geo.setIndex(keep); }
  const U={uHaze:{value:new THREE.Color()},uDay:{value:1},uF0:{value:C.fade[0]*T},uF1:{value:C.fade[1]*T},uSun:{value:new THREE.Vector3(0,1,0)}};
  const mat=new THREE.ShaderMaterial({uniforms:U,fog:false,
    vertexShader:`attribute float aT; varying vec3 vW, vN, vL; varying float vT; void main(){ vec4 w=modelMatrix*instanceMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix*instanceMatrix)*normal); vL=position; vT=aT; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader:`uniform vec3 uHaze,uSun; uniform float uDay,uF0,uF1; varying vec3 vW, vN, vL; varying float vT;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ float d=length(vW-cameraPosition); vec3 base=mix(vec3(.30,.31,.34),vec3(.52,.46,.38),vT);
        float lit=.55+.45*max(dot(vN,uSun),0.)+.12*vN.y; vec3 c=base*lit*(.25+.75*uDay);
        // windows, fading out with distance; lit at night, a few at a time
        float wk=1.-smoothstep(${(60*TILE).toFixed(2)},${(220*TILE).toFixed(2)},d); if(wk>0.&&abs(vN.y)<.5){ vec2 g=vec2(dot(vW.xz,vec2(-vN.z,vN.x))/${(1.6*TILE).toFixed(2)},vW.y/${(1.4*TILE).toFixed(2)}), f=fract(g);
          float win=step(.25,f.x)*step(f.x,.75)*step(.3,f.y)*step(f.y,.8); c=mix(c,c*.55+vec3(.04,.06,.09),win*wk*uDay); c+=win*step(.62,h(floor(g)+vT*31.))*vec3(1.,.82,.5)*.5*(1.-uDay)*(.3+.7*wk); }
        if(abs(vN.y)<.5)c*=.85+.15*clamp(vL.y*1.5,0.,1.);
        gl_FragColor=vec4(c,1.); }`});
  const M=new THREE.InstancedMesh(geo,mat,B.length), m4=new THREE.Matrix4(), aT=new Float32Array(B.length);
  B.forEach(([x,y,w,d,h,t],i)=>{ M.setMatrixAt(i,m4.makeScale(w*T,h*T,d*T).setPosition(XS(x),-.5*ZU,ZS(y))); aT[i]=t; });
  geo.setAttribute('aT',new THREE.InstancedBufferAttribute(aT,1)); M.frustumCulled=false; M.name='farcity'; M.userData.anyRoom=false; scene.add(M);
  /* ---------- the painted skyline past them: a ring round the eye, the far city's towers drawn once (how far each layer stands, how tall the city is that way), hazier the further ---------- */
  const RADT=()=>C.panorama*T, W=4096, H=512, E0=-30*Math.PI/180, E1=24*Math.PI/180, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d');
  const t0=Math.tan(E0), t1=Math.tan(E1), yOf=e=>Math.round((1-(Math.tan(e)-t0)/(t1-t0))*H);   // (the ring is straight up and down: its height goes with the angle's tangent)
  // R: how far (0 near .. 1 farthest), G: a window, B: the building's tone, A: there
  const sx=Math.sign(XS(1)-XS(0))||1, sz=Math.sign(ZS(1)-ZS(0))||1, at=(u,D)=>{ const a=u*2*Math.PI; return [cx+sx*Math.sin(a)*D/T,cy+sz*Math.cos(a)*D/T]; };   // (a direction round the ring, as the cylinder lays it: from +z toward +x; back to map tiles)
  // the ground to the horizon by what lies that way (C.lands: y bands of water, street, park; else haze), a line of trees over the park (owner, 8 Nov 2026: "the hudson should look at least blue from any angle ... the park should look like it goes on forever")
  const LK={water:0,park:1,street:2,trees:3}, land=y=>{ for(const [a,b,k] of C.lands||[])if(y>a&&y<b)return k; return null; };
  for(let x=0;x<W;x++){ const [,ty]=at((x+.5)/W,RADT()), k=land(ty); g.fillStyle=k?`rgb(0,0,${LK[k]*64+32})`:'rgb(255,0,90)'; g.fillRect(x,yOf(0)-1,1,H);
    if(k==='park'){ const [,t2]=at((x+.5)/W,C.ring[0]*T); if(land(t2)==='park'){ const top=yOf(Math.atan2((3+rnd()*5)*T,C.ring[0]*T)); g.fillStyle=`rgb(0,0,${LK.trees*64+32})`; g.fillRect(x,top,1,yOf(0)-top); } } }
  for(const [L,D,k] of [[1,C.ring[2],.95],[.7,C.ring[1],.8],[.4,C.ring[0],.65]]){ let x=0;
    while(x<W){ let w=3+Math.floor(rnd()*9*k); const [tx,ty]=at((x+w/2)/W,D*T); let hh=tall(tx,ty)*(isWet(ty)?0:1)*(C.lowY!=null&&ty<C.lowY?C.lowK:1); if(rnd()<.15)hh*=.3; w=Math.max(w,Math.ceil(hh*.3/(2*Math.PI*D/W)));
      if(hh>0){ const top=yOf(Math.atan2(hh*T,D*T)), bot=yOf(0), tone=Math.floor(rnd()*255); g.fillStyle=`rgb(${Math.round(L*255)},0,${tone})`; g.fillRect(x,top,w,bot-top);
        if(hh>C.base[1]*1.6&&rnd()<.5){ const t2=yOf(Math.atan2(hh*1.08*T,D*T)); g.fillRect(x+Math.floor(w*.2),t2,Math.max(2,Math.floor(w*.6)),top-t2); }
        for(let yy=top+2;yy<bot-1;yy+=3)for(let xx=x+1;xx<x+w-1;xx+=2)if(rnd()<.5){ g.fillStyle=`rgb(${Math.round(L*255)},255,${tone})`; g.fillRect(xx,yy,1,1); } }
      x+=w+(rnd()<.3?1:0); } }
  const tex=new THREE.CanvasTexture(cv); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; tex.wrapS=THREE.RepeatWrapping;
  const RAD=C.panorama*T, PH=RAD*(Math.tan(E1)-Math.tan(E0)), pmat=new THREE.ShaderMaterial({uniforms:{uTex:{value:tex},uHaze:U.uHaze,uDay:U.uDay},fog:false,side:THREE.BackSide,
    vertexShader:`varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:`uniform sampler2D uTex; uniform vec3 uHaze; uniform float uDay; varying vec2 vU; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec4 t=texture2D(uTex,vU); if(t.a<.5)discard;
        if(t.r<.1){ vec3 g=t.b<.25?vec3(.22,.40,.58):t.b<.5?vec3(.24,.37,.18):t.b<.75?vec3(.28,.28,.30):vec3(.14,.25,.11); gl_FragColor=vec4(mix(g,uHaze,.12)*(.25+.75*uDay),1.); return; }
        vec3 base=mix(vec3(.30,.31,.34),vec3(.52,.46,.38),t.b)*(.25+.75*uDay);
        vec3 c=base*(1.-.25*t.r); c+=t.g*step(.55,h(floor(vU*vec2(${W}.,${H}.))))*vec3(1.,.82,.5)*.45*(1.-uDay)*(1.-.6*t.r); gl_FragColor=vec4(c,1.); }`});
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(RAD,RAD,PH,96,1,true).translate(0,(RAD*Math.tan(E1)+RAD*Math.tan(E0))/2,0),pmat);
  // (the ring is round the eye wherever it goes, so the far city stays on the horizon; only with the view in perspective)
  ring.frustumCulled=false; ring.renderOrder=-5; ring.name='skyline'; ring.userData.anyRoom=false; scene.add(ring);
  ring.onBeforeRender=(r,s,cam)=>{ ring.position.set(cam.position.x,cam.position.y,cam.position.z); };
  // the cylinder's angle against the painting's: its u runs from +z toward +x, as the painting was laid out
  let sT=0; SYS.add('sky',dt=>{ ring.visible=!!UI.persp; if((sT-=dt||0)>0)return; sT=.5;
    if(SKY.U&&SKY.U.uH)U.uHaze.value.copy(SKY.U.uH.value); const e=CLOCK.elev?CLOCK.elev():30; U.uDay.value=Math.max(.06,Math.min(1,(e+4)/16)); if(CLOCK.sunV)U.uSun.value.copy(CLOCK.sunV).normalize(); },'134g-farcity');
  window.FARCITY={n:B.length,tris:B.length*10,M,ring}; } }
