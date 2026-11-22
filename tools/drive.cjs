// builds SAVANO LANE NIGHT DRIVE's page: node tools/drive.cjs  ->  dist/drive.html (src/drive/, three 0.170 bundled in) and dist/drive-assets/ (data/drive/: the map's chunks, the cars, people, surfaces, sounds)
const fs = require('fs'), path = require('path'), es = require('esbuild');
const T = path.resolve('node_modules/three170');
const js = es.buildSync({ entryPoints: ['src/drive/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', alias: { three: path.join(T, 'build/three.module.js'), 'three/addons': path.join(T, 'examples/jsm') } }).outputFiles[0].text;
const html = fs.readFileSync('src/drive/drive.html', 'utf8').replace('__DRIVE__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/drive.html', html);
fs.rmSync('dist/drive-assets', { recursive: true, force: true }); fs.cpSync('data/drive', 'dist/drive-assets', { recursive: true }); console.log('dist/drive.html', html.length, 'bytes, dist/drive-assets/ copied');
