// BREATHS WHILE LOADING, on the parser: the page's module builds the whole world in one go; this puts a check after each statement of
// the plain blocks the start runs straight through (the module's top level, a place's builder `grab(name, async()=>{...})`, and the
// braced bodies of if / for / while / try inside them; never inside any other function, object or class), which gives the browser
// a moment back once 40 ms have gone by. node tools/yields.cjs in.js out.js; prints how many it put in.
const fs=require('fs'), acorn=require('acorn');
const [,, IN, OUT]=process.argv, src=fs.readFileSync(IN,'utf8');
const HEAD="let __YT=performance.now(); const __Y=()=>new Promise(r=>{ const c=new MessageChannel(); c.port1.onmessage=()=>{ __YT=performance.now(); r(); }; c.port2.postMessage(0); });\n";
const CHECK="if(performance.now()-__YT>40)await __Y();";
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module',allowAwaitOutsideFunction:true});
const at=[], STOP=new Set(['ReturnStatement','BreakStatement','ContinueStatement','ThrowStatement']);
const isGrab=n=>n.type==='CallExpression'&&n.callee.type==='Identifier'&&n.callee.name==='grab'&&n.arguments[1]&&/Function/.test(n.arguments[1].type)&&n.arguments[1].async&&n.arguments[1].body.type==='BlockStatement';
const list=body=>{ for(const s of body){ if(!STOP.has(s.type)&&s.type!=='FunctionDeclaration'&&s.type!=='ClassDeclaration')at.push(s.end); stmt(s); } };
const block=b=>{ if(b&&b.type==='BlockStatement')list(b.body); else if(b)stmt(b); };
function stmt(s){ if(!s)return;
  switch(s.type){
    case 'BlockStatement': list(s.body); return;
    case 'IfStatement': block(s.consequent); block(s.alternate); find(s.test); return;
    case 'ForStatement': case 'ForInStatement': case 'ForOfStatement': case 'WhileStatement': case 'DoWhileStatement': block(s.body); return;
    case 'TryStatement': block(s.block); if(s.handler)block(s.handler.body); block(s.finalizer); return;
    case 'LabeledStatement': stmt(s.body); return;
    default: find(s); } }
function find(n){ if(!n||typeof n!=='object')return; if(Array.isArray(n)){ for(const x of n)find(x); return; }
  if(isGrab(n)){ list(n.arguments[1].body.body); return; }
  if(/Function|Class/.test(n.type))return;
  for(const k in n)if(k!=='loc'&&n[k]&&typeof n[k]==='object')find(n[k]); }
list(ast.body);
const pts=[...new Set(at)].sort((a,b)=>a-b); let out='', last=0;
for(const p of pts){ out+=src.slice(last,p)+(src[p-1]===";"?"":";")+CHECK; last=p; } out+=src.slice(last);
fs.writeFileSync(OUT,HEAD+out); console.log(pts.length);
