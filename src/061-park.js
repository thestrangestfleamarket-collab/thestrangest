const PARK=window.PARK={x0:50,x1:108,y0:-61+NORTHY,y1:12.5+NORTHY,gate:[92.5,99.5],round:[96,-47,7]};
PARK.sway={value:0}; PARK.windK={value:1}; PARK.tick=()=>{ PARK.sway.value=performance.now()/1000; };
await grab('park',async()=>{ const PO=LAY.o('park'), PE=LAY.e('park'); PARK.ox=PO.x; PARK.oy=PO.y; PARK.x0=50-MAINX.w+PE[0]; PARK.x1=AVE.x0+PE[2]; PARK.y0+=PE[1]; PARK.y1+=PE[3]; const X=x=>BOD.XS(x+PO.x), Z=y=>BOD.ZS(y+PO.y), Y=BOD.YS, {hash,grain,speck,grassCol}=BOD.g, P=PARK, U=TILE/.84, f32=s=>new Float32Array(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer), b8=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  P.round=[(P.x0+P.x1)/2,(P.y0+P.y1)/2,7]; P.gate=[P.round[0]-5,P.round[0]+5]; const RX=x=>x-96+P.round[0], RY=y=>y+47+P.round[1];
  const WA=3, wobX=y=>WA*Math.sin(2*Math.PI*(y-P.y0)/(P.y1-P.y0)), wobY=x=>WA*Math.sin(2*Math.PI*(x-P.x0)/(P.x1-P.x0)); P.wobX=wobX; P.wobY=wobY;
  const path=(x,y)=>{ const [cx,cy,r]=P.round; return Math.abs(x-cx-wobX(y))<3.6||Math.abs(y-cy-wobY(x))<3.6||Math.hypot(x-cx,y-cy)<r; };   P.path=path;
  const HK=[[P.round[0]+12.5-6,P.round[1]+11.5-6,P.round[0]+12.5+6,P.round[1]+11.5+6],[CASTLE.b[0]-PO.x-3,CASTLE.b[2]-PO.y-3,CASTLE.b[1]-PO.x+3,CASTLE.b[3]-PO.y+3],(o=>[o[0]-3,o[1]-3,o[0]+9,o[1]+19])(STORE.shrineO||[69,-45.9+NORTHY]),[RX(108)-5,RY(-54.5)-5,RX(108)+5,RY(-54.5)+5],[RX(90)-3,RY(-41.5)-3,RX(102)+3,RY(-41.5)+3],...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[])];
  const ss=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); }, cvn=BOD.g.cvNoise;
  P.hill=(x,y)=>{ if(x<P.x0||x>P.x1||y<P.y0||y>P.y1)return 0; const [cx,cy,r]=P.round;
    let d=Math.min(Math.abs(x-cx-wobX(y))-3.6,Math.abs(y-cy-wobY(x))-3.6,Math.hypot(x-cx,y-cy)-r,x-P.x0,P.x1-x,y-P.y0-9,P.y1-y); if(d<=0)return 0;
    for(const b of HK){ const e=Math.max(b[0]-x,x-b[2],b[1]-y,y-b[3]); if(e<d)d=e; if(d<=0)return 0; }
    const n=cvn(x/12,y/12,501)*.7+cvn(x/5,y/5,503)*.3; return 1.6*TILE*ss(0,6,d)*Math.max(0,(n-.33)/.67); };
  window.HILL=(wx,wz)=>{ const g=window.PARK; return g&&g.hill?g.hill(wx/TILE+72-(g.ox||0),wz/TILE-77-(g.oy||0)):0; };
  const hexCol=(x,y)=>{ const s=1/3, w=s*Math.sqrt(3), row=Math.floor(y/(s*1.5)), ox=(row&1)?w/2:0, col=Math.floor((x-ox)/w), cx=(col+.5)*w+ox, cy=row*s*1.5+s;
    const dx=Math.abs(x-cx), dy=Math.abs(y-cy), e=Math.max(dx/w*2,(dy+dx/Math.sqrt(3))/s), seam=e>.86, n=hash(col,row,71), g=grain(x,y,73,2), hp=hash(Math.floor(x*24),Math.floor(y*24),77);
    if(seam){ if(BOD.g.cvNoise(x/2.5,y/2.5,79)>.6&&hp<.65)return [[52,82,40],[66,98,48],[44,70,34]][Math.floor(hash(Math.floor(x*24),Math.floor(y*24),81)*3)]; const c=36+8*n; return [c,c,c+2]; }
    let c=58+22*n+10*(g-.5); if(e>.74)c*=(y<cy)?1.14:.84; return speck([c,c,c+2],x,y,75); };
  const lawn=BOD.g.lawnCol;
  const CS=(S=>({x0:S.x0-PO.x,x1:S.x1-PO.x,y0:S.y0-PO.y,y1:S.y1-PO.y}))(CASTLE.stair), groundCol=(x,y)=>x>=CS.x0&&x<CS.x1&&y>=CS.y0&&y<CS.y1?null:path(x,y)?hexCol(x,y):lawn(x,y);
  const flat=(x0,y0,x1,y1,z,col)=>BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24))),'G');
  { const [cx,cy,r]=P.round, w=4+WA, R=r+1, wayCol=(x,y)=>path(x,y)?groundCol(x,y):null, strips=(x0,y0,x1,y1)=>{ for(let x=x0;x<x1;x+=29)flat(x,y0,Math.min(x1,x+29),y1,0,wayCol); };
    strips(P.x0,cy-w,cx-R,cy+w); strips(cx+R,cy-w,P.x1,cy+w); strips(cx-R,cy-R,cx+R,cy+R); strips(cx-w,P.y0+.5,cx+w,cy-R); strips(cx-w,cy+R,cx+w,P.y1); }
  const stone=(i,j,k,H=99,cap=false)=>BRICKS.face(i,j,k,H,cap);
  const capSide=(i,j,h)=>{ const n=grain(i/24,j/24,91,1.2), c=(j===0?1.2:j>=h-1?.62:1)*(124+20*n); return speck([c,c,c*.96],i/24,j/24,93); };
  const face=(a,b,c,d,w,h,fn)=>BOD.bq(a,b,c,d,BOD.faceTex(w,h,(i,j)=>BOD.C(fn(i,j))),'G');
  const block=(x0,y0,x1,y1,z0,z1,k,top,jo=0,HT,SF)=>{ if((top==='post'||top==='cap')&&HT===undefined){ x0-=PG; x1+=PG; y0-=PG; y1+=PG; }
    if(top==='post'&&HT===undefined){ block(x0,y0,x1,y1,z0,z1,k,'post',0,z1-z0);
      BRICKS.quoins(x0,y0,x1,y1,z0,z1,k,(bx0,by0,bx1,by1,zb,zt,paint)=>block(bx0,by0,bx1,by1,zb,zt,k,()=>[92,90,86],0,zt-zb,paint));
      return; }
    if(x1-x0>40){ const n=Math.ceil((x1-x0)/40), d=(x1-x0)/n; for(let i=0;i<n;i++)block(x0+i*d,y0,x0+(i+1)*d,y1,z0,z1,k,top,jo,HT,SF); return; } const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], w=x1-x0, dp=y1-y0;
    const W=w*24, D=dp*24, H=z1-z0, sideF=SF?SF:top==='cap'?(i,j)=>capSide(i,j,H):(i,j,kk)=>stone(i,j+jo,kk,HT||H,top==='post'||HT!==undefined);
    face([a,f,d],[b,f,d],[b,f,c],[a,f,c],W,D,typeof top==='function'?top:((i,j)=>{ const n=grain(i/24,j/24,k+5,1.2), ed=Math.min(i,j,W-1-i,D-1-j); let c=118+22*n; if(ed<1)c*=(i<1||j<1)?1.18:.8; else if(ed<2)c*=1.06;
      else if(top===undefined){ const L=W>=D?W:D, u=W>=D?i:j, v=W>=D?j:i, DV=W>=D?D:W; let s0=0, n0=0, len=0; for(;;){ len=14+Math.floor(9*hash(n0,k,131)); if(s0+len>u)break; s0+=len; n0++; } const p=u-s0;
        if(p===0)c*=.55; else if(p===1)c*=1.1; else if(p===len-1)c*=.86; c*=.93+.14*hash(n0,k,133); if(hash(n0,k,135)<.18&&Math.abs(p-len*.5+(v-DV/2)*.6)<.6)c*=.72; }
      return speck([c,c,c*.96],i/24,j/24,k+7); }));
    face([a,e,c],[b,e,c],[b,f,c],[a,f,c],W,H,(i,j)=>sideF(i,j,k,W,H)); face([b,e,d],[a,e,d],[a,f,d],[b,f,d],W,H,(i,j)=>sideF(i,j,k+1,W,H));
    face([a,e,d],[a,e,c],[a,f,c],[a,f,d],D,H,(i,j)=>sideF(i,j,k+2,D,H)); face([b,e,c],[b,e,d],[b,f,d],[b,f,c],D,H,(i,j)=>sideF(i,j,k+3,D,H)); };
  const WH=16, PH=91, PG=.22, [g0,g1]=P.gate, RUNS=[], PIERS=[], LEAVES=[];
  const ashlar=(ch,l0,lv,ivy)=>(i,j,k,W,H)=>{ const co=Math.floor(j/ch), w=j-co*ch, u=i+Math.floor(hash(co,k,7)*l0); let s0=0, n=0, len=0; for(;;){ len=l0+Math.floor(lv*hash(n,co,k+3)); if(s0+len>u)break; s0+=len; n++; } const p=u-s0;
    let c=128+18*grain(i/24,j/24,k,1.2)+(hash(n,co,k+5)-.5)*30, wm=hash(n,co,k+9)-.5;
    const joint=w===ch-1||p===0; if(joint)c*=.5; else if(w===0)c*=1.16; else if(p===1)c*=1.07; else if(p===len-1||w===ch-2)c*=.86;
    if(!joint&&hash(i,j,k+11)>.992)c*=.7;
    const dn=j/H; c*=1-.28*dn*dn;
    let col=[c*(1+wm*.06),c,c*(.97-wm*.05)];
    if(joint&&dn>.55&&hash(i>>1,j,k+13)<.45)col=[58,78,44];
    else if(hash(i>>1,j>>1,k+17)>.988)col=[150,156,108];
    if(ivy){ const n2=grain(i/70,j/40,k+40,1); if(n2>.74&&hash(i,j,k+19)>.3){ const g=hash(i,j,k+21); col=g<.4?[46,74,34]:g<.8?[62,96,42]:[88,122,56]; } }
    return speck(col,i/24,j/24,k+23); };
  const wallF=ashlar(7,10,8,true), pierF=ashlar(13,15,9,false);
  const wall=(x0,y0,x1,y1,k)=>{ if(x1-x0<=.05||y1-y0<=.05)return; block(x0,y0,x1,y1,0,WH,k,undefined,0,WH,wallF); RUNS.push([x0,y0,x1,y1,k]); };
  const pier=(x0,y0,x1,y1,k)=>{ x0-=PG; x1+=PG; y0-=PG; y1+=PG; block(x0,y0,x1,y1,0,PH,k,()=>[120,118,112],0,PH,pierF); block(x0-.06,y0-.06,x1+.06,y1+.06,0,8,k+2,undefined,0,8,pierF);
    block(x0-.12,y0-.12,x1+.12,y1+.12,PH,PH+6,k+4,'cap',0,undefined); PIERS.push([(x0+x1)/2,(y0+y1)/2]); };
  wall(P.x0,P.y0,g0-1,P.y0+.5,11); wall(g1+1,P.y0,P.x1,P.y0+.5,15);
  pier(g0-1,P.y0-.2,g0,P.y0+.7,21); pier(g1,P.y0-.2,g1+1,P.y0+.7,25);
  LEAVES.push([g0,P.y0+1.05,-1,'x',(g1-g0)/2],[g1,P.y0+1.05,1,'x',(g1-g0)/2]);
  PARK.look=[X(g1+1.8),Z(P.y0-1.6)];
  const EG=PARK.egate=[P.round[1]-1.5,P.round[1]+1.5], ex=P.x1-.5;
  wall(ex,P.y0+.5,P.x1,EG[0]-1,31); wall(ex,EG[1]+1,P.x1,P.y1,35);
  pier(ex-.2,EG[0]-1,P.x1+.2,EG[0],41); pier(ex-.2,EG[1],P.x1+.2,EG[1]+1,45);
  LEAVES.push([ex-.55,EG[0],-1,'y',1.5],[ex-.55,EG[1],1,'y',1.5]);
  const CB=[CASTLE.b[0]-PO.x,CASTLE.b[1]-PO.x,CASTLE.b[2]-PO.y,CASTLE.b[3]-PO.y], wx=P.x0, ny=P.y1-.5, WG=PARK.wgate=[P.round[1]-1.5,P.round[1]+1.5], NG=PARK.ngate=[P.round[0]-3.5,P.round[0]+3.5];
  const wTop=Math.min(P.y1,CB[2]), nLeft=Math.max(P.x0,CB[1]);
  wall(wx,P.y0+.5,wx+.5,WG[0]-1,51); wall(wx,WG[1]+1,wx+.5,wTop,55);
  pier(wx-.2,WG[0]-1,wx+.7,WG[0],57); pier(wx-.2,WG[1],wx+.7,WG[1]+1,61);
  LEAVES.push([wx+1.05,WG[0],-1,'y',1.5],[wx+1.05,WG[1],1,'y',1.5]);
  wall(nLeft,ny,NG[0]-1,P.y1,65); wall(NG[1]+1,ny,P.x1-.5,P.y1,69);
  pier(NG[0]-1,ny-.2,NG[0],P.y1+.2,71); pier(NG[1],ny-.2,NG[1]+1,P.y1+.2,75);
  LEAVES.push([NG[0],ny-.55,-1,'x',3.5],[NG[1],ny-.55,1,'x',3.5]);
  { const M=TILE/.84, VS=ZU*24/TILE, mv=m=>m*M*VS, top=Y(WH), rnd=(a,b,c)=>hash(a,b,c);
    const pick=(()=>{ const sh=new THREE.BoxGeometry(.028*M,1,.028*M).translate(0,.5,0).toNonIndexed(), tp=new THREE.ConeGeometry(.034*M,.1,4).rotateY(Math.PI/4).translate(0,1.05,0).toNonIndexed(), g=new THREE.BufferGeometry();
      for(const a of ['position','normal']){ const A=sh.attributes[a].array, B=tp.attributes[a].array, C=new Float32Array(A.length+B.length); C.set(A); C.set(B,A.length); g.setAttribute(a,new THREE.BufferAttribute(C,3)); } return g; })();
    const unit=new THREE.BoxGeometry(1,1,1), iron=new THREE.MeshLambertMaterial({color:0xffffff}), glass=new THREE.MeshBasicMaterial({color:0xffffff});
    const IR=[0x23272a,0x1e2225,0x272b2e,0x2a2420], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V=THREE.Vector3, col=new THREE.Color();
    const put=(P_,B_)=>{ if(P_.length){ const me=new THREE.InstancedMesh(pick,iron,P_.length); P_.forEach(([x,y,z,h,lean,ax,c],i)=>{ q.setFromEuler(e.set(ax==='x'?lean:0,0,ax==='x'?0:lean)); me.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(1,h,1))); me.setColorAt(i,col.setHex(c)); });
        me.computeBoundingSphere(); me.castShadow=true; me.receiveShadow=true; scene.add(me); PARK.iron=(PARK.iron||0)+P_.length*16; }
      if(B_.length){ const me=new THREE.InstancedMesh(unit,iron,B_.length); B_.forEach(([x,y,z,sx,sy,sz,c],i)=>{ me.setMatrixAt(i,m4.compose(new V(x,y,z),q.identity(),new V(sx,sy,sz))); me.setColorAt(i,col.setHex(c)); });
        me.computeBoundingSphere(); me.castShadow=true; me.receiveShadow=true; scene.add(me); PARK.iron=(PARK.iron||0)+B_.length*12; } };
    const SP=.19, RH=mv(1);
    for(const [x0,y0,x1,y1,k] of RUNS){ const ax=x1-x0>=y1-y0?'x':'y', L=ax==='x'?x1-x0:y1-y0, c0=ax==='x'?(y0+y1)/2:(x0+x1)/2, s0=ax==='x'?x0:y0, NP=Math.ceil(L/16);
      for(let pc=0;pc<NP;pc++){ const a=s0+L*pc/NP, b=s0+L*(pc+1)/NP, Pk=[], Bx=[], at=(u,v)=>ax==='x'?[X(u),Z(v)]:[X(v),Z(u)];
        for(let u=a+SP/2;u<b;u+=SP){ const n=Math.round(u/SP); if(rnd(n,k,301)<.02)continue;
          const [wx_,wz_]=at(u,c0), r=rnd(n,k,303), lean=r<.05?(rnd(n,k,305)-.5)*.35:0; Pk.push([wx_,top,wz_,RH*(r<.03?.82:1),lean,ax==='x'?'z':'x',r<.15?IR[3]:IR[n%3]]); }
        const [cx,cz]=at((a+b)/2,c0), len=(b-a)*TILE; for(const hh of [.12,.86])Bx.push([cx,top+RH*hh,cz,ax==='x'?len:.03*M,.03*M*VS,ax==='x'?.03*M:len,IR[0]]);
        for(let u=Math.ceil(a/2.857)*2.857;u<b;u+=2.857){ const [px,pz]=at(u,c0); Bx.push([px,top+RH*.52,pz,.06*M,RH*1.04,.06*M,IR[1]],[px,top+RH*1.1,pz,.085*M,.085*M*VS*1.6,.085*M,IR[1]]); }
        put(Pk,Bx); } }
    const GP=[], GB=[];
    for(const [hx,hy,dir,ax,w] of LEAVES){ const at=(u)=>ax==='x'?[X(hx+dir*u),Z(hy)]:[X(hy),Z(hx+dir*u)], H=mv(2.2);
      for(let u=.08;u<w-.04;u+=.15){ const [x,z]=at(u); GP.push([x,0,z,H,0,'x',IR[(Math.round(u*7))%3]]); }
      const [cx,cz]=at(w/2), len=w*TILE; for(const hh of [.08,.55,.9])GB.push([cx,H*hh,cz,ax==='x'?len:.04*M,.04*M*VS,ax==='x'?.04*M:len,IR[0]]);
      for(const u of [0,w]){ const [x,z]=at(u); GB.push([x,H*.5,z,.06*M,H*1.02,.06*M,IR[1]]); }
      for(let u=.3;u<w-.2;u+=.6){ const [x,z]=at(u); GB.push([x,H*.73,z,ax==='x'?.18*M:.03*M,.18*M*VS,ax==='x'?.03*M:.18*M,IR[2]]); }
      const [a1,b1]=at(0), [a2,b2]=at(w); SOL.up.push([Math.min(a1,a2)-.06*M,Math.min(b1,b2)-.06*M,Math.max(a1,a2)+.06*M,Math.max(b1,b2)+.06*M]); FIX.up.push([Math.min(a1,a2)-.06*M,Math.min(b1,b2)-.06*M,0,Math.max(a1,a2)+.06*M,Math.max(b1,b2)+.06*M,H]); }
    put(GP,GB);
    const LB=[], LG=[];
    for(const [x,y] of PIERS){ const wx_=X(x), wz_=Z(y), t=Y(PH+6);
      LB.push([wx_,t+mv(.12),wz_,.1*M,mv(.24),.1*M,IR[1]],[wx_,t+mv(.27),wz_,.34*M,mv(.06),.34*M,IR[0]],[wx_,t+mv(.66),wz_,.4*M,mv(.08),.4*M,IR[0]],[wx_,t+mv(.75),wz_,.24*M,mv(.1),.24*M,IR[0]],[wx_,t+mv(.86),wz_,.06*M,mv(.12),.06*M,IR[1]]);
      for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])LB.push([wx_+dx*.15*M,t+mv(.46),wz_+dz*.15*M,.04*M,mv(.34),.04*M,IR[0]]);
      LG.push([wx_,t+mv(.46),wz_,.27*M,mv(.32),.27*M]); }
    put([],LB);
    if(LG.length){ const me=new THREE.InstancedMesh(unit,glass,LG.length); LG.forEach(([x,y,z,sx,sy,sz],i)=>me.setMatrixAt(i,m4.compose(new V(x,y,z),q.identity(),new V(sx,sy,sz)))); me.computeBoundingSphere(); scene.add(me); PARK.lanterns=me;
      const lit=()=>{ let d=false; try{ d=CLOCK.dark(); }catch(_){ } glass.color.setHex(d?0xffd38a:0x6e6656); }; lit(); setInterval(lit,2000); } }
  const TL=[0,1,2,3].includes(+QS.get('treelook'))&&QS.get('treelook')!==null?+QS.get('treelook'):3;
  const treeLook=sh=>{ sh.vertexShader='attribute vec3 aTr; varying vec3 vTr; varying vec3 vLw;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vTr=aTr; vLw=transformed;')
      .replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point)LightShadows\[ i \]\.shadowNormalBias/g,'($&+aTr.z*.12)'));
    let f='varying vec3 vTr; varying vec3 vLw; float TW=0., TSH=1.;\nfloat lfH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n if(vTr.z>.5){ vec3 q=floor(vLw*'+(1/(.11*TILE)).toFixed(4)+'); float n=lfH(q), m=lfH(floor(vLw*'+(1/(.035*TILE)).toFixed(4)+')); diffuseColor.rgb*=.74+.42*n+(m>.94?.25:0.)-(m<.06?.18:0.); }')
      .replace('diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:','diffuseColor.rgb*=vTr.z>.5&&'+(TL>1)+'?1.:wn.y>=max(wn.x,wn.z)?1.:');
    if(TL>1)f=f.replace('#include <lights_lambert_pars_fragment>',THREE.ShaderChunk.lights_lambert_pars_fragment.replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );','float dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + TW ) / ( 1. + TW ) );'))
      .replace('#include <shadowmap_pars_fragment>',THREE.ShaderChunk.shadowmap_pars_fragment.replace(/return shadow;/g,'return mix( 1., shadow, TSH );'))
      .replace('#include <lights_fragment_begin>','if(vTr.z>.5){ TW=.45; TSH=.7; }\n#include <lights_fragment_begin>')
      .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n if(vTr.z>.5){ float ao=mix(.42,1.,smoothstep(0.,1.,.62*vTr.x+.38*vTr.y)); reflectedLight.directDiffuse*=mix(1.,ao,.6); reflectedLight.indirectDiffuse*=ao; }');
    sh.fragmentShader=f; };
  const BATCHED=(g,RG,mat)=>{ const n=RG.length-1; if(QS.get('bm')==='0'||n<2)return new THREE.Mesh(g,mat); const me=new THREE.BatchedMesh(n,RG[n],0,mat), names=Object.keys(g.attributes), I=new THREE.Matrix4();
    for(let i=0;i<n;i++){ const a=RG[i], b=RG[i+1]; if(b<=a)continue; const G=new THREE.BufferGeometry(); for(const k of names){ const A=g.attributes[k], z=A.itemSize; G.setAttribute(k,new THREE.BufferAttribute(A.array.slice(a*z,b*z),z,A.normalized)); } me.setMatrixAt(me.addGeometry(G),I); }
    me.sortObjects=false; return me; };
  const F=Object.assign({},FOREST,PROPS), mesh=(list,leafy,solid=true,sway=false)=>{ const P3=[], C3=[], SW=[], TR=[], LF=[], RN=[], RG=[], c=new THREE.Color(); for(const [key,x,y,m,turn,lift] of list){ const p0=P3.length; RG.push(p0/3); const ph=hash(Math.round(x*7),Math.round(y*7),131)*6.28; const D=F[key], p=f32(D.p), col=b8(D.c), k=b8(D.k), s=m/.84*TILE, ca=Math.cos(turn||0), sa=Math.sin(turn||0), ox=X(x), oz=Z(y), oy=(lift||0)/.84*TILE+P.hill(x,y);
      for(let i=0;i<p.length;i+=3){ const px=p[i]*s, py=p[i+1]*s+oy, pz=p[i+2]*s; P3.push(ox+px*ca-pz*sa,py,oz+px*sa+pz*ca); if(sway)SW.push(Math.max(0,p[i+1])*s,ph); if(TL)LF.push(col[i+1]>col[i]*1.08&&col[i+1]>col[i+2]*1.08?1:0); const t=Math.floor(i/9), sh=k[t]===0?.86+.28*hash(t,x*7,y*3):k[t]===2?.9+.2*hash(t,x*5,y*9):.92+.16*hash(t,x*3,y*5);
        c.setRGB(col[i]/255*sh,col[i+1]/255*sh,col[i+2]/255*sh,THREE.SRGBColorSpace); C3.push(c.r,c.g,c.b); }
      if(TL){ const q0=p0/3, q1=P3.length/3; let y0=1e9, y1=-1e9, cx=0, cz=0, n=0, r1=1e-3; for(let v=q0;v<q1;v++)if(LF[v]){ y0=Math.min(y0,P3[v*3+1]); y1=Math.max(y1,P3[v*3+1]); cx+=P3[v*3]; cz+=P3[v*3+2]; n++; } cx/=n||1; cz/=n||1;
        for(let v=q0;v<q1;v++)if(LF[v])r1=Math.max(r1,Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)); const cy=(y0+y1)/2, ry=Math.max(1e-3,(y1-y0)/2);
        for(let v=q0;v<q1;v++){ TR.push(LF[v]?(P3[v*3+1]-y0)/Math.max(1e-3,y1-y0):0,LF[v]?Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)/r1:0,LF[v]); RN.push((P3[v*3]-cx)/(r1*r1),(P3[v*3+1]-cy)/(ry*ry),(P3[v*3+2]-cz)/(r1*r1)); } }
      CLIPX.push({place:'park',name:key,P:P3.slice(p0)});
      if(solid){ const r=Math.max(.3,D.trunk*s*.5); SOL.up.push([ox-r,oz-r,ox+r,oz+r]); FIX.up.push([ox-r,oz-r,0,ox+r,oz+r,leafy?Y(60):s*.9]); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C3,3)); g.computeVertexNormals(); if(sway)g.setAttribute('aSw',new THREE.Float32BufferAttribute(SW,2)); if(TL)g.setAttribute('aTr',new THREE.Float32BufferAttribute(TR,3));
    if(TL>1){ const N=g.attributes.normal.array; for(let v=0;v<LF.length;v++)if(LF[v]){ let x=RN[v*3], y=RN[v*3+1], z=RN[v*3+2]; const l=Math.hypot(x,y,z)||1; x=x/l*.8+N[v*3]*.2; y=y/l*.8+N[v*3+1]*.2; z=z/l*.8+N[v*3+2]*.2; const m=Math.hypot(x,y,z)||1; N[v*3]=x/m; N[v*3+1]=y/m; N[v*3+2]=z/m; } }
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    const SWG=sway&&(sway===2?'{ float h=aSw.x, g=(.7+.3*sin(uSw*.23+aSw.y))*uWk; transformed.x+=sin(uSw*2.3+aSw.y)*h*.12*g; transformed.z+=sin(uSw*1.9+aSw.y*1.7)*h*.08*g; }':'{ float h=aSw.x*aSw.x*.1, g=(.7+.3*sin(uSw*.23+aSw.y))*uWk; transformed.x+=sin(uSw*1.6+aSw.y)*h*.035*g; transformed.z+=sin(uSw*1.2+aSw.y*1.7)*h*.025*g; }'), swayV=sh=>{ sh.uniforms.uSw=PARK.sway; sh.uniforms.uWk=PARK.windK; sh.vertexShader='attribute vec2 aSw; uniform float uSw,uWk;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+SWG); };
    if(sway||TL){ mat.onBeforeCompile=sh=>{ if(TL)treeLook(sh); if(sway)swayV(sh); }; mat.customProgramCacheKey=()=>'oaksway'+sway+'tl'+TL; }
    RG.push(P3.length/3); const me=BATCHED(g,RG,mat); me.castShadow=true; me.receiveShadow=TL!==2;
    if(sway&&TL)for(const [k,M] of [['customDepthMaterial',new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking})],['customDistanceMaterial',new THREE.MeshDistanceMaterial()]]){ M.onBeforeCompile=swayV; M.customProgramCacheKey=()=>'oakswayd'+sway; me[k]=M; }
    scene.add(me); return me; };
  const TREEY=12+4.6;
  const TREES=(()=>{ const out=[], KEEP=[[P.round[0]+12.5-6,P.round[1]+11.5-6,P.round[0]+12.5+6,P.round[1]+11.5+6],[CASTLE.b[0]-3,CASTLE.b[2]-3,CASTLE.b[1]+3,CASTLE.b[3]+3],(o=>[o[0]-3,o[1]-3,o[0]+9,o[1]+19])(STORE.shrineO||[69,-45.9+NORTHY]),[P.gate[0]-16,P.y0,P.gate[1]+8,P.y0+12],[RX(108)-5,RY(-54.5)-5,RX(108)+5,RY(-54.5)+5],[RX(90)-3,RY(-41.5)-3,RX(102)+3,RY(-41.5)+3],...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[])];
    for(let i=0;i<900&&out.length<24;i++){ const x=P.x0+(P.x1-P.x0)*(.15+.7*hash(i,41,7)), y=P.y0+TREEY+4+hash(i,43,9)*(P.y1-P.y0-TREEY-10), m=12+hash(i,47,11)*10, r=m*.42;
      if(Math.abs(x-P.round[0]-wobX(y))<3.6+r||Math.abs(y-P.round[1]-wobY(x))<3.6+r)continue; if(KEEP.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r))continue; if(out.some(o=>Math.hypot(o[1]-x,o[2]-y)<12))continue;
      out.push(['OakTree'+(1+Math.floor(hash(i,53,13)*3)),+x.toFixed(1),+y.toFixed(1),+m.toFixed(1)]); } return out; })();
  PARK.trees=QS.get('trees')==='0'?null:mesh(TREES,true,true,true);
  PARK.oaks=TREES.map(([k,x,y,m])=>[X(x),Z(y),m]); window.PARKDBG=()=>({oaks:PARK.oaks,TL,progs:renderer.info.programs.length});
  PARK.rocks=mesh([['BigRock3',87.5,-37,2.6,1.8],['BigRock5',126,-41,2.4,.2],['Rock_12',55.5,-41,1,1],['Rock1',111,-41,.6,2],['BigRock1',66,-35,2,1.1]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]),false);
  { const UG=[['bush1',1.1],['bush2',1.2],['bush3',1.3],['bush4',1.5],['bush5',1.1],['flower1',.5],['flower2',.7],['flower3',.3],['flower4',.7],['flower5',.35],['flower6',.8],['grass1',.5],['grass2',.6],['grass1',.45],['grass2',.55],['mushroom1',.3],['mushroom2',.35],['mushroom3',.3],['mushroom4',.25],['stone2',.5],['stone3',.2],['stones1',.25]];
    const list=[]; for(let i=0;i<90;i++){ const x=P.x0+2+hash(i,3,91)*(P.x1-P.x0-4), y=P.y1-1-Math.pow(hash(i,7,93),1.6)*(P.y1-P.y0-3); if(path(x,y)||path(x+1,y)||path(x-1,y)||path(x,y+1)||path(x,y-1)||hash(i,11,95)<.3)continue; if(x>67&&x<77&&y>-44+NORTHY&&y<-24+NORTHY)continue; if(typeof GCAVE!=='undefined'&&GCAVE.keep(P).some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))continue; { const [a,b,c,d]=CASTLE.b.map((v,i)=>v-(i<2?PO.x:PO.y)); if(x>a-1.6&&x<b+1.6&&y>c-1.6&&y<d+1.6)continue; }
      const [k,m]=UG[Math.floor(hash(i,13,97)*UG.length)]; list.push([k,x,y,m*(.8+.4*hash(i,17,99)),hash(i,19,101)*6.28]); }
    list.push(...[['log1',65,-41,.5,.4],['log2',86,-40.5,.6,1.2],['log3',104,-39,.6,2.6],['fence1',57,-41,.8,0],['fence1',126,-41,.8,1.57],['pmushroom1',62.5,-36.5,.6,0],['pmushroom2',63.5,-36.2,.5,1],['pmushroom3',61.8,-35.5,.55,2]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]));
    const isPlant=k=>/^(bush|flower|grass)/.test(k);
    PARK.under=mesh(list.filter(e=>isPlant(e[0])),false,false,2); PARK.underStill=mesh(list.filter(e=>!isPlant(e[0])),false,false,false);
    block(g0-5.2,P.y0+2.2,g0-2.2,P.y0+3.1,0,27,47,()=>[150,110,70]); block(g0-5.1,P.y0+2.3,g0-4.85,P.y0+2.55,0,27,49,()=>[96,70,46]); block(g0-2.55,P.y0+2.75,g0-2.3,P.y0+3,0,27,51,()=>[96,70,46]);
    SOL.up.push([X(g0-5.2),Z(P.y0+2.2),X(g0-2.2),Z(P.y0+3.1)]); FIX.up.push([X(g0-5.2),Z(P.y0+2.2),0,X(g0-2.2),Z(P.y0+3.1),Y(27)]);
    PARK.odd=mesh([['crate',g0-4.6,P.y0+2.65,.4,.2,.95],['gem1',g0-3.9,P.y0+2.5,.22,.5,.95],['gem2',g0-3.5,P.y0+2.8,.2,1.5,.95],['gem3',g0-3.1,P.y0+2.5,.24,2.5,.95],['gold',g0-2.6,P.y0+2.7,.08,.8,.95],['gem1',g0-4,P.y0+2.85,.18,3.5,.95]],false,false);
    PARK.camp=mesh([['campfire',RX(108),RY(-54.5),.13,0],['woodpile',RX(109.5),RY(-55.6),.5,.6]],false,true); PARK.fire={x:X(RX(108)),z:Z(RY(-54.5)),y:.3};
    { const L=new THREE.PointLight(new THREE.Color(1,.6,.25),26,9*TILE,1.6); L.position.set(X(RX(108)),.5*TILE,Z(RY(-54.5))); L.userData.fire=1; scene.add(L); PARK.fireL=L;
      PARK.flame=FLAME.add({kind:'bed',name:'campfire',x:X(RX(108)),y:.12*TILE,z:Z(RY(-54.5)),w:.78*TILE,h:.95*TILE,embers:4,smoke:2.2,sk:1.3,light:L,seed:5}); }
    PARK.more=mesh([['pillar1',90,-41.5,3.2,.3],['pillar2',102,-41.5,2.6,1.2],['sitlog',106.5,-55.4,.5,.4],
      ['daisy',92.3,-56,.35,0],['tulip',92.3,-54,.4,1],['rose',92.3,-52,.45,2],['sunflower',99.7,-56,.9,.5],['lily',99.7,-54,.4,1.5],['daisy',99.7,-52,.35,2.5],['hbush1',91.5,-58.8,.9,0],['hbush2',100.5,-58.8,.9,1.2]].map(([k,x,y,...r])=>[k,RX(x),/^(daisy|tulip|rose|sunflower|lily|hbush)/.test(k)?y+NORTHY:RY(y),...r]),false,false); PARK.sitlog=[X(106.5),Z(-55.4)];
    for(const [x,y,m] of [[RX(90),RY(-41.5),3.2],[RX(102),RY(-41.5),2.6]]){ const r=.35*m/.84*.2; SOL.up.push([X(x)-r,Z(y)-r,X(x)+r,Z(y)+r]); FIX.up.push([X(x)-r,Z(y)-r,0,X(x)+r,Z(y)+r,m/.84*TILE]); }
    PARK.pots=mesh([['pot5',g0-1.7,P.y0+1.1,.5,0],['paradise1',g0-1.7,P.y0+1.1,1.2,.3,.45],['pot1',g1+1.7,P.y0+1.1,.45,0],['sanseveria',g1+1.7,P.y0+1.1,.9,1.2,.4],['pot3',g0-3,P.y0+1.2,.35,0],['calathea',g0-3,P.y0+1.2,.5,2,.3],['pot2',g1+3,P.y0+1.2,.35,0],['paradise',g1+3,P.y0+1.2,.8,.8,.3]],false,true); }
  const LP=[]; { const [cx,cy]=P.round; for(let y=P.y0+4;y<P.y1-2;y+=13)if(Math.abs(y-cy)>9)LP.push([cx+wobX(y)+(LP.length%2?4.2:-4.2),y]); for(let x=P.x0+6;x<P.x1-4;x+=16)if(Math.abs(x-cx)>9)LP.push([x,cy+wobY(x)+(LP.length%2?4.2:-4.2)]); }
  for(const [x,y] of LP){ const h0=170, h1=179, w=.17; BATCH.tag=OBJ('park','park lamp'); block(x-.07,y-.07,x+.07,y+.07,0,h0,31,()=>[40,40,44]); block(x-w-.04,y-w-.04,x+w+.04,y+w+.04,h1,h1+3,35,()=>[48,46,44]);
    for(const [a,b,c,d] of [[[X(x-w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y+w)]],[[X(x+w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y-w)]],
        [[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y+w)],[X(x-w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y-w)]],[[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y-w)],[X(x+w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y+w)]]])
      BOD.bq(a,b,c,d,BOD.faceTex(9,9,(i,j)=>i<1||i>7||j<1||j>7?[48,46,44]:[255,236,190,1]),'G');
    const L=new THREE.PointLight(new THREE.Color(1,.86,.62),6,9*TILE,1.6); L.position.set(X(x),Y(h0+4),Z(y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L);
    SOL.up.push([X(x-.1),Z(y-.1),X(x+.1),Z(y+.1)]); FIX.up.push([X(x-.1),Z(y-.1),0,X(x+.1),Z(y+.1),Y(h0)]); } BATCH.tag=null;
  const sol=(x0,y0,x1,y1,h)=>{ if(h===PH){ x0-=PG; x1+=PG; y0-=PG; y1+=PG; } SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Y(h)]); };
  sol(P.x0,P.y0,g0-1,P.y0+.5,WH); sol(g1+1,P.y0,P.x1,P.y0+.5,WH); sol(g0-1,P.y0-.2,g0,P.y0+.7,PH); sol(g1,P.y0-.2,g1+1,P.y0+.7,PH);
  sol(ex,P.y0+.5,P.x1,EG[0]-1,WH); sol(ex,EG[1]+1,P.x1,P.y1,WH); sol(ex-.2,EG[0]-1,P.x1+.2,EG[0],PH); sol(ex-.2,EG[1],P.x1+.2,EG[1]+1,PH);
  sol(wx,P.y0+.5,wx+.5,WG[0]-1,WH); sol(wx,WG[1]+1,wx+.5,wTop,WH); sol(wx-.2,WG[0]-1,wx+.7,WG[0],PH); sol(wx-.2,WG[1],wx+.7,WG[1]+1,PH);
  sol(nLeft,ny,NG[0]-1,P.y1,WH); sol(NG[1]+1,ny,P.x1-.5,P.y1,WH); sol(NG[0]-1,ny-.2,NG[0],P.y1+.2,PH); sol(NG[1],ny-.2,NG[1]+1,P.y1+.2,PH);
  BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide}));
  MODS.park={BOUND:{x0:X(P.x0+.3),x1:X(P.x1-.3),z0:Z(P.y0),z1:Z(P.y1-.3)},inside:()=>false}; });
