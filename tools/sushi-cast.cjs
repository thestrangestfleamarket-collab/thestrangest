// YATAI '86's people: node tools/sushi-cast.cjs  ->  data/sushi/cast.json. Polyfork's people (data/cast/) on their 15 bones and their recorded motion (data/pfavatar-*.json, data/pfanim-*.json), only the ones the cart uses (src/sushi/pf.js names them), as THE SPECKLED BAND's bake does.
const fs = require('fs'), path = require('path');
const J = (f) => JSON.parse(fs.readFileSync('data/' + f + '.json', 'utf8'));
const PF = fs.readFileSync('src/sushi/pf.js', 'utf8'), WHO = [...PF.matchAll(/^\s+([a-z_]+): \['[mf]'/gm)].map((m) => m[1]);
const CLIPS = (s) => ({ ['pfavatar-' + s]: ['Idle', 'Walk'], ['pfanim-' + s + '-act']: ['Sitting', 'Sitting talking'], ['pfanim-' + s + '-emote']: ['Talking', 'Agree', 'Head shake', 'Laughing', 'Arms folded'] });
const out = { license: 'Polyfork (polyfork.dev/licensing): use in games, no reselling the files', bones: null, bodies: {}, clips: { m: {}, f: {} }, skel: {} };
const want = new Set(WHO); for (const f of fs.readdirSync('data/cast')) { const D = JSON.parse(fs.readFileSync('data/cast/' + f, 'utf8')); out.bones = out.bones || D.bones; for (const k of Object.keys(D.bodies)) if (want.has(k)) { out.bodies[k] = D.bodies[k]; want.delete(k); } }
if (want.size) throw new Error('no body ' + [...want]);
for (const s of ['m', 'f']) for (const [file, names] of Object.entries(CLIPS(s))) { const D = J(file); if (D.skel) out.skel[s] = { hipY: D.skel.hipY, height: D.skel.height }; for (const n of names) { const c = (D.anim || D).clips[n]; if (!c) throw new Error('no clip ' + n + ' in ' + file); out.clips[s][n] = { n: c.n, dur: c.dur, speed: c.speed, q: c.q.map((v) => +v.toFixed(3)), p: c.p.map((v) => +v.toFixed(3)) }; } }
const s = JSON.stringify(out); fs.writeFileSync(path.join('data/sushi/cast.json'), s);
console.log('data/sushi/cast.json', s.length, 'bytes;', Object.keys(out.bodies).length, 'people,', Object.keys(out.clips.m).length + Object.keys(out.clips.f).length, 'clips');
