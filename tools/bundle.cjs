const es = require('esbuild'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const [entry, out, ...xs] = process.argv.slice(2), sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const opt = { bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'eof', write: false, logLevel: 'error' };
(async () => {
  const nav = (await es.build({ ...opt, stdin: { contents: "export * from '@recast-navigation/core';export * from '@recast-navigation/generators';", resolveDir: process.cwd() } })).outputFiles[0].text;
  const navName = 'nav.' + sha(nav) + '.js';
  fs.writeFileSync(path.join(out, navName), nav);
  const cu = {};
  for (const x of xs) {
    const c = (await es.transform(fs.readFileSync(x, 'utf8'), { format: 'esm', target: 'es2022', charset: 'utf8', minify: opt.minify, legalComments: 'none' })).code, n = path.basename(x, '.js');
    cu[n.slice(2)] = n + '.' + sha(c) + '.js'; fs.writeFileSync(path.join(out, cu[n.slice(2)]), c); fs.unlinkSync(x);
  }
  fs.writeFileSync(entry, fs.readFileSync(entry, 'utf8').replaceAll('__NAV__', navName).replaceAll('__CHUNKURLS__', JSON.stringify(cu)));
  const r = await es.build({ ...opt, entryPoints: { m: entry }, splitting: true, outdir: out, chunkNames: 'c-[hash]', metafile: true });
  const text = {}, deps = {}, name = {};
  for (const f of r.outputFiles) text[path.basename(f.path)] = f.text;
  for (const [p, o] of Object.entries(r.metafile.outputs)) deps[path.basename(p)] = o.imports.filter(i => !i.external).map(i => path.basename(i.path));
  for (let left = Object.keys(text); left.length;) {
    const ready = left.filter(f => deps[f].every(d => name[d]));
    if (!ready.length) throw new Error('chunks import each other: ' + left);
    for (const f of ready) {
      let t = text[f];
      for (const d of deps[f]) t = t.replaceAll('./' + d, './' + name[d]);
      name[f] = f.split(/[-.]/)[0] + '.' + sha(t) + '.js';
      fs.writeFileSync(path.join(out, name[f]), t);
    }
    left = left.filter(f => !name[f]);
  }
  fs.unlinkSync(entry);
  console.log(name['m.js']);
})().catch(e => { console.error(e); process.exit(1); });
