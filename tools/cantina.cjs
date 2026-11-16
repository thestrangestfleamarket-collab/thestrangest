// builds THE CANTINA's page: node tools/cantina.cjs  ->  dist/cantina.html (src/cantina/, three bundled in) and dist/cantina-assets/ (data/cantina/ and the jukebox's records, data/radio/, fetched by the page)
const es = require('esbuild'), fs = require('fs');
// the jukebox plays the car radio's recordings (tools/radio-bake.py): the list goes into the page, the files beside it
const radio = JSON.parse(fs.readFileSync('data/radio.json', 'utf8')).stations.map(s => ({ id: s.id, name: s.name, tracks: s.tracks.map(t => ({ at: t.at, len: t.len, title: t.title, by: t.by, year: t.year })) }));
const js = es.buildSync({ entryPoints: ['src/cantina/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', define: { __RADIO__: JSON.stringify(radio) } }).outputFiles[0].text;
const html = fs.readFileSync('src/cantina/cantina.html', 'utf8').replace('__CANTINA__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/cantina.html', html);
fs.rmSync('dist/cantina-assets', { recursive: true, force: true }); fs.cpSync('data/cantina', 'dist/cantina-assets', { recursive: true });
fs.mkdirSync('dist/cantina-assets/radio'); for (const s of radio) fs.copyFileSync('data/radio/' + s.id + '.mp3', 'dist/cantina-assets/radio/' + s.id + '.mp3');
console.log('dist/cantina.html', html.length, 'bytes,', radio.reduce((n, s) => n + s.tracks.length, 0), 'records, dist/cantina-assets/ copied');
