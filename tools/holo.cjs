// builds the holodeck's pages: node tools/holo.cjs  ->  dist/holo.html (the shell for /vr, /wave, /golf), dist/roam.html, dist/boarded.html (src/holo/, three bundled in, one file each)
const fs = require('fs'), path = require('path'), es = require('esbuild');
// the market's own files that a page reuses (091-sfx, 003d-say) take the market's names from the host, and carry no baked data
const host = { name: 'host', setup(b) {
  b.onResolve({ filter: /\/(003-shx|003b-systems|004-main|006-map-pre|075-main-13)\.js$/ }, () => ({ path: path.resolve('src/holo/host.js') }));
  b.onLoad({ filter: /src[\\/]\d[^\\/]*\.js$/ }, a => ({ contents: fs.readFileSync(a.path, 'utf8').replace(/__DATA__\("[^"]+"\)/g, '{}').replace(/__FILE__\("[^"]+"\)/g, '""'), loader: 'js' })); } };
const page = async (entry, tpl, out, title) => {
  const js = (await es.build({ entryPoints: [entry], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', plugins: [host], external: ['https://*'] })).outputFiles[0].text;
  const html = fs.readFileSync(tpl, 'utf8').replace('__TITLE__', title).replace('__GAME__', () => js.replace(/<\/script/gi, '<\\/script'));
  fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync(out, html); console.log(out, html.length, 'bytes'); };
(async () => {
  await page('src/holo/shell.js', 'src/holo/holo.html', 'dist/holo.html', '');
  await page('src/holo/roam-main.js', 'src/holo/game.html', 'dist/roam.html', 'ROAM');
  await page('src/holo/boarded-main.js', 'src/holo/game.html', 'dist/boarded.html', 'BOARDED UP');
})().catch(e => { console.error(e.message || e); process.exit(1); });
