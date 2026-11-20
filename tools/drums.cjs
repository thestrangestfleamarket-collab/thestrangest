// builds THE GARAGE's page: node tools/drums.cjs  ->  dist/drums.html (src/drums/, three bundled in) and dist/drums-assets/ (data/drums/: the recorded kit, the garage's models and surfaces, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/drums/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/drums/drums.html', 'utf8').replace('__DRUMS__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/drums.html', html);
fs.rmSync('dist/drums-assets', { recursive: true, force: true }); fs.cpSync('data/drums', 'dist/drums-assets', { recursive: true });
// the street's people, their motion, the car and the kerb's things are COLD BORE's own files (data/sniper/: Microsoft Rocketbox, MIT; the car and Poly Haven's, CC0)
const PEOPLE = ['Male_Adult_03', 'Male_Adult_05', 'Male_Adult_06', 'Male_Adult_08', 'Female_Adult_01', 'Female_Adult_02', 'Female_Adult_04', 'Female_Adult_09', 'Security_Male_01'];
fs.mkdirSync('dist/drums-assets/p', { recursive: true });
for (const n of PEOPLE) fs.copyFileSync('data/sniper/p/' + n + '.glb', 'dist/drums-assets/p/' + n + '.glb');
for (const s of ['m', 'f']) for (const c of ['walk', 'idle', 'talk', 'run']) fs.copyFileSync('data/sniper/p/a_' + s + '_' + c + '.glb', 'dist/drums-assets/p/a_' + s + '_' + c + '.glb');
for (const n of ['car', 'street_lamp_01', 'fire_hydrant']) fs.copyFileSync('data/sniper/m/' + n + '.glb', 'dist/drums-assets/m/' + n + '.glb');
for (let i = 0; i < 5; i++) fs.copyFileSync('data/sniper/tex/car_' + i + '.jpg', 'dist/drums-assets/tex/car_' + i + '.jpg');
// the trees are HULL DOWN's (six scanned species, each seen from two sides, with their sizes)
for (const f of fs.readdirSync('data/tank/tex')) if (/_d\.webp$/.test(f)) fs.copyFileSync('data/tank/tex/' + f, 'dist/drums-assets/tex/' + f);
fs.copyFileSync('data/tank/trees.json', 'dist/drums-assets/trees.json');
fs.copyFileSync('data/sniper/tex/asphalt_02_d.jpg', 'dist/drums-assets/tex/road_c.jpg'); fs.copyFileSync('data/sniper/tex/asphalt_02_n.jpg', 'dist/drums-assets/tex/road_n.jpg');
console.log('dist/drums.html', html.length, 'bytes, dist/drums-assets/ copied');
