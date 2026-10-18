// THE PAGE AS SHIPPED, ONLY WHAT RUNS (owner, 18 Oct 2026: "the whole site does this, has every comment etc. i only want the minimal code that runs
// the game here, absolutely minimal"): every script and style in a built page minified by esbuild (comments, spaces, long names gone; the classic
// scripts' top-level names kept, the module's its own), the HTML's comments and the blank space between tags dropped. node tools/minify.cjs <page>...
const es=require('esbuild'),fs=require('fs'),acorn=require('acorn');
// the shaders are text in the code, so esbuild keeps their notes: each string or template that is GLSL loses its // and /* */ comments, its
// blank lines and its lines' leading space; a comment that would run past its piece of text (into a ${} or the next string) is left as it is
const GLSL=/\bgl_\w|#include <|\b(uniform|varying|attribute|precision|void|float|int|vec[234]|mat[234]|sampler2D) [\w(]|\bvec[234]\(/;
function glslStrip(src,esm){
  const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:esm?'module':'script',allowAwaitOutsideFunction:true});
  const ed=[]; let left=0;
  const one=(raw,nl)=>{ // raw: the text as written; nl: how a new line is written in it
    let out='',i=0;
    while(i<raw.length){
      if(raw.startsWith('/*',i)){ const j=raw.indexOf('*/',i+2); if(j<0){left++; return null;} i=j+2; continue; }
      if(raw.startsWith('//',i)){ const j=raw.indexOf(nl,i); if(j<0){left++; return null;} i=j; continue; }
      out+=raw[i++];
    }
    // spaces trimmed only beside a line break (a piece's own ends keep theirs: "vec3 "+name), blank lines between dropped
    const L=out.split(nl),z=L.length-1;
    return L.map((l,k)=>(k>0?l.replace(/^\s+/,''):l)).map((l,k)=>(k<z?l.replace(/\s+$/,''):l)).filter((l,k)=>l||k===0||k===z).join(nl);
  };
  // a string joined with + counts as shader text when any of its pieces does
  const glsl=new Set(), lit=n=>n.type==='Literal'&&typeof n.value==='string'?n.value:n.type==='TemplateLiteral'?n.quasis.map(x=>x.value.raw).join(''):null;
  const leaves=(n,o)=>{ if(n.type==='BinaryExpression'&&n.operator==='+'){ leaves(n.left,o); leaves(n.right,o); } else o.push(n); return o; };
  (function mark(n,inCat){
    if(!n||typeof n.type!=='string')return;
    if(n.type==='BinaryExpression'&&n.operator==='+'&&!inCat){ const L=leaves(n,[]); if(L.some(x=>{const t=lit(x); return t!==null&&GLSL.test(t);}))L.forEach(x=>{ if(lit(x)!==null)glsl.add(x); }); }
    else{ const t=lit(n); if(t!==null&&GLSL.test(t))glsl.add(n); }
    const cat=n.type==='BinaryExpression'&&n.operator==='+';
    for(const k in n){ const v=n[k]; if(Array.isArray(v))v.forEach(x=>mark(x,cat)); else if(v&&typeof v.type==='string')mark(v,cat); }
  })(ast,false);
  (function walk(n){
    if(!n||typeof n.type!=='string')return;
    // code in a string (an audio worklet's processor): minified as code
    if(n.type==='TemplateLiteral'&&!n.expressions.length&&/registerProcessor\(/.test(n.quasis[0].value.cooked)){
      const c=es.transformSync(n.quasis[0].value.cooked,{minify:true,legalComments:'none',target:'es2022'}).code.trim();
      ed.push([n.start+1,n.end-1,c.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${')]); return; }
    if(glsl.has(n)&&n.type==='Literal'&&/\/[\/*]/.test(n.value)){
      const r=one(src.slice(n.start+1,n.end-1),'\\n'); if(r!==null)ed.push([n.start+1,n.end-1,r]); return; }
    if(glsl.has(n)&&n.type==='TemplateLiteral'){
      for(const x of n.quasis){ if(!/\/[\/*]/.test(x.value.raw))continue; const r=one(x.value.raw,'\n'); if(r!==null)ed.push([x.start,x.end,r]); }
    }
    for(const k in n){ const v=n[k]; if(Array.isArray(v))v.forEach(walk); else if(v&&typeof v.type==='string')walk(v); }
  })(ast);
  ed.sort((a,b)=>b[0]-a[0]); for(const [a,b,r] of ed) src=src.slice(0,a)+r+src.slice(b);
  return {src,n:ed.length,left};
}
for(const f of process.argv.slice(2)){
  const s=fs.readFileSync(f,'utf8'),n0=s.length;
  let o=s.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g,(all,attr,code)=>{
    if(/importmap/.test(attr)) return '<script'+attr+'>'+JSON.stringify(JSON.parse(code))+'</script>';
    if(!code.trim()) return all;
    const r=es.transformSync(code,{minify:true,format:/module/.test(attr)?'esm':undefined,legalComments:'none',target:'es2022',charset:'utf8'});
    const g=glslStrip(r.code,/module/.test(attr)); if(g.n||g.left)console.log('  shaders:',g.n,'cleaned,',g.left,'notes left (they run on past their text)');
    return '<script'+attr+'>'+g.src.trim()+'</script>';
  }).replace(/<style([^>]*)>([\s\S]*?)<\/style>/g,(all,attr,css)=>'<style'+attr+'>'+es.transformSync(css,{loader:'css',minify:true,legalComments:'none'}).code.trim()+'</style>');
  // the HTML outside them: no comments, no runs of space between tags (inside the scripts and styles already done)
  const parts=o.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/);
  o=parts.map((p,i)=>i%2?p:p.replace(/<!--[\s\S]*?-->/g,'').replace(/>\s+</g,'><').trim()).join('');
  fs.writeFileSync(f,o); console.log('minified',f,n0,'->',o.length);
}
