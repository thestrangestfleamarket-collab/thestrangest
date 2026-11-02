// ROAM: the holodeck's space flight. Pick it in the holodeck and it fades you into the cockpit of a small, worn ship among the meteors far off the map: a gritty cockpit painted pixel by pixel (scuffed gunmetal, chipped paint, cracked leather, grimy glass) lit by its own instruments, full 360° flight with a flight assist, boost, lasers and missiles that blow small rocks apart and break big ones up a piece at a time; ramming rocks cracks the glass and wears the hull, and a dead hull sends you back to the holodeck. The ship owns the controls and the camera through SHARED.drive (the frame, the headset and the gamepad read it). On screen the mouse or the arrows aim; in the headset the Quest sticks fly, or you reach out and take the stick and the throttle with your hands or controllers.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, PAD, pos, ROOMS, SFX, UI, VR, W3} from './003b-systems.js';
import {EffectComposer, OutputPass, PCAM, renderer, RenderPass} from './004-main.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {FADE, STORE, SYS, TILE} from './006-map-pre.js';
{ const H=STORE.holo, T=TILE, M=T/.84, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c), V3=THREE.Vector3, Q4=THREE.Quaternion;
  const WX=-4200, WZ=0, FIELD=620;
  const ROAM=window.ROAM={on:false,fake:null};
  let D=null, API=null;

  const MAKE=()=>{ '@roam';
    const TAU=Math.PI*2, cl=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,k)=>a+(b-a)*k, sm=t=>t*t*(3-2*t);
    let seed=11; const R=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; }, RR=(a,b)=>a+R()*(b-a);
    const hash=(x,y,z)=>{ let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(z|0,1442695041); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
    // value noise, tiling every `per` units when given (textures that repeat), 2D and 3D, and their octaves
    const vn=(x,y,s,per)=>{ let X=Math.floor(x),Y=Math.floor(y); const fx=sm(x-X),fy=sm(y-Y); const c=(i,j)=>{ let a=X+i,b=Y+j; if(per){ a=((a%per)+per)%per; b=((b%per)+per)%per; } return hash(a,b,s); };
      return lerp(lerp(c(0,0),c(1,0),fx),lerp(c(0,1),c(1,1),fx),fy); };
    const fb=(x,y,s,o,per)=>{ let v=0,a=.55,f=1,n=0; for(let k=0;k<o;k++){ v+=vn(x*f,y*f,s+k*31,per?per*f:0)*a; n+=a; a*=.5; f*=2; } return v/n; };
    const vn3=(x,y,z,s)=>{ const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z), fx=sm(x-X),fy=sm(y-Y),fz=sm(z-Z); const c=(i,j,k)=>hash(X+i+s*77,Y+j,Z+k);
      return lerp(lerp(lerp(c(0,0,0),c(1,0,0),fx),lerp(c(0,1,0),c(1,1,0),fx),fy),lerp(lerp(c(0,0,1),c(1,0,1),fx),lerp(c(0,1,1),c(1,1,1),fx),fy),fz); };
    const fb3=(x,y,z,s)=>vn3(x,y,z,s)*.55+vn3(x*2.1+7,y*2.1+3,z*2.1+1,s)*.27+vn3(x*4.3+2,y*4.3+9,z*4.3+5,s)*.18;
    const ridge=v=>1-Math.abs(2*v-1);

    // THE PAINT: every surface is written pixel by pixel (colour, height, roughness, metal), its bumps read from its own heights
    const cv=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
    const tex=(c,srgb,rep)=>{ const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(srgb)t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); if(rep)t.repeat.set(rep,rep); return t; };
    const std=o=>new THREE.MeshStandardMaterial(o);
    const normalOf=(hm,w,h,s)=>{ const out=cv(w,h), o=out.getContext('2d'), im=o.createImageData(w,h), p=im.data, Hh=(x,y)=>hm[((y+h)%h)*w+((x+w)%w)];
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const dx=(Hh(x+1,y)-Hh(x-1,y))*s, dy=(Hh(x,y+1)-Hh(x,y-1))*s, l=1/Math.hypot(dx,dy,1), i=(y*w+x)*4; p[i]=(-dx*l*.5+.5)*255; p[i+1]=(dy*l*.5+.5)*255; p[i+2]=l*255; p[i+3]=255; } o.putImageData(im,0,0); return out; };
    const pix=(w,h,fn,o={})=>{ const c=cv(w,h), g=c.getContext('2d'), im=g.createImageData(w,h), d=im.data, hm=new Float32Array(w*h), rc=cv(w,h), rg=rc.getContext('2d'), ri=rg.createImageData(w,h), rd=ri.data, P=[0,0,0,.5,.7,0];
      for(let j=0;j<h;j++)for(let i=0;i<w;i++){ fn((i+.5)/w,(j+.5)/h,P); const k=(j*w+i)*4; d[k]=cl(P[0],0,255); d[k+1]=cl(P[1],0,255); d[k+2]=cl(P[2],0,255); d[k+3]=255; hm[j*w+i]=P[3]; rd[k]=0; rd[k+1]=cl(P[4],0,1)*255; rd[k+2]=cl(P[5],0,1)*255; rd[k+3]=255; }
      g.putImageData(im,0,0); rg.putImageData(ri,0,0); if(o.after)o.after(g,w,h); const orm=tex(rc,0,o.rep);
      return std(Object.assign({map:tex(c,1,o.rep),normalMap:tex(normalOf(hm,w,h,o.bump==null?1.4:o.bump),0,o.rep),roughnessMap:orm,metalnessMap:orm,roughness:1,metalness:1},o.m||{})); };
    const set=(P,r,g,b,h,ro,me)=>{ P[0]=r; P[1]=g; P[2]=b; P[3]=h; P[4]=ro; P[5]=me; };
    const mixTo=(P,r,g,b,k)=>{ P[0]=lerp(P[0],r,k); P[1]=lerp(P[1],g,k); P[2]=lerp(P[2],b,k); };
    // scuffed gunmetal hull in panels: seams, rivets, bare metal worn through near the edges, grime running down, rust round a few rivets
    const hullMat=(dark)=>pix(512,512,(u,v,P)=>{ const g=fb(u*6,v*6,1,3,6), fine=vn(u*220,v*220,2,220), base=dark?30:44; set(P,base+g*16+fine*6,base+2+g*16+fine*6,base+7+g*15+fine*6,.5+g*.1,.6+fine*.12,.74);
        const pu=u*3,pv=v*3, lu=pu-Math.floor(pu), lv=pv-Math.floor(pv), du=Math.min(lu,1-lu), dv=Math.min(lv,1-lv), ds=Math.min(du,dv)/3;
        const st=fb(u*26,v*3,7,2,26), grime=sm(cl((st-.46)*3,0,1))*.5; mixTo(P,P[0]*.5,P[1]*.5,P[2]*.55,grime); P[4]+=grime*.25; P[5]-=grime*.3;
        const wear=Math.exp(-ds/.014)*cl((fb(u*40,v*40,3,2,40)-.38)*2.6,0,1); mixTo(P,138,140,146,wear); P[4]=lerp(P[4],.36,wear); P[5]=lerp(P[5],.96,wear);
        const snap=x=>Math.round((x-.06)*5)/5+.06; let rd=1, ri=0; for(const [ex,ey] of [[.06,snap(lv)],[.94,snap(lv)],[snap(lu),.06],[snap(lu),.94]]){ const d=Math.hypot(lu-ex,lv-ey); if(d<rd){ rd=d; ri=Math.round(ex*20+ey*7+pu*3+pv*11); } }
        const rr=.02; if(rd<rr){ const k=1-(rd/rr)*(rd/rr); mixTo(P,150,152,156,.9); P[3]+=.35*k; P[4]=.38; P[5]=.95; } else if(rd<.07&&hash(ri,3,5)>.72){ const k=(1-(rd-rr)/.05)*cl((fb(u*60,v*60,9,2,60)-.3)*2,0,1); mixTo(P,112,56,26,k*.85); P[4]=lerp(P[4],.85,k); P[5]=lerp(P[5],.15,k); }
        if(ds<.0045){ P[0]*=.3; P[1]*=.3; P[2]*=.3; P[3]-=.25; P[4]=.8; } },{rep:1,bump:1.6});
    // matte dash panels: fine grain, scuffs, stencilled labels and a hazard strip
    const dashMat=labels=>pix(512,512,(u,v,P)=>{ const g=fb(u*8,v*8,21,3,8), fine=vn(u*300,v*300,22,300), sc=ridge(fb(u*18,v*18,23,2,18)); set(P,24+g*8+fine*5,26+g*8+fine*5,30+g*8+fine*5,.5+fine*.04,.66+fine*.1,.28);
        if(sc>.9){ const k=(sc-.9)*10*cl((fb(u*9,v*9,24,2,9)-.5)*4,0,1); mixTo(P,120,118,112,k); P[4]=lerp(P[4],.45,k); P[5]=lerp(P[5],.8,k); }
        if(v>.962){ const s=Math.floor((u*22+v*3)%2); set(P,s?212:22,s?168:22,s?36:24,.5,.5,.3); P[0]*=.8+g*.3; P[1]*=.8+g*.3; } },
      {rep:1,bump:1,after:(g,w,h)=>{ if(!labels)return; g.font='bold 13px Arial, sans-serif'; g.fillStyle='rgba(205,196,172,.72)'; labels.forEach((l,i)=>g.fillText(l,22+(i%4)*124,46+Math.floor(i/4)*120)); g.strokeStyle='rgba(205,196,172,.35)'; g.lineWidth=1; for(let i=0;i<4;i++)g.strokeRect(12+i*124,28,104,92); }});
    // brushed steel, scratched, with fingermarks
    const steelMat=()=>pix(512,512,(u,v,P)=>{ const br=vn(u*2,v*600,31,600), g=fb(u*5,v*5,32,2,5), sc=ridge(fb(u*24,v*24,33,2,24)), fp=fb(u*6,v*6,34,2,6); set(P,118+br*30+g*12,120+br*30+g*12,126+br*30+g*12,.5+br*.03,.34+br*.14+(fp>.6?(fp-.6)*.9:0),.96);
        if(sc>.93){ const k=(sc-.93)/.07; mixTo(P,205,205,210,k); P[3]+=.08*k; P[4]=lerp(P[4],.22,k); } },{rep:1,bump:1});
    // cracked dark leather, shiny where it is sat on
    const leatherMat=()=>pix(512,512,(u,v,P)=>{ const g=fb(u*4,v*4,41,3,4), fine=vn(u*260,v*260,42,260), cr=ridge(fb(u*12,v*12,43,3,12)), wear=fb(u*2.5,v*2.5,44,2); set(P,40+g*14+fine*8,30+g*10+fine*6,24+g*8+fine*5,.5+fine*.08,cl(.78-wear*.4,.3,.9),0);
        const k=sm(cl((cr-.84)/.1,0,1)); mixTo(P,P[0]*.4,P[1]*.4,P[2]*.4,k); P[3]-=.3*k; },
      {rep:1,bump:1.4,after:(g,w,h)=>{ g.strokeStyle='rgba(190,160,110,.75)'; g.setLineDash([7,5]); g.lineWidth=2; for(const y of [128,256,384]){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); } }});
    // diamond-plate floor, grime in the lows
    const grateMat=()=>pix(256,256,(u,v,P)=>{ const cx=u*6, cy=v*6, ix=Math.floor(cx), iy=Math.floor(cy), lx=cx-ix-.5, ly=cy-iy-.5, a=((ix+iy)&1)?Math.PI/4:-Math.PI/4, rx=lx*Math.cos(a)+ly*Math.sin(a), ry=-lx*Math.sin(a)+ly*Math.cos(a), e=(rx/.36)*(rx/.36)+(ry/.14)*(ry/.14);
        const g=fb(u*8,v*8,51,3,8), fine=vn(u*200,v*200,52,200); set(P,62+g*14+fine*8,64+g*14+fine*8,68+g*14+fine*8,.42+fine*.03,.62+g*.2,.82); if(e<1){ const k=1-e; mixTo(P,112,114,118,k*.8); P[3]+=.35*k; P[4]=lerp(P[4],.4,k); } else { const gr=cl((fb(u*5,v*5,53,2,5)-.4)*2.5,0,1); mixTo(P,20,20,20,gr*.6); P[4]+=gr*.3; P[5]-=gr*.4; } },{rep:4,bump:2});
    const rubberMat=()=>pix(256,256,(u,v,P)=>{ const fine=vn(u*180,v*180,61,180), g=fb(u*5,v*5,62,2,5); set(P,16+fine*8+g*4,16+fine*8+g*4,18+fine*8+g*4,.5+fine*.05,.9,0); },{rep:1,bump:.8});
    const stripeMat=()=>pix(128,16,(u,v,P)=>{ const s=Math.floor(((u*8)+v*.5)%2), g=vn(u*60,v*8,71,60); set(P,s?200:24,s?160:24,s?30:26,.5,.6+g*.2,.2); P[0]*=.75+g*.4; P[1]*=.75+g*.4; },{rep:1,bump:.4});
    // rock: dark pitted stone with lighter dust in the bowls of its craters
    const CRT=[0,1,2].map(v=>Array.from({length:11},(_,i)=>({x:hash(i,v,91),y:hash(i,v,92),r:.05+hash(i,v,93)*.12,dust:hash(i,v,94)>.5})));
    const rockMat=v=>{ const B=[[72,68,64],[84,64,48],[46,48,54]][v]; return pix(512,512,(u,v2,P)=>{ const g=fb(u*5,v2*5,v*7+101,4,5), fine=vn(u*160,v2*160,v*7+102,160), sp=vn(u*40,v2*40,v*7+103,40); set(P,B[0]*(.6+g*.8)+fine*14,B[1]*(.6+g*.8)+fine*14,B[2]*(.6+g*.8)+fine*14,.5+g*.2+fine*.05,.94,.02); if(sp>.8)mixTo(P,20,18,16,(sp-.8)*4);
        for(const c of CRT[v]){ let dx=Math.abs(u-c.x), dy=Math.abs(v2-c.y); dx=Math.min(dx,1-dx); dy=Math.min(dy,1-dy); const d=Math.hypot(dx,dy)/c.r; if(d<1.25){ const bowl=d<1?(1-d*d):0, rim=Math.exp(-((d-1.02)/.12)*((d-1.02)/.12)); mixTo(P,P[0]*.55,P[1]*.55,P[2]*.55,bowl*.9); if(c.dust&&d<.6)mixTo(P,150,142,130,(.6-d)/.6*.7); mixTo(P,P[0]*1.3+20,P[1]*1.3+20,P[2]*1.3+20,rim*.7); P[3]+=-.45*bowl+.25*rim; } } },{rep:2,bump:2.2}); };
    const flat=o=>new THREE.MeshBasicMaterial(Object.assign({fog:false,toneMapped:false},o));
    // dirty glass: smears, wipe arcs and specks (its alpha), and a crack picture for when you have been hit
    const dirtCv=(()=>{ const c=cv(512,512), g=c.getContext('2d'); g.fillStyle='#262626'; g.fillRect(0,0,512,512); g.save(); g.filter='blur(7px)'; for(let i=0;i<34;i++){ g.fillStyle='rgba(255,255,255,'+RR(.05,.14)+')'; g.beginPath(); g.ellipse(R()*512,R()*512,RR(20,80),RR(8,40),R()*Math.PI,0,TAU); g.fill(); } g.restore();
      g.strokeStyle='rgba(255,255,255,.07)'; g.lineWidth=26; for(let i=0;i<5;i++){ g.beginPath(); g.arc(RR(100,400),RR(300,700),RR(200,420),Math.PI*1.1,Math.PI*1.9); g.stroke(); } for(let i=0;i<360;i++){ const v=Math.round(RR(70,130)); g.fillStyle='rgb('+v+','+v+','+v+')'; g.fillRect(R()*512,R()*512,1+R()*1.5,1+R()*1.5); }
      g.strokeStyle='rgba(255,255,255,.16)'; g.lineWidth=1; for(let i=0;i<40;i++){ const x=R()*512,y=R()*512,a=R()*TAU,l=RR(10,90); g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); } return c; })();
    const crackCv=(()=>{ const c=cv(512,512), g=c.getContext('2d'), cx=300, cy=210; g.strokeStyle='rgba(235,240,255,.9)'; g.lineCap='round';
      const branch=(x,y,a,l,w,depth)=>{ if(depth>4||l<6)return; g.lineWidth=w; g.beginPath(); g.moveTo(x,y); let px=x,py=y; const n=Math.ceil(l/9); for(let i=0;i<n;i++){ a+=RR(-.35,.35); px+=Math.cos(a)*9; py+=Math.sin(a)*9; g.lineTo(px,py); } g.stroke(); if(R()>.45)branch(px,py,a+RR(.4,1),l*RR(.35,.6),w*.7,depth+1); if(R()>.45)branch(px,py,a-RR(.4,1),l*RR(.35,.6),w*.7,depth+1); };
      for(let i=0;i<13;i++)branch(cx,cy,i/13*TAU+RR(-.2,.2),RR(60,210),RR(1.2,2.8),0); for(let r=12;r<60;r+=RR(8,16)){ g.lineWidth=1; g.beginPath(); g.arc(cx,cy,r,R()*TAU,R()*TAU+RR(1,4)); g.stroke(); }
      const rg=g.createRadialGradient(cx,cy,0,cx,cy,40); rg.addColorStop(0,'rgba(255,255,255,.75)'); rg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=rg; g.fillRect(cx-40,cy-40,80,80); return c; })();
    const glowCv=(c0,c1)=>{ const c=cv(128,128), g=c.getContext('2d'), rg=g.createRadialGradient(64,64,0,64,64,64); rg.addColorStop(0,c0); rg.addColorStop(.25,c1); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); };
    const nebulaCv=(s,c1,c2)=>{ const w=256, c=cv(w,w), g=c.getContext('2d'), im=g.createImageData(w,w), d=im.data; for(let j=0;j<w;j++)for(let i=0;i<w;i++){ const u=(i+.5)/w, v=(j+.5)/w, r=Math.hypot(u-.5,v-.5)*2; let fall=cl(1-r*r,0,1); fall*=fall; const n=fb(u*4,v*4,s,4), m=fb(u*7+3,v*7,s+5,3), a=cl((n-.4)*2.4,0,1)*fall, k=(j*w+i)*4; d[k]=lerp(c1[0],c2[0],m); d[k+1]=lerp(c1[1],c2[1],m); d[k+2]=lerp(c1[2],c2[2],m); d[k+3]=a*150; } g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };

    const MAT={hull:hullMat(1),hull2:hullMat(0),dash:dashMat(['FUEL','O2','NAV','ARM','PWR','COMM','ECS','HULL']),panel:dashMat(),steel:steelMat(),leather:leatherMat(),grate:grateMat(),rubber:rubberMat(),stripe:stripeMat(),
      glass:new THREE.MeshPhysicalMaterial({color:0xa9c2d6,transparent:true,opacity:.5,alphaMap:tex(dirtCv),roughness:.08,metalness:0,clearcoat:1,clearcoatRoughness:.1,side:THREE.DoubleSide,depthWrite:false}),
      rocks:[rockMat(0),rockMat(1),rockMat(2)]};
    const disposables=[]; const keep=x=>{ disposables.push(x); return x; };
    const mesh=(geo,mat,x,y,z,cast,recv)=>{ const m=new THREE.Mesh(keep(geo),mat); m.position.set(x,y,z); m.castShadow=!!cast; m.receiveShadow=recv!==false; return m; };
    const box=(w,h,d,mat,x,y,z,cast)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,cast);
    const sprite=(map,color,o)=>new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({map,color,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false},o||{})));
    const G_SOFT=glowCv('#ffffff','rgba(255,255,255,.55)'), G_FLASH=glowCv('#ffffff','rgba(255,170,90,.9)'), G_DUST=glowCv('rgba(120,110,100,.7)','rgba(90,85,80,.35)');

    // the room: ROOT (scaled to metres) holds SKYG (never turns), WORLD (the rocks, moved past the ship) and SHIP (turns with you)
    const RSCENE=new THREE.Scene(); RSCENE.background=new THREE.Color(0x000000);
    const ROOT=new THREE.Group(); ROOT.name='roam'; ROOT.position.set(WX,0,WZ); ROOT.scale.setScalar(M); ROOT.userData.anyRoom=1;
    const SKYG=new THREE.Group(), WORLD=new THREE.Group(), SHIP=new THREE.Group(); ROOT.add(SKYG,WORLD,SHIP);
    const SUNDIR=new V3(.55,.35,-.75).normalize();
    const sun=new THREE.DirectionalLight(0xe6ecff,2.0); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-.0008; sun.shadow.normalBias=.02;
    { const sc=sun.shadow.camera; sc.left=sc.bottom=-3.2*M; sc.right=sc.top=3.2*M; sc.near=.5*M; sc.far=40*M; sc.updateProjectionMatrix(); }
    const hemi=new THREE.HemisphereLight(0x4e5868,0x08080a,.08);

    // THE COCKPIT, in metres, the eye at the origin, forward -Z
    const dash=box(1.6,.07,.6,MAT.dash,0,-.44,-.82,true); dash.rotation.x=.22; SHIP.add(dash);
    SHIP.add(box(1.6,.42,.08,MAT.panel,0,-.68,-1.06,true)); SHIP.add(box(1.7,.06,.5,MAT.steel,0,-.9,-.85,true));
    const SCR=[]; const screen=(x,y,z,w,h,rot)=>{ const c=cv(320,200), g=c.getContext('2d'), t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
      const bez=box(w+.05,h+.05,.03,MAT.panel,x,y,z,true); bez.rotation.x=rot; const s=mesh(new THREE.PlaneGeometry(w,h),flat({map:t}),x,y,z,false,false); s.rotation.x=rot; s.position.z+=.017*Math.cos(rot); s.position.y+=-.017*Math.sin(rot);
      const gl=sprite(G_SOFT,0x2fe0c0,{opacity:.16}); gl.position.set(x,y,z+.06); gl.scale.set(w*1.9,h*1.9,1); SHIP.add(bez,s,gl); SCR.push({c,g,t,gl}); return s; };
    for(const x of [-.5,0,.5])screen(x,-.33,-.8,.36,.23,-.5);
    screen(0,.56,-.42,.2,.12,.9);
    for(const x of [-.6,.6]){ SHIP.add(box(.34,.1,.8,MAT.panel,x,-.5,-.25,true)); for(let i=0;i<6;i++)SHIP.add(box(.26,.006,.03,MAT.rubber,x,-.448,-.5+i*.045,false)); }
    for(let i=0;i<10;i++){ const x=-.6+i*.133, col=[0x30ff60,0xffb020,0x40a0ff,0xff3030][i%4], sw=box(.035,.05,.03,MAT.rubber,x,-.52,-1.0,false); sw.rotation.x=R()>.5?.4:-.4; SHIP.add(sw); SHIP.add(mesh(new THREE.SphereGeometry(.007,8,6),flat({color:col}),x,-.47,-1.02,false,false)); const lg=sprite(G_SOFT,col,{opacity:.35}); lg.position.set(x,-.47,-1.0); lg.scale.setScalar(.05); SHIP.add(lg); }
    const over=box(.8,.08,.36,MAT.panel,0,.62,-.3,true); over.rotation.x=.9; SHIP.add(over); for(let i=0;i<8;i++){ const sw=box(.03,.045,.03,MAT.rubber,-.3+i*.085,.6,-.2,false); sw.rotation.x=.9+(R()>.5?.4:-.4); SHIP.add(sw); }
    const stick=new THREE.Group(); stick.position.set(.6,-.45,-.2); { const base=mesh(new THREE.CylinderGeometry(.06,.08,.05,16),MAT.steel,0,0,0,true), boot=mesh(new THREE.CylinderGeometry(.03,.055,.08,10),MAT.rubber,0,.05,0,true), shaft=mesh(new THREE.CylinderGeometry(.013,.016,.2,10),MAT.steel,0,.12,0,true), grip=mesh(new THREE.CapsuleGeometry(.024,.11,6,12),MAT.rubber,0,.26,0,true), trig=box(.012,.03,.015,MAT.rubber,0,.23,-.03,false), hat=mesh(new THREE.SphereGeometry(.009,8,6),flat({color:0xff4040}),0,.32,0,false,false); stick.add(base,boot,shaft,grip,trig,hat); } SHIP.add(stick);
    const thr=new THREE.Group(); thr.position.set(-.6,-.45,-.2); { const slot=box(.05,.01,.3,MAT.rubber,0,0,0,false), arm=mesh(new THREE.BoxGeometry(.018,.16,.03),MAT.steel,0,.08,0,true), knob=box(.07,.05,.07,MAT.rubber,0,.17,0,true), det=box(.06,.004,.004,MAT.stripe,0,.006,-.12,false); thr.add(slot,arm,knob,det); } SHIP.add(thr);
    const endB=new THREE.Group(); endB.position.set(-.6,-.45,-.56); const endBtn=mesh(new THREE.CylinderGeometry(.03,.03,.02,20),flat({color:0x8a1010}),0,.022,0,false,false), endGlow=sprite(G_SOFT,0xff2020,{opacity:0}); endGlow.position.y=.04; endGlow.scale.setScalar(.12); endB.add(box(.1,.006,.1,MAT.stripe,0,0,0,false),mesh(new THREE.CylinderGeometry(.04,.042,.012,20),MAT.steel,0,.008,0,true),endBtn,endGlow); SHIP.add(endB);
    const seatBack=box(.56,.72,.12,MAT.leather,0,-.38,.3,true); seatBack.rotation.x=-.12; SHIP.add(seatBack,box(.56,.1,.5,MAT.leather,0,-.78,.05,true),box(.3,.2,.1,MAT.leather,0,.14,.26,true));
    for(const sx of [-1,1]){ SHIP.add(box(.1,.14,.5,MAT.leather,sx*.33,-.72,.05,true)); const strap=box(.05,.7,.02,MAT.rubber,sx*.14,-.4,.23,false); strap.rotation.x=-.12; strap.rotation.z=sx*.12; SHIP.add(strap); SHIP.add(box(.08,.5,1.7,MAT.hull2,sx*.8,-.68,-.3,true)); }
    SHIP.add(box(1.7,.04,1.7,MAT.grate,0,-1.16,-.3,false)); for(const sx of [-1,1]){ const p=box(.12,.02,.2,MAT.rubber,sx*.18,-1.02,-.95,false); p.rotation.x=.5; SHIP.add(p); }
    SHIP.add(box(1.7,1.5,.08,MAT.hull,0,-.3,.62,true));
    { const eject=mesh(new THREE.TorusGeometry(.05,.012,8,20),MAT.stripe,0,-.72,-.5,true); eject.rotation.x=Math.PI/2; SHIP.add(eject); const ext=mesh(new THREE.CylinderGeometry(.045,.045,.26,14),std({color:0x9a1a14,roughness:.5,metalness:.3}),-.72,-.95,.35,true); SHIP.add(ext); }
    // the canopy: a stretched dome of dirty glass with steel struts along it, rivets along the struts, cables along the bulkhead
    const DOME=new V3(0,-.15,-.25), DS=new V3(1.15,1.0,1.75), onDome=(th,ph)=>new V3(Math.sin(ph)*Math.cos(th)*DS.x,Math.cos(ph)*DS.y,-Math.sin(ph)*Math.sin(th)*DS.z).add(DOME);
    { const g=new THREE.SphereGeometry(1,40,24,0,TAU,0,Math.PI*.56); g.scale(DS.x,DS.y,DS.z); const glass=mesh(g,MAT.glass,DOME.x,DOME.y,DOME.z,false,false); glass.renderOrder=3; SHIP.add(glass); }
    const cracks=mesh(new THREE.PlaneGeometry(1.5,.95),flat({map:new THREE.CanvasTexture(crackCv),transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,.1,-1.0,false,false); cracks.rotation.x=-.3; cracks.renderOrder=4; cracks.visible=false; SHIP.add(cracks);
    const RIV=[]; const strut=(pts,r)=>{ const c=new THREE.CatmullRomCurve3(pts), m=mesh(new THREE.TubeGeometry(c,32,r,8,false),MAT.steel,0,0,0,true); SHIP.add(m); const n=Math.floor(c.getLength()/.11); for(let i=1;i<n;i++){ const p=c.getPointAt(i/n), out=p.clone().sub(DOME).normalize(); RIV.push(p.addScaledVector(out,r*.85)); } return m; };
    strut(Array.from({length:9},(_,i)=>onDome(Math.PI/2,Math.PI*.05+i*Math.PI*.5/8)),.032);
    for(const th of [Math.PI*.18,Math.PI*.82])strut(Array.from({length:9},(_,i)=>onDome(th,Math.PI*.1+i*Math.PI*.46/8)),.028);
    strut(Array.from({length:17},(_,i)=>onDome(i/16*Math.PI,Math.PI*.56)),.04);
    strut(Array.from({length:11},(_,i)=>onDome(Math.PI*.15+i/10*Math.PI*.7,Math.PI*.34)),.022);
    { const im=new THREE.InstancedMesh(keep(new THREE.SphereGeometry(.011,8,6)),MAT.steel,RIV.length), m4=new THREE.Matrix4(); RIV.forEach((p,i)=>im.setMatrixAt(i,m4.makeTranslation(p.x,p.y,p.z))); im.castShadow=true; SHIP.add(im); }
    for(const [pts,r] of [[[[-.7,.3,.55],[-.5,.55,.3],[-.2,.66,-.1],[0,.7,-.3]],.014],[[[.7,.2,.55],[.55,.5,.35],[.25,.64,-.05],[.05,.68,-.3]],.011],[[[-.8,-.4,.5],[-.78,-.42,.1],[-.76,-.48,-.3],[-.7,-.5,-.6]],.018]]){ const c=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))); SHIP.add(mesh(new THREE.TubeGeometry(c,20,r,6,false),MAT.rubber,0,0,0,true)); }
    // a lucky charm on a short tether, floating free in the cockpit; it leans with every push of the ship
    const charmM=mesh(new THREE.OctahedronGeometry(.03,0),std({color:0xc9a24a,roughness:.3,metalness:.95}),0,0,0,true), charmL=new THREE.InstancedMesh(keep(new THREE.SphereGeometry(.004,6,4)),MAT.steel,12); SHIP.add(charmM,charmL); const CH={a:new V3(.36,.46,-.56),p:new V3(.36,.33,-.56),v:new V3(),L:.14};
    // the hull outside the glass: the nose, the wing stubs, the two cannons, the thruster ports
    { const nose=mesh(new THREE.CylinderGeometry(.22,.62,3.6,8),MAT.hull,0,-1.3,-3.3,true); nose.rotation.x=-Math.PI/2; nose.rotation.y=Math.PI/8; SHIP.add(nose); SHIP.add(box(1.9,.3,1.2,MAT.hull,0,-1.25,-1.6,true));
      for(const sx of [-1,1]){ SHIP.add(box(1.3,.09,1.1,MAT.hull2,sx*1.3,-1.05,-1.7,true)); const can=mesh(new THREE.CylinderGeometry(.07,.09,1.9,12),MAT.steel,sx*1.75,-.95,-2.6,true); can.rotation.x=-Math.PI/2; SHIP.add(can); SHIP.add(mesh(new THREE.SphereGeometry(.05,10,8),flat({color:0xff5a20}),sx*1.75,-.95,-3.56,false,false));
        const lamp=mesh(new THREE.SphereGeometry(.035,8,6),flat({color:sx<0?0xff3030:0x30ff50}),sx*1.9,-1.0,-1.3,false,false); SHIP.add(lamp); const lg=sprite(G_SOFT,sx<0?0xff3030:0x30ff50,{opacity:.5}); lg.position.copy(lamp.position); lg.scale.setScalar(.3); SHIP.add(lg); } }
    const TIPS=[-1,1].map(sx=>{ const s=sprite(G_FLASH,0xff8040,{opacity:0}); s.position.set(sx*1.75,-.95,-3.6); s.scale.setScalar(.6); SHIP.add(s); return s; });
    const RCS=[[.9,-1.2,-3.0,'yawL'],[-.9,-1.2,-3.0,'yawR'],[0,-1.75,-3.0,'up'],[0,-.75,-3.0,'down'],[1.9,-.8,-1.6,'rollL'],[-1.9,-.8,-1.6,'rollR'],[1.9,-1.3,-1.6,'rollR'],[-1.9,-1.3,-1.6,'rollL']].map(([x,y,z,k])=>{ const s=sprite(G_SOFT,0xbfe0ff,{opacity:0}); s.position.set(x,y,z); s.scale.setScalar(.5); SHIP.add(s); return {s,k}; });
    const glow1=new THREE.PointLight(0xffa858,4,0,2); glow1.position.set(0,-.36,-.72); const glow2=new THREE.PointLight(0x3fd0ff,1.6,0,2); glow2.position.set(0,-.2,-.6); const warnL=new THREE.PointLight(0xff2020,0,0,2); warnL.position.set(0,.3,-.3); const boltL=new THREE.PointLight(0xff7a35,0,0,2); SHIP.add(glow1,glow2,warnL); WORLD.add(boltL);
    const warn=mesh(new THREE.SphereGeometry(.02,10,8),flat({color:0x330000}),0,-.3,-1.0,false,false); SHIP.add(warn); const warnG=sprite(G_SOFT,0xff2020,{opacity:0}); warnG.position.copy(warn.position); warnG.scale.setScalar(.25); SHIP.add(warnG);
    for(const sx of [-1,1]){ SHIP.add(box(.012,.006,1.1,flat({color:0xffb050}),sx*.74,-.47,-.3,false)); const g=sprite(G_SOFT,0xffb050,{opacity:.22}); g.position.set(sx*.74,-.44,-.3); g.scale.set(.35,.35,1); SHIP.add(g); }
    { SHIP.add(box(1.4,.006,.01,flat({color:0x2fe0c0}),0,-.92,-1.1,false)); const g=sprite(G_SOFT,0x2fe0c0,{opacity:.2}); g.position.set(0,-.9,-1.08); g.scale.set(1.2,.3,1); SHIP.add(g); }
    // the placard on the dash: the controls for how you are flying
    const plc=cv(512,256), plcT=new THREE.CanvasTexture(plc); plcT.colorSpace=THREE.SRGBColorSpace; const placard=mesh(new THREE.PlaneGeometry(.3,.15),flat({map:plcT}),0,-.52,-.735,false,false); placard.rotation.x=-1.1; SHIP.add(placard); let plcMode='';
    const writePlacard=mode=>{ if(mode===plcMode)return; plcMode=mode; const g=plc.getContext('2d'); g.fillStyle='#b9ad8f'; g.fillRect(0,0,512,256); for(let i=0;i<2500;i++){ const v=Math.round(RR(120,200)); g.fillStyle='rgba('+v+','+(v-10)+','+(v-30)+',.25)'; g.fillRect(R()*512,R()*256,2,2); } g.fillStyle='#2a2218'; g.font='bold 22px Arial, sans-serif'; g.fillText('ROAM-7   FLIGHT CARD',16,30); g.font='15px Arial, sans-serif';
      const L=mode==='hands'?['RIGHT HAND: TAKE THE STICK. LEAN IT, TWIST IT TO YAW.','PINCH TO FIRE THE LASERS.','LEFT HAND: THE THROTTLE. PUSH PAST THE STOP TO BOOST.','PINCH FOR A MISSILE.','THE RED BUTTON: HOLD IT TO END THE PROGRAM.']:mode==='vr'?['LEFT STICK: THROTTLE, ROLL.  RIGHT STICK: PITCH, YAW.','A: BOOST.  RIGHT TRIGGER: LASERS.  LEFT TRIGGER: MISSILE.','OR REACH OUT: GRIP THE STICK AND THE THROTTLE.','RIGHT STICK PRESS: RECENTRE.','HOLD Y, OR THE RED BUTTON: END THE PROGRAM.']:['W / S: THROTTLE.   A / D: ROLL.   MOUSE OR ARROWS: AIM.','SHIFT: BOOST.   SPACE: LASERS.   F: MISSILE.','WHEEL: THROTTLE.','HOLD Q: END THE PROGRAM.',''];
      L.forEach((l,i)=>g.fillText(l,16,66+i*32)); g.strokeStyle='#5a4a30'; g.lineWidth=3; g.strokeRect(6,6,500,244); plcT.needsUpdate=true; };
    // the sight: a ring where the cannons meet, red over a rock
    const ringCv=cv(128,128); { const g=ringCv.getContext('2d'); g.strokeStyle='#fff'; g.lineWidth=6; g.beginPath(); g.arc(64,64,40,0,TAU); g.stroke(); g.lineWidth=4; for(const [a,b,c,d] of [[64,4,64,22],[64,106,64,124],[4,64,22,64],[106,64,124,64]]){ g.beginPath(); g.moveTo(a,b); g.lineTo(c,d); g.stroke(); } g.beginPath(); g.arc(64,64,3,0,TAU); g.fillStyle='#fff'; g.fill(); }
    const sight=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(ringCv),color:0x60ff80,transparent:true,opacity:.8,depthTest:false,toneMapped:false})); sight.position.set(0,-.95,-70); sight.scale.setScalar(3.2); sight.renderOrder=5; SHIP.add(sight);

    // THE SKYG: stars, dust motes near the ship, the Milky Way, a sun with its flare, a ringed planet, nebulae
    const dotT=(()=>{ const dot=cv(32,32), dg=dot.getContext('2d'), rg=dg.createRadialGradient(16,16,0,16,16,16); rg.addColorStop(0,'#fff'); rg.addColorStop(.3,'rgba(255,255,255,.8)'); rg.addColorStop(1,'rgba(255,255,255,0)'); dg.fillStyle=rg; dg.fillRect(0,0,32,32); return new THREE.CanvasTexture(dot); })();
    { const n=3600, P=new Float32Array(n*3), C=new Float32Array(n*3); for(let i=0;i<n;i++){ const u=R()*2-1, a=R()*TAU, r=Math.sqrt(1-u*u), k=4400; P[i*3]=r*Math.cos(a)*k; P[i*3+1]=u*k; P[i*3+2]=r*Math.sin(a)*k; const w=RR(.25,1)*(R()<.08?1.6:1), t=R(); C[i*3]=w*(t<.2?.8:1); C[i*3+1]=w*(t<.2?.85:t>.85?.9:1); C[i*3+2]=w*(t<.2?1:t>.85?.7:1); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3));
      SKYG.add(new THREE.Points(keep(g),new THREE.PointsMaterial({size:2.4,sizeAttenuation:false,map:dotT,vertexColors:true,transparent:true,depthWrite:false,fog:false,toneMapped:false}))); }
    const DUST=(()=>{ const dn=500, DP=new Float32Array(dn*3); for(let i=0;i<dn;i++){ DP[i*3]=RR(-35,35); DP[i*3+1]=RR(-35,35); DP[i*3+2]=RR(-35,35); } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(DP,3));
      const p=new THREE.Points(keep(g),new THREE.PointsMaterial({size:.05,sizeAttenuation:true,map:dotT,color:0x9fb4c8,transparent:true,opacity:.55,depthWrite:false,fog:false,toneMapped:false,blending:THREE.AdditiveBlending})); p.frustumCulled=false; WORLD.add(p); return g.attributes.position; })();
    { const c=cv(1024,512), g=c.getContext('2d'); g.save(); g.filter='blur(14px)'; for(let i=0;i<260;i++){ const x=R()*1024, y=256+(R()+R()+R()-1.5)*70, r=RR(10,60), v=Math.round(RR(150,230)); g.fillStyle='rgba('+v+','+(v-10)+','+(v+20)+','+RR(.05,.16)+')'; g.beginPath(); g.ellipse(x,y,r*2,r,R()*Math.PI,0,TAU); g.fill(); } g.restore(); g.save(); g.filter='blur(6px)'; for(let i=0;i<60;i++){ const x=R()*1024, y=256+(R()+R()-1)*50, r=RR(8,30); g.fillStyle='rgba(10,8,16,'+RR(.2,.5)+')'; g.beginPath(); g.ellipse(x,y,r*2,r,R()*Math.PI,0,TAU); g.fill(); } g.restore();
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; const mw=mesh(new THREE.SphereGeometry(4300,32,16),flat({map:t,transparent:true,opacity:.7,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending}),0,0,0,false,false); mw.rotation.set(.6,.3,.4); SKYG.add(mw); }
    const sunS=sprite(glowCv('#ffffff','rgba(255,214,150,.9)'),0xffffff); sunS.position.copy(SUNDIR).multiplyScalar(4200); sunS.scale.setScalar(800); SKYG.add(sunS);
    const FLARE=[[.35,160,0xffb080],[.6,70,0x80c0ff],[.85,110,0xffd0a0],[1.3,50,0xa0ffd0]].map(([k,s,col])=>{ const f=sprite(G_SOFT,col,{opacity:0}); f.scale.setScalar(s); f.userData.k=k; SKYG.add(f); return f; });
    { const c=cv(1024,512), g=c.getContext('2d'); const bands=['#8a6a4e','#b8936a','#6e4e38','#a68362','#5a4030','#c4a683','#7d5a3e']; for(let y=0;y<512;y++){ const b=bands[Math.floor((y/512*14+Math.sin(y*.07)*.8))%bands.length]; g.fillStyle=b; g.fillRect(0,y,1024,1); } g.save(); g.filter='blur(5px)'; for(let i=0;i<300;i++){ const y=R()*512, x=R()*1024, w=RR(40,200), v=Math.round(RR(90,210)); g.fillStyle='rgba('+v+','+(v-30)+','+(v-70)+','+RR(.08,.22)+')'; g.beginPath(); g.ellipse(x,y,w,RR(3,9),0,0,TAU); g.fill(); } g.restore();
      { const rg=g.createRadialGradient(700,330,0,700,330,70); rg.addColorStop(0,'#caa08a'); rg.addColorStop(.7,'rgba(160,100,80,.7)'); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.beginPath(); g.ellipse(700,330,110,52,0,0,TAU); g.fill(); }
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; const pl=mesh(new THREE.SphereGeometry(430,48,32),std({map:t,roughness:1,metalness:0,emissive:0x120d0a,emissiveMap:t,emissiveIntensity:.3}),0,0,0,false,false); pl.position.set(2900,-1900,-2600); pl.rotation.z=.4; SKYG.add(pl);
      const rc=cv(512,8), rgc=rc.getContext('2d'); for(let x=0;x<512;x++){ const a=Math.max(0,Math.sin(x/512*Math.PI))*(.35+.65*vn(x*.09,0,0))*(x>60&&x<480?1:0); rgc.fillStyle='rgba(200,185,160,'+a.toFixed(3)+')'; rgc.fillRect(x,0,1,8); }
      const rt=new THREE.CanvasTexture(rc); rt.colorSpace=THREE.SRGBColorSpace; const rg=new THREE.RingGeometry(560,960,96,1); { const uv=rg.attributes.uv, p=rg.attributes.position; for(let i=0;i<uv.count;i++){ const r=Math.hypot(p.getX(i),p.getY(i)); uv.setXY(i,(r-560)/400,.5); } }
      const ring=mesh(rg,std({map:rt,alphaMap:rt,transparent:true,side:THREE.DoubleSide,roughness:.9,depthWrite:false}),0,0,0,false,false); ring.position.copy(pl.position); ring.rotation.set(Math.PI/2+.5,0,.4); SKYG.add(ring); }
    for(const [dir,s,c1,c2,sc] of [[new V3(-.7,.2,-.6),201,[120,40,170],[40,20,90],2600],[new V3(.3,-.6,.7),202,[30,120,130],[10,40,70],2200],[new V3(-.2,.7,.5),203,[150,80,40],[70,30,20],1800]]){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:nebulaCv(s,c1,c2),transparent:true,depthWrite:false,toneMapped:false,opacity:.6})); sp.position.copy(dir).normalize().multiplyScalar(4100); sp.scale.set(sc,sc*.8,1); SKYG.add(sp); }

    // THE FIELD: rocks are instances of six shapes (three looks, small and big), each a chunk of a meteor; a meteor is one chunk or a cluster
    const CR=[]; for(let v=0;v<3;v++){ const L=[]; for(let i=0;i<9;i++){ const p=new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize(); L.push({p,r:RR(.16,.5),d:RR(.06,.2)}); } CR.push(L); }
    const rockGeo=(v,detail)=>{ const g=new THREE.IcosahedronGeometry(1,detail), P=g.attributes.position, n=P.count, U=new V3();
      for(let i=0;i<n;i++){ U.fromBufferAttribute(P,i).normalize(); const x=U.x+v*7.1,y=U.y+v*3.3,z=U.z-v*5.7; let r=1+(fb3(x*1.3,y*1.3,z*1.3,v)-.5)*.9+(fb3(x*4,y*4,z*4,v+3)-.5)*.22;
        for(const c of CR[v]){ const d=U.distanceTo(c.p); if(d<c.r){ const t=d/c.r, bowl=-(1-t*t)*(1-t*t), rim=.4*Math.exp(-((t-.92)/.14)*((t-.92)/.14)); r+=c.d*(bowl+rim); } } P.setXYZ(i,U.x*r,U.y*r,U.z*r); }
      g.computeVertexNormals(); const N=g.attributes.normal, S=new Map(); const key=i=>Math.round(P.getX(i)*2e3)+','+Math.round(P.getY(i)*2e3)+','+Math.round(P.getZ(i)*2e3);
      for(let i=0;i<n;i++){ const k=key(i); let a=S.get(k); if(!a){ a=[0,0,0]; S.set(k,a); } a[0]+=N.getX(i); a[1]+=N.getY(i); a[2]+=N.getZ(i); }
      for(let i=0;i<n;i++){ const a=S.get(key(i)), l=1/(Math.hypot(a[0],a[1],a[2])||1); N.setXYZ(i,a[0]*l,a[1]*l,a[2]*l); } N.needsUpdate=true; g.computeBoundingSphere(); return g; };
    const GEO=[0,1,2].map(v=>[rockGeo(v,2),rockGeo(v,3)]); GEO.forEach(a=>a.forEach(keep));
    const IM=GEO.map((a,v)=>a.map((g,big)=>{ const m=new THREE.InstancedMesh(g,MAT.rocks[v],big?170:220); m.count=0; m.frustumCulled=false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); WORLD.add(m); return m; }));
    const SLOT=IM.map(a=>a.map(()=>[]));
    const chunks=[], meteors=[], M4=new THREE.Matrix4(), TQ=new Q4(), TV=new V3(), TV2=new V3(), TV3=new V3(), TC=new THREE.Color();
    const place=c=>{ const m=IM[c.v][c.big], L=SLOT[c.v][c.big]; if(m.count>=m.instanceMatrix.count){ c.i=-1; return; } c.i=m.count++; L[c.i]=c; m.setColorAt(c.i,TC.setHSL(RR(.04,.11),RR(.04,.18),RR(.32,.5))); if(m.instanceColor)m.instanceColor.needsUpdate=true; };
    const unplace=c=>{ if(c.i<0)return; const m=IM[c.v][c.big], L=SLOT[c.v][c.big], last=m.count-1, o=L[last]; if(o!==c){ L[c.i]=o; o.i=c.i; m.getMatrixAt(last,M4); m.setMatrixAt(c.i,M4); if(m.instanceColor){ m.getColorAt(last,TC); m.setColorAt(c.i,TC); m.instanceColor.needsUpdate=true; } } L.length=last; m.count=last; c.i=-1; };
    const mkMeteor=(cx,cy,cz,r)=>{ const v=Math.floor(R()*3), n=r<8?1:r<15?2+Math.floor(R()*3):6+Math.floor(R()*6), met={c:new V3(cx,cy,cz),r,vel:new V3(RR(-1,1),RR(-1,1),RR(-1,1)).multiplyScalar(RR(0,3.5)),chunks:[]};
      for(let k=0;k<n;k++){ const sc=n===1?r:r*RR(.5,.78), o=k?new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize().multiplyScalar(r*RR(.15,.5)):new V3(), s=new V3(sc*RR(.7,1.3),sc*RR(.7,1.2),sc*RR(.8,1.5));
        const c={met,v,big:sc>6?1:0,i:-1,p:o.add(met.c),q:new Q4().setFromEuler(new THREE.Euler(R()*TAU,R()*TAU,R()*TAU)),s,r:Math.max(s.x,s.y,s.z)*1.3,spin:new V3(RR(-1,1),RR(-1,1),RR(-1,1)).multiplyScalar(n===1?RR(.1,.7):RR(.02,.12)),dead:false};
        met.chunks.push(c); chunks.push(c); place(c); } meteors.push(met); return met; };
    const sizeOf=()=>{ const t=R(); return t<.45?RR(3.5,8):t<.8?RR(8,15):RR(15,32); };
    const seedField=()=>{ for(let i=0;i<120;i++){ const r=sizeOf(); let p; for(let k=0;k<20;k++){ p=new V3(RR(-FIELD,FIELD),RR(-FIELD,FIELD),RR(-FIELD,FIELD)); if(p.length()>90&&!meteors.some(m=>m.c.distanceTo(p)<m.r+r+30))break; } mkMeteor(p.x,p.y,p.z,r); } };
    const writeChunk=c=>{ if(c.i<0)return; IM[c.v][c.big].setMatrixAt(c.i,M4.compose(c.p,c.q,c.s)); };

    // shots, missiles, shards, flashes
    const boltG=keep(new THREE.BoxGeometry(.14,.14,3.6)), boltM=flat({color:0xff7a35,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false});
    const BOLTS=Array.from({length:28},()=>{ const m=new THREE.Mesh(boltG,boltM); const g=sprite(G_SOFT,0xff6a30,{opacity:.7}); g.scale.setScalar(1.6); m.add(g); m.visible=false; WORLD.add(m); return {m,on:false,p:new V3(),v:new V3(),life:0}; });
    const shardIM=new THREE.InstancedMesh(keep(rockGeo(1,1)),MAT.rocks[0],320); shardIM.count=0; shardIM.frustumCulled=false; shardIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); WORLD.add(shardIM);
    const SH=[]; const shard=(p,v0,r)=>{ if(SH.length>=320)SH.shift(); SH.push({p:p.clone(),v:new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize().multiplyScalar(RR(4,22)).add(v0),q:new Q4().setFromEuler(new THREE.Euler(R()*TAU,R()*TAU,R()*TAU)),spin:new V3(RR(-3,3),RR(-3,3),RR(-3,3)),s:r*RR(.08,.26),life:RR(1.6,3.2),t:0}); };
    const FX=Array.from({length:14},()=>{ const s=sprite(G_FLASH,0xffffff); s.visible=false; WORLD.add(s); const d=new THREE.Sprite(new THREE.SpriteMaterial({map:G_DUST,transparent:true,depthWrite:false,toneMapped:false})); d.visible=false; WORLD.add(d); return {s,d,on:false,t:0,r:1,p:new V3()}; });
    const BANG=[0,1].map(()=>{ const l=new THREE.PointLight(0xffa060,0,0,2); WORLD.add(l); return {l,t:0}; });
    const MIS=Array.from({length:6},()=>{ const g=new THREE.Group(); const body=mesh(new THREE.CylinderGeometry(.11,.11,1.3,10),MAT.steel,0,0,0,false,false); body.rotation.x=Math.PI/2; const nose=mesh(new THREE.ConeGeometry(.11,.34,10),MAT.panel,0,0,-.82,false,false); nose.rotation.x=-Math.PI/2; const band=mesh(new THREE.CylinderGeometry(.115,.115,.12,10),flat({color:0xffd040}),0,0,-.3,false,false); band.rotation.x=Math.PI/2;
      for(let k=0;k<4;k++){ const f=box(.02,.22,.26,MAT.panel,0,0,.55); f.rotation.z=k*Math.PI/2; f.position.set(Math.cos(k*Math.PI/2)*.14,Math.sin(k*Math.PI/2)*.14,.55); g.add(f); } const fl=sprite(G_FLASH,0xffa040); fl.position.z=.85; fl.scale.setScalar(.9); g.add(body,nose,band,fl); g.visible=false; WORLD.add(g); return {g,fl,on:false,p:new V3(),v:new V3(),tgt:null,life:0,st:0}; });
    const SMOKE=Array.from({length:70},()=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:G_DUST,transparent:true,depthWrite:false,toneMapped:false})); s.visible=false; WORLD.add(s); return {s,on:false,t:0}; });

    // the flight
    const S={q:new Q4(),w:new V3(),v:new V3(),a:new V3(),thr:.35,boost:false,speed:0,hull:100,score:0,heat:0,lock:0,mis:6,misT:0,fireT:0,side:1,shake:0,hurtT:0,dead:false,t:0,flash:0,tgt:null,tgtD:0,tipT:0};
    const IN={pitch:0,yaw:0,roll:0,thr:0,boost:0,fire:0,mis:0,end:0}, PADIN={pitch:0,yaw:0,roll:0,thr:0,boost:0,fire:0,mis:0,end:0,fresh:false}, KEY=new Set(), MOUSE={x:0,y:0,on:false,l:false,r:false,wheel:0}; let test=null, endHold=0, misEdge=false;
    const HAND={on:false,stick:null,thr:null,pitch:0,yaw:0,roll:0,thrV:null,boost:false,fire:0,mis:0,end:0,seen:0};
    const FWD=new V3(), UP=new V3(), RIGHT=new V3(), EYE=new V3(), WQ=new Q4(), HL0=new V3(), DQ=new Q4(), VQ=new Q4(); let yaw0=0, calOK=false;
    const sfx=(k,o)=>{ try{ return SFX.play(k,o); }catch(e){ return null; } };
    const worldOf=(p,out)=>out.copy(p).add(WORLD.position);

    const killChunk=(c,boom,big)=>{ if(c.dead)return; c.dead=true; unplace(c); const i=chunks.indexOf(c); if(i>=0)chunks.splice(i,1); const mc=c.met.chunks, j=mc.indexOf(c); if(j>=0)mc.splice(j,1);
      const n=Math.min(18,6+Math.round(c.r*.6)); for(let k=0;k<n;k++)shard(c.p,c.met.vel,c.r); flash(c.p,c.r*(big?2.2:1.4)); S.score++;
      worldOf(c.p,TV); const d=TV.length(); if(boom)sfx('boom',{pitch:cl(2.2-c.r*.08,.6,2.2),vol:cl(1.4-d/500,.08,1)*.9});
      if(!mc.length){ const mi=meteors.indexOf(c.met); if(mi>=0)meteors.splice(mi,1); respawn(); } };
    const respawn=()=>{ const r=sizeOf(); for(let k=0;k<20;k++){ const p=new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize().multiplyScalar(RR(FIELD*.75,FIELD)); if(FWD.dot(p)<FIELD*.3){ TV.copy(p).sub(WORLD.position); if(!meteors.some(m=>m.c.distanceTo(TV)<m.r+r+30)){ mkMeteor(TV.x,TV.y,TV.z,r); return; } } } };
    const flash=(p,r)=>{ const f=FX.find(f=>!f.on)||FX[0]; f.on=true; f.t=0; f.r=r; f.p.copy(p); f.s.visible=f.d.visible=true; f.s.position.copy(p); f.d.position.copy(p); const b=BANG[0].t<BANG[1].t?BANG[1]:BANG[0]; if(b.t<=0||r>8){ b.t=.5; b.l.position.copy(p); b.l.intensity=cl(r*r*60,400,30000); } };
    const fire=dt=>{ if(S.lock>0||S.heat>=1)return; S.fireT-=dt; if(S.fireT>0)return; S.fireT=.11; S.heat+=.065; if(S.heat>=1){ S.lock=1.6; sfx('latch',{pitch:.6}); } S.side=-S.side; S.tipT=.09;
      const b=BOLTS.find(b=>!b.on); if(!b)return; b.on=true; b.life=1.7; b.m.visible=true; TV.set(S.side*1.75,-.95,-3.6).applyQuaternion(S.q); b.p.copy(TV).sub(WORLD.position); b.v.copy(FWD).multiplyScalar(420).add(S.v); b.m.quaternion.copy(S.q); boltL.position.copy(b.p); boltL.intensity=260; sfx('laser',{pitch:RR(.9,1.1),vol:.5}); };
    const launch=()=>{ if(S.mis<=0){ sfx('latch',{pitch:.5}); return; } const m=MIS.find(m=>!m.on); if(!m)return; S.mis--; m.on=true; m.life=7; m.st=0; m.g.visible=true; TV.set(S.side*.9,-1.15,-1.5).applyQuaternion(S.q); m.p.copy(TV).sub(WORLD.position); m.v.copy(FWD).multiplyScalar(25).add(S.v); m.g.quaternion.copy(S.q); m.tgt=S.tgt||nearestAhead(.5); sfx('whoosh',{vol:.8}); };
    const nearestAhead=cosMin=>{ let best=null, bd=1e9; for(const c of chunks){ worldOf(c.p,TV); const d=TV.length(); if(d>900||d<1)continue; if(TV.dot(FWD)/d<cosMin)continue; const score=d*(1.4-TV.dot(FWD)/d); if(score<bd){ bd=score; best=c; } } return best; };
    const explode=(p,r,v0)=>{ flash(p,r); const L=[]; for(const c of chunks){ if(c.p.distanceTo(p)<r+c.r*.7)L.push(c); } for(const c of L)killChunk(c,false,true); for(let k=0;k<22;k++)shard(p,v0||TV3.set(0,0,0),r*.4); worldOf(p,TV); sfx('boom',{pitch:.55,vol:cl(1.5-TV.length()/600,.15,1)}); S.shake=Math.max(S.shake,cl(14/(1+TV.length()/30),0,.6)); };
    const hurt=(n,why)=>{ if(S.dead)return; S.hull=Math.max(0,S.hull-n); S.hurtT=.6; S.flash=1; S.shake=Math.max(S.shake,.5+n*.02); sfx('thud',{pitch:.5,vol:1}); sfx('clunk',{pitch:.7,vol:.8}); if(S.hull<=0)die(why); else if(S.hull<30)say('HULL CRITICAL.','#ff6a6a'); };
    const die=()=>{ S.dead=true; say('YOUR SHIP BREAKS UP. '+S.score+' ROCKS.'+(S.score>(window.ROAMBEST||0)?' A NEW BEST.':''),'#c8a090'); if(S.score>(window.ROAMBEST||0))window.ROAMBEST=S.score; sfx('boom',{pitch:.4,vol:1}); TV.set(0,0,0).sub(WORLD.position); flash(TV,12); setTimeout(()=>{ if(ROAM.on&&S.dead)H.end(); },1500); };

    const screens=()=>{ const g0=SCR[0].g, g1=SCR[1].g, g2=SCR[2].g, g3=SCR[3].g, W=320, Hh=200, hit=S.flash>0, fl=.85+Math.sin(S.t*37)*.05+(hash(Math.floor(S.t*15),1,1)<.04?-.3:0);
      const bg=(g,title)=>{ g.fillStyle=hit?'#2a0606':'#040909'; g.fillRect(0,0,W,Hh); g.strokeStyle='#143a3a'; g.lineWidth=2; g.strokeRect(3,3,W-6,Hh-6); for(let y=6;y<Hh;y+=3){ g.fillStyle='rgba(0,0,0,.22)'; g.fillRect(0,y,W,1); } g.globalAlpha=fl; g.font='bold 13px Consolas, Menlo, monospace'; g.fillStyle='#7fd9c6'; g.textAlign='left'; g.fillText(title,14,24); g.shadowColor='#4ff0d0'; g.shadowBlur=7; };
      const bar=(g,x,y,w,h,k,col)=>{ g.fillStyle='#0d1c1e'; g.fillRect(x,y,w,h); g.fillStyle=col; g.fillRect(x,y,Math.round(w*cl(k,0,1)),h); g.strokeStyle='#1e4a48'; g.lineWidth=1; g.strokeRect(x+.5,y+.5,w-1,h-1); };
      bg(g0,'RADAR  RANGE 600M'); { const cx=W/2,cy=Hh/2+8,rad=78; g0.strokeStyle='#17504a'; g0.lineWidth=1; for(const r of [26,52,78]){ g0.beginPath(); g0.arc(cx,cy,r,0,TAU); g0.stroke(); } g0.beginPath(); g0.moveTo(cx,cy-rad); g0.lineTo(cx,cy+rad); g0.moveTo(cx-rad,cy); g0.lineTo(cx+rad,cy); g0.stroke();
        const sw=(S.t*.9)%TAU; g0.strokeStyle='rgba(79,240,208,.5)'; g0.beginPath(); g0.moveTo(cx,cy); g0.lineTo(cx+Math.cos(sw)*rad,cy+Math.sin(sw)*rad); g0.stroke();
        const iq=TQ.copy(S.q).invert(); for(const m of meteors){ worldOf(m.c,TV).applyQuaternion(iq); const d=Math.hypot(TV.x,TV.z); if(d>600)continue; const k=rad/600, up=TV.y; g0.fillStyle=up>20?'#8fffe0':up<-20?'#2a8f7a':'#dfffee'; const s=cl(m.r*.25,2,6); g0.fillRect(cx+TV.x*k-s/2,cy+TV.z*k-s/2,s,s); }
        g0.fillStyle='#ffd060'; g0.beginPath(); g0.moveTo(cx,cy-6); g0.lineTo(cx-4,cy+4); g0.lineTo(cx+4,cy+4); g0.fill(); g0.fillStyle='#4a8f88'; g0.font='11px Consolas, Menlo, monospace'; g0.fillText('ROCKS NEAR '+meteors.filter(m=>worldOf(m.c,TV).length()<600).length,14,Hh-12); }
      bg(g1,'FLIGHT'); g1.fillStyle='#e8fff8'; g1.font='bold 40px Consolas, Menlo, monospace'; g1.fillText(Math.round(S.speed).toString().padStart(3,' '),22,74); g1.font='12px Consolas, Menlo, monospace'; g1.fillStyle='#7fd9c6'; g1.fillText('M/S'+(S.boost?'  BOOST':''),118,74);
        g1.fillText('THROTTLE',22,100); bar(g1,110,90,190,10,S.thr,'#4ff0d0'); g1.fillText('HULL',22,124); bar(g1,110,114,190,10,S.hull/100,S.hull>50?'#60ff80':S.hull>25?'#ffc040':'#ff5050');
        g1.fillText('LASER TEMP',22,148); bar(g1,110,138,190,10,S.heat,S.lock>0?'#ff5050':'#ff9a40'); g1.fillText('MISSILES',22,172); for(let i=0;i<6;i++){ g1.fillStyle=i<S.mis?'#ffd060':'#1a2a2c'; g1.fillRect(110+i*32,163,24,10); } if(S.mis<6){ g1.fillStyle='#4a8f88'; g1.fillRect(110,178,Math.round(190*S.misT/6),2); }
        g1.fillStyle='#ffd060'; g1.font='bold 13px Consolas, Menlo, monospace'; g1.textAlign='right'; g1.fillText('ROCKS '+S.score,W-16,24); g1.textAlign='left';
      bg(g2,'TARGET'); if(S.tgt){ const c=S.tgt, d=S.tgtD; g2.fillStyle='#e8fff8'; g2.font='bold 30px Consolas, Menlo, monospace'; g2.fillText(Math.round(d)+' M',22,70); g2.font='12px Consolas, Menlo, monospace'; g2.fillStyle='#7fd9c6'; g2.fillText(c.met.r<8?'SMALL ROCK  1 PIECE':c.met.r<15?'ROCK  '+c.met.chunks.length+' PIECES LEFT':'BIG ROCK  '+c.met.chunks.length+' PIECES LEFT',22,96);
          g2.strokeStyle='#ff6060'; g2.lineWidth=2; const bx=W/2,by=140,bs=26; for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ g2.beginPath(); g2.moveTo(bx+sx*bs,by+sy*(bs-10)); g2.lineTo(bx+sx*bs,by+sy*bs); g2.lineTo(bx+sx*(bs-10),by+sy*bs); g2.stroke(); } }
        else { g2.fillStyle='#2f6a66'; g2.font='bold 18px Consolas, Menlo, monospace'; g2.fillText('NO TARGET',22,70); g2.font='12px Consolas, Menlo, monospace'; g2.fillStyle='#4a8f88'; g2.fillText('LASERS BREAK ROCKS',22,100); g2.fillText('MISSILES BREAK BIG ONES',22,118); }
        g2.font='11px Consolas, Menlo, monospace'; g2.fillStyle='#4a8f88'; g2.fillText(HAND.seen?'THE RED BUTTON ENDS THE PROGRAM':VR.on?'HOLD Y: END PROGRAM':'HOLD Q: END PROGRAM',22,Hh-12);
      bg(g3,'SYS'); g3.font='12px Consolas, Menlo, monospace'; g3.fillStyle='#7fd9c6'; ['REACTOR  '+(92+Math.round(Math.sin(S.t*.7)*3))+'%','COOLANT  '+(S.boost?'HOT':'NOMINAL'),'O2  '+(97-Math.floor(S.t/60))+'%','ATT  '+(UP.y>=0?'+':'')+UP.y.toFixed(2),'CHARM  '+(CH.v.length()>.05?'LOOSE':'STILL')].forEach((l,i)=>g3.fillText(l,16,52+i*26));
      for(const s of SCR){ s.g.shadowBlur=0; s.g.globalAlpha=1; s.t.needsUpdate=true; s.gl.material.opacity=(hit?.3:.16)*fl; } };

    // reading the controls: keys and mouse on screen, the gamepad or the Quest sticks through SHARED.drive.pad, hands or controllers on the stick, the throttle and the red button
    const KEYS={w:1,a:1,s:1,d:1,arrowup:1,arrowdown:1,arrowleft:1,arrowright:1,shift:1,' ':1,f:1,q:1,r:1,e:1};
    const noUI=()=>!(UI.menuOpen||(PAD.panels&&PAD.panels().length));
    const onKey=e=>{ if(!ROAM.on||!noUI())return; const k=(e.key||'').toLowerCase(); if(!KEYS[k])return; if(e.type==='keydown')KEY.add(k); else KEY.delete(k); e.preventDefault(); e.stopImmediatePropagation(); };
    const onMove=e=>{ if(!ROAM.on)return; const el=renderer.domElement, r=el.getBoundingClientRect(); MOUSE.x=((e.clientX-r.left)/r.width-.5)*2; MOUSE.y=((e.clientY-r.top)/r.height-.5)*2; MOUSE.on=noUI(); };
    const onBtn=e=>{ if(!ROAM.on||!noUI())return; if(e.target!==renderer.domElement&&e.target!==document.body)return; const dn=e.type==='pointerdown'; if(e.button===0)MOUSE.l=dn; if(e.button===2){ MOUSE.r=dn; e.preventDefault(); } if(dn)e.stopImmediatePropagation(); };
    const onWheel=e=>{ if(!ROAM.on||!noUI())return; MOUSE.wheel-=Math.sign(e.deltaY)*.08; e.preventDefault(); e.stopImmediatePropagation(); };
    const onCtx=e=>{ if(ROAM.on)e.preventDefault(); };
    const onLeave=()=>{ MOUSE.on=false; MOUSE.l=MOUSE.r=false; };
    const dz=(v,d)=>Math.abs(v)<d?0:Math.sign(v)*(Math.abs(v)-d)/(1-d);
    const STICKP=new V3(.6,-.19,-.2), THRP=new V3(-.6,-.27,-.2), ENDP=new V3(-.6,-.42,-.56), HV=new V3(), HV2=new V3(), HQ2=new Q4();
    const hands=()=>{ HAND.pitch=HAND.yaw=HAND.roll=0; HAND.thrV=null; HAND.boost=false; HAND.fire=HAND.mis=HAND.end=0; HAND.on=false; const src=[]; let seen=0;
      if(VR.on){ for(const k of 'LR'){ const J=VR.joints&&VR.joints[k]; if(J&&J.wrist&&J.index){ seen++; HV.copy(J.wrist).lerp(J.index,.55); SHIP.worldToLocal(HV); src.push({h:k==='L'?'left':'right',p:HV.clone(),tip:SHIP.worldToLocal(J.index.clone()),q:J.q,hold:true,pinch:!!J.pinch}); } }
        for(const g of VR.grips||[]){ SHIP.worldToLocal(HV.copy(g.p)); HQ2.copy(WQ).invert().multiply(g.q); src.push({h:g.h,p:HV.clone(),tip:HV.clone().add(HV2.set(0,0,-.1).applyQuaternion(HQ2)),q:g.q,hold:g.grip>.5,pinch:g.trig>.5,ctl:true}); } }
      if(ROAM.fake)for(const f of ROAM.fake)src.push({h:f.h,p:new V3(...f.p),tip:new V3(...(f.tip||f.p)),q:f.q?new Q4(...f.q):WQ.clone(),hold:f.hold!==false,pinch:!!f.pinch});
      HAND.seen=seen;
      // the stick: a right hand close enough holds it (a controller must grip)
      const rh=src.find(s=>s.h==='right'&&s.hold&&s.p.distanceTo(STICKP)<(HAND.stick?.4:.17));
      if(rh){ HQ2.copy(WQ).invert().multiply(rh.q); HV2.set(0,0,-1).applyQuaternion(HQ2); const yaw=Math.atan2(-HV2.x,-HV2.z); if(!HAND.stick)HAND.stick={p0:rh.p.clone(),yaw0:yaw}; const d=HV.copy(rh.p).sub(HAND.stick.p0); let dy=yaw-HAND.stick.yaw0; dy=Math.atan2(Math.sin(dy),Math.cos(dy));
        HAND.pitch=cl(d.z/.06,-1,1); HAND.roll=cl(-d.x/.06,-1,1); HAND.yaw=cl(dy/.45,-1,1); HAND.fire=rh.pinch?1:0; HAND.on=true; } else HAND.stick=null;
      const lh=src.find(s=>s.h==='left'&&s.hold&&s.p.distanceTo(THRP)<(HAND.thr?.45:.17));
      if(lh){ if(!HAND.thr)HAND.thr={z0:lh.p.z,thr0:S.thr}; const push=(HAND.thr.z0-lh.p.z)/.2; HAND.thrV=cl(HAND.thr.thr0+push,0,1); HAND.boost=HAND.thr.thr0+push>1.12; HAND.mis=lh.pinch?1:0; HAND.on=true; } else HAND.thr=null;
      for(const s of src){ if(s.tip.distanceTo(ENDP)<.05||(!s.ctl&&s.p.distanceTo(ENDP)<.06)){ HAND.end=1; break; } }
      writePlacard(seen?'hands':VR.on?'vr':'screen'); };
    const DRIVE={
      pad:(gp,dt,hit,on)=>{ const ax=gp.axes, B=i=>(gp.buttons[i]&&gp.buttons[i].value)||0, q=gp===PAD.xr; let lx=dz(ax[0]||0,.12), ly=dz(ax[1]||0,.12), rx=dz(ax[2]||0,.12), ry=dz(ax[3]||0,.12);
        if(q&&VR.opt&&VR.opt.hand==='left'){ [lx,rx]=[rx,lx]; [ly,ry]=[ry,ly]; }
        PADIN.pitch=ry; PADIN.yaw=-rx; PADIN.roll=-lx; PADIN.thr=-ly; PADIN.boost=B(0)>.5?1:0; PADIN.fire=B(7)>.4?1:0; PADIN.mis=(B(6)>.5||B(2)>.5)?1:0; PADIN.end=(B(3)>.5||(!q&&B(1)>.5))?1:0; PADIN.fresh=true; },
      cam:(cam,dt)=>{ SHIP.updateMatrixWorld(true); SHIP.getWorldQuaternion(WQ); EYE.set(0,0,0); SHIP.localToWorld(EYE); if(S.shake>0){ EYE.x+=(R()-.5)*S.shake*.03*M; EYE.y+=(R()-.5)*S.shake*.03*M; } cam.position.copy(EYE); cam.quaternion.copy(WQ); if(S.shake>0)cam.quaternion.multiply(DQ.setFromEuler(new THREE.Euler((R()-.5)*S.shake*.01,(R()-.5)*S.shake*.01,0)));
        const fov=62+(S.boost?11:0); if(Math.abs(cam.fov-fov)>.05){ cam.fov+=(fov-cam.fov)*Math.min(1,dt*4); cam.updateProjectionMatrix(); } VQ.copy(cam.quaternion); W3.group.visible=false; },
      dolly:(DOLLY,HL,HQ)=>{ SHIP.updateMatrixWorld(true); SHIP.getWorldQuaternion(WQ); EYE.set(0,0,0); SHIP.localToWorld(EYE); if(!calOK){ HL0.copy(HL); TV.set(0,0,-1).applyQuaternion(HQ); yaw0=Math.atan2(-TV.x,-TV.z); calOK=true; }
        DOLLY.quaternion.copy(WQ).multiply(DQ.setFromAxisAngle(TV2.set(0,1,0),-yaw0)); DOLLY.scale.setScalar(M); DOLLY.position.copy(EYE).sub(TV.copy(HL0).multiplyScalar(M).applyQuaternion(DOLLY.quaternion)); VQ.copy(DOLLY.quaternion).multiply(HQ); if(VR.cam)VR.cam.far=9000/M; },
      recentre:()=>{ calOK=false; },
      scene:RSCENE,
      draw:()=>{ const sz=renderer.getDrawingBufferSize(V2); if(!COMP){ COMP=new EffectComposer(renderer); COMP.setPixelRatio(1); COMP.addPass(new RenderPass(RSCENE,PCAM)); BLOOM=new UnrealBloomPass(new THREE.Vector2(sz.x,sz.y),.5,.45,.82); COMP.addPass(BLOOM); COMP.addPass(new OutputPass()); COMP.setSize(sz.x,sz.y); } else if(COMP._w!==sz.x||COMP._h!==sz.y)COMP.setSize(sz.x,sz.y); COMP._w=sz.x; COMP._h=sz.y; COMP.render(); } };
    let COMP=null, BLOOM=null; const V2=new THREE.Vector2();
    const flare=()=>{ TV.set(0,0,-1).applyQuaternion(VQ); const k=TV.dot(SUNDIR), vis=cl((k-.55)/.4,0,1); EYE.set(0,0,0); SHIP.localToWorld(EYE); ROOT.worldToLocal(EYE);
      for(const f of FLARE){ f.material.opacity=vis*.35; if(vis>0){ TV2.copy(SUNDIR).lerp(TV,f.userData.k).normalize(); f.position.copy(EYE).addScaledVector(TV2,3000); } } };

    const step=dt=>{ if(!ROAM.on)return; dt=Math.min(dt||1/60,.05); S.t+=dt; if(FADE.busy&&S.t<1)return;
      hands();
      const k=KEY, mo=MOUSE.on&&!VR.on, mx=mo?dz(MOUSE.x,.07):0, my=mo?dz(MOUSE.y,.07):0, P=PADIN.fresh?PADIN:null, tI=test;
      IN.pitch=cl((k.has('arrowup')?1:0)-(k.has('arrowdown')?1:0)-my*1.3+(P?P.pitch:0)+HAND.pitch+(tI?tI.pitch||0:0),-1,1);
      IN.yaw=cl((k.has('arrowleft')?1:0)-(k.has('arrowright')?1:0)-mx*1.3+(P?P.yaw:0)+HAND.yaw+(tI?tI.yaw||0:0),-1,1);
      IN.roll=cl((k.has('a')?1:0)-(k.has('d')?1:0)+(P?P.roll:0)+HAND.roll+(tI?tI.roll||0:0),-1,1);
      IN.thr=cl((k.has('w')?1:0)-(k.has('s')?1:0)+(P?P.thr:0)+(tI?tI.thr||0:0),-1,1);
      IN.boost=k.has('shift')||(P&&P.boost)||HAND.boost||(tI&&tI.boost)?1:0; IN.fire=k.has(' ')||(MOUSE.l&&!VR.on)||(P&&P.fire)||HAND.fire||(tI&&tI.fire)?1:0; IN.mis=k.has('f')||(MOUSE.r&&!VR.on)||(P&&P.mis)||HAND.mis||(tI&&tI.mis)?1:0; IN.end=k.has('q')||(P&&P.end)||HAND.end?1:0; PADIN.fresh=false;
      if(k.has('r')||k.has('e'))calOK=false;
      endBtn.material.color.setHex(IN.end?0xff3020:0x8a1010); endGlow.material.opacity=IN.end?.6+Math.sin(S.t*30)*.3:0; endBtn.position.y=IN.end?.014:.022;
      if(IN.end){ endHold+=dt; if(endHold>1){ endHold=-9; say('PROGRAM ENDED.','#7dffa4'); H.end(); return; } } else endHold=Math.max(0,endHold);
      if(S.dead){ S.shake=Math.max(0,S.shake-dt*1.5); S.flash=1; } else {
        TV.set(IN.pitch*1.45,IN.yaw*1.0,IN.roll*2.3); S.w.lerp(TV,Math.min(1,dt*7)); const an=S.w.length()*dt; if(an>1e-6){ DQ.setFromAxisAngle(TV2.copy(S.w).normalize(),an); S.q.multiply(DQ).normalize(); }
        if(HAND.thrV!=null)S.thr=HAND.thrV; else S.thr=cl(S.thr+IN.thr*dt*.55+MOUSE.wheel,0,1); MOUSE.wheel=0; S.boost=!!IN.boost&&S.thr>.05; FWD.set(0,0,-1).applyQuaternion(S.q); UP.set(0,1,0).applyQuaternion(S.q); RIGHT.set(1,0,0).applyQuaternion(S.q);
        TV.copy(FWD).multiplyScalar(S.thr*(S.boost?230:95)); TV2.copy(S.v); S.v.lerp(TV,Math.min(1,dt*(S.boost?1.3:2.2))); S.a.copy(S.v).sub(TV2).divideScalar(Math.max(dt,1e-3)); S.speed=S.v.length(); WORLD.position.addScaledVector(S.v,-dt);
        if(WORLD.position.lengthSq()>2000*2000){ for(const c of chunks)c.p.add(WORLD.position); for(const m of meteors)m.c.add(WORLD.position); for(const b of BOLTS)if(b.on)b.p.add(WORLD.position); for(const m of MIS)if(m.on)m.p.add(WORLD.position); for(const s of SH)s.p.add(WORLD.position); for(const f of FX)if(f.on){ f.p.add(WORLD.position); f.s.position.copy(f.p); f.d.position.copy(f.p); } for(const s of SMOKE)if(s.on)s.s.position.add(WORLD.position); for(const b of BANG)b.l.position.add(WORLD.position); boltL.position.add(WORLD.position); for(let i=0;i<DUST.count;i++)DUST.setXYZ(i,DUST.getX(i)+WORLD.position.x,DUST.getY(i)+WORLD.position.y,DUST.getZ(i)+WORLD.position.z); DUST.needsUpdate=true; WORLD.position.set(0,0,0); }
        S.heat=Math.max(0,S.heat-dt*.32); if(S.lock>0){ S.lock-=dt; if(S.lock<=0)S.heat=Math.min(S.heat,.5); } if(IN.fire)fire(dt); else S.fireT=Math.min(S.fireT,.05);
        if(IN.mis&&!misEdge)launch(); misEdge=!!IN.mis; if(S.mis<6){ S.misT+=dt; if(S.misT>=6){ S.misT=0; S.mis++; } }
        S.hurtT=Math.max(0,S.hurtT-dt); S.shake=Math.max(0,S.shake-dt*2.2); S.flash=Math.max(0,S.flash-dt*2);
        S.tgt=nearestAhead(.985); if(S.tgt){ worldOf(S.tgt.p,TV); S.tgtD=TV.length(); } sight.material.color.setHex(S.tgt?0xff6060:0x60ff80);
      }
      // the rocks drift and tumble, wrap round the field, and hit the ship
      for(const m of meteors){ if(m.vel.lengthSq()>0){ m.c.addScaledVector(m.vel,dt); for(const c of m.chunks)c.p.addScaledVector(m.vel,dt); }
        worldOf(m.c,TV); for(const a of 'xyz'){ const s=TV[a]>FIELD?-2*FIELD:TV[a]<-FIELD?2*FIELD:0; if(s){ m.c[a]+=s; for(const c of m.chunks)c.p[a]+=s; TV[a]+=s; } }
        if(!S.dead&&S.hurtT<=0&&TV.length()<m.r*1.3+3)for(const c of m.chunks){ worldOf(c.p,TV2); const d=TV2.length(); if(d<c.r*.9+2.4){ const rel=TV3.copy(S.v).sub(m.vel).length();
          if(c.r<4.5){ killChunk(c,true,false); hurt(cl(rel*.08+4,4,16),'rock'); } else { hurt(cl(rel*.18+6,8,45),'rock'); TV2.normalize(); const vn_=Math.max(0,S.v.dot(TV2)); S.v.addScaledVector(TV2,-2*vn_).multiplyScalar(.45); WORLD.position.addScaledVector(TV2,c.r*.9+2.6-d); } break; } } }
      for(const c of chunks){ if(c.spin.lengthSq()>0){ const a=c.spin.length()*dt; DQ.setFromAxisAngle(TV.copy(c.spin).normalize(),a); c.q.multiply(DQ); } writeChunk(c); }
      for(const a of IM)for(const m of a){ m.instanceMatrix.needsUpdate=true; }
      // the dust motes stay round the ship
      { let ch=false; for(let i=0;i<DUST.count;i++){ let x=DUST.getX(i),y=DUST.getY(i),z=DUST.getZ(i); const rx=x+WORLD.position.x, ry=y+WORLD.position.y, rz=z+WORLD.position.z; if(rx>35)x-=70; else if(rx<-35)x+=70; if(ry>35)y-=70; else if(ry<-35)y+=70; if(rz>35)z-=70; else if(rz<-35)z+=70; if(x!==DUST.getX(i)||y!==DUST.getY(i)||z!==DUST.getZ(i)){ DUST.setXYZ(i,x,y,z); ch=true; } } if(ch)DUST.needsUpdate=true; }
      // bolts fly and break rocks
      boltL.intensity*=Math.max(0,1-dt*14);
      for(const b of BOLTS){ if(!b.on)continue; b.life-=dt; TV.copy(b.v).multiplyScalar(dt); let hit=null, hd=1e9; const L2=TV.lengthSq();
        for(const c of chunks){ TV2.copy(c.p).sub(b.p); const t=L2>0?cl(TV2.dot(TV)/L2,0,1):0; const d=TV2.sub(TV3.copy(TV).multiplyScalar(t)).length(); if(d<c.r*.92&&t<hd){ hd=t; hit=c; } }
        if(hit){ killChunk(hit,true,false); b.on=false; b.m.visible=false; continue; } b.p.add(TV); if(b.life<=0){ b.on=false; b.m.visible=false; } else b.m.position.copy(b.p); }
      S.tipT=Math.max(0,S.tipT-dt); for(const t of TIPS)t.material.opacity=S.tipT>0?.9:0;
      // missiles chase and burst
      for(const m of MIS){ if(!m.on)continue; m.life-=dt; m.st+=dt; if(m.tgt&&m.tgt.dead)m.tgt=null; if(!m.tgt&&m.st>.4)m.tgt=((c)=>c&&c.p.distanceTo(m.p)<700?c:null)(nearestAhead(.3));
        const sp=Math.min(190,25+m.st*110); if(m.tgt){ TV.copy(m.tgt.p).sub(m.p).normalize(); TV2.copy(m.v).normalize(); const k2=Math.min(1,dt*2.8); TV2.lerp(TV,k2).normalize(); m.v.copy(TV2).multiplyScalar(sp); } else m.v.setLength(sp);
        m.p.addScaledVector(m.v,dt); m.g.position.copy(m.p); m.g.quaternion.setFromUnitVectors(TV3.set(0,0,-1),TV2.copy(m.v).normalize()); m.fl.scale.setScalar(.7+R()*.5);
        if(m.st>.05&&Math.floor(m.st*30)!==Math.floor((m.st-dt)*30)){ const s=SMOKE.find(s=>!s.on)||SMOKE[0]; s.on=true; s.t=0; s.s.visible=true; s.s.position.copy(m.p).addScaledVector(TV2,-.8); }
        let bang=false; for(const c of chunks){ if(c.p.distanceTo(m.p)<c.r*.9+1.5){ bang=true; break; } } if(bang||m.life<=0){ m.on=false; m.g.visible=false; if(bang)explode(m.p,22,m.v); } }
      for(const s of SMOKE){ if(!s.on)continue; s.t+=dt; const k2=s.t/1.3; if(k2>=1){ s.on=false; s.s.visible=false; continue; } s.s.scale.setScalar(1.2+k2*5); s.s.material.opacity=.5*(1-k2); }
      // shards, flashes, bangs
      for(let i=SH.length-1;i>=0;i--){ const s=SH[i]; s.t+=dt; if(s.t>=s.life){ SH.splice(i,1); continue; } s.p.addScaledVector(s.v,dt); const a=s.spin.length()*dt; DQ.setFromAxisAngle(TV.copy(s.spin).normalize(),a); s.q.multiply(DQ); }
      shardIM.count=SH.length; SH.forEach((s,i)=>{ const k2=cl((s.life-s.t)/.5,0,1); shardIM.setMatrixAt(i,M4.compose(s.p,s.q,TV.setScalar(s.s*k2))); }); shardIM.instanceMatrix.needsUpdate=true;
      for(const f of FX){ if(!f.on)continue; f.t+=dt; const k2=f.t/.42; if(k2<1){ f.s.scale.setScalar(f.r*(1.2+k2*3.2)); f.s.material.opacity=1-k2; } else { f.s.visible=false; } const kd=f.t/2.6; if(kd>=1){ f.on=false; f.d.visible=false; continue; } f.d.scale.setScalar(f.r*(1.5+kd*3)); f.d.material.opacity=.55*(1-kd); }
      for(const b of BANG){ if(b.t>0){ b.t-=dt; b.l.intensity*=Math.max(0,1-dt*6); if(b.t<=0)b.l.intensity=0; } }
      // the cockpit: the stick and the throttle move with your hands, the thrusters puff, the charm floats, the glass cracks, the sun lights it from where it stands, the screens redraw
      stick.rotation.x=lerp(stick.rotation.x,IN.pitch*.3,Math.min(1,dt*10)); stick.rotation.z=lerp(stick.rotation.z,IN.roll*.3,Math.min(1,dt*10)); stick.rotation.y=lerp(stick.rotation.y,IN.yaw*.3,Math.min(1,dt*10)); thr.rotation.x=lerp(thr.rotation.x,.55-S.thr*1.1-(S.boost?.12:0),Math.min(1,dt*8));
      for(const r of RCS){ const want=r.k==='yawL'?Math.max(0,IN.yaw):r.k==='yawR'?Math.max(0,-IN.yaw):r.k==='up'?Math.max(0,IN.pitch):r.k==='down'?Math.max(0,-IN.pitch):r.k==='rollL'?Math.max(0,IN.roll):Math.max(0,-IN.roll); r.s.material.opacity=lerp(r.s.material.opacity,want*(.5+R()*.5),Math.min(1,dt*18)); r.s.scale.setScalar(.35+want*.5); }
      { TQ.copy(S.q).invert(); TV.copy(S.a).applyQuaternion(TQ).multiplyScalar(-.012); TV.y+=Math.sin(S.t*1.3)*.002; CH.v.addScaledVector(TV,dt*8); CH.v.multiplyScalar(1-dt*.8); CH.p.addScaledVector(CH.v,dt); TV2.copy(CH.p).sub(CH.a); const L=TV2.length(); if(L>CH.L){ TV2.multiplyScalar(CH.L/L); CH.p.copy(CH.a).add(TV2); CH.v.multiplyScalar(.5); } charmM.position.copy(CH.p); charmM.rotation.y+=dt*.7; charmM.rotation.x+=dt*.3; for(let i=0;i<12;i++)charmL.setMatrixAt(i,M4.makeTranslation(lerp(CH.a.x,CH.p.x,i/12),lerp(CH.a.y,CH.p.y,i/12),lerp(CH.a.z,CH.p.z,i/12))); charmL.instanceMatrix.needsUpdate=true; }
      cracks.visible=S.hull<60; cracks.material.opacity=S.hull<30?.95:S.hull<60?.6:0;
      const crit=S.hull<30&&Math.floor(S.t*4)%2; warn.material.color.setHex(crit?0xff2020:0x330000); warnG.material.opacity=crit?.7:0; warnL.intensity=crit?3:S.flash*6; glow1.intensity=4+S.flash*10; glow1.color.setHex(S.flash>.3?0xff4030:0xffa858);
      SHIP.quaternion.copy(S.q); SHIP.updateMatrixWorld(true); EYE.set(0,0,0); SHIP.localToWorld(EYE); sun.position.copy(EYE).addScaledVector(SUNDIR,20*M); sun.target.position.copy(EYE); sun.target.updateMatrixWorld(); flare();
      if((Math.floor(S.t*15)!==Math.floor((S.t-dt)*15)))screens(); };

    let saved=null, hum=null; const HID=['vit','hqb','hmap','hlog'], hidden=[];
    const build=()=>{ seedField(); RSCENE.add(ROOT,sun,sun.target,hemi); screens(); writePlacard('screen'); return ROOMS.part(ROOT,()=>{},null); };
    const unbuild=()=>{ RSCENE.clear(); if(COMP){ COMP.dispose(); COMP=null; } ROOT.traverse(o=>{ if(o.geometry&&!disposables.includes(o.geometry))o.geometry.dispose(); if(o.material&&o.material.isSpriteMaterial&&o.material.map)o.material.map.dispose(); }); for(const g of disposables)g.dispose(); for(const k in MAT)for(const m of [].concat(MAT[k])){ for(const key of ['map','normalMap','roughnessMap','metalnessMap','alphaMap','emissiveMap'])if(m[key])m[key].dispose(); m.dispose(); } API=null; };
    const start=R=>{ D=R; ROAM.on=true; for(const id of HID){ const el=document.getElementById(id); if(el){ hidden.push([el,el.style.display]); el.style.display='none'; } }
      S.q.identity(); S.w.set(0,0,0); S.v.set(0,0,0); S.a.set(0,0,0); S.thr=.35; S.boost=false; S.hull=100; S.score=0; S.heat=0; S.lock=0; S.mis=6; S.misT=0; S.dead=false; S.t=0; S.shake=0; S.flash=0; S.tgt=null; KEY.clear(); MOUSE.on=MOUSE.l=MOUSE.r=false; MOUSE.wheel=0; endHold=0; calOK=false; test=null; WORLD.position.set(0,0,0); CH.p.copy(CH.a); CH.p.y-=.13; CH.v.set(0,0,0);
      saved={gy:SHARED.groundY,view:UI.view,fov:PCAM.fov,far:PCAM.far,vfar:VR.cam?VR.cam.far:0,tm:renderer.toneMapping,ex:renderer.toneMappingExposure}; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05; SHARED.groundY=()=>0; SHARED.py=0; pos.x=WX; pos.z=WZ; SHARED.target=null; if(UI.setView)UI.setView('first'); PCAM.far=9000; PCAM.updateProjectionMatrix();
      SHARED.drive=DRIVE; addEventListener('keydown',onKey,true); addEventListener('keyup',onKey,true); addEventListener('pointermove',onMove,true); addEventListener('pointerdown',onBtn,true); addEventListener('pointerup',onBtn,true); addEventListener('wheel',onWheel,{capture:true,passive:false}); addEventListener('contextmenu',onCtx,true); addEventListener('blur',onLeave); document.addEventListener('pointerleave',onLeave);
      hum=sfx('hum',{vol:.35}); say(VR.on?'LEFT STICK: THROTTLE AND ROLL · RIGHT STICK: PITCH AND YAW · A BOOST · TRIGGERS FIRE · OR TAKE THE STICK IN YOUR HAND · HOLD Y OR THE RED BUTTON TO END':'W/S THROTTLE · A/D ROLL · MOUSE OR ARROWS AIM · SHIFT BOOST · SPACE LASERS · F MISSILE · HOLD Q TO END','#7dffa4'); };
    const end=()=>{ if(!ROAM.on)return; ROAM.on=false; SHARED.drive=null; for(const [el,d] of hidden)el.style.display=d; hidden.length=0; removeEventListener('keydown',onKey,true); removeEventListener('keyup',onKey,true); removeEventListener('pointermove',onMove,true); removeEventListener('pointerdown',onBtn,true); removeEventListener('pointerup',onBtn,true); removeEventListener('wheel',onWheel,{capture:true}); removeEventListener('contextmenu',onCtx,true); removeEventListener('blur',onLeave); document.removeEventListener('pointerleave',onLeave);
      if(hum&&hum.s)try{ hum.s.stop(); }catch(e){} hum=null; if(saved){ SHARED.groundY=saved.gy; PCAM.fov=saved.fov; PCAM.far=saved.far; PCAM.updateProjectionMatrix(); if(VR.cam&&saved.vfar)VR.cam.far=saved.vfar; renderer.toneMapping=saved.tm; renderer.toneMappingExposure=saved.ex; if(saved.view&&UI.setView&&UI.view!==saved.view)UI.setView(saved.view); saved=null; } W3.group.visible=true;
      const off=ROOMS.offIn&&ROOMS.offIn()==='roam', Hl=H.hall; if(off&&Hl&&ROOMS.enterAt)ROOMS.enterAt('arcade',[Hl.x,Hl.z,0,Math.PI]); else if(ROOMS.lazy&&ROOMS.lazy.roam&&ROOMS.lazy.roam.drop)ROOMS.lazy.roam.drop(); D=null; };
    const dbg=()=>({on:ROAM.on,t:+S.t.toFixed(1),drive:SHARED.drive===DRIVE,view:UI.view,chunks:chunks.length,meteors:meteors.length,instances:IM.flat().reduce((a,m)=>a+m.count,0),rocks:S.score,hull:S.hull,speed:+S.speed.toFixed(1),thr:+S.thr.toFixed(2),boost:S.boost,heat:+S.heat.toFixed(2),mis:S.mis,bolts:BOLTS.filter(b=>b.on).length,missiles:MIS.filter(m=>m.on).length,shards:SH.length,up:+UP.y.toFixed(3),fwd:[+FWD.x.toFixed(3),+FWD.y.toFixed(3),+FWD.z.toFixed(3)],tgt:S.tgt?+S.tgtD.toFixed(1):null,dead:S.dead,world:[+WORLD.position.x.toFixed(1),+WORLD.position.y.toFixed(1),+WORLD.position.z.toFixed(1)],cam:[+PCAM.position.x.toFixed(2),+PCAM.position.y.toFixed(2),+PCAM.position.z.toFixed(2)],far:PCAM.far,hand:{on:HAND.on,stick:!!HAND.stick,thr:!!HAND.thr,pitch:+HAND.pitch.toFixed(2),yaw:+HAND.yaw.toFixed(2),roll:+HAND.roll.toFixed(2),thrV:HAND.thrV,boost:HAND.boost,fire:HAND.fire,mis:HAND.mis,end:HAND.end,seen:HAND.seen},placard:plcMode,cracks:cracks.visible,in:{pitch:+IN.pitch.toFixed(2),yaw:+IN.yaw.toFixed(2),roll:+IN.roll.toFixed(2),fire:IN.fire,end:IN.end}});
    const aim=()=>{ let best=null, bd=1e9; for(const c of chunks){ worldOf(c.p,TV); const d=TV.length(); if(d<bd){ bd=d; best=c; } } if(!best)return null; worldOf(best.p,TV).normalize(); S.q.setFromUnitVectors(TV2.set(0,0,-1),TV); S.w.set(0,0,0); FWD.copy(TV); return bd; };
    return {build,unbuild,start,step,end,dbg,aim,cam:dt=>DRIVE.cam(SHARED.cam,dt),input:o=>{ test=o; },hurt:n=>hurt(n,'test'),grips:()=>({stick:STICKP.toArray(),thr:THRP.toArray(),end:ENDP.toArray()})}; };

  SYS.add('cam',dt=>{ if(ROAM.on&&API)API.cam(dt); },'roam');
  ROOMS.off.roam={name:'ROAM',noCeil:1,box:{x0:WX-900*T,z0:WZ-900*T,x1:WX+900*T,z1:WZ+900*T,y0:-900*T,y1:900*T},spawn:[WX,WZ,0,0],out:[WX,WZ,0,0],
    need:()=>LOAD('roam').then(()=>{ if(!API)API=MAKE(); }),build:()=>API.build(),unbuild:()=>{ if(API)API.unbuild(); }};
  H.programs.push({ name:'ROAM', cost:0, offWorld:true,
    intro:'ROAM. A SMALL SHIP AMONG THE METEORS. FLY ANY WAY UP; LASERS BREAK THE ROCKS, MISSILES BREAK THE BIG ONES. DON\'T RAM THEM.',
    go:R=>{ D=R; if(!ROOMS.enterAt)return; ROOMS.enterAt('roam',[WX,WZ,0,0]).then(()=>{ if(D!==R||!API)return; API.start(R); }).catch(e=>console.warn('ROAM',e)); },
    run:(R,dt)=>{ if(API&&ROAM.on)API.step(dt); },
    hide:()=>{ if(API)API.end(); else D=null; } });
  ROAM.aim=()=>API?API.aim():null; ROAM.input=o=>{ if(API)API.input(o); }; ROAM.hurt=n=>{ if(API)API.hurt(n); }; ROAM.grips=()=>API?API.grips():null;
  window.ROAMDBG=()=>API?API.dbg():{on:false,loaded:false}; }
