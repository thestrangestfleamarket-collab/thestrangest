// builds EDGE OF 88's and HULL DOWN's pages: node tools/edge.cjs  ->  dist/edge.html, dist/tank.html (src/edge/, src/tank/; three 0.147 and its add-ons put in the page, one file each)
const fs = require('fs'), path = require('path'), es = require('esbuild');
const T = path.join(__dirname, '..', 'node_modules', 'three147'), min = process.env.MIN !== '0';
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const three = ['build/three.min.js', ...['objects/Sky', 'utils/BufferGeometryUtils', 'shaders/CopyShader', 'shaders/LuminosityHighPassShader', 'postprocessing/EffectComposer', 'postprocessing/MaskPass', 'postprocessing/RenderPass', 'postprocessing/ShaderPass', 'postprocessing/UnrealBloomPass'].map(f => 'examples/js/' + f + '.js')]
  .map((f, i) => { const s = fs.readFileSync(path.join(T, f), 'utf8'); return i && min ? es.transformSync(s, { minify: true, legalComments: 'none' }).code : s; }).join(';\n');
fs.mkdirSync('dist', { recursive: true });
for (const [dir, mark] of [['edge', '__EDGE__'], ['tank', '__TANK__']]) {
  const src = fs.readFileSync('src/' + dir + '/main.js', 'utf8'), js = min ? es.transformSync(src, { minify: true, target: 'es2020', charset: 'utf8', legalComments: 'none' }).code : src;
  const html = fs.readFileSync('src/' + dir + '/' + dir + '.html', 'utf8').replace('__THREE147__', () => safe(three)).replace(mark, () => safe(js));
  fs.writeFileSync('dist/' + dir + '.html', html); console.log('dist/' + dir + '.html', html.length, 'bytes');
}
