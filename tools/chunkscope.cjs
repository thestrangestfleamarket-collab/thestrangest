const acorn = require('acorn');
const parse = s => acorn.parse(s, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true });
const FN = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
function patNames(p, out = []) {
  if (!p) return out;
  if (p.type === 'Identifier') out.push(p);
  else if (p.type === 'ObjectPattern') for (const q of p.properties) patNames(q.type === 'RestElement' ? q.argument : q.value, out);
  else if (p.type === 'ArrayPattern') for (const q of p.elements) patNames(q, out);
  else if (p.type === 'RestElement') patNames(p.argument, out);
  else if (p.type === 'AssignmentPattern') patNames(p.left, out);
  return out;
}
function analyze(ast) {
  const refs = [], decls = [];
  const mk = (parent, fn, node) => ({ parent, fn, node, names: new Map() });
  const declare = (sc, id, kind, top) => { sc.names.set(id.name, kind); decls.push({ id, kind, scope: sc, top }); };
  const fnScope = sc => { while (!sc.fn) sc = sc.parent; return sc; };
  function hoist(body, sc, top) {
    for (const st of body) {
      if (st.type === 'VariableDeclaration' && st.kind !== 'var') for (const d of st.declarations) for (const id of patNames(d.id)) declare(sc, id, st.kind, top && st);
      if (st.type === 'ClassDeclaration') declare(sc, st.id, 'class', top && st);
      if (st.type === 'FunctionDeclaration') declare(sc, st.id, 'function', top && st);
      if (st.type === 'ImportDeclaration') for (const s of st.specifiers) declare(sc, s.local, 'import', top && st);
      if (st.type === 'ExportNamedDeclaration' && st.declaration) hoist([st.declaration], sc, top);
    }
  }
  function hoistVar(node, sc, top) {
    const f = fnScope(sc);
    (function v(n, isTop) {
      if (!n || typeof n.type !== 'string') return;
      if (FN.has(n.type) || n.type === 'ClassDeclaration' || n.type === 'ClassExpression') return;
      if (n.type === 'VariableDeclaration' && n.kind === 'var') for (const d of n.declarations) for (const id of patNames(d.id)) if (!f.names.has(id.name)) declare(f, id, 'var', isTop && top && n);
      for (const k in n) { if (k === 'type' || k === 'loc') continue; const c = n[k]; if (Array.isArray(c)) c.forEach(x => v(x, isTop && n === node)); else if (c && typeof c.type === 'string') v(c, isTop && n === node); }
    })(node, true);
  }
  function ref(id, sc, write, parent) { refs.push({ id, scope: sc, write, parent }); }
  function pat(p, sc, write) {
    if (!p) return;
    if (p.type === 'Identifier') return ref(p, sc, write);
    if (p.type === 'MemberExpression') return expr(p, sc);
    if (p.type === 'ObjectPattern') return p.properties.forEach(q => { if (q.type === 'RestElement') pat(q.argument, sc, write); else { if (q.computed) expr(q.key, sc); pat(q.value, sc, write); } });
    if (p.type === 'ArrayPattern') return p.elements.forEach(q => pat(q, sc, write));
    if (p.type === 'RestElement') return pat(p.argument, sc, write);
    if (p.type === 'AssignmentPattern') { pat(p.left, sc, write); return expr(p.right, sc); }
  }
  function fn(n, sc) {
    const f = mk(sc, true, n);
    if (n.type === 'FunctionExpression' && n.id) { const s2 = mk(sc, false, n); declare(s2, n.id, 'fname'); f.parent = s2; }
    for (const p of n.params) for (const id of patNames(p)) declare(f, id, 'param');
    if (n.type !== 'ArrowFunctionExpression') f.names.set('arguments', 'arguments');
    for (const p of n.params) pat(p, f, false);
    if (n.body.type === 'BlockStatement') { hoistVar(n.body, f); hoist(n.body.body, f); n.body.body.forEach(s => stmt(s, f)); }
    else expr(n.body, f);
  }
  function cls(n, sc) {
    let s = sc;
    if (n.id && n.type === 'ClassExpression') { s = mk(sc, false); declare(s, n.id, 'cname'); }
    if (n.superClass) expr(n.superClass, s);
    for (const m of n.body.body) {
      if (m.computed) expr(m.key, s);
      if (m.type === 'MethodDefinition') fn(m.value, s);
      else if (m.type === 'PropertyDefinition' && m.value) expr(m.value, mk(s, true));
      else if (m.type === 'StaticBlock') { const b = mk(s, true); hoistVar({ type: 'BlockStatement', body: m.body }, b); hoist(m.body, b); m.body.forEach(x => stmt(x, b)); }
    }
  }
  function block(body, sc) { const b = mk(sc, false); hoist(body, b); body.forEach(s => stmt(s, b)); }
  function stmt(n, sc) {
    if (!n) return;
    switch (n.type) {
      case 'BlockStatement': return block(n.body, sc);
      case 'VariableDeclaration': return n.declarations.forEach(d => { pat(d.id, sc, 'decl'); if (d.init) expr(d.init, sc); });
      case 'FunctionDeclaration': return fn(n, sc);
      case 'ClassDeclaration': return cls(n, sc);
      case 'ForStatement': { const b = mk(sc, false); if (n.init && n.init.type === 'VariableDeclaration') { hoist([n.init], b); stmt(n.init, b); } else if (n.init) expr(n.init, b); if (n.test) expr(n.test, b); if (n.update) expr(n.update, b); return stmt(n.body, b); }
      case 'ForInStatement': case 'ForOfStatement': { const b = mk(sc, false); if (n.left.type === 'VariableDeclaration') { hoist([n.left], b); n.left.declarations.forEach(d => pat(d.id, b, 'decl')); } else pat(n.left, b, true); expr(n.right, b); return stmt(n.body, b); }
      case 'SwitchStatement': { expr(n.discriminant, sc); const b = mk(sc, false); const all = n.cases.flatMap(c => c.consequent); hoist(all, b); return n.cases.forEach(c => { if (c.test) expr(c.test, b); c.consequent.forEach(s => stmt(s, b)); }); }
      case 'TryStatement': stmt(n.block, sc); if (n.handler) { const b = mk(sc, false); if (n.handler.param) { for (const id of patNames(n.handler.param)) declare(b, id, 'catch'); pat(n.handler.param, b, false); } block(n.handler.body.body, b); } return stmt(n.finalizer, sc);
      case 'LabeledStatement': return stmt(n.body, sc);
      case 'BreakStatement': case 'ContinueStatement': case 'EmptyStatement': case 'DebuggerStatement': return;
      case 'ImportDeclaration': return;
      case 'ExportNamedDeclaration': if (n.declaration) return stmt(n.declaration, sc); return;
      case 'ExportDefaultDeclaration': return n.declaration.type.endsWith('Declaration') ? stmt(n.declaration, sc) : expr(n.declaration, sc);
      case 'IfStatement': expr(n.test, sc); stmt(n.consequent, sc); return stmt(n.alternate, sc);
      case 'WhileStatement': case 'DoWhileStatement': expr(n.test, sc); return stmt(n.body, sc);
      case 'ExpressionStatement': return expr(n.expression, sc);
      case 'ReturnStatement': case 'ThrowStatement': return expr(n.argument, sc);
      default: throw new Error('stmt ' + n.type);
    }
  }
  function expr(n, sc) {
    if (!n) return;
    switch (n.type) {
      case 'Identifier': return ref(n, sc, false);
      case 'Literal': case 'ThisExpression': case 'Super': case 'MetaProperty': return;
      case 'FunctionExpression': case 'ArrowFunctionExpression': return fn(n, sc);
      case 'ClassExpression': return cls(n, sc);
      case 'MemberExpression': expr(n.object, sc); if (n.computed) expr(n.property, sc); return;
      case 'AssignmentExpression': if (n.left.type === 'Identifier') ref(n.left, sc, true); else pat(n.left, sc, true); return expr(n.right, sc);
      case 'UpdateExpression': if (n.argument.type === 'Identifier') return ref(n.argument, sc, true); return expr(n.argument, sc);
      case 'ObjectExpression': return n.properties.forEach(p => { if (p.type === 'SpreadElement') return expr(p.argument, sc); if (p.computed) expr(p.key, sc); if (p.shorthand) return ref(p.value, sc, false, p); expr(p.value, sc); });
      case 'Property': return expr(n.value, sc);
      case 'TemplateLiteral': return n.expressions.forEach(e => expr(e, sc));
      case 'TaggedTemplateExpression': expr(n.tag, sc); return expr(n.quasi, sc);
      case 'ChainExpression': return expr(n.expression, sc);
      case 'ImportExpression': return expr(n.source, sc);
      default:
        for (const k of ['argument', 'left', 'right', 'test', 'consequent', 'alternate', 'callee', 'object', 'expression']) if (n[k]) expr(n[k], sc);
        for (const k of ['arguments', 'elements', 'expressions']) if (n[k]) n[k].forEach(e => e && expr(e, sc));
    }
  }
  const top = mk(null, true);
  hoistVar(ast, top, true); hoist(ast.body, top, true);
  ast.body.forEach(s => stmt(s, top));
  for (const r of refs) { let s = r.scope; while (s && !s.names.has(r.id.name)) s = s.parent; r.to = s; }
  return { top, refs, decls };
}
module.exports = { parse, analyze, patNames };
