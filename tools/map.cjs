// THE MAP OF THE SOURCE (20 Oct 2026, the move to modules): node tools/map.cjs [> docs/MAP.md]
// Joins src/ as build.py does, parses the module script, and writes a table of every file: its size, the function it sits inside
// (the page's top level, or one of the places' builders, `await grab(name, async()=>{...})`, which can span many files), the names it
// defines that other files use (what it gives), and the names it uses from other files (what it needs), with where each comes from.
// A chat reads this instead of the neighbours. build.py refreshes docs/MAP.md when it can. Not shipped, not kept in git (4 Nov 2026).
const fs=require('fs'), path=require('path'), {analyse}=require('./scope.cjs');
const ROOT=path.resolve(__dirname,'..');
const files=fs.readdirSync(ROOT+'/src').filter(f=>/^\d{3}[a-z]*-.+\.(js|html)$/.test(f)).sort();
let page='', spans=[]; for(const f of files){ const t=require('./imports.cjs').blank(fs.readFileSync(ROOT+'/src/'+f,'utf8')); spans.push({f,a:page.length,b:page.length+t.length}); page+=t; }
const open='<script type="module">', i0=page.indexOf(open)+open.length, j0=page.lastIndexOf('</script>'), code=page.slice(i0,j0);
const fileSpans=spans.map(s=>({f:s.f,a:Math.max(0,s.a-i0),b:Math.min(code.length,s.b-i0)})).filter(s=>s.b>s.a);
const fileAt=p=>{ for(const s of fileSpans)if(p>=s.a&&p<s.b)return s; return null; };
const {ast,refs}=analyse(code);
const grabs=[]; for(const n of ast.body){ const e=n.type==='ExpressionStatement'?n.expression:null, c=e&&e.type==='AwaitExpression'?e.argument:e;
  if(c&&c.type==='CallExpression'&&c.callee.type==='Identifier'&&c.callee.name==='grab'&&c.arguments[0]&&c.arguments[0].type==='Literal')grabs.push({name:c.arguments[0].value,a:n.start,b:n.end}); }
const inside=s=>{ const g=grabs.find(g=>s.a>=g.a&&s.b<=g.b); if(g)return 'grab('+g.name+')'; const h=grabs.find(g=>s.a<g.b&&s.b>g.a); return h?'top level, '+(s.a<h.a?'opens':'closes')+' grab('+h.name+')':'top level'; };
const rows=[]; for(const s of fileSpans){ const inR=p=>p>=s.a&&p<s.b, needs=new Map(), gives=new Map();
  for(const r of refs){ const d=r.decl, p=r.id.start; if(!d)continue;
    if(inR(p)&&!inR(d.node.start)){ const f=(fileAt(d.node.start)||{}).f||'?'; const k=f.slice(0,f.indexOf('-')); needs.set(d.name,k); }
    if(!inR(p)&&inR(d.node.start)&&d.node!==r.id){ const f=(fileAt(p)||{}).f||'?'; (gives.get(d.name)||gives.set(d.name,new Set()).get(d.name)).add(f.slice(0,f.indexOf('-'))); } }
  rows.push({f:s.f,kb:((s.b-s.a)/1024).toFixed(1),where:inside(s),gives,needs}); }
const byFrom=m=>{ const g=new Map(); for(const [n,k] of m)(g.get(k)||g.set(k,[]).get(k)).push(n); return [...g].sort().map(([k,v])=>k+': '+v.sort().join(' ')).join('; '); };
const out=['# The map of the source','','Made by `node tools/map.cjs` (build.py runs it); do not edit. One row per file in `src/`, in page order: size, the function it sits inside,',
  'what it defines that other files use (with the files that use it), and what it uses from other files (grouped by the file that defines it).',
  'Places built with `await grab(name, async()=>{...})` are one function each, often across many files: a name defined inside one is a local of that function.','',
  '## The builders','', ...grabs.map(g=>'- `grab('+g.name+')`: '+(fileAt(g.a)||{}).f+' to '+(fileAt(g.b-1)||{}).f+' ('+((g.b-g.a)/1024).toFixed(0)+' KB)'),'',
  '## The files','','| file | KB | inside | gives | needs |','|---|---|---|---|---|',
  ...rows.map(r=>'| `'+r.f+'` | '+r.kb+' | '+r.where+' | '+[...r.gives].sort().map(([n,v])=>n+' ('+[...v].sort().join(' ')+')').join(', ')+' | '+byFrom(r.needs)+' |')];
const md=out.join('\n')+'\n';
if(process.argv[2]){ fs.writeFileSync(process.argv[2],md); console.log('wrote '+process.argv[2]+': '+rows.length+' files, '+grabs.length+' builders'); } else process.stdout.write(md);
