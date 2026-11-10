// THE CARRIED TELESCOPE AND MICROSCOPE: bag items that open the apartment instruments' eyepieces where you stand (SET IT HERE); owners carry both.
import {FORAGE} from './003b-systems.js';
import {SCOPE} from './150fd-scope.js';
import {MIC} from './150ff-microscope.js';
{ FORAGE.add({names:{telescope:'A FIELD TELESCOPE',microscope:'A FIELD MICROSCOPE'}});
  FORAGE.ROWB.push(id=>id==='telescope'?[['SET IT HERE','scopeset']]:id==='microscope'?[['SET IT HERE','micset']]:[]);
  FORAGE.ACT.scopeset=()=>{ if(FORAGE.has('telescope')){ SCOPE.carried=true; SCOPE.open(); } };
  FORAGE.ACT.micset=()=>{ if(FORAGE.has('microscope')){ MIC.carried=true; MIC.show(); } };
  SCOPE.ext.push({close:()=>{ SCOPE.carried=false; }}); MIC.ext.push({close:()=>{ MIC.carried=false; }});
  FORAGE.OWNERS.push('telescope','microscope'); }
