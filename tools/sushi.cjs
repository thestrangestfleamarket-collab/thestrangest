// builds RAMEN's page: node tools/sushi.cjs  ->  dist/ramen.html (src/sushi/, three bundled in) and dist/sushi-assets/ (data/sushi/: the people and their motion, the surfaces, models, sounds and the late movie, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/sushi/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/sushi/sushi.html', 'utf8').replace('__SUSHI__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/ramen.html', html); fs.rmSync('dist/sushi.html', { force: true });
fs.rmSync('dist/sushi-assets', { recursive: true, force: true }); fs.cpSync('data/sushi', 'dist/sushi-assets', { recursive: true });
if (!fs.existsSync('dist/cantina-assets/pf')) { fs.mkdirSync('dist/cantina-assets/pf', { recursive: true }); for (const n of ['robot', 'gnome', 'mariachi', 'pirate', 'goblinMage', 'dragonborn']) fs.copyFileSync(`data/cantina/pf/${n}.glb`, `dist/cantina-assets/pf/${n}.glb`); } // the cantina's regulars come by for a bowl
if (!fs.existsSync('dist/cantina-assets/hand')) fs.cpSync('data/cantina/hand', 'dist/cantina-assets/hand', { recursive: true }); // the hands' mesh is the cantina's
console.log('dist/ramen.html', html.length, 'bytes, dist/sushi-assets/ copied');
