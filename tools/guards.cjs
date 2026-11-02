// THE GUARDS: removes "does it exist yet?" checks (typeof X!=='undefined', window.X&&) for names an earlier file always made. Run by hand: node tools/guards.cjs [--write].
const fs = require('fs'), path = require('path'), acorn = require('acorn');
const { analyse } = require('./scope.cjs'), { blank } = require('./imports.cjs');
const SRC = path.resolve(__dirname, '../src'), files = fs.readdirSync(SRC).filter(f => /^\d{3}[a-z]*-.+\.(js|html)$/.test(f)).sort();
let page = '', spans = []; for (const f of files) { spans.push([page.length, f]); page += blank(fs.readFileSync(SRC + '/' + f, 'utf8')); }
const A = page.indexOf('<script type="module">') + 22, B = page.lastIndexOf('</script>');
const code = page.slice(A, B).replace(/__(DATA|LAZY|B64)__\("[^"]+"\)/g, m => '0'.padEnd(m.length, ' ')).replace(/__BUILDV__/g, '0'.padEnd(10, ' '));
const at = off => { let r = null, s0 = 0; for (const [s, f] of spans) { if (s <= off + A) { r = f; s0 = s; } else break; } return [r, off + A - s0]; };
const { ast, root, refs } = analyse(code);
const byId = new Map(); for (const r of refs) byId.set(r.id.start, r);
const ord = f => files.indexOf(f);
const top = new Map(); for (const s of ast.body) if (s.type === 'VariableDeclaration' && s.kind === 'const') for (const d of s.declarations) if (d.id.type === 'Identifier' && d.init) top.set(d.id.name, d);
const winAt = new Map(); for (const m of code.matchAll(/window\.([A-Za-z_$][\w$]*)=/g)) { const f = at(m.index)[0]; if (!winAt.has(m[1]) || ord(f) < ord(winAt.get(m[1]))) winAt.set(m[1], f); }
// a name is "always there" where it is used when it is a const with a value, made at the top of a strictly earlier file
const always = (name, useOff) => { const d = top.get(name); if (!d) return false; const r = root.decl.get(name); if (!r) return false; return ord(at(d.start)[0]) < ord(at(useOff)[0]); };
const isGuard = n => {
  if (n.type === 'BinaryExpression' && (n.operator === '!==' || n.operator === '!=') && n.left.type === 'UnaryExpression' && n.left.operator === 'typeof' && n.left.argument.type === 'Identifier' && n.right.type === 'Literal' && n.right.value === 'undefined') { const r = byId.get(n.left.argument.start); return r && r.decl && r.decl.scope === root && always(n.left.argument.name, n.start); }
  if (n.type === 'MemberExpression' && !n.computed && n.object.type === 'Identifier' && n.object.name === 'window' && n.property.type === 'Identifier') { const nm = n.property.name; return winAt.has(nm) && ord(winAt.get(nm)) < ord(at(n.start)[0]) && always(nm, n.start) && root.decl.has(nm) && !byId.has(n.object.start) ? nm : false; }
  return false; };
const edits = []; let n0 = 0;
(function walk(n, parent) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'LogicalExpression' && n.operator === '&&' && isGuard(n.left)) {
    const w = n.left.type === 'MemberExpression' ? n.left.property.name : null;
    if (!w || code.slice(n.right.start, n.right.end).match(new RegExp('\\b' + w + '\\b'))) { edits.push([n.left.start, n.right.start - n.left.start, '']); n0++; walk(n.right, n); return; }
  }
  if (n.type === 'IfStatement' && isGuard(n.test) && n.test.type === 'BinaryExpression' && !n.alternate) { edits.push([n.start, n.consequent.start - n.start, '']); n0++; walk(n.consequent, n); return; }
  for (const k in n) { if (k === 'type' || k === 'start' || k === 'end') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(c => walk(c, n)); else if (v && typeof v.type === 'string') walk(v, n); }
})(ast, null);
let left = 0; (code.match(/typeof [A-Z][A-Z0-9_]*!==?'undefined'/g) || []).forEach(() => left++);
console.log(n0 + ' guards can go; ' + left + ' typeof checks in all before');
if (process.argv.includes('--write')) {
  const per = {}; for (const [o, d, s] of edits) { const [f, fo] = at(o); (per[f] = per[f] || []).push([fo, d, s]); }
  for (const f in per) { let t = fs.readFileSync(SRC + '/' + f, 'utf8'); for (const [o, d, s] of per[f].sort((a, b) => b[0] - a[0])) t = t.slice(0, o) + s + t.slice(o + d); fs.writeFileSync(SRC + '/' + f, t); }
  console.log(Object.keys(per).length + ' files changed');
}
