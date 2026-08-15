// Guard the specific regressions we keep hitting in this layout.
const fs=require('fs');
const css=fs.readFileSync('css/app.css','utf8');
let fail=0;
const check=(name,ok,why)=>{ if(!ok){fail=1;console.log('  FAIL '+name+' — '+why);} else console.log('  ok   '+name); };

check('no hard-coded header offset', !/calc\(100vh\s*-\s*\d/.test(css) && !/top:\s*6[0-9]px/.test(css),
      'a fixed header height detaches the rail when the topbar wraps');
check('content column is not width-capped', !/\.railmain\{[^}]*max-width:\s*\d+px/.test(css),
      'a max-width on .railmain clips the arcs mid-screen');
check('legacy .arc-top band removed', !/\.arc-top\b/.test(css),
      '.arc-top and .arcTop differing only by a hyphen is a trap');
check('.railmain establishes containing block', /\.railmain\{[^}]*position:relative/.test(css),
      'arcs are absolute and need a positioned ancestor');
check('.mainInner sits above the arcs', /\.mainInner\{[^}]*z-index:1/.test(css),
      'without z-index the arcs paint over the content');

for(const f of ['clinic.html','portal.html']){
  const h=fs.readFileSync(f,'utf8');
  const main=h.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const arcsInsideRenderTarget=/id="main"[^>]*>\s*<span class="arc/.test(h);
  check(f+': arcs survive re-render', !arcsInsideRenderTarget,
        'arcs inside the innerHTML target are wiped on first render');
  check(f+': has both arcs', /class="arcTop"/.test(h)&&/class="arcBot"/.test(h), 'missing an arc');
}
console.log(fail?'LAYOUT CHECKS FAILED':'layout guards pass');
process.exit(fail);
