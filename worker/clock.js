// THE CLOCK: the game's time, the same for everyone, one path for the page (put in by the build, __CODE__) and the worker (imported): real Central time (America/Chicago, CST/CDT), one game hour a real hour, unless the owner sets it ahead or behind (off, ms) or stops it (stop: the game's moment it stands at); kept in /shared/time.json as clk
const CLK={TZ:'America/Chicago'};
{ const fmt=new Intl.DateTimeFormat('en-US',{timeZone:CLK.TZ,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}), memo=new Map();
  // the zone's offset from UTC at a moment (ms; -6 h in winter, -5 h in summer), kept a minute
  CLK.zone=g=>{ const k=Math.floor(g/60000); let z=memo.get(k); if(z!=null)return z; const p={}; for(const x of fmt.formatToParts(new Date(k*60000)))p[x.type]=+x.value;
    z=Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute,p.second)-k*60000; if(memo.size>64)memo.clear(); memo.set(k,z); return z; };
  CLK.ok=c=>!!c&&typeof c==='object'&&(c.off==null||isFinite(c.off))&&(c.stop==null||isFinite(c.stop));
  CLK.at=(t,c)=>c&&c.stop!=null&&isFinite(c.stop)?+c.stop:t+(c&&isFinite(c.off)?+c.off:0);   // the game's moment (ms) at real moment t
  CLK.local=(t,c)=>{ const g=CLK.at(t,c); return g+CLK.zone(g); };   // the same, on Central's wall clock
  CLK.day=(t,c)=>Math.floor(CLK.local(t,c)/86400000);   // the game's date, as a day number (the same for every player)
  CLK.hour=(t,c)=>((CLK.local(t,c)/3600000)%24+24)%24;   // the hour of the day, 0 to 24
  CLK.count=(t,c)=>Math.floor(CLK.local(t,c)/3600000);   // whole hours since the epoch on Central's clock (the lives' H)
  // the owner's settings: put the clock at hour h (keeping its stop), stop it, run it on from where it stands, back to real time
  CLK.setHour=(t,c,h)=>{ const now=CLK.hour(t,c); let d=((h-now)%24+24)%24; if(d>12)d-=24; const g=CLK.at(t,c)+d*3600000; return c&&c.stop!=null?{off:g-t,stop:g}:{off:g-t,stop:null}; };
  // the real sunrise and sunset over New York (40.71 N 74.01 W, the game's sky; NOAA's sums) on the game's date, as hours on Central's clock: {rise, set}
  CLK.LAT=40.7128; CLK.LON=-74.006;
  CLK.sun=(t,c)=>{ const L=CLK.local(t,c), d=new Date(L), N=Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,1))/86400000)+1, y=2*Math.PI/365*(N-1), R=Math.PI/180;
    const eq=229.18*(.000075+.001868*Math.cos(y)-.032077*Math.sin(y)-.014615*Math.cos(2*y)-.040849*Math.sin(2*y)), de=.006918-.399912*Math.cos(y)+.070257*Math.sin(y)-.006758*Math.cos(2*y)+.000907*Math.sin(2*y)-.002697*Math.cos(3*y)+.00148*Math.sin(3*y);
    const ha=Math.acos(Math.max(-1,Math.min(1,Math.cos(90.833*R)/(Math.cos(CLK.LAT*R)*Math.cos(de))-Math.tan(CLK.LAT*R)*Math.tan(de))))/R, z=(L-CLK.at(t,c))/3600000;
    return {rise:(720-4*(CLK.LON+ha)-eq)/60+z,set:(720-4*(CLK.LON-ha)-eq)/60+z}; };
  // the real Moon over New York at the game's moment (suncalc's sums): alt and az in radians (az from the south, west positive), phase 0 new to .5 full to 1, kept ten seconds
  CLK.lst=(t,c)=>(((280.16+360.9856235*(CLK.at(t,c)/86400000-10957.5)+CLK.LON)%360)+360)%360;   // the sidereal time there (degrees): which stars are overhead
  { let mk=null, mv=null; CLK.moon=(t,c)=>{ const g=CLK.at(t,c), k=Math.floor(g/10000); if(k===mk)return mv; mk=k;
    const R=Math.PI/180, d=g/86400000-10957.5, e=23.4397*R, ra=(l,b)=>Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l)), dec=(l,b)=>Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
    const L=R*(218.316+13.176396*d), M=R*(134.963+13.064993*d), F=R*(93.272+13.22935*d), l=L+R*6.289*Math.sin(M), b=R*5.128*Math.sin(F), dist=385001-20905*Math.cos(M), mra=ra(l,b), mde=dec(l,b);
    const H=R*CLK.lst(t,c)-mra, ph=CLK.LAT*R, alt=Math.asin(Math.sin(ph)*Math.sin(mde)+Math.cos(ph)*Math.cos(mde)*Math.cos(H)), az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(ph)-Math.tan(mde)*Math.cos(ph));
    const sM=R*(357.5291+.98560028*d), sL=sM+R*(1.9148*Math.sin(sM)+.02*Math.sin(2*sM)+.0003*Math.sin(3*sM))+R*102.9372+Math.PI, sra=ra(sL,0), sde=dec(sL,0), SD=149598000;
    const phi=Math.acos(Math.sin(sde)*Math.sin(mde)+Math.cos(sde)*Math.cos(mde)*Math.cos(sra-mra)), inc=Math.atan2(SD*Math.sin(phi),dist-SD*Math.cos(phi)), ang=Math.atan2(Math.cos(sde)*Math.sin(sra-mra),Math.sin(sde)*Math.cos(mde)-Math.cos(sde)*Math.sin(mde)*Math.cos(sra-mra));
    mv={alt,az,phase:.5+.5*inc*(ang<0?-1:1)/Math.PI}; return mv; }; }
  CLK.pause=(t,c)=>({off:CLK.at(t,c)-t,stop:CLK.at(t,c)}); CLK.resume=(t,c)=>({off:CLK.at(t,c)-t,stop:null}); CLK.real=()=>({off:0,stop:null}); }
export {CLK};
