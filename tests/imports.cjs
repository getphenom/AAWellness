const fs=require('fs');
const api=fs.readFileSync('js/api.js','utf8');
const exp=new Set();
for(const re of [/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g,
                 /export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)/g])
  for(const m of api.matchAll(re)) exp.add(m[1]);
for(const m of api.matchAll(/export\s*\{([^}]*)\}/g))
  m[1].split(',').forEach(x=>{const n=x.split(/\sas\s/).pop().trim(); if(n)exp.add(n)});

let fail=0;
for(const f of ['clinic.html','portal.html','index.html']){
  const h=fs.readFileSync(f,'utf8');
  const used=new Set([...h.matchAll(/\bapi\.([A-Za-z0-9_]+)\s*\(/g)].map(m=>m[1]));
  const bad=[...used].filter(u=>!exp.has(u));
  if(bad.length){fail=1;console.log('  '+f+' MISSING: '+bad.join(', '));}
  else console.log('  '+f.padEnd(13)+'all '+used.size+' api.* calls resolve');
}

// helpers used but never defined or imported
const uiExp=new Set([...fs.readFileSync('js/ui.js','utf8')
  .matchAll(/export\s+(?:async\s+)?(?:function\s+|const\s+|let\s+)([A-Za-z0-9_]+)/g)].map(m=>m[1]));
for(const f of ['clinic.html','portal.html']){
  const h=fs.readFileSync(f,'utf8');
  const local=new Set([...h.matchAll(/function\s+([A-Za-z0-9_]+)/g)].map(m=>m[1]));
  const imported=new Set();
  for(const m of h.matchAll(/import\s*\{([^}]*)\}/g))
    m[1].split(',').forEach(x=>{const n=x.trim(); if(n)imported.add(n)});
  for(const n of ['phead','openModal','closeModal','toast','emptyState','esc','$','$$'])
    if(!local.has(n)&&!imported.has(n)){fail=1;console.log('  '+f+': helper '+n+' UNDEFINED');}
}
console.log(fail?'FAIL':'imports + helpers OK');
process.exit(fail);
