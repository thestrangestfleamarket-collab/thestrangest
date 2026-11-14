// builds DEAD END's page: node tools/hide.cjs  ->  dist/hide.html (src/hide/, three and Rapier bundled in) and dist/hide-assets/ (data/hide/: pictures, models, sounds; the thing's body is VESPER WARD's pale figure)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/hide/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/hide/hide.html', 'utf8').replace('__HIDE__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/hide.html', html);
fs.rmSync('dist/hide-assets', { recursive: true, force: true }); fs.cpSync('data/hide', 'dist/hide-assets', { recursive: true }); fs.copyFileSync('data/scare/pale.glb', 'dist/hide-assets/m/pale.glb');
// THE MARKET's own furniture, plants, things and paintings (data/bookstore.json, bar.json, pfplants.json, pfitems.json, art.json), only the ones the house uses
{ const J = f => JSON.parse(fs.readFileSync('data/' + f + '.json', 'utf8')), out = { kit: {}, pf: {}, art: [] }, pick = (src, names, pre) => { for (const n of names) { if (!src[n]) throw new Error('hide: no market model ' + n); out.kit[pre + n] = src[n]; } };
  pick(J('bookstore'), ['tubchair', 'armchair', 'floorlamp', 'tablelamp', 'rug2', 'radiator', 'clock', 'plant', 'globe', 'sidetable', 'blanket', 'bookstack', 'book', 'lectern', 'bistrochair', 'bistrotable'], 'mk_');
  pick(J('bar'), ['stool', 'jukebox', 'pooltable', 'whiskey', 'martini', 'pianobench', 'chair'], 'mk_');
  for (const [f, names] of [['pfplants', ['floor', 'olive', 'fern', 'flower', 'herb', 'shrub', 'cactus', 'crate', 'lantern', 'wcan']], ['pfitems', ['guitar', 'harp', 'piano', 'violin', 'flute', 'trumpet', 'drum_snare', 'cooler_l', 'g_bread', 'f_cake', 'd_coffee', 'd_wine', 'g_soda', 'v_pumpkin', 'phone_home', 'radio_scanner', 'mus_guidebook']]]) { const d = J(f); for (const n of names) { const k = d.map[n]; if (!k || !d.m[k]) throw new Error('hide: no market thing ' + n); out.pf['mk_' + n] = d.m[k]; } }
  out.art = J('art').map(a => ({ w: a.w, h: a.h, i: a.i })); fs.writeFileSync('dist/hide-assets/market.json', JSON.stringify(out)); }
console.log('dist/hide.html', html.length, 'bytes, dist/hide-assets/ copied');
