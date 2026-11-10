// THE STUDIO: you alone in a dark room under a soft light, drawn into a picture (the character page, the passport's photo, the first day's stage, the avatar designer).
import {THREE} from './003-shx.js';
import {W3} from './003b-systems.js';
import {renderer} from './004-main.js';
const DESIGN={}; window.DESIGN=DESIGN;
{
  // the studio light: a key over your left shoulder and a soft fill, no shadows from the street
  const ROOM=new THREE.Scene(), KEY=new THREE.DirectionalLight(0xffffff,2.1), LC=new THREE.Vector3(-.45,.65,.62).normalize(), UP=new THREE.Vector3(0,1,0), CC=new THREE.Color(); ROOM.add(new THREE.AmbientLight(0xffffff,.6),KEY,KEY.target);
  DESIGN.portrait=(target,c,mat)=>{ const g=W3.group, home=g.parent, sv={vis:g.visible,lv:W3.lv.value,L:W3.L.clone()}; g.visible=true; ROOM.add(g); g.updateMatrixWorld(true);
    const lw=LC.clone().applyQuaternion(c.quaternion); KEY.target.position.copy(g.position); KEY.position.copy(g.position).addScaledVector(lw,10); KEY.target.updateMatrixWorld();
    W3.lv.value=1; W3.L.copy(lw).applyAxisAngle(UP,-g.rotation.y).normalize(); const m0=W3.mesh.material; if(mat)W3.mesh.material=mat;
    renderer.getClearColor(CC); const ca=renderer.getClearAlpha(); renderer.setRenderTarget(target); renderer.setClearColor(mat?0x000000:0x15171e,mat?0:1); renderer.clear(); renderer.render(ROOM,c);
    renderer.setRenderTarget(null); renderer.setClearColor(CC,ca); W3.mesh.material=m0; if(home)home.add(g); g.visible=sv.vis; W3.lv.value=sv.lv; W3.L.copy(sv.L); };
  // a picture of you on a 2D canvas, the background left clear (the first day's stage; the passport's photo): whole, or head = the shoulders and up; a turns the camera round you
  const SNAP={}, HIDE=new THREE.MeshBasicMaterial({visible:false});
  DESIGN.snap=(cx,W,H,o={})=>{ const k=W+'x'+H, s=SNAP[k]||(SNAP[k]={rt:new THREE.WebGLRenderTarget(W,H),cam:new THREE.OrthographicCamera(-1,1,1,-1,.01,200),px:new Uint8Array(W*H*4)}); s.rt.texture.colorSpace=THREE.SRGBColorSpace;
    const g=W3.group; g.updateMatrixWorld(true); const gp=g.getWorldPosition(new THREE.Vector3()), eye=W3.eyeAt(new THREE.Vector3()).y-gp.y, a=g.rotation.y+(o.a||0), c=s.cam;
    const cy=gp.y+(o.head?eye*.9:0), top=o.head?eye*.27:eye*1.26, bot=o.head?-eye*.2:-eye*.08, ww=(top-bot)*W/H;
    c.left=-ww/2; c.right=ww/2; c.top=top; c.bottom=bot; c.updateProjectionMatrix(); c.position.set(gp.x+Math.sin(a)*20,cy,gp.z+Math.cos(a)*20); c.lookAt(gp.x,cy,gp.z); c.updateMatrixWorld(true);
    DESIGN.portrait(s.rt,c,HIDE); renderer.readRenderTargetPixels(s.rt,0,0,W,H,s.px); const img=cx.createImageData(W,H); for(let y=0;y<H;y++)img.data.set(s.px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); cx.putImageData(img,0,0); };
  // a picture of a figure (another player's, or a posed copy of yours), its body only (not its name tag or the box you click), whole (or o.full false: shoulders and up), in the same studio light
  DESIGN.snapOf=(cx,W,H,g,o)=>{ const k=W+'x'+H, s=SNAP[k]||(SNAP[k]={rt:new THREE.WebGLRenderTarget(W,H),cam:new THREE.OrthographicCamera(-1,1,1,-1,.01,200),px:new Uint8Array(W*H*4)}); s.rt.texture.colorSpace=THREE.SRGBColorSpace;
    g.updateMatrixWorld(true); const bb=o&&o.box?o.box.clone():new THREE.Box3(); if(!(o&&o.box))g.traverse(m=>{ if(m.isMesh&&!m.isSprite&&m.visible&&m.material&&m.material.visible!==false)bb.expandByObject(m); }); if(bb.isEmpty())return; const hh=bb.max.y-bb.min.y, mid=bb.getCenter(new THREE.Vector3()), a=g.rotation.y, c=s.cam;
    const span=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z), full=!o||o.full!==false, top=bb.max.y+(full?.05:.02)*hh, bot=full?bb.min.y-.04*hh:bb.max.y-.3*hh, cy=(top+bot)/2, ww=Math.max((top-bot)*W/H,full?span*1.1:0), vh=ww*H/W; c.left=-ww/2; c.right=ww/2; c.top=vh/2; c.bottom=-vh/2; c.updateProjectionMatrix();
    c.position.set(mid.x+Math.sin(a)*20,cy,mid.z+Math.cos(a)*20); c.lookAt(mid.x,cy,mid.z); c.updateMatrixWorld(true);
    const home=g.parent, vis=g.visible; g.visible=true; ROOM.add(g); const lw=LC.clone().applyQuaternion(c.quaternion); KEY.target.position.copy(mid); KEY.position.copy(mid).addScaledVector(lw,10); KEY.target.updateMatrixWorld();
    renderer.getClearColor(CC); const ca=renderer.getClearAlpha(); renderer.setRenderTarget(s.rt); renderer.setClearColor(0x000000,0); renderer.clear(); try{ renderer.render(ROOM,c); } finally{ renderer.setRenderTarget(null); renderer.setClearColor(CC,ca); if(home)home.add(g); else ROOM.remove(g); g.visible=vis; }
    renderer.readRenderTargetPixels(s.rt,0,0,W,H,s.px); const img=cx.createImageData(W,H); for(let y=0;y<H;y++)img.data.set(s.px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); cx.putImageData(img,0,0); };
}
export {DESIGN};
