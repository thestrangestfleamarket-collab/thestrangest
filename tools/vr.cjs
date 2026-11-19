// builds the VR games list: node tools/vr.cjs  ->  dist/vr.html (src/vr/vr.html, a card for each game of src/vr/games.json) and its pictures, data/vr/ -> dist/vr-assets/
const fs = require('fs'), G = JSON.parse(fs.readFileSync('src/vr/games.json', 'utf8')), esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
fs.mkdirSync('dist/vr-assets', { recursive: true });
const cards = G.map((g, i) => { const pic = 'data/vr/' + g.id + '.jpg'; if (!fs.existsSync(pic)) throw new Error('no picture for ' + g.name + ': ' + pic + ' (node tools/vr-shots.cjs data/vr ' + g.id + ')'); fs.copyFileSync(pic, 'dist/vr-assets/' + g.id + '.jpg');
  return '<article><img src="/vr-assets/' + g.id + '.jpg" alt="' + esc(g.name) + ', a picture of the game" width=640 height=360' + (i > 2 ? ' loading=lazy' : '') + '><div class=in><div class=kind>' + esc(g.kind) + '</div><h2>' + esc(g.name) + '</h2><p>' + esc(g.text) + '</p><ul>' + g.tags.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul><div class=go><a href="' + esc(g.url) + '">PLAY</a><span>' + esc(g.url) + '</span></div></div></article>'; }).join('\n');
const html = fs.readFileSync('src/vr/vr.html', 'utf8').replace('__N__', G.length).replace('__GAMES__', () => cards);
fs.writeFileSync('dist/vr.html', html); console.log('dist/vr.html', html.length, 'bytes,', G.length, 'games');
