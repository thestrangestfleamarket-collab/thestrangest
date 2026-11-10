// THE CARRIED TELESCOPE AND MICROSCOPE: bag items that open the apartment instruments' eyepieces where you stand (SET IT HERE); owners carry both.
import {THREE} from './003-shx.js';
import {FORAGE, INSPECT} from './003b-systems.js';
import {SCOPE} from './150fd-scope.js';
import {MIC} from './150ff-microscope.js';
{ FORAGE.add({names:{telescope:'A FIELD TELESCOPE',microscope:'A FIELD MICROSCOPE'}});
  FORAGE.ROWB.push(id=>id==='telescope'?[['SET IT HERE','scopeset']]:id==='microscope'?[['SET IT HERE','micset']]:[]);
  FORAGE.ACT.scopeset=()=>{ if(FORAGE.has('telescope')){ SCOPE.carried=true; SCOPE.open(); } };
  FORAGE.ACT.micset=()=>{ if(FORAGE.has('microscope')){ MIC.carried=true; MIC.show(); } };
  SCOPE.ext.push({close:()=>{ SCOPE.carried=false; }}); MIC.ext.push({close:()=>{ MIC.carried=false; }});
  const brass={kind:'metal',metal:1,rough:.35}, wood={kind:'wood'};
  INSPECT.kinds.push({is:id=>id==='telescope'||id==='microscope',make:id=>{ '@later'; const P=INSPECT.part, g=new THREE.Group();
    if(id==='telescope'){ for(let i=0;i<3;i++){ const a=i/3*Math.PI*2; g.add(P('cyl',0x7e542e,Math.cos(a)*.17,.36,Math.sin(a)*.17,.016,.78,.016,Math.sin(a)*-.45,Math.cos(a)*.45,0,wood)); }
      g.add(P('cyl',0x96703a,0,.74,0,.035,.08,.035,0,0,0,brass)); g.add(P('cyl',0xc89c4a,0,.84,0,.045,.8,.045,0,1.05,0,brass)); g.add(P('cyl',0x1a1a1c,-.35,1.04,0,.052,.07,.052,0,1.05,0,brass)); g.add(P('cyl',0x1a1a1c,.37,.63,0,.022,.09,.022,0,1.05,0,brass)); }
    else { g.add(P('box',0x1a1a1c,0,.012,0,.16,.024,.2)); g.add(P('box',0x1a1a1c,0,.15,-.07,.03,.26,.035,.25)); g.add(P('box',0x2a2a2e,0,.11,.01,.12,.012,.12)); g.add(P('cyl',0xc8c8cc,0,.23,0,.022,.14,.022,0,0,0,brass)); g.add(P('cyl',0x1a1a1c,0,.32,0,.016,.05,.016)); g.add(P('cyl',0xc89c4a,0,.145,.01,.014,.05,.014,0,0,0,brass)); g.add(P('cyl',0xe8e0c8,0,.045,.01,.035,.012,.035)); }
    return g; }});
  FORAGE.OWNERS.push('telescope','microscope'); }
