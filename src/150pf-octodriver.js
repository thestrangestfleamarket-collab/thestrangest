// THE OCTOPUS AT THE WHEEL: the convertible's driver (owner, 12 Nov 2026), twice a person's size, two arms on the steering wheel, one over the door, one in the air; in the passenger seat while a player drives.
import {THREE} from './003-shx.js';
import {MODS} from './006-map-pre.js';
{ const V3=THREE.Vector3, skin=new THREE.MeshLambertMaterial({color:0xd8552e,side:THREE.DoubleSide}), dark=new THREE.MeshLambertMaterial({color:0xa83a1e,side:THREE.DoubleSide}), pale=new THREE.MeshLambertMaterial({color:0xf2c8a8,side:THREE.DoubleSide}), eyeM=new THREE.MeshLambertMaterial({color:0xf4e7a0}), pup=new THREE.MeshBasicMaterial({color:0x100c0a});
  // an arm along a run of points, tapering from r0 to r1, a row of suckers under it
  const arm=(G,pts,r0,r1)=>{ const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))), n=22, g=new THREE.TubeGeometry(cv,n,1,8,false), P=g.attributes.position, c=new V3(), v=new V3();
    for(let i=0;i<=n;i++){ cv.getPointAt(i/n,c); const r=r0+(r1-r0)*i/n; for(let j=0;j<=8;j++){ const k=i*9+j; v.fromBufferAttribute(P,k).sub(c).multiplyScalar(r).add(c); P.setXYZ(k,v.x,v.y,v.z); } }
    g.computeVertexNormals(); const m=new THREE.Mesh(g,skin); m.castShadow=true; G.add(m);
    const tip=new THREE.Mesh(new THREE.SphereGeometry(r1,8,6),skin); tip.position.copy(cv.getPointAt(1)); G.add(tip);
    for(let i=2;i<n;i+=2){ cv.getPointAt(i/n,c); const r=r0+(r1-r0)*i/n, s=new THREE.Mesh(new THREE.SphereGeometry(r*.42,6,4),pale); s.position.set(c.x,c.y-r*.8,c.z); s.scale.y=.5; G.add(s); } };
  const octo=(D,ride)=>{ const G=new THREE.Group(); G.name='OCTOPUS'; const sx=D.seat[0], sy=D.seat[1], sz=D.seat[2], S=(r,m,x,y,z,a=1,b=1,c=1)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,18,14),m); o.position.set(x,y,z); o.scale.set(a,b,c); o.castShadow=true; G.add(o); return o; };
    S(.36,skin,sx,sy+.92,sz-.16,1.05,1.3,1.12).rotation.x=-.35; S(.3,skin,sx,sy+.5,sz+.02,1.15,.95,1.05); S(.2,dark,sx,sy+1.16,sz-.4,1.2,.8,1);
    for(const e of [-1,1]){ S(.1,skin,sx+e*.17,sy+.6,sz+.22,1,1.05,.9); S(.08,eyeM,sx+e*.175,sy+.6,sz+.27,1,1,.7); S(.036,pup,sx+e*.178,sy+.595,sz+.33,1.7,.5,.4); }
    const b=[sx,sy+.22,sz+.05], wy=sy+.36, wz=sz+.5, O=sx>0?1:-1;
    if(ride){ arm(G,[b,[sx-.14,sy+.36,sz+.34],[sx-.16,sy+.42,sz+.62]],.075,.03); arm(G,[b,[sx+.14,sy+.36,sz+.34],[sx+.16,sy+.42,sz+.62]],.075,.03); }
    else { arm(G,[b,[sx-.1,sy+.3,sz+.3],[sx-.15,wy,wz-.04],[sx-.1,wy+.1,wz+.03]],.075,.03); arm(G,[b,[sx+.1,sy+.3,sz+.3],[sx+.15,wy,wz-.04],[sx+.1,wy+.1,wz+.03]],.075,.03); }
    arm(G,[b,[sx+O*.3,sy+.3,sz+.1],[sx+O*.55,sy+.42,sz+.05],[sx+O*.72,sy+.3,sz],[sx+O*.74,sy+.02,sz-.06]],.08,.025);
    arm(G,[b,[sx-O*.25,sy+.5,sz-.2],[sx-O*.42,sy+1.05,sz-.3],[sx-O*.5,sy+1.55,sz-.22],[sx-O*.36,sy+1.78,sz-.08],[sx-O*.22,sy+1.66,sz]],.085,.022);
    arm(G,[b,[sx-O*.3,sy+.36,sz-.1],[sx-O*.7,sy+.42,sz-.18],[sx-O*1.05,sy+.36,sz-.14]],.075,.025);
    arm(G,[b,[sx-.12,sy+.02,sz+.4],[sx-.16,sy-.2,sz+.7]],.07,.03); arm(G,[b,[sx+.12,sy+.02,sz+.4],[sx+.16,sy-.2,sz+.7]],.07,.03);
    arm(G,[b,[sx,sy+.36,sz-.4],[sx-O*.1,sy+.44,sz-.9],[sx+O*.08,sy+.34,sz-1.3]],.08,.025);
    if(ride)G.scale.x=-1; return G; };
  MODS.cars.riders['convertible-60s']=(G,D,ride)=>{ if(D.seat)G.add(octo(D,ride)); }; }
