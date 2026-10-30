// WHERE YOU STAND: the position, heading and height, from ?at= or the subway platform where every login starts; the jump and the fall.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, pos, st} from './003b-systems.js';
import {PPU, scene} from './004-main.js';
import {MODS, QS, SECTIONS} from './006-map-pre.js';

const cloud=RIG.bake(0.5,1); st.snap=true; st.smooth=true;
const PW=112,PICH=100,AX=56,AY=86, uimg=new Uint32Array(PW*PICH), pcv=document.createElement('canvas'); pcv.width=PW; pcv.height=PICH;
const ptex=new THREE.CanvasTexture(pcv); ptex.magFilter=ptex.minFilter=THREE.NearestFilter; ptex.generateMipmaps=false; ptex.colorSpace=THREE.SRGBColorSpace;
const VS=1;
const cardG=new THREE.PlaneGeometry(PW/PPU,PICH/PPU); cardG.translate(0,(AY-PICH/2)/PPU,0);
const youMat=new THREE.MeshBasicMaterial({map:ptex,alphaTest:0.5,side:THREE.DoubleSide});
const you=new THREE.Mesh(cardG,youMat); you.castShadow=true; scene.add(LEVELS.own(you,'*'));
 SHARED.heading=0.8; SHARED.py=0; window.POSOK=1; { const a=(QS.get('at')||'').split(',').map(Number); if(a.length>=2&&a.every(isFinite)){ pos.set(a[0],0,a[1]); SHARED.py=a[2]||0; SHARED.floor=SHARED.py<-1.6?'down':'up'; }
  else if(!['at','place','sheet','npcat'].some(k=>QS.get(k)!=null)){ const p=MODS.station.plat; pos.set(p.x,0,p.z); SHARED.py=MODS.station.ground(p.x,p.z); SHARED.floor='down'; }   // every login starts on the subway platform (owner, 30 Oct 2026)
  if(QS.get('place')==null)SECTIONS.fit(pos); }
export {AX, AY, cloud, PICH, PW, uimg, VS, you};
