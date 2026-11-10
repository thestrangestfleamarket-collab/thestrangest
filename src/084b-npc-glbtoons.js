// The owner's .glb toons: the teddy bear, fetched after the start (the donut, origami fox, bear in the coat, Mr. Blocks, ember knight, Number 80, rain fish, manatee and ticket fox are archived, owner 5 Nov 2026).
import {CINEMA, SHOPS} from './003b-systems.js';
import {QS, SYS} from './006-map-pre.js';
import {PARTSNPC} from './080-npc-parts.js';
import {RIGNPC} from './083-npc-rig.js';
const GLBTOONS={list:[]}; window.GLBTOONS=GLBTOONS;
{ const DATA=__LAZY__("data/toons-glb.json");
  const SPR={ earL:{f:-.15,s:.12,k:70,c:6,lim:.4}, earR:{f:-.15,s:.12,k:70,c:6,lim:.4}, jL:{f:-.25,s:.1,k:45,c:5,lim:.35}, jR:{f:-.25,s:.1,k:45,c:5,lim:.35}, jB:{f:-.3,k:40,c:5,lim:.4},
    scarf:{f:-.35,s:.2,k:35,c:4,lim:.5}, hood:{f:-.1,s:.1,k:60,c:6,lim:.25}, horn:{f:-.06,s:.06,k:90,c:8,lim:.15}, hat:{f:-.08,s:.08,k:80,c:7,lim:.2}, umb:{f:-.12,s:.12,k:40,c:4,lim:.3},
    flapL:{f:-.3,k:45,c:5,lim:.4}, flapR:{f:-.3,k:45,c:5,lim:.4}, tail:{s:.3,y:.4,k:30,c:3,lim:.6}, tailFin:{s:.3,y:.4,k:30,c:3,lim:.6}, armLt:{f:-.1,k:50,c:5,lim:.3}, armRt:{f:-.1,k:50,c:5,lim:.3} };
  const KIND={
    teddy:{metres:1.4,radius:.3,speed:.34,stride:6,at:66,o:{leg:.4,arm:.3,bob:.025,rock:.05}} };
  const skirt=def=>{ const S=def.bones.filter(b=>/^[kc]\d+$/.test(b[0])).map(b=>b[0]); if(!S.length)return null;
    const ys=def.bones.filter(b=>S.includes(b[0])).map(b=>b[2][1]), top=Math.max(...ys), bot=Math.min(...ys), hip=def.bones.find(b=>b[0]==='hips')[2], r=Math.max(...def.bones.filter(b=>S.includes(b[0])).map(b=>Math.abs(b[2][0])))||1;
    const at=Object.fromEntries(def.bones.map(b=>[b[0],b[2]]));
    return c=>{ '@later'; const B=c.B, H=B.hips, lL=B.legL?B.legL.rotation.x:0, lR=B.legR?B.legR.rotation.x:0, dy=H.position.y-H.userData.rest.y, rz=H.rotation.z;
      for(const n of S){ const p=at[n], t=(top-p[1])/((top-bot)||1), wl=Math.max(0,Math.min(1,.5-p[0]/(2*r))), a=lL*wl+lR*(1-wl), d=hip[1]-p[1];
        const b=B[n]; b.position.y+=dy; b.position.z+=Math.sin(-a)*Math.max(0,d)*t*.9; b.position.x+=-rz*(p[1]-hip[1]); b.position.y+=(1-Math.cos(a))*Math.max(0,d)*t*.5; } }; };
  const make=(key,D)=>{ const K=KIND[key], g=RIGNPC.glb(D), sk=skirt(g);
    const def={bones:g.bones, mesh:g.mesh, glass:g.glass, springs:Object.fromEntries(Object.entries(SPR).filter(([b])=>g.bones.some(q=>q[0]===b))),
      pose:c=>{ RIGNPC.limbs(c,K.o); if(sk)sk(c); } };
    const N=RIGNPC.make(def,Object.assign({key,name:D.name,eye:-1,metres:K.metres,radius:K.radius,speed:K.speed,stride:K.stride},PARTSNPC.street(K.at,-70)));
    GLBTOONS.list.push(N); GLBTOONS[key]=N; if(CINEMA.toon)CINEMA.toon(key,N); return N; };
  GLBTOONS.load=()=>GLBTOONS.wait||(GLBTOONS.wait=DATA().then(J=>{ for(const k in KIND){ const D=J.chars[KIND[k].data||k]; if(D)make(k,D); } if(SHOPS&&SHOPS.sync)SHOPS.sync(); return GLBTOONS.list; }));
  const SH=QS.get('sheet'), go=()=>GLBTOONS.load().catch(e=>console.warn('GLBTOONS',e)); if(SH&&KIND[SH])go(); else SYS.onStart(go,'084b-npc-glbtoons'); }
