// THE PAGE'S MODULE, PARSED: the text of dist/market.html's module script into an .mjs (argv[2]), for `node --check`
const fs=require('fs'), h=fs.readFileSync(process.cwd()+'/dist/market.html','utf8'), a=h.indexOf('<script type="module">'), b=h.indexOf('</script>',a);
fs.writeFileSync(process.argv[2]||'mod.mjs',h.slice(a+22,b)); console.log('module',b-a-22,'chars');
