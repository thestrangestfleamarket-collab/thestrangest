// THE FISH TANK: the showpiece tank in every apartment (owner, 5 and 9 Nov 2026): live rippling water, caustics on the sand, Polyfork's koi and reef fish swimming; double-click it to look close and set its water, decor, fish and light (kept with your layout); with fish food the fish rise to eat.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, PETS, pos, SFX, UI, VR, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {FISHES} from './141f-fishes.js';
import {ROOMK} from './150a-bedroom.js';
{ const GL=.012, NX=64, NZ=20, MAXF=16, CAPS=40;
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  // the choices: each water says if it is salt; each fish its length in metres and which water it lives in
  const WATER={fresh:{n:'FRESH',salt:0,c:[.86,.96,.97],at:[.55,.82,.84],ad:2.2,s:0xcfeef2,sand:[.86,.8,.66]},salt:{n:'TROPICAL SALT',salt:1,c:[.72,.9,1],at:[.18,.58,.95],ad:1.3,s:0x8fd6ff,sand:[.95,.92,.84]},
    pond:{n:'MURKY POND',salt:0,c:[.72,.8,.56],at:[.34,.46,.2],ad:.55,s:0x7d9156,sand:[.5,.46,.34]},glow:{n:'BLACKLIGHT',salt:0,c:[.5,.42,.95],at:[.24,.12,.62],ad:1,s:0x8c66ff,sand:[.3,.3,.42],glow:1}};
  const KIND=[{id:'pfkoi',n:'KOI',L:.15,sp:.09,b:'cruise',var:['pfkoi','koi_showa','koi_gold','koi_sanke','koi_platinum','koi_asagi','koi_orange','koi_black','koi']},{id:'goldfish',n:'GOLDFISH',L:.1,sp:.1,b:'shoal'},{id:'pfclown',n:'CLOWNFISH',L:.09,sp:.14,salt:1,b:'hover'},{id:'pfbluetang',n:'BLUE TANG',L:.15,sp:.16,salt:1,b:'cruise'},
    {id:'yellowtang',n:'YELLOW TANG',L:.13,sp:.15,salt:1,b:'shoal'},{id:'angelfish',n:'ANGELFISH',L:.13,sp:.1,salt:1,b:'hover'},{id:'mandarinfish',n:'MANDARIN',L:.07,sp:.06,salt:1,b:'bottom'}];
  const DECOR=[['sand','SAND'],['pebbles','ROCKS'],['driftwood','DRIFTWOOD'],['plants','PLANTS'],['castle','CASTLE'],['chest','CHEST'],['bubbler','BUBBLER']];
  const LIGHTC={white:'#f2f7ff',warm:'#ffd9a0',blue:'#7fb6ff',pink:'#ff8fd0',green:'#9cffb0',uv:'#9a6bff'};
  const DEF={w:'fresh',d:['sand','pebbles','driftwood','plants'],f:{pfkoi:5,goldfish:6},l:{on:1,c:'white'}};
  // a layout's tank as it may be read (another player's layout too): only known choices, at most MAXF fish
  const clean=s=>{ s=s&&typeof s==='object'?s:{}; const o={w:WATER[s.w]?s.w:DEF.w,d:Array.isArray(s.d)?DECOR.map(d=>d[0]).filter(k=>s.d.includes(k)):DEF.d.slice(),f:{},l:{on:s.l&&s.l.on===0?0:1,c:s.l&&LIGHTC[s.l.c]?s.l.c:'white'}};
    let n=0; for(const k of KIND){ const c=Math.max(0,Math.min(8,Math.round(+((s.f||DEF.f)[k.id])||0))); if(c&&n+c<=MAXF){ o.f[k.id]=c; n+=c; } } return o; };
  const TANKS=[]; window.TANKDBG=()=>TANKS.map(T=>({fish:T.fish.length,ways:[...new Set(T.fish.map(f=>f.b))],koiL:Math.max(0,...T.fish.filter(f=>f.kind==='pfkoi').map(f=>f.L)),vis:T.g.visible,pos:[+T.g.position.x.toFixed(2),+T.g.position.z.toFixed(2)],at:T.tg.localToWorld(new THREE.Vector3(0,T.SH+T.TH/2,0)).toArray().map(v=>+v.toFixed(2)),front:T.tg.localToWorld(new THREE.Vector3(0,T.SH+T.TH/2,-1)).toArray().map(v=>+v.toFixed(2)),fed:+(T.fed||0).toFixed(1),y:T.fish.length?+(T.fish.reduce((a,f)=>a+f.y,0)/T.fish.length).toFixed(3):0,
    kinds:T.sch?Object.keys(T.sch).filter(k=>T.sch[k].im.count):[],wave:+(T.h.reduce((a,v)=>Math.max(a,Math.abs(v)),0)*1000).toFixed(4),sy:+T.surf.geometry.attributes.position.getY(NX*(NZ>>1)+(NX>>1)).toFixed(5),steps:T.steps,set:T.s,view:!!(V&&V.T===T),cam:SHARED.cam?[...SHARED.cam.position.toArray(),...SHARED.cam.getWorldDirection(new THREE.Vector3()).toArray()].map(v=>+v.toFixed(2)):null,size:[T.TW,T.TD,T.TH],f0:T.fish[0]?[T.fish[0].id,+T.fish[0].x.toFixed(3),+T.fish[0].y.toFixed(3),+T.fish[0].z.toFixed(3)]:null}));
  for(const k of ['FISH TANK'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,Lx,Ly,du,solid}=c;
    // along the back wall between the back door and the corner, where no window is (owner, 9 Nov 2026: larger, a showpiece)
    const TW=Math.max(2.4,Math.min(3.6,Lx-du-2.4)), TD=1, TH=1.2, SH=.7, U0=du+.95+TW/2, V0=Ly-TD/2-.13, SW=TW-2*GL, SD=TD-2*GL, WY=SH+TH*.9;
    const sandY=(x,z)=>SH+.06+.03+.09*Math.min(1,Math.max(0,(z+SD/2)/SD))+.012*Math.sin(x*5.1+z*3.3);   // the sand's top, banked up toward the back
    cap('FISH TANK',g=>{ const tg=new THREE.Group(); tg.position.set(U0,0,V0); g.add(tg); const P=(geo,m,x,y,z,ry=0,cast=true)=>part(geo,m,x,y,z,ry,tg,cast);
      const V3=THREE.Vector3, ONE=new V3(1,1,1);
      // a few parts in their own colours as one mesh (one draw): [geometry, rgb, x,y,z, rx,ry,rz]
      const merge=list=>{ let n=0; const G=list.map(([q,col,x,y,z,rx=0,ry=0,rz=0])=>{ const a=q.index?q.toNonIndexed():q; a.applyMatrix4(new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),ONE)); a.computeVertexNormals(); n+=a.attributes.position.count; return [a,col]; });
        const Pp=new Float32Array(n*3), N=new Float32Array(n*3), C=new Float32Array(n*3), cc=new THREE.Color(); let o=0;
        for(const [a,col] of G){ const k=a.attributes.position.count; Pp.set(a.attributes.position.array,o*3); N.set(a.attributes.normal.array,o*3); cc.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(let i=0;i<k;i++){ C[(o+i)*3]=cc.r; C[(o+i)*3+1]=cc.g; C[(o+i)*3+2]=cc.b; } o+=k; }
        const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(Pp,3)); bg.setAttribute('normal',new THREE.BufferAttribute(N,3)); bg.setAttribute('color',new THREE.BufferAttribute(C,3)); return bg; };
      const vc=(o={})=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,flatShading:true,...o});
      const U={uT:{value:0},uL:{value:new THREE.Color(1,1,1)},uK:{value:1},uE:{value:0},uF:{value:null},uWD:{value:new THREE.Vector2(SW,SD)}};
      // the stand: a dark walnut cabinet; the frame: a black rim round the open top and the light bar along the back
      P(rbox(TW+.08,SH,TD+.08,.02),mat([70,46,32]),0,SH/2,0);
      const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), rimC=[24,24,26];
      P(merge([[B(TW+.03,.04,.03),rimC,0,SH+TH+.02,-TD/2],[B(TW+.03,.04,.03),rimC,0,SH+TH+.02,TD/2],[B(.03,.04,TD),rimC,-TW/2,SH+TH+.02,0],[B(.03,.04,TD),rimC,TW/2,SH+TH+.02,0],
        [B(TW+.03,.03,.03),rimC,0,SH+.015,-TD/2],[B(TW+.03,.03,.03),rimC,0,SH+.015,TD/2],[B(TW-.1,.035,.14),[40,40,44],0,SH+TH+.06,TD/2-.1]]),vc({flatShading:false,roughness:.5}),0,0,0);
      const bar=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}); P(B(TW-.16,.006,.08),bar,0,SH+TH+.04,TD/2-.1,0,false);
      // the kit every tank has: a dark backing on the back glass, the filter's intake and return in one back corner, the heater and a thermometer in the other
      { const blk=[18,20,24], Cy=(r,l)=>new THREE.CylinderGeometry(r,r,l,8);
        P(merge([[B(SW,TH*.9,.004),[10,22,34],0,SH+TH*.45+.02,SD/2-.004],[Cy(.012,TH*.7),blk,-SW/2+.06,SH+TH*.55,SD/2-.05],[B(.05,.07,.05),blk,-SW/2+.06,SH+TH*.2,SD/2-.05],[Cy(.01,.3),blk,-SW/2+.2,WY+.03,SD/2-.05,0,0,Math.PI/2],
          [Cy(.014,.26),[190,210,215],SW/2-.06,SH+TH*.5,SD/2-.05],[Cy(.015,.04),[230,120,40],SW/2-.06,SH+TH*.5-.15,SD/2-.05],[B(.012,.14,.004),[235,235,225],SW/2-.14,SH+TH*.6,SD/2-.012]]),vc({flatShading:false,roughness:.6}),0,0,0,0,false); }
      // the sand: banked toward the back, the light's caustics moving over it (from the live surface's curvature, and a fine shimmer)
      const sg=new THREE.BoxGeometry(SW,.06,SD,32,1,10), sp=sg.attributes.position; for(let i=0;i<sp.count;i++)if(sp.getY(i)>0)sp.setY(i,sandY(sp.getX(i),sp.getZ(i))-SH-.06+.03); sg.computeVertexNormals();
      const sand=new THREE.MeshStandardMaterial({color:new THREE.Color(...WATER.fresh.sand),roughness:1});
      sand.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader='varying vec3 vCs;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vCs=vec3(position.x,position.z,normal.y);');
        sh.fragmentShader='uniform float uT,uK,uE; uniform vec3 uL; uniform sampler2D uF; uniform vec2 uWD; varying vec3 vCs;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        { vec2 p=vCs.xy*9.+vec2(17.,3.), q=p; float c=1.; for(int n=0;n<3;n++){ float t=uT*.55*(1.-3.5/float(n+1)); q=p+vec2(cos(t-q.x)+sin(t+q.y),sin(t-q.y)+cos(t+q.x)); c+=1./length(vec2(p.x/(sin(q.x+t)/.006),p.y/(cos(q.y+t)/.006))); }
          c=1.17-pow(c/3.,1.4); float sh=pow(abs(c),7.), f=texture2D(uF,vCs.xy/uWD+.5).r*2.-1.;
          totalEmissiveRadiance+=uL*uK*max(vCs.z,0.)*(sh*(.12+.45*uE)+max(f,0.)*.7); }`); };
      sand.customProgramCacheKey=()=>'tanksand';
      P(sg,sand,0,SH+.03,0);
      // the water: its body bends the light like real water, its open top a live surface (a wave sim: ripples from fish, food and bubbles)
      const wg=new THREE.BoxGeometry(SW,WY-SH-.02,SD), gi=wg.index.array, gr=wg.groups[2], keep=[]; for(let i=0;i<gi.length;i++)if(i<gr.start||i>=gr.start+gr.count)keep.push(gi[i]); wg.setIndex(keep); wg.clearGroups();
      const water=new THREE.MeshStandardMaterial({color:new THREE.Color(...WATER.fresh.at),roughness:.1,metalness:0,transparent:true,opacity:.12,depthWrite:false});   // a clear tint, not a blurred copy of the room (owner, 9 Nov 2026)
      const wm=P(wg,water,0,SH+.02+(WY-SH-.02)/2,0,0,false); wm.renderOrder=2; wm.userData.soft=true;
      const fg=new THREE.PlaneGeometry(SW,SD,NX-1,NZ-1); fg.rotateX(-Math.PI/2); fg.attributes.position.setUsage(THREE.DynamicDrawUsage); fg.attributes.normal.setUsage(THREE.DynamicDrawUsage);
      const surfM=new THREE.MeshStandardMaterial({color:WATER.fresh.s,roughness:.06,metalness:.05,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false});
      const surf=P(fg,surfM,0,WY,0,0,false); surf.renderOrder=3; surf.userData.soft=true;
      const glass=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.03,metalness:.2,transparent:true,opacity:.05,depthWrite:false});
      { const gg=merge([[B(TW,TH,GL),[255,255,255],0,SH+TH/2,-TD/2+GL/2],[B(TW,TH,GL),[255,255,255],0,SH+TH/2,TD/2-GL/2],[B(GL,TH,TD),[255,255,255],-TW/2+GL/2,SH+TH/2,0],[B(GL,TH,TD),[255,255,255],TW/2-GL/2,SH+TH/2,0]]); gg.deleteAttribute('color');
        const m=P(gg,glass,0,0,0,0,false); m.renderOrder=4; m.userData.soft=true; }
      // the decor, each its own mesh to show or hide
      const D={}, rnd=(i,k)=>hs(i,k);
      // the rocks: gravel thick at the front, and three stones a third of the way along (the tallest leaning, two beside it)
      { const L=[], stone=[[98,96,98],[116,112,110],[82,82,88]];
        for(let i=0;i<110;i++){ const x=(rnd(i,1)-.5)*(SW-.08), z=-SD/2+.03+rnd(i,2)**2.2*(SD-.1), r=.008+rnd(i,3)*.014, t=[[120,112,104],[150,138,120],[86,84,82],[170,150,128],[60,58,60]][i%5]; L.push([new THREE.IcosahedronGeometry(r,0),t,x,sandY(x,z)+r*.3,z,rnd(i,4)*3,rnd(i,5)*3,0]); }
        const RX=-SW*.27, RZ=SD*.08; for(const [dx,dz,r,sy,rz,c] of [[0,0,.17,1.5,.22,0],[.24,-.1,.11,1.1,-.3,1],[-.2,-.14,.085,.9,.15,2],[.1,-.26,.05,.7,0,1],[-.33,.02,.04,.7,.4,0]]){ const x=RX+dx, z=RZ+dz, q=new THREE.DodecahedronGeometry(r,0); q.scale(1,sy,.8); L.push([q,stone[c],x,sandY(x,z)+r*sy*.5,z,0,rnd(dx*9,6)*3,rz]); }
        D.pebbles=P(merge(L),vc(),0,0,0); }
      // the driftwood: one branch rising from the right and arching back over the middle, twigs off it, broad leaves tied along it
      { const wd=[112,80,54], wd2=[88,62,42], lf=[46,110,58], lf2=[58,132,66], x0=SW*.2, z0=SD*.1, y0=sandY(x0,z0), C=(a,b,l,s)=>new THREE.CylinderGeometry(a,b,l,s), L=[
          [C(.03,.06,.55,7),wd,x0,y0+.16,z0,0,.2,1.05],[C(.02,.032,.5,6),wd2,x0-.42,y0+.42,z0+.03,.1,.2,1.3],[C(.012,.022,.4,6),wd,x0-.82,y0+.5,z0+.05,.15,0,1.75],
          [C(.012,.022,.3,5),wd2,x0-.2,y0+.5,z0-.06,-.5,0,.3],[C(.01,.018,.26,5),wd,x0+.2,y0+.2,z0+.1,.6,0,-.5],[C(.008,.014,.2,5),wd2,x0-.6,y0+.6,z0-.02,-.3,0,-.2]];
        for(let i=0;i<9;i++){ const t=i/8, q=new THREE.SphereGeometry(.05,5,3); q.scale(1.5,.12,.8); L.push([q,i%2?lf:lf2,x0-.1-t*.75,y0+.34+Math.sin(t*2.6)*.2,z0+(rnd(i,31)-.5)*.14,rnd(i,32)*.6-.3,rnd(i,33)*3,rnd(i,34)*.8-.4]); }
        D.driftwood=P(merge(L),vc(),0,0,0); T0.anch=[[-SW*.27,SD*.08],[x0-.4,z0],[-.44*SW,SD*.3],[.3*SW,SD*.3]]; }
      { const st=[150,150,156], st2=[118,118,126], dk=[26,24,30], x0=SW*.3, z0=SD*.18, y0=sandY(x0,z0)-.01, L=[[new THREE.CylinderGeometry(.11,.12,.42,8),st,x0,y0+.21,z0],[B(.36,.22,.16),st2,x0-.2,y0+.11,z0+.02],[B(.12,.14,.02),dk,x0-.2,y0+.07,z0-.07],[new THREE.CylinderGeometry(.06,.07,.3,8),st,x0-.4,y0+.15,z0+.03],[new THREE.ConeGeometry(.13,.14,8),[120,64,60],x0,y0+.49,z0],[new THREE.ConeGeometry(.075,.1,8),[120,64,60],x0-.4,y0+.35,z0+.03]];
        for(let i=0;i<5;i++)L.push([B(.05,.05,.17),st2,x0-.34+i*.07,y0+.245,z0+.02]); L.push([B(.05,.09,.02),dk,x0,y0+.3,z0-.11]);
        D.castle=P(merge(L),vc(),0,0,0); }
      { const x0=-SW*.38, z0=-SD*.05, y0=sandY(x0,z0)-.01, wood=[104,62,34], gold=[214,170,60];
        D.chest=P(merge([[B(.26,.14,.16),wood,x0,y0+.07,z0,0,.3,0],[B(.27,.025,.17),gold,x0,y0+.11,z0,0,.3,0],[B(.03,.145,.165),gold,x0,y0+.072,z0,0,.3,0],[new THREE.CylinderGeometry(.05,.05,.02,10),gold,x0+.02,y0+.15,z0,0,0,0]]),vc({flatShading:false,roughness:.6,metalness:.2}),0,0,0);
        const lid=new THREE.Group(); lid.rotation.order='YXZ'; lid.position.set(x0+Math.sin(.3)*.08,y0+.14,z0+Math.cos(.3)*.08); lid.rotation.y=.3; D.chest.add(lid);
        const lm=new THREE.Mesh(merge([[new THREE.CylinderGeometry(.08,.08,.26,10,1,false,0,Math.PI),wood,0,0,-.08,0,0,Math.PI/2],[B(.27,.02,.02),gold,0,.0,-.155]]),D.chest.material); lm.castShadow=true; lid.add(lm); T0.lid=lid; T0.chestAt=[x0,y0+.18,z0]; }
      // the plants, laid out as in a planted tank: tall stems in clumps along the back, bushes by the stones and under the wood, a low carpet at the front
      { const S=6, Pp=[], A=[], Cc=[], I=[], cc=new THREE.Color(); let n=0; const r=k=>rnd(n,k), G=[[40,120,60],[58,140,62],[30,96,52],[84,150,60],[124,62,52]];
        const blade=(x,z,h,w,ry,ph,col,sw=1)=>{ const b=Pp.length/3, y0=sandY(x,z)-.01; cc.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace);
          for(let k=0;k<=S;k++){ const t=k/S, ww=w*(1-t*.75), sh=.7+.3*t; for(const sx of [-1,1]){ Pp.push(x+Math.cos(ry)*ww/2*sx,y0+t*h,z-Math.sin(ry)*ww/2*sx); A.push(ph,t*h*sw); Cc.push(cc.r*sh,cc.g*sh,cc.b*sh); } if(k<S)I.push(b+k*2,b+k*2+1,b+k*2+2,b+k*2+1,b+k*2+3,b+k*2+2); } };
        for(const [cx,nb,hh,ci] of [[-.44,9,.8,0],[-.3,6,.62,1],[.05,5,.5,2],[.3,7,.7,4],[.45,9,.86,0]])for(let i=0;i<nb;i++,n++)blade(cx*SW+(r(11)-.5)*.2,SD/2-.05-r(12)*.14,hh*(.7+r(13)*.4),.03+r(14)*.03,r(15)*3,r(16)*6.28,G[ci]);
        for(const [cx,cz,nb] of [[-.4,.02,7],[-.13,.12,6],[.12,.2,7],[.36,.05,6]])for(let i=0;i<nb;i++,n++)blade(cx*SW+(r(17)-.5)*.16,cz*SD+(r(18)-.5)*.14,.12+r(19)*.14,.06+r(20)*.03,r(21)*3,r(22)*6.28,G[1+(i%2)*2],.5);
        for(let i=0;i<90;i++,n++){ const x=(r(23)-.5)*(SW-.1); if(Math.abs(x)<SW*.12&&r(24)<.8)continue; blade(x,-SD/2+.05+r(25)*SD*.3,.03+r(26)*.035,.012,r(27)*3,r(28)*6.28,G[3],.3); }
        const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); pg.setAttribute('aSway',new THREE.Float32BufferAttribute(A,2)); pg.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); pg.setIndex(I); pg.computeVertexNormals();
        const leaf=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.8,side:THREE.DoubleSide});
        leaf.onBeforeCompile=sh=>{ sh.uniforms.uT=U.uT; sh.vertexShader='uniform float uT; attribute vec2 aSway;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n { float k=aSway.y*aSway.y; transformed.x+=k*.12*sin(uT*.7+aSway.x); transformed.z+=k*.06*sin(uT*.5+aSway.x*1.7); }'); };
        leaf.customProgramCacheKey=()=>'tankleaf'; D.plants=P(pg,leaf,0,0,0,0,false); T0.leaf=leaf; }
      { const x0=SW*.44, z0=SD*.3, y0=sandY(x0,z0); D.bubbler=P(merge([[new THREE.CylinderGeometry(.03,.035,.03,8),[50,52,60],x0,y0+.01,z0],[new THREE.CylinderGeometry(.004,.004,WY-y0,4),[200,230,230],x0+.03,(WY+y0)/2,z0+.03]]),vc(),0,0,0); T0.bubAt=[x0,y0+.03,z0]; }
      // the bubbles and the food: small instanced spheres
      const bub=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:0xeaf8ff,roughness:.1,transparent:true,opacity:.55,depthWrite:false}),48); bub.count=0; bub.frustumCulled=false; bub.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tg.add(bub); bub.renderOrder=3;
      const food=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0xa0602a,roughness:.9}),16); food.count=0; food.frustumCulled=false; food.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tg.add(food);
      // the live surface: a height for every point of a 64 x 20 grid, stepped 30 times a second; its curvature is the light it focuses onto the sand
      const ftx=new THREE.DataTexture(new Uint8Array(NX*NZ*4).fill(128),NX,NZ); ftx.magFilter=ftx.minFilter=THREE.LinearFilter; ftx.needsUpdate=true; U.uF.value=ftx;
      const T={g,tg,TW,TD,TH,SH,SW,SD,WY,sandY,U,D,water,surf,surfM,sand,bar,bub,food,ftx,leaf:T0.leaf,lid:T0.lid,chestAt:T0.chestAt,bubAt:T0.bubAt,h:new Float32Array(NX*NZ),p:new Float32Array(NX*NZ),acc:0,E:0,steps:0,
        fish:[],sch:{},shoal:{},anch:T0.anch,bubs:[],pel:[],t:Math.random()*100,s:clean(DEF),chestT:6}; TANKS.push(T); apply(T,T.s);
      solid(U0-TW/2-.04,V0-TD/2-.04,U0+TW/2+.04,V0+TD/2+.04,SH+TH+.06);
      FISHES.load().then(()=>{ T.ready=true; school(T); }).catch(()=>{});
    },{id:'fishtank',wire:'tank'}); });
  const T0={};   // what a tank's builder hands itself between its parts

  /* ---------- the settings: water, decor, fish, light ---------- */
  const apply=(T,s)=>{ T.s=clean(s); const W=WATER[T.s.w], L=new THREE.Color(LIGHTC[T.s.l.c]), on=T.s.l.on;
    T.water.color.setRGB(...W.at); T.water.opacity=Math.min(.6,.25/W.ad)*(on?1:1.3); T.surfM.color.setHex(W.s);
    T.sand.color.setRGB(...(T.s.d.includes('sand')?W.sand:[.14,.14,.16])); T.U.uL.value.copy(L); T.U.uK.value=on?(W.glow?1.6:1):0;
    T.bar.color.copy(on?L:new THREE.Color(.05,.05,.06)); T.leaf.emissive.setHex(W.glow&&on?0x146a34:0);
    for(const [k] of DECOR)if(T.D[k])T.D[k].visible=T.s.d.includes(k); if(T.ready)school(T); };
  // the fish: one instanced school a kind (the shared swim of 141f), those that fit the water and your sea pets from the aquarium
  const fits=(k,W)=>!!k.salt===!!W.salt;
  // each fish its own way of swimming (owner, 10 Nov 2026): its kind's habit (cruising the length, shoaling, keeping by the wood or a stone, working the sand), its own pace, depth, laziness and place
  const BAND={cruise:[.35,.8],shoal:[.45,.85],hover:[.2,.6],bottom:[0,.1],wander:[.15,.85]};
  const soul=(T,f,w)=>{ f.kind=w.kind; if(f.b===w.b)return; f.b=w.b; const R=Math.random, B=BAND[f.b]||BAND.wander, a=T.anch[Math.floor(R()*T.anch.length)]; f.k=.75+R()*.5; f.lazy=R()*.45; f.d0=B[0]+R()*(B[1]-B[0])*.4; f.d1=f.d0+(B[1]-f.d0)*(.5+R()*.5); f.dir=R()<.5?1:-1; f.ax=a[0]+(R()-.5)*.2; f.az=a[1]+(R()-.5)*.1; f.rest=0; f.dart=0; };
  const pick=(T,f,x0,x1,z0,z1,yb,yt)=>{ const R=Math.random, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), yy=()=>yb+(yt-yb)*(f.d0+(f.d1-f.d0)*R()); f.rest=R()<f.lazy?1+R()*3:0;
    if(f.b==='cruise'&&R()<.8){ f.dir=-f.dir; f.tx=f.dir>0?x1-R()*(x1-x0)*.12:x0+R()*(x1-x0)*.12; f.tz=z0+(z1-z0)*(.25+.5*R()); f.ty=yy(); f.t=8+R()*8; }
    else if(f.b==='shoal'){ const S=T.shoal[f.kind]||(T.shoal[f.kind]={t:0,x:0,z:0,y:.5}); if(T.t>S.t){ S.t=T.t+4+R()*6; S.x=x0+R()*(x1-x0); S.z=z0+R()*(z1-z0); S.y=R(); } const r=.1+f.L; f.tx=cl(S.x+(R()-.5)*r*3,x0,x1); f.tz=cl(S.z+(R()-.5)*r*2,z0,z1); f.ty=yb+(yt-yb)*(f.d0+(f.d1-f.d0)*S.y)+(R()-.5)*r; f.t=1+R()*2; f.rest=0; }
    else if(f.b==='hover'&&R()<.85){ f.tx=cl(f.ax+(R()-.5)*.3,x0,x1); f.tz=cl(f.az+(R()-.5)*.24,z0,z1); f.ty=yy(); f.t=2+R()*5; }
    else if(f.b==='bottom'){ const d=.15+R()*.5, a=R()*6.28; f.tx=cl(f.x+Math.cos(a)*d,x0,x1); f.tz=cl(f.z+Math.sin(a)*d,z0,z1); f.ty=yb; f.t=2+R()*4; f.rest=R()<.6?1+R()*4:0; }
    else { f.t=3+R()*6; f.tx=x0+R()*(x1-x0); f.tz=z0+R()*(z1-z0); f.ty=yy(); } };
  const school=T=>{ if(!FISHES.school)return; const W=WATER[T.s.w], want=[];
    for(const k of KIND)if(fits(k,W))for(let i=0;i<(T.s.f[k.id]||0);i++)want.push({id:k.var&&FISHES.ids.includes(k.var[i%k.var.length])?k.var[i%k.var.length]:k.id,kind:k.id,b:k.b||'wander',L:k.L*(.82+hs(i,k.id.length)*.36),sp:k.sp});
    const g0=FISHES.len('goldfish',1)||1; for(const r of (PETS.sea?PETS.sea():[]).slice(0,24)){ const L0=FISHES.len(r.k,1); if(L0)want.push({id:r.k,kind:r.k,b:'wander',L:Math.min(.3,Math.max(.06,.1*Math.sqrt(L0/g0))),sp:.08,pet:1}); }
    const old=T.fish, out=[]; for(const w of want){ if(!T.sch[w.id]){ const im=FISHES.school(w.id,CAPS); if(!im)continue; T.tg.add(im); T.sch[w.id]={im,n:0}; }
      const j=old.findIndex(f=>f.id===w.id); let f; if(j>=0){ f=old.splice(j,1)[0]; f.L=w.L; f.sp=w.sp; soul(T,f,w); } else { const i=out.length; f={id:w.id,L:w.L,sp:w.sp,v:w.sp*.7,x:(hs(i,21)-.5)*T.SW*.7,z:(hs(i,22)-.5)*T.SD*.5,y:T.SH+.3+hs(i,23)*(T.WY-T.SH-.45),h:hs(i,24)*6.28,tx:0,ty:0,tz:0,t:0,ph:hs(i,25)*6.28,pt:0}; f.tx=f.x; f.ty=f.y; f.tz=f.z; soul(T,f,w); }
      if(T.sch[w.id].n++<CAPS)out.push(f); }
    for(const k in T.sch)T.sch[k].n=0; T.fish=out; };

  /* ---------- the water's physics: a height field (the wave equation, damped, walls reflecting) ---------- */
  const poke=(T,x,z,a,r)=>{ const dx=T.SW/(NX-1), dz=T.SD/(NZ-1), cx=(x+T.SW/2)/dx, cz=(z+T.SD/2)/dz, R=Math.ceil(r/dx)+1;
    for(let j=Math.max(0,Math.floor(cz-R));j<=Math.min(NZ-1,Math.ceil(cz+R));j++)for(let i=Math.max(0,Math.floor(cx-R));i<=Math.min(NX-1,Math.ceil(cx+R));i++){ const d2=((i-cx)*dx)**2+((j-cz)*dz)**2; if(d2<r*r*4)T.h[j*NX+i]-=a*Math.exp(-d2/(r*r)); } };
  const step=T=>{ const h=T.h, p=T.p, C=.22, Dm=.988; let E=0;
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ const k=j*NX+i, c=h[k], l=h[i?k-1:k], r=h[i<NX-1?k+1:k], u=h[j?k-NX:k], d=h[j<NZ-1?k+NX:k]; p[k]=(2*c-p[k]+C*(l+r+u+d-4*c))*Dm; E+=Math.abs(p[k]); }
    T.h=p; T.p=h; T.E=E/(NX*NZ); T.steps++; };
  const shape=T=>{ const h=T.h, g=T.surf.geometry, P=g.attributes.position, N=g.attributes.normal, dx=T.SW/(NX-1), dz=T.SD/(NZ-1), F=T.ftx.image.data;
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ const k=j*NX+i, l=h[i?k-1:k], r=h[i<NX-1?k+1:k], u=h[j?k-NX:k], d=h[j<NZ-1?k+NX:k], sx=(r-l)/(2*dx), sz=(d-u)/(2*dz), n=1/Math.hypot(sx,1,sz);
      P.setY(k,h[k]); N.setXYZ(k,-sx*n,n,-sz*n); F[k*4]=Math.max(0,Math.min(255,128-(l+r+u+d-4*h[k])*9000)); }
    P.needsUpdate=N.needsUpdate=true; T.ftx.needsUpdate=true; };

  /* ---------- each frame: the fish swim, the bubbles rise, the food falls, the surface moves ---------- */
  const Mx=new THREE.Matrix4(), Q=new THREE.Quaternion(), E3=new THREE.Euler(0,0,0,'XYZ'), Pv=new THREE.Vector3(), Sv=new THREE.Vector3();
  const tick=(T,dt)=>{ T.t+=dt; T.U.uT.value=T.t; T.U.uE.value=Math.min(1,T.E*400); const W2=T.SW/2, D2=T.SD/2, on=k=>T.s.d.includes(k);
    const up=T.fed>0?Math.min(1,T.fed/3,(30-T.fed)/.6):0; if(T.fed>0)T.fed-=dt;   // fed: they swim to the top and quicker, then settle back
    // the filter's return stirs one corner a little, always
    if(Math.random()<dt*6)poke(T,-W2+.12,D2-.1,.0012,.04);
    // bubbles: a stream from the bubbler, a burst when the chest's lid lifts; each breaks the surface where it reaches it
    if(on('bubbler')&&T.bubs.length<44&&Math.random()<dt*14){ const b=T.bubAt; T.bubs.push({x:b[0]+(Math.random()-.5)*.02,y:b[1],z:b[2]+(Math.random()-.5)*.02,r:.004+Math.random()*.008,ph:Math.random()*6}); }
    if(T.lid){ T.chestT-=dt; const o=T.chestT<0&&T.chestT>-2.5; T.lid.rotation.x+=((o&&on('chest')?.9:0)-T.lid.rotation.x)*Math.min(1,dt*3); if(o&&on('chest')&&T.bubs.length<46&&Math.random()<dt*10){ const c=T.chestAt; T.bubs.push({x:c[0]+(Math.random()-.5)*.08,y:c[1],z:c[2],r:.006+Math.random()*.01,ph:Math.random()*6}); } if(T.chestT<-2.5)T.chestT=10+Math.random()*8; }
    let nb=0; for(let i=T.bubs.length-1;i>=0;i--){ const b=T.bubs[i]; b.y+=(.18+b.r*14)*dt; b.ph+=dt*9; b.x+=Math.sin(b.ph)*.01*dt; if(b.y>=T.WY-b.r){ poke(T,b.x,b.z,.0005+b.r*.18,.035); T.bubs.splice(i,1); continue; }
      if(nb<48){ Mx.compose(Pv.set(b.x,b.y,b.z),Q.identity(),Sv.setScalar(b.r)); T.bub.setMatrixAt(nb++,Mx); } }
    T.bub.count=nb; T.bub.instanceMatrix.needsUpdate=true;
    // the food: floats a moment where it fell, then sinks and drifts, and is gone when a fish takes it or it lies on the sand a while
    let nf=0; for(let i=T.pel.length-1;i>=0;i--){ const q=T.pel[i]; q.t+=dt; if(q.t>1.4)q.y=Math.max(T.sandY(q.x,q.z)+.006,q.y-.035*dt); else q.y=T.WY-.004; q.x+=Math.sin(q.t*1.3+i)*.004*dt;
      if(q.t>40){ T.pel.splice(i,1); continue; } if(nf<16){ Mx.compose(Pv.set(q.x,q.y,q.z),Q.identity(),Sv.setScalar(.008)); T.food.setMatrixAt(nf++,Mx); } }
    T.food.count=nf; T.food.instanceMatrix.needsUpdate=true;
    // the fish: each wanders the tank (a new spot every few seconds), turns smoothly, keeps off the glass and its neighbours; fed, it rises and chases the food; at the top it breaks the surface
    for(const k in T.sch)T.sch[k].n=0;
    for(const f of T.fish){ const m=f.L*.55+.03, x0=-W2+m, x1=W2-m, z0=-D2+Math.min(m,D2*.8), z1=D2-Math.min(m,D2*.8), yb=T.sandY(f.x,f.z)+f.L*.22+.03, yt=T.WY-f.L*.18-.02; let sp=f.sp*f.k*(1+up*.8); f.t-=dt; if(f.rest>0&&!up){ f.rest-=dt; sp*=.08; } if(f.dart>0){ f.dart-=dt; sp*=2.6; } else if(Math.random()<dt*(f.b==='hover'?.09:.03))f.dart=.5;
      let tgt=null; if(T.pel.length&&up>0){ let bd=1e9; for(const q of T.pel){ const d=Math.hypot(q.x-f.x,q.y-f.y,q.z-f.z); if(d<bd){ bd=d; tgt=q; } } }
      if(tgt){ f.tx=tgt.x; f.ty=tgt.y; f.tz=tgt.z; sp*=1.4; if(Math.hypot(tgt.x-f.x,tgt.y-f.y,tgt.z-f.z)<f.L*.45){ T.pel.splice(T.pel.indexOf(tgt),1); if(tgt.y>T.WY-.03)poke(T,tgt.x,tgt.z,.003,.03); f.t=0; } }
      else if(f.t<=0||Math.hypot(f.tx-f.x,f.tz-f.z)<f.L*.6)pick(T,f,x0,x1,z0,z1,yb,yt);
      const ty=up>0&&!tgt?yt-.02:f.ty;
      const want=Math.atan2(-(f.tz-f.z),f.tx-f.x); let dh=Math.atan2(Math.sin(want-f.h),Math.cos(want-f.h)); f.h+=Math.max(-1.6*dt,Math.min(1.6*dt,dh)); f.v+=(sp*(Math.abs(dh)<1.2?1:.35)-f.v)*Math.min(1,dt*1.2);
      for(const o of T.fish){ if(o===f)continue; const ax=f.x-o.x, az=f.z-o.z, ay=f.y-o.y, d=Math.hypot(ax,ay,az), r=(f.L+o.L)*.42; if(d<r&&d>1e-4){ const k=(r-d)/r*dt*.5; f.x+=ax/d*k; f.z+=az/d*k; f.y+=ay/d*k*.5; } }
      f.x+=Math.cos(f.h)*f.v*dt; f.z-=Math.sin(f.h)*f.v*dt; if(f.x<x0||f.x>x1||f.z<z0||f.z>z1){ f.x=Math.max(x0,Math.min(x1,f.x)); f.z=Math.max(z0,Math.min(z1,f.z)); f.t=0; }
      const vy=(ty-f.y)*Math.min(1,dt*.8); f.y=Math.max(yb,Math.min(yt,f.y+vy)); f.pt+=(Math.max(-.4,Math.min(.4,vy/Math.max(dt,1e-3)/Math.max(f.v,.05)))-f.pt)*Math.min(1,dt*3);
      if(f.y>yt-.01&&f.v>.03&&Math.random()<dt*8)poke(T,f.x+Math.cos(f.h)*f.L*.4,f.z-Math.sin(f.h)*f.L*.4,.0015*f.v/.1,.03+f.L*.1);
      f.ph+=dt*(3+12*f.v);
      const S=T.sch[f.id]; if(!S||S.n>=CAPS)continue; const i=S.n++; E3.set(0,f.h,f.pt); Q.setFromEuler(E3); Mx.compose(Pv.set(f.x,f.y,f.z),Q,Sv.setScalar(f.L)); S.im.setMatrixAt(i,Mx); S.im.userData.sw.setXYZ(i,f.ph,.6+Math.min(1.4,f.v*2),S.im.userData.style); }
    for(const k in T.sch){ const S=T.sch[k]; S.im.count=S.n; S.im.instanceMatrix.needsUpdate=true; S.im.userData.sw.needsUpdate=true; }
    // the surface: stepped at 30 a second (at most three steps a frame), then shaped
    T.acc=Math.min(T.acc+dt,.1); let n=0; while(T.acc>=1/30){ T.acc-=1/30; step(T); n++; } if(n)shape(T); };

  /* ---------- feeding: a pinch of food lands on the water and the fish come up for it ---------- */
  const feed=T=>{ FORAGE.take('g_fishfood',1); if(FORAGE.draw)FORAGE.draw(); T.fed=30; if(SFX)SFX.play('click',{vol:.3,vary:.2});
    const cx=(Math.random()-.5)*T.SW*.5, cz=-T.SD*.15+(Math.random()-.5)*T.SD*.3; for(let i=0;i<12;i++){ const x=cx+(Math.random()-.5)*.25, z=cz+(Math.random()-.5)*.18; T.pel.push({x,y:T.WY,z,t:Math.random()*.4}); poke(T,x,z,.004,.025); }
    SAY('YOU SHAKE IN A PINCH OF FOOD. THE FISH RISE AND SNAP IT UP.','#c8e8f0'); };
  ROOMK.wires.tank=(un,c)=>{ const T=TANKS.find(q=>q.g===un.obj); if(!T)return; T.id=un.id;
    c.hit(un,()=>FORAGE.has('g_fishfood')?'FEED THE FISH':'THE FISH TANK',()=>{ if(FORAGE.has('g_fishfood'))return feed(T); TANKV.open(T); }); };

  /* ---------- the close look: the camera before the tank's glass, and its settings beside it ---------- */
  let V=null, P=null;
  const TANKV=window.TANKV={on:()=>!!V};
  const css=`#tankp{position:fixed;right:14px;top:50%;transform:translateY(-50%);z-index:22;width:min(300px,92vw);max-height:90vh;overflow:auto;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13ee;border:2px solid #3a3f4e;zoom:var(--uiz,1)}
    #tankp h4{margin:10px 0 4px;color:#7d8aa0;font:inherit}#tankp button{font:inherit;color:#d8dae2;background:#1a1d27;border:1px solid #3a3f4e;padding:3px 6px;margin:2px;cursor:pointer}#tankp button.on{background:#2c4a5a!important;border-color:#7fd0ff!important;color:#fff!important}
    #tankp button:disabled{opacity:.35;cursor:default}#tankp .row{display:flex;align-items:center;justify-content:space-between}#tankp .sw,#tankp .sw.on{width:18px;height:18px;padding:0;background:var(--c)!important}#tankp .sw.on{outline:2px solid #fff}`;
  const draw=()=>{ '@later'; if(!P||!V)return; const T=V.T, s=T.s, W=WATER[s.w], guest=ROOMK.guest&&ROOMK.guest(), dis=guest?' disabled':'', n=Object.values(s.f).reduce((a,b)=>a+b,0), food=FORAGE.has('g_fishfood');
    P.innerHTML=`<div class="row"><b style="color:#f2c14e">THE FISH TANK</b><button data-a="x">X</button></div>`+(guest?'<div style="color:#c8a090;margin-top:6px">SOMEONE ELSE\'S TANK: YOU CAN LOOK.</div>':'')+
      '<h4>WATER</h4>'+Object.keys(WATER).map(k=>`<button data-a="w:${k}" class="${s.w===k?'on':''}"${dis}>${WATER[k].n}</button>`).join('')+
      '<h4>DECOR</h4>'+DECOR.map(([k,nm])=>`<button data-a="d:${k}" class="${s.d.includes(k)?'on':''}"${dis}>${nm}</button>`).join('')+
      `<h4>FISH (${n} OF ${MAXF})</h4>`+KIND.map(k=>{ const ok=fits(k,W), c=s.f[k.id]||0; return `<div class="row" style="opacity:${ok?1:.45}"><span>${k.n} <i style="color:#7d7a70">${k.salt?'SALT':'FRESH'}</i></span><span><button data-a="f:${k.id}:-1"${dis||(!c?' disabled':'')}>-</button> ${c} <button data-a="f:${k.id}:1"${dis||(!ok||n>=MAXF||c>=8?' disabled':'')}>+</button></span></div>`; }).join('')+
      (PETS.sea&&PETS.sea().length?`<div style="color:#7d7a70;margin-top:4px">AND YOUR ${PETS.sea().length} FROM THE AQUARIUM</div>`:'')+
      '<h4>LIGHT</h4>'+`<button data-a="l:on" class="${s.l.on?'on':''}"${dis}>${s.l.on?'ON':'OFF'}</button>`+Object.keys(LIGHTC).map(k=>`<button class="sw ${s.l.c===k?'on':''}" data-a="l:c:${k}" title="${k.toUpperCase()}" style="--c:${LIGHTC[k]}"${dis}></button>`).join('')+
      (food&&!guest?'<div style="margin-top:10px"><button data-a="feed">FEED THE FISH</button></div>':'')+'<div style="color:#7d7a70;margin-top:10px">ESC TO STEP BACK</div>'; };
  const act=a=>{ '@later'; if(!V)return; const T=V.T, s=JSON.parse(JSON.stringify(T.s)), [k,x,y]=a.split(':');
    if(k==='x')return TANKV.close(); if(k==='feed'){ if(FORAGE.has('g_fishfood'))feed(T); return draw(); } if(ROOMK.guest&&ROOMK.guest())return;
    if(k==='w')s.w=x; if(k==='d')s.d=s.d.includes(x)?s.d.filter(q=>q!==x):s.d.concat(x); if(k==='f'){ const n=Object.values(s.f).reduce((a,b)=>a+b,0), d=+y; if(d<0||n<MAXF)s.f[x]=Math.max(0,Math.min(8,(s.f[x]||0)+d)); if(!s.f[x])delete s.f[x]; }
    if(k==='l'){ if(x==='on')s.l.on=s.l.on?0:1; else s.l.c=y; }
    apply(T,s); if(SFX)SFX.play('click',{vol:.25,vary:.2}); if(ROOMK.save)ROOMK.save(); draw(); };
  TANKV.open=T=>{ '@later'; if(V)TANKV.close(); if(!P){ const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st); P=document.createElement('div'); P.id='tankp'; document.body.appendChild(P);
      P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b&&!b.disabled)act(b.dataset.a); }); for(const ev of ['pointerdown','dblclick','wheel'])P.addEventListener(ev,e=>e.stopPropagation()); }
    V={T,view0:UI.view,x:pos.x,z:pos.z,t0:performance.now(),fp:UI.persp?SHARED.cam.position.clone():null,fq:SHARED.cam.quaternion.clone()}; if(!(VR&&VR.on)){ if(!UI.persp)UI.setView('third'); UI.holdCam='tank'; } P.hidden=false; draw(); };
  TANKV.close=()=>{ if(!V)return; const v0=V.view0; V=null; if(P)P.hidden=true; if(UI.holdCam==='tank'){ UI.holdCam=null; if(v0&&UI.view!==v0)UI.setView(v0); } };
  TANKV.act=a=>act(a);
  addEventListener('keydown',e=>{ if(V&&e.key==='Escape'){ e.stopPropagation(); e.preventDefault(); TANKV.close(); } },true);
  const LK=new THREE.Matrix4(), QT=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), CA=new THREE.Vector3(), CB=new THREE.Vector3();
  SYS.add('cam',dt=>{ if(!V)return; const T=V.T; if(!T.g.parent||!T.g.visible||Math.hypot(pos.x-V.x,pos.z-V.z)>3*(T.g.parent.scale.x||1)){ TANKV.close(); return; } if(UI.holdCam!=='tank')return; const cam=SHARED.cam; if(!cam||!cam.isPerspectiveCamera)return;
    if(!V.fp){ V.fp=cam.position.clone(); V.fq=cam.quaternion.clone(); } const s=Math.min(1,(performance.now()-V.t0)/800), e=s*s*(3-2*s), th=Math.tan(cam.fov*Math.PI/360)*cam.aspect, d=Math.max(1.6,T.TW*.78/th), ym=T.SH+T.TH*.5;
    T.tg.localToWorld(CA.set(-T.TW*.26,ym,0)); T.tg.localToWorld(CB.set(-T.TW*.26,ym+.25,-T.TD/2-d)); LK.lookAt(CB,CA,UP); QT.setFromRotationMatrix(LK);   // aimed right of the tank's middle, so it shows left of the settings
    cam.position.lerpVectors(V.fp,CB,e); cam.quaternion.slerpQuaternions(V.fq,QT,e); cam.updateMatrixWorld(); if(W3.group)W3.group.visible=false; },'150k-tankview');
  ROOMK.keep.push({ out:(L)=>{ const o={}; for(const T of TANKS)if(T.g.parent&&T.id)o[T.id]=T.s; if(Object.keys(o).length)L.tanks=o; },
    in:(L)=>{ for(const T of TANKS)if(T.g.parent&&T.id)apply(T,L.tanks&&L.tanks[T.id]||DEF); if(V)draw(); } });
  SYS.add('life',dt=>{ for(let k=TANKS.length-1;k>=0;k--){ const T=TANKS[k]; if(!T.g.parent){ TANKS.splice(k,1); continue; } if(!T.g.visible)continue; tick(T,Math.min(dt,.1)); } },'150k-fishtank'); }
