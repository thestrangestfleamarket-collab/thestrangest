// THE FAR CITY (owner, 8 Nov 2026: "the map should have a baked in nyc skyline that goes on for as far as you can see until it fades out (real world) ... the stuff that you cant reach should be low res until its just baked shapes towards the end, ie 1 building could be 6-10 triangles total"); 8 Nov 2026: "only build what is needed for the outline ... just do outline of buildings skyline past that"): past what the view reaches, only a painted skyline all the way round, drawn once, the air taking more of it the further it is. The plan of it is data/world.json edge.city (tiles).
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, SKY, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, QS, SYS, TILE} from './006-map-pre.js';
{ const C=LEVEL.edge&&LEVEL.edge.city; if(C&&!QS.has('nocity')){ const T=TILE, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS;
  let sd=C.seed||7; const rnd=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
  const [cx,cy]=C.center, wet=C.water||[], cl=C.clusters||[];
  const U={uHaze:{value:new THREE.Color()},uDay:{value:1}}, isWet=y=>wet.some(([a,b])=>y>a&&y<b);
  // the island (owner, 8 Nov 2026: Manhattan): the Hudson's y band, the East River past its near bank (C.east), all water past the island's ends; across either the far shore, lower; Central Park inside the ring (LEVEL.sections.ring)
  const RG=LEVEL.sections&&LEVEL.sections.ring, PK=RG&&RG.park, inR=(x,y,r)=>!!r&&x>r.x0&&x<r.x1&&y>r.y0&&y<r.y1, EB=C.east, BK=EB&&EB.bank;
  const bankY=x=>{ if(!BK)return 1e9; if(x<BK[0][0]||x>BK[BK.length-1][0])return null; let i=1; while(i<BK.length-1&&BK[i][0]<x)i++; const [ax,ay]=BK[i-1], [bx,by]=BK[i]; return ay+(by-ay)*(x-ax)/(bx-ax||1); };
  const where=(x,y)=>{ if(isWet(y))return 'water'; if(C.lowY!=null&&y<C.lowY)return 'low'; const b=bankY(x); if(b==null)return 'water'; if(y>b)return y<b+EB.w?'water':'low'; if(inR(x,y,PK))return 'park'; return 'city'; };
  // how tall the city stands at a spot: its own ground height, raised near its clusters of towers (map tiles)
  const tall=(x,y)=>{ let h=C.base[0]+rnd()*(C.base[1]-C.base[0]); for(const [qx,qy,peak,r] of cl){ const d2=((x-qx)**2+(y-qy)**2)/(r*r); h=Math.max(h,peak*Math.exp(-d2)*(.45+.55*rnd())); } return h; };
  /* ---------- the painted skyline past them: a ring round the eye, the far city's towers drawn once (how far each layer stands, how tall the city is that way), hazier the further ---------- */
  const RADT=()=>C.panorama*T, W=4096, H=512, E0=-30*Math.PI/180, E1=24*Math.PI/180, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d');
  const t0=Math.tan(E0), t1=Math.tan(E1), yOf=e=>Math.round((1-(Math.tan(e)-t0)/(t1-t0))*H);   // (the ring is straight up and down: its height goes with the angle's tangent)
  // R: how far (0 near .. 1 farthest), G: a window, B: the building's tone, A: there
  const sx=Math.sign(XS(1)-XS(0))||1, sz=Math.sign(ZS(1)-ZS(0))||1, at=(u,D)=>{ const a=u*2*Math.PI; return [cx+sx*Math.sin(a)*D/T,cy+sz*Math.cos(a)*D/T]; };   // (a direction round the ring, as the cylinder lays it: from +z toward +x; back to map tiles)
  // the ground to the horizon by what lies that way (where(): water, the park, else the city's streets) (owner, 8 Nov 2026: "the hudson should look at least blue from any angle")
  const LK={water:0,park:1,street:2,trees:3}, land=(x,y)=>{ const w=where(x,y); return w==='water'?'water':w==='park'?'park':'street'; };
  // the Hudson straight through to the horizon (owner, 8 Nov 2026: "make sure there arent any building in the hudson (it should go straight through)"): a direction that meets the river far off is water all the way
  const CH=new Uint8Array(W); for(let x=0;x<W;x++)CH[x]=isWet(at((x+.5)/W,C.ring[C.ring.length-1]*T)[1])?1:0;
  // (the ground just past the view; what is beyond it shows only as the far shore's strip at the horizon)
  for(let x=0;x<W;x++){ const [tx0,ty]=at((x+.5)/W,C.ring[0]*T), k=CH[x]?'water':land(tx0,ty); g.fillStyle=`rgb(0,0,${LK[k]*64+32})`; g.fillRect(x,yOf(0)-1,1,H);
    if(k==='water'&&!CH[x]&&C.ring.some(D=>land(...at((x+.5)/W,D*T))!=='water')){ g.fillStyle=`rgb(0,0,${LK.street*64+32})`; g.fillRect(x,yOf(0)-1,1,3); } }   // (the far shore at the horizon under its towers, not water)
  for(const [L,D,k] of C.ring.map((D,i,A)=>[.4+.6*i/Math.max(1,A.length-1),D,.65+.3*i/Math.max(1,A.length-1)]).reverse()){ let x=0;
    while(x<W){ let w=3+Math.floor(rnd()*9*k); const [tx,ty]=at((x+w/2)/W,D*T); const wh=CH[Math.min(W-1,Math.floor(x+w/2))]?'water':where(tx,ty); let hh=wh==='water'||wh==='park'?0:tall(tx,ty)*(wh==='low'?C.lowK:1); if(rnd()<.15)hh*=.3; w=Math.max(w,Math.ceil(hh*.3/(2*Math.PI*D/W)));
      if(hh>0){ const top=yOf(Math.atan2(hh*T,D*T)), bot=yOf(0), tone=Math.floor(rnd()*255); g.fillStyle=`rgb(${Math.round(L*255)},0,${tone})`; g.fillRect(x,top,w,bot-top);
        if(hh>C.base[1]*1.6&&rnd()<.5){ const t2=yOf(Math.atan2(hh*1.08*T,D*T)); g.fillRect(x+Math.floor(w*.2),t2,Math.max(2,Math.floor(w*.6)),top-t2); }
        for(let yy=top+2;yy<bot-1;yy+=3)for(let xx=x+1;xx<x+w-1;xx+=2)if(rnd()<.5){ g.fillStyle=`rgb(${Math.round(L*255)},255,${tone})`; g.fillRect(xx,yy,1,1); } }
      x+=w+(rnd()<.3?1:0); } }
  const tex=new THREE.CanvasTexture(cv); tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; tex.wrapS=THREE.RepeatWrapping;
  const RAD=C.panorama*T, PH=RAD*(Math.tan(E1)-Math.tan(E0)), pmat=new THREE.ShaderMaterial({uniforms:{uTex:{value:tex},uHaze:U.uHaze,uDay:U.uDay},fog:false,side:THREE.BackSide,
    vertexShader:`varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z=gl_Position.w*.99999; }`,   // (behind everything, never cut off by the far plane: it was, and showed as a floating strip)
    fragmentShader:`uniform sampler2D uTex; uniform vec3 uHaze; uniform float uDay; varying vec2 vU; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec4 t=texture2D(uTex,vU); if(t.a<.5)discard;
        if(t.r<.1){ vec3 g=t.b<.25?vec3(.22,.40,.58):t.b<.5?vec3(.24,.37,.18):t.b<.75?vec3(.28,.28,.30):vec3(.14,.25,.11); gl_FragColor=vec4(mix(g*(.25+.75*uDay),uHaze,.72),1.); return; }
        // (all of it past the view: the air takes most of it, more the further (t.r), blue-grey shapes a little darker than the haze, as from far off)
        vec3 base=mix(vec3(.26,.30,.38),vec3(.36,.38,.44),t.b)*(.25+.75*uDay);
        vec3 c=mix(base,uHaze,.55+.4*t.r); c+=t.g*step(.55,h(floor(vU*vec2(${W}.,${H}.))))*vec3(1.,.82,.5)*.3*(1.-uDay)*(1.-.7*t.r); gl_FragColor=vec4(c,1.); }`});
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(RAD,RAD,PH,96,1,true).translate(0,(RAD*Math.tan(E1)+RAD*Math.tan(E0))/2,0),pmat);
  // (the ring is round the eye wherever it goes, so the far city stays on the horizon; only with the view in perspective)
  ring.frustumCulled=false; ring.renderOrder=-5; ring.name='skyline'; ring.userData.anyRoom=false; scene.add(ring);
  ring.onBeforeRender=(r,s,cam)=>{ ring.position.set(cam.position.x,cam.position.y,cam.position.z); };
  // the cylinder's angle against the painting's: its u runs from +z toward +x, as the painting was laid out
  let sT=0; SYS.add('sky',dt=>{ ring.visible=!!UI.persp; if((sT-=dt||0)>0)return; sT=.5;
    if(SKY.U&&SKY.U.uH)U.uHaze.value.copy(SKY.U.uH.value); const e=CLOCK.elev?CLOCK.elev():30; U.uDay.value=Math.max(.06,Math.min(1,(e+4)/16)); },'134g-farcity');
  window.FARCITY={ring}; } }
