// Execute each module's top level with stubbed imports to catch runtime errors
const fs=require('fs');
const files=['clinic.html','portal.html'];
let fail=0;
for(const f of files){
  const html=fs.readFileSync(f,'utf8');
  const m=html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if(!m){console.log('  '+f+': no module script');continue;}
  let code=m[1]
    .replace(/^\s*import[\s\S]*?from\s*["'][^"']+["'];?/gm,'')
    .replace(/export\s+/g,'');
  const stub=new Proxy(()=>stub,{get:()=>stub,apply:()=>stub});
  const names=['api','sb','esc','$','$$','openModal','closeModal','toast','emptyState',
               'fmtDate','fmtTime','fmtMoney','requireRole','signOut','slotsForWeek',
               'weekStart','addDays','ymd','signaturePad','money','fmtDateTime'];
  try{
    const AF=Object.getPrototypeOf(async function(){}).constructor;
    const fn=new AF(...names,'document','window','location',
      code+'\n;/*top-level executed*/');
    fn(...names.map(()=>stub),stub,stub,stub);
    console.log('  '+f.padEnd(13)+'top level executes clean');
  }catch(e){
    fail=1;console.log('  '+f+' RUNTIME: '+e.constructor.name+': '+e.message);
  }
}
process.exit(fail);
