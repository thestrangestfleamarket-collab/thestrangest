// THE FISH MARKET (owner, 9 Nov 2026, after New York's Fulton Fish Market of the 1980s): the Hudson row east of the way through, from data/world.json's fishmarket place: the truck yard, the tin shed (1907) and the brick shed (1939), open to the street, their wholesalers' stalls, the elevated highway on its steel bents over the promenade, and Polyfork's things stood about it (data/fishprops.json, tools/fishprops-bake.py); a stall's counter opens its wholesaler's shop (characters.json, trade).
import {SHARED, THREE} from './003-shx.js';
import {BATCH, pos, SHOPS, UI, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLOCK, FIX, LEVEL, MAPG, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {FACADES} from './038zc-facades.js';
import {HUDSHOP} from './038zcc-hudshop.js';
import {CREW} from './111fb-fleamarket.js';
const FISHMKT={tris:0,things:[],stalls:[],sol:[],made:false};
{ const P=(LEVEL.places||[]).find(p=>p.id==='fishmarket');
  if(P&&P.tin&&P.brick&&P.highway){ const {XS,ZS}=SHARED.BOD, T=TILE, m=1/.84, MV=ZU*24/.84, GY=(u,v)=>SHARED.groundY?SHARED.groundY(XS(u),ZS(v)):0;
    const lin=c=>{ const t=new THREE.Color(); t.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); return [t.r,t.g,t.b]; };
    const rnd=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); };
    const PROPS=SYS.far(__LAZY__("data/fishprops.json")), ZN={}, SG=[], POOL=[]; let zk='', base=0;
    const zone=(k,b)=>{ zk=k; base=b; };   // (a zone's parts marked top stand over your head: its mesh k^ is not drawn in the overhead views while you are under it)
    const solid=(u0,v0,u1,v1,h)=>{ const r=[Math.min(XS(u0),XS(u1)),Math.min(ZS(v0),ZS(v1)),Math.max(XS(u0),XS(u1)),Math.max(ZS(v0),ZS(v1))]; SOL.up.push(r); FIX.up.push([r[0],r[1],base,r[2],r[3],base+h*MV]); FISHMKT.sol.push(r); };
    // a box: u east, v north (map tiles), h up (metres over the zone's ground); o.t its material (pl plain, tin, brick, cob), o.glow lit after dark, o.sol solid
    const box=(u0,u1,v0,v1,h0,h1,col,o={})=>{ const zz=zk+(o.top?'^':''), cur=ZN[zz]||(ZN[zz]={}), A=cur[o.t||'pl']||(cur[o.t||'pl']={P:[],U:[],C:[],G:[]}), k=lin(col), gl=o.glow||0, S={tin:[1.2,2.4],brick:[1.6,.6],cob:[2,2]}[o.t]||[1,1];
      const c=[[u0,v0,h0],[u1,v0,h0],[u1,v1,h0],[u0,v1,h0],[u0,v0,h1],[u1,v0,h1],[u1,v1,h1],[u0,v1,h1]].map(p=>[XS(p[0]),base+p[2]*MV,ZS(p[1])]);
      const F=[[0,1,5,4,u1-u0],[1,2,6,5,v1-v0],[2,3,7,6,u1-u0],[3,0,4,7,v1-v0],[4,5,6,7,u1-u0],[3,2,1,0,u1-u0]];
      F.forEach(([a,b,cc,d,len],fi)=>{ if(fi===5&&h0<=0)return;   // a bottom on the ground is never seen (and would share the street's ground)
        const wu=Math.abs(len)/m/S[0], wv=(fi>=4?Math.abs(v1-v0)/m:(h1-h0))/S[1];
        for(const [i,uu,vv] of [[a,0,0],[b,wu,0],[cc,wu,wv],[a,0,0],[cc,wu,wv],[d,0,wv]]){ A.P.push(c[i][0],c[i][1],c[i][2]); A.U.push(uu,vv); A.C.push(k[0],k[1],k[2]); A.G.push(gl); } });
      if(o.sol)solid(u0,v0,u1,v1,h1); };
    const wall=(u0,u1,v0,v1,h,col,t)=>{ box(u0,u1,v0,v1,0,3,col,{t,sol:1}); box(u0,u1,v0,v1,3,h,col,{t,top:1}); };
    const bx=(u,v,w,d,h0,h1,col,o)=>box(u-w*m/2,u+w*m/2,v-d*m/2,v+d*m/2,h0,h1,col,o);   // by its middle, w and d in metres
    const sign=(text,u0,u1,v,h0,h1,bg,fg,top)=>SG.push({text,u0,u1,v,h0,h1,bg,fg,base,z:zk+(top?'^':'')});   // a painted board facing the river
    /* ---------- the market's things ---------- */
    const WOOD=[164,128,84], WAX=[228,226,212], STEEL=[74,92,84], RUST=[122,78,56], DARK=[40,40,42], ICE=[232,240,246];
    const stack=(u,v,n,s)=>{ let h=0; for(let i=0;i<n;i++){ const r=rnd(s,i), wax=r<.45, hh=wax?.3:.26; bx(u+(r-.5)*.08,v+(rnd(i,s)-.5)*.08,wax?.62:.7,wax?.42:.46,h,h+hh-.02,wax?WAX:WOOD.map(c=>c*(.8+.3*r))); if(wax)bx(u,v,.64,.44,h+.1,h+.16,[52,96,150]); h+=hh; } solid(u-.3*m,v-.2*m,u+.3*m,v+.2*m,h); };
    const barrel=(u,v)=>{ bx(u,v,.58,.58,0,.88,[78,62,54],{sol:1}); bx(u,v,.62,.62,.28,.33,RUST); bx(u,v,.62,.62,.6,.65,RUST); bx(u,v,.46,.46,.88,.93,[255,150,50],{glow:3}); bx(u+.05,v,.2,.2,.93,1.2,[255,196,90],{glow:3.5}); POOL.push([u,v,2.2,base]); };
    const handtruck=(u,v)=>{ for(const s of [-.2,.2])bx(u+s*m,v,.04,.04,.12,1.25,[150,40,36]); bx(u,v,.44,.04,1.2,1.25,[150,40,36]); bx(u,v,.44,.04,.6,.64,[150,40,36]); bx(u,v-.14,.46,.3,.05,.08,[90,90,92]); for(const s of [-.26,.26])bx(u+s*m,v+.05,.06,.24,0,.24,DARK); };
    const fish=(u0,u1,v0,v1,h,s)=>{ const nu=Math.max(2,Math.round((u1-u0)/m/.34)), nv=Math.max(2,Math.round((v1-v0)/m/.3)); for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){ const r=rnd(i+s,j*3+s); if(r<.12)continue;
        const c=r<.5?[178,188,198]:r<.72?[112,132,150]:r<.86?[224,150,138]:[196,60,44], uu=u0+(u1-u0)*(i+.5)/nu, vv=v0+(v1-v0)*(j+.5)/nv; bx(uu,vv,.26,.1+.06*r,h,h+.05+.03*r,c); } };
    const icetable=(u,v,w,s)=>{ bx(u,v,w,1,0,.72,[120,96,70],{sol:1}); bx(u,v,w+.06,1.06,.72,.86,ICE,{glow:.25}); fish(u-w*m/2+.1,u+w*m/2-.1,v-.42*m,v+.42*m,.86,s); };
    const scale=(u,v,top)=>{ bx(u,v,.03,.03,2.25,top,DARK); bx(u,v,.34,.1,1.9,2.25,[232,228,214]); bx(u,v-.06,.2,.02,1.98,2.18,[40,44,50]); bx(u,v,.02,.02,1.5,1.9,DARK); bx(u,v,.42,.42,1.46,1.5,[170,174,176]); };
    // a Polyfork thing (data/fishprops.json): where, turned how many degrees, and how much of it is solid (half its width and depth in metres, as it lies)
    const PR=[], prop=(k,u,v,rot=0,hx=0,hz=0,hh=1.2)=>{ const g=GY(u,v); PR.push([k,u,v,rot,g]); if(hx){ const b0=base; base=g; solid(u-hx*m,v-hz*m,u+hx*m,v+hz*m,hh); base=b0; } };
    const awning=(u,v,s)=>{ for(const a of [-1,1])for(const b of [-1,1])bx(u+a*1.15*m,v+b*.7*m,.07,.07,0,2.15,[70,60,52]); for(let i=0;i<6;i++)bx(u+(i-2.5)*.42*m,v,.42,1.9,2.15,2.21,i%2?[236,232,220]:[184,52,44]); bx(u,v-.95*m,2.52,.03,1.95,2.15,[184,52,44]);
      bx(u,v,2.1,.9,0,.8,[136,104,72],{sol:1}); bx(u,v,2.14,.94,.8,.9,ICE); fish(u-1*m,u+1*m,v-.38*m,v+.38*m,.9,s); };
    const F0=P.y0, B0=P.y1, HW=P.highway, gRow=GY((P.x0+P.x1)/2,(F0+B0)/2), gPr=GY((P.x0+P.x1)/2,F0-2), gHw=GY((P.x0+P.x1)/2,(HW.y0+HW.y1)/2);
    const NAMES=['M. ROSSI & BRO.','EASTSIDE SMOKED FISH','SOUND SEAFOOD CORP.','NORTH RIVER SHAD CO.','A. FEIN LOBSTER','PIER SIX OYSTER CO.','HARBOR ICE & SALT','BAY RIDGE FILLET','TIDEWATER CLAM CO.','SOUTH FERRY FISH'], REC=LEVEL.chars||{};
    const stallAt=(x0,x1)=>(P.stalls||[]).find(s=>s.x>=x0&&s.x<x1);
    // a wholesaler's bay: its board over the opening, the ice table, a scale, boxes, the cold room's door at the back
    const bay=(i,x0,x1,top,zk)=>{ const c=(x0+x1)/2, S=stallAt(x0,x1), nm=S&&REC[S.who]?REC[S.who].name:NAMES[(i+zk)%NAMES.length], r=rnd(i,zk);
      sign(nm,x0+.45,x1-.45,F0-.1,top-.78,top-.08,r<.34?[236,232,218]:r<.67?[30,56,104]:[150,34,30],r<.34?[150,30,28]:[240,236,220]);
      icetable(c,F0+2.6,3,i*7+zk); scale(c+1.7,F0+1.3,top); stack(x0+.9,F0+4.2,4+(i%3),i+zk); stack(x1-.9,F0+5.2,3+((i+1)%3),i+zk+9); stack(x0+1.6,B0-3.9,5,i+zk+3);
      box(x0,x1,B0-3.3,B0-3.1,0,3,[196,198,190],{glow:.4}); bx(c,B0-3.34,1.1,.06,0,2.1,[150,156,160]); bx(c+.42,B0-3.4,.06,.06,1,1.1,DARK); bx(c,F0+4.5,1.2,.16,top-.34,top-.24,[255,240,200],{glow:2.6,top:1});
      prop('hotel-ice-machine',x1-.9,B0-3.85,0,.4,.35,1.9); if(i%2===0)prop('camp-cooler',c+.6,F0+4.3,i*37); if(i%3===1)prop(i%2?'wooden-barrel':'whiskey-barrel',x0+.7,B0-5,i*50,.3,.3);
      if(i%2)prop('stainless-prep-table',c-.4,F0+6,0,.75,.42); if(i%3===0)prop('race-sack',x1-1.1,F0+6.4,i*20);
      if(S){ FISHMKT.stalls.push({who:S.who,name:nm,x:XS(c),z:ZS(F0+2.6),y:gRow}); } };
    /* ---------- the yard: trucks, street stalls, crates, fire barrels ---------- */
    { const [x0,x1]=P.yard; zone('yard',gRow);
      box(P.x0+.25,P.tin[0],F0,B0-.35,0,.04,[150,146,140],{t:'cob'}); box(P.x0,P.tin[0],B0-.35,B0,0,2.8,[150,124,104],{t:'tin',sol:1});
      prop('box-trailer',x0+11,B0-2.3,90,7.06,1.27,4); prop('semi-tractor',x0+23.6,B0-2.3,90,3.26,1.27,3); prop('pickup-truck',x0+3.6,F0+5.2,90,2.42,.95,1.8);
      for(const [u,v] of [[x0+2,B0-4.3],[x0+20,B0-4.3],[x0+27.6,B0-4.2],[x0+4.2,F0+8.6]])prop('site-traffic-cone',u,v);
      prop('wooden-barrel',x1+.4,B0-1.3,0,.32,.42); prop('wooden-barrel',x1-.5,B0-1.5,40,.32,.42); prop('whiskey-barrel',x1+.5,B0-2.4,0,.26,.26); prop('oil-can-rack',x1+.6,F0+3.4,90,.27,.36);
      for(const [u,v,r] of [[x0+8.8,F0+4.6,10],[x0+9.6,F0+4.8,-25],[x0+14.6,F0+5.6,60],[x0+15.3,F0+5.2,5]])prop('race-sack',u,v,r); prop('roll-out-wheelie-bin',P.x0+.9,B0-1.2,90,.46,.33); prop('roll-out-wheelie-bin',P.x0+.9,B0-2.3,90,.46,.33);
      prop('timber-trestle-table',x0+22.6,F0+4.6,0,.8,.35,.8); prop('camp-cooler',x0+21.2,F0+4.7,15,.35,.33,.6); prop('camp-cooler',x0+24.2,F0+4.9,-10,.35,.33,.6); prop('standing-brazier',x0+18.4,F0+6.6,0,.4,.4);
      [2.6,10.5,18.6,27].forEach((d,i)=>awning(x0+d,F0+1.7,i*5+2)); barrel(x0+6.6,F0+2.3); barrel(x0+22.8,F0+2.6);
      for(let i=0;i<9;i++){ const u=x0+8+rnd(i,4)*(x1-x0-10), v=F0+4.4+rnd(i,8)*1.6; if(Math.abs(u-(x0+22.6))<3.2||Math.abs(u-(x0+15))<1.6||Math.abs(u-(x0+18.4))<1.2)continue; stack(u,v,2+Math.floor(rnd(i,6)*4),i+40); }
      for(let i=0;i<3;i++)bx(x0+8+i*6.2,F0+8,1.2,1,0,.15,WOOD.map(c=>c*.8)); handtruck(x0+19.6,F0+4); }
    /* ---------- the tin shed: corrugated iron between pilasters, sash windows upstairs, a pediment, the long canopy ---------- */
    { const [x0,x1]=P.tin, n=Math.round((x1-x0)/5.2), bw=(x1-x0)/n, GF=4.2, EV=7.8, TIN=[154,166,162], PIL=[182,190,184], TRIM=[206,206,194]; zone('tin',gRow);
      wall(x0,x1,B0-.4,B0,EV,TIN,'tin'); for(const u of [x0,x1-.4])wall(u,u+.4,F0+.5,B0-.4,EV,TIN,'tin');
      box(x0,x1,F0,F0+.35,GF,EV,TIN,{t:'tin',top:1}); box(x0+.4,x1-.4,F0+.35,B0-.4,0,.05,[112,114,114]); box(x0,x1,F0,B0,EV-.2,EV,[58,56,54],{top:1});
      box(x0-.3,x1+.3,F0-.4,B0+.2,EV,EV+.42,TRIM,{top:1}); box(x0,x1,F0-.12,F0+.4,GF-.1,GF+.22,TRIM,{top:1});
      for(let i=0;i<=n;i++){ const u=x0+i*bw-(i===n?.6:i?.3:0); box(u,u+.6,F0-.14,F0+.5,0,3,PIL,{sol:1}); box(u,u+.6,F0-.14,F0+.5,3,EV,PIL,{top:1}); box(u-.06,u+.66,F0-.2,F0+.5,EV-.5,EV,TRIM,{top:1}); box(u-.06,u+.66,F0-.2,F0+.5,0,.5,[120,126,122]); }
      for(let i=0;i<n;i++){ const a=x0+i*bw, b=a+bw; bay(i,a+(i?.3:.6),b-(i===n-1?.6:.3),GF-.1,0);
        for(const f of [.3,.7]){ const u=a+bw*f, lit=rnd(i,f*10)<.3; const tp={top:1}; bx(u,F0-.03,1.1,.05,5.05,6.85,lit?[250,214,150]:[38,46,54],lit?{glow:1.4,top:1}:tp); bx(u,F0-.06,1.26,.05,4.93,5.05,TRIM,tp); bx(u,F0-.06,1.26,.05,6.85,6.97,TRIM,tp); for(const s of [-.59,0,.59])bx(u+s*m,F0-.06,.07,.05,5.05,6.85,TRIM,tp); bx(u,F0-.06,1.1,.05,5.92,5.98,TRIM,tp); }
        if(i%3===1)handtruck(a+.9,F0-1.1); }
      const c=(x0+x1)/2; [[14,8.22,8.66],[10,8.66,9.1],[6,9.1,9.52],[2.4,9.52,9.9]].forEach(([w,h0,h1])=>box(c-w/2,c+w/2,F0-.2,F0+.4,h0,h1,PIL,{top:1})); sign('FISH MARKET',c-4.4,c+4.4,F0-.26,8.3,9.05,[154,166,162],[36,44,48],1);
      box(x0-.2,x1+.2,F0-3.8,F0-.12,GF+.05,GF+.2,[96,104,100],{t:'tin',top:1}); box(x0-.2,x1+.2,F0-3.86,F0-3.78,GF-.22,GF+.24,[128,138,132],{top:1}); for(let i=0;i<n;i++)bx(x0+(i+.5)*bw,F0-2,1.2,.14,GF-.08,GF+.04,[255,236,190],{glow:2.4,top:1});
      base=gPr; for(let i=0;i<=n;i++){ if(i%2)stack(x0+i*bw+.1,F0-.75,3+(i%3),i+70); else if(i&&i<n&&i%4===2)prop('metal-trash-can',x0+i*bw,F0-.8,i*30,.3,.3); } barrel(x0-.9,F0-1.4); barrel(x1+1.6,F0-1.4);
      prop('newspaper-box',x0-.6,F0-.6,0,.34,.23); prop('fire-alarm-call-box',x0-1.7,F0-.5,0,.3,.29,2.6); prop('wheeled-fire-extinguisher',x1-.9,F0+.9,0); for(let i=0;i<n;i++)POOL.push([x0+(i+.5)*bw,F0-1.2,bw*.5/m,gPr]); }
    /* ---------- the brick shed: brick piers at its ends, steel posts between open bays, a band of steel sash over a deep canopy, the name along the top ---------- */
    { const [x0,x1]=P.brick, n=Math.round((x1-x0)/5.9), bw=(x1-x0)/n, GF=4.5, EV=9, BR=[150,104,78], AL=[170,172,168]; zone('brick',gRow);
      wall(x0,x1,B0-.4,B0,EV,BR,'brick'); for(const u of [x0,x1-.4])wall(u,u+.4,F0,B0-.4,EV,BR,'brick');
      box(x0,x1,F0,F0+.4,GF+.25,EV,BR,{t:'brick',top:1}); box(x0+.4,x1-.4,F0+.4,B0-.4,0,.05,[112,114,114]); box(x0,x1,F0,B0,EV-.2,EV,[58,56,54],{top:1}); box(x0-.15,x1+.15,F0-.15,B0+.15,EV,EV+.2,[198,190,174],{top:1});
      for(const [a,b] of [[x0,x0+bw],[x1-bw,x1]]){ wall(a,b,F0,F0+.4,GF+.25,BR,'brick'); bx((a+b)/2,F0-.03,1.1,.06,0,2.2,[84,92,96]); bx((a+b)/2+1.9,F0-.03,1,.05,1.3,2.4,[38,46,54]); }
      sign('DEPT. OF MARKETS · 1939',x0+.5,x0+bw-.5,F0-.07,2.7,3.2,[64,60,56],[214,206,180]);
      const tp={top:1}; box(x0+.3,x1-.3,F0-.03,F0,5.4,7.4,[44,58,66],tp); for(let u=x0+.3;u<x1-.29;u+=1.1)box(u-.04,u+.04,F0-.06,F0,5.4,7.4,[70,84,80],tp); for(const h of [5.4,6.06,6.72,7.36])box(x0+.3,x1-.3,F0-.06,F0,h,h+.05,[70,84,80],tp);
      for(let i=0;i<n;i+=2)box(x0+.5+i*bw,x0+.5+(i+.6)*bw,F0-.035,F0-.03,5.45,7.35,[250,222,160],{glow:1.1,top:1});
      const c=(x0+x1)/2; sign('FISH MARKET',c-9,c+9,F0-.06,7.72,8.72,[150,104,78],[226,220,200],1);
      box(x0-.2,x1+.2,F0-3.4,F0+.3,GF,GF+.25,AL,tp); box(x0-.2,x1+.2,F0-3.46,F0-3.38,GF-.12,GF+.3,[60,64,66],tp);
      for(let i=1;i<n-1;i++){ const a=x0+i*bw, b=a+bw; if(i>1){ box(a-.18,a+.18,F0,F0+.36,0,3,STEEL,{sol:1}); box(a-.18,a+.18,F0,F0+.36,3,GF,STEEL,tp); }
        if(i===3){ wall(a+.18,b-.18,F0+.1,F0+.2,GF,[134,138,138]); for(let h=.2;h<2.9;h+=.3)box(a+.18,b-.18,F0+.07,F0+.1,h,h+.04,[104,108,108]); stack(a+1.4,F0-.7,4,91); stack(b-1.6,F0-.8,2,93); continue; }
        if(i===5)box(a+.18,b-.18,F0+.1,F0+.2,3,GF,[134,138,138],tp);
        bay(i,a+.18,b-.18,GF-.05,5); bx(a+bw/2,F0-1.8,1.2,.14,GF-.14,GF-.02,[255,236,190],{glow:2.4,top:1}); POOL.push([a+bw/2,F0-1.2,bw*.5/m,gPr]); }
      base=gPr; handtruck(x0+bw+1.2,F0-1.2); handtruck(x1-bw-1.4,F0-1.3); barrel(x1-bw*.5,F0-1.5); prop('soda-vending-machine',x0+bw*.28,F0-.45,0,.47,.31,1.5); prop('pay-phone-booth',x1-bw*.3,F0-.9,0,.62,.72,2.3); prop('metal-trash-can',x0+bw*.6,F0-.6,0,.3,.3); prop('wheeled-fire-extinguisher',x1-bw-.6,F0+.9,0); }
    // between and beside the sheds: shut off from the alley
    zone('yard',gRow); box(P.tin[1],P.brick[0],B0-.35,B0,0,2.8,[150,124,104],{t:'tin',sol:1}); box(P.tin[1],P.brick[0],F0,B0-.35,0,.04,[150,146,140],{t:'cob'}); box(P.brick[1],P.x1,F0,B0-.35,0,.04,[150,146,140],{t:'cob'}); box(P.brick[1],P.x1,B0-.35,B0,0,2.8,[150,124,104],{t:'tin',sol:1}); stack((P.tin[1]+P.brick[0])/2,B0-1.4,6,55); stack((P.tin[1]+P.brick[0])/2-.8,B0-2.4,4,56); prop('small-fishing-boat',(P.tin[1]+P.brick[0])/2,F0+4.6,0,1.18,3.42,1.6); prop('field-barricade',(P.tin[1]+P.brick[0])/2,F0+.2,0,1,.42);
    /* ---------- the elevated highway over the promenade: steel bents, plate girders, the deck and its parapets, a lamp under each span ---------- */
    { const H=HW.h, y0=HW.y0, y1=HW.y1, xa=P.x0+.2, xb=P.x1+60, ST=(LEVEL.places||[]).filter(p=>p.kind==='stairs'&&p.y1!=null&&p.y0<y1&&p.y1>y0); zone('hw',gHw);
      const tp={top:1}; for(const v of [y0+.6,y0+5.8,y1-5.8,y1-.6])box(xa,xb,v-.28,v+.28,H,H+1.3,STEEL,tp); box(xa,xb,y0-.5,y1+.5,H+1.3,H+1.6,[92,92,90],tp);
      for(const v of [y0-.5,y1+.3])box(xa,xb,v,v+.2,H+1.6,H+2.4,[156,152,142],tp); box(xa,xa+.3,y0-.5,y1+.5,H,H+2.4,STEEL,tp);
      for(let x=P.x0+2.2,k=0;x<xb;x+=HW.every,k++){ let u=x; for(const s of ST)if(u>s.x0-1.5&&u<s.x1+1.5)u=s.x1+1.6;
        for(const v of [y0+1,y1-1]){ box(u-.45,u+.45,v-.45,v+.45,0,H,STEEL,u<P.x1+1?{sol:1}:{}); box(u-.6,u+.6,v-.6,v+.6,0,.5,[112,112,108]); box(u-.5,u+.5,v-.5,v+.5,H-.5,H,RUST); }
        box(u-.4,u+.4,y0-.3,y1+.3,H-.15,H+1.3,STEEL,tp); for(const v of [y0+2.2,y1-2.2])box(u-.12,u+.12,v-.9,v+.9,H-.55,H-.15,STEEL,tp);
        if(u<P.x1){ const c=u+HW.every/2; bx(c,(y0+y1)/2,.9,.34,H-.2,H-.06,[255,190,110],{glow:2.6,top:1}); POOL.push([c,(y0+y1)/2,5.5,gHw]); } } }
    for(let x=P.x0+5,i=0;x<P.x1-2;x+=27,i++){ prop('mooring-bollard',x,BLOCK.prom[0]+1.5,0,.3,.3); if(i%2===1)prop('lifebuoy-on-a-post',x+5,BLOCK.prom[0]+1.4,0,.2,.2); }   // along the quay
    for(const d of [-2.2,0,2.2])prop('field-barricade',P.x0+1.2,(HW.y0+HW.y1)/2+d*2.4,90,.42,1);   // the highway's end at the way through
    /* ---------- the meshes ---------- */
    const tex=(N,f,rep)=>{ const cv=document.createElement('canvas'); cv.width=cv.height=N; f(cv.getContext('2d'),N); const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } return t; };
    const build=()=>{ if(FISHMKT.made)return; FISHMKT.made=true; const root=MAPG.bodega||scene, G=new THREE.Group(); G.name='fishmarket';
      const glow=mt=>{ mt.onBeforeCompile=sh=>{ sh.uniforms.uNight=FACADES.night; sh.vertexShader='attribute float aGlow; varying float vGlow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGlow=aGlow;');
          sh.fragmentShader='uniform float uNight; varying float vGlow;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*vGlow*(.2+uNight*1.8);\n#include <opaque_fragment>'); }; mt.customProgramCacheKey=()=>'fishmkt'; return mt; };
      const corr=tex(128,(g,N)=>{ for(let x=0;x<N;x++){ const s=.5+.5*Math.sin(x/N*Math.PI*2*5), l=150+90*s; g.fillStyle=`rgb(${l|0},${l|0},${l|0})`; g.fillRect(x,0,1,N); }
          for(let i=0;i<260;i++){ const x=rnd(i,1)*N, y=rnd(i,2)*N, r=rnd(i,3); g.fillStyle=r<.5?`rgba(120,70,40,${.1+.25*r})`:`rgba(30,34,36,${.08+.1*r})`; g.fillRect(x,y,1+r*2,6+r*40); } g.fillStyle='rgba(20,22,24,.5)'; g.fillRect(0,0,N,2); },true);
      const cob=tex(256,(g,N)=>{ g.fillStyle='#4a4844'; g.fillRect(0,0,N,N); for(let r=0;r<8;r++)for(let c=-1;c<5;c++){ const x=c*64+(r%2?32:0)+rnd(r,c)*4, y=r*32, l=120+90*rnd(c,r+9); g.fillStyle=`rgb(${l|0},${l*.97|0},${l*.92|0})`; g.beginPath(); g.roundRect(x+3,y+3,58,26,7); g.fill(); g.fillStyle='rgba(255,255,255,.08)'; g.fillRect(x+8,y+6,40,3); }
          for(let i=0;i<24;i++){ g.fillStyle=`rgba(20,28,34,${.08+.14*rnd(i,5)})`; g.beginPath(); g.ellipse(rnd(i,6)*N,rnd(i,7)*N,10+30*rnd(i,8),6+14*rnd(i,9),0,0,7); g.fill(); } },true);
      const TOPS=FISHMKT.tops={}, MAT={pl:glow(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})),tin:glow(new THREE.MeshLambertMaterial({vertexColors:true,map:corr,side:THREE.DoubleSide})),
        brick:glow(new THREE.MeshLambertMaterial({vertexColors:true,map:HUDSHOP.brick()})),cob:glow(new THREE.MeshLambertMaterial({vertexColors:true,map:cob}))};
      for(const z in ZN){ const ks=['cob','brick','tin','pl'].filter(k=>ZN[z][k]&&ZN[z][k].P.length), cat=f=>ks.flatMap(k=>Array.from(ZN[z][k][f])), F=BATCH.unfight(cat('P'),{U:[cat('U'),2],C:[cat('C'),3],G:[cat('G'),1]},true,BATCH.OUT); let t=0;   // each zone's materials cleaned together, the ground first: what stands on it wins
        for(const k of ks){ const n=ZN[z][k].P.length/9, a=F.at?F.at[t]:t, b=F.at?F.at[t+n]:t+n; t+=n; ZN[z][k]={P:F.P.slice(a*9,b*9),U:F.A.U.slice(a*6,b*6),C:F.A.C.slice(a*9,b*9),G:F.A.G.slice(a*3,b*3)}; } }
      for(const z in ZN)for(const k in ZN[z]){ const A=ZN[z][k], g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(A.C,3)); g.setAttribute('aGlow',new THREE.Float32BufferAttribute(A.G,1)); g.computeVertexNormals();
        const me=new THREE.Mesh(g,MAT[k]); me.name='fishmarket-'+z+'-'+k; me.castShadow=k!=='cob'; me.receiveShadow=true; G.add(me); FISHMKT.tris+=A.P.length/9; delete ZN[z][k];
        if(z.endsWith('^')){ g.computeBoundingBox(); const b=g.boundingBox, t=TOPS[z]||(TOPS[z]={r:[1e9,1e9,-1e9,-1e9],me:[]}); t.r=[Math.min(t.r[0],b.min.x-T),Math.min(t.r[1],b.min.z-T),Math.max(t.r[2],b.max.x+T),Math.max(t.r[3],b.max.z+T)]; t.me.push(me); } }
      // the boards: hand-painted names, one picture for all of them
      { const N=1024, RH=48, at=tex(N,(g,N)=>{ SG.forEach((s,i)=>{ const y=i*RH; g.fillStyle=`rgb(${s.bg.join(',')})`; g.fillRect(0,y,N,RH); g.strokeStyle=`rgb(${s.fg.join(',')})`; g.lineWidth=3; g.strokeRect(5,y+5,N-10,RH-10);
              let px=36; do{ g.font=`bold ${px}px "Arial Narrow", Impact, Arial, sans-serif`; px-=2; }while(g.measureText(s.text).width>N*.92&&px>10); g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=`rgb(${s.fg.join(',')})`; g.fillText(s.text,N/2,y+RH/2+2);
              for(let k=0;k<30;k++){ g.fillStyle=`rgba(40,36,30,${.05+.1*rnd(i,k)})`; g.fillRect(rnd(k,i)*N,y+rnd(k+3,i)*RH,2+rnd(k,7)*30,1.5); } }); }), Pp=[], Uu=[];
        const BM=new THREE.MeshLambertMaterial({map:at,side:THREE.DoubleSide,emissive:0xffffff,emissiveMap:at,emissiveIntensity:.22}), BZ={};         SG.slice(0,Math.floor(N/RH)).forEach((s,i)=>{ const t1=1-i*RH/N, t0=1-(i+1)*RH/N, z=ZS(s.v), a=[XS(s.u1),s.base+s.h0*MV,z], b=[XS(s.u0),s.base+s.h0*MV,z], c=[XS(s.u0),s.base+s.h1*MV,z], d=[XS(s.u1),s.base+s.h1*MV,z], Q=BZ[s.z]||(BZ[s.z]={P:[],U:[]}); Q.P.push(...a,...b,...c,...a,...c,...d); Q.U.push(0,t0,1,t0,1,t1,0,t0,1,t1,0,t1); });
        for(const z in BZ){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(BZ[z].P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(BZ[z].U,2)); g.computeVertexNormals();
          const me=new THREE.Mesh(g,BM); me.name='fishmarket-boards-'+z; me.raycast=()=>{}; G.add(me); FISHMKT.tris+=BZ[z].P.length/9; if(TOPS[z])TOPS[z].me.push(me); }
        FISHMKT.boards=SG.length; }
      // the lamps' and the fires' light on the ground after dark (no lamp of its own)
      { const pm=new THREE.MeshBasicMaterial({color:0xffb060,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}), Pp=[], K=12;
        for(const [u,v,r,b] of POOL)for(let k=0;k<K;k++){ const a0=k/K*6.283, a1=(k+1)/K*6.283, y=b+.03*MV; Pp.push(XS(u),y,ZS(v),XS(u+Math.cos(a0)*r*m),y,ZS(v+Math.sin(a0)*r*m*.8),XS(u+Math.cos(a1)*r*m),y,ZS(v+Math.sin(a1)*r*m*.8)); }
        const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); const me=new THREE.Mesh(g,pm); me.name='fishmarket-pools'; me.renderOrder=3; me.raycast=()=>{}; me.onBeforeRender=()=>{ pm.opacity=.15*FACADES.night.value; }; G.add(me); }
      root.add(G); FISHMKT.group=G; };
    const props=D=>{ const M=T/.84, mt=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}), by={}, GEO={}, CH=FISHMKT.chunks={}, CW=34, m4=new THREE.Matrix4(), q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0), one=new THREE.Vector3(1,1,1), c=new THREE.Color(); for(const p of PR){ const k=Math.floor((p[1]-P.x0)/CW)+'|'+p[0]; (by[k]=by[k]||[]).push(p); }   // in stretches of 34 tiles, each drawn only while you are near it
      for(const kk in by){ const [ci,k]=kk.split('|'), d=D[k]; if(!d)continue; if(!GEO[k]){ const qv=new Int16Array(Uint8Array.from(atob(d.p),ch=>ch.charCodeAt(0)).buffer), col=Uint8Array.from(atob(d.c),ch=>ch.charCodeAt(0)), b=d.b, Pp=new Float32Array(qv.length), C=new Float32Array(col.length);
        for(let i=0;i<qv.length;i++){ const a=i%3; Pp[i]=(b[a]+(qv[i]+32768)/65535*(b[a+3]-b[a]))*M; } for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
        const F=BATCH.unfight(Pp,{C:[C,3]}), g0=new THREE.BufferGeometry(); g0.setAttribute('position',new THREE.Float32BufferAttribute(F.P,3)); g0.setAttribute('color',new THREE.Float32BufferAttribute(F.A.C,3)); g0.computeVertexNormals(); GEO[k]=g0; }
        const g=GEO[k], me=new THREE.InstancedMesh(g,mt,by[kk].length), cg=CH[ci]||(CH[ci]={g:new THREE.Group(),x:XS(P.x0+(+ci+.5)*CW),z:ZS((P.y0+HW.y0)/2),tris:0}); if(!cg.g.parent){ cg.g.name='fishmarket-props-'+ci; FISHMKT.group.add(cg.g); } by[kk].forEach((p,i)=>me.setMatrixAt(i,m4.compose(new THREE.Vector3(XS(p[1]),p[4],ZS(p[2])),q.setFromAxisAngle(Y,p[3]*Math.PI/180),one))); me.name='fishmarket-'+k; me.castShadow=me.receiveShadow=true; me.computeBoundingSphere(); cg.g.add(me); cg.tris+=g.attributes.position.count/3*by[kk].length; }
      FISHMKT.props=PR.length; FISHMKT.propTris=Object.values(CH).map(c=>Math.round(c.tris)); };
    SYS.onStart(()=>{ try{ build(); }catch(e){ console.warn('FISHMKT',e); } PROPS().then(props).catch(e=>console.warn('FISHMKT props',e)); },'111fc-fishmarket');
    // a stall's counter: its wholesaler's wares, and they buy your catch
    SYS.add('places',()=>{ const T0=FISHMKT.tops; if(!T0)return; for(const k in T0){ const t=T0[k], r=t.r, v=!!UI.persp||!(pos.x>r[0]&&pos.x<r[2]&&pos.z>r[1]&&pos.z<r[3]); if(t.on!==v){ t.on=v; for(const me of t.me)me.visible=v; } }
      const C0=FISHMKT.chunks; if(C0)for(const k in C0){ const c=C0[k]; c.g.visible=Math.abs(pos.x-c.x)<55*T&&Math.abs(pos.z-c.z)<60*T; } },'111fc-fishmarket tops');
    let made=false; SYS.add('places',()=>{ if(made||!UI.thing||!FISHMKT.made)return; made=true;
      for(const s of FISHMKT.stalls){ const o=new THREE.Mesh(new THREE.BoxGeometry(3*T/.84,1.1*T,1.1*T/.84),new THREE.MeshBasicMaterial({visible:false})); o.position.set(s.x,s.y+.55*T,s.z); scene.add(o); FISHMKT.things.push(o);
        UI.thing({name:s.name+' (SELL YOUR CATCH, BUY FISH)',ghost:1,obj:o,reach:2*T,near:3.2*T,tall:1.2*T,act:()=>{ if(SHOPS.open)SHOPS.open({key:s.who,name:s.name}); }}); } },'111fc-fishmarket');
    CREW.hd.hanga_roa_fisherman=CREW.hd.trucker=Math.PI;   // the workers (their posts are their homes in data/world.json) face the street
    (WEEDS.clr=WEEDS.clr||[]).push([XS(P.x0),ZS(F0),XS(P.x1),ZS(B0)]);   // no grass on the market's floor
    STORE.places.push(['THE FISH MARKET',XS((P.tin[1]+P.brick[0])/2),ZS(F0-2.5),'up','see']);
    window.FISHDBGM=()=>({made:FISHMKT.made,tris:Math.round(FISHMKT.tris),stalls:FISHMKT.stalls.map(s=>s.who),boards:FISHMKT.boards||0,solids:FISHMKT.sol.length,things:FISHMKT.things.length,props:FISHMKT.props||0,propTris:FISHMKT.propTris||[]}); } }
window.FISHMKT=FISHMKT;
