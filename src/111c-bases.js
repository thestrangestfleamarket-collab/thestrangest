// THE MAN AND THE WOMAN: two low-poly base bodies (data/bases.json, baked by tools/bases-bake.py), skinned to two bones a vertex, for BODIES.
import {BODIES} from './111a-bodies.js';
{ const D=__DATA__("data/bases.json"), PAL={skin:['#e6c4b0',.05],under:['#434e58',.06]};
  BODIES.baked(D,'man','MAN',44,PAL); BODIES.baked(D,'woman','WOMAN',36,PAL);
  BODIES.credit('MAN, WOMAN: "'+D.credit.title+'" by justice2free, CC BY 4.0');
}
