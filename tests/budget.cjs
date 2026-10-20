// THE BUDGET CHECK (19 Oct 2026, quick wins): node tests/budget.cjs <base.json> <head.json>
// Compares two runs of tests/startprof.cjs (the pull request's base and the pull request, same machine, one after the other) and fails
// when the pull request costs more: triangles or draw calls a frame on the street at the start or in the park's south-west, shader
// programs (over 10%: it counts what has compiled so far, and rooms built while sampling add to it), the time to start, or page errors the base didn't have. Writes a table to the run's summary when on GitHub.
const fs=require('fs');
const [A,B]=process.argv.slice(2).map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
const rows=[], fail=[];
const cmp=(name,a,b,limit)=>{ if(a==null||b==null){ rows.push([name,a,b,'not measured']); return; }
  const ok=b<=limit(a); rows.push([name,a,b,ok?'ok':'OVER']); if(!ok)fail.push(name+': '+a+' -> '+b); };
for(const spot of ['start','parkSW']){
  const a=(A[spot]||{}).info||{}, b=(B[spot]||{}).info||{};
  cmp(spot+' triangles',a.tris,b.tris,x=>Math.ceil(x*1.1)+500);
  cmp(spot+' draw calls',a.calls,b.calls,x=>Math.ceil(x*1.1)+5);
  cmp(spot+' shader programs',a.programs,b.programs,x=>Math.ceil(x*1.1)+2);
  cmp(spot+' frame ms (median)',(A[spot]||{}).dtMed,(B[spot]||{}).dtMed,x=>x*1.5+5);
}
cmp('time to start (ms)',A.startMs,B.startMs,x=>Math.round(x*1.35+3000));
const newErr=(B.errs||[]).filter(e=>!(A.errs||[]).includes(e));
rows.push(['page errors',(A.errs||[]).length,(B.errs||[]).length,newErr.length?'NEW':'ok']); if(newErr.length)fail.push('new page errors: '+newErr.join(' | '));
if(B.startMs==null)fail.push('the pull request\'s page never started');
const md='| measure | base | this pull request | |\n|---|---|---|---|\n'+rows.map(r=>'| '+r.join(' | ')+' |').join('\n')+'\n';
console.log(md); if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'### Budget\n\n'+md+(fail.length?'\n**Over budget:** '+fail.join('; ')+'\n':''));
if(fail.length){ console.log('OVER BUDGET: '+fail.join('; ')); process.exit(1); }
console.log('within budget');
