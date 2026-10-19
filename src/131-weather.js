const WX={hold:null,now:null};
{ const hsh=(i,s)=>{ let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const noise=(t,s,oct=2)=>{ let v=0,a=1,n=0; for(let o=0;o<oct;o++){ const i=Math.floor(t), f=t-i, u=f*f*(3-2*f); v+=a*(hsh(i,s+o*7)*(1-u)+hsh(i+1,s+o*7)*u); n+=a; a*=.5; t=t*2.1+11.7; } return v/n; };
  const cl=v=>Math.max(0,Math.min(1,v)), st=(n,k)=>cl((n-.5)*k+.5);
  const T=()=>Math.floor(Date.now()/86400000)*1440+CLOCK.h*60;
  WX.at=T=>{ const h=(T%1440+1440)%1440/60, dew=t=>{ const hh=(t%1440+1440)%1440/60; return hh<7||hh>21?.12:hh<10?.12*(10-hh)/3:hh>18?.12*(hh-18)/3:0; };
    const pres=t=>st(noise(t/2600,11,3),1.6), moist=t=>cl(st(noise(t/1900,23,3),1.6)*.85+dew(t)), p=pres(T), dp=(pres(T+60)-pres(T-60))*8;
    const cloudAt=t=>cl(moist(t)*1.4-pres(t)*1.0+st(noise(t/400,37,2),1.2)*.45-.12), cloud=(cloudAt(T-30)+cloudAt(T-60)+cloudAt(T-90))/3;
    const rainAt=t=>cl((cloudAt(t)-.7)*3.5)*cl((moist(t)-.5)*3), fall=rainAt(T-15), storm=fall>.5&&p<.22?cl((.22-p)*6*fall):0;
    const cold=st(noise(T/4300,71,2),1.6)<.12;
    const wind=cl(Math.abs(dp)*.9+st(noise(T/700,47,2),1.3)*.5-.2+noise(T/9,53,3)*.25*Math.abs(dp)+storm*.3), dir=noise(T/3000,41,2)*Math.PI*2;
    const night=h<6||h>20?1:h<8?(8-h)/2:h>18?(h-18)/2:0, fog=cl((moist(T)-.6)*3.5)*cl(1-wind*1.6)*(.3+.7*night)*(1-fall);
    return {cloud,rain:cold?0:fall,snow:cold?fall:0,storm,wind,dir,fog,flash:storm>0&&hsh(Math.floor(T*10/7),61)<storm*.15}; };
  const HOLDS={CLEAR:{cloud:.08,rain:0,snow:0,storm:0,wind:.15,dir:1,fog:0},CLOUDY:{cloud:.85,rain:0,snow:0,storm:0,wind:.35,dir:1,fog:0},RAIN:{cloud:.95,rain:.7,snow:0,storm:0,wind:.4,dir:1,fog:0},
    STORM:{cloud:1,rain:1,snow:0,storm:.8,wind:.9,dir:1,fog:0},SNOW:{cloud:.9,rain:0,snow:.7,storm:0,wind:.2,dir:1,fog:0},FOG:{cloud:.6,rain:0,snow:0,storm:0,wind:0,dir:1,fog:.7}};
  WX.hold='CLOUDY'; { const q=QS.get('wx'); if(q&&q.toUpperCase()==='NATURAL')WX.hold=null; else if(q&&HOLDS[q.toUpperCase()])WX.hold=q.toUpperCase(); else { const v=SAVE.get('wx'); if(v==='NATURAL')WX.hold=null; else if(v&&HOLDS[v])WX.hold=v; } }
  const ph=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); }, geos=[], ends=[]; let vc=0;
  for(let n=0;n<80;n++){ const ang=ph(n,1,2)*Math.PI*2, dist=(55+ph(n,3,4)*(n<40?75:190))*TILE, cx=Math.sin(ang)*dist, cz=Math.cos(ang)*dist, cy=(7+ph(n,5,6)*7)*TILE, w=(7+ph(n,7,8)*10)*TILE;
    for(let k=0;k<12;k++){ const u=ph(n,k,9)-.5, v=ph(n,k,10)-.5, r=w*(.22+.18*(1-Math.abs(u)*2)*ph(n,k,11)), g=new THREE.IcosahedronGeometry(r,0);
      g.scale(1,.75,1); const P=g.attributes.position; for(let i=0;i<P.count;i++)if(P.getY(i)<-r*.15)P.setY(i,-r*.15);
      g.translate(cx+u*w*1.6,cy+r*.3+(1-Math.abs(u)*2)*w*.18,cz+v*w*.7); geos.push(g); vc+=P.count; }
    ends.push(vc); }
  const CP=new Float32Array(vc*3); { let o=0; for(const g of geos){ CP.set(g.attributes.position.array,o); o+=g.attributes.position.array.length; } }
  const cg=new THREE.BufferGeometry(); cg.setAttribute('position',new THREE.BufferAttribute(CP,3)); cg.computeVertexNormals();
  const cmat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x2a3346,fog:false});
  const CU={uCF:{value:new THREE.Vector3(0,0,1)},uCO:{value:new THREE.Vector3()},uUnder:{value:new THREE.Color(0,0,0)},uCM:{value:new THREE.Vector4(0,0,0,0)}}; WX.cloudMist=c=>{ CU.uCM.value.set(c.r,c.g,c.b,.5); mistT=2; }; let mistT=0; WX.under=CU.uUnder;
  cmat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,CU); sh.vertexShader='varying vec3 vCW; varying float vCD;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vCW=(modelMatrix*vec4(transformed,1.)).xyz; vCD=clamp(-(modelMatrix*vec4(normal,0.)).y*1.6,0.,1.);');
    sh.fragmentShader='varying vec3 vCW; varying float vCD; uniform vec3 uCF,uCO,uUnder; uniform vec4 uCM;\n'+sh.fragmentShader.replace('void main() {','void main() { if(dot(vCW.xz-uCO.xz,uCF.xz)<12.) discard;').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n reflectedLight.indirectDiffuse+=uUnder*vCD;').replace('#include <dithering_fragment>','#include <dithering_fragment>\n gl_FragColor.rgb=mix(gl_FragColor.rgb,uCM.rgb,uCM.a);'); };
  WX.cloudCut=()=>{ if(mistT>0&&--mistT<=0)CU.uCM.value.w=0; const f=new THREE.Vector3(); cam.getWorldDirection(f); f.y=0; if(f.lengthSq()<1e-6)f.set(0,0,1); f.normalize(); CU.uCF.value.copy(f); CU.uCO.value.set(pos.x,0,pos.z); };
  const CL=new THREE.Mesh(cg,cmat); CL.frustumCulled=false; scene.add(CL); WX.clouds=CL;
  const CSPH=[]; { let a=0; for(const b of ends){ const Bx=new THREE.Box3(); for(let i=a;i<b;i++)Bx.expandByPoint(new THREE.Vector3().fromBufferAttribute(cg.attributes.position,i)); CSPH.push(Bx.getBoundingSphere(new THREE.Sphere())); a=b; } }
  const CSEE=n=>{ const f=CU.uCF.value, o=CL.position; return CULL.seen(CSPH.slice(0,n),o,S=>(S.center.x+o.x-pos.x)*f.x+(S.center.z+o.z-pos.z)*f.z+S.radius<12); };
  const NR=1800, RB=16*TILE, RH=14*TILE, rp=new Float32Array(NR*6), rs=new Float32Array(NR*3); for(let i=0;i<NR;i++){ rs[i*3]=(Math.random()-.5)*2*RB; rs[i*3+1]=Math.random()*RH; rs[i*3+2]=(Math.random()-.5)*2*RB; }
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(rp,3).setUsage(THREE.DynamicDrawUsage));
  const RAIN=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xaec4e0,transparent:true,opacity:.55,depthWrite:false})); RAIN.frustumCulled=false; scene.add(RAIN);
  const NS=1400, sp=new Float32Array(NS*3), ss=new Float32Array(NS*4); for(let i=0;i<NS;i++){ ss[i*4]=(Math.random()-.5)*2*RB; ss[i*4+1]=Math.random()*RH; ss[i*4+2]=(Math.random()-.5)*2*RB; ss[i*4+3]=Math.random()*6.28; }
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3).setUsage(THREE.DynamicDrawUsage));
  const SNOW=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false})); SNOW.frustumCulled=false; scene.add(SNOW);
  const FOG=new THREE.Fog(0x9aa3ad,2,200), cA=new THREE.Color(), cB=new THREE.Color(); let flashT=0, last=0, ft=0;
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt);
    if((ft-=dt)<=0){ ft=.5; WX.now=WX.hold?Object.assign({flash:WX.hold==='STORM'&&Math.random()<.04},HOLDS[WX.hold]):WX.at(T()); }
    const W=WX.now, up=LVL!=='down', inside=!OUT.open, day=cl((CLOCK.elev()+4)/14), t=performance.now()/1000;
    WX.cloudCut(); const show=Math.round(6+W.cloud*74); CL.geometry.setDrawRange(0,ends[Math.min(79,show-1)]);
    cmat.color.setRGB(1,1,1).multiplyScalar(1-.35*W.rain-.35*W.storm); cmat.emissive.setRGB(.16,.2,.27).multiplyScalar(.4+.6*day);
    CL.position.set(pos.x+((t*(.3+W.wind*1.5)*TILE)%(40*TILE)),0,pos.z); CL.visible=up&&CSEE(Math.min(80,show));
    if(up){ scene.background.lerp(cA.setRGB(.55,.58,.62).multiplyScalar(.25+.75*day),cl(W.cloud*W.cloud*.85)); if(W.storm)scene.background.multiplyScalar(1-.45*W.storm);
      CLOCK.sun.intensity*=1-.72*cl((W.cloud-.2)/.8); }
    if(W.flash&&flashT<=0)flashT=.14; if(flashT>0){ flashT-=dt; if(up){ scene.background.setRGB(.85,.88,.95); HEMI.intensity+=2.5; } }
    if(typeof PARK!=='undefined'&&PARK.windK)PARK.windK.value=.35+1.6*W.wind;
    if(up&&!inside&&W.fog>.02){ scene.fog=FOG; FOG.color.setRGB(.7,.72,.74).multiplyScalar(.15+.85*day).lerp(scene.background,.25); FOG.near=2*TILE; FOG.far=(11+70*Math.pow(1-W.fog,2))*TILE; scene.background.lerp(FOG.color,cl(W.fog*1.3)); } else if(scene.fog===FOG)scene.fog=null;
    const wx=Math.cos(W.dir)*W.wind*5*TILE, wz=Math.sin(W.dir)*W.wind*5*TILE;
    const nr=inside?0:Math.round(NR*W.rain); RAIN.visible=nr>0; if(nr){ const v=14*TILE, L=.45*TILE, sx=wx/v*L, sz=wz/v*L; for(let i=0;i<nr;i++){ let y=rs[i*3+1]-v*dt; if(y<0)y+=RH; rs[i*3+1]=y;
        const x=((rs[i*3]+wx*t/4)%(2*RB)+3*RB)%(2*RB)-RB+pos.x, z=((rs[i*3+2]+wz*t/4)%(2*RB)+3*RB)%(2*RB)-RB+pos.z, gy=py+y; rp.set([x,gy,z,x-sx,gy+L,z-sz],i*6); }
      rg.setDrawRange(0,nr*2); rg.attributes.position.needsUpdate=true; RAIN.material.opacity=.4+.25*day; }
    const ns=inside?0:Math.round(NS*W.snow); SNOW.visible=ns>0; if(ns){ for(let i=0;i<ns;i++){ let y=ss[i*4+1]-1.1*TILE*dt; if(y<0)y+=RH; ss[i*4+1]=y; const a=ss[i*4+3]+t*.8;
        const x=((ss[i*4]+wx*t/3+Math.sin(a)*.4*TILE)%(2*RB)+3*RB)%(2*RB)-RB+pos.x, z=((ss[i*4+2]+wz*t/3+Math.cos(a*.7)*.4*TILE)%(2*RB)+3*RB)%(2*RB)-RB+pos.z; sp.set([x,py+y,z],i*3); }
      sg.setDrawRange(0,ns); sg.attributes.position.needsUpdate=true; } };
  const pane=document.querySelector('#menu [data-p="atmo"]')||document.querySelector('#menu [data-p="display"]'), box=document.createElement('div');
  box.innerHTML='<h3>WEATHER</h3><div class="row" id="wxrow"></div><div class="dim" id="wxnow"></div>'; pane.insertBefore(box,pane.children[1]||null);
  const row=box.querySelector('#wxrow'), draw=()=>{ row.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.wx||null)===WX.hold))); const W=WX.now; if(W)box.querySelector('#wxnow').textContent=W.storm>.1?'A STORM':W.snow>.05?'SNOW':W.rain>.05?'RAIN':W.fog>.2?'FOG':W.cloud>.7?'OVERCAST':W.cloud>.35?'SOME CLOUD':'CLEAR'; };
  for(const k of ['NATURAL',...Object.keys(HOLDS)]){ const b=document.createElement('button'); b.className='btn'; b.textContent=k; if(k!=='NATURAL')b.dataset.wx=k; b.onclick=()=>{ WX.hold=k==='NATURAL'?null:k; ft=0; draw(); try{ SAVE.set('wx',k); }catch(e){} }; row.appendChild(b); }
  WX.draw=draw; window.WX=WX; setInterval(()=>{ if(UI.menuOpen)draw(); },1000); window.WXDBG=()=>WX.now; }
