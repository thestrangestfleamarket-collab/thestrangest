
const cloud=RIG.bake(0.5,1), st=RIG.create(); st.snap=true; st.smooth=true;
const PW=112,PICH=100,AX=56,AY=86, uimg=new Uint32Array(PW*PICH), pcv=document.createElement('canvas'); pcv.width=PW; pcv.height=PICH;
const ptex=new THREE.CanvasTexture(pcv); ptex.magFilter=ptex.minFilter=THREE.NearestFilter; ptex.generateMipmaps=false; ptex.colorSpace=THREE.SRGBColorSpace;
const VS=1;
const cardG=new THREE.PlaneGeometry(PW/PPU,PICH/PPU); cardG.translate(0,(AY-PICH/2)/PPU,0);
const youMat=new THREE.MeshBasicMaterial({map:ptex,alphaTest:0.5,side:THREE.DoubleSide});
const you=new THREE.Mesh(cardG,youMat); you.castShadow=true; scene.add(you);
const pos=new THREE.Vector3(-2.2,0,3.2); let heading=0.8, py=0; window.POSOK=1; { const a=(QS.get('at')||'').split(',').map(Number); if(a.length>=2&&a.every(isFinite)){ pos.set(a[0],0,a[1]); py=a[2]||0; } }
