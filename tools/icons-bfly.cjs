// The butterflies' bag pictures: each species' own wing painter (039-bodega bfPic) at 16 pixels, written for tools/icons.py.
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../src/039-bodega.js'),'utf8'), a=src.indexOf('const BF_C='), b=src.indexOf('return {w,h,oy,px}; }',src.indexOf('function bfPic('))+'return {w,h,oy,px}; }'.length;
const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
const {BF_KINDS,bfPic}=new Function('hash',src.slice(a,b)+';return {BF_KINDS,bfPic};')(hash);
const out=BF_KINDS.map((k,i)=>({i,name:k[0],sh:k[4],...bfPic(i,16,0)}));
fs.writeFileSync(process.argv[2]||'/dev/stdout',JSON.stringify(out));
