// builds THE GUEST LIST's page: node tools/guests.cjs  ->  dist/guests.html (src/guests/, three and Rapier bundled in) and dist/guests-assets/ (data/guests/: pictures, models, people)
const es = require('esbuild'), fs = require('fs');
const names = d => fs.readdirSync('data/guests/' + d).map(f => f.replace(/(_[dna]\.jpg|\.glb)$/, '')).filter((v, i, a) => a.indexOf(v) === i);
const js = es.buildSync({ entryPoints: ['src/guests/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error',
  define: { __TEX__: JSON.stringify(names('tex')), __MODELS__: JSON.stringify(names('m')), __PEOPLE__: fs.readFileSync('data/guests/people.json', 'utf8') } }).outputFiles[0].text;
const html = fs.readFileSync('src/guests/guests.html', 'utf8').replace('__GUESTS__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/guests.html', html);
fs.rmSync('dist/guests-assets', { recursive: true, force: true }); fs.cpSync('data/guests', 'dist/guests-assets', { recursive: true });
console.log('dist/guests.html', html.length, 'bytes, dist/guests-assets/ copied');
