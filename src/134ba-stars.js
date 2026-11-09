// THE STARS: STARSKY makes the night sky's real stars (the Yale Bright Star Catalogue the telescope reads: each star's place, brightness and colour) and the Milky Way (its bright core, dust lanes and star clouds, after dark-sky photographs), painted once at the first night into two cubes the sky's dome reads (132), and turns them with the real sky over the game's moment (CLK.lst): the pole star over the map's north.
import {THREE} from './003-shx.js';
import {DN, SKY} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
const STARSKY={on:0};
{ const CAT=__LAZY__("data/stars.json"), U=SKY.U, R=Math.PI/180, N=768, NM=256, cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), gs=(x,s)=>Math.exp(-x*x/(s*s)); let busy=false;
  const G=[[-.0548755604,-.8734370902,-.4838350155],[.4941094279,-.44482963,.7469822445],[-.867666149,-.1980763734,.4559837762]];   // equatorial (J2000) to galactic
  const h3=(x,y,z)=>{ const n=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return n-Math.floor(n); };
  const n3=(x,y,z)=>{ const i=Math.floor(x), j=Math.floor(y), k=Math.floor(z); let u=x-i, v=y-j, w=z-k; u=u*u*(3-2*u); v=v*v*(3-2*v); w=w*w*(3-2*w); const L=(a,b,t)=>a+(b-a)*t;
    return L(L(L(h3(i,j,k),h3(i+1,j,k),u),L(h3(i,j+1,k),h3(i+1,j+1,k),u),v),L(L(h3(i,j,k+1),h3(i+1,j,k+1),u),L(h3(i,j+1,k+1),h3(i+1,j+1,k+1),u),v),w); };
  const fbm=(x,y,z,o)=>{ let a=.5, s=0, t=0; for(let i=0;i<o;i++){ s+=a*n3(x,y,z); t+=a; a*=.5; x=x*2.03+11.3; y=y*2.03+5.7; z=z*2.03+3.1; } return s/t; };
  // the Milky Way's light toward a point of the sky: the disc brighter and wider toward the centre in Sagittarius, the bulge, the star clouds (Cygnus, Scutum, Carina), the Great Rift's dust down its middle, warm at the core and cool along the arms; the Andromeda galaxy's smudge
  const mw=(ex,ey,ez,o)=>{ const gx=G[0][0]*ex+G[0][1]*ey+G[0][2]*ez, gy=G[1][0]*ex+G[1][1]*ey+G[1][2]*ez, gz=G[2][0]*ex+G[2][1]*ey+G[2][2]*ez, l=Math.atan2(gy,gx)/R, b=Math.asin(cl(gz,-1,1))/R, dl=a=>{ const d=l-a; return d-360*Math.round(d/360); };
    const A=.2+.8*gs(l,68)+.2*gs(dl(78),17)+.16*gs(dl(-75),19)+.16*gs(dl(27),9)-.07*gs(dl(180),50), w=5.5+5.5*gs(l,42), b0=1.2*Math.sin((l+20)*R*2), bb=b-b0;
    const disc=.7*gs(bb,w)+.3*Math.exp(-Math.abs(bb)/(2.6*w)), bulge=gs(l,16)*gs(b+1,9.5), mott=fbm(gx*5.5+3,gy*5.5+1,gz*5.5+7,4), fine=fbm(gx*22,gy*22,gz*22,3);
    let I=A*disc*(.3+1.3*mott)*(.75+.5*fine)+.95*bulge*(.65+.7*mott);
    const Rf=.3+.7*gs(dl(22),58), bl=b0+1.2+2.6*Math.sin(l*R*2.3+1), dn=fbm(gx*4+7,gy*4+3,gz*15+1,4), d2=fbm(gx*13+2,gy*13+9,gz*30+4,3), lane=gs(b-bl,1.8+3.4*dn)*(.5+1.1*dn), patch=cl((dn*.6+d2*.4+.3*gs(b,9)*Rf-.52)/.16)*gs(b,13);
    const dust=cl(Rf*lane+.75*patch*(.4+.6*Rf)); I*=1-.9*dust; I=I/(1+.25*I);
    const k=cl(1.3*bulge+.35*gs(l,55)*gs(b,12)+.3*dust); o[0]=I*(.74+.26*k); o[1]=I*(.8+.07*k); o[2]=I*(1-.36*k);
    const m=gs(Math.acos(cl(ex*.7386+ey*.1393+ez*.6596,-1,1))/R,1.1)*.16; o[0]+=m; o[1]+=m*.96; o[2]+=m*.9; return o; };
  // a cube's faces as WebGL lays them out: a texel to its direction, and a direction to its face and texel
  const dir=(f,sc,tc,o)=>{ const d=f===0?[1,-tc,-sc]:f===1?[-1,-tc,sc]:f===2?[sc,1,tc]:f===3?[sc,-1,-tc]:f===4?[sc,-tc,1]:[-sc,-tc,-1], n=Math.hypot(d[0],d[1],d[2]); o[0]=d[0]/n; o[1]=d[1]/n; o[2]=d[2]/n; return o; };
  const face=(x,y,z,o)=>{ const ax=Math.abs(x), ay=Math.abs(y), az=Math.abs(z); if(ax>=ay&&ax>=az){ o[0]=x>0?0:1; o[1]=(x>0?-z:z)/ax; o[2]=-y/ax; } else if(ay>=az){ o[0]=y>0?2:3; o[1]=x/ay; o[2]=(y>0?z:-z)/ay; } else { o[0]=z>0?4:5; o[1]=(z>0?x:-x)/az; o[2]=-y/az; } return o; };
  const cube=(F,n)=>{ const t=new THREE.CubeTexture(F.map(d=>new THREE.DataTexture(d,n,n,THREE.RGBAFormat))); t.magFilter=t.minFilter=THREE.LinearFilter; t.generateMipmaps=false; t.needsUpdate=true; return t; };
  const wait=()=>new Promise(r=>setTimeout(r,0));
  const bake=async()=>{ const S=(await CAT()).s, o=[0,0,0], d=[0,0,0], MW=[], ST=[];
    for(let f=0;f<6;f++){ const D=new Uint8Array(NM*NM*4); for(let y=0;y<NM;y++)for(let x=0;x<NM;x++){ dir(f,(x+.5)/NM*2-1,(y+.5)/NM*2-1,d); mw(d[0],d[1],d[2],o); const i=(y*NM+x)*4; D[i]=255*Math.sqrt(cl(o[0]*.62)); D[i+1]=255*Math.sqrt(cl(o[1]*.62)); D[i+2]=255*Math.sqrt(cl(o[2]*.62)); D[i+3]=255; } MW.push(D); await wait(); }
    for(let f=0;f<6;f++){ const D=new Uint8Array(N*N*4); for(let i=3;i<D.length;i+=4)D[i]=255; ST.push(D); }
    // a star onto its face: a soft dot, wider the brighter (what is stored is the square root of its light)
    const dot=(x,y,z,L,sig,r,g,b)=>{ face(x,y,z,o); const D=ST[o[0]], px=(o[1]+1)/2*N-.5, py=(o[2]+1)/2*N-.5, rr=Math.ceil(sig*2.5), x0=Math.round(px), y0=Math.round(py);
      for(let j=y0-rr;j<=y0+rr;j++)for(let i=x0-rr;i<=x0+rr;i++){ if(i<0||j<0||i>=N||j>=N)continue; const q=L*Math.exp(-((i-px)*(i-px)+(j-py)*(j-py))/(sig*sig)); if(q<.002)continue; const k=(j*N+i)*4, a=D[k]/255, c=D[k+1]/255, e=D[k+2]/255;
        D[k]=255*Math.sqrt(cl(a*a+q*r)); D[k+1]=255*Math.sqrt(cl(c*c+q*g)); D[k+2]=255*Math.sqrt(cl(e*e+q*b)); } };
    for(const [ra,de,m,bv] of S){ if(m>6.9)continue; const v=Math.pow((6.9-m)/8.4,1.7), t=cl(((bv||0)+.3)/2), w=t<.35?t/.35:(t-.35)/.65;
      let r=t<.35?.66+.34*w:1, g=t<.35?.78+.2*w:.98-.4*w, b=t<.35?1:1-.6*w; r=.3+.7*r; g=.3+.7*g; b=.3+.7*b;
      dot(Math.cos(de*R)*Math.cos(ra*R),Math.cos(de*R)*Math.sin(ra*R),Math.sin(de*R),.035+1.1*v,.62+1.25*v,r,g,b); }
    await wait();
    // the stars too faint to tell apart, thick where the Milky Way is: its grain
    { let sd=7; const rnd=()=>{ sd=(sd*1664525+1013904223)>>>0; return sd/4294967296; }; for(let n=0,tries=0;n<60000&&tries<2e6;tries++){ const f=Math.floor(rnd()*6), sc=rnd()*2-1, tc=rnd()*2-1, i=(Math.min(NM-1,Math.floor((tc+1)/2*NM))*NM+Math.min(NM-1,Math.floor((sc+1)/2*NM)))*4, D=MW[f], p=D[i+1]/255;
        if(rnd()>(.035+p*p*1.6)*Math.pow(1+sc*sc+tc*tc,-1.5))continue; dir(f,sc,tc,d); const q=rnd(); dot(d[0],d[1],d[2],.012+.05*q*q*q,.6,.85,.9,1); n++; } }
    U.uStC.value=cube(ST,N); U.uMwC.value=cube(MW,NM); U.uStOn.value=1; STARSKY.on=1; };
  SYS.add('sky',()=>{ if(!SKY.on())return; if(!STARSKY.on&&!busy&&U.uStar.value>0){ busy=true; bake().catch(e=>{ console.warn('stars',e); setTimeout(()=>{ busy=false; },60000); }); }
    const L=CLK.lst(Date.now(),DN.clk)*R, p=CLK.LAT*R, sL=Math.sin(L), cL=Math.cos(L), sp=Math.sin(p), cp=Math.cos(p); STARSKY.lst=L/R;
    U.uEq.value.set(sL,cp*cL,-sp*cL, -cL,cp*sL,-sp*sL, 0,sp,cp); },'134ba-stars');   // a direction of the world (+x west, +y up, +z north) to its place among the stars
  window.STARSKY=STARSKY; }
