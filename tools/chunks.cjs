const fs = require('fs');
const { parse, analyze } = require('./scope.cjs');
const RT = 'const __CM={}, __CP={};\n'
  + 'const LOAD=(...ns)=>Promise.all(ns.map(n=>!n||__CM[n]?0:__CP[n]||(__CP[n]=__CLOAD(n).then(m=>{ __CM[n]=__CM[n]||m; },e=>{ delete __CP[n]; throw e; }))));\n'
  + 'const LOADED=n=>!n||!!__CM[n];\n'
  + 'const __CF=(n,i,t,s)=>{ let f=null; const w=function(){ if(!f){ if(!__CM[n]){ console.warn("chunk "+n+" was not loaded before use"); __CM[n]=__CSYNC(n); } f=__CM[n][i](...t(),s); } return f.apply(this,arguments); }; w.chunk=n; return w; };\n'
  + 'window.LOAD=LOAD; window.LOADED=LOADED;\n';
function chunks(body) {
  const ast = parse(body), A = analyze(ast), marks = [];
  (function w(n) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === '__CHUNK__') {
      const [a, f] = n.arguments;
      if (n.arguments.length !== 2 || a.type !== 'Literal' || typeof a.value !== 'string' || !/^[a-z][a-z0-9]*$/.test(a.value) || !/^(Arrow)?FunctionExpression$/.test(f.type))
        throw new Error('__CHUNK__("name", function) expected at ' + n.start + ': ' + body.slice(n.start, n.start + 80));
      marks.push({ call: n, name: a.value, fn: f });
      for (const k in f) { const c = f[k]; if (Array.isArray(c)) c.forEach(w); else if (c && typeof c.type === 'string') w(c); }
      return;
    }
    for (const k in n) { if (k === 'type') continue; const c = n[k]; if (Array.isArray(c)) c.forEach(w); else if (c && typeof c.type === 'string') w(c); }
  })(ast);
  for (const m of marks) for (const o of marks) if (o !== m && o.call.start > m.fn.start && o.call.end < m.fn.end) throw new Error('__CHUNK__ inside __CHUNK__ at ' + o.call.start);
  const inside = (p, m) => p >= m.fn.start && p < m.fn.end;
  const binding = new Map();
  const key = r => r.to;
  const written = new Map();
  for (const r of A.refs) if (r.to && r.write === true) { if (!written.has(r.to)) written.set(r.to, new Set()); written.get(r.to).add(r.id.name); }
  const declAt = new Map();
  for (const d of A.decls) { if (!declAt.has(d.scope)) declAt.set(d.scope, new Map()); declAt.get(d.scope).set(d.id.name, d); }
  const out = {}, edits = [];
  for (const [ix, m] of marks.entries()) {
    const f = m.fn, cap = new Map(), rew = [];
    let inner = new Set();
    (function sc(n, fnDepth) {
      if (!n || typeof n.type !== 'string') return;
      if (n.type === 'ThisExpression' || n.type === 'Super' || (n.type === 'MetaProperty' && n.meta.name === 'new'))
        if (!fnDepth && f.type === 'ArrowFunctionExpression') throw new Error('__CHUNK__("' + m.name + '"): an arrow that uses this/super/new.target at ' + n.start);
      const d = n !== f && (n.type === 'FunctionExpression' || n.type === 'FunctionDeclaration') ? 1 : 0;
      for (const k in n) { if (k === 'type') continue; const c = n[k]; if (Array.isArray(c)) c.forEach(x => sc(x, fnDepth + d)); else if (c && typeof c.type === 'string') sc(c, fnDepth + d); }
    })(f.body, f.type === 'ArrowFunctionExpression' ? 0 : 1);
    for (const r of A.refs) {
      if (!inside(r.id.start, m) || r.write === 'decl') continue;
      if (r.id.name === 'arguments' && (!r.to || !insideScope(r.to, f))) { if (f.type === 'ArrowFunctionExpression') throw new Error('__CHUNK__("' + m.name + '"): arguments of an outer function'); continue; }
      if (!r.to || scopeInside(r.to, m)) continue;
      const nm = r.id.name;
      if (/^__(DATA|LAZY|B64)__$/.test(nm)) throw new Error('__CHUNK__("' + m.name + '"): ' + nm + ' inside a chunk');
      if (nm === '__s') throw new Error('__s is reserved');
      const d = declAt.get(r.to) && declAt.get(r.to).get(nm);
      const w = written.get(r.to) && written.get(r.to).has(nm);
      const early = !d || d.kind === 'function' || d.kind === 'import' || d.kind === 'param' || d.id.start < m.call.start;
      const live = w || !early;
      if (!cap.has(nm)) cap.set(nm, { live, set: false });
      const c = cap.get(nm);
      if (r.write === true) c.set = true;
      if (live) rew.push(r);
    }
    m.cap = cap; m.rew = rew; m.ix = ix;
  }
  function scopeInside(s, m) { while (s) { if (s.node && s.node === m.fn) return true; s = s.parent; } return false; }
  function insideScope(s, f) { while (s) { if (s.node === f) return true; s = s.parent; } return false; }
  const sh = new Set();
  (function w(n) { if (!n || typeof n.type !== 'string') return; if ((n.type === 'Property') && n.shorthand) sh.add(n.key.start);
    for (const k in n) { if (k === 'type') continue; const c = n[k]; if (Array.isArray(c)) c.forEach(w); else if (c && typeof c.type === 'string') w(c); } })(ast);
  for (const m of marks) {
    const f = m.fn, ed = m.rew.map(r => ({ s: r.id.start, e: r.id.end, t: (sh.has(r.id.start) ? r.id.name + ':' : '') + '__s.' + r.id.name })).sort((a, b) => b.s - a.s);
    let t = body.slice(f.start, f.end);
    for (const e of ed) t = t.slice(0, e.s - f.start) + e.t + t.slice(e.e - f.start);
    const imm = [...m.cap].filter(([, c]) => !c.live).map(([n]) => n), live = [...m.cap].filter(([, c]) => c.live);
    (out[m.name] = out[m.name] || []).push(m.ix + ':(' + imm.concat('__s').join(',') + ')=>(' + t + ')');
    const acc = live.length ? '{' + live.map(([n, c]) => 'get ' + n + '(){ return ' + n + '; }' + (c.set ? ',set ' + n + '(v){ ' + n + '=v; }' : '')).join(',') + '}' : '0';
    edits.push({ s: m.call.start, e: m.call.end, t: '__CF(' + JSON.stringify(m.name) + ',' + m.ix + ',()=>[' + imm.join(',') + '],' + acc + ')' });
  }
  edits.sort((a, b) => b.s - a.s);
  let main = body;
  for (const e of edits) main = main.slice(0, e.s) + e.t + main.slice(e.e);
  const code = {};
  for (const n in out) code[n] = '{\n' + out[n].join(',\n') + '\n}';
  return { main, code, report: marks.map(m => ({ name: m.name, at: m.call.start, bytes: m.fn.end - m.fn.start, imm: [...m.cap].filter(([, c]) => !c.live).length, live: [...m.cap].filter(([, c]) => c.live).map(([n]) => n) })) };
}
module.exports = { chunks, RT };
if (require.main === module) {
  const [inp, outMain, outJson] = process.argv.slice(2);
  const r = chunks(fs.readFileSync(inp, 'utf8'));
  fs.writeFileSync(outMain, r.main);
  fs.writeFileSync(outJson, JSON.stringify({ code: r.code, report: r.report, rt: RT }));
}
