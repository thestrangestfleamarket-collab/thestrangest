// THE AVATAR: you as one of the townsfolk — an outfit, a hairstyle, a beard, skin and hair colour, a height — a BODIES body cut from the RPG townsfolk (data/avatar.json, tools/avatar-bake.py); your look is a short code kept in OWNED and sent to the other players.
import {THREE} from './003-shx.js';
import {B64, SKIN} from './003a-skin.js';
import {OWNED} from './005-save.js';
import {BODIES} from './111a-bodies.js';
const AVATAR={}; window.AVATAR=AVATAR;
{ const D=__DATA__("data/avatar.json"), HEAD=BODIES.BONES.indexOf('head');
  const dec=M=>{ const d=SKIN.dec(M); if(!d.k){ d.k=B64(M.k); if(M.bi){ d.bi=B64(M.bi); d.bw=B64(M.bw); } } return d; };   // (points, colours, faces; and each point's role, bones)
  const OPT=AVATAR.OPT={
    outfit:Object.keys(D.outfits),
    hair:['bald',...Object.keys(D.hair)],
    beard:['none',...Object.keys(D.beard)],
    skin:[null,'#f2d6c2','#e3b48f','#c8916b','#a9714a','#84532f','#5e3a22','#3f2617'],
    hairc:[null,'#1c1612','#3e2b1e','#6e4a2c','#8a3b1f','#c0662e','#d9b66a','#8c8a86','#ebe8e0','#38558f'],
    tall:[.9,.95,1,1.05,1.1] };
  const KEYS=['outfit','hair','beard','skin','hairc','tall'], DEF=[0,0,0,0,0,2];   // the base: the monk's clothes, bald, no beard, his own colours, middle height
  const parse=c=>KEYS.map((k,i)=>{ const v=parseInt((c||'')[i],36); return v>=0&&v<OPT[k].length?v:DEF[i]; });
  const code=v=>v.map(n=>n.toString(36)).join('');
  const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  // a piece's colours with one role recoloured: each point keeps its own light and dark, the piece's brighter tones land on the colour
  const tint=(C,K,role,hex)=>{ if(!hex)return; const t=rgb(hex), idx=[], L=[];
    for(let i=0;i<K.length;i++)if(K[i]===role){ idx.push(i); L.push((C[i*3]+C[i*3+1]+C[i*3+2])/3); } if(!idx.length)return;
    const ref=Math.max(1,[...L].sort((a,b)=>a-b)[Math.floor(L.length*.7)]);
    idx.forEach((i,q)=>{ const k=Math.min(1.15,Math.max(.35,L[q]/ref)); for(let c=0;c<3;c++)C[i*3+c]=Math.min(255,t[c]*k); }); };
  // the faces of one look, flat, coloured, each point on two of the 15 bones (the head pieces on the head alone)
  function geom(v){ const O=D.outfits[OPT.outfit[v[0]]], HM=new THREE.Matrix4().fromArray(O.headM), skin=OPT.skin[v[3]], hc=OPT.hairc[v[4]], parts=[];
    const add=(M,onHead,roles)=>{ const d=dec(M), C=Float32Array.from(d.c);
      for(const [r,hex] of roles)tint(C,d.k,r,hex); let P=d.p;
      if(onHead){ P=new Float32Array(d.p.length); const p=new THREE.Vector3(); for(let i=0;i<P.length;i+=3){ p.set(d.p[i],d.p[i+1],d.p[i+2]).applyMatrix4(HM); P[i]=p.x; P[i+1]=p.y; P[i+2]=p.z; } }
      parts.push({P,C,I:d.i,bi:onHead?null:d.bi,bw:onHead?null:d.bw}); };
    add(O,false,[[0,skin]]);
    add(D.head,true,[[0,skin],[1,hc]]);
    if(v[1])add(D.hair[OPT.hair[v[1]]],true,[[1,hc]]);
    if(v[2])add(D.beard[OPT.beard[v[2]]],true,[[1,hc]]);
    const nf=parts.reduce((a,q)=>a+q.I.length/3,0), pos=new Float32Array(nf*9), nor=new Float32Array(nf*9), col=new Float32Array(nf*9), bi=new Float32Array(nf*6), bw=new Float32Array(nf*3);
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),e=new THREE.Vector3(),cl=new THREE.Color(); let f=0;
    for(const q of parts)for(let t=0;t<q.I.length;t+=3,f++){ const ix=[q.I[t],q.I[t+1],q.I[t+2]];
      a.fromArray(q.P,ix[0]*3); b.fromArray(q.P,ix[1]*3); c.fromArray(q.P,ix[2]*3); n.subVectors(b,a).cross(e.subVectors(c,a)).normalize();
      ix.forEach((v,j)=>{ const o=f*3+j; pos.set([q.P[v*3],q.P[v*3+1],q.P[v*3+2]],o*3); nor.set([n.x,n.y,n.z],o*3);
        cl.setRGB(q.C[v*3]/255,q.C[v*3+1]/255,q.C[v*3+2]/255,THREE.SRGBColorSpace); col.set([cl.r,cl.g,cl.b],o*3);
        if(q.bi){ bi.set([q.bi[v*2],q.bi[v*2+1]],o*2); bw[o]=q.bw[v]/255; } else { bi.set([HEAD,HEAD],o*2); bw[o]=1; } }); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
    g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1)); g.computeBoundingSphere(); return g; }
  const SKEL={}, skel=k=>SKEL[k]||(SKEL[k]=BODIES.skeleton(D.outfits[k].origin,D.outfits[k].rest));
  const shape=(body,v)=>{ const k=OPT.outfit[v[0]], O=D.outfits[k], s=skel(k); return Object.assign(body,{height:O.height/OPT.tall[v[5]],hipY:O.hipY,off:s.off,binv:s.binv,geo:()=>geom(v)}); };

  // yours: kept in OWNED (a short code), on YOU's BODY row as AVATAR, the default body
  let mine=parse(OWNED.get('avatar'));
  const me=shape({key:'avatar',label:'AVATAR',playable:true,at:null,look:()=>code(mine),variant:c=>AVATAR.of(c)},mine);
  BODIES.add(me);
  const VAR=new Map(); AVATAR.of=c=>{ let b=VAR.get(c); if(!b){ b=BODIES.fit(shape({key:'avatar'},parse(c))); VAR.set(c,b); } return b; };   // another player's look
  AVATAR.code=()=>code(mine); AVATAR.look=()=>Object.fromEntries(KEYS.map((k,i)=>[k,OPT[k][mine[i]]]));
  AVATAR.set=(k,i)=>{ const j=KEYS.indexOf(k); if(j<0||!(i>=0&&i<OPT[k].length))return; mine[j]=i; try{ OWNED.set('avatar',code(mine)); }catch(e){} shape(me,mine); BODIES.refit('avatar');
    if(BODIES.pick()!=='avatar')BODIES.set('avatar'); draw(); };

  /* ---------- YOU's rows: under BODY, the avatar's outfit, hair, beard, colours and height ---------- */
  const NAME={outfit:'OUTFIT',hair:'HAIR',beard:'BEARD',skin:'SKIN',hairc:'HAIR COLOUR',tall:'HEIGHT'}, TALLN=['SHORT','','MIDDLE','','TALL'];
  const ROWS={}, first=document.getElementById('lbody-walker'), at=first&&first.parentNode;
  if(at){ let after=at; while(after.nextSibling&&after.nextSibling.tagName!=='H3')after=after.nextSibling;
    for(const k of KEYS){ const h=document.createElement('h3'), r=document.createElement('div'); h.textContent=NAME[k]; r.className='row'; r.id='lav-'+k; ROWS[k]=r;
      OPT[k].forEach((o,i)=>{ const btn=document.createElement('button'); btn.dataset.i=i;
        if(k==='skin'||k==='hairc'){ btn.textContent=o?' ':'OWN'; btn.title=o||'its own colour'; if(o)btn.style.cssText=`background:${o};min-width:22px`; }
        else btn.textContent=k==='tall'?(TALLN[i]||'·'):o.toUpperCase().replace('HOOD',' HOOD');
        btn.onclick=()=>AVATAR.set(k,i); r.appendChild(btn); });
      after.after(h); h.after(r); after=r; } }
  function draw(){ KEYS.forEach((k,j)=>{ const r=ROWS[k]; if(r)for(const b of r.children)b.setAttribute('aria-pressed',String(+b.dataset.i===mine[j])); }); }
  draw();
}
export {AVATAR};
