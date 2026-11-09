// THE SECTIONS: B to H round the park (grab('sections')), built only when loaded (today only yours is: their builder waits in the later chunk), each A's size and basic for now: the ring street, a row of plain painted buildings on its outer side, the water past them, the park's grass and trees inside, lamps, each station's entrance and a sign where one section meets the next.
import {SHARED, THREE} from './003-shx.js';
import {DRESS, TEXT} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, FIX, grab, LOTX, LOTY, MAPG, MODS, SECTION, SECTIONS, SOL, TILE, ZU} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
import {LOOP} from './009b-loop.js';
import {slabCol} from './014-gamekit.js';
import {BLOCKS} from './038zb-blocks.js';
for(const [k,d] of Object.entries({'loop.entrance':'SUBWAY · THE LOOP · TO {a} & {b}','loop.entrance0':'SUBWAY · THE LOOP'}))TEXT.t(k,d);
await grab('sections',async()=>{ const T=TILE, S=SECTIONS, G=S.ring, home=SECTION.id, W=G.walk, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS;
  const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const clip=(r,b)=>{ const q={x0:Math.max(r.x0,b.x0),x1:Math.min(r.x1,b.x1),y0:Math.max(r.y0,b.y0),y1:Math.min(r.y1,b.y1)}; return q.x1-q.x0>.01&&q.y1-q.y0>.01?q:null; };
  const P=G.park, O=G.outer, ROW=G.row, A=S.all;
  // the street laid out like Section A's, so it lines up where sections meet: Market St's sidewalks 7 (outer) and 12 (park side), West St's 3.2 and 3
  const SW=G.sides, road={x0:O.x0+SW.we[0],y0:O.y0+SW.ns[0],x1:O.x1-SW.we[0],y1:O.y1-SW.ns[0]}, inner={x0:P.x0-SW.we[1],y0:P.y0-SW.ns[1],x1:P.x1+SW.we[1],y1:P.y1+SW.ns[1]};
  const frame=(o,i)=>[{x0:o.x0,x1:o.x1,y0:o.y0,y1:i.y0},{x0:o.x0,x1:o.x1,y0:i.y1,y1:o.y1},{x0:o.x0,x1:i.x0,y0:i.y0,y1:i.y1},{x0:i.x1,x1:o.x1,y0:i.y0,y1:i.y1}];
  const secs=S.list.filter(b=>b.id!==home&&S.loaded.includes(b));   // only loaded sections are built: today none but yours


  // signs: each station's entrance (railings, two green globes, its name) and each section's edge
  const font=(g,px,w=800)=>{ g.font=w+' '+px+'px "Helvetica Neue",Helvetica,Arial,sans-serif'; };
  const sign=(w,h,fn,a,b,z0,z1,one)=>{ '@later'; const cv=document.createElement('canvas'); cv.width=w; cv.height=h; fn(cv.getContext('2d'),w,h); const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
    const m=new THREE.MeshBasicMaterial({map:t}), q=(p,r)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([p[0],z0,p[1],r[0],z0,r[1],r[0],z1,r[1],p[0],z0,p[1],r[0],z1,r[1],p[0],z1,p[1]],3)); g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); scene.add(new THREE.Mesh(g,m)); };
    q(a,b); if(!one)q(b,a); };
  const postM=new THREE.MeshLambertMaterial({color:0x2a2c30}), rail=new THREE.MeshLambertMaterial({color:0x2f6b45}), globe=new THREE.MeshBasicMaterial({color:0xdcf3dc}), hole=new THREE.MeshBasicMaterial({color:0x050506});
  const bx=(x0,y0,x1,y1,h0,h1,m)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(XS(x1)-XS(x0)),h1-h0,Math.abs(ZS(y1)-ZS(y0))),m); me.position.set((XS(x0)+XS(x1))/2,(h0+h1)/2,(ZS(y0)+ZS(y1))/2); scene.add(me); return me; };
  for(const st of LOOP.STA){ if(st.old)continue; const k=st.kiosk, ym=(k.y0+k.y1)/2, out=st.side==='south'?k.y1:k.y0, back=st.side==='south'?k.y0:k.y1;
    bx(k.x0,k.y0,k.x1,k.y1,.005,.02,hole);
    bx(k.x0,back-.06,k.x1,back+.06,0,1.1,rail); bx(k.x0,out-.06,k.x1,out+.06,0,1.1,rail); bx(k.x1-.06,k.y0,k.x1+.06,k.y1,0,1.1,rail);
    for(const y of [k.y0,k.y1]){ bx(k.x0-.08,y-.08,k.x0+.08,y+.08,0,2.6,rail); const gl=new THREE.Mesh(new THREE.SphereGeometry(.16*T,10,8),globe); gl.position.set(XS(k.x0),2.75,ZS(y)); scene.add(gl); }
    sign(512,80,(g,w,h)=>{ '@later'; g.fillStyle='#f4f4ee'; g.fillRect(0,0,w,h); g.fillStyle='#3fbf5a'; g.beginPath(); g.arc(h*.5,h*.5,h*.26,0,7); g.fill(); g.fillStyle='#0b0b0b'; font(g,h*.42,900); g.textBaseline='middle';
      g.fillText(st.name+' · '+st.id,h*.95,h*.38); font(g,h*.22,700); g.fillStyle='#444'; const M_=SHARED.METRO, a=M_&&M_.nextOf&&M_.nextOf(st.id,0), b=M_&&M_.nextOf&&M_.nextOf(st.id,1); g.fillText(a&&b?TEXT.t('loop.entrance',null,{a,b}):TEXT.t('loop.entrance0',null),h*.95,h*.76); },[XS(k.x0+.4),ZS(out)+(st.side==='south'?.08:-.08)*T],[XS(k.x1-.4),ZS(out)+(st.side==='south'?.08:-.08)*T],1.15,1.75); }
  // the other sections' ground, blocks, water edges, trees, posts and edge signs: only when another section is loaded (none today), so this waits in the later chunk
  const others=()=>{ '@later';
  // the ground: flat pieces, each kind one repeated picture, laid in order (later ones a hair higher)
  const pic=(n,fn)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=n; const g=cv.getContext('2d'), im=g.createImageData(n,n); for(let j=0;j<n;j++)for(let i=0;i<n;i++){ const c=fn(i,j,n), k=(j*n+i)*4; im.data[k]=c[0]; im.data[k+1]=c[1]; im.data[k+2]=c[2]; im.data[k+3]=255; } g.putImageData(im,0,0);
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const sh=(c,f)=>c.map(v=>Math.max(0,Math.min(255,v*f))), GC=SHARED.BOD.g.lawnCol;
  const KIND={
    lot:{rep:4,t:pic(96,(i,j)=>sh([70,66,60],.86+.22*hash(i>>1,j>>1,3)))},
    water:{rep:6,t:pic(96,(i,j)=>sh([38,70,88],.9+.16*Math.sin((i+j*.3)/5)+.06*hash(i>>2,j,5)))},
    shore:{rep:2,t:pic(48,(i,j)=>(i%24<1||j%24<1)?[96,92,86]:sh([150,144,132],.9+.14*hash(i>>2,j>>2,7)))},
    walk:{rep:4.8,t:pic(116,(i,j)=>slabCol((i+.5)/116*4.8+302.4,(j+.5)/116*4.8+302.4))},
    road:{rep:4,t:pic(96,(i,j)=>sh([52,52,56],.84+.24*hash(i,j,11)))},
    grass:{rep:8,t:pic(192,(i,j)=>GC((i+.5)/24+300,(j+.5)/24+300))},
    line:{rep:1,c:0xd8b23a}, dash:{rep:1,c:0xe8e8e0}};
  // the places a section holds (sections.places: the skate park) bring their own ground: the section's is cut round them, and no tree grows on them
  const HOLES=(S.places||[]).filter(q=>secs.some(b=>b.id===q.section)).map(q=>({x0:q.x-q.w/2,x1:q.x+q.w/2,y0:q.y-q.d/2,y1:q.y+q.d/2}));
  const cut=(r,h)=>{ if(!clip(r,h))return [r]; return [{...r,y1:h.y0},{...r,y0:h.y1},{x0:r.x0,x1:h.x0,y0:Math.max(r.y0,h.y0),y1:Math.min(r.y1,h.y1)},{x0:h.x1,x1:r.x1,y0:Math.max(r.y0,h.y0),y1:Math.min(r.y1,h.y1)}].filter(q=>q.x1-q.x0>.01&&q.y1-q.y0>.01); };
  const gm={}, MP=[], add=(k,r,lift)=>{ let L=[r]; for(const h of HOLES)L=L.flatMap(q=>cut(q,h)); if(L.length!==1||L[0]!==r){ for(const q of L)add0(k,q,lift); return; } add0(k,r,lift); }, add0=(k,r,lift)=>{ if(k!=='line'&&k!=='dash')MP.push({k,r,lift}); const L=gm[k]||(gm[k]={P:[],U:[],lift}); const R=KIND[k].rep, a=[XS(r.x0),ZS(r.y0)], b=[XS(r.x1),ZS(r.y1)], y=(lift+1)*.004;
    L.P.push(a[0],y,a[1],b[0],y,b[1],b[0],y,a[1],a[0],y,a[1],a[0],y,b[1],b[0],y,b[1]); L.U.push(r.x0/R,r.y0/R,r.x1/R,r.y1/R,r.x1/R,r.y0/R,r.x0/R,r.y0/R,r.x0/R,r.y1/R,r.x1/R,r.y1/R); };
  const mirrorY=r=>({x0:r.x0,x1:r.x1,y0:A.y0+A.y1-r.y1,y1:A.y0+A.y1-r.y0});
  const rows=[], kiosks=LOOP.STA.filter(s=>!s.old).map(s=>s.kiosk);
  for(const b of secs){ add('lot',b,0);
    const wat={x0:b.x0,x1:b.x1,y0:A.y0,y1:A.y0+G.water}, sho={x0:b.x0,x1:b.x1,y0:A.y0+G.water,y1:A.y0+G.water+G.shore};
    for(const r of [wat,mirrorY(wat)]){ const q=clip(r,b); if(q)add('water',q,1); } for(const r of [sho,mirrorY(sho)]){ const q=clip(r,b); if(q)add('shore',q,1); }
    for(const r of frame(O,P)){ const q=clip(r,b); if(q)add('walk',q,2); }
    for(const r of frame(road,inner)){ const q=clip(r,b); if(q)add('road',q,3); }
    { const q=clip(P,b); if(q)add('grass',q,2); }
    const cx=(road.x0+inner.x0)/2, cxe=(road.x1+inner.x1)/2, cy=(road.y0+inner.y0)/2, cye=(road.y1+inner.y1)/2;
    for(const [x0,x1,y0,y1] of [[cx,cxe,cy,cy],[cx,cxe,cye,cye],[cx,cx,cy,cye],[cxe,cxe,cy,cye]]){ const hz=y0===y1;
      for(const o of [-.18,.18]){ const q=clip(hz?{x0,x1,y0:y0+o-.06,y1:y0+o+.06}:{x0:x0+o-.06,x1:x0+o+.06,y0,y1},b); if(q)add('line',q,4); }
      for(const o of [-1,1]){ const c=hz?y0+o*(cy-road.y0)/2:x0+o*(cx-road.x0)/2; for(let t=(hz?x0:y0)+2;t<(hz?x1:y1)-2;t+=6){ const q=clip(hz?{x0:t,x1:t+3,y0:c-.08,y1:c+.08}:{x0:c-.08,x1:c+.08,y0:t,y1:t+3},b); if(q)add('dash',q,4); } } }
    // the row of buildings on the street's outer side, cut into lots
    const sides=[{k:'s',r:{x0:O.x0-ROW,x1:O.x1+ROW,y0:O.y0-ROW,y1:O.y0}},{k:'n',r:{x0:O.x0-ROW,x1:O.x1+ROW,y0:O.y1,y1:O.y1+ROW}},{k:'w',r:{x0:O.x0-ROW,x1:O.x0,y0:O.y0,y1:O.y1}},{k:'e',r:{x0:O.x1,x1:O.x1+ROW,y0:O.y0,y1:O.y1}}];
    for(const sd of sides){ const q=clip(sd.r,b); if(!q)continue; const al=sd.k==='s'||sd.k==='n', a0=al?q.x0:q.y0, a1=al?q.x1:q.y1; let a=a0, n=0;
      while(a<a1-4){ const w=Math.min(a1-a,14+hash(b.col*7+b.row,n,31)*16); const lot=al?{x0:a,x1:a+w,y0:q.y0,y1:q.y1}:{x0:q.x0,x1:q.x1,y0:a,y1:a+w};
        if(!kiosks.some(k=>clip(k,lot)))rows.push({b,lot,face:sd.k,seed:(b.col*7+b.row)*101+n}); a+=w; n++; } } }
  for(const k in gm){ const L=gm[k], g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(L.P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(L.U,2)); g.computeVertexNormals();
    const K=KIND[k], m=new THREE.MeshLambertMaterial({...(K.t?{map:K.t}:{color:K.c}),side:THREE.DoubleSide}), me=new THREE.Mesh(g,m); me.receiveShadow=true; scene.add(me); }

  // the buildings: plain painted blocks (BLOCKS.make), painted near ones first, a solid each
  const THEME={B:[[146,66,50],[120,56,44]],C:[[122,82,62],[104,70,56]],D:[[176,168,150],[150,144,130]],E:[[128,128,124],[108,110,112]],F:[[196,184,156],[170,160,136]],G:[[96,58,46],[84,52,44]],H:[[104,116,132],[88,98,114]]};
  const MK=(k,map,emap)=>new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.4}:{})});
  const Q=BATCH.queue({make:MK,cast:false,group:()=>MAPG.sections||scene,R:24*TILE});
  // each block scaled like the apartment house (its storey, raised base, window and door): windows on its street and back faces, a door and shop windows at the street
  const RZ=28, STY=162.5, WIN=[42,94], PXB=5, FACE={s:'f',n:'b',w:'e',e:'w'}, BACK={f:'b',b:'f',e:'w',w:'e'};
  for(const R of rows){ const L=R.lot, pal=THEME[R.b.id]||THEME.E, wall=pal[R.seed%pal.length], n=3+Math.floor(hash(R.seed,3,7)*5), H=RZ+n*STY, stone=R.seed%3===0;
    const box={x0:LOTX(L.x0),x1:LOTX(L.x1),y0:LOTY(L.y0),y1:LOTY(L.y1)}, fs=FACE[R.face], al=fs==='f'||fs==='b', a0=al?box.x0:box.y0, a1=al?box.x1:box.y1, feats=[]; let sd=R.seed*31;
    const win=(side,a,w,z0,z1,o={})=>{ sd++; feats.push({side,a0:a-w/2,a1:a+w/2,z0,z1,lit:hash(sd,1,9)<.3,seed:sd%997,box:false,...o}); };
    const nb=Math.max(1,Math.floor((a1-a0-1.2)/3.25)), st=a0+(a1-a0-(nb-1)*3.25)/2;
    for(const side of [fs,BACK[fs]])for(let lv=1;lv<n;lv++)for(let k=0;k<nb;k++)win(side,st+k*3.25,1.1,RZ+lv*STY+WIN[0],RZ+lv*STY+WIN[1]);
    const mid=st+Math.floor((nb-1)/2)*3.25; win(fs,mid,1.56,RZ,RZ+94,{door:true,lit:false});
    for(let k=0;k<nb;k++){ const a=st+k*3.25; if(Math.abs(a-mid)>1.4)win(fs,a,2.3,RZ+14,RZ+118,{lit:hash(sd,5,9)<.5}); }
    R.col=wall; const paint=BLOCKS.facade({feats,px:PXB,top:H,wall:stone?BLOCKS.stone():BLOCKS.brick(wall),trim:stone?[132,126,116]:sh(wall,.82),base:{z1:RZ,paint:BLOCKS.brick(sh(wall,.85))}});
    Q.add(XS(L.x0),ZS(L.y0),XS(L.x1),ZS(L.y1),()=>BLOCKS.make({...box,z0:0,z1:H,kind:'S',px:PXB,paint,roof:()=>[74,72,70]}));
    const q=[XS(L.x0),ZS(L.y0),XS(L.x1),ZS(L.y1)]; SOL.up.push(q); FIX.up.push([q[0],q[1],0,q[2],q[3],H*ZU*BLDK]); }
  for(const b of secs)for(const r of [{x0:b.x0,x1:b.x1,y0:A.y0+G.water-.4,y1:A.y0+G.water},mirrorY({x0:b.x0,x1:b.x1,y0:A.y0+G.water-.4,y1:A.y0+G.water})]){ const q=clip(r,b); if(q){ const w=[XS(q.x0),ZS(q.y0),XS(q.x1),ZS(q.y1)]; SOL.up.push(w); FIX.up.push([w[0],w[1],0,w[2],w[3],.9]); } }

  const SPC={}, SKN={lot:'lot',water:'water',shore:'quay',walk:'walk',road:'road',grass:'lawn'}, inB=(r,b)=>r.x0>=b.x0-.01&&r.x1<=b.x1+.01&&r.y0>=b.y0-.01&&r.y1<=b.y1+.01;
  for(const q of MP){ const b=secs.find(c=>inB(q.r,c)); if(b)(SPC[b.id]=SPC[b.id]||[]).push(q); } for(const k in SPC)SPC[k].sort((a,b)=>b.lift-a.lift);
  MODS.sections={pieces:MP,rows,road,inner,secs,kindAt:(x,y)=>{ const b=secs.find(c=>x>=c.x0&&x<c.x1&&y>=c.y0&&y<c.y1); if(!b)return null; for(const q of SPC[b.id]||[])if(x>=q.r.x0&&x<q.r.x1&&y>=q.r.y0&&y<q.r.y1)return SKN[q.k]; return 'land'; }};
  // trees in the park and lamps along it, one instanced mesh each
  const trees=[], posts=[];
  for(const b of secs){ const q=clip(P,b); if(!q)continue; let n=0; for(let i=0;i<260&&n<70;i++){ const x=q.x0+3+hash(b.col,i,41)*(q.x1-q.x0-6), y=q.y0+3+hash(b.row+9,i,43)*(q.y1-q.y0-6); if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<9)||HOLES.some(h=>x>h.x0-4&&x<h.x1+4&&y>h.y0-4&&y<h.y1+4))continue; trees.push({x,y,s:.8+.5*hash(i,b.col,47),k:i}); n++; } }
  // the globe posts, as on Market St: both sidewalks, a post every 28 of A's lamp spacing (33 tiles), the sides staggered half that, none by a station entrance; DRESS builds and lights them
  { const SP=28/.84, kiosks=LOOP.STA.filter(st=>!st.old).map(st=>st.kiosk), near=(x,y)=>kiosks.some(k=>x>k.x0-4&&x<k.x1+4&&y>k.y0-4&&y<k.y1+4);
    for(const b of secs)for(const [o,i,off] of [[inner,P,0],[O,road,SP/2]])for(const r of frame(o,i)){ const q=clip(r,b); if(!q)continue; const al=q.x1-q.x0>q.y1-q.y0, a0=al?q.x0:q.y0, a1=al?q.x1:q.y1, c=al?(q.y0+q.y1)/2:(q.x0+q.x1)/2;
      for(let a=Math.ceil((a0-off)/SP)*SP+off;a<a1-1;a+=SP){ const x=al?a:c, y=al?c:a; if(!near(x,y))posts.push({x,y}); } }
    DRESS.extra=posts.map(p=>[XS(p.x),ZS(p.y)]); }
  { const trunk=new THREE.CylinderGeometry(.2*T,.28*T,3.4,6).translate(0,1.7,0), crown=new THREE.IcosahedronGeometry(2.6*T,0).translate(0,5.2,0), o=new THREE.Object3D();
    const tm=new THREE.InstancedMesh(trunk,new THREE.MeshLambertMaterial({color:0x5a4030}),trees.length), cm=new THREE.InstancedMesh(crown,new THREE.MeshLambertMaterial({color:0x3f6e34,flatShading:true}),trees.length);
    trees.forEach((t,i)=>{ o.position.set(XS(t.x),0,ZS(t.y)); o.rotation.set(0,t.k,0); o.scale.setScalar(t.s); o.updateMatrix(); tm.setMatrixAt(i,o.matrix); cm.setMatrixAt(i,o.matrix);
      const r=.2*T*t.s; SOL.up.push([XS(t.x)-r,ZS(t.y)-r,XS(t.x)+r,ZS(t.y)+r]); FIX.up.push([XS(t.x)-r,ZS(t.y)-r,0,XS(t.x)+r,ZS(t.y)+r,3.4*t.s]); });
    tm.castShadow=cm.castShadow=true; scene.add(tm,cm);
  }
  const edge=(x,y,al,from,to)=>{ if(!S.loaded.some(b=>b.id===from)||!S.loaded.some(b=>b.id===to))return; const H=.9*T, X=XS(x), Z=ZS(y), e=.012, plate=id=>(g,w,h)=>{ g.fillStyle='#14361f'; g.fillRect(0,0,w,h); g.strokeStyle='#e8f2e8'; g.lineWidth=4; g.strokeRect(6,6,w-12,h-12); g.fillStyle='#e8f2e8'; g.textBaseline='middle'; g.textAlign='center';
      font(g,h*.22,700); g.fillText('ENTERING',w/2,h*.32); font(g,h*.36,900); g.fillText('SECTION '+id,w/2,h*.66); };
    bx(x-.06,y-.06,x+.06,y+.06,0,2.4,postM);
    if(!al){ sign(256,96,plate(to),[X-e,Z-H],[X-e,Z+H],1.7,2.35,true); sign(256,96,plate(from),[X+e,Z+H],[X+e,Z-H],1.7,2.35,true); }
    else { sign(256,96,plate(from),[X-H,Z+e],[X+H,Z+e],1.7,2.35,true); sign(256,96,plate(to),[X+H,Z-e],[X-H,Z-e],1.7,2.35,true); } };
  for(let c=1;c<S.grid.cols;c++){ const x=S.grid.x0+c*S.grid.w; for(let r=0;r<S.grid.rows;r++){ const y=r?P.y1+1.5:P.y0-1.5; edge(x,y,false,S.ids[c-1][r],S.ids[c][r]); } }
  for(const c of [0,S.grid.cols-1]){ const y=S.grid.y0+S.grid.h, x=c?P.x1+1.5:P.x0-1.5; edge(x,y,true,S.ids[c][0],S.ids[c][1]); }
  };
  MODS.sections={pieces:[],rows:[],road,inner,secs,kindAt:()=>null}; DRESS.extra=[];
  if(secs.length){ await LOAD('later'); others(); }
});
