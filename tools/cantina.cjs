// builds THE CANTINA's page: node tools/cantina.cjs  ->  dist/cantina.html (src/cantina/, three bundled in) and dist/cantina-assets/ (data/cantina/ and the house track, fetched by the page)
const es = require('esbuild'), fs = require('fs');
// the band's track is SHARDWAVE's built-in one: its bars and words are read from src/wave/main.js, never kept twice
const wave = fs.readFileSync('src/wave/main.js', 'utf8'), at = wave.indexOf("id: 'rock'");
const grab = (key, open, close) => { const i = wave.indexOf(key + ': ' + open, at); let d = 0, j = i + key.length + 2; do { if (wave[j] === open) d++; else if (wave[j] === close) d--; j++; } while (d); return wave.slice(i + key.length + 2, j); };
const num = key => +wave.slice(at).match(new RegExp(key + ': ([0-9.]+)'))[1];
const track = { duration: num('duration'), barLen: num('barLen'), bars: Function('return ' + grab('bars', '[', ']'))(), karaoke: Function('return ' + grab('karaoke', '[', ']'))() };
const js = es.buildSync({ entryPoints: ['src/cantina/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', define: { __TRACK__: JSON.stringify(track) } }).outputFiles[0].text;
const html = fs.readFileSync('src/cantina/cantina.html', 'utf8').replace('__CANTINA__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/cantina.html', html);
fs.rmSync('dist/cantina-assets', { recursive: true, force: true }); fs.cpSync('data/cantina', 'dist/cantina-assets', { recursive: true }); fs.copyFileSync('data/wave/rock.mp3', 'dist/cantina-assets/rock.mp3');
console.log('dist/cantina.html', html.length, 'bytes,', track.bars.length, 'bars,', track.karaoke.length, 'lines, dist/cantina-assets/ copied');
