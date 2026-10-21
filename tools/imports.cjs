// THE IMPORTS: writes each src/ file's import and export lines from what it really uses (node tools/imports.cjs, or --check to only report).
// Every file is an ES module that imports from earlier files only; the build blanks these lines and joins the files as before.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), SRC = ROOT + '/src';
const { analyse } = require('./scope.cjs');
const LOCAL = /^(?:import \{[^}\n]*\} from '\.\/[^'\n]+';|export \{[^}\n]*\};)[ \t]*$/gm;
const blank = t => t.replace(LOCAL, m => ' '.repeat(m.length));
module.exports = { blank, LOCAL };
if (require.main !== module) return;

const check = process.argv.includes('--check');
const files = fs.readdirSync(SRC).filter(f => /^\d{3}[a-z]?-.+\.(js|html)$/.test(f)).sort();
const text = {}, stripped = {};
for (const f of files) { text[f] = fs.readFileSync(SRC + '/' + f, 'utf8'); stripped[f] = text[f].replace(/^(?:import \{[^}\n]*\} from '\.\/[^'\n]+';|export \{[^}\n]*\};)[ \t]*\n/gm, ''); }
let page = '', spans = [];
for (const f of files) { spans.push([page.length, f]); page += stripped[f]; }
const A = page.indexOf('<script type="module">') + 22, B = page.lastIndexOf('</script>');
const code = page.slice(A, B).replace(/__(DATA|LAZY|B64)__\("[^"]+"\)/g, m => '0'.padEnd(m.length, ' ')).replace(/__BUILDV__/g, '0'.padEnd(10, ' '));
const fileAt = off => { let r = null; for (const [s, f] of spans) { if (s <= off + A) r = f; else break; } return r; };
const { root, refs } = analyse(code);
const ord = f => files.indexOf(f), uses = {}, exps = {}, bad = [];
for (const r of refs) {
  const d = r.decl; if (!d || d.scope !== root) continue;
  const df = fileAt(d.node.start), rf = fileAt(r.id.start); if (df === rf) continue;
  if (ord(df) > ord(rf)) bad.push(`${rf} uses ${d.name} from the later ${df}`);
  if (r.write) bad.push(`${rf} assigns ${d.name}, which belongs to ${df}`);
  ((uses[rf] = uses[rf] || {})[df] = uses[rf][df] || new Set()).add(d.name);
  (exps[df] = exps[df] || new Set()).add(d.name);
}
if (bad.length) { console.error([...new Set(bad)].slice(0, 40).join('\n')); console.error(bad.length + ' problems: a file may only read names from files before it, and only change its own.'); process.exit(1); }
const sorted = s => [...s].sort((a, b) => a.localeCompare(b));
let changed = 0;
for (const f of files) {
  if (!f.endsWith('.js') || f === '001-rig.js') continue;
  const imp = Object.keys(uses[f] || {}).sort((a, b) => ord(a) - ord(b)).map(df => `import {${sorted(uses[f][df]).join(', ')}} from './${df}';`);
  const exp = exps[f] ? [`export {${sorted(exps[f]).join(', ')}};`] : [];
  let body = stripped[f], lines = body.split('\n');
  const at = lines[0].startsWith('//') ? 1 : 0;
  let k = at; while (k < lines.length && /^import /.test(lines[k])) k++;
  lines.splice(k, 0, ...imp);
  body = lines.join('\n').replace(/\n*$/, '\n') + (exp.length ? exp.join('\n') + '\n' : '');
  if (body !== text[f]) { changed++; if (!check) fs.writeFileSync(SRC + '/' + f, body); else console.log('out of date: ' + f); }
}
console.log(check ? (changed ? changed + ' files have out-of-date imports: run node tools/imports.cjs' : 'imports up to date') : changed + ' files updated');
if (check && changed) process.exit(1);
