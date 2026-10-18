const es = require('esbuild'), fs = require('fs');
for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.js')) { const o = es.transformSync(s, { minify: true, format: /\bimport\b|\bawait\b/.test(s) ? 'esm' : undefined, legalComments: 'none', target: 'es2022', charset: 'utf8' }).code; fs.writeFileSync(f, o); console.log(f, s.length, '->', o.length); continue; }
  let o = s.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (all, attr, code) => {
    if (/importmap/.test(attr)) return '<script' + attr + '>' + JSON.stringify(JSON.parse(code)) + '</script>';
    if (!code.trim()) return all;
    return '<script' + attr + '>' + es.transformSync(code, { minify: true, format: /module/.test(attr) ? 'esm' : undefined, legalComments: 'none', target: 'es2022', charset: 'utf8' }).code.trim() + '</script>';
  }).replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (all, attr, css) => '<style' + attr + '>' + es.transformSync(css, { loader: 'css', minify: true }).code.trim() + '</style>');
  o = o.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map((p, i) => i % 2 ? p : p.replace(/>\s+</g, '><').trim()).join('');
  fs.writeFileSync(f, o);
  console.log(f, s.length, '->', o.length);
}
