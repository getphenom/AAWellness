const fs=require('fs'); const css=fs.readFileSync('css/app.css','utf8');
const defined=new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(m=>m[1]));
const used=new Set([...css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map(m=>m[1]));
const missing=[...used].filter(v=>!defined.has(v));
console.log(missing.length? '  UNDEFINED: '+missing.join(', ') : '  all '+used.size+' CSS vars defined');
process.exit(missing.length?1:0);
