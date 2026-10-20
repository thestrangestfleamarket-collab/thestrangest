// SCOPES OF THE PAGE (19-20 Oct 2026): analyse(code) parses the joined module script and returns every scope, declaration and reference, so
// tools can prove a refactor changes no name resolution. Used by tools/map.cjs. Not shipped.
const acorn = require('acorn');

class Scope {
  constructor(parent, node, fn) { this.parent = parent; this.node = node; this.fn = fn; this.decl = new Map(); this.kids = []; if (parent) parent.kids.push(this); }
  add(name, node, kind) { if (!this.decl.has(name)) this.decl.set(name, { name, node, kind, scope: this, refs: [] }); }
  fnScope() { let s = this; while (!s.fn) s = s.parent; return s; }
  find(name) { for (let s = this; s; s = s.parent) if (s.decl.has(name)) return s.decl.get(name); return null; }
}

function patternNames(p, out = []) {
  if (!p) return out;
  switch (p.type) {
    case 'Identifier': out.push(p); break;
    case 'ObjectPattern': for (const q of p.properties) patternNames(q.type === 'RestElement' ? q.argument : q.value, out); break;
    case 'ArrayPattern': for (const q of p.elements) patternNames(q, out); break;
    case 'RestElement': patternNames(p.argument, out); break;
    case 'AssignmentPattern': patternNames(p.left, out); break;
  }
  return out;
}

const SKIP = new Set(['type', 'start', 'end', 'loc', 'range', 'raw', 'value', 'regex', 'bigint', 'sourceType', 'computed', 'shorthand', 'kind', 'method', 'static', 'async', 'generator', 'prefix', 'operator', 'optional', 'delegate', 'tail', 'directive']);

function analyse(code) {
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true });
  const root = new Scope(null, ast, true);
  const scopeOf = new Map();
  const hoistVar = (s, node) => { const f = s.fnScope(); for (const id of patternNames(node)) f.add(id.name, id, 'var'); };
  const declareBlock = (s, body) => {
    for (const st of body) {
      if (st.type === 'VariableDeclaration' && st.kind !== 'var') for (const d of st.declarations) for (const id of patternNames(d.id)) s.add(id.name, id, st.kind);
      else if (st.type === 'FunctionDeclaration' && st.id) s.add(st.id.name, st.id, 'function');
      else if (st.type === 'ClassDeclaration' && st.id) s.add(st.id.name, st.id, 'class');
      else if (st.type === 'ImportDeclaration') for (const sp of st.specifiers) s.add(sp.local.name, sp.local, 'import');
      else if ((st.type === 'ExportNamedDeclaration' || st.type === 'ExportDefaultDeclaration') && st.declaration) declareBlock(s, [st.declaration]);
    }
  };
  const refs = [];
  function walk(n, s, ctx) {
    if (!n || typeof n.type !== 'string') return;
    switch (n.type) {
      case 'Program': declareBlock(s, n.body); scopeOf.set(n, s); for (const c of n.body) walk(c, s); return;
      case 'BlockStatement': case 'StaticBlock': { const b = ctx === 'fnbody' ? s : new Scope(s, n, false); declareBlock(b, n.body); scopeOf.set(n, b); for (const c of n.body) walk(c, b); return; }
      case 'SwitchStatement': { walk(n.discriminant, s); const b = new Scope(s, n, false); for (const c of n.cases) declareBlock(b, c.consequent); for (const c of n.cases) { walk(c.test, b); for (const q of c.consequent) walk(q, b); } return; }
      case 'ForStatement': case 'ForInStatement': case 'ForOfStatement': {
        const b = new Scope(s, n, false); const init = n.init || n.left;
        if (init && init.type === 'VariableDeclaration') { if (init.kind === 'var') hoistVar(s, init.declarations[0].id) || init.declarations.forEach(d => hoistVar(s, d.id)); else for (const d of init.declarations) for (const id of patternNames(d.id)) b.add(id.name, id, init.kind); }
        for (const k of ['init', 'left', 'test', 'update', 'right', 'body']) walk(n[k], b, k === 'left' ? 'forleft' : null); return; }
      case 'VariableDeclaration': { if (n.kind === 'var') n.declarations.forEach(d => hoistVar(s, d.id)); for (const d of n.declarations) { walkPattern(d.id, s); walk(d.init, s); } return; }
      case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression': {
        const f = new Scope(s, n, true);
        if (n.type === 'FunctionExpression' && n.id) f.add(n.id.name, n.id, 'fname');
        for (const p of n.params) for (const id of patternNames(p)) f.add(id.name, id, 'param');
        if (n.body.type !== 'BlockStatement') { for (const p of n.params) walkPattern(p, f); walk(n.body, f); return; }
        declareBlock(f, n.body.body); scopeOf.set(n.body, f);
        for (const p of n.params) walkPattern(p, f);
        for (const c of n.body.body) walk(c, f); return; }
      case 'ClassDeclaration': case 'ClassExpression': { const c = new Scope(s, n, false); if (n.type === 'ClassExpression' && n.id) c.add(n.id.name, n.id, 'class'); walk(n.superClass, s); walk(n.body, c); return; }
      case 'CatchClause': { const c = new Scope(s, n, false); for (const id of patternNames(n.param)) c.add(id.name, id, 'catch'); walkPattern(n.param, c); walk(n.body, c); return; }
      case 'Identifier': refs.push({ id: n, scope: s }); return;
      case 'MemberExpression': walk(n.object, s); if (n.computed) walk(n.property, s); return;
      case 'Property': if (n.computed) walk(n.key, s); if (n.shorthand) { refs.push({ id: n.value.type === 'Identifier' ? n.value : n.key, scope: s }); if (n.value.type !== 'Identifier') walk(n.value, s); } else walk(n.value, s); return;
      case 'MethodDefinition': case 'PropertyDefinition': if (n.computed) walk(n.key, s); walk(n.value, s); return;
      case 'LabeledStatement': walk(n.body, s); return;
      case 'BreakStatement': case 'ContinueStatement': return;
      case 'MetaProperty': return;
      case 'ImportDeclaration': return;
      case 'ExportNamedDeclaration': if (n.declaration) walk(n.declaration, s); else if (!n.source) for (const sp of n.specifiers) refs.push({ id: sp.local, scope: s }); return;
      case 'ExportDefaultDeclaration': walk(n.declaration, s); return;
      case 'AssignmentExpression': walkPattern(n.left, s); walk(n.right, s); return;
    }
    for (const k in n) { if (SKIP.has(k)) continue; const v = n[k]; if (Array.isArray(v)) for (const c of v) walk(c, s); else if (v && typeof v.type === 'string') walk(v, s); }
  }
  function walkPattern(p, s) {
    if (!p) return;
    switch (p.type) {
      case 'Identifier': refs.push({ id: p, scope: s, write: true }); return;
      case 'ObjectPattern': for (const q of p.properties) { if (q.type === 'RestElement') walkPattern(q.argument, s); else { if (q.computed) walk(q.key, s); walkPattern(q.value, s); } } return;
      case 'ArrayPattern': for (const q of p.elements) walkPattern(q, s); return;
      case 'RestElement': walkPattern(p.argument, s); return;
      case 'AssignmentPattern': walkPattern(p.left, s); walk(p.right, s); return;
      default: walk(p, s);
    }
  }
  walk(ast, root);
  for (const r of refs) { const d = r.scope.find(r.id.name); r.decl = d; if (d) d.refs.push(r); }
  return { ast, root, refs };
}
module.exports = { analyse, patternNames };
