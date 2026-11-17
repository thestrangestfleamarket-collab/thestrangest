// builds EDGE OF 88's and HULL DOWN's pages: node tools/edge.cjs  ->  dist/edge.html, dist/tank.html (src/edge/, src/tank/, a line `//@include x.js` in main.js is that file put in there; three 0.147 and its add-ons put in the page, one file each) and dist/tank-assets/ (data/tank/: HULL DOWN's sky, surfaces, models and sounds)
const fs = require('fs'), path = require('path'), es = require('esbuild');
const T = path.join(__dirname, '..', 'node_modules', 'three147'), min = process.env.MIN !== '0';
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const lib = f => { const s = fs.readFileSync(path.join(T, f), 'utf8'); return f.startsWith('examples') && min ? es.transformSync(s, { minify: true, legalComments: 'none' }).code : s; };
const three = ['build/three.min.js', ...['objects/Sky', 'utils/BufferGeometryUtils', 'shaders/CopyShader', 'shaders/LuminosityHighPassShader', 'postprocessing/EffectComposer', 'postprocessing/MaskPass', 'postprocessing/RenderPass', 'postprocessing/ShaderPass', 'postprocessing/UnrealBloomPass'].map(f => 'examples/js/' + f + '.js')]
  .map(lib).join(';\n'), gltf = lib('examples/js/loaders/GLTFLoader.js') + ';\n' + lib('examples/js/utils/SkeletonUtils.js');
fs.mkdirSync('dist', { recursive: true });
for (const [dir, mark] of [['edge', '__EDGE__'], ['tank', '__TANK__']]) {
  const src = fs.readFileSync('src/' + dir + '/main.js', 'utf8').replace(/^\/\/@include (\S+)$/gm, (_, f) => fs.readFileSync('src/' + dir + '/' + f, 'utf8')), js = min ? es.transformSync(src, { minify: true, target: 'es2020', charset: 'utf8', legalComments: 'none' }).code : src;
  const html = fs.readFileSync('src/' + dir + '/' + dir + '.html', 'utf8').replace('__THREE147__', () => safe(dir === 'tank' ? three + ';\n' + gltf : three)).replace(mark, () => safe(js));
  fs.writeFileSync('dist/' + dir + '.html', html); console.log('dist/' + dir + '.html', html.length, 'bytes');
}
fs.rmSync('dist/tank-assets', { recursive: true, force: true }); fs.cpSync('data/tank', 'dist/tank-assets', { recursive: true }); console.log('dist/tank-assets/ copied');
