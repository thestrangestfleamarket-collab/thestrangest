// builds SWIVEL's page: node tools/turret.cjs  ->  dist/turret.html (src/turret/, three bundled in) and dist/turret-assets/ (the ships, rocks and sounds it uses of SPACE FLEET's, data/space/)
const fs = require('fs'), es = require('esbuild');
const js = es.buildSync({ entryPoints: ['src/turret/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/turret/turret.html', 'utf8').replace('__TURRET__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/turret.html', html);
const M = ['cruiser', 'fighter', 'fighter2', 'frigate2', 'mother2', 'turret', 'turret2', 'mine', 'rock1', 'rock2', 'rock3'], S = ['gun', 'gun2', 'cannon', 'boom_s', 'boom_m', 'boom_l', 'boom_xl', 'hit', 'hit2', 'alarm', 'ambience', 'engine', 'order', 'win', 'lose', 'ui_deny', 'ui_click', 'thrust'];
fs.rmSync('dist/turret-assets', { recursive: true, force: true }); fs.mkdirSync('dist/turret-assets/m', { recursive: true }); fs.mkdirSync('dist/turret-assets/snd', { recursive: true });
for (const m of M) fs.copyFileSync('data/space/m/' + m + '.glb', 'dist/turret-assets/m/' + m + '.glb'); for (const s of S) fs.copyFileSync('data/space/snd/' + s + '.mp3', 'dist/turret-assets/snd/' + s + '.mp3');
fs.mkdirSync('dist/turret-assets/tex', { recursive: true }); for (const t of ['metal_plate', 'green_metal_rust']) for (const k of ['d', 'n', 'a']) fs.copyFileSync('data/tank/tex/' + t + '_' + k + '.jpg', 'dist/turret-assets/tex/' + t + '_' + k + '.jpg');   // HULL DOWN's worn metal and its turret's fittings
for (const m of ['seat', 'mfd', 'radio', 'switchbox']) fs.copyFileSync('data/tank/m/' + m + '.glb', 'dist/turret-assets/m/' + m + '.glb');
fs.writeFileSync('dist/turret-assets/stars.json', JSON.stringify(JSON.parse(fs.readFileSync('data/stars.json', 'utf8')).s.flatMap(s => s.map(v => Math.round(v * 100)))));   // the star catalogue, as SPACE FLEET takes it
console.log('dist/turret.html', html.length, 'bytes, dist/turret-assets/ copied');
