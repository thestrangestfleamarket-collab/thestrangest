const WOMAN=(()=>{ const {V,add,sub,mul,dot,rcone,ell,rbox}=RIG;
  const slim=(pc,A,B,k)=>Object.assign({},pc,{d:q=>{ const ab=sub(B,A), u=Math.max(0,Math.min(1,dot(sub(q,A),ab)/dot(ab,ab))), c=add(A,mul(ab,u)); return pc.d(add(c,mul(sub(q,c),1/k)))*k; }});
  const kx=y=>y>=30?.86:y>=24?.84+(y-24)/6*.02:y>=19?.84+(24-y)/5*.14:.98;
  const faceCut=(q,fy)=>Math.max(1.8-q.z,q.y-fy);
  const cap=(q,s=1)=>ell(q,V(0,43.6,.4),V(8.3*s,8.3*s,7.0*s));
  const HAIR={
    long:q=>Math.max(Math.min(cap(q),rbox(q,V(0,37,-2.2),V(7.9,9.5,4.4),1.2)),-faceCut(q,47.5)),
    waves:q=>Math.max(Math.min(cap(q),rbox(q,V(.8,35,-2.0),V(8.2,11,4.8),1.6)+Math.sin(q.y*1.3)*.35),-faceCut(q,46.8)),
    wavesBack:q=>Math.max(Math.min(cap(q),rbox(q,V(.4,35,-3.9),V(7.6,11,3.3),1.6)+Math.sin(q.y*1.3)*.35),-faceCut(q,47.2)),
    bob:q=>Math.max(Math.min(cap(q,1.03),rbox(q,V(0,41,-1.4),V(8.6,4.4,5.4),1.4)),-faceCut(q,45.6)),
    bun:q=>Math.max(Math.min(cap(q,.98),ell(q,V(0,50.2,-5.2),V(3.2,3.0,3.0))),-faceCut(q,48.5)),
    curls:q=>Math.max(ell(q,V(0,45.5,.2),V(11,10.2,9.6))+(hash(q.x*1.5|0,q.y*1.5|0,(q.z*1.5|0)+901)-.5)*.6,-Math.max(2.6-q.z,q.y-47.2)),
    pony:q=>Math.max(Math.min(cap(q,.98),rcone(q,V(0,47,-6.4),V(0,32,-8.6),2.0,1.0)),-faceCut(q,48.2)),
    pixie:q=>Math.max(cap(q,1.02),-faceCut(q,46.2)),
    braid:q=>{ let d=Math.max(cap(q,.98),-faceCut(q,48.4)); for(let i=0;i<9;i++)d=Math.min(d,ell(q,V(0,44-i*1.9,-6.8+i*.08),V(1.6-i*.06,1.3,1.4))); return d; },
    rolls:q=>Math.max(Math.min(cap(q),rcone(q,V(-5,50.5,2.6),V(-1,51.4,3.2),2.2,2.2),rcone(q,V(5,50.5,2.6),V(1,51.4,3.2),2.2,2.2),rbox(q,V(0,38.5,-2.2),V(8.4,4.6,4.6),1.6),rcone(q,V(-8,35.4,-2.2),V(8,35.4,-2.2),2.0,2.0)),-faceCut(q,46.4)),
    fringe:q=>Math.max(Math.min(cap(q,1.02),rbox(q,V(0,39,-1.8),V(8.4,6.6,5.0),1.3)),-faceCut(q,44.6))};
  const SKIRT={
    sheath:{hem:9.6,a:y=>y>17.5?5.6+(22-y)*.6:8.3-(17.5-y)*.07}, gown:{hem:.4,a:y=>y>17.5?5.6+(22-y)*.6:8.3+(17.5-y)*.28},
    aline:{hem:7.6,a:y=>5.6+(22-y)*.62}, slit:{hem:.4,a:y=>y>17.5?5.6+(22-y)*.6:8.3+(17.5-y)*.2,slit:true}, cocktail:{hem:13.2,a:y=>5.6+(22-y)*.72},
    mermaid:{hem:.4,a:y=>y>17.5?5.6+(22-y)*.6:y>8?8.3-(17.5-y)*.06:7.7+(8-y)*.9}, shift:{hem:11.5,a:y=>y>17.5?6.4+(22-y)*.42:8.3},
    wrap:{hem:7.0,a:y=>5.6+(22-y)*.5}, velvet:{hem:.4,a:y=>y>17.5?5.6+(22-y)*.6:8.3+(17.5-y)*.34}, tea:{hem:9.0,a:y=>5.6+(22-y)*.8}};
  const NECK={
    vneck:q=>q.y>29&&(q.z>1?Math.abs(q.x)<(q.y-28.4)*.9+.4||Math.abs(q.x)>4.6:q.y>30.4||Math.abs(q.x)>4.6), strapless:q=>q.y>29.4,
    halter:q=>q.y>28.6&&Math.abs(q.x)>3.0-(q.y-28.6)*.55, off:q=>q.y>30.4, high:q=>false,
    round:q=>q.y>30.2&&(q.z>1||Math.abs(q.x)>4.4)&&Math.abs(q.x)>(q.z>1?0:4.4)||q.y>30.2&&Math.abs(q.x)>5.2,
    wrapv:q=>q.z>1&&q.y>27.5&&Math.abs(q.x+(q.y-27.5)*.15)<(q.y-27.5)*.8,
    sweet:q=>q.y>29.6-Math.max(0,1.1-Math.abs(Math.abs(q.x)-2.1)*.8)*(q.z>1?1:0)||Math.abs(q.x)>5.4&&q.y>28.6};
  const NONE={d:()=>99,bb:[0,.1,0,.1,0,.1]};
  const pieces=o=>(J,base)=>{ const out=[], H=(x,y,z)=>hash(x|0,y|0,(z|0)+907);
    for(const pc of base){ const n=pc.n, s=n.slice(-1);
      if(n==='beard'){ out.push(Object.assign({},pc,NONE)); continue; }
      if(n==='hair'){ out.push(Object.assign({},pc,{d:HAIR[o.hair],paint:o.hair==='curls'?null:q=>H(q.x*3,q.y*.8,q.z*3)<.12?'coat':null,bb:[-12,12,24,57,-11,11]})); continue; }
      if(n==='torso'){ const tz=y=>y<26&&y>19?.92:1; out.push(Object.assign({},pc,{d:q=>Math.min(pc.d(V(q.x/kx(q.y),q.y,q.z/tz(q.y)))*Math.min(kx(q.y),tz(q.y)),ell(q,V(1.95,27.1,4.0),V(2.1,1.9,1.9)),ell(q,V(-1.95,27.1,4.0),V(2.1,1.9,1.9))),
        paint:q=>{ if(NECK[o.neck](q))return 'skin'; if(o.belt&&q.y>21.4&&q.y<22.6)return 'tie'; if(o.sparkle&&H(q.x*4,q.y*4,q.z*4)<.18)return 'linen'; return null; }})); continue; }
      if(n==='hips'){ out.push(Object.assign({},pc,{d:q=>pc.d(V(q.x/1.1,q.y,q.z))})); continue; }
      if(n==='neck'){ out.push(slim(pc,J.neck,J.headBase,.84)); continue; }
      if(/^sleeve/.test(n)){ out.push(o.sleeve==='none'||o.sleeve==='long'?Object.assign({},pc,NONE):slim(pc,J['shoulder'+s],J['elbow'+s],.88)); continue; }
      if(/^upperArm/.test(n)){ const p2=slim(pc,J['shoulder'+s],J['elbow'+s],.84); if(o.sleeve==='long')p2.m='shirt'; out.push(p2); continue; }
      if(/^forearm/.test(n)){ const p2=slim(pc,J['elbow'+s],J['wrist'+s],.84); if(o.sleeve==='long')p2.m='shirt'; if(o.gloves)p2.m='vest'; out.push(p2); continue; }
      if(/^(hand|fing)/.test(n)){ out.push(o.gloves?Object.assign({},pc,{m:'vest'}):pc); continue; }
      if(/^thigh/.test(n)){ out.push(slim(pc,J['hip'+s],J['knee'+s],.94)); continue; }
      if(/^shin/.test(n)){ out.push(slim(pc,J['knee'+s],J['ankle'+s],.86)); continue; }
      out.push(pc); }
    const S=SKIRT[o.skirt], top=22.4;
    out.push({n:'skirt',on:'hips',m:'shirt',d:q=>{ const y=Math.max(S.hem,Math.min(top,q.y)), a=S.a(y), bz=a*.7; let d=Math.max((Math.hypot(q.x/a,(q.z+.4)/bz)-1)*Math.min(a,bz),S.hem-q.y,q.y-top); if(S.slit)d=Math.max(d,-Math.max(1.2-q.x,.5-q.z,q.y-13)); return d; },
      paint:o.sparkle?q=>H(q.x*4,q.y*4,q.z*4)<.18?'linen':null:o.skirt==='wrap'?q=>Math.abs(q.x-(q.y-8)*.35)<.35&&q.z>0?'tie':null:null,bb:[-15,15,-1,24,-12,12]});
    return out; };
  const DESIGNS=[null,
    {name:'sheath',hair:'long',skirt:'sheath',neck:'vneck',sleeve:'none',look:{skin:'#e8c4a8',hair:'#241a18',coat:'#3a2a26',shirt:'#b3192b',pants:'#e8c4a8',shoes:'#9e1424'}},
    {name:'strapless gown',hair:'waves',skirt:'gown',neck:'strapless',sleeve:'none',look:{skin:'#f0d2bc',hair:'#7a3018',coat:'#9a4428',shirt:'#c0182c',pants:'#f0d2bc',shoes:'#c0182c'}},
    {name:'A-line midi',hair:'bob',skirt:'aline',neck:'round',sleeve:'short',look:{skin:'#d8a882',hair:'#121014',coat:'#2a2830',shirt:'#c22232',pants:'#d8a882',shoes:'#141214'}},
    {name:'halter gown',hair:'bun',skirt:'slit',neck:'halter',sleeve:'none',look:{skin:'#f2d6c4',hair:'#d8b464',coat:'#b08c40',shirt:'#a8101e',pants:'#f2d6c4',shoes:'#c8a040'}},
    {name:'off-shoulder cocktail',hair:'curls',skirt:'cocktail',neck:'off',sleeve:'short',look:{skin:'#7a4a30',hair:'#1a1210',coat:'#2a1c16',shirt:'#d0283a',pants:'#7a4a30',shoes:'#d0283a'}},
    {name:'mermaid gown',hair:'pony',skirt:'mermaid',neck:'high',sleeve:'long',look:{skin:'#e2b896',hair:'#4a2e1e',coat:'#6a4430',shirt:'#9c1222',pants:'#e2b896',shoes:'#141214'}},
    {name:'sequin shift',hair:'pixie',skirt:'shift',neck:'vneck',sleeve:'none',gloves:true,sparkle:true,look:{skin:'#f4dccc',hair:'#e8e2d4',coat:'#c8c0b0',shirt:'#c01a30',linen:'#ff6a7a',vest:'#141214',pants:'#2a1a1e',shoes:'#141214'}},
    {name:'wrap dress',hair:'braid',skirt:'wrap',neck:'wrapv',sleeve:'short',look:{skin:'#c88c64',hair:'#2c1c14',coat:'#4a3020',shirt:'#b81c2a',tie:'#7a0e18',pants:'#c88c64',shoes:'#7a0e18'}},
    {name:'velvet gown',hair:'rolls',skirt:'velvet',neck:'sweet',sleeve:'none',gloves:true,look:{skin:'#f0ccb4',hair:'#5a2a1a',coat:'#7a3a24',shirt:'#8a0c1c',vest:'#e8e2d6',pants:'#f0ccb4',shoes:'#8a0c1c'}},
    {name:'tea dress',hair:'fringe',skirt:'tea',neck:'round',sleeve:'short',belt:true,look:{skin:'#e6bea0',hair:'#3a2418',coat:'#5a3a26',shirt:'#c8202e',tie:'#141214',pants:'#e6bea0',shoes:'#141214'}}];
  return {pieces,DESIGNS,HAIR,SKIRT,NECK}; })();
