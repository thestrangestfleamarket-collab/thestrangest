// which top-level lets of the joined page are written from a file other than the one that declares them
const fs=require('fs'), acorn=require('acorn'), walk=require('acorn-walk'), path=require('path');
const SRC=process.argv[2]||'src';
const files=fs.readdirSync(SRC).filter(f=>/\.(js|html)$/.test(f)).sort();
let page=''; const at=[]; for(const f of files){ at.push([page.length,f]); page+=fs.readFileSync(path.join(SRC,f),'utf8'); }
const i=page.indexOf('<script type="module">')+'<script type="module">'.length, j=page.lastIndexOf('</script>'), js=page.slice(i,j).replace(/__DATA__\(("[^"]*")\)/g,(m)=>'0'+' '.repeat(m.length-1));
const fileOf=p=>{ const q=p+i; let r=at[0][1]; for(const [s,f] of at)if(s<=q)r=f; return r; };
const ast=acorn.parse(js,{ecmaVersion:'latest',sourceType:'module',allowAwaitOutsideFunction:true});
const top=new Map(); for(const s of ast.body){ if(s.type==='VariableDeclaration'&&s.kind==='let')for(const d of s.declarations)if(d.id.type==='Identifier')top.set(d.id.name,fileOf(s.start)); }
// scope-aware: walk with a stack of declared names
const writes={};
const declIn=(node,set)=>{ walk.simple(node,{VariableDeclarator(){} }); };
function names(p,out){ if(!p)return; if(p.type==='Identifier')out.add(p.name); else if(p.type==='ObjectPattern')for(const q of p.properties)names(q.value||q.argument,out); else if(p.type==='ArrayPattern')for(const q of p.elements)names(q,out); else if(p.type==='AssignmentPattern')names(p.left,out); else if(p.type==='RestElement')names(p.argument,out); }
function scan(node,stack){ if(!node||typeof node.type!=='string')return;
  const t=node.type;
  if(/Function/.test(t)){ const s=new Set(); for(const p of node.params)names(p,s); if(node.id&&t==='FunctionExpression')s.add(node.id.name); hoist(node.body,s); const st=[...stack,s]; for(const p of node.params)scan(p,st); scan(node.body,st); return; }
  if(t==='BlockStatement'||t==='Program'||t==='StaticBlock'){ const s=new Set(); for(const q of node.body){ if(q.type==='VariableDeclaration'&&q.kind!=='var')for(const d of q.declarations)names(d.id,s); if(q.type==='FunctionDeclaration'||q.type==='ClassDeclaration')s.add(q.id.name); } const st=t==='Program'?[new Set()]:[...stack,s]; for(const q of node.body)scan(q,st); return; }
  if(t==='ForStatement'||t==='ForInStatement'||t==='ForOfStatement'){ const s=new Set(); const init=node.init||node.left; if(init&&init.type==='VariableDeclaration')for(const d of init.declarations)names(d.id,s); const st=[...stack,s]; for(const k of ['init','left','test','update','right','body'])scan(node[k],st); return; }
  if(t==='CatchClause'){ const s=new Set(); names(node.param,s); const st=[...stack,s]; scan(node.body,st); return; }
  if(t==='AssignmentExpression'||t==='UpdateExpression'){ const tg=t==='AssignmentExpression'?node.left:node.argument; const ns=new Set(); if(tg.type==='Identifier')ns.add(tg.name); else if(/Pattern/.test(tg.type))names(tg,ns);
    for(const n of ns){ if(top.has(n)&&!stack.some(s=>s.has(n))){ const f=fileOf(node.start); if(f!==top.get(n))(writes[n]=writes[n]||new Set()).add(f); } } }
  for(const k in node){ if(k==='type'||k==='start'||k==='end')continue; const v=node[k]; if(Array.isArray(v))for(const x of v)scan(x,stack); else if(v&&typeof v.type==='string')scan(v,stack); } }
function hoist(body,s){ walk.simple(body,{VariableDeclaration(d){ if(d.kind==='var')for(const x of d.declarations)names(x.id,s); }}); }
scan(ast,[]);
const out=Object.entries(writes).map(([n,fs])=>[n,top.get(n),[...fs].length]).sort((a,b)=>b[2]-a[2]);
console.log(JSON.stringify(out));
