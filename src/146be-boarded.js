// BOARDED UP: the holodeck's zombie siege, for one, two on one screen, or two online (a host runs the dead and a partner near them joins through the section's server: t 'bu'); its own canvas and renderer over the page while it runs, its models polyfork's, fetched when first run; in a headset the game's own renderer draws its scene (SHARED.drive.scene), the right controller aims
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, VR} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer} from './004-main.js';
import {STORE} from './006-map-pre.js';
const BOARDED={on:false,api:null}; window.BOARDED=BOARDED;
{ const H=STORE.holo; let host=null, shadow=null, making=null;
  const CSS=`#wrap{position:fixed;inset:0;background:#000;overflow:hidden;font-family:system-ui,sans-serif;color:#ddd;user-select:none}
#c{position:fixed;inset:0;width:100%;height:100%;display:block}
.hud{position:fixed;top:0;bottom:0;pointer-events:none;overflow:hidden;display:none}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.72) 100%)}
.dmg{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(150,0,0,.85) 100%);opacity:0}
.cross{position:absolute;left:50%;top:50%}
.cross i{position:absolute;background:#e8e8e8;box-shadow:0 0 2px #000}
.hm{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(45deg);font:700 26px system-ui;color:#fff;opacity:0;text-shadow:0 0 3px #000}
.ret{position:absolute;width:22px;height:22px;margin:-12px;border:2px solid #e33;border-radius:50%;display:none;box-shadow:0 0 4px #000}
.prompt{position:absolute;left:0;right:0;top:62%;text-align:center;font:600 17px system-ui;text-shadow:0 1px 3px #000,0 0 8px #000}
.bar{position:absolute;left:50%;top:67%;width:160px;height:6px;margin-left:-80px;background:rgba(0,0,0,.6);display:none}
.bar b{display:block;height:100%;width:0;background:#e6c060}
.pts{position:absolute;right:22px;bottom:86px;font:700 26px Impact,'Arial Narrow',sans-serif;color:#f0d890;text-shadow:0 2px 4px #000;text-align:right}
.ammo{position:absolute;right:22px;bottom:22px;text-align:right;text-shadow:0 2px 4px #000}
.ammo .wn{display:block;font:600 13px system-ui;letter-spacing:.12em;color:#bbb}
.ammo .am{font:700 40px Impact,'Arial Narrow',sans-serif;color:#fff}
.ammo .am small{font-size:22px;color:#aaa}
.pop{position:absolute;right:120px;bottom:92px}
.pop span{position:absolute;right:0;bottom:0;font:700 18px Impact,sans-serif;color:#ffe08a;animation:pop .9s ease-out forwards;white-space:nowrap}
@keyframes pop{to{transform:translate(-40px,-50px);opacity:0}}
.down{position:absolute;left:0;right:0;top:34%;text-align:center;font:700 34px Impact,sans-serif;color:#d22;text-shadow:0 2px 6px #000;display:none}
.tag{position:absolute;left:14px;top:10px;font:700 14px system-ui;letter-spacing:.15em;color:rgba(255,255,255,.55)}
.pw{position:absolute;left:0;right:0;bottom:22px;text-align:center;font:700 16px Impact,sans-serif;letter-spacing:.1em;color:#8f8}
#round{position:fixed;left:22px;bottom:14px;font:700 78px Impact,'Arial Narrow',sans-serif;color:#a00;text-shadow:0 0 12px #300,0 3px 4px #000;pointer-events:none;display:none}
#banner{position:fixed;left:0;right:0;top:20%;text-align:center;font:700 64px Impact,'Arial Narrow',sans-serif;color:#b00;text-shadow:0 0 22px #400,0 3px 6px #000;letter-spacing:.08em;opacity:0;transition:opacity .8s;pointer-events:none}
#split{position:fixed;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:#000;display:none}
.ov{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.4);text-align:center;text-shadow:0 1px 4px #000}
.ov h1{font:700 clamp(54px,11vw,130px) Impact,'Arial Narrow',sans-serif;margin:0;color:#b10c0c;letter-spacing:.04em;text-shadow:0 0 30px #500,0 4px 0 #300}
.ov h2{font:700 44px Impact,sans-serif;margin:0 0 10px;color:#c22}
.ov p{margin:6px 0 22px;color:#bbb;max-width:640px;line-height:1.5}
.ov button{font:700 22px Impact,'Arial Narrow',sans-serif;letter-spacing:.1em;margin:6px;padding:12px 34px;background:#1a1a1a;color:#eee;border:2px solid #a11;cursor:pointer}
.ov button:hover{background:#a11}
.keys{display:grid;grid-template-columns:auto auto auto;gap:4px 22px;font-size:13px;color:#aaa;margin-top:22px;text-align:left}
.keys b{color:#ddd}
.keys .h{color:#c33;font-weight:700;letter-spacing:.1em}
#pause,#over{display:none}
#credit{position:fixed;right:10px;top:8px;font-size:11px;color:rgba(255,255,255,.4);pointer-events:none}
.ov button:disabled{opacity:.35;cursor:default}`;
  const HTML=`<canvas id="c"></canvas>
<div id="huds"></div>
<div id="split"></div>
<div id="round"></div>
<div id="banner"></div>
<div class="ov" id="menu">
<h1>BOARDED UP</h1>
<p>Night one. The mansion is all you have. They come through the windows and the front door: board them up, hold the hall, fall back up the stairs, last as long as you can. A way in with no boards left is a way out for you too.</p>
<div><button id="b1" disabled>SOLO</button><button id="b2" disabled>2 PLAYERS, ONE SCREEN</button><button id="bhost" disabled>HOST ONLINE</button><button id="bjoin" style="display:none">JOIN</button><button id="bleave">LEAVE THE HOLODECK</button></div>
<p id="netnote" style="font-size:13px;margin:8px 0 0;color:#8f8"></p>
<p id="load" style="font-size:13px;margin:8px 0 0;color:#e6c060">LOADING</p>
<p id="padnote" style="font-size:13px;margin-top:10px"></p>
<div class="keys">
<span class="h">&nbsp;</span><span class="h">PLAYER 1</span><span class="h">PLAYER 2 (PAD / KEYS)</span>
<b>Move</b><span>W A S D</span><span>Left stick / Arrows</span>
<b>Look</b><span>Mouse</span><span>Right stick / auto-aim</span>
<b>Fire / Aim</b><span>Left / Right click</span><span>RT / LT &middot; Enter</span>
<b>Use (board, buy, revive)</b><span>F</span><span>A &middot; Right Shift</span>
<b>Reload / Swap</b><span>R / Q</span><span>X / Y &middot; Right Ctrl / &rsquo;</span>
<b>Knife / Sprint</b><span>E / Shift</span><span>B / LB &middot; / (slash)</span>
<b>View (1st, 3rd, isometric)</b><span>V</span><span>RB</span>
</div>
</div>
<div id="credit">Models: Polyfork (polyfork.dev)</div>
<div class="ov" id="pause"><h2>PAUSED</h2><button id="bres">RESUME</button><button id="bquit">QUIT</button></div>
<div class="ov" id="over"><h2>THE HOUSE FELL</h2><p id="stats"></p><button id="bagain">AGAIN</button><button id="bmenu">MENU</button></div>`;
  const MAKE=()=>{ '@boarded'; return (async()=>{
    const $=s=>shadow.querySelector(s),TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
    const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
    const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),LOW=/buq=low/.test(location.search);

    const PF='https://polyfork.dev/cdn/',A={},PFID={zteen:'teen-zombie-b5bb27',zghoul:'shambling-ghoul-256f2f',cop:'police-officer-1cc379',sheriff:'sheriff-986181',pistol:'pistol-42de05',smg:'sidearm-f35bb5',rifle:'rifle-df1815',shotgun:'bolt-action-rifle-2f1793',
      oak:'twisted-dead-oak-49457b',dtree:'dead-tree-6795fa',cotton:'dead-cottonwood-edbde8',stone:'carved-headstone-09d9f8',mound:'grave-mound-169ec3',angel:'weeping-stone-angel-644ce3',fence:'wrought-iron-cemetery-fence-f1a113',drum:'oil-drum-386c30',
      hearse:'vintage-hearse-3b2ec1',towncar:'town-car-56eeb6',hatch:'compact-hatchback-386417',barricade:'police-barricade-0bbf37',sandbag:'sandbag-wall-section-7075ee',crawler:'skeleton-crawling-out-of-24b6ae',chand:'crystal-chandelier-55d279',sofa:'sofa-9c0e7e',
      chair:'velvet-tub-chair-b0b5f8',table:'fonda-long-table-e4aff2',dchair:'gilt-chiavari-chair-f62c19',bookcase:'alcove-bookcase-83894d',piano:'lounge-grand-piano-e98c92',crate:'timber-crate-ba0739',armour:'armour-stand-3d77c4',house:'haunted-victorian-house-886931',
      stairs:'grand-marble-staircase-dcff4d',candle:'brass-candelabra-89ab76',tomb:'family-mausoleum-4cc14c'};
    const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),{clone:skClone}=await import('three/addons/utils/SkeletonUtils.js');
    {const L=new GLTFLoader(),ks=Object.keys(PFID),note=$('#load');let n=0;
      await Promise.all(ks.map(k=>L.loadAsync(PF+PFID[k]+'.glb').then(g=>{A[k]=g;g.scene.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true})},()=>{}).finally(()=>note.textContent='LOADING MODELS '+(++n)+' / '+ks.length)));
      note.textContent='BUILDING THE MANSION'}
    const EV=[],on=(t,e,f)=>{const k=/^key/.test(e);EV.push([t,e,k?ev=>{ev.stopImmediatePropagation();f(ev)}:f,k])};
    function hash(x,y,s){let h=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1274126177)|0;h=Math.imul(h^(h>>>13),1103515245);return((h^(h>>>16))>>>0)/4294967296}
    function vn(x,y,s,wx,wy){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),X=a=>wx?((a%wx)+wx)%wx:a,Y=a=>wy?((a%wy)+wy)%wy:a;
      const a=hash(X(xi),Y(yi),s),b=hash(X(xi+1),Y(yi),s),c=hash(X(xi),Y(yi+1),s),d=hash(X(xi+1),Y(yi+1),s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
    function fbm(x,y,s,o=4,wx=0,wy=0){let v=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){v+=a*vn(x*f,y*f,s+i*17,wx*f,wy*f);n+=a;a*=.5;f*=2}return v/n}

    function texOf(c,srgb){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t}
    function makeTex(N,fn,bump=2){
      const mk=()=>{const c=document.createElement('canvas');c.width=c.height=N;return c},cc=mk(),nc=mk(),rc=mk();
      const cx=cc.getContext('2d'),nx=nc.getContext('2d'),rx=rc.getContext('2d'),ci=cx.createImageData(N,N),ni=nx.createImageData(N,N),ri=rx.createImageData(N,N),H=new Float32Array(N*N),o=[0,0,0,0,0];
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,k=i*4;fn(x/N,y/N,o);ci.data[k]=o[0];ci.data[k+1]=o[1];ci.data[k+2]=o[2];ci.data[k+3]=255;H[i]=o[3];ri.data[k]=0;ri.data[k+1]=clamp(o[4],0,1)*255;ri.data[k+2]=0;ri.data[k+3]=255}
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=(y*N+x)*4,l=H[y*N+(x+N-1)%N],r=H[y*N+(x+1)%N],u=H[((y+N-1)%N)*N+x],d=H[((y+1)%N)*N+x];
        const ax=(l-r)*bump*8,ay=(d-u)*bump*8,il=1/Math.hypot(ax,ay,1);ni.data[k]=(ax*il*.5+.5)*255;ni.data[k+1]=(ay*il*.5+.5)*255;ni.data[k+2]=(il*.5+.5)*255;ni.data[k+3]=255}
      cx.putImageData(ci,0,0);nx.putImageData(ni,0,0);rx.putImageData(ri,0,0);
      return{map:texOf(cc,1),normalMap:texOf(nc),roughnessMap:texOf(rc),canvas:cc}}
    const set=(o,r,g,b,k,h,ro)=>{o[0]=r*k;o[1]=g*k;o[2]=b*k;o[3]=h;o[4]=ro};
    const cloth=(r,g,b,seed,blood)=>makeTex(256,(u,v,o)=>{const w=(Math.sin(u*TAU*24)*.5+.5)*(Math.sin(v*TAU*24)*.5+.5),n=fbm(u*8,v*8,seed,4,8,8),bl=blood&&fbm(u*4,v*4,seed+7,4,4,4)>.6,dirt=fbm(u*3,v*3,seed+9,3,3,3);
      bl?set(o,74,8,8,.6+.6*n,.4,.35):set(o,r,g,b,(.55+.6*n)*(blood?.5+.7*dirt:1),w*.15+n*.85,.95)},1);
    const TX={
      floor:makeTex(512,(u,v,o)=>{const R=10,r=Math.floor(v*R),fv=v*R-r,off=hash(r,7,1),bu=u*2+off,b=Math.floor(bu),fu=bu-b,tone=hash(b&1,r,3),g=fbm(u*3+off*5,v*90,5,4,3,90),w=fbm(u*4,v*4,9,3,4,4),gap=fv<.04||fu<.006;
        set(o,118,78,46,gap?.2:(.6+.45*tone)*(.7+.6*g)*(.7+.6*w),gap?0:.6+.4*g,.5+.35*g)}),
      tile:makeTex(512,(u,v,o)=>{const a=u*4,b=v*4,ia=Math.floor(a),ib=Math.floor(b),gr=a-ia<.03||b-ib<.03,n=fbm(u*8,v*8,21,4,8,8),d=fbm(u*3,v*3,22,3,3,3),k=(.75+.35*n)*(.55+.7*d);
        gr?set(o,60,56,50,k,0,.9):(ia+ib)&1?set(o,52,74,66,k,.8+.1*n,.25+.5*d):set(o,190,182,160,k,.8+.1*n,.25+.5*d)}),
      wall:makeTex(512,(u,v,o)=>{const s=Math.floor(u*8)&1,n=fbm(u*6,v*6,31,5,6,6),st=fbm(u*2,v*2,33,3,2,2),f=fbm(u*60,v*60,35,2,60,60),mu=(u*8%1)-.5,mv=(v*8%1)-.5,dm=!s&&Math.abs(mu)+Math.abs(mv)<.2;
        const k=(.9+.12*f)*(st<.42?.5+st:1)*(.75+.4*n);s?set(o,112,128,104,k,.5+.2*n,.85):dm?set(o,132,120,88,k,.6,.8):set(o,170,162,130,k,.5+.2*n,.85)},1),
      siding:makeTex(512,(u,v,o)=>{const R=6,fv=v*R-Math.floor(v*R),g=fbm(u*4,v*60,41,4,4,60),paint=fbm(u*5,v*12,43,4,5,12)>.42,k=(.65+.55*g)*(fv<.1?.4:1);
        paint?set(o,176,172,158,k,fv,.75):set(o,84,74,62,k,fv*.9,.9)}),
      grass:makeTex(512,(u,v,o)=>{const n=fbm(u*8,v*8,51,5,8,8),f=fbm(u*64,v*64,53,3,64,64),d=fbm(u*3,v*3,55,3,3,3),k=(.5+.7*n)*(.55+.9*f);
        d>.6?set(o,70,56,40,k,f,.95):set(o,46,68,30,k,f,.95)},3),
      plank:makeTex(256,(u,v,o)=>{const g=fbm(u*3,v*40,61,5,3,40),kn=fbm(u*5,v*5,63,3,5,5);set(o,150,112,70,(.5+.75*g)*(kn>.68?.5:1),g,.8)},3),
      brick:makeTex(512,(u,v,o)=>{const R=8,r=Math.floor(v*R),fv=v*R-r,bu=u*4+(r&1)*.5,b=Math.floor(bu),fu=bu-b,m=fv<.1||fu<.04,n=fbm(u*30,v*30,71,3,30,30),t=hash(b&3,r,73);
        m?set(o,120,116,108,.6+.6*n,.2,.95):set(o,120+50*t,58+20*t,44+10*t,.55+.6*n,.7+.3*n,.9)},3),
      plaster:makeTex(256,(u,v,o)=>{const n=fbm(u*6,v*6,81,5,6,6),f=fbm(u*40,v*40,83,2,40,40),cr=Math.abs(fbm(u*4,v*4,85,4,4,4)-.5)<.005;set(o,196,192,180,cr?.45:(.8+.2*n)*(.92+.1*f),cr?.2:.5+.2*n,.92)},.5),
      cloth:cloth(230,230,230,91,0),
      skin:makeTex(256,(u,v,o)=>{const n=fbm(u*6,v*6,101,5,6,6),vein=Math.abs(fbm(u*10,v*10,103,4,10,10)-.5)<.02,bl=fbm(u*5,v*5,105,4,5,5)>.64;
        bl?set(o,96,12,10,.6+.6*n,.4,.3):vein?set(o,58,70,78,.7+.4*n,.5,.7):set(o,118,128,100,.5+.7*n,n,.8)},1.5),
      shirts:[cloth(190,186,170,111,1),cloth(120,44,40,121,1),cloth(62,84,116,131,1),cloth(96,98,96,141,1)],
      pants:[cloth(44,54,78,151,1),cloth(120,104,74,161,1),cloth(34,34,36,171,1)]
    };
    const M=(t,tile,x={})=>{const m=new THREE.MeshStandardMaterial({map:t.map,normalMap:t.normalMap,roughnessMap:t.roughnessMap,roughness:1,...x});m.userData.tile=tile;return m};
    const flat=(color,rough=.8,metal=0,x={})=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...x});

    function faceTex(zombie,tone){
      const c=document.createElement('canvas'),e=document.createElement('canvas');c.width=e.width=512;c.height=e.height=256;const x=c.getContext('2d'),g=e.getContext('2d'),cx=128;
      g.fillStyle='#000';g.fillRect(0,0,512,256);
      if(zombie){x.drawImage(TX.skin.canvas,0,0,512,256);x.fillStyle='rgba(30,26,20,.75)';for(let i=0;i<70;i++)x.fillRect(rnd(512),rnd(60),rnd(3,26),rnd(2,7))}
      else{x.fillStyle=tone;x.fillRect(0,0,512,256);x.fillStyle='#2a1c12';x.fillRect(0,0,512,72);x.fillRect(0,0,44,180);x.fillRect(212,0,300,180)}
      for(const s of[-1,1]){const ex=cx+s*22,ey=112;if(zombie){const gr=x.createRadialGradient(ex,ey,2,ex,ey,20);gr.addColorStop(0,'rgba(20,8,8,.95)');gr.addColorStop(1,'rgba(20,8,8,0)');x.fillStyle=gr;x.fillRect(ex-22,ey-22,44,44)}
        x.fillStyle=zombie?'#d9d6a2':'#e8e4dc';x.beginPath();x.ellipse(ex,ey,7,4.5,0,0,TAU);x.fill();x.fillStyle=zombie?'#3a3010':'#221a14';x.beginPath();x.arc(ex,ey,zombie?1.6:2.6,0,TAU);x.fill();
        if(zombie){g.fillStyle='#c8c070';g.beginPath();g.ellipse(ex,ey,7,4.5,0,0,TAU);g.fill()}
        else{x.strokeStyle='#2a1c12';x.lineWidth=3;x.beginPath();x.moveTo(ex-9,ey-10);x.lineTo(ex+9,ey-10);x.stroke()}}
      x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;x.beginPath();x.moveTo(cx-4,122);x.lineTo(cx-6,142);x.lineTo(cx+5,142);x.stroke();
      if(zombie){x.fillStyle='#160505';x.beginPath();x.ellipse(cx,165,17,10,0,0,TAU);x.fill();x.fillStyle='#cfc8a0';for(let i=-3;i<4;i++){x.fillRect(cx+i*4.4-1.6,157,3.2,5);if(i%2)x.fillRect(cx+i*4.4-1.6,168,3.2,4)}
        const gr=x.createLinearGradient(0,170,0,256);gr.addColorStop(0,'rgba(110,8,8,.95)');gr.addColorStop(1,'rgba(110,8,8,0)');x.fillStyle=gr;x.fillRect(cx-14,172,28,84);x.fillRect(cx-26,170,8,rnd(20,60))}
      else{x.strokeStyle='#5a2e26';x.lineWidth=3;x.beginPath();x.moveTo(cx-10,166);x.lineTo(cx+10,166);x.stroke()}
      const t=texOf(c,1),et=texOf(e,1);return new THREE.MeshStandardMaterial({map:t,roughness:.7,emissive:zombie?0xffffff:0,emissiveMap:zombie?et:null,emissiveIntensity:zombie?1.4:0})}

    const renderer=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;renderer.localClippingEnabled=true;
    const scene=new THREE.Scene(),SKY=new THREE.Color(0x0a0e16);scene.background=SKY.clone();scene.fog=new THREE.FogExp2(0x0a0e16,.021);
    const hemi=new THREE.HemisphereLight(0x7088b4,0x1c1712,.8);scene.add(hemi);
    const moon=new THREE.DirectionalLight(0x9db4e0,2.1);moon.position.set(-22,34,-20);moon.castShadow=true;moon.shadow.mapSize.set(LOW?1024:4096,LOW?1024:4096);
    Object.assign(moon.shadow.camera,{left:-42,right:42,top:42,bottom:-42,near:1,far:110});moon.shadow.bias=-.0004;moon.shadow.normalBias=.05;scene.add(moon);

    const HX=13,HZ=8,WT=.3,WH=6.4,SILL=.9,TOP=2.5,U0=3.9,U1=5.6,GY=3.2,GZ=-4.5,SW=2.5,SZ=1.5,CLIPY=1.05,L_ISO=5,L_ROOF=6;
    const hAt=(x,z)=>Math.abs(x)>HX||Math.abs(z)>HZ?0:z<GZ?GY:Math.abs(x)<SW&&z<SZ?GY*(SZ-z)/(SZ-GZ):0;
    const clipP=new THREE.Plane(V3(0,-1,0),99),CL={clippingPlanes:[clipP]};
    const solids=[],rects=[],windows=[],flick=[];
    const mWall=M(TX.wall,1.4),mSide=M(TX.brick,2.4,{color:0x9a9ca4}),mWallC=M(TX.wall,1.4,CL),mSideC=M(TX.brick,2.4,{color:0x9a9ca4,...CL}),mTrim=flat(0xb8b2a0,.6),mTrimC=flat(0xb8b2a0,.6,0,CL),mCap=new THREE.MeshBasicMaterial({color:0x0c0c0c});
    const mFloor=M(TX.floor,2),mTile=M(TX.tile,4),mGrass=M(TX.grass,5),mPlank=M(TX.plank,1),mBrick=M(TX.brick,1),mPlaster=M(TX.plaster,5),mWood=M(TX.plank,1.2,{color:0x7a5a40}),mDark=flat(0x151515,.6,.3);
    const mStone=M(TX.plaster,2,{color:0xa8a498}),mStoneC=M(TX.plaster,2,{color:0xa8a498,...CL}),mCarpet=M(TX.cloth,.5,{color:0x7a1616}),mGravel=M(TX.grass,2,{color:0x8a8478}),mRust=M(TX.plaster,1,{color:0x6a4630});
    const GL={color:0x9fc0d8,transparent:true,opacity:.2,roughness:.04,metalness:.7,depthWrite:false},mGlass=new THREE.MeshStandardMaterial(GL),mGlassC=new THREE.MeshStandardMaterial({...GL,...CL});

    function wbox(w,h,d,x,y,z,mat,o={}){
      const g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,uv=g.attributes.uv,arr=Array.isArray(mat);
      for(let i=0;i<p.count;i++){const f=i>>2,t=(arr?mat[f]:mat).userData.tile||1,X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z;f<2?uv.setXY(i,Z/t,Y/t):f<4?uv.setXY(i,X/t,Z/t):uv.setXY(i,X/t,Y/t)}
      const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=!o.noShadow;m.receiveShadow=true;if(o.layer)m.layers.set(o.layer);scene.add(m);if(!o.ghost)solids.push(m);return m}
    const furn=(x0,z0,x1,z1)=>rects.push({x0,z0,x1,z1,kind:'furn'}),GH0={ghost:1},GN={ghost:1,noShadow:1};
    function put(k,x,y,z,ry=0,sc=1,layer=0){if(!A[k])return null;const m=A[k].scene.clone(true);m.position.set(x,y,z);m.rotation.y=ry;Array.isArray(sc)?m.scale.set(...sc):m.scale.setScalar(sc);if(layer)m.traverse(c=>c.layers.set(layer));scene.add(m);return m}
    function inst(k,list){if(!A[k]||!list.length)return false;const g=A[k].scene,o=new THREE.Object3D(),M4=new THREE.Matrix4();g.updateMatrixWorld(true);
      g.traverse(m=>{if(!m.isMesh)return;const im=new THREE.InstancedMesh(m.geometry,m.material,list.length);list.forEach(([x,y,z,ry,sc],i)=>{o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.setScalar(sc);o.updateMatrix();im.setMatrixAt(i,M4.multiplyMatrices(o.matrix,m.matrixWorld))});im.castShadow=im.receiveShadow=true;im.frustumCulled=false;scene.add(im)});return true}

    wbox(320,.2,320,0,-.11,0,mGrass,{noShadow:1});
    wbox(12,.02,12.5,0,0,1.75,mTile,{noShadow:1});wbox(7,.02,12.5,-9.5,0,1.75,mFloor,{noShadow:1});wbox(7,.02,12.5,9.5,0,1.75,mFloor,{noShadow:1});
    wbox(26.9,.3,16.9,0,WH+.15,0,mPlaster,{layer:L_ROOF});
    {const g=new THREE.ConeGeometry(1,1,4,1);g.rotateY(Math.PI/4);const r=new THREE.Mesh(g,flat(0x1c1e24,.8));r.scale.set(20.6,4.6,13.6);r.position.y=WH+.3+2.3;r.castShadow=true;r.layers.set(L_ROOF);scene.add(r);
      for(const x of[-8,8])wbox(1.1,4.2,1.1,x,WH+2.2,-1,mBrick,{ghost:1,layer:L_ROOF})}

    const OPEN=[{s:'S',c:0,w:2,door:1},{s:'S',c:-7.5,w:1.6},{s:'S',c:7.5,w:1.6},{s:'W',c:-1.5,w:1.6},{s:'W',c:4.5,w:1.6},{s:'E',c:-1.5,w:1.6},{s:'E',c:4.5,w:1.6},
      {s:'N',c:-9,w:1.6,up:1},{s:'N',c:-4.5,w:1.6,up:1},{s:'N',c:0,w:2.2,up:1},{s:'N',c:4.5,w:1.6,up:1},{s:'N',c:9,w:1.6,up:1}];
    function side(s){
      const ns=s==='N'||s==='S',sg=s==='N'||s==='W'?-1:1,L=ns?HX+WT:HZ,clip=s==='S'||s==='E',off=sg*((ns?HZ:HX)+WT/2);
      const mats=Array(6).fill(clip?mSideC:mSide);mats[{N:4,S:5,W:0,E:1}[s]]=clip?mWallC:mWall;
      const bx=(a,y,len,hgt,dep,mat,o,sh=0)=>ns?wbox(len,hgt,dep,a,y,off+sh*sg,mat,o):wbox(dep,hgt,len,off+sh*sg,y,a,mat,o);
      const pc=(a0,a1,y0,y1)=>{bx((a0+a1)/2,(y0+y1)/2,a1-a0,y1-y0,WT,mats);if(clip&&y0<CLIPY&&y1>CLIPY)bx((a0+a1)/2,CLIPY,a1-a0,.02,WT,mCap,{ghost:1,noShadow:1,layer:L_ISO})};
      const rect=(a0,a1,kind,win)=>rects.push(ns?{x0:a0,x1:a1,z0:off-WT/2,z1:off+WT/2,kind,win}:{x0:off-WT/2,x1:off+WT/2,z0:a0,z1:a1,kind,win});
      const fm=clip?mTrimC:mTrim,gm=clip?mGlassC:mGlass,t=.08,D=WT+.1;
      const pane=(o,y0,y1,bars)=>{const a=[bx(o.c,(y0+y1)/2,o.w,y1-y0,.015,gm,GN,.09),bx(o.c,(y0+y1)/2,.05,y1-y0,.05,fm,GN,.09)];for(let i=1;i<=bars;i++)a.push(bx(o.c,lerp(y0,y1,i/(bars+1)),o.w,.05,.05,fm,GN,.09));return a};
      const frame=(o,y0,y1,sill)=>{const a0=o.c-o.w/2,a1=o.c+o.w/2;bx(a0+t/2,(y0+y1)/2,t,y1-y0,D,fm,GH0);bx(a1-t/2,(y0+y1)/2,t,y1-y0,D,fm,GH0);bx(o.c,y1-t/2,o.w,t,D,fm,GH0);if(sill)bx(o.c,y0+.02,o.w+.14,.05,D+.12,fm,GH0)};
      let a=-L;
      for(const o of OPEN.filter(o=>o.s===s).sort((p,q)=>p.c-q.c)){
        const a0=o.c-o.w/2,a1=o.c+o.w/2,y0=o.door?0:SILL;pc(a,a0,0,WH);rect(a,a0,'wall');
        if(o.up){pc(a0,a1,0,U0);rect(a0,a1,'wall')}
        else{if(!o.door)pc(a0,a1,0,SILL);pc(a0,a1,TOP,U0);frame(o,y0,TOP,!o.door);
          const w={...o,ns,sg,nx:ns?0:sg,nz:ns?sg:0,x:ns?o.c:sg*HX,z:ns?sg*HZ:o.c,planks:[],count:0,vault:null,y0,glass:o.door?[]:pane(o,SILL,TOP,2),broken:!!o.door};rect(a0,a1,'gap',w);windows.push(w)}
        pc(a0,a1,U1,WH);frame(o,U0,U1,1);pane(o,U0,U1,1);a=a1}
      pc(a,L,0,WH);rect(a,L,'wall')}
    'NSWE'.split('').forEach(side);
    for(const x of[-6,6]){wbox(.25,WH,6.5,x,WH/2,-1.25,mWallC);rects.push({x0:x-.125,x1:x+.125,z0:GZ,z1:2,kind:'wall'});wbox(.25,.02,6.5,x,CLIPY,-1.25,mCap,{ghost:1,noShadow:1,layer:L_ISO})}
    for(const x of[-3.7,3.7]){wbox(.5,WH,.5,x,WH/2,4.4,mStoneC);rects.push({x0:x-.25,x1:x+.25,z0:4.15,z1:4.65,kind:'wall'})}

    wbox(26,.25,3.5,0,GY-.125,-6.25,mFloor);
    for(const s of[-1,1]){wbox(10.5,GY,.2,s*7.75,GY/2,GZ-.1,mWood);rects.push({x0:s>0?SW:-HX,x1:s>0?HX:-SW,z0:GZ-.2,z1:GZ,kind:'wall'});wbox(10.5,.08,.12,s*7.75,GY+1,GZ-.1,mWood,GH0);
      for(let x=SW+.1;x<HX;x+=.36)wbox(.05,1,.05,s*x,GY+.5,GZ-.1,mWood,GN);
      rects.push({x0:s*SW-.08,x1:s*SW+.08,z0:GZ,z1:SZ,kind:'wall'});wbox(.2,1.2,.2,s*(SW-.08),GY+.6,GZ-.1,mWood,GH0);if(A.stairs)continue;wbox(.2,1.35,.2,s*(SW-.08),.67,SZ+.06,mWood,GH0);
      const r=new THREE.Mesh(new THREE.BoxGeometry(.1,.08,6.85),mWood);r.position.set(s*(SW-.08),GY/2+1,(SZ+GZ)/2);r.rotation.x=Math.atan(GY/(SZ-GZ));r.castShadow=true;scene.add(r)}
    for(let i=0;i<16;i++){const h=(i+1)*GY/16,zc=SZ-(i+.5)*(SZ-GZ)/16;wbox(SW*2,h,.375,0,h/2,zc,mStone).visible=!A.stairs;if(A.stairs)continue;wbox(2.4,.014,.375,0,h+.007,zc,mCarpet,GN);for(const s of[-1,1])wbox(.05,.95,.05,s*(SW-.08),h+.47,zc,mWood,GN)}
    put('stairs',0,0,(SZ+GZ)/2,0,[SW*2/4,GY/4,(SZ-GZ)/8]);
    wbox(2.4,.014,6.3,0,.018,4.65,mCarpet,GN);wbox(2.4,.014,3.4,0,GY+.008,-6.2,mCarpet,GN);
    for(const x of[-4.2,4.2]){const c=document.createElement('canvas');c.width=96;c.height=128;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#1c1a14');gr.addColorStop(1,'#0a0806');g.fillStyle=gr;g.fillRect(0,0,96,128);g.fillStyle='#5a4a38';g.beginPath();g.ellipse(48,50,15,19,0,0,TAU);g.fill();g.fillStyle='#1a1c22';g.beginPath();g.ellipse(48,112,34,40,0,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.5)';g.fillRect(40,44,5,3);g.fillRect(52,44,5,3);
      const pm=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.5),new THREE.MeshStandardMaterial({map:texOf(c,1),roughness:.6}));pm.position.set(x,1.85,GZ+.02);scene.add(pm);wbox(1.3,1.7,.03,x,1.85,GZ+.005,flat(0x7a6226,.4,.6),GN)}

    for(const w of windows){const n=6,h0=w.door?.35:SILL+.13,h1=TOP-.13;
      for(let i=0;i<n;i++){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(w.w+.42,.16,.035),mPlank);m.castShadow=m.receiveShadow=true;
        g.position.set(w.x-w.nx*(.03+i*.006),lerp(h0,h1,i/(n-1)),w.z-w.nz*(.03+i*.006));g.rotation.y=w.ns?0:Math.PI/2;m.rotation.z=rnd(-.11,.11);g.add(m);scene.add(g);w.planks.push({m,a:1})}
      w.count=n}
    const debris=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1.9,.16,.035),mPlank);m.visible=false;m.castShadow=true;scene.add(m);debris.push({m,v:V3(),w:V3(),t:0})}
    let debI=0;
    function setPlank(w,i,on){const p=w.planks[i];if(on){p.m.visible=true;p.a=0;return}
      p.m.visible=false;const d=debris[debI++%debris.length];p.m.getWorldPosition(d.m.position);d.m.rotation.set(0,w.ns?0:Math.PI/2,p.m.rotation.z);d.m.visible=true;d.t=2.5;d.v.set(w.nx*rnd(2,4)+rnd(-1,1),rnd(1,2.5),w.nz*rnd(2,4)+rnd(-1,1));d.w.set(rnd(-6,6),rnd(-6,6),rnd(-6,6))}
    function breakGlass(w){if(w.broken)return;w.broken=true;for(const m of w.glass)m.visible=false;burst(tmp.set(w.x+w.nx*.3,1.7,w.z+w.nz*.3),tmp2.set(w.nx,0,w.nz),45,.75,.85,.95,3);sfx.glass(vol(tmp))}

    function lamp(x,y,z,color,int,dist,bulb=1){const l=new THREE.PointLight(color,int,dist,1.7);l.position.set(x,y,z);scene.add(l);flick.push({l,b:int,t:rnd(9)});
      for(let i=0;i<bulb;i++){const a=i/bulb*TAU,r=bulb>1?.55:0,b=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),new THREE.MeshBasicMaterial({color:0xffe6b0}));b.position.set(x+Math.cos(a)*r,y,z+Math.sin(a)*r);b.layers.set(L_ROOF);scene.add(b)}
      if(bulb){wbox(.02,WH-y,.02,x,(WH+y)/2,z,mDark,{ghost:1,noShadow:1,layer:L_ROOF});if(bulb>1){const t=new THREE.Mesh(new THREE.TorusGeometry(.55,.03,6,24),mDark);t.rotation.x=Math.PI/2;t.position.set(x,y-.06,z);t.layers.set(L_ROOF);scene.add(t)}}return l}
    function fire(x,y,z,int,dist){const l=new THREE.PointLight(0xff7a30,int,dist,1.7);l.position.set(x,y,z);scene.add(l);flick.push({l,b:int,t:rnd(9),fire:1,yard:y>1})}
    lamp(0,4.9,3.2,0xffc890,30,26,A.chand?0:8);{const c=put('chand',0,0,3.2,0,1.5,L_ROOF);if(c)c.position.y=WH-new THREE.Box3().setFromObject(c).max.y}lamp(-9.5,4.4,2,0xffc890,10,15);lamp(9.5,4.4,1.5,0xffd0a0,10,15);

    const mSofa=M(TX.cloth,.6,{color:0x5a2c2c}),mRugT=(()=>{const c=document.createElement('canvas');c.width=256;c.height=192;const x=c.getContext('2d');x.fillStyle='#4a1818';x.fillRect(0,0,256,192);x.strokeStyle='#b89a5a';x.lineWidth=6;x.strokeRect(12,12,232,168);x.lineWidth=2;x.strokeRect(26,26,204,140);
      x.fillStyle='#1e2a44';for(let i=0;i<5;i++)for(let j=0;j<3;j++){x.save();x.translate(52+i*38,56+j*40);x.rotate(Math.PI/4);x.fillRect(-9,-9,18,18);x.restore()}const t=texOf(c,1);return new THREE.MeshStandardMaterial({map:t,roughness:1})})();
    wbox(1.8,GY,.5,-9.5,GY/2,GZ+.25,mBrick);wbox(.9,.8,.06,-9.5,.45,GZ+.51,flat(0x050505,1),GH0);wbox(2.1,.09,.66,-9.5,1.4,GZ+.3,mWood,GH0);furn(-10.4,GZ,-8.6,GZ+.5);
    for(let i=0;i<3;i++){const e=new THREE.Mesh(new THREE.BoxGeometry(.55,.07,.08),new THREE.MeshBasicMaterial({color:[0xff7a20,0xffb040,0xd04010][i]}));e.position.set(-9.5+rnd(-.08,.08),.1+i*.06,GZ+.58);e.rotation.y=rnd(-.5,.5);scene.add(e)}
    fire(-9.5,.5,GZ+1,8,11);
    if(A.sofa){put('sofa',-9.5,0,.35,Math.PI,1.25);put('chair',-11.6,0,-1.6,1.2,1.15);put('chair',-7.4,0,-1.6,-1.2,1.15)}else{wbox(2.4,.42,.9,-9.5,.21,.3,mSofa);wbox(2.4,.6,.22,-9.5,.7,.74,mSofa);wbox(.22,.64,1,-10.8,.32,.33,mSofa);wbox(.22,.64,1,-8.2,.32,.33,mSofa);}
    furn(-10.9,-.2,-8.1,.9);
    wbox(1.2,.05,.6,-9.5,.42,-1.5,mWood);for(const[a,b]of[[-.55,-.25],[.55,-.25],[-.55,.25],[.55,.25]])wbox(.05,.4,.05,-9.5+a,.2,-1.5+b,mWood,GH0);furn(-10.1,-1.8,-8.9,-1.2);
    {const r=new THREE.Mesh(new THREE.PlaneGeometry(3.8,2.8),mRugT);r.rotation.x=-Math.PI/2;r.position.set(-9.5,.013,-1.3);r.receiveShadow=true;scene.add(r)}
    furn(-6.5,-4,-6.12,-1);if(A.bookcase)for(const z of[-3.5,-2.45,-1.4])put('bookcase',-6.22,0,z,-Math.PI/2,1.05);else{wbox(.36,2.6,3,-6.31,1.3,-2.5,mWood);for(let r=0;r<5;r++)for(let i=0;i<18;i++)wbox(.2,rnd(.22,.34),.11,-6.45,.3+r*.5,-3.85+i*.155,flat(pick([0x6a2a22,0x2a4a3a,0x2c3350,0x8a7a4a,0x444]),.9),GN);}
    furn(8.95,-1.1,10.05,2.1);if(A.table){put('table',9.5,0,.5,Math.PI/2,[.8,1,1.1]);put('candle',9.5,.76,.5)}else{wbox(1.1,.06,3.2,9.5,.76,.5,mWood);for(const[a,b]of[[-.48,-1.5],[.48,-1.5],[-.48,1.5],[.48,1.5]])wbox(.07,.74,.07,9.5+a,.37,.5+b,mWood,GH0);}
    for(const z of[-.5,.5,1.5])for(const s of[-1,1]){if(put('dchair',9.5+s*.9,0,z,-s*Math.PI/2,1.05))continue;wbox(.42,.04,.42,9.5+s*.85,.45,z,mWood,GH0);wbox(.04,.55,.42,9.5+s*1.05,.74,z,mWood,GH0)}
    put('candle',6.4,.95,-2.5);if(put('piano',4.2,0,-2.7,-.5))furn(3.2,-3.8,5.3,-1.6);if(put('armour',-4.3,0,-3.6))furn(-5.1,-4.1,-3.5,-3.1);
    wbox(.5,.95,2.4,6.4,.475,-2.5,flat(0x3a2a20,.5));furn(6.12,-3.7,6.65,-1.3);
    furn(-11.9,-7.65,-10.25,-6.8);if(A.crate){put('crate',-11.5,GY,-7.2,.2,1.1);put('crate',-10.6,GY,-7.25,-.3)}else{wbox(.8,.8,.8,-11.5,GY+.4,-7.2,mPlank);wbox(.7,.7,.7,-10.6,GY+.35,-7.3,mPlank);}

    for(const x of[-4.6,-1.8,1.8,4.6]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,5.6,14),mStone);c.position.set(x,2.8,10.6);c.castShadow=c.receiveShadow=true;c.layers.set(L_ROOF);scene.add(c);rects.push({x0:x-.3,x1:x+.3,z0:10.3,z1:10.9,kind:'wall'})}
    wbox(11,.6,3,0,5.9,9.8,mStone,{ghost:1,layer:L_ROOF});wbox(11,.06,3,0,.03,9.8,mStone,GN);wbox(4,.02,24,0,-.005,23,mGravel,GN);
    {const sh=new THREE.Shape();sh.moveTo(-5.5,0);sh.lineTo(5.5,0);sh.lineTo(0,1.9);const p=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:3,bevelEnabled:false}),flat(0x8a877c,.9));p.position.set(0,6.2,8.3);p.castShadow=true;p.layers.set(L_ROOF);scene.add(p)}
    function car(x,z,ry,col,flip){const g=new THREE.Group(),m=flat(col,.55,.4),b=(w,h,d,X,Y,Z,mm=m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mm);o.position.set(X,Y,Z);o.castShadow=o.receiveShadow=true;g.add(o)};
      b(4.3,.6,1.8,0,.62,0);b(2.2,.58,1.62,-.2,1.2,0);b(2.1,.5,1.66,-.2,1.2,0,flat(0x0a0c10,.2,.6));for(const sx of[-1.4,1.4])for(const sz of[-.92,.92]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.24,12),flat(0x0c0c0c,.9));w.rotation.x=Math.PI/2;w.position.set(sx,.34,sz);g.add(w)}
      g.position.set(x,flip?1.55:0,z);g.rotation.set(flip?Math.PI:0,ry,0);scene.add(g);rects.push({x0:x-2.1,x1:x+2.1,z0:z-2.1,z1:z+2.1,kind:'furn'})}
    for(const[k,x,z,ry,col,flip]of[['hearse',8.5,19,.5,0x4a2a26,0],['hatch',-13,21,-.9,0x1a1a1c,1],['towncar',22,-4,1.4,0x2a3440,0]]){const m=put(k,x,0,z,ry);if(!m){car(x,z,ry+Math.PI/2,col,flip);continue}const b=new THREE.Box3().setFromObject(m);m.position.y=-b.min.y;if(flip){m.rotation.z=Math.PI;m.position.y=b.max.y-.25}rects.push({x0:x-2.1,x1:x+2.1,z0:z-2.1,z1:z+2.1,kind:'furn'})}
    inst('stone',Array.from({length:18},(_,i)=>[-31+(i%6)*2.2+rnd(-.2,.2),0,-9+Math.floor(i/6)*3.2+rnd(-.2,.2),Math.PI/2+rnd(-.2,.2),rnd(.9,1.2)]));inst('mound',[[-29.6,0,-9,0,1],[-25.2,0,-5.8,0,1],[-22.9,0,-2.6,0,1],[-27.4,0,-2.6,0,1]]);
    put('angel',-25,0,2.5,Math.PI/2,1.3);put('crawler',-27.4,0,-5.8,1.2);put('crawler',14,0,17,-.6);if(put('tomb',-27,0,10,Math.PI/2))rects.push({x0:-29.2,x1:-24.8,z0:7.8,z1:12.2,kind:'furn'});
    put('house',-58,0,-34,.6,1.4);put('house',66,0,26,-2,1.3);for(const[x,z,ry]of[[-2.8,29.4,.1],[2.9,29.6,-.15],[0,33,0]])put('barricade',x,0,z,ry);
    function barrel(x,z){if(!put('drum',x,0,z,rnd(TAU))){const b=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.9,12),mRust);b.position.set(x,.45,z);b.castShadow=true;scene.add(b)}const e=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.04,12),new THREE.MeshBasicMaterial({color:0xff8a30}));e.position.set(x,.9,z);scene.add(e);fire(x,1.5,z,16,17);rects.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3,kind:'furn'});embers.push([x,z])}
    const embers=[];barrel(-5.5,15);barrel(6,24);barrel(-19,1);barrel(19,5);barrel(-2,-15);
    {const c=document.createElement('canvas');c.width=512;c.height=160;const g=c.getContext('2d');g.fillStyle='#b89a1a';g.fillRect(0,0,512,160);g.fillStyle='#111';g.fillRect(0,0,512,14);g.fillRect(0,146,512,14);g.font='700 58px Impact,sans-serif';g.textAlign='center';g.fillText('QUARANTINE ZONE',256,74);g.font='700 34px Impact,sans-serif';g.fillText('NO ENTRY  •  INFECTED AREA',256,124);
      g.fillStyle='rgba(60,6,6,.8)';for(let i=0;i<9;i++){g.beginPath();g.arc(rnd(512),rnd(160),rnd(4,22),0,TAU);g.fill()}
      const s=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1),new THREE.MeshStandardMaterial({map:texOf(c,1),roughness:.7,side:THREE.DoubleSide}));s.position.set(-4.4,1.7,27.6);s.rotation.y=Math.PI-.25;s.rotation.z=.06;scene.add(s);wbox(.1,2.2,.1,-5.7,1.1,27.3,mDark,GN);wbox(.1,2.2,.1,-3.1,1.1,27.95,mDark,GN);
      if(!put('sandbag',4.6,0,28,.05))for(let i=0;i<7;i++)wbox(1,.3,.5,2.6+(i%4)*1.02-(i>3?.5:0),.15+(i>3?.3:0),28,M(TX.cloth,.5,{color:0x6a6048}),GN)}
    {const FX=36,FZ=30,runs=[];for(let x=-FX+2;x<FX;x+=4){if(Math.abs(x)>4)runs.push([x,0,FZ,0,1]);runs.push([x,0,-FZ,0,1])}for(let z=-FZ+2;z<FZ;z+=4)runs.push([-FX,0,z,Math.PI/2,1],[FX,0,z,Math.PI/2,1]);
      if(!inst('fence',runs)){const posts=[];for(let x=-FX;x<=FX;x+=1.5){if(Math.abs(x)>3)posts.push([x,FZ]);posts.push([x,-FZ])}for(let z=-FZ;z<=FZ;z+=1.5)posts.push([-FX,z],[FX,z]);
      const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,2.3,.07),mDark,posts.length),o=new THREE.Object3D();posts.forEach(([x,z],i)=>{o.position.set(x,1.15,z);o.rotation.set(rnd(-.08,.08),0,rnd(-.08,.08));o.updateMatrix();im.setMatrixAt(i,o.matrix)});scene.add(im);
      for(const y of[.5,1.9]){wbox(FX*2,.06,.06,0,y,-FZ,mDark,GN);wbox(FX-3,.06,.06,-(FX+3)/2,y,FZ,mDark,GN);wbox(FX-3,.06,.06,(FX+3)/2,y,FZ,mDark,GN);wbox(.06,.06,FZ*2,-FX,y,0,mDark,GN);wbox(.06,.06,FZ*2,FX,y,0,mDark,GN)}}}

    {const g=new THREE.BufferGeometry(),p=[];for(let i=0;i<900;i++){const a=rnd(TAU),e=rnd(.08,1.5),r=140;p.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
      scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xcfd8ff,size:1.6,sizeAttenuation:false,fog:false})));
      const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,10,64,64,64);gr.addColorStop(0,'#fff');gr.addColorStop(.3,'#dfe8ff');gr.addColorStop(.36,'rgba(160,180,255,.25)');gr.addColorStop(1,'rgba(160,180,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);
      const s=new THREE.Sprite(new THREE.SpriteMaterial({map:texOf(c,1),fog:false,transparent:true}));s.position.copy(moon.position).normalize().multiplyScalar(130);s.scale.setScalar(30);scene.add(s);
      const c2=document.createElement('canvas');c2.width=256;c2.height=64;const y=c2.getContext('2d'),g2=y.createRadialGradient(128,64,4,128,64,128);g2.addColorStop(0,'rgba(255,120,40,.75)');g2.addColorStop(.5,'rgba(190,50,20,.3)');g2.addColorStop(1,'rgba(120,20,10,0)');y.fillStyle=g2;y.fillRect(0,0,256,64);
      const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:texOf(c2,1),fog:false,transparent:true,depthWrite:false}));glow.position.set(80,10,95);glow.scale.set(170,44,1);scene.add(glow);
      const N=140,cone=new THREE.InstancedMesh(new THREE.ConeGeometry(1.6,6,7),flat(0x0c1a10,1),N),trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.26,2.4,6),flat(0x1c140e,1),N),o=new THREE.Object3D();
      for(let i=0;i<N;i++){const a=rnd(TAU),r=rnd(44,78),sc=rnd(.9,2);o.position.set(Math.cos(a)*r,1.2*sc,Math.sin(a)*r);o.scale.setScalar(sc);o.rotation.set(0,rnd(TAU),0);o.updateMatrix();trunk.setMatrixAt(i,o.matrix);o.position.y=(2.2+3)*sc;o.updateMatrix();cone.setMatrixAt(i,o.matrix)}
      scene.add(cone,trunk);
      const TL={oak:[],dtree:[],cotton:[]};for(let i=0;i<40;i++){let x,z;do{const a=rnd(TAU),r=rnd(18,42);x=Math.cos(a)*r*1.1;z=Math.sin(a)*r*.9}while((Math.abs(x)<18&&Math.abs(z)<13)||(Math.abs(x)<4&&z>0)||(x<-20&&x>-34&&Math.abs(z)<13));TL[['oak','dtree','dtree','cotton'][i%4]].push([x,0,z,rnd(TAU),rnd(.8,1.3)])}
      const pfT=inst('oak',TL.oak)&inst('dtree',TL.dtree)&inst('cotton',TL.cotton);
      const NT=pfT?0:44,bark=M(TX.plank,1,{color:0x4a4038}),tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(.1,.3,5,7),bark,NT),br=new THREE.InstancedMesh(new THREE.CylinderGeometry(.025,.09,2.4,5),bark,NT*6);o.rotation.order='YXZ';let k=0;
      for(let i=0;i<NT;i++){let x,z;do{const a=rnd(TAU),r=rnd(17,40);x=Math.cos(a)*r*1.1;z=Math.sin(a)*r*.9}while((Math.abs(x)<17&&Math.abs(z)<12)||(Math.abs(x)<3.5&&z>0));const s=rnd(.8,1.5);
        o.position.set(x,2.5*s,z);o.rotation.set(rnd(-.08,.08),rnd(TAU),rnd(-.08,.08));o.scale.setScalar(s);o.updateMatrix();tr.setMatrixAt(i,o.matrix);
        for(let j=0;j<6;j++){const l=rnd(.5,1.1);o.position.set(x,rnd(2.2,4.9)*s,z);o.rotation.set(rnd(.5,1.15),rnd(TAU),0);o.scale.set(s*l,s*l,s*l);o.translateY(1.2*s*l);o.updateMatrix();br.setMatrixAt(k++,o.matrix)}}
      tr.castShadow=br.castShadow=true;scene.add(tr,br)}

    const YX=36,YZ=30,GC=.5,GW=YX*4,GH=YZ*4,blocked=new Uint8Array(GW*GH),gapOf=new Uint8Array(GW*GH),N8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    for(let z=0;z<GH;z++)for(let x=0;x<GW;x++){const px=-YX+(x+.5)*GC,pz=-YZ+(z+.5)*GC,c=z*GW+x;for(const r of rects)if(r.kind!=='gap'&&px>r.x0-.2&&px<r.x1+.2&&pz>r.z0-.2&&pz<r.z1+.2)blocked[c]=1;
      if(!blocked[c])for(const r of rects)if(r.kind==='gap'){const e=r.win.ns?[0,.3]:[.3,0];if(px>r.x0-e[0]&&px<r.x1+e[0]&&pz>r.z0-e[1]&&pz<r.z1+e[1])gapOf[c]=windows.indexOf(r.win)+1}}
    const shut=c=>blocked[c]||(gapOf[c]&&windows[gapOf[c]-1].count>0);
    const cellOf=(x,z)=>clamp(Math.floor((z+YZ)/GC),0,GH-1)*GW+clamp(Math.floor((x+YX)/GC),0,GW-1),bfsQ=new Int16Array(GW*GH);
    function field(p){const F=p.field;F.fill(9999);let h=0,t=0,s=cellOf(p.pos.x,p.pos.z);F[s]=0;bfsQ[t++]=s;
      while(h<t){const c=bfsQ[h++],x=c%GW,z=c/GW|0,d=F[c]+1;for(let k=0;k<4;k++){const X=x+N8[k][0],Z=z+N8[k][1];if(X<0||Z<0||X>=GW||Z>=GH)continue;const n=Z*GW+X;if(F[n]<=d||shut(n))continue;F[n]=d;bfsQ[t++]=n}}}
    function collide(pos,r,gaps){for(const b of rects){if(b.kind==='gap'&&(!gaps||(gaps==='open'&&!b.win.count)))continue;const cx=clamp(pos.x,b.x0,b.x1),cz=clamp(pos.z,b.z0,b.z1),dx=pos.x-cx,dz=pos.z-cz,d2=dx*dx+dz*dz;if(d2>=r*r)continue;
        if(d2>1e-8){const d=Math.sqrt(d2);pos.x=cx+dx/d*r;pos.z=cz+dz/d*r}else{const l=pos.x-b.x0,ri=b.x1-pos.x,u=pos.z-b.z0,dn=b.z1-pos.z,m=Math.min(l,ri,u,dn);m===l?pos.x=b.x0-r:m===ri?pos.x=b.x1+r:m===u?pos.z=b.z0-r:pos.z=b.z1+r}}}

    const G0={pelvis:new THREE.BoxGeometry(.34,.2,.22),torso:new THREE.CapsuleGeometry(.16,.24,4,10),neck:new THREE.CylinderGeometry(.05,.055,.1,8),head:new THREE.SphereGeometry(.11,18,14),uarm:new THREE.CapsuleGeometry(.052,.2,3,8),farm:new THREE.CapsuleGeometry(.043,.2,3,8),hand:new THREE.BoxGeometry(.07,.1,.08),thigh:new THREE.CapsuleGeometry(.078,.26,3,8),shin:new THREE.CapsuleGeometry(.06,.28,3,8),foot:new THREE.BoxGeometry(.1,.08,.26)};
    function makeBody(m){
      const root=new THREE.Group(),meshes=[],J={root,meshes};root.rotation.order='YXZ';
      const add=(par,geo,mat,part,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.userData.part=part;par.add(o);meshes.push(o);return o};
      const grp=(par,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);par.add(g);return g};
      const hips=J.hips=grp(root,0,.95,0);add(hips,G0.pelvis,m.pants,'body',0,0,0);
      const torso=J.torso=grp(hips,0,.08,0);add(torso,G0.torso,m.shirt,'body',0,.27,0,1.15,1,.72);
      const neck=J.neck=grp(torso,0,.56,0);add(neck,G0.neck,m.skin,'head',0,.02,0);J.head=add(neck,G0.head,m.face,'head',0,.17,0,1,1.18,1.05);
      for(const s of[-1,1]){const k=s<0?'L':'R',sh=J['arm'+k]=grp(torso,s*.25,.46,0);add(sh,G0.uarm,m.shirt,'limb',0,-.14,0);
        const el=J['fore'+k]=grp(sh,0,-.29,0);add(el,G0.farm,m.skin,'limb',0,-.13,0);add(el,G0.hand,m.skin,'limb',0,-.3,0);J['hand'+k]=grp(el,0,-.3,0);
        const hp=J['leg'+k]=grp(hips,s*.1,-.06,0);add(hp,G0.thigh,m.pants,'limb',0,-.2,0);const kn=J['shin'+k]=grp(hp,0,-.42,0);add(kn,G0.shin,m.pants,'limb',0,-.2,0);add(kn,G0.foot,m.shoe,'limb',0,-.43,.06)}
      return J}
    const mZSkin=M(TX.skin,1),mZFace=[faceTex(1),faceTex(1),faceTex(1)],mShoe=flat(0x1a1612,.8);
    const ZM=[];for(const s of TX.shirts)for(const p of TX.pants)ZM.push({shirt:M(s,1),pants:M(p,1)});

    const tintC={},_q=new THREE.Quaternion(),_pq=new THREE.Quaternion(),_iq=new THREE.Quaternion(),AX=V3(1,0,0),AY=V3(0,1,0),AZ=V3(0,0,1),HITM=new THREE.MeshBasicMaterial({visible:false}),HITB=new THREE.CylinderGeometry(.27,.27,1.45,8),HITH=new THREE.SphereGeometry(.17,8,6);
    function makeChar(k,tint=1){const g=A[k],m=skClone(g.scene),root=new THREE.Group(),bones={};root.rotation.order='YXZ';root.add(m);
      m.traverse(o=>{if(o.isBone)bones[o.name]=o;if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(tint!==1){const key=o.material.uuid+':'+tint;if(!tintC[key]){tintC[key]=o.material.clone();tintC[key].color.multiplyScalar(tint)}o.material=tintC[key]}}});
      const mixer=new THREE.AnimationMixer(m),acts={};for(const c of g.animations)acts[c.name]=mixer.clipAction(c);return{root,m,mixer,acts,bones,cur:'',tw:[],fr:0}}
    function play(C,dt){C.fr++;for(const b of C.tw)b.quaternion.copy(b.userData.q0);C.mixer.update(dt)}
    function setAnim(C,n,f=.25){if(C.cur===n||!C.acts[n])return;C.acts[n].reset().fadeIn(f).play();if(C.acts[C.cur])C.acts[C.cur].fadeOut(f);C.cur=n}
    function twist(C,name,ax,ang){const b=C.bones[name];if(!b||!ang)return;if(!b.userData.q0){b.userData.q0=new THREE.Quaternion();C.tw.push(b)}if(b.userData.fr!==C.fr){b.userData.fr=C.fr;b.userData.q0.copy(b.quaternion)}_pq.identity();for(let q=b.parent;q&&q!==C.root;q=q.parent)_pq.premultiply(q.quaternion);_q.setFromAxisAngle(ax,ang);_iq.copy(_pq).invert().multiply(_q).multiply(_pq);b.quaternion.premultiply(_iq)}
    const mGun=flat(0x34363a,.38,.75),mGunW=M(TX.plank,.5,{color:0x6a4426});
    const flashT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.translate(64,64);const g=x.createRadialGradient(0,0,2,0,0,60);g.addColorStop(0,'#fff');g.addColorStop(.25,'#ffe9a0');g.addColorStop(.6,'rgba(255,150,40,.5)');g.addColorStop(1,'rgba(255,120,20,0)');
      x.fillStyle=g;for(let i=0;i<7;i++){x.rotate(TAU/7+rnd(.3));x.beginPath();x.moveTo(0,-9);x.lineTo(rnd(46,62),0);x.lineTo(0,9);x.fill()}x.beginPath();x.arc(0,0,24,0,TAU);x.fill();return texOf(c,1)})();
    const WEAP={
      pistol:{name:'PISTOL',dmg:35,head:3,rate:.17,mag:9,res:90,auto:0,pellets:1,spread:.012,reload:1.3,kick:.022,cost:0,mz:.2},
      shotgun:{name:'BOLT-ACTION RIFLE',dmg:190,head:2.2,rate:1.05,mag:5,res:40,auto:0,pellets:1,spread:.004,reload:2.4,kick:.07,cost:500,mz:.8},
      smg:{name:'MACHINE PISTOL',dmg:26,head:2.5,rate:.075,mag:30,res:150,auto:1,pellets:1,spread:.028,reload:1.9,kick:.014,cost:1000,mz:.4},
      rifle:{name:'ASSAULT RIFLE',dmg:58,head:2.8,rate:.115,mag:25,res:175,auto:1,pellets:1,spread:.016,reload:2.3,kick:.02,cost:1750,mz:.66}};
    function makeGun(id){
      const g=new THREE.Group();if(A[id]){const m=A[id].scene.clone(true),h=new THREE.Group();m.rotation.y=id==='shotgun'?-Math.PI/2:0;h.add(m);h.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(h);const long=bb.max.z-bb.min.z>.5;m.position.set(-(bb.min.x+bb.max.x)/2,(id==='rifle'?.14:.08)-bb.max.y,(long?-.1:-.07)-bb.min.z);WEAP[id].mz=(long?-.1:-.07)+bb.max.z-bb.min.z;g.add(h)}
      const b=(w,h,d,x,y,z,m=mGun,rx=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.x=rx;g.add(o);return o};
      const c=(r,l,y,z)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,8),mGun);o.rotation.x=Math.PI/2;o.position.set(0,y,z);g.add(o)};
      if(!A[id]&&id==='pistol'){b(.034,.046,.2,0,.045,.09);b(.03,.11,.046,0,-.03,.005,mGun,.2);b(.012,.02,.03,0,-.005,.05)}
      if(!A[id]&&id==='shotgun'){c(.014,.62,.055,.48);c(.016,.5,.022,.42);b(.046,.075,.26,0,.04,.08);b(.04,.085,.3,0,.01,-.2,mGunW,-.12);b(.052,.046,.17,0,.022,.38,mGunW);b(.03,.09,.04,0,-.03,0,mGunW,.25)}
      if(!A[id]&&id==='smg'){b(.046,.08,.3,0,.04,.1);c(.013,.14,.05,.32);b(.03,.2,.042,0,-.1,.12,mGun,.05);b(.03,.1,.04,0,-.035,-.01,mGun,.25);b(.02,.03,.22,0,.05,-.15);b(.02,.09,.03,0,.02,-.26)}
      if(!A[id]&&id==='rifle'){b(.046,.085,.36,0,.04,.1);c(.012,.36,.055,.47);b(.052,.056,.25,0,.045,.36);b(.03,.2,.07,0,-.1,.15,mGun,.3);b(.03,.1,.04,0,-.04,-.02,mGun,.25);b(.04,.1,.26,0,.02,-.2,mGunW,-.08);b(.012,.035,.02,0,.1,.5);b(.02,.03,.06,0,.1,.02)}
      const mz=new THREE.Object3D();mz.position.set(0,.05,WEAP[id].mz);g.add(mz);
      const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:flashT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));fl.position.set(0,.05,WEAP[id].mz+.06);fl.scale.setScalar(id==='pistol'?.28:.42);fl.visible=false;g.add(fl);
      g.userData={mz,fl};return g}
    const layerAll=(o,l)=>o.traverse(c=>c.layers.set(l));

    const BUYS=[{id:'shotgun',x:-5.86,z:-1,sx:-5.2,sz:-1,ry:Math.PI/2,y:0},{id:'smg',x:5.86,z:-1,sx:5.2,sz:-1,ry:-Math.PI/2,y:0},{id:'rifle',x:6.6,z:-7.99,sx:6.6,sz:-7.3,ry:0,y:GY}];
    function label(lines,w=256,h=96){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.textAlign='center';x.fillStyle='#e8e4d8';x.font='700 30px Impact,sans-serif';x.fillText(lines[0],w/2,36);x.fillStyle='#e6c060';x.font='700 34px Impact,sans-serif';x.fillText(lines[1],w/2,78);return texOf(c,1)}
    for(const b of BUYS){const g=new THREE.Group(),gun=makeGun(b.id);gun.rotation.y=Math.PI/2;gun.position.set(-WEAP[b.id].mz/2+.1,0,.05);gun.scale.setScalar(1.15);g.add(gun);
      const t=new THREE.Mesh(new THREE.PlaneGeometry(.7,.26),new THREE.MeshBasicMaterial({map:label([WEAP[b.id].name,'$'+WEAP[b.id].cost]),transparent:true,opacity:.85}));t.position.set(0,.34,.012);g.add(t);
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.36),flat(0x2a2018,.9));bd.position.set(0,.02,.008);g.add(bd);g.position.set(b.x,b.y+1.45,b.z);g.rotation.y=b.ry;scene.add(g)}

    const PN=600,pPos=new Float32Array(PN*3).fill(-99),pCol=new Float32Array(PN*3),pVel=new Float32Array(PN*3),pLife=new Float32Array(PN);let pI=0;
    const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
    const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({size:.07,vertexColors:true,transparent:true,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
    function burst(p,d,n,r,g,b,sp=3){for(let i=0;i<n;i++){const k=(pI++%PN)*3;pPos[k]=p.x;pPos[k+1]=p.y;pPos[k+2]=p.z;pVel[k]=d.x*sp*rnd(.2,1)+rnd(-1,1)*sp*.35;pVel[k+1]=d.y*sp*rnd(.2,1)+rnd(-.3,1)*sp*.4;pVel[k+2]=d.z*sp*rnd(.2,1)+rnd(-1,1)*sp*.35;const s=rnd(.6,1);pCol[k]=r*s;pCol[k+1]=g*s;pCol[k+2]=b*s;pLife[k/3]=rnd(.4,.9)}}
    const splatT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');for(let i=0;i<26;i++){const a=rnd(TAU),r=rnd(40)*rnd(),s=rnd(4,22)*(1-r/50);x.fillStyle=`rgba(${rnd(60,110)|0},4,4,${rnd(.5,.95)})`;x.beginPath();x.arc(64+Math.cos(a)*r,64+Math.sin(a)*r,s,0,TAU);x.fill()}return texOf(c,1)})();
    const decals=[];for(let i=0;i<36;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({map:splatT,transparent:true,depthWrite:false,roughness:.25,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.x=-Math.PI/2;m.visible=false;m.receiveShadow=true;scene.add(m);decals.push(m)}
    let decI=0;function splat(x,z,s=1){const m=decals[decI++%decals.length];m.position.set(x,hAt(x,z)+.014+(decI%36)*.0004,z);m.rotation.z=rnd(TAU);m.scale.setScalar(rnd(.7,1.4)*s);m.visible=true}
    const tracers=[];for(let i=0;i<20;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffe2a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));l.frustumCulled=false;l.visible=false;scene.add(l);tracers.push({l,t:0})}
    let trI=0;function tracer(a,b){const t=tracers[trI++%tracers.length],p=t.l.geometry.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;t.l.visible=true;t.t=.07}

    let AC,master,noiseB;
    function audioInit(){if(AC)return;try{AC=new AudioContext()}catch(e){return}master=AC.createGain();master.gain.value=.55;master.connect(AC.destination);
      noiseB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();s.buffer=noiseB;s.loop=true;f.type='lowpass';f.frequency.value=320;g.gain.value=.1;l.frequency.value=.13;lg.gain.value=.06;l.connect(lg).connect(g.gain);s.connect(f).connect(g).connect(master);s.start();l.start()}
    function nz(dur,type,f0,f1,vol,q=1,delay=0){if(!AC)return;const t=AC.currentTime+delay,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseB;s.loop=true;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(master);s.start(t,Math.random());s.stop(t+dur+.05)}
    function tone(dur,type,f0,f1,vol,delay=0){if(!AC)return;const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(master);o.start(t);o.stop(t+dur+.05)}
    const sfx={
      shot(id){const s=id==='shotgun';nz(s?.45:.2,'lowpass',s?2400:4200,s?200:500,s?1:.7);tone(s?.25:.12,'sine',s?130:190,45,s?.9:.6);nz(.05,'highpass',5000,3000,.35)},
      empty(){nz(.03,'highpass',3000,2000,.3)},reload(d){nz(.04,'bandpass',2200,1800,.4,4);nz(.05,'bandpass',1500,1200,.5,4,d*.55);nz(.05,'bandpass',2600,2000,.5,4,d*.92)},
      groan(v){if(!AC||v<.02)return;const t=AC.currentTime,d=rnd(.8,1.7),o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain(),b=rnd(62,105);
        o.type='sawtooth';o.frequency.setValueAtTime(b,t);o.frequency.linearRampToValueAtTime(b*rnd(.7,1.25),t+d);l.frequency.value=rnd(5,11);lg.gain.value=b*.07;l.connect(lg).connect(o.frequency);
        f.type='bandpass';f.Q.value=5;f.frequency.setValueAtTime(rnd(300,500),t);f.frequency.linearRampToValueAtTime(rnd(600,900),t+d*.5);f.frequency.linearRampToValueAtTime(350,t+d);
        g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.5*v,t+.15);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(f).connect(g).connect(master);o.start(t);l.start(t);o.stop(t+d+.1);l.stop(t+d+.1)},
      hammer(){nz(.05,'bandpass',1800,900,.7,2);tone(.1,'sine',210,90,.6)},crack(v=1){nz(.16,'bandpass',1400,500,.8*v,1.5);nz(.05,'highpass',4000,2500,.3*v)},
      glass(v=1){nz(.35,'highpass',3500,7000,.7*v);nz(.12,'bandpass',2200,900,.6*v,3);for(let i=0;i<5;i++)tone(.08,'triangle',rnd(2500,6000),rnd(2000,4000),.08*v,rnd(.3))},
      hit(){tone(.035,'square',1700,1500,.12)},kill(){tone(.07,'square',1300,700,.14)},hurt(){tone(.25,'sine',120,45,.9);nz(.15,'lowpass',700,150,.6)},squish(v=1){nz(.12,'lowpass',900,150,.5*v)},
      buy(){tone(.09,'sine',880,880,.3);tone(.2,'sine',1320,1320,.3,.09)},knife(){nz(.12,'highpass',2500,6000,.25)},
      round(){for(const f of[55,82.4,110.5])tone(3.2,'sawtooth',f,f*1.5,.09);nz(3,'lowpass',200,1200,.1)},
      thunder(){nz(3.5,'lowpass',260,50,.9);nz(.4,'lowpass',1500,200,.5)},power(){for(let i=0;i<4;i++)tone(.15,'triangle',440*(1+i*.25),440*(1+i*.25),.25,i*.07)}};

    const G={state:'menu',net:'',n:1,round:0,toSpawn:0,spawnT:0,between:0,x2:0,time:0,bolt:rnd(10,20),boltT:0};
    const players=[],pool=[],zombies=[],powerups=[],zHit=[];let targets=solids.slice(),tDirty=false;
    const raycaster=new THREE.Raycaster();raycaster.layers.enableAll();
    const menuCam=new THREE.PerspectiveCamera(55,1,.1,300);menuCam.layers.enable(L_ROOF);
    const VIEWS=['fp','tp','iso'],ISO_D=V3(1,1.15,1).normalize();
    const tmp=V3(),tmp2=V3(),tmp3=V3(),BOLT=new THREE.Color(.5,.55,.7);

    function makePlayer(i){
      const el=document.createElement('div');el.className='hud';el.innerHTML='<div class="vig"></div><div class="dmg"></div><div class="cross"><i></i><i></i><i></i><i></i></div><div class="hm">+</div><div class="ret"></div><div class="prompt"></div><div class="bar"><b></b></div><div class="pts"></div><div class="pop"></div><div class="ammo"><span class="wn"></span><span class="am"></span></div><div class="down"></div><div class="pw"></div><div class="tag">P'+(i+1)+'</div>';
      $('#huds').appendChild(el);const q=s=>el.querySelector(s);
      const p={i,pos:V3(),yaw:0,pitch:0,view:'fp',cam:new THREE.PerspectiveCamera(78,1,.03,220),ocam:new THREE.OrthographicCamera(-1,1,1,-1,-60,120),field:new Int16Array(GW*GH),I:{},prev:[],cur2:new THREE.Vector2(0,.3),
        hud:{el,dmg:q('.dmg'),cross:q('.cross'),ci:el.querySelectorAll('.cross i'),hm:q('.hm'),ret:q('.ret'),prompt:q('.prompt'),bar:q('.bar'),barb:q('.bar b'),pts:q('.pts'),pop:q('.pop'),wn:q('.wn'),am:q('.am'),down:q('.down'),pw:q('.pw')},cache:{}};
      scene.add(p.cam,p.ocam);
      const tone_=i?'#b98a66':'#d2a67e',ck=i?'sheriff':'cop',C=p.C=A[ck]?makeChar(ck):null,J=p.J=C?{root:C.root}:makeBody({skin:flat(i?0xb98a66:0xd2a67e,.7),face:faceTex(0,tone_),shirt:M(TX.cloth,.5,{color:i?0x7a2a22:0x2a4a6a}),pants:M(TX.cloth,.5,{color:0x30323a}),shoe:mShoe});
      p.gunH=J.handR;if(C){p.gunH=new THREE.Group();p.gunH.position.set(.17,1.34,.42);C.root.add(p.gunH)}
      layerAll(J.root,1+i);scene.add(J.root);
      p.guns={};p.vms={};p.vm=new THREE.Group();p.vmH=new THREE.Group();p.vm.add(p.vmH);p.vm.scale.setScalar(.35);p.cam.add(p.vm);p.vmH.rotation.y=Math.PI;
      for(const id in WEAP){const a=makeGun(id);if(!C)a.rotation.x=Math.PI/2;p.gunH.add(a);layerAll(a,1+i);p.guns[id]=a;const b=makeGun(id);p.vmH.add(b);p.vms[id]=b}
      const sl=M(TX.cloth,.3,{color:i?0x7a2a22:0x2a4a6a}),ar=new THREE.Mesh(G0.farm,sl),hd=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),flat(0x24211e,.9));
      ar.scale.set(1.15,2,1.15);ar.position.set(-.035,-.2,-.3);ar.rotation.set(1.05,0,-.1);hd.position.set(0,-.03,-.005);hd.scale.set(.85,1.25,1.05);p.vmH.add(ar,hd);
      p.vmArm2=new THREE.Group();{const a=new THREE.Mesh(G0.farm,sl),h=new THREE.Mesh(hd.geometry,hd.material);a.scale.set(1.15,2.2,1.15);a.position.set(.16,-.19,-.2);a.rotation.set(.75,0,.62);h.position.set(0,-.02,0);h.scale.set(1.1,1,1.3);p.vmArm2.add(a,h)}p.vmH.add(p.vmArm2);
      p.vm.traverse(c=>{c.layers.set(3+i);c.castShadow=false;c.frustumCulled=false});
      p.spot=new THREE.SpotLight(0xdfe8ff,0,32,.52,.7,1);p.spot.castShadow=!LOW;p.spot.shadow.mapSize.set(512,512);p.spot.shadow.camera.near=.4;p.spot.shadow.camera.far=30;p.spot.shadow.bias=-.002;scene.add(p.spot,p.spot.target);
      p.mfl=new THREE.PointLight(0xffc070,0,9,1.8);scene.add(p.mfl);
      return p}
    function setView(p,v){p.view=v;const L=p.cam.layers,O=p.ocam.layers,own=1+p.i,oth=2-p.i;
      L.set(0);L.enable(oth);L.enable(L_ROOF);v==='fp'?L.enable(3+p.i):L.enable(own);O.set(0);O.enable(1);O.enable(2);O.enable(L_ISO)}
    function resetPlayer(p){p.pos.set(p.i?1.5:-1.5,0,5.2);p.yaw=0;p.pitch=0;p.hp=100;p.down=false;p.dead=false;p.bleed=0;p.pts=500;p.kills=0;p.heads=0;p.w=[{id:'pistol',mag:9,res:90}];p.cur=0;p.cd=0;p.rel=0;p.recoil=0;p.hurtT=9;p.flash=0;p.useT=0;p.actKey='';p.bob=0;p.melee=0;p.hmT=0;p.ads=0;p.revT=0;p.spread=0;
      setView(p,p.kb2?'iso':p.view);showGun(p);p.J.root.visible=true;p.spot.intensity=16}
    function showGun(p){const id=p.w[p.cur].id;for(const k in WEAP){p.guns[k].visible=p.vms[k].visible=k===id}p.vmArm2.visible=id!=='pistol'&&!A[id];p.vmArm2.position.set(0,.01,WEAP[id].mz*.52)}
    function addPts(p,n){n*=G.x2>0?2:1;p.pts+=n;const s=document.createElement('span');s.textContent='+'+n;s.style.right=rnd(-10,30)+'px';p.hud.pop.appendChild(s);setTimeout(()=>s.remove(),900)}

    let zid=1;const ZK=['zteen','zghoul'],ZT=[1,.82,.66],ZS=['rise','approach','tear','vault','chase','attack'];
    function newZ(kind,tint,sc){
      const C=A[kind]?makeChar(kind,tint):null,m=pick(ZM),J=C?{root:C.root,meshes:[],head:C.bones.Head}:makeBody({skin:mZSkin,face:pick(mZFace),shirt:m.shirt,pants:m.pants,shoe:mShoe});
      const z={J,pos:J.root.position,id:0,kind,tint,state:'rise',t:0,hp:100,speed:1,phase:rnd(TAU),atkCd:0,atk:0,tearT:rnd(1,2),flinch:0,off:rnd(-.45,.45),dx:0,dz:1,yaw:0,gT:rnd(1,6),
        v:{lean:rnd(-.08,.22),tilt:rnd(-.35,.35),limp:rnd()<.4?rnd(.3,.6):1,arm:rnd()<.25?1:0,sc}};
      J.root.scale.setScalar(sc);
      if(C){z.C=C;const hb=new THREE.Mesh(HITB,HITM),hh=new THREE.Mesh(HITH,HITM);hb.position.y=.73;hb.userData.part='body';hh.userData.part='head';C.root.add(hb);C.root.updateMatrixWorld(true);const ws=C.bones.Head.getWorldScale(V3()).x||1;hh.scale.setScalar(1/ws);hh.position.y=.1/ws;C.bones.Head.add(hh);J.meshes.push(hb,hh)}
      for(const o of J.meshes){o.userData.z=z;zHit.push(o)}tDirty=true;scene.add(J.root);zombies.push(z);return z}
    function spawnZ(){
      const zk=ZK.filter(k=>A[k]),z=newZ(zk.length?pick(zk):'',pick(ZT),rnd(.94,1.07)),a=rnd(TAU),r=rnd(21,27),R=G.round;
      let sp=rnd(.95,1.45);if(R>=3&&Math.random()<Math.min(.6,(R-2)*.13))sp=rnd(2,2.6);if(R>=6&&Math.random()<Math.min(.45,(R-5)*.09))sp=rnd(3.1,3.7);
      z.id=zid++;z.hp=R<10?100+(R-1)*45:505*Math.pow(1.1,R-9);z.speed=sp;z.pos.set(Math.cos(a)*r*1.15,-1.75,Math.sin(a)*r*.85);for(let k=0;k<8&&players.some(q=>Math.hypot(q.pos.x-z.pos.x,q.pos.z-z.pos.z)<7);k++){const b=rnd(TAU);z.pos.set(Math.cos(b)*r*1.15,-1.75,Math.sin(b)*r*.85)}
      z.win=windows.map(w=>({w,d:Math.hypot(w.x+w.nx-z.pos.x,w.z+w.nz-z.pos.z)+rnd(5)})).sort((p,q)=>p.d-q.d)[0].w;
      burst(tmp.set(z.pos.x,.05,z.pos.z),tmp2.set(0,1,0),14,.25,.2,.14,2.5)}
    const live=()=>zombies.reduce((n,z)=>n+(z.state!=='dead'),0);
    const upP=()=>players.filter(p=>!p.down&&!p.dead);
    function angLerp(a,b,t){let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return a+d*t}
    function vol(pos){let d=99;for(const p of players)d=Math.min(d,Math.hypot(p.pos.x-pos.x,p.pos.z-pos.z));return clamp(1.15-d/20,0,1)}

    function steer(z,p){const dx=p.pos.x-z.pos.x,dz=p.pos.z-z.pos.z,d=Math.hypot(dx,dz)||1;if(d<1.3&&Math.abs(p.pos.y-z.pos.y)<1)return[dx/d,dz/d,d];
      const ix=clamp(Math.floor((z.pos.x+YX)/GC),0,GW-1),iz=clamp(Math.floor((z.pos.z+YZ)/GC),0,GH-1),F=p.field;let best=F[iz*GW+ix],bx=0,bz=0;if(best>=9999)return[dx/d,dz/d,d];
      for(const[ox,oz]of N8){const x=ix+ox,y=iz+oz;if(x<0||y<0||x>=GW||y>=GH)continue;if(ox&&oz&&(shut(iz*GW+x)||shut(y*GW+ix)))continue;const v=F[y*GW+x]+(ox&&oz?.4:0);if(v<best){best=v;bx=ox;bz=oz}}
      if(!bx&&!bz)return[dx/d,dz/d,d];const tx=-YX+(ix+bx+.5)*GC-z.pos.x,tz=-YZ+(iz+bz+.5)*GC-z.pos.z,l=Math.hypot(tx,tz)||1;return[tx/l,tz/l,d]}

    function updZ(z,dt){
      const J=z.J,r=J.root;z.t+=dt;
      if(z.state==='dead'){z.dt+=dt;const q=Math.min(1,z.dt/.6),e=1-(1-q)**3;r.rotation.x=z.fall*1.5*e;r.position.y=z.y0+(z.gy+.14-z.y0)*e-(z.dt>6?(z.dt-6)*.3:0);if(z.C)return z.dt<8;J.armL.rotation.x=lerp(J.armL.rotation.x,z.fall*-.6,dt*5);J.armR.rotation.x=lerp(J.armR.rotation.x,z.fall*-1.2,dt*5);J.legL.rotation.x*=1-dt*4;J.legR.rotation.x*=1-dt*4;return z.dt<8}
      z.atkCd-=dt;z.flinch=Math.max(0,z.flinch-dt*4);
      if((z.gT-=dt)<0){z.gT=rnd(3,9);sfx.groan(vol(z.pos)*.8)}
      let mvx=0,mvz=0,sp=0,face=null,tgt=null,td=99;
      if(z.net){const k=Math.min(1,dt*10);z.pos.x=lerp(z.pos.x,z.tx,k);z.pos.y=lerp(z.pos.y,z.ty,k);z.pos.z=lerp(z.pos.z,z.tz,k);face=z.tyaw;sp=z.mv?z.speed:0;if(z.state==='attack')z.atk=Math.min(1,z.atk+dt/.7);z.phase+=sp*dt*(2.2+1.2/z.speed)}else{
      for(const p of upP()){const d=Math.hypot(p.pos.x-z.pos.x,p.pos.z-z.pos.z);if(d<td){td=d;tgt=p}}
      const near=tgt&&Math.abs(tgt.pos.y-z.pos.y)<1.2;
      let w=z.win;const zin=Math.abs(z.pos.x)<HX&&Math.abs(z.pos.z)<HZ,sd=zin?-1:1,reach=tgt&&z.pos.y>-.5&&tgt.field[cellOf(z.pos.x,z.pos.z)]<9999;
      if(reach&&(z.state==='approach'||z.state==='tear'))z.state='chase';
      else if(!reach&&tgt&&z.state==='chase'){w=z.win=windows.map(o=>({o,d:Math.hypot(o.x+o.nx*sd-z.pos.x,o.z+o.nz*sd-z.pos.z)})).sort((a,b)=>a.d-b.d)[0].o;z.state='approach'}
      if(z.state==='rise'){const q=Math.min(1,z.t/1.7);z.pos.y=lerp(-1.75,0,smooth(q));if(q>=1)z.state='approach'}
      else if(z.state==='approach'){const tx=w.x+w.nx*.95*sd+(w.ns?z.off:0),tz=w.z+w.nz*.95*sd+(w.ns?0:z.off),dx=tx-z.pos.x,dz=tz-z.pos.z,d=Math.hypot(dx,dz);
        const depth=((z.pos.x-w.x)*w.nx+(z.pos.z-w.z)*w.nz)*sd,lat=Math.abs(w.ns?z.pos.x-w.x:z.pos.z-w.z);
        if(d<.3||(depth<1.25&&lat<w.w/2+.15)){z.state='tear';z.tearT=rnd(.8,1.6);breakGlass(w)}else{mvx=dx/d;mvz=dz/d;sp=z.speed}}
      else if(z.state==='tear'){face=Math.atan2(-w.nx*sd,-w.nz*sd);
        if(near&&td<1.5&&z.atkCd<=0){z.state='attack';z.atk=0;z.hit=false;z.ret='tear';z.tg=tgt}
        else if(w.count>0){if((z.tearT-=dt)<=0){z.tearT=rnd(1.5,2.5);w.count--;setPlank(w,w.count,false);sfx.crack(vol(z.pos))}}
        else if(!w.vault){w.vault=z;z.state='vault';z.q=0;z.fx=z.pos.x;z.fz=z.pos.z;z.vs=sd}}
      else if(z.state==='vault'){const vs=z.vs||1;face=Math.atan2(-w.nx*vs,-w.nz*vs);z.q+=dt/(w.door?.8:1.25);const q=Math.min(1,z.q),e=smooth(q);z.pos.x=lerp(z.fx,w.x-w.nx*(vs>0?.8:-1.1),e);z.pos.z=lerp(z.fz,w.z-w.nz*(vs>0?.8:-1.1),e);z.pos.y=w.door?0:Math.sin(q*Math.PI)*.6;
        if(q>=1){z.state='chase';z.pos.y=0;w.vault=null}}
      else if(z.state==='chase'){if(tgt){let went=false;const F=tgt.field,here=F[cellOf(z.pos.x,z.pos.z)];
        for(const o of windows){if(o.count||o.vault)continue;const dep=((z.pos.x-o.x)*o.nx+(z.pos.z-o.z)*o.nz)*sd,lat=Math.abs(o.ns?z.pos.x-o.x:z.pos.z-o.z);
          if(dep<1.3&&dep>-.4&&lat<o.w/2+.1&&F[cellOf(o.x-o.nx*1.2*sd,o.z-o.nz*1.2*sd)]<here){o.vault=z;w=z.win=o;z.state='vault';z.q=0;z.fx=z.pos.x;z.fz=z.pos.z;z.vs=sd;went=true;break}}
        if(!went){const s=steer(z,tgt);mvx=s[0];mvz=s[1];sp=z.speed*(1-z.flinch*.6);if(td<1.15&&near){sp=0;face=Math.atan2(tgt.pos.x-z.pos.x,tgt.pos.z-z.pos.z);if(z.atkCd<=0){z.state='attack';z.atk=0;z.hit=false;z.ret='chase';z.tg=tgt}}}}}
      else if(z.state==='attack'){const p=z.tg;face=Math.atan2(p.pos.x-z.pos.x,p.pos.z-z.pos.z);z.atk+=dt/.7;
        if(z.atk>.45&&!z.hit){z.hit=true;if(!p.down&&Math.hypot(p.pos.x-z.pos.x,p.pos.z-z.pos.z)<1.6&&Math.abs(p.pos.y-z.pos.y)<1.3)hurtP(p,34)}if(z.atk>=1){z.state=z.ret;z.atkCd=.4}}
      if(sp>0){z.dx=lerp(z.dx,mvx,Math.min(1,dt*7));z.dz=lerp(z.dz,mvz,Math.min(1,dt*7));const l=Math.hypot(z.dx,z.dz)||1;z.pos.x+=z.dx/l*sp*dt;z.pos.z+=z.dz/l*sp*dt;z.phase+=sp*dt*(2.2+1.2/z.speed);face=Math.atan2(z.dx,z.dz)}
      if(z.state!=='vault'){for(const o of zombies){if(o===z||o.state==='dead'||o.state==='vault')continue;const dx=z.pos.x-o.pos.x,dz=z.pos.z-o.pos.z,d2=dx*dx+dz*dz;if(d2<.3&&d2>1e-6){const d=Math.sqrt(d2),k=(.55-d)*.5/d;z.pos.x+=dx*k;z.pos.z+=dz*k}}
        for(const p of players){if(p.dead||Math.abs(p.pos.y-z.pos.y)>1.4)continue;const dx=z.pos.x-p.pos.x,dz=z.pos.z-p.pos.z,d=Math.hypot(dx,dz);if(d<.62&&d>1e-4){z.pos.x+=dx/d*(.62-d);z.pos.z+=dz/d*(.62-d)}}
        collide(z.pos,.28,true);if(z.state==='chase'||z.state==='attack')z.pos.y=lerp(z.pos.y,hAt(z.pos.x,z.pos.z),Math.min(1,dt*12))}
      z.mv=sp>0?1:0}
      if(face!==null)z.yaw=angLerp(z.yaw,face,Math.min(1,dt*8));r.rotation.y=z.yaw;
      if(z.C){const C=z.C,s=z.state,run=z.speed>1.9;setAnim(C,sp>0||s==='vault'?(run?'Run':'Walk'):'Idle');C.acts[C.cur].timeScale=sp>0?clamp(sp/(run?3:1.2),.5,1.7):1;play(C,dt);
        let aL=-1.2+.1*Math.sin(z.t*2+1),aR=-1.3+.1*Math.sin(z.t*2.3),lean=.16+z.v.lean*.6;if(z.v.arm)aL=-.2;
        if(s==='tear'){const k=z.t*7;aL=-1.9+.45*Math.sin(k);aR=-1.9+.45*Math.sin(k+Math.PI);lean=.15}
        if(s==='attack'){const q=smooth(clamp(z.atk/.5,0,1));aL=aR=lerp(-2.7,-.8,q);lean=.1+.5*q}
        if(s==='vault'){lean=.9;aL=aR=-2.5}if(s==='rise'){aL=-2.7+.3*Math.sin(z.t*9);aR=-2.7+.3*Math.cos(z.t*9);lean=.05}
        const k=Math.min(1,dt*12);z.aL=lerp(z.aL??aL,aL,k);z.aR=lerp(z.aR??aR,aR,k);z.ln=lerp(z.ln??lean,lean,k);
        twist(C,'Spine',AX,z.ln-z.flinch*.4);twist(C,'LeftArm',AX,z.aL);twist(C,'RightArm',AX,z.aR);twist(C,'Neck',AZ,z.v.tilt*.6);return true}
      const p=z.phase,sw=Math.sin(p),cw=Math.cos(p),Av=z.v,mov=sp>0?1:0,run=clamp((z.speed-1.4)/2,0,1),amp=(.5+.35*run)*mov;
      let lean=.26+Av.lean+run*.25,aL=-1.25+.14*Math.sin(p*.5+1),aR=-1.38+.14*Math.sin(p*.5),fL=-.25,fR=-.3,kL=Math.max(0,cw)*.9*mov+.12,kR=Math.max(0,-cw)*.9*Av.limp*mov+.12,lL=-sw*amp,lR=sw*amp*Av.limp,roll=sw*.09*mov,hx=.12;
      if(Av.arm){aL=.15+sw*.25;fL=-.1}
      if(z.state==='tear'){const s=z.t*7;aL=-1.9+.45*Math.sin(s);aR=-1.9+.45*Math.sin(s+Math.PI);fL=fR=-.5+.3*Math.sin(s*.5);lean=.18+.06*Math.sin(s);roll=.05*Math.sin(s*.5)}
      if(z.state==='attack'){const q=smooth(clamp(z.atk/.5,0,1));aL=aR=lerp(-2.7,-.8,q);fL=fR=-.2;lean=.1+.5*q}
      if(z.state==='vault'){lean=1.05;aL=aR=-2.5;lL=lR=.5;kL=kR=.5}
      if(z.state==='rise'){aL=-2.7+.3*Math.sin(z.t*9);aR=-2.7+.3*Math.cos(z.t*9);lean=.1}
      const k=Math.min(1,dt*12),S=(o,ax,v)=>o.rotation[ax]=lerp(o.rotation[ax],v,k);
      S(J.torso,'x',lean-z.flinch*.5);S(J.torso,'z',roll);S(J.torso,'y',sw*.12*mov);S(J.neck,'x',hx-lean*.5);J.neck.rotation.z=Av.tilt+.1*Math.sin(z.t*1.3);
      S(J.armL,'x',aL);S(J.armR,'x',aR);S(J.foreL,'x',fL);S(J.foreR,'x',fR);S(J.legL,'x',lL);S(J.legR,'x',lR);S(J.shinL,'x',kL);S(J.shinR,'x',kR);J.hips.position.y=.95-Math.abs(sw)*.03*mov;
      return true}

    function hurtZ(z,dmg,p,part,pt,dir){
      if(z.state==='dead')return;z.hp-=dmg;z.flinch=1;burst(pt,dir,part==='head'?14:8,.5,.02,.02,3);sfx.squish(.5);
      if(p){p.hmT=.15;addPts(p,10);sfx.hit()}
      if(z.hp<=0)killZ(z,p,part,dir)}
    function dmgZ(z,dmg,p,part,pt,dir){if(G.net!=='guest')return hurtZ(z,dmg,p,part,pt,dir);if(z.state==='dead')return;z.flinch=1;burst(pt,dir,part==='head'?14:8,.5,.02,.02,3);sfx.squish(.5);p.hmT=.15;sfx.hit();
      const r=v=>Math.round(v*100)/100;NET.ev.push(['h',z.id,Math.round(dmg),part,r(pt.x),r(pt.y),r(pt.z),r(dir.x),r(dir.y),r(dir.z)])}
    function killZ(z,p,part,dir){
      if(z.state==='dead')return;if(z.win&&z.win.vault===z)z.win.vault=null;z.state='dead';z.dt=0;z.y0=z.pos.y;z.gy=hAt(z.pos.x,z.pos.z);
      const f=dir?(dir.x*Math.sin(z.yaw)+dir.z*Math.cos(z.yaw)):-1;z.fall=f>0?1:-1;
      for(const o of z.J.meshes){const i=zHit.indexOf(o);if(i>=0)zHit.splice(i,1)}tDirty=true;
      if(part==='head'){z.J.head.getWorldPosition(tmp3);z.J.head.visible=false;if(z.C)z.J.head.scale.setScalar(.001);burst(tmp3,tmp2.set(0,1,0),40,.55,.02,.02,4);sfx.squish(1)}
      splat(z.pos.x,z.pos.z,1.2);
      if(p){p.kills++;if(part==='head')p.heads++;addPts(p,part==='head'?100:part==='melee'?130:60);if(!p.remote)sfx.kill()}
      if(G.net==='host')NET.ev.push(['d',z.id,z.fall,part==='head'?1:0]);
      if(G.net!=='guest'&&Math.random()<.045&&powerups.length<2&&Math.abs(z.pos.x)<HX-.5&&Math.abs(z.pos.z)<HZ-.5)dropPower(z.pos.x,z.pos.z)}

    const PW={ammo:['AMMO','#7fd'],x2:['x2','#fd6'],rebuild:['BOARDS','#fa6'],blast:['BLAST','#f66']};
    function dropPower(x,z,id=pick(Object.keys(PW))){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,10,64,64,62);gr.addColorStop(0,'rgba(40,255,90,.55)');gr.addColorStop(1,'rgba(40,255,90,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
      g.fillStyle=PW[id][1];g.font='700 34px Impact,sans-serif';g.textAlign='center';g.fillText(PW[id][0],64,76);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:texOf(c,1),transparent:true,depthWrite:false,fog:false}));const y=hAt(x,z)+1;s.position.set(x,y,z);s.scale.setScalar(.9);scene.add(s);powerups.push({id,s,t:25,y})}
    function takePower(pw,p){if(G.net==='host')NET.ev.push(['pw',pw.id]);sfx.power();banner(({ammo:'AMMO FOR ALL',x2:'DOUBLE POINTS',rebuild:'WINDOWS BOARDED',blast:'BLAST'})[pw.id],1800);
      if(pw.id==='ammo')for(const q of players)for(const w of q.w){w.res=WEAP[w.id].res}
      if(pw.id==='x2')G.x2=25;
      if(pw.id==='rebuild'){for(const w of windows)for(let i=w.count;i<6;i++)setPlank(w,i,true),w.count=i+1;for(const q of players)addPts(q,200)}
      if(pw.id==='blast'){for(const z of zombies)if(z.state!=='dead'&&z.state!=='rise'){z.J.head.getWorldPosition(tmp);hurtZ(z,1e6,null,'body',tmp.clone(),V3(0,1,0))}for(const q of players)addPts(q,400)}}

    function hurtP(p,d){if(p.down||(G.state!=='play'&&!(G.net&&G.state==='pause')))return;p.hp-=d;p.hurtT=0;p.flash=1;if(!p.remote)sfx.hurt();
      if(p.hp<=0){p.hp=0;p.down=true;p.bleed=30;p.revT=0;if(!upP().length)gameOver();else banner('PLAYER '+(p.i+1)+' IS DOWN',2000)}}

    let bannerT=0;function banner(t,ms=2600){VRS.banner=t;VRS.bannerT=performance.now()+ms;const b=$('#banner');b.textContent=t;b.style.opacity=1;clearTimeout(bannerT);bannerT=setTimeout(()=>b.style.opacity=0,ms)}
    function startRound(){G.round++;G.toSpawn=Math.floor((5+G.round*3)*(G.n>1?1.5:1));G.spawnT=2;$('#round').textContent=G.round;banner('ROUND '+G.round);sfx.round();
      for(const p of players)if(p.dead||p.down){p.dead=p.down=false;p.hp=100;p.J.root.visible=true;if(p.remote)NET.ev.push(['rs']);else p.pos.set(0,0,5.2)}}

    const keys={},edge={},mouse={dx:0,dy:0,l:0,r:0,le:0};
    on(window,'keydown',e=>{if(!keys[e.code])edge[e.code]=1;keys[e.code]=1;if(G.state==='play'&&/^(Tab|Space|Arrow|Slash|Quote)/.test(e.code))e.preventDefault();if(e.code==='Escape'||e.code==='KeyP')G.state==='play'?pause():0});
    on(window,'keyup',e=>keys[e.code]=0);
    on(window,'mousemove',e=>{if(document.pointerLockElement){mouse.dx+=e.movementX;mouse.dy+=e.movementY}});
    on(window,'mousedown',e=>{if(G.state!=='play')return;if(!document.pointerLockElement)lock();if(e.button===0){mouse.l=1;mouse.le=1}if(e.button===2)mouse.r=1});
    on(window,'mouseup',e=>{if(e.button===0)mouse.l=0;if(e.button===2)mouse.r=0});
    on(window,'contextmenu',e=>e.preventDefault());
    on(window,'blur',()=>{for(const k in keys)keys[k]=0;mouse.l=mouse.r=0});
    on(document,'pointerlockchange',()=>{if(!document.pointerLockElement&&G.state==='play'&&G.locked)pause();G.locked=!!document.pointerLockElement});
    function lock(){const r=renderer.domElement.requestPointerLock&&renderer.domElement.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}
    function readPad(gp,I,prev){const dz=v=>Math.abs(v)<.18?0:v,b=i=>gp.buttons[i]&&gp.buttons[i].pressed?1:0,e=i=>b(i)&&!prev[i]?1:0;
      I.mx+=dz(gp.axes[0]||0);I.mz-=dz(gp.axes[1]||0);I.rx=dz(gp.axes[2]||0);I.ry=dz(gp.axes[3]||0);
      I.fire|=b(7);I.fireE|=e(7);I.ads|=b(6);I.use|=b(0);I.useE|=e(0);I.reloadE|=e(2);I.swapE|=e(3);I.meleeE|=e(1);I.viewE|=e(5);I.sprint|=b(10)|b(4);if(e(9)&&G.state==='play')pause();for(let i=0;i<12;i++)prev[i]=b(i)}
    function pollInput(dt){
      const pads=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean);
      for(const p of players){const I=p.I={mx:0,mz:0,ldx:0,ldy:0,rx:0,ry:0,mdx:0,mdy:0,fire:0,fireE:0,ads:0,use:0,useE:0,reloadE:0,swapE:0,meleeE:0,viewE:0,sprint:0};
        if(p.kbm){I.mx=(keys.KeyD?1:0)-(keys.KeyA?1:0);I.mz=(keys.KeyW?1:0)-(keys.KeyS?1:0);const s=.0022*(p.ads>.5?.6:1);I.ldx=mouse.dx*s;I.ldy=mouse.dy*s;I.mdx=mouse.dx;I.mdy=mouse.dy;
          I.fire=mouse.l;I.fireE=mouse.le;I.ads=mouse.r;I.use=keys.KeyF?1:0;I.useE=edge.KeyF?1:0;I.reloadE=edge.KeyR?1:0;I.swapE=edge.KeyQ?1:0;I.meleeE=edge.KeyE?1:0;I.viewE=edge.KeyV?1:0;I.sprint=keys.ShiftLeft?1:0}
        const gp=p.remote||G.pausedNet?null:VRS.on?(p.kbm?VRS.gp:null):G.n===1||G.net?pads[0]:p.i===1?pads[0]:pads[1];p.kb2=p.i===1&&!gp&&!G.net;p.useKey=p.kbm&&!(gp&&p.padUsed)?'F':p.kb2?'RIGHT SHIFT':'A';
        if(gp){readPad(gp,I,p.prev);const s=(p.ads>.5?1.5:3)*dt;I.ldx+=I.rx*s;I.ldy+=I.ry*s*.7;if(I.rx||I.ry||I.mx)p.padUsed=1}
        else if(p.kb2){I.mx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0);I.mz=(keys.ArrowUp?1:0)-(keys.ArrowDown?1:0);I.fire=keys.Enter||keys.Numpad0?1:0;I.fireE=edge.Enter||edge.Numpad0?1:0;I.use=keys.ShiftRight?1:0;I.useE=edge.ShiftRight?1:0;I.reloadE=edge.ControlRight?1:0;I.swapE=edge.Quote?1:0;I.meleeE=edge.Period?1:0;I.sprint=keys.Slash?1:0}}
      if(G.pausedNet)for(const p of players)for(const k in p.I)p.I[k]=0;
      mouse.dx=mouse.dy=0;mouse.le=0;for(const k in edge)delete edge[k]}

    function vpOf(i){const W=innerWidth,H=innerHeight;return G.n===1||G.net||G.state==='menu'?{x:0,y:0,w:W,h:H}:{x:i?W/2:0,y:0,w:W/2,h:H}}
    const outOf=(x,z)=>Math.abs(x)>HX+WT||Math.abs(z)>HZ+WT;
    const inside=(x,y,z,out)=>out?(Math.abs(x)>HX+WT+.2||Math.abs(z)>HZ+WT+.2)&&y>.15&&y<9:Math.abs(x)<HX-.12&&Math.abs(z)<HZ-.12&&y>hAt(x,z)+.15&&y<WH-.12&&!(Math.abs(Math.abs(x)-6)<.25&&z<2.12)&&!(Math.abs(Math.abs(x)-3.7)<.37&&Math.abs(z-4.4)<.37);
    const fwdOf=(p,o)=>o.set(-Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch));

    function shoot(p){
      const w=p.w[p.cur],W=WEAP[w.id],iso=p.view==='iso';w.mag--;p.cd=W.rate;p.recoil=1;if(!iso)p.pitch=Math.min(1.4,p.pitch+W.kick);p.spread=Math.min(1,p.spread+.25);sfx.shot(w.id);if(G.net)NET.ev.push(['f']);
      const vr=VRS.on&&p.kbm,gun=vr?VRS.guns[w.id]:p.view==='fp'?p.vms[w.id]:p.guns[w.id];gun.userData.fl.visible=true;if(vr)VRS.flT=.06;gun.userData.fl.material.rotation=rnd(TAU);p.flT=.05;p.mfl.intensity=9;
      const o=V3(),d=V3();let near=0;
      if(vr){o.copy(VRS.ao);d.copy(VRS.ad)}else if(iso){o.set(p.pos.x,p.pos.y+1.3,p.pos.z);d.set(-Math.sin(p.yaw),0,-Math.cos(p.yaw))}else{o.copy(p.cam.position);fwdOf(p,d);if(p.view==='tp')near=p.tpd+.35}
      p.cam.updateMatrixWorld();p.J.root.updateMatrixWorld(true);gun.userData.mz.getWorldPosition(tmp3);const mz=tmp3.clone();
      if(tDirty){targets=solids.concat(zHit);tDirty=false}
      const sp=W.spread*(1+p.spread*1.5)*(p.ads>.5?.45:1)+(iso?.01:0);
      for(let i=0;i<W.pellets;i++){const dd=d.clone();dd.x+=rnd(-sp,sp);dd.y+=rnd(-sp,sp)*(iso?.3:1);dd.z+=rnd(-sp,sp);dd.normalize();raycaster.set(o,dd);raycaster.near=near;raycaster.far=70;
        const h=raycaster.intersectObjects(targets,false)[0],end=h?h.point:o.clone().addScaledVector(dd,50);if(i<3)tracer(mz,end);
        if(Math.abs(end.x)>HX||Math.abs(end.z)>HZ)for(const w of windows){if(w.broken)continue;const t=w.ns?(w.z-o.z)/(end.z-o.z):(w.x-o.x)/(end.x-o.x);if(t>0&&t<1){const a=w.ns?o.x+(end.x-o.x)*t:o.z+(end.z-o.z)*t,y=o.y+(end.y-o.y)*t;if(Math.abs(a-w.c)<w.w/2&&y>SILL&&y<TOP)breakGlass(w)}}
        if(h){const z=h.object.userData.z;if(z){const part=h.object.userData.part,fo=W.pellets>1?clamp(1.3-h.distance/11,.25,1):1;dmgZ(z,W.dmg*fo*(part==='head'?W.head:part==='limb'?.75:1),p,part,h.point,dd.clone().negate())}
          else burst(h.point,h.face?h.face.normal:dd,5,.5,.45,.4,1.5)}}}
    function knife(p){p.melee=.55;sfx.knife();const fx=-Math.sin(p.yaw),fz=-Math.cos(p.yaw);let best=null,bd=1.9;
      for(const z of zombies){if(z.state==='dead'||z.state==='rise')continue;const dx=z.pos.x-p.pos.x,dz=z.pos.z-p.pos.z,d=Math.hypot(dx,dz);if(d<bd&&(dx*fx+dz*fz)/(d||1)>.45&&Math.abs(z.pos.y-p.pos.y)<1.3){bd=d;best=z}}
      if(best)dmgZ(best,150,p,'melee',tmp.set(best.pos.x,best.pos.y+1.35,best.pos.z).clone(),V3(-fx,.3,-fz))}

    function standY(x,z){let y=hAt(x,z);for(const w of windows){if(w.door||w.count)continue;const dep=Math.abs((x-w.x)*w.nx+(z-w.z)*w.nz-WT/2),lat=Math.abs(w.ns?x-w.x:z-w.z);if(dep<.8&&lat<w.w/2)y=Math.max(y,(1-dep/.8)*.95)}return y}
    function updP(p,dt){
      const I=p.I,H=p.hud,GST=G.net==='guest';if(p.remote&&p.tp){const k=Math.min(1,dt*12);p.pos.lerp(p.tp,k);p.yaw=angLerp(p.yaw,p.tyaw,k);p.pitch=lerp(p.pitch,p.tpitch,k)}
      if(VRS.on){if(p.view!=='fp')setView(p,'fp')}else if(I.viewE&&!p.kb2)setView(p,VIEWS[(VIEWS.indexOf(p.view)+1)%3]);if(p.kb2&&p.view!=='iso')setView(p,'iso');
      p.hurtT+=dt;p.flash=Math.max(0,p.flash-dt*1.5);p.hmT-=dt;p.cd-=dt;p.melee-=dt;p.recoil=Math.max(0,p.recoil-dt*7);p.spread=Math.max(0,p.spread-dt*2.5);
      if((p.flT-=dt)<0)for(const k in WEAP)p.guns[k].userData.fl.visible=p.vms[k].userData.fl.visible=false;p.mfl.intensity*=Math.max(0,1-dt*30);
      let prompt='',prog=0;
      if(p.dead){p.J.root.visible=false}
      else if(p.down){if(!GST){p.bleed-=dt;if(p.bleed<=0){p.dead=true;if(!upP().length)gameOver()}}}
      else{
        if(p.hurtT>4&&!GST)p.hp=Math.min(100,p.hp+28*dt);
        const iso=p.view==='iso';let fx,fz,rx,rz;
        if(iso){fx=fz=-.7071;rx=.7071;rz=-.7071;p.pitch=0;let ax=0,az=0;
          if(I.rx||I.ry){ax=rx*I.rx-fx*I.ry;az=rz*I.rx-fz*I.ry;p.aimPad=1}else if(I.mdx||I.mdy)p.aimPad=0;
          if(p.kbm&&!p.aimPad){const v=vpOf(p.i);p.cur2.x=clamp(p.cur2.x+I.mdx*2/v.w,-1,1);p.cur2.y=clamp(p.cur2.y-I.mdy*2/v.h,-1,1);raycaster.setFromCamera(p.cur2,p.ocam);const r=raycaster.ray,t=(p.pos.y+1.3-r.origin.y)/r.direction.y;ax=r.origin.x+r.direction.x*t-p.pos.x;az=r.origin.z+r.direction.z*t-p.pos.z}
          if(p.kb2){let bd=15,b=null;for(const z of zombies){if(z.state==='dead'||z.state==='rise')continue;const d=Math.hypot(z.pos.x-p.pos.x,z.pos.z-p.pos.z);if(d<bd){bd=d;b=z}}
            if(b){ax=b.pos.x-p.pos.x;az=b.pos.z-p.pos.z}else if(I.mx||I.mz){ax=rx*I.mx+fx*I.mz;az=rz*I.mx+fz*I.mz}}
          if(ax||az)p.yaw=angLerp(p.yaw,Math.atan2(-ax,-az),Math.min(1,dt*18))}
        else{if(VRS.on&&p.kbm){VRS.yaw-=I.ldx;p.yaw=VRS.yaw+VRS.hy;p.pitch=VRS.hp}else{p.yaw-=I.ldx;p.pitch=clamp(p.pitch-I.ldy,-1.4,1.4)}fx=-Math.sin(p.yaw);fz=-Math.cos(p.yaw);rx=-fz;rz=fx}
        const w=p.w[p.cur],W=WEAP[w.id];p.ads=lerp(p.ads,I.ads&&!p.rel&&!iso?1:0,Math.min(1,dt*12));
        let mx=I.mx,mz=I.mz;const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}
        const sprint=I.sprint&&mz>.3&&p.ads<.5,sp=sprint?5.6:p.ads>.5?2.2:3.7;p.sprinting=sprint&&ml>0;
        p.pos.x+=(rx*mx+fx*mz)*sp*dt;p.pos.z+=(rz*mx+fz*mz)*sp*dt;collide(p.pos,.33,'open');p.pos.x=clamp(p.pos.x,-YX+.7,YX-.7);p.pos.z=clamp(p.pos.z,-YZ+.7,YZ-.7);p.pos.y=lerp(p.pos.y,standY(p.pos.x,p.pos.z),Math.min(1,dt*14));p.mv=p.remote?p.tmv||0:Math.min(1,ml);p.bob+=p.mv*sp*dt;
        if(p.rel>0){p.rel-=dt;if(p.rel<=0){const n=Math.min(W.mag-w.mag,w.res);w.mag+=n;w.res-=n;p.rel=0}}
        const tryRel=()=>{if(!p.rel&&w.mag<W.mag&&w.res>0){p.rel=W.reload;sfx.reload(W.reload)}};
        if(I.reloadE)tryRel();
        if(I.swapE&&p.w.length>1){p.cur^=1;p.rel=0;p.cd=.35;showGun(p)}
        else if(I.meleeE&&p.melee<=0&&!p.rel)knife(p);
        else if((W.auto?I.fire:I.fireE)&&p.cd<=0&&!p.rel&&p.melee<=.2&&!p.sprinting){if(w.mag>0)shoot(p);else if(I.fireE){sfx.empty();tryRel()}}
        if(w.mag===0&&!p.rel&&p.cd<=0&&w.res>0)tryRel();
        let act=null;
        const mate=players.find(q=>q!==p&&q.down&&!q.dead&&Math.hypot(q.pos.x-p.pos.x,q.pos.z-p.pos.z)<1.8);
        if(mate)act={k:'rev',t:`Hold ${p.useKey} to revive`,dur:3,fn(){if(GST)return NET.ev.push(['rev']);mate.down=false;mate.hp=60;mate.hurtT=0;addPts(p,100)}};
        if(!act)for(const wn of windows){if(wn.count>=6||wn.vault)continue;if(Math.min(Math.hypot(wn.x-wn.nx*.6-p.pos.x,wn.z-wn.nz*.6-p.pos.z),Math.hypot(wn.x+wn.nx*.9-p.pos.x,wn.z+wn.nz*.9-p.pos.z))<1.5){act={k:'w'+windows.indexOf(wn),t:`Hold ${p.useKey} to board up ${wn.door?'the door':'the window'}`,dur:.75,fn(){if(GST)return NET.ev.push(['fix',windows.indexOf(wn)]);setPlank(wn,wn.count,true);wn.count++;sfx.hammer();addPts(p,10)}};break}}
        if(!act)for(const b of BUYS){if(Math.hypot(b.sx-p.pos.x,b.sz-p.pos.z)<1.4&&Math.abs(b.y-p.pos.y)<1){const own=p.w.find(x=>x.id===b.id),BW=WEAP[b.id],cost=own?BW.cost/2:BW.cost;
          act={k:'b'+b.id,t:`Hold ${p.useKey}: ${own?'ammo for the ':''}${BW.name} [${cost}]`,dur:.35,once:1,fn(){if(p.pts<cost){sfx.empty();return}if(own&&own.res>=BW.res&&own.mag>=BW.mag)return;p.pts-=cost;sfx.buy();if(GST)NET.ev.push(['buy',cost]);
            if(own){own.res=BW.res;own.mag=BW.mag}else{const nw={id:b.id,mag:BW.mag,res:BW.res};if(p.w.length<2){p.w.push(nw);p.cur=1}else p.w[p.cur]=nw;p.rel=0;showGun(p)}}};break}}
        if(act){prompt=act.t;if(I.use&&!(act.once&&p.actDone===act.k)){if(p.actKey!==act.k){p.actKey=act.k;p.useT=0}p.useT+=dt;prog=p.useT/act.dur;if(p.useT>=act.dur){act.fn();p.useT=0;if(act.once)p.actDone=act.k}}else{p.useT=0;if(!I.use)p.actDone=''}}else{p.useT=0;p.actKey=''}
        if(!GST)for(let i=powerups.length-1;i>=0;i--){const pw=powerups[i];if(Math.hypot(pw.s.position.x-p.pos.x,pw.s.position.z-p.pos.z)<.9){scene.remove(pw.s);powerups.splice(i,1);takePower(pw,p)}}
      }
      const J=p.J,r=J.root;r.position.copy(p.pos);r.rotation.y=p.yaw+Math.PI;
      if(p.down){r.rotation.x=lerp(r.rotation.x,-1.5,Math.min(1,dt*6));r.position.y=p.pos.y+.14}
      else if(p.C){r.rotation.x=0;const C=p.C,mv=p.mv||0,k=p.melee>0?Math.sin(p.melee/.55*Math.PI)*.9:0,rl=p.rel>0?.6:0;setAnim(C,mv>.1?(p.sprinting?'Run':'Walk'):'Idle',.15);C.acts[C.cur].timeScale=mv>.1?1.4:1;play(C,dt);
        twist(C,'Spine1',AX,-p.pitch*.45);twist(C,'RightArm',AX,-1.4-p.pitch*.4+rl-k);twist(C,'LeftArm',AX,-1.3-p.pitch*.4+rl);twist(C,'LeftArm',AY,.5);twist(C,'RightArm',AY,-.12);p.gunH.rotation.x=-p.pitch+rl;p.gunH.position.y=1.34+p.pitch*.25}
      else{r.rotation.x=0;const sw=Math.sin(p.bob*2.1),cw=Math.cos(p.bob*2.1),a=.55*(p.mv||0);J.legL.rotation.x=-sw*a;J.legR.rotation.x=sw*a;J.shinL.rotation.x=Math.max(0,cw)*a*1.4+.05;J.shinR.rotation.x=Math.max(0,-cw)*a*1.4+.05;
        J.torso.rotation.x=-p.pitch*.5+.05;J.neck.rotation.x=-p.pitch*.3;const k=p.melee>0?Math.sin(p.melee/.55*Math.PI)*.9:0,rl=p.rel>0?.7:0;J.armR.rotation.set(-1.45-p.pitch*.45+p.recoil*-.12+rl-k,0,-.12);J.armL.rotation.set(-1.3-p.pitch*.45+rl,0,.55);J.foreL.rotation.x=J.foreR.rotation.x=-.15}
      const by=p.pos.y,eye=by+(p.down?.4:1.62),bobY=p.down?0:Math.sin(p.bob*4.2)*.022*(p.mv||0);
      p.cam.rotation.set(p.pitch,p.yaw,0,'YXZ');
      if(p.view==='fp'||p.dead)p.cam.position.set(p.pos.x,eye+bobY,p.pos.z);
      else if(p.view==='tp'){fwdOf(p,tmp);const rx=Math.cos(p.yaw),rz=-Math.sin(p.yaw);let tx=p.pos.x,tz=p.pos.z,ty=by+(p.down?.7:1.62);const po=outOf(p.pos.x,p.pos.z);for(let s=.5;s>0;s-=.1){if(inside(p.pos.x+rx*s,ty,p.pos.z+rz*s,po)){tx+=rx*s;tz+=rz*s;break}}
        let d=2.5;for(;d>.2;d-=.15)if(inside(tx-tmp.x*d,ty-tmp.y*d,tz-tmp.z*d,po))break;p.tpd=d;p.cam.position.set(tx-tmp.x*d,ty-tmp.y*d,tz-tmp.z*d)}
      p.cam.fov=lerp(p.view==='tp'?66:78,p.view==='tp'?48:52,p.ads)+(p.sprinting?4:0);p.cam.updateProjectionMatrix();
      p.ocam.position.set(p.pos.x,by+1,p.pos.z).addScaledVector(ISO_D,9);p.ocam.lookAt(p.pos.x,by+1,p.pos.z);p.ocam.updateMatrixWorld();
      const vm=p.vm,rq=p.rel>0?Math.sin(clamp(1-p.rel/WEAP[p.w[p.cur].id].reload,0,1)*Math.PI):0,mk=p.melee>0?Math.sin(p.melee/.55*Math.PI):0,sx=Math.sin(p.bob*2.1)*.004*(p.mv||0)*(1-p.ads);
      vm.position.set(lerp(.085,0,p.ads)+sx-mk*.05,lerp(-.082,-.036,p.ads)-rq*.07+Math.abs(Math.cos(p.bob*2.1))*.004*(p.mv||0)*(1-p.ads)-(p.sprinting?.02:0),lerp(-.2,-.14,p.ads)+p.recoil*.018-mk*.06);
      vm.rotation.set(p.recoil*.09-rq*.8+(p.sprinting?-.25:0),mk*.8+(p.sprinting?.5:0),mk*-.6);
      fwdOf(p,tmp);const iso=p.view==='iso',sy=iso||p.view==='tp'?by+1.45:eye;if(iso)tmp.y=-.12;p.spot.position.set(p.pos.x+Math.cos(p.yaw)*.12+tmp.x*.3,sy-.06+tmp.y*.3,p.pos.z-Math.sin(p.yaw)*.12+tmp.z*.3);p.spot.target.position.copy(p.spot.position).addScaledVector(tmp,6);p.spot.intensity=p.down||p.dead?0:iso?26:16;
      p.mfl.position.set(p.pos.x+tmp.x*.7,by+1.45,p.pos.z+tmp.z*.7);
      const C=p.cache,S=(k,v,f)=>{if(C[k]!==v){C[k]=v;f(v)}},w=p.w[p.cur],W=WEAP[w.id];
      S('dmg',(Math.max(p.flash*.7,1-p.hp/100)*(p.down?0:1)).toFixed(2),v=>H.dmg.style.opacity=v);S('pts',p.pts,v=>H.pts.textContent=v);S('wn',W.name,v=>H.wn.textContent=v);
      S('am',w.mag+'/'+w.res+(p.rel>0?'r':''),()=>H.am.innerHTML=(p.rel>0?'<small>RELOADING</small> ':'')+w.mag+' <small>/ '+w.res+'</small>');
      S('pr',prompt,v=>H.prompt.textContent=v);S('bar',prog>0?1:0,v=>H.bar.style.display=v?'block':'none');if(prog>0)H.barb.style.width=Math.min(100,prog*100)+'%';
      S('hm',p.hmT>0?1:0,v=>H.hm.style.opacity=v);S('cr',iso||p.down?0:1,v=>H.cross.style.display=v?'block':'none');
      const gap=Math.round(6+p.spread*16+(p.mv||0)*5-p.ads*4);S('gap',gap,g=>{const s=H.ci;s[0].style.cssText=`left:${g}px;top:-1px;width:8px;height:2px`;s[1].style.cssText=`left:${-g-8}px;top:-1px;width:8px;height:2px`;s[2].style.cssText=`top:${g}px;left:-1px;width:2px;height:8px`;s[3].style.cssText=`top:${-g-8}px;left:-1px;width:2px;height:8px`});
      const showRet=iso&&p.kbm&&!p.aimPad&&!p.down;S('ret',showRet?1:0,v=>H.ret.style.display=v?'block':'none');if(showRet){H.ret.style.left=(p.cur2.x*.5+.5)*100+'%';H.ret.style.top=(.5-p.cur2.y*.5)*100+'%'}
      S('down',p.dead?'d':p.down?Math.ceil(p.bleed):'',v=>{H.down.style.display=v===''?'none':'block';H.down.textContent=v==='d'?'DEAD: BACK NEXT ROUND':'YOU ARE DOWN  '+v});S('pw',G.x2>0?Math.ceil(G.x2):0,v=>H.pw.textContent=v?'DOUBLE POINTS '+v:'')}

    let fieldT=0;
    function updGame(dt){
      G.time+=dt;G.x2-=dt;
      if(G.net==='guest'){}
      else if(G.between>0){G.between-=dt;if(G.between<=0)startRound()}
      else{const n=live(),cap=G.n>1?30:22;if(G.toSpawn>0){if((G.spawnT-=dt)<=0&&n<cap){spawnZ();G.toSpawn--;G.spawnT=Math.max(.35,rnd(1.2,2.6)-G.round*.12)}}else if(!n){G.between=9;banner('ROUND SURVIVED');for(const p of upP())addPts(p,100)}}
      for(const p of players)updP(p,dt);
      if(G.state!=='play'&&!(G.net&&G.state==='pause'))return;
      if((fieldT-=dt)<0){fieldT=.2;for(const p of players)field(p)}
      for(let i=zombies.length-1;i>=0;i--)if(!updZ(zombies[i],dt)){scene.remove(zombies[i].J.root);zombies.splice(i,1)}
      for(let i=powerups.length-1;i>=0;i--){const pw=powerups[i];if(G.net!=='guest')pw.t-=dt;pw.s.position.y=pw.y+Math.sin(G.time*3)*.08;pw.s.material.opacity=pw.t<5?.4+.6*Math.abs(Math.sin(pw.t*6)):1;if(pw.t<=0){scene.remove(pw.s);powerups.splice(i,1)}}
      for(const w of windows)for(const pl of w.planks)if(pl.a<1){pl.a=Math.min(1,pl.a+dt*7);pl.m.position.z=-w.sg*(1-pl.a)*.5}}
    function updFx(dt){
      for(let i=0;i<PN;i++){if(pLife[i]<=0)continue;const k=i*3;pLife[i]-=dt;pVel[k+1]-=9*dt;pPos[k]+=pVel[k]*dt;pPos[k+1]+=pVel[k+1]*dt;pPos[k+2]+=pVel[k+2]*dt;if(pPos[k+1]<.02){pPos[k+1]=.02;pVel[k]=pVel[k+2]=0}if(pLife[i]<=0)pPos[k+1]=-99}
      pGeo.attributes.position.needsUpdate=pGeo.attributes.color.needsUpdate=true;
      for(const t of tracers)if(t.t>0){t.t-=dt;t.l.material.opacity=t.t/.07;if(t.t<=0)t.l.visible=false}
      for(const d of debris)if(d.t>0){d.t-=dt;d.v.y-=9.8*dt;d.m.position.addScaledVector(d.v,dt);if(d.m.position.y<.03){d.m.position.y=.03;d.v.set(0,0,0);d.w.set(0,0,0);d.m.rotation.x=d.m.rotation.z=0}d.m.rotation.x+=d.w.x*dt;d.m.rotation.z+=d.w.z*dt;if(d.t<=0)d.m.visible=false}
      const T=performance.now()/1000;for(const f of flick){const n=f.fire?.75+.25*Math.sin(T*11+f.t)*Math.sin(T*7.3)+.1*Math.sin(T*23):(Math.sin(T*1.7+f.t)*Math.sin(T*13.1+f.t)>.93?.35:1);f.l.intensity=f.b*n}
      if((G.bolt-=dt)<0){G.bolt=rnd(14,34);G.boltT=.5;sfx.thunder()}
      if(G.boltT>0){G.boltT-=dt;const k=G.boltT>.38||(G.boltT<.3&&G.boltT>.22)?1:0;hemi.intensity=.8+k*3.2;scene.background.copy(SKY).lerp(BOLT,k*.6)}
      for(const[x,z]of embers)if(Math.random()<dt*12)burst(tmp.set(x,.95,z),tmp2.set(0,1,0),1,1,.5,.12,1.6)}

    function render(){
      const W=innerWidth,H=innerHeight;renderer.shadowMap.needsUpdate=true;renderer.setScissorTest(true);
      if(G.state==='menu'){const t=performance.now()/9000;menuCam.position.set(Math.sin(t)*30,7+Math.sin(t*.7)*2,13+Math.cos(t)*22);menuCam.lookAt(0,3.2,0);menuCam.aspect=W/H;menuCam.updateProjectionMatrix();clipP.constant=99;renderer.setViewport(0,0,W,H);renderer.setScissor(0,0,W,H);renderer.render(scene,menuCam);return}
      for(const p of players){if(p.remote)continue;const v=vpOf(p.i),iso=p.view==='iso'&&!p.dead;let cam=p.cam;
        if(iso){const hh=7,a=v.w/v.h;cam=p.ocam;cam.left=-hh*a;cam.right=hh*a;cam.top=hh;cam.bottom=-hh;cam.updateProjectionMatrix()}else{p.cam.aspect=v.w/v.h;p.cam.updateProjectionMatrix()}
        clipP.constant=iso?p.pos.y+CLIPY:99;renderer.setViewport(v.x,v.y,v.w,v.h);renderer.setScissor(v.x,v.y,v.w,v.h);renderer.render(scene,cam);renderer.shadowMap.needsUpdate=false}}
    function layout(){renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(LOW?1:Math.min(devicePixelRatio,G.n>1?1.5:2));for(const p of pool){const v=vpOf(p.i);p.hud.el.style.left=v.x+'px';p.hud.el.style.width=v.w+'px';p.hud.el.style.display=G.state==='menu'||p.i>=G.n||p.remote?'none':'block'}$('#split').style.display=G.n>1&&!G.net&&G.state!=='menu'?'block':'none'}
    on(window,'resize',layout);

    function start(n,net=''){
      audioInit();if(AC&&AC.state==='suspended')AC.resume();G.n=n;G.net=net;G.pausedNet=0;NET.ev.length=0;NET.by.clear();NET.last=performance.now();NET.lobby='';NET.t=0;G.round=0;G.between=3.5;G.toSpawn=0;G.x2=0;G.time=0;G.state='play';
      for(const z of zombies)scene.remove(z.J.root);zombies.length=0;zHit.length=0;tDirty=true;for(const pw of powerups)scene.remove(pw.s);powerups.length=0;
      for(const w of windows){w.vault=null;w.count=6;w.broken=!!w.door;for(const m of w.glass)m.visible=true;for(const pl of w.planks){pl.m.visible=true;pl.a=1;pl.m.position.z=0}}for(const d of decals)d.visible=false;
      while(pool.length<2)pool.push(makePlayer(pool.length));players.length=0;
      const pad=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean)[0];
      pool.forEach((p,i)=>{p.remote=!!net&&i===(net==='host'?1:0);p.kbm=net?!p.remote:i===0;p.tp=null;p.tmv=0;p.kb2=i===1&&!pad&&!net;if(net&&p.view==='iso'&&!p.kbm)p.view='fp';resetPlayer(p);const on=i<n;p.J.root.visible=on;p.spot.visible=on;if(on)players.push(p)});
      for(const id of['menu','pause','over'])$('#'+id).style.display='none';$('#round').style.display='block';$('#round').textContent='';layout();lock();banner('BOARD UP. HOLD OUT.',3000)}
    function pause(){if(G.state!=='play')return;G.state='pause';G.pausedNet=G.net?1:0;$('#pause').style.display='flex';if(document.pointerLockElement)document.exitPointerLock()}
    function gameOver(){G.state='over';if(document.pointerLockElement)document.exitPointerLock();$('#stats').innerHTML=`You held the house to round <b>${G.round}</b>.<br>`+players.slice(0,G.n).map(p=>`Player ${p.i+1}: ${p.kills} kills, ${p.heads} headshots, ${p.pts} points`).join('<br>');$('#over').style.display='flex'}
    function toMenu(){if(G.net&&NET.peer)BOARDED.tx(NET.peer,{k:'bye'});G.net='';NET.peer='';NET.lobby='';NET.inv=null;G.pausedNet=0;G.state='menu';for(const id of['pause','over'])$('#'+id).style.display='none';$('#menu').style.display='flex';$('#round').style.display='none';layout()}
    $('#b1').disabled=$('#b2').disabled=false;$('#load').textContent=Object.keys(A).length<Object.keys(PFID).length?'Some models did not load: stand-ins are used for those.':'';
    $('#b1').onclick=()=>start(1);$('#b2').onclick=()=>start(2);$('#bagain').onclick=()=>{if(G.net==='guest')$('#stats').innerHTML+='<br>The host starts the next game.';else start(G.n,G.net)};$('#bmenu').onclick=toMenu;$('#bquit').onclick=toMenu;
    $('#bres').onclick=()=>{$('#pause').style.display='none';G.state='play';G.pausedNet=0;lock()};
    const padNote=()=>{const n=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean).length;$('#padnote').textContent=n?'Gamepad found: player 2 plays on it, any view.':'No gamepad: player 2 shares the keyboard, isometric view with auto-aim. Press a button on a gamepad to use it.'};
    on(window,'gamepadconnected',padNote);on(window,'gamepaddisconnected',padNote);padNote();


    const NET={peer:'',lobby:'',inv:null,invT:0,sendT:0,t:0,ev:[],last:0,by:new Map(),want:'',timeout:7000},R2=v=>Math.round(v*100)/100,WID=Object.keys(WEAP),nameOf=id=>(BOARDED.peers().find(o=>o.id===id)||{}).name||'A PLAYER';
    const local=()=>players.find(p=>!p.remote),remote=()=>players.find(p=>p.remote);
    function fxShot(p){const id=p.w[p.cur].id,g=p.guns[id];sfx.shot(id);g.userData.fl.visible=true;p.flT=.05;p.mfl.intensity=9;p.recoil=1}
    function lobby(dt){const on=BOARDED.online(),hb=$('#bhost'),jb=$('#bjoin'),note=$('#netnote');hb.disabled=!on;hb.textContent=NET.lobby==='host'?'STOP HOSTING':'HOST ONLINE';
      if(NET.lobby==='host'&&(NET.sendT-=dt)<0){const P=BOARDED.peers();NET.sendT=Math.max(.1,1.5/Math.max(1,P.length));if(P.length)BOARDED.tx(P[(NET.pi=(NET.pi||0)+1)%P.length].id,{k:'open'})}
      if(NET.inv&&performance.now()-NET.invT>5000)NET.inv=null;jb.style.display=NET.inv&&NET.lobby!=='host'?'':'none';if(NET.inv)jb.textContent='JOIN '+nameOf(NET.inv);
      note.textContent=!on?'Online play needs the website, with another player in the arcade.':NET.lobby==='host'?'HOSTING. Waiting for a player in the arcade to run BOARDED UP at the booth and press JOIN.':NET.want?'Joining...':NET.msg||'Online: one of you hosts, the other joins from this menu. Each has a whole screen.'}
    function snap(){const me=local(),rm=remote(),o={k:'s',r:G.round,st:G.state==='over'?1:0,x2:Math.max(0,Math.ceil(G.x2)),b:G.between>0?1:0,
        z:zombies.filter(z=>z.state!=='dead').map(z=>[z.id,ZK.indexOf(z.kind),ZT.indexOf(z.tint),R2(z.pos.x),R2(z.pos.y),R2(z.pos.z),R2(z.yaw),ZS.indexOf(z.state),Math.round(z.speed*10),z.mv?1:0,R2(z.v.sc)]),
        w:windows.map(w=>w.count+(w.broken?10:0)),pw:powerups.map(q=>[q.id,R2(q.s.position.x),R2(q.s.position.z)]),
        h:[R2(me.pos.x),R2(me.pos.y),R2(me.pos.z),R2(me.yaw),R2(me.pitch),WID.indexOf(me.w[me.cur].id),me.dead?2:me.down?1:0,R2(me.mv||0),me.kills,me.heads,me.pts],
        g:rm?[Math.round(rm.hp),rm.dead?2:rm.down?1:0,Math.ceil(rm.bleed),rm.pts,rm.kills,rm.heads]:null,ev:NET.ev.splice(0,24)};
      let j=JSON.stringify({t:'bu',to:NET.peer,d:o});if(j.length>2400){o.z.length=Math.min(o.z.length,22);o.ev=o.ev.filter(e=>e[0]!=='f')}return o}
    function netTick(dt){const now=performance.now(),me=local();if(!NET.peer||!me)return;
      if(now-NET.last>NET.timeout){if(G.net==='host'){const rm=remote();G.net='';G.n=1;NET.peer='';if(rm){rm.remote=false;rm.J.root.visible=false;rm.spot.visible=false;players.splice(players.indexOf(rm),1)}banner('YOUR PARTNER LEFT',2500);layout()}else{NET.msg='The host left the game.';toMenu()}return}
      if((NET.t-=dt)>0)return;
      if(G.net==='host'){NET.t=1/12;BOARDED.tx(NET.peer,snap())}
      else{NET.t=1/15;BOARDED.tx(NET.peer,{k:'g',p:[R2(me.pos.x),R2(me.pos.y),R2(me.pos.z),R2(me.yaw),R2(me.pitch),WID.indexOf(me.w[me.cur].id),R2(me.mv||0)],ev:NET.ev.splice(0,20)})}}
    function setRemote(p,a,mv){if(!p)return;if(!p.tp){p.tp=V3(a[0],a[1],a[2]);p.pos.copy(p.tp)}p.tp.set(a[0],a[1],a[2]);p.tyaw=a[3];p.tpitch=a[4];p.tmv=mv;const id=WID[a[5]]||'pistol';if(p.w[0].id!==id||p.w.length>1){p.w=[{id,mag:9,res:9}];p.cur=0;showGun(p)}}
    function fromGuest(d){const rm=remote(),me=local();if(!rm||!Array.isArray(d.p))return;setRemote(rm,d.p,+d.p[6]||0);
      for(const e of d.ev||[]){if(e[0]==='f')fxShot(rm);
        else if(e[0]==='h'){const z=zombies.find(q=>q.id===e[1]);if(z)hurtZ(z,clamp(+e[2]||0,0,2000),rm,e[3]==='head'?'head':e[3]==='melee'?'melee':e[3]==='limb'?'limb':'body',V3(+e[4]||0,+e[5]||0,+e[6]||0),V3(+e[7]||0,+e[8]||0,+e[9]||0))}
        else if(e[0]==='fix'){const w=windows[e[1]|0];if(w&&w.count<6&&!w.vault){setPlank(w,w.count,true);w.count++;sfx.hammer();addPts(rm,10)}}
        else if(e[0]==='buy')rm.pts=Math.max(0,rm.pts-clamp(+e[1]||0,0,5000));
        else if(e[0]==='rev'&&me.down&&!me.dead&&Math.hypot(me.pos.x-rm.pos.x,me.pos.z-rm.pos.z)<3){me.down=false;me.hp=60;me.hurtT=0;addPts(rm,100)}}}
    function fromHost(d){const me=local(),hp=remote();if(!me)return;
      if(d.st===0&&G.state==='over'){const peer=NET.peer;start(2,'guest');NET.peer=peer;return}
      if(d.r!==G.round){G.round=d.r;$('#round').textContent=d.r||'';if(d.r){banner('ROUND '+d.r);sfx.round()}}G.x2=d.x2;
      if(d.b&&!G.wasB&&G.round)banner('ROUND SURVIVED');G.wasB=d.b;
      const seen=new Set();for(const a of d.z||[]){let z=NET.by.get(a[0]);if(!z){z=newZ(ZK[a[1]]||'',ZT[a[2]]||1,a[10]||1);z.id=a[0];z.net=1;z.pos.set(a[3],a[4],a[5]);z.yaw=a[6];NET.by.set(z.id,z)}if(z.state==='dead')continue;
        seen.add(z.id);z.tx=a[3];z.ty=a[4];z.tz=a[5];z.tyaw=a[6];const st=ZS[a[7]]||'chase';if(st!==z.state){if(st==='attack')z.atk=0;z.state=st}z.speed=a[8]/10;z.mv=a[9]}
      for(let i=zombies.length-1;i>=0;i--){const z=zombies[i];if(z.net&&z.state!=='dead'&&!seen.has(z.id)&&!(d.ev||[]).some(e=>e[0]==='d'&&e[1]===z.id)){for(const o of z.J.meshes){const k=zHit.indexOf(o);if(k>=0)zHit.splice(k,1)}tDirty=true;scene.remove(z.J.root);zombies.splice(i,1);NET.by.delete(z.id)}}
      (d.w||[]).forEach((v,i)=>{const w=windows[i];if(!w)return;const c=v%10;while(w.count>c){w.count--;setPlank(w,w.count,false);sfx.crack(vol(tmp.set(w.x,0,w.z)))}while(w.count<c){setPlank(w,w.count,true);w.count++;sfx.hammer()}if(v>=10)breakGlass(w)});
      const sig=JSON.stringify(d.pw||[]);if(sig!==NET.pwSig){NET.pwSig=sig;for(const q of powerups)scene.remove(q.s);powerups.length=0;for(const q of d.pw||[])if(PW[q[0]])dropPower(q[1],q[2],q[0])}
      if(hp&&d.h){setRemote(hp,d.h,+d.h[7]||0);hp.dead=d.h[6]===2;hp.down=d.h[6]>=1;hp.J.root.visible=!hp.dead;hp.kills=d.h[8];hp.heads=d.h[9];hp.pts=d.h[10]}
      if(d.g){const g=d.g;if(g[0]<me.hp-1){me.flash=1;me.hurtT=0;sfx.hurt()}me.hp=g[0];const wasDown=me.down;me.dead=g[1]===2;me.down=g[1]>=1;me.bleed=g[2];if(me.down&&!wasDown)banner('YOU ARE DOWN',2000);me.J.root.visible=!me.dead;
        if(g[3]>me.pts){const s=document.createElement('span');s.textContent='+'+(g[3]-me.pts);me.hud.pop.appendChild(s);setTimeout(()=>s.remove(),900)}me.pts=g[3];me.kills=g[4];me.heads=g[5]}
      for(const e of d.ev||[]){if(e[0]==='f'&&hp)fxShot(hp);
        else if(e[0]==='d'){const z=NET.by.get(e[1]);if(z&&z.state!=='dead'){killZ(z,null,e[3]?'head':'body',null);z.fall=e[2];NET.by.delete(e[1])}}
        else if(e[0]==='pw'){sfx.power();banner(({ammo:'AMMO FOR ALL',x2:'DOUBLE POINTS',rebuild:'WINDOWS BOARDED',blast:'BLAST'})[e[1]]||'',1800);if(e[1]==='ammo')for(const w of me.w)w.res=WEAP[w.id].res}
        else if(e[0]==='rs'){me.pos.set(0,0,5.2);me.dead=me.down=false}}
      if(d.st===1&&G.state!=='over'&&G.state!=='menu')gameOver()}
    function netRx(from,d){if(!d||typeof d!=='object')return;const k=d.k;
      if(k==='open'){if(G.state==='menu'&&NET.lobby!=='host'){NET.inv=from;NET.invT=performance.now()}}
      else if(k==='join'){if(NET.lobby==='host'&&G.state==='menu'){BOARDED.tx(from,{k:'ok'});start(2,'host');NET.peer=from}}
      else if(k==='ok'){if(NET.want===from&&G.state==='menu'){NET.want='';start(2,'guest');NET.peer=from}}
      else if(from!==NET.peer)return;
      else if(k==='s'&&G.net==='guest'){NET.last=performance.now();fromHost(d)}
      else if(k==='g'&&G.net==='host'){NET.last=performance.now();fromGuest(d)}
      else if(k==='bye')NET.last=-1e15}
    $('#bhost').onclick=()=>{NET.lobby=NET.lobby==='host'?'':'host';NET.sendT=0;NET.msg=''};
    $('#bjoin').onclick=()=>{if(!NET.inv)return;NET.want=NET.inv;NET.msg='';BOARDED.tx(NET.inv,{k:'join'});setTimeout(()=>{if(NET.want){NET.want='';NET.msg='No answer from the host.'}},4000)};

    const VRS={on:false,yaw:0,hy:0,hp:0,gp:null,last:0,saved:[],prev:[],ao:V3(),ad:V3(0,0,-1),guns:{},gunG:new THREE.Group(),flT:0,banner:'',bannerT:0,sig:''};
    scene.add(VRS.gunG);VRS.gunG.visible=false;for(const id in WEAP){const g=makeGun(id);g.visible=false;VRS.gunG.add(g);VRS.guns[id]=g}
    {const c=document.createElement('canvas');c.width=512;c.height=320;VRS.cv=c;VRS.tex=texOf(c,1);VRS.hud=new THREE.Mesh(new THREE.PlaneGeometry(.6,.375),new THREE.MeshBasicMaterial({map:VRS.tex,transparent:true,fog:false,depthTest:false}));VRS.hud.renderOrder=9;VRS.hud.visible=false;scene.add(VRS.hud)}
    function vrEnter(){VRS.on=true;VRS.saved=[];scene.traverse(o=>{const m=o.layers.mask;if(m===1<<L_ROOF||m===2||m===4){VRS.saved.push([o,m]);o.layers.set(0)}});VRS.sh=[moon.castShadow,pool.map(p=>p.spot.castShadow)];moon.castShadow=false;for(const p of pool)p.spot.castShadow=false;for(const f of flick)if(f.yard)f.l.visible=false;
      const me=local()||pool[0];VRS.yaw=me?me.yaw:0;VRS.gunG.visible=VRS.hud.visible=true;BOARDED.tone(true);BOARDED.veil(false)}
    function vrExit(){if(!VRS.on)return;VRS.on=false;for(const[o,m]of VRS.saved)o.layers.mask=m;VRS.saved=[];moon.castShadow=VRS.sh[0];pool.forEach((p,i)=>p.spot.castShadow=VRS.sh[1][i]);for(const f of flick)f.l.visible=true;VRS.gunG.visible=VRS.hud.visible=false;for(const p of players)if(!p.remote&&!p.dead)p.J.root.visible=true;BOARDED.tone(false);BOARDED.veil(BOARDED.on);last=performance.now()}
    function vrHud(){const me=local()||pool[0],now=performance.now(),L=[];let title='BOARDED UP';
      if(G.state==='menu'){L.push('A   SOLO');L.push(BOARDED.online()?(NET.lobby==='host'?'B   STOP HOSTING (WAITING FOR A PLAYER)':'B   HOST ONLINE'):'ONLINE NEEDS THE WEBSITE');if(NET.inv&&NET.lobby!=='host')L.push('X   JOIN '+nameOf(NET.inv));L.push('Y   LEAVE THE HOLODECK');L.push('');L.push('LEFT STICK WALK · RIGHT STICK TURN · TRIGGER FIRE');L.push('A USE · B KNIFE · X RELOAD · Y SWAP · LEFT GRIP RUN')}
      else if(G.state==='over'){title='THE HOUSE FELL';L.push('ROUND '+G.round);for(const p of players)L.push('PLAYER '+(p.i+1)+': '+p.kills+' KILLS, '+p.pts+' POINTS');L.push(G.net==='guest'?'THE HOST STARTS THE NEXT GAME':'A   AGAIN');L.push('Y   MENU')}
      else if(me){const w=me.w[me.cur];title='ROUND '+(G.round||'')+(G.x2>0?'   x2 '+Math.ceil(G.x2):'');L.push('HEALTH '+Math.max(0,Math.round(me.hp))+(me.dead?'   DEAD: BACK NEXT ROUND':me.down?'   DOWN '+Math.ceil(me.bleed):''));L.push(me.pts+' POINTS');L.push(WEAP[w.id].name+'   '+w.mag+' / '+w.res+(me.rel>0?'   RELOADING':''));if(me.cache.pr)L.push(me.cache.pr.toUpperCase());if(now<VRS.bannerT)L.push('> '+VRS.banner)}
      const sig=title+'|'+L.join('|');if(sig===VRS.sig)return;VRS.sig=sig;const g=VRS.cv.getContext('2d');g.clearRect(0,0,512,320);g.fillStyle='rgba(8,8,10,.72)';g.fillRect(0,0,512,320);g.strokeStyle='#a11';g.lineWidth=4;g.strokeRect(2,2,508,316);
      g.fillStyle='#d22';g.font='700 40px Impact,sans-serif';g.fillText(title,20,50);g.fillStyle='#eee';g.font='600 20px system-ui,sans-serif';L.forEach((t,i)=>{g.fillStyle=t[0]==='>'?'#f0d890':'#eee';g.fillText(t.slice(0,46),20,90+i*30)});VRS.tex.needsUpdate=true}
    function vrMenu(gp){const b=i=>gp&&gp.buttons[i]&&gp.buttons[i].pressed?1:0,e=i=>b(i)&&!VRS.prev[i];
      if(G.state==='menu'){if(e(0))start(1);else if(e(1)&&BOARDED.online())$('#bhost').onclick();else if(e(2)&&NET.inv)$('#bjoin').onclick();else if(e(3))STORE.holo.end()}
      else if(G.state==='over'){if(e(0))$('#bagain').onclick();else if(e(3))toMenu()}
      for(let i=0;i<8;i++)VRS.prev[i]=b(i)}
    function vrTick(gp){const now=performance.now(),dt=Math.min(.05,(now-(VRS.last||now))/1000);VRS.last=now;if(!VRS.on)vrEnter();VRS.gp=gp;
      if(G.state==='play'||(G.net&&G.state==='pause')){if(G.state==='pause'){G.state='play';G.pausedNet=0;$('#pause').style.display='none'}pollInput(dt);updGame(dt);for(let i=0;i<8;i++)VRS.prev[i]=gp&&gp.buttons[i]&&gp.buttons[i].pressed?1:0}else vrMenu(gp);
      if(G.net&&G.state!=='menu')netTick(dt);else if(G.state==='menu')lobby(dt);
      const me=local();if(me){me.J.root.visible=false;const id=me.w[me.cur].id;for(const k in WEAP)VRS.guns[k].visible=k===id&&G.state!=='menu';if((VRS.flT-=dt)<0)for(const k in WEAP)VRS.guns[k].userData.fl.visible=false}
      updFx(dt);vrHud()}
    function vrDolly(D,HL,HQ){const me=local(),inG=G.state!=='menu'&&me,f=tmp.set(0,0,-1).applyQuaternion(HQ);VRS.hy=Math.atan2(-f.x,-f.z);VRS.hp=Math.asin(clamp(f.y,-1,1));
      const c=Math.cos(VRS.yaw),s=Math.sin(VRS.yaw),ox=HL.x*c+HL.z*s,oz=-HL.x*s+HL.z*c,bx=inG?me.pos.x:0,by=inG?me.pos.y-(me.down?1.1:0):0,bz=inG?me.pos.z:6.5,y0=VR.y0!=null?VR.y0:HL.y;
      D.position.set(bx-ox,by+1.62-y0,bz-oz);D.rotation.set(0,VRS.yaw,0);D.scale.set(1,1,1);
      const yw=VRS.yaw+VRS.hy,hx=bx,hyy=by+1.62+(HL.y-y0),hz=bz,h=VR.hand?VR.hand('right'):null;
      if(h&&h.wp&&h.wq){VRS.ao.copy(h.wp);VRS.ad.set(0,0,-1).applyQuaternion(h.wq).normalize();VRS.gunG.position.copy(h.wp);VRS.gunG.quaternion.copy(h.wq)}
      else{fwdOf({yaw:yw,pitch:VRS.hp},VRS.ad);VRS.ao.set(hx,hyy,hz);VRS.gunG.position.set(hx+Math.cos(yw)*.2-Math.sin(yw)*.35,hyy-.25,hz-Math.sin(yw)*.2-Math.cos(yw)*.35);VRS.gunG.rotation.set(VRS.hp,yw,0,'YXZ')}
      VRS.gunG.rotateY(Math.PI);VRS.gunG.translateZ(-.05);
      const sd=G.state==='play'?-.42:0;VRS.hud.position.set(hx-Math.sin(yw)*.95+Math.cos(yw)*sd,hyy-(sd?.5:.3),hz-Math.cos(yw)*.95-Math.sin(yw)*sd);VRS.hud.rotation.set(-.4,yw+(sd?.35:0),0,'YXZ')}
    let last=performance.now();
    function frame(now){if(!BOARDED.on)return;requestAnimationFrame(frame);if(VR.on)return;if(VRS.on)vrExit();const dt=Math.min(.05,(now-last)/1000);last=now;
      if(G.state==='play'||(G.net&&G.state==='pause')){pollInput(dt);updGame(dt)}else{mouse.dx=mouse.dy=0}
      if(G.net&&G.state!=='menu')netTick(dt);else if(G.state==='menu')lobby(dt);
      updFx(dt);render()}
    $('#bleave').onclick=()=>STORE.holo.end();
    return{G,NET,VRS,scene,vr:vrTick,dolly:vrDolly,players,zombies,windows,start,spawnZ,hurtP,setView,toMenu,net:netRx,lobby,step(dt){scene.updateMatrixWorld();pollInput(dt);updGame(dt);if(G.net)netTick(dt);updFx(dt)},
      open(){for(const[t,e,f,o]of EV)t.addEventListener(e,f,o);layout();last=performance.now();requestAnimationFrame(frame);if(AC&&AC.state==='suspended')AC.resume()},
      close(){vrExit();for(const[t,e,f,o]of EV)t.removeEventListener(e,f,o);if(document.pointerLockElement)document.exitPointerLock();toMenu();for(const k in keys)keys[k]=0;mouse.l=mouse.r=0;if(AC)AC.suspend()}};
  })(); };
  const show=()=>{ if(!host){ host=document.createElement('div'); host.id='boarded'; host.style.cssText='position:fixed;inset:0;z-index:2147483000'; shadow=host.attachShadow({mode:'open'}); const st=document.createElement('style'), w=document.createElement('div'); st.textContent=CSS; w.id='wrap'; w.innerHTML=HTML; shadow.append(st,w); document.body.appendChild(host); } host.style.display='block'; };
  let tm=null; BOARDED.tone=on=>{ if(on&&!tm){ tm=[renderer.toneMapping,renderer.toneMappingExposure]; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.35; } else if(!on&&tm){ renderer.toneMapping=tm[0]; renderer.toneMappingExposure=tm[1]; tm=null; } };
  BOARDED.veil=on=>{ if(host)host.style.display=on?'block':'none'; };
  const DRIVE={draw:()=>{},pad:gp=>{ if(BOARDED.api&&VR.on)BOARDED.api.vr(gp); },dolly:(D,HL,HQ)=>{ if(BOARDED.api)BOARDED.api.dolly(D,HL,HQ); },get scene(){ return BOARDED.api&&VR.on?BOARDED.api.scene:null; }};
  const open=R=>{ show(); BOARDED.on=true; SHARED.drive=DRIVE; SHARED.target=null;
    (making||(making=LOAD('boarded').then(()=>MAKE()))).then(api=>{ BOARDED.api=api; if(BOARDED.on&&H.run===R)api.open(); }).catch(e=>{ console.warn('BOARDED UP',e); making=null; H.end(); SAY('THE HOLODECK COULD NOT LOAD BOARDED UP.','#c8a090'); }); };
  const close=()=>{ if(!BOARDED.on)return; BOARDED.on=false; SHARED.drive=null; if(BOARDED.api)BOARDED.api.close(); if(host)host.style.display='none'; };
  BOARDED.online=()=>!!ONLINE.on; BOARDED.peers=()=>[...ONLINE.others.values()].map(o=>({id:o.id,name:o.name})); BOARDED.tx=(to,d)=>ONLINE.send({t:'bu',to,d});
  const told=new Map(); ONLINE.hear.bu=m=>{ const from=m.from&&String(m.from), d=m.d; if(!from||!d)return; if(BOARDED.on&&BOARDED.api)return BOARDED.api.net(from,d);
    if(d.k==='open'&&!BOARDED.on&&performance.now()-(told.get(from)||-1e9)>60000){ told.set(from,performance.now()); const o=ONLINE.others.get(from); SAY(((o&&o.name)||'A PLAYER')+' IS HOSTING BOARDED UP. RUN IT AT THE HOLODECK BOOTH AND PRESS JOIN.','#7dffa4'); } };
  H.programs.push({ name:'BOARDED UP', cost:0, intro:'BOARDED UP. THEY COME THROUGH THE WINDOWS. ONE OR TWO PLAYERS, ON ONE SCREEN OR ONLINE.', go:R=>open(R), hide:()=>close() });
  window.BOARDEDDBG=()=>({on:BOARDED.on,ready:!!BOARDED.api,state:BOARDED.api?BOARDED.api.G.state:null,round:BOARDED.api?BOARDED.api.G.round:0}); }
