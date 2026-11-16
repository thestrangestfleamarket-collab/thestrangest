// builds MIDNIGHT CRUMBS' page: node tools/crumbs.cjs  ->  dist/crumbs.html (src/crumbs/ in order, three and Rapier bundled in, its Polyfork creatures from data/pets/)
const es = require('esbuild'), fs = require('fs'), MIN = process.env.MIN !== '0';
const vendor = es.buildSync({ entryPoints: ['src/crumbs/vendor.js'], bundle: true, format: 'iife', target: 'es2022', charset: 'utf8', minify: MIN, legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const KEEP = ['key', 'name', 'rig', 'mesh', 'clips', 'zones', 'size', 'tall', 'license'];
const pf = k => { const d = JSON.parse(fs.readFileSync('data/pets/' + k + '.json', 'utf8')), o = {}; for (const x of KEEP) if (x in d) o[x] = d[x]; return '(window.PFDATA=window.PFDATA||{})[' + JSON.stringify(k) + ']=' + JSON.stringify(o) + ';'; };
const js = f => es.transformSync(fs.readFileSync('src/crumbs/' + f, 'utf8'), { minify: MIN, legalComments: 'none', target: 'es2022', charset: 'utf8' }).code;
const tag = s => '<script>' + s.replace(/<\/script/gi, '<\\/script') + '</script>';
let html = fs.readFileSync('src/crumbs/crumbs.html', 'utf8');
html = html.replace('<link rel="stylesheet" href="style.css">', () => '<style>' + fs.readFileSync('src/crumbs/style.css', 'utf8') + '</style>');
html = html.replace(/<script src="([a-z0-9/]+)(\.js)?"><\/script>/g, (m, f) => tag(f === 'vendor' ? vendor : f.startsWith('pf/') ? pf(f.slice(3)) : js(f + '.js')));
if (/<script src=/.test(html)) throw new Error('crumbs: a script was left unbuilt');
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/crumbs.html', html);
console.log('dist/crumbs.html', html.length, 'bytes');
