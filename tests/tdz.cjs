/* Detect top-level `let`/`const` used by a function that is CALLED before the
   declaration is evaluated — the temporal-dead-zone trap that just broke the
   clinic console. */
const fs = require('fs');
let bad = 0;

for (const f of ['clinic.html','portal.html','index.html']) {
  const html = fs.readFileSync('/home/claude/aawellness/app/' + f, 'utf8');
  const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!m) continue;
  const lines = m[1].split('\n');

  // top-level let/const declarations (no leading indentation)
  const decls = [];
  lines.forEach((l, i) => {
    const d = l.match(/^(?:let|const)\s+([A-Za-z_$][\w$]*)/);
    if (d) decls.push({ name: d[1], line: i });
  });

  // top-level function declarations and the identifiers they reference
  const funcs = [];
  lines.forEach((l, i) => {
    const d = l.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/);
    if (d) funcs.push({ name: d[1], line: i });
  });

  // top-level bare calls, e.g. `paintNav();`
  lines.forEach((l, i) => {
    const c = l.match(/^([A-Za-z_$][\w$]*)\(\s*\)\s*;/);
    if (!c) return;
    const fn = funcs.find((x) => x.name === c[1]);
    if (!fn) return;
    // crude body scan: from the function line to the next top-level close
    let end = fn.line + 1;
    while (end < lines.length && !/^}/.test(lines[end])) end++;
    const body = lines.slice(fn.line, end).join('\n');
    for (const d of decls) {
      if (d.line > i && new RegExp('\\b' + d.name + '\\b').test(body)) {
        console.log(`  ${f}: ${c[1]}() called line ${i+1} uses "${d.name}" declared line ${d.line+1} -> TDZ`);
        bad++;
      }
    }
  });
}
console.log(bad ? `${bad} temporal-dead-zone risk(s)` : 'No temporal-dead-zone risks found.');
