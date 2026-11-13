// builds THE SPECKLED BAND's page: node tools/holmes.cjs  ->  dist/holmes.html (src/holmes/ and data/holmes/stage.json, three and cannon-es bundled in, one file; node tools/holmes-bake.cjs makes stage.json again from Polyfork's files)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/holmes/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/holmes/holmes.html', 'utf8').replace('__HOLMES__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/holmes.html', html); console.log('dist/holmes.html', html.length, 'bytes');
