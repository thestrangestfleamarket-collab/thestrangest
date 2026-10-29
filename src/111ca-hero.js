// THE HERO: the superhero body (data/hero.json, baked by tools/hero-bake.py) in flat suit colours: a townsperson who walks main street (?hero=0 keeps him off), not playable.
import {BODIES} from './111a-bodies.js';
{ const D=__DATA__("data/hero.json");
  BODIES.baked(D,'hero','HERO',60,{suit:['#2a4fa8',.05],red:['#c0312b',.05],gold:['#f2c230',.04],skin:['#e6c4b0',.04],hair:['#2b211c',.04],eye:['#f0eee8',0],pupil:['#2a2420',0]});
}
