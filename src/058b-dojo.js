{ const K=STORE.kit, {room,STEPS,sol}=K, {X,Y,Z,gbox}=BOD, hs=BOD.g.hash, sh=BOD.K.sh, {PROPS,LAMPS}=BOD.STOREK, J=BOD.GDJ;
  const lit=c=>Object.assign([Math.min(255,c[0]),Math.min(255,c[1]),Math.min(255,c[2])],{e:1});
  const B={x0:760,y0:-100,x1:778,y1:-88,h:150}, DA=(B.x0+B.x1)/2, DH=100, MAT={x0:DA-3.6,x1:DA+3.6,y0:-96.8,y1:-92.2};
  const GM=146.9, GX=BOD.OX+(GM-BOD.OX)/BLDK, GY=BOD.OY;
  const DOJO=window.DOJO={B,MAT,DA,id:'ninjadojo',gate:{x:GX,y:GY},built:false,ready:null};
  STORE.bound.x1=Math.max(STORE.bound.x1,X(796));
  STORE.main.doors.push(['THE DOJO',X(GX),Z(GY)+2.2*TILE]);
  const F3={D:'110101101101110',O:'111101101101111',J:'001001001101111'};
  const glyph=(s,u,v,k)=>{ const i=Math.floor(v/(6*k)), c=s[i], q=F3[c]; if(!q)return false; const r=Math.floor((v-i*6*k)/k), cc=Math.floor(u/k); return r<5&&cc>=0&&cc<3&&q[r*3+cc]==='1'; };
  STEPS.push(__CHUNK__('street',()=>{ const RED=[120,44,32], DK=[40,30,26], RF=[44,44,52], bs=[];
    const b=(x0,y0,x1,y1,z0,z1,c,o={})=>bs.push({x0,y0,x1,y1,z0,z1,c,...o});
    b(GX-.8,GY,GX+.8,GY+.03,0,DH-4,[16,13,12],{fs:(nx,ny,P,Q,z)=>z<6?[58,40,28]:z<9?[34,26,20]:[16,13,12]});
    for(const s of [-1,1])b(GX+s*.8-(s>0?0:.16),GY,GX+s*.8+(s>0?.16:0),GY+.2,0,DH+4,RED,{fs:(nx,ny,P,Q,z,k)=>sh(RED,k*(z<8?.7:1))});
    b(GX-1.15,GY,GX+1.15,GY+.18,DH-4,DH+4,RED,{top:()=>sh(RED,1.1)});
    b(GX-.95,GY,GX+.95,GY+.14,DH+4,DH+12,DK);
    b(GX-1.45,GY,GX+1.45,GY+.55,DH+12,DH+18,RF,{top:(x,y)=>Math.floor(x*24)%4===0?[30,30,36]:[58,58,68],fs:(nx,ny,P,Q,z,k)=>sh(z<2?[30,30,36]:RF,k)});
    b(GX-1.3,GY,GX+1.3,GY+.45,DH+18,DH+22,RF,{top:(x,y)=>Math.floor(x*24)%4===0?[30,30,36]:[66,66,76]});
    const NV=[34,42,82];
    b(GX-.78,GY+.04,GX+.78,GY+.06,DH-46,DH-4,NV,{fs:(nx,ny,P,Q,z)=>{ const u=(P-(GX-.78))/1.56, zz=z; if(zz>38)return [26,30,58]; if(Math.abs(u-1/3)<.012||Math.abs(u-2/3)<.012)return [14,14,24];
      const r=Math.hypot((u-.5)*1.56*24,zz-21); if(r<8.5&&r>6)return [236,230,214]; if(r<3.2)return [196,52,40]; return NV; },top:()=>NV});
    const SG=[214,196,150];
    b(GX-1.5,GY,GX-1.02,GY+.08,30,DH-6,SG,{fs:(nx,ny,P,Q,z,k)=>{ const u=Math.floor((P-(GX-1.5))*24)-2, v=Math.floor((DH-36)-z)-6; if(!ny)return sh(SG,k); if(u<0||u>7||v<0)return u<-1||u>9?[70,50,36]:SG; return glyph('DOJO',u,v,2)?[22,18,16]:SG; },top:()=>[70,50,36]});
    for(const s of [-1,1]){ const x=GX+s*1.25; b(x-.01,GY+.36,x+.01,GY+.38,DH-6,DH+12,[30,26,24]); b(x-.17,GY+.2,x+.17,GY+.54,DH-32,DH-8,[230,70,52],{em:1,fs:(nx,ny,P,Q,z)=>z<3||z>21?[40,30,28]:z%5<1?lit([200,40,30]):lit([255,104,70]),top:()=>[40,30,28]}); }
    b(GX-1.05,GY,GX+1.05,GY+.7,0,2,[120,118,112],{top:(x,y)=>hs(Math.floor(x*6),Math.floor(y*6),811)<.15?[104,102,98]:[132,130,124]});
    BATCH.tag=OBJ('store:dojogate','dojo gate'); for(const q of bs)gbox(q,q.em?'B':'L'); BATCH.tag=null;
    for(const s of [-1,1])sol(GX+s*.8-(s>0?0:.16),GY,GX+s*.8+(s>0?.16:0),GY+.2,DH);
    sol(GX-1.5,GY,GX-1.02,GY+.08,DH); }));
  K.offmap('THE DOJO HALL',[752,-108,788,-80],__CHUNK__('dojo',()=>{
    const WD=J.DJWOOD, PAP=J.DJPAP, PLA=J.DJPLA, wd=(k,f=1)=>sh(WD,k*f), WARM=[255,206,128];
    const RW={b:[DA-5.2,DA+5.2],w:[(B.y0+B.y1)/2],e:[(B.y0+B.y1)/2]}, RZ=74, RR=26;
    const shoji=(wall,a,z,f)=>{ const pa=((a%2)+2)%2;
      for(const m of RW[wall]||[]){ const r=Math.hypot((a-m)*24,z-RZ); if(r<RR+3){ if(r>=RR)return wd(f); return ((a-m)*24+40)%7<1.3||(z+40)%7<1.3?wd(f,1.2):lit(WARM); } }
      if(z<12)return wd(f,z<1?.6:(a*6)%1<.08?.75:1.05);
      if(z>=DH+18)return sh(PLA,f*(.94+.06*hs(Math.floor(a*20),Math.floor(z/2),721)));
      if(z>=DH+10)return wd(f,z<DH+11.5?.8:1.12);
      if(pa<.09||pa>1.91)return wd(f);
      if(z<13.5||z>DH+8.5||(a*4)%1<.07||z%12<1)return wd(f,1.25);
      return sh(PAP,f*(.94+.06*hs(Math.floor(a*12),Math.floor(z/3),723))); };
    const inner=(B_,nx,ny,Xw,Yw,z,f)=>shoji(ny>0?'b':ny<0?'f':nx>0?'w':'e',nx?Yw:Xw,z,f);
    const outer=(nx,ny,Xw,Yw,z,f)=>sh([60,40,30],f*(Math.floor((nx?Yw:Xw)*24)%7===0?.7:.95));
    const floor=(x,y)=>{ const e=Math.min(x-B.x0,B.x1-x,y-B.y0,B.y1-y);
      if(e<.9){ const al=Math.min(x-B.x0,B.x1-x)<Math.min(y-B.y0,B.y1-y), a=al?y:x, bb=al?x:y, k=Math.floor(bb*5), n=hs(k,Math.floor(a*1.3+k*.37),701); return sh(J.DJBRD,(bb*5)%1<.1?.72:.9+.18*n); }
      if(x>=MAT.x0&&x<MAT.x1&&y>=MAT.y0&&y<MAT.y1){ const m=Math.min(x-MAT.x0,MAT.x1-x,y-MAT.y0,MAT.y1-y), cx=(MAT.x0+MAT.x1)/2, cy=(MAT.y0+MAT.y1)/2, r=Math.hypot(x-cx,y-cy);
        if(m<.04)return [18,16,20]; if(m<.2)return [40,42,76]; if(Math.abs(r-1.25)<.07)return [150,40,34]; if(r<.12)return [150,40,34];
        const q=(x-MAT.x0-.2)%1.2; return sh([150,138,92],q<.03?.8:.96+.06*hs(Math.floor(x*30),Math.floor(y*9),705)); }
      const u=x-(B.x0+.9), v=y-(B.y0+.9), bi=Math.floor(u/2), bj=Math.floor(v/2), across=(bi+bj)&1, p=across?u-bi*2:v-bj*2, q=across?v-bj*2:u-bi*2;
      const pm=((p%1)+1)%1, edge=pm<.035||pm>.965, end=q<.02||q>1.98, w=hs(Math.floor(pm*30),Math.floor(q*9),703);
      return edge?[64,58,40]:end?sh(J.DJTAT,.8):sh(J.DJTAT,(Math.floor(pm*30)&1?.94:1)*(.96+.06*w)); };
    room(DOJO.id,'THE DOJO HALL',B,{floor,in:inner,out:outer,cope:[50,36,30],roof:(x,y)=>Math.floor(x*24)%5===0?[30,30,36]:[54,54,62]},{w:'f',a:DA,wd:1.6,h:DH},()=>{
      const thing=(name,boxes,o={})=>PROPS.push({kind:name,name,boxes,...o}), bx=(x0,y0,x1,y1,z0,z1,c,o={})=>({x0,y0,x1,y1,z0,z1,c,...o});
      J.setDJ({H:B.h}); J.djTokonoma(DA-2.2,B.y0+.12,DA+2.2);
      J.djBokkenRack(B.x0+.38,B.y0+3,B.y0+5.2);
      for(const [x,y] of [[B.x0+.6,B.y0+.6],[B.x1-.6,B.y0+.6]]){ J.djCandle(x,y); LAMPS[LAMPS.length-1].r=2.9; }
      for(const x of [DA-1.6,DA+1.6])J.djAndon(x,B.y1-.5);
      { const x=B.x1-.75, y0=B.y0+3.2, BL=[22,20,24], RD=[150,36,30];
        thing('katana stand',[bx(x-.3,y0,x+.3,y0+2.4,0,14,[58,36,26],{top:()=>[74,46,32]}),bx(x-.28,y0+.15,x-.2,y0+.25,14,30,[58,36,26]),bx(x-.28,y0+2.15,x-.2,y0+2.25,14,30,[58,36,26]),
          ...[22,28].flatMap((z,i)=>[bx(x-.26,y0+.05,x-.22,y0+1.6,z,z+2.2,BL),bx(x-.27,y0+1.6,x-.21,y0+2.35,z-.4,z+2.6,i?RD:[200,170,90])])]); }
      for(const y of [B.y0+6.4,B.y0+8.4]){ const x=B.x1-1.1, ST=[196,170,100];
        thing('makiwara',[bx(x-.12,y-.12,x+.12,y+.12,0,38,[110,78,50]),bx(x-.15,y-.15,x+.15,y+.15,24,36,ST,{fs:(nx,ny,P,Q,z,k)=>sh(z%4<1?[120,96,56]:ST,k),top:()=>[110,78,50]})]); }
      { const x=B.x0+1.3, y=B.y1-1.5, DR=[132,52,36];
        thing('taiko drum',[bx(x-.5,y-.25,x-.4,y+.25,0,22,[50,34,26]),bx(x+.4,y-.25,x+.5,y+.25,0,22,[50,34,26]),bx(x-.4,y-.42,x+.4,y+.42,10,34,DR,{fs:(nx,ny,P,Q,z,k)=>nx?(z<2||z>22?[40,30,26]:[226,214,186]):sh(Math.abs(z-12)<1||z<1.5||z>22.5?[200,170,90]:DR,k),top:()=>sh(DR,1.1)})]); }
      for(const [x,y] of [[DA-.7,B.y0+1.4],[DA+.7,B.y0+1.4]])thing('zabuton',[bx(x-.32,y-.32,x+.32,y+.32,0,2.5,[120,40,40],{top:(X_,Y_)=>Math.abs(X_-x)>.27||Math.abs(Y_-y)>.27?[90,30,30]:[140,48,46]})],{walk:1});
      { const cx=DA, cy=(MAT.y0+MAT.y1)/2, PP=[236,226,200]; thing('ceiling lamp',[bx(cx-.03,cy-.03,cx+.03,cy+.03,B.h-8,B.h,[30,26,24]),bx(cx-.7,cy-.7,cx+.7,cy+.7,B.h-14,B.h-8,PP,{em:1,fs:(nx,ny,P,Q,z)=>z<1||z>5?[60,40,30]:lit(PP),top:()=>[60,40,30]})],{high:1}); }
      for(const [x,y] of [[B.x0+1.3,B.y0+3.2],[B.x0+1.3,B.y1-3],[B.x1-1.9,B.y0+2.2],[B.x1-1.9,B.y1-2.6]]){
        thing('paper lantern',[bx(x-.01,y-.01,x+.01,y+.01,B.h-26,B.h,[30,26,24]),bx(x-.18,y-.18,x+.18,y+.18,B.h-54,B.h-26,[230,70,52],{em:1,fs:(nx,ny,P,Q,z)=>z<3||z>25?[40,30,28]:z%5<1?lit([210,46,34]):lit([255,112,76]),top:()=>[40,30,28]})],{high:1}); }
      LAMPS.push({own:1,room:1,day:true,x:DA,y:(MAT.y0+MAT.y1)/2,z:B.h-30,r:7,c:[1,.78,.52]});
    });
    DOJO.built=true; if(DOJO.ready)DOJO.ready(); }));
}
