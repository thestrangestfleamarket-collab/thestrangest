// builds YATAI '86's page: node tools/sushi.cjs  ->  dist/sushi.html (src/sushi/, three bundled in) and dist/sushi-assets/ (data/sushi/: the Rocketbox people and their motion, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/sushi/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/sushi/sushi.html', 'utf8').replace('__SUSHI__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/sushi.html', html);
fs.rmSync('dist/sushi-assets', { recursive: true, force: true }); fs.cpSync('data/sushi', 'dist/sushi-assets', { recursive: true });
fs.copyFileSync('data/cars.json', 'dist/sushi-assets/cars.json'); // the street's cars are THE MARKET's kit
if (!fs.existsSync('dist/cantina-assets/pf')) { fs.mkdirSync('dist/cantina-assets/pf', { recursive: true }); for (const n of ['robot', 'gnome', 'mariachi', 'pirate', 'goblinMage', 'dragonborn']) fs.copyFileSync(`data/cantina/pf/${n}.glb`, `dist/cantina-assets/pf/${n}.glb`); } // the cantina's regulars come by for a bowl
if (!fs.existsSync('dist/cantina-assets/hand')) fs.cpSync('data/cantina/hand', 'dist/cantina-assets/hand', { recursive: true }); // the hands' mesh is the cantina's
console.log('dist/sushi.html', html.length, 'bytes, dist/sushi-assets/ copied');
