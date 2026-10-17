// ---- THE OLD GAME'S FINAL TOUCH (owner, 17 Oct 2026, "go all": its recipe, docs/OLD-LOOK.md; its FS3 and bleed passes): one pass over the
// picture, after its colours are final. NIGHT EYE: at night the dark goes grey-blue, as eyes see it (k = .8 x how dark it is, the old game's
// smoothstep .06-.42). DEEP: the darkest sinks to a deep navy (#0a1030, a quarter, by how dark). THE GLOW, STEPPED: only what is far brighter
// than what's round it (a lamp's glass, the neon, the lit pool) gathers a halo a few art pixels wide, cut into 8 hard steps, added over;
// at night and indoors (allowed back by the owner, hard-stepped only: the budget's rule 1 otherwise holds) ----
const LOOK={on:true, glowK:{value:0}, night:{value:0}};
LOOK.shader={uniforms:{tDiffuse:{value:null},uRes:{value:new THREE.Vector2(1,1)},uNight:LOOK.night,uGlowK:LOOK.glowK},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uNight,uGlowK; varying vec2 vUv;
    float lum(vec3 c){ return dot(c,vec3(.3,.59,.11)); }
    vec3 bright(vec2 u){ vec3 c=texture2D(tDiffuse,u).rgb; float l=lum(c), mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b));
      return c*max(smoothstep(.55,.9,l),smoothstep(.7,1.,mx)*smoothstep(.3,.7,mx-mn)); }
    void main(){ vec2 px=1./uRes; vec3 col=texture2D(tDiffuse,vUv).rgb;
      // the glow: what's bright, gathered from a ring of art pixels round (1 to 4 away), weighted as the old game's 11 taps fall
      vec3 g=vec3(0.); float wt=0.;
      for(int i=-4;i<=4;i++)for(int j=-4;j<=4;j++){ float r=length(vec2(i,j)); if(r>4.5)continue; float w=exp(-r*r/6.); g+=bright(vUv+vec2(i,j)*px)*w; wt+=w; }
      g/=wt; float gm=max(g.r,max(g.g,g.b)); if(gm>.001)g*=floor(gm*8.)/8./gm;   // (8 hard steps)
      col=1.-(1.-col)*(1.-clamp(g*uGlowK,0.,1.));   // (laid over as light is: screen)
      // the night eye and the deep
      float l=lum(col), k=uNight*.8*(1.-smoothstep(.06,.42,l));
      col=mix(col,vec3(l),k)*mix(vec3(1.),vec3(.62,.87,1.31),k);
      col=mix(col,vec3(.039,.063,.188),uNight*.3*(1.-l)*(1.-l));
      gl_FragColor=vec4(col,1.); }`};
// each frame: how much night (the clock's sun under the horizon; underground and indoors count as night for the glow)
LOOK.tick=()=>{ const dark=typeof CLOCK!=='undefined'&&CLOCK.dark()?1:0, inside=(typeof ROOMS!=='undefined'&&ROOMS.cur)||LVL==='down';
  LOOK.night.value+=(dark-LOOK.night.value)*.1; if(Math.abs(dark-LOOK.night.value)<.01)LOOK.night.value=dark;
  LOOK.glowK.value=LOOK.on?(dark||inside?1.28:.5):0; if(LOOK.sp){ LOOK.sp.enabled=LOOK.on; LOOK.sp.uniforms.uRes.value.set(RW,RH); } };
// ---- THE LENS (owner, 17 Oct 2026, his picks: "only things really big and in your view should be blurred, like in my example those poles are
// way higher and closer to camera"; one amount a thing, "gentle"; "add it as toggle"): a thing more than 6 tiles nearer the camera than you
// blurs, all of it by one amount from its nearest point (0.8 art px a tile past the 6, up to 6 px), its blur spilling softly past its edge as a
// lens does; you, the ground and everything near or behind you sharp. How: the world's things (the batch's faces each know theirs) and every
// other mesh get their amount on the processor every tenth of a second; one cheap pass draws each pixel's amount, only while some thing has
// one; the final pass blurs by it. (The park's trees are one merged mesh: not blurred yet.) DISPLAY: BLUR ON / OFF ----
const LENS={on:true, any:false, t:0, uMesh:{value:0}, objs:[], idx:new Map()};
try{ const v=localStorage.getItem('market-blur'); if(v!=null)LENS.on=v==='1'; }catch(e){}
LENS.rt=new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
LENS.tex=new THREE.DataTexture(new Float32Array(256*16),256,16,THREE.RedFormat,THREE.FloatType); LENS.tex.magFilter=LENS.tex.minFilter=THREE.NearestFilter;
LENS.mat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}); LENS.mat.onBeforeCompile=sh=>{ sh.uniforms.uAmtT={value:LENS.tex}; sh.uniforms.uMeshAmt=LENS.uMesh;
  sh.vertexShader='attribute float aObj; uniform sampler2D uAmtT; uniform float uMeshAmt; varying float vA;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n if(aObj>.5){ int i=int(aObj+.5); vA=texelFetch(uAmtT,ivec2(i%256,i/256),0).r; } else vA=uMeshAmt;');
  sh.fragmentShader='varying float vA;\n'+sh.fragmentShader.replace(/}\s*$/,' gl_FragColor=vec4(vA/6.,0.,0.,1.); }'); };
LENS.mat.customProgramCacheKey=()=>'lensamt';
// once the world is made: each batch mesh's faces get their thing's number, each thing its box
LENS.init=()=>{ scene.traverse(o=>{ const of=o.isMesh&&o.userData.objOf; if(!of)return; const g=o.geometry, P=g.attributes.position, n=P.count, A=new Float32Array(n); o.updateMatrixWorld();
    of.forEach((ob,f)=>{ if(!ob)return; let k=LENS.idx.get(ob); if(k==null){ if(LENS.objs.length>=256*16-1)return; k=LENS.objs.length+1; LENS.idx.set(ob,k); LENS.objs.push({b:new THREE.Box3()}); }
      const B=LENS.objs[k-1].b, v=new THREE.Vector3(); for(let q=0;q<6;q++){ A[f*6+q]=k; B.expandByPoint(v.fromBufferAttribute(P,f*6+q).applyMatrix4(o.matrixWorld)); } });
    g.setAttribute('aObj',new THREE.BufferAttribute(A,1)); }); };
// each tenth of a second: every thing's amount (its nearest corner along the camera's look against yours)
{ const F=new THREE.Vector3(), C=new THREE.Vector3(), S=new THREE.Sphere();
  const amt=near=>Math.max(0,Math.min(6,(near/TILE-6)*.8));
  LENS.tick=dt=>{ if((LENS.t-=dt)>0)return; LENS.t=.1; if(!LENS.on){ LENS.any=false; return; } cam.getWorldDirection(F); const cp=cam.position, dp=C.set(pos.x,py+TILE,pos.z).sub(cp).dot(F), D=LENS.tex.image.data; let any=false;
    LENS.objs.forEach((o,i)=>{ const b=o.b; let m=1e9; for(let c=0;c<8;c++){ C.set(c&1?b.max.x:b.min.x,c&2?b.max.y:b.min.y,c&4?b.max.z:b.min.z).sub(cp); m=Math.min(m,C.dot(F)); } const a=amt(dp-m); D[i+1]=a; if(a>0)any=true; });
    LENS.meshAmt=o=>{ const g=o.geometry; if(!g.boundingSphere)g.computeBoundingSphere(); S.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); if(S.radius>6*TILE)return 0; const a=amt(dp-(C.copy(S.center).sub(cp).dot(F)-S.radius)); if(a>0)any=true; return a; };
    LENS.tex.needsUpdate=true; LENS.dp=dp; LENS.any=any||LENS.objs.length===0&&false; LENS.check=true; };
  // the amounts' picture, drawn only while something blurs (you and what glows left out: they're never blurred)
  LENS.draw=()=>{ if(!LENS.on)return; if(LENS.check){ LENS.check=false; let any=false; scene.traverse(o=>{ if(!any&&o.isMesh&&o.visible&&!o.userData.objOf&&LENS.meshAmt&&LENS.meshAmt(o)>0)any=true; }); LENS.any=LENS.any||any; }
    if(!LENS.any){ LOOK.sp&&(LOOK.sp.uniforms.uLens.value=0); return; }
    if(LENS.rt.width!==RW||LENS.rt.height!==RH)LENS.rt.setSize(RW,RH);
    const saved=[]; scene.traverse(o=>{ if(!o.isMesh&&!o.isPoints&&!o.isLine)return; if(o.material&&(o.material.blending===THREE.AdditiveBlending||o.material.transparent)||o.isPoints||o.isLine){ if(o.visible){ saved.push([o,'v']); o.visible=false; } return; }
      saved.push([o,o.onBeforeRender]); const f0=o.onBeforeRender; o.onBeforeRender=function(r,s,c,g,m){ LENS.uMesh.value=o.userData.objOf?0:LENS.meshAmt(o); m.uniformsNeedUpdate=true; }; });
    const wv=W3.group.visible; W3.group.visible=false; const om=scene.overrideMaterial, bg=scene.background; scene.overrideMaterial=LENS.mat; scene.background=null;
    const cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(); renderer.setClearColor(0,1); renderer.setRenderTarget(LENS.rt); renderer.clear(); renderer.render(scene,cam); renderer.setRenderTarget(null); renderer.setClearColor(cc,ca);
    scene.overrideMaterial=om; scene.background=bg; W3.group.visible=wv; for(const [o,f] of saved){ if(f==='v')o.visible=true; else o.onBeforeRender=f; }
    LOOK.sp.uniforms.tAmt.value=LENS.rt.texture; LOOK.sp.uniforms.uLens.value=1; }; }
// the final pass, the lens's part: each pixel's amount, widened past its thing's edge (the blur spills), then its colour from a disk that wide
LOOK.shader.uniforms.tAmt={value:null}; LOOK.shader.uniforms.uLens={value:0};
LOOK.shader.fragmentShader=LOOK.shader.fragmentShader.replace('uniform float uNight,uGlowK;','uniform float uNight,uGlowK,uLens; uniform sampler2D tAmt;')
  .replace('vec3 col=texture2D(tDiffuse,vUv).rgb;',`vec3 col=texture2D(tDiffuse,vUv).rgb;
      if(uLens>.5){ float a=0.; for(int i=-6;i<=6;i+=2)for(int j=-6;j<=6;j+=2){ vec2 o=vec2(i,j); float am=texture2D(tAmt,vUv+o*px).r*6.; a=max(a,am*clamp(1.-(length(o)-am*.6)/3.,0.,1.)); }
        if(a>.3){ vec3 s=col; float n=1.; for(int k=0;k<12;k++){ float an=float(k)*.5236; vec2 d=vec2(cos(an),sin(an)); s+=texture2D(tDiffuse,vUv+d*a*px).rgb+texture2D(tDiffuse,vUv+d*a*.5*px).rgb; n+=2.; } col=s/n; } }`);
// DISPLAY: BLUR ON / OFF (the lens)
{ const pane=document.querySelector('#menu [data-p="display"]'), box=document.createElement('div');
  box.innerHTML='<h3>BLUR</h3><div class="row"><button class="btn" id="dblur"></button><span>big things right in front of the camera, softened</span></div>'; pane.appendChild(box);
  const b=box.querySelector('#dblur'), draw=()=>{ b.textContent=LENS.on?'BLUR ON':'BLUR OFF'; b.setAttribute('aria-pressed',String(LENS.on)); };
  b.onclick=()=>{ LENS.on=!LENS.on; try{ localStorage.setItem('market-blur',LENS.on?'1':'0'); }catch(e){} if(!LENS.on&&LOOK.sp)LOOK.sp.uniforms.uLens.value=0; draw(); }; draw(); }
