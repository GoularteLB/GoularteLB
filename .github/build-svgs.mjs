// Generates every animated SVG used by the profile README.
// usage (from the repo root): node .github/build-svgs.mjs images
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2];
const C = {
  bg: '#050B1A', card: '#0A1628', line: '#1E293B', white: '#F8FAFC', text: '#CBD5E1',
  muted: '#94A3B8', dim: '#64748B', green: '#34D399', cyan: '#22D3EE', blue: '#60A5FA',
  deep: '#2563EB', violet: '#A78BFA', amber: '#FBBF24', red: '#F87171',
};
const SANS = `'Segoe UI',Inter,'Helvetica Neue',Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,'Cascadia Code','SFMono-Regular','JetBrains Mono',Menlo,Consolas,monospace`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const monoW = (s, fs) => s.length * fs * 0.61;
const save = (name, svg) => writeFileSync(`${OUT}/${name}`, svg.trim().replace(/\n\s*\n/g, '\n') + '\n');

const BASE_CSS = `
    .sans{font-family:${SANS}}
    .mono{font-family:${MONO}}
    .rise{animation:rise .9s cubic-bezier(.2,.7,.2,1) both}
    @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`;
const REDUCED = `@media (prefers-reduced-motion:reduce){*{animation:none!important}.anim{display:none}}`;

const accentGrad = (id) => `
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.green}"/><stop offset=".5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>`;

function pill(x, y, label, { fs = 12, h = 26, color = C.muted, dot, stroke = C.line, fill = C.card } = {}) {
  const pad = 12;
  const dotW = dot ? 14 : 0;
  const w = Math.round(monoW(label, fs) + pad * 2 + dotW);
  return {
    w,
    svg: `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${stroke}"/>` +
      (dot ? `<circle cx="${x + pad + 3}" cy="${y + h / 2}" r="3" fill="${dot}"/>` : '') +
      `<text class="mono" x="${x + pad + dotW}" y="${y + h / 2 + fs * 0.36}" font-size="${fs}" fill="${color}">${esc(label)}</text></g>`,
  };
}
function chipRow(x, y, labels, opts) {
  let cx = x;
  return labels.map((l) => { const p = pill(cx, y, l, opts); cx += p.w + 8; return p.svg; }).join('\n    ');
}

/* ───────────────────────────── HEADER ───────────────────────────── */
function header() {
  const cx = 940, cy = 228, R = 165, r = 98;
  const vert = (rad, k) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    return [+(cx + rad * Math.cos(a)).toFixed(1), +(cy + rad * Math.sin(a)).toFixed(1)];
  };
  const poly = (rad) => [0, 1, 2, 3, 4, 5].map((k) => vert(rad, k).join(',')).join(' ');
  // driving adapters (left/bottom) push requests in; driven adapters (top/right) receive calls out
  const adapters = [
    { k: 0, label: 'Kafka', dir: 'out', color: C.cyan },
    { k: 1, label: 'PostgreSQL', dir: 'out', color: C.cyan },
    { k: 2, label: 'AWS', dir: 'out', color: C.blue },
    { k: 3, label: 'Flutter', dir: 'in', color: C.green },
    { k: 4, label: 'React', dir: 'in', color: C.green },
    { k: 5, label: 'REST API', dir: 'in', color: C.green },
  ];
  const coreR = 46;
  const spokes = adapters.map(({ k }) => {
    const [x1, y1] = vert(R, k); const [x2, y2] = vert(coreR + 6, k);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#16243A" stroke-width="1.5" stroke-dasharray="3 6"/>`;
  }).join('\n      ');
  const packets = adapters.map(({ k, dir, color }, i) => {
    const out = vert(R - 18, k); const inn = vert(coreR + 8, k);
    const [a, b] = dir === 'in' ? [out, inn] : [inn, out];
    const begin = (1.6 + i * 0.45).toFixed(2);
    return `<circle class="anim" r="4.5" fill="${color}" opacity="0">
        <animateMotion dur="2.7s" begin="${begin}s" repeatCount="indefinite" path="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" keyPoints="0;1;1" keyTimes="0;.6;1" calcMode="linear"/>
        <animate attributeName="opacity" dur="2.7s" begin="${begin}s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;.08;.52;.6;1"/>
      </circle>`;
  }).join('\n      ');
  const labels = adapters.map(({ k, label, color }, i) => {
    const [x, y] = vert(R, k);
    const fs = 13, h = 28, w = Math.round(monoW(label, fs) + 34);
    return `<g class="pop" style="animation-delay:${(0.9 + i * 0.08).toFixed(2)}s">
        <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="14" fill="${C.card}" stroke="${C.line}" stroke-width="1.5"/>
        <circle cx="${x - w / 2 + 13}" cy="${y}" r="3.5" fill="${color}"/>
        <text class="mono" x="${x - w / 2 + 23}" y="${y + 4.6}" font-size="${fs}" fill="${C.text}">${label}</text>
      </g>`;
  }).join('\n      ');
  const chips = chipRow(80, 312, ['Java', 'C#', '.NET', 'Spring', 'React', 'Vue', 'Flutter'], { fs: 15, h: 32, color: C.muted });

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 460" width="1200" height="460" role="img" aria-label="Lucas Goularte, Software Engineer (Java and C#), with an animated hexagonal architecture diagram">
  <defs>
    <radialGradient id="glow" cx="${cx}" cy="${cy}" r="330" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity=".18"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="160" cy="40" r="420" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.green}" stop-opacity=".07"/><stop offset="1" stop-color="${C.green}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chain" gradientUnits="userSpaceOnUse" x1="${cx - r}" y1="${cy - r}" x2="${cx + r}" y2="${cy + r}">
      <stop offset="0" stop-color="#4ADE80"/><stop offset=".55" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>
    <linearGradient id="core" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0E2A3A"/><stop offset="1" stop-color="#0A1628"/>
    </linearGradient>
    <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-260" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/>
      <stop offset=".5" stop-color="#A5F3FC" stop-opacity=".95"/>
      <stop offset="1" stop-color="${C.green}" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 0;1000 0;1000 0" keyTimes="0;.45;1" dur="6s" begin="1.2s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.green}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}" stop-opacity=".8"/><stop offset="1" stop-color="${C.deep}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#14213A"/></pattern>
    <clipPath id="frame"><rect width="1200" height="460" rx="24"/></clipPath>
  </defs>
  <style>${BASE_CSS}
    .pop{transform-box:fill-box;transform-origin:center;animation:pop .6s cubic-bezier(.3,1.6,.5,1) both}
    .hex{transform-origin:${cx}px ${cy}px;animation:hex 1.1s .2s cubic-bezier(.2,.8,.2,1) both}
    .flow{animation:flow 1.6s linear infinite}
    .line{clip-path:inset(0 100% 0 0);animation:type 12s steps(32) infinite}
    .l2{animation-delay:4s}.l3{animation-delay:8s}
    .caret{animation:blink 1s steps(1) infinite}
    .ring{transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-out infinite}
    .beat{transform-box:fill-box;transform-origin:center;animation:beat 2.7s 1.6s ease-in-out infinite}
    .sweep{animation:sweep 7s 1.6s ease-in-out infinite}
    @keyframes pop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
    @keyframes hex{from{opacity:0;transform:scale(.6) rotate(-30deg)}to{opacity:1;transform:none}}
    @keyframes flow{to{stroke-dashoffset:-28}}
    @keyframes type{0%{clip-path:inset(0 100% 0 0)}11%,28%{clip-path:inset(0 0 0 0)}33%,100%{clip-path:inset(0 100% 0 0)}}
    @keyframes blink{50%{opacity:0}}
    @keyframes ring{from{opacity:.8;transform:scale(1)}to{opacity:0;transform:scale(3.2)}}
    @keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
    @keyframes sweep{0%{transform:translateX(-400px)}45%,100%{transform:translateX(1500px)}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}.line{clip-path:none}.l2,.l3,.anim{display:none}}
  </style>

  <g clip-path="url(#frame)">
    <rect width="1200" height="460" fill="${C.bg}"/>
    <rect width="1200" height="460" fill="url(#dots)"/>
    <rect width="1200" height="460" fill="url(#glow)"/>
    <rect width="1200" height="460" fill="url(#glow2)"/>
    <rect class="sweep" x="0" y="0" width="320" height="2" fill="url(#edge)"/>
  </g>
  <rect x="1" y="1" width="1198" height="458" rx="23" fill="none" stroke="#132033" stroke-width="2"/>

  <!-- left: identity -->
  <g class="rise mono" style="animation-delay:.1s" font-size="18">
    <text x="80" y="98"><tspan fill="${C.green}">~/lucas</tspan><tspan fill="${C.dim}"> on </tspan><tspan fill="${C.blue}">main</tspan><tspan fill="${C.dim}"> › </tspan><tspan fill="${C.text}">./hello --lang=en,pt</tspan></text>
  </g>
  <g class="rise sans" style="animation-delay:.25s" font-size="74" font-weight="700" letter-spacing="-2">
    <text x="76" y="176" fill="${C.white}">Lucas Goularte</text>
    <text x="76" y="176" fill="url(#shine)">Lucas Goularte</text>
  </g>
  <g class="mono" font-size="26" font-weight="500" fill="${C.text}">
    <text class="line l1" x="80" y="230"><tspan fill="${C.green}">›</tspan> Software Engineer · Java &amp; C#<tspan class="caret" fill="${C.green}">▍</tspan></text>
    <text class="line l2" x="80" y="230"><tspan fill="${C.cyan}">›</tspan> Domain-Driven, Test-Driven<tspan class="caret" fill="${C.cyan}">▍</tspan></text>
    <text class="line l3" x="80" y="230"><tspan fill="${C.blue}">›</tspan> From backend to mobile, end to end<tspan class="caret" fill="${C.blue}">▍</tspan></text>
  </g>
  <g class="rise sans" style="animation-delay:.45s">
    <text x="80" y="278" font-size="18" fill="${C.muted}">I model the domain, prove it with tests, and ship it to production.</text>
  </g>
  <g class="rise" style="animation-delay:.6s">
    ${chips}
  </g>
  <g class="rise sans" style="animation-delay:.9s">
    <circle class="ring" cx="88" cy="392" r="5" fill="none" stroke="${C.green}" stroke-width="1.5"/>
    <circle cx="88" cy="392" r="5" fill="${C.green}"/>
    <text x="104" y="398" font-size="17"><tspan fill="${C.text}" font-weight="600">Available for freelance</tspan><tspan fill="${C.dim}">  ·  remote  ·  Brazil (UTC−3)</tspan></text>
  </g>

  <!-- right: hexagonal architecture, live -->
  <g class="hex">
    <polygon points="${poly(R)}" fill="none" stroke="#1B2B44" stroke-width="1.5"/>
    <polygon class="flow" points="${poly(R)}" fill="none" stroke="${C.cyan}" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="2 12"/>
    <polygon points="${poly(r)}" fill="${C.card}" fill-opacity=".75" stroke="url(#chain)" stroke-width="2.5" stroke-linejoin="round"/>
    ${spokes}
    <circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="${C.cyan}" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="4 8">
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="24s" repeatCount="indefinite"/>
    </circle>
    <g class="beat">
      <circle cx="${cx}" cy="${cy}" r="${coreR}" fill="url(#core)" stroke="url(#chain)" stroke-width="2"/>
    </g>
    <text class="sans" x="${cx}" y="${cy + 2}" font-size="16" font-weight="700" fill="${C.white}" text-anchor="middle">Domain</text>
    <text class="mono" x="${cx}" y="${cy + 20}" font-size="10.5" fill="${C.green}" text-anchor="middle" letter-spacing="1">DDD · TDD</text>
    <text class="mono" x="${cx}" y="${cy - r + 22}" font-size="10" fill="${C.dim}" text-anchor="middle" letter-spacing="2">PORTS</text>
  </g>
  <g>
      ${packets}
  </g>
  <g>
      ${labels}
  </g>
  <text class="mono rise" style="animation-delay:1.4s" x="${cx}" y="440" font-size="12" fill="#3B4A63" text-anchor="middle">fig.1 · ports &amp; adapters, the way I build</text>
</svg>`;
}

/* ───────────────────────────── SECTION TITLES ───────────────────────────── */
function title(n, text, theme) {
  const fg = theme === 'dark' ? C.white : '#0F172A';
  const sub = theme === 'dark' ? C.dim : '#94A3B8';
  const base = theme === 'dark' ? '#1E293B' : '#E2E8F0';
  const tw = text.length * 28 * 0.6;
  const lx = Math.round(60 + tw + 26);
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 64" width="900" height="64" role="img" aria-label="${n} ${esc(text)}">
  <defs>${accentGrad('g')}
    <linearGradient id="run" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="track"><rect x="${lx}" y="30" width="${900 - lx}" height="6"/></clipPath>
  </defs>
  <style>${BASE_CSS}
    .grow{transform-box:fill-box;transform-origin:left;animation:grow 1.1s .25s cubic-bezier(.6,0,.2,1) both}
    .run{animation:run 4.5s 1.4s ease-in-out infinite}
    @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    @keyframes run{0%{transform:translateX(-160px)}55%,100%{transform:translateX(${900 - lx + 160}px)}}
    ${REDUCED}
  </style>
  <g class="rise">
    <text class="mono" x="2" y="42" font-size="15" font-weight="600" fill="${C.green}">${n}</text>
    <text class="mono" x="30" y="42" font-size="15" fill="${sub}">/</text>
    <text class="sans" x="52" y="43" font-size="28" font-weight="700" letter-spacing="-.5" fill="${fg}">${esc(text)}</text>
  </g>
  <rect class="grow" x="${lx}" y="32.5" width="${900 - lx}" height="1.5" fill="${base}"/>
  <rect class="grow" x="${lx}" y="32" width="48" height="2.5" rx="1" fill="url(#g)"/>
  <g clip-path="url(#track)"><rect class="run anim" x="${lx}" y="32" width="160" height="2.5" fill="url(#run)"/></g>
</svg>`;
}

/* ───────────────────────────── TERMINAL (NOW) ───────────────────────────── */
function terminal() {
  const commits = [
    ['a3f9c21', 'feat', 'artif', 'humanized AI assistant for orthodontic clinics', C.violet],
    ['7be41d0', 'study', 'postgrad', 'software engineering & architecture', C.blue],
    ['c09e8f4', 'feat', 'bpm', 'process orchestration with Camunda 8 · BPMN + DMN', C.cyan],
    ['e51b2aa', 'perf', 'blueprint', 'ingesting 5M-row CSVs with Spring Boot + Postgres', C.green],
  ];
  const y0 = 92, step = 31;
  const cmd = (y, text, delay, n) =>
    `<text class="type" style="animation-delay:${delay}s;animation-timing-function:steps(${n})" x="32" y="${y}"><tspan fill="${C.green}">❯</tspan> <tspan fill="${C.white}">${esc(text)}</tspan></text>`;
  const rows = commits.map(([h, t, s, m, col], i) =>
    `<text class="in" style="animation-delay:${(1.75 + i * 0.32).toFixed(2)}s" x="32" y="${y0 + step * (i + 1)}"><tspan fill="${C.amber}">${h}</tspan>  <tspan fill="${col}">${t}(${s}):</tspan> <tspan fill="${C.text}">${esc(m)}</tspan></text>`
  ).join('\n    ');
  const yCmd2 = y0 + step * 5 + 8, yOut = yCmd2 + step;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 330" width="900" height="330" role="img" aria-label="What I'm working on now: Artif AI assistant, postgrad in software engineering and architecture, Camunda 8 orchestration, and Blueprint CSV ingestion. Open to freelance work.">
  <defs>${accentGrad('g')}</defs>
  <style>${BASE_CSS}
    text{font-family:${MONO};font-size:15.5px}
    .type{clip-path:inset(0 100% 0 0);animation:type 1s both}
    .in{animation:in .45s cubic-bezier(.2,.7,.2,1) both}
    .caret{animation:show 0s 4.6s both,blink 1s 4.6s steps(1) infinite}
    @keyframes type{to{clip-path:inset(0 0 0 0)}}
    @keyframes in{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
    @keyframes show{from{opacity:0}to{opacity:1}}
    @keyframes blink{50%{opacity:0}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}.type{clip-path:none}}
  </style>
  <rect x="1" y="1" width="898" height="328" rx="16" fill="${C.card}" stroke="${C.line}" stroke-width="1.5"/>
  <path d="M1 17a16 16 0 0 1 16-16h866a16 16 0 0 1 16 16v27H1z" fill="#0D1B30"/>
  <line x1="1" y1="44" x2="899" y2="44" stroke="${C.line}"/>
  <circle cx="26" cy="23" r="6" fill="${C.red}" opacity=".85"/><circle cx="46" cy="23" r="6" fill="${C.amber}" opacity=".85"/><circle cx="66" cy="23" r="6" fill="${C.green}" opacity=".85"/>
  <text x="450" y="28" font-size="13" fill="${C.dim}" text-anchor="middle" style="font-size:13px">lucas@goularte: ~/now</text>
  ${cmd(y0, 'git log --oneline --author=lucas -4', 0.3, 36)}
    ${rows}
  ${cmd(yCmd2, 'cat status.txt', 3.3, 16)}
  <text class="in" style="animation-delay:4.3s" x="32" y="${yOut}"><tspan fill="${C.green}">●</tspan> <tspan fill="${C.white}">open to freelance</tspan><tspan fill="${C.dim}"> · remote · pt-BR / en · usually replies within 24h</tspan><tspan class="caret" fill="${C.green}" opacity="0"> ▍</tspan></text>
</svg>`;
}

/* ───────────────────────────── PROJECT CARDS ───────────────────────────── */
function vizNox(accent) {
  const pts = [];
  for (let x = 0; x <= 376; x += 4) {
    let y = 34 + 8 * Math.sin(x / 19) + 5 * Math.sin(x / 6.7 + 1);
    if (x > 236 && x < 268) y -= 22 * Math.sin(((x - 236) / 32) * Math.PI);
    pts.push([x, +Math.max(2, Math.min(54, y)).toFixed(1)]);
  }
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  len = Math.ceil(len);
  const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
  return `
    <style>.wave{stroke-dasharray:${len};animation:wave 5s ease-in-out infinite}
      @keyframes wave{0%{stroke-dashoffset:${len}}55%,85%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}</style>
    <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity=".18"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs>
    ${[14, 28, 42].map((y) => `<line x1="0" y1="${y}" x2="376" y2="${y}" stroke="#13223A"/>`).join('')}
    <line x1="0" y1="12" x2="376" y2="12" stroke="${C.red}" stroke-opacity=".55" stroke-dasharray="4 4"/>
    <text class="mono" x="376" y="8" font-size="9.5" fill="${C.red}" fill-opacity=".8" text-anchor="end">NOx limit</text>
    <path d="${d} L376 56 L0 56Z" fill="url(#area)"/>
    <path class="wave" d="${d}" fill="none" stroke="${accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
}
function vizFleet(accent) {
  const road = 'M0 44 C 60 6, 120 54, 188 28 S 316 4, 376 26';
  const pins = [[0, 44], [188, 28], [376, 26]];
  return `
    <path d="${road}" fill="none" stroke="#16263D" stroke-width="10" stroke-linecap="round"/>
    <path d="${road}" fill="none" stroke="#2A3B55" stroke-width="1.5" stroke-dasharray="6 8">
      <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="1.2s" repeatCount="indefinite"/>
    </path>
    ${pins.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.card}" stroke="${i === 1 ? C.amber : accent}" stroke-width="2"/>
    <circle class="anim" cx="${x}" cy="${y}" r="5" fill="none" stroke="${i === 1 ? C.amber : accent}" stroke-width="1.5">
      <animate attributeName="r" values="5;14" dur="2.2s" begin="${i * 0.7}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".8;0" dur="2.2s" begin="${i * 0.7}s" repeatCount="indefinite"/>
    </circle>`).join('\n    ')}
    <g>
      <rect x="-9" y="-5" width="18" height="10" rx="3" fill="${accent}"/>
      <rect x="4" y="-4" width="5" height="8" rx="1.5" fill="${C.white}" opacity=".85"/>
      <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="${road}" keyPoints="0;1;1" keyTimes="0;.85;1" calcMode="linear"/>
    </g>
    <text class="mono" x="188" y="10" font-size="9.5" fill="${C.amber}" text-anchor="middle">SCR check</text>`;
}
function vizChat(accent) {
  const q = 'Can I reschedule my appointment?';
  const a = 'Of course! Does Thursday at 3pm work?';
  const qw = Math.round(q.length * 6.4 + 24), aw = Math.round(a.length * 6.4 + 24);
  return `
    <style>
      .q{animation:q 8s infinite}.t{animation:t 8s infinite}.a{animation:a 8s infinite}
      .d{animation:d .9s ease-in-out infinite}
      @keyframes q{0%{opacity:0;transform:translateY(6px)}6%,90%{opacity:1;transform:none}100%{opacity:0}}
      @keyframes t{0%,14%{opacity:0}18%,42%{opacity:1}46%,100%{opacity:0}}
      @keyframes a{0%,44%{opacity:0;transform:translateY(6px)}50%,90%{opacity:1;transform:none}100%{opacity:0}}
      @keyframes d{50%{transform:translateY(-3px)}}
    </style>
    <g class="q">
      <rect x="0" y="0" width="${qw}" height="24" rx="12" fill="#13223A"/>
      <text class="sans" x="12" y="16" font-size="11.5" fill="${C.text}">${q}</text>
    </g>
    <g class="t">
      <rect x="${376 - 52}" y="31" width="52" height="24" rx="12" fill="${accent}" fill-opacity=".2"/>
      ${[0, 1, 2].map((i) => `<circle class="d" style="animation-delay:${i * 0.15}s" cx="${376 - 38 + i * 12}" cy="43" r="3" fill="${accent}"/>`).join('')}
    </g>
    <g class="a">
      <rect x="${376 - aw}" y="31" width="${aw}" height="24" rx="12" fill="${accent}" fill-opacity=".22" stroke="${accent}" stroke-opacity=".45"/>
      <text class="sans" x="${376 - aw + 12}" y="47" font-size="11.5" fill="${C.white}">${a}</text>
    </g>`;
}
function vizDoses() {
  const cols = 22, rows = 3, sp = 17.4;
  const colors = [C.green, C.cyan, C.blue];
  let out = '<style>.dose{animation:dose 7s infinite both}@keyframes dose{0%{opacity:0;transform:scale(.3)}6%,78%{opacity:1;transform:none}88%,100%{opacity:0}}</style>';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = +(6 + c * sp).toFixed(1), y = 8 + r * 19;
      out += `<circle cx="${x}" cy="${y}" r="5" fill="#13223A"/>`;
      // a few people still missing a dose, so the grid never looks fake-perfect
      if ((c * 7 + r * 5) % 11 === 3 && r > 0) continue;
      out += `<circle class="dose" style="animation-delay:${(c * 0.06 + r * 0.5).toFixed(2)}s;transform-box:fill-box;transform-origin:center" cx="${x}" cy="${y}" r="5" fill="${colors[r]}"/>`;
    }
  }
  return out;
}

function card({ file, n, kicker, accent, name, desc, chips, badge, viz, aria }) {
  const badgeSvg = badge === 'source'
    ? (() => { const t = 'SOURCE ↗'; const w = Math.round(monoW(t, 11) + 22); return `<rect x="${408 - w}" y="24" width="${w}" height="24" rx="12" fill="${accent}" fill-opacity=".12" stroke="${accent}" stroke-opacity=".5"/><text class="mono" x="${408 - w / 2}" y="40" font-size="11" fill="${accent}" text-anchor="middle" letter-spacing=".5">${t}</text>`; })()
    : (() => { const t = 'CLIENT · PRIVATE'; const w = Math.round(monoW(t, 11) + 22); return `<rect x="${408 - w}" y="24" width="${w}" height="24" rx="12" fill="none" stroke="${C.line}"/><text class="mono" x="${408 - w / 2}" y="40" font-size="11" fill="${C.dim}" text-anchor="middle" letter-spacing=".5">${t}</text>`; })();
  save(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280" width="440" height="280" role="img" aria-label="${esc(aria)}">
  <defs>${accentGrad('g')}
    <radialGradient id="halo" cx="440" cy="0" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${accent}" stop-opacity=".12"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <clipPath id="clip"><rect x="1" y="1" width="438" height="278" rx="18"/></clipPath>
  </defs>
  <style>${BASE_CSS}
    .bar{stroke-dasharray:376;animation:bar 1.2s .3s cubic-bezier(.6,0,.2,1) both}
    @keyframes bar{from{stroke-dashoffset:376}to{stroke-dashoffset:0}}
    ${REDUCED}
  </style>
  <rect x="1" y="1" width="438" height="278" rx="18" fill="${C.card}" stroke="${C.line}" stroke-width="1.5"/>
  <rect x="1" y="1" width="438" height="278" rx="18" fill="url(#halo)" clip-path="url(#clip)"/>
  <line class="bar" x1="32" y1="1.5" x2="408" y2="1.5" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
  <g class="rise">
    <text class="mono" x="32" y="41" font-size="12" letter-spacing="1.6" fill="${C.dim}"><tspan fill="${accent}" font-weight="700">${n}</tspan>  ${esc(kicker)}</text>
    ${badgeSvg}
    <text class="sans" x="32" y="86" font-size="26" font-weight="700" letter-spacing="-.5" fill="${C.white}">${esc(name)}</text>
    <text class="sans" x="32" y="114" font-size="15" fill="${C.muted}">${esc(desc[0])}</text>
    <text class="sans" x="32" y="135" font-size="15" fill="${C.muted}">${esc(desc[1])}</text>
  </g>
  <g transform="translate(32 158)">${viz}
  </g>
  <g class="rise" style="animation-delay:.35s">
    ${chipRow(32, 232, chips, { fs: 11.5, h: 24, color: C.text, dot: accent })}
  </g>
</svg>`);
}

/* ───────────────────────────── OPEN SOURCE ROWS ───────────────────────────── */
function vizIngest() {
  const steps = ['0', '1.2M', '2.5M', '3.7M', '5.0M'];
  const seg = 0.18;
  const counters = steps.map((s, i) => {
    let values, keyTimes;
    if (i === 0) { values = '1;0'; keyTimes = `0;${seg}`; }
    else if (i === steps.length - 1) { values = '0;1'; keyTimes = `0;${(seg * i).toFixed(2)}`; }
    else { values = '0;1;0'; keyTimes = `0;${(seg * i).toFixed(2)};${(seg * (i + 1)).toFixed(2)}`; }
    return `<text class="mono" x="228" y="14" font-size="14" font-weight="700" fill="${i === steps.length - 1 ? C.green : C.cyan}" text-anchor="end" opacity="${i === steps.length - 1 ? 1 : 0}">${s} rows<animate attributeName="opacity" values="${values}" keyTimes="${keyTimes}" calcMode="discrete" dur="5s" repeatCount="indefinite"/></text>`;
  }).join('\n      ');
  return `
      <text class="mono" x="0" y="14" font-size="11.5" fill="${C.dim}">COPY › postgres</text>
      ${counters}
      <rect x="0" y="28" width="228" height="8" rx="4" fill="#13223A"/>
      <rect x="0" y="28" width="228" height="8" rx="4" fill="url(#g)">
        <animate attributeName="width" values="0;228;228" keyTimes="0;.72;1" dur="5s" repeatCount="indefinite"/>
      </rect>
      <text class="mono" x="0" y="56" font-size="10.5" fill="#3B4A63">batch · stream · no OOM</text>`;
}
function vizKafka() {
  const nodes = [['API', 0, C.green], ['Kafka', 84, C.amber], ['Mongo', 168, C.cyan]];
  return `
      <line x1="30" y1="22" x2="198" y2="22" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="3 5"/>
      ${[0, 1, 2, 3].map((i) => `<circle class="anim" r="3.5" fill="${i % 2 ? C.amber : C.green}"><animateMotion dur="2.4s" begin="${i * 0.6}s" repeatCount="indefinite" path="M30 22 L198 22"/></circle>`).join('')}
      ${nodes.map(([l, x, col]) => `<rect x="${x}" y="8" width="60" height="28" rx="14" fill="${C.card}" stroke="${col}" stroke-opacity=".6"/><text class="mono" x="${x + 30}" y="26" font-size="11.5" fill="${C.text}" text-anchor="middle">${l}</text>`).join('')}
      <text class="mono" x="0" y="56" font-size="10.5" fill="#3B4A63">async CPF validation · CEP lookup</text>`;
}
function vizRooms() {
  let out = '';
  const cols = 9, rows = 3, w = 22, h = 11, gx = 4.5, gy = 5;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = +(c * (w + gx)).toFixed(1), y = r * (h + gy);
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#13223A"/>`;
    const seed = (c * 13 + r * 7) % 10;
    if (seed < 6) out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${seed < 2 ? C.violet : '#3FB950'}" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${(seed / 20).toFixed(2)};${(seed / 20 + 0.08).toFixed(2)};.85;1" dur="6s" repeatCount="indefinite"/></rect>`;
  }
  return out + `<text class="mono" x="0" y="64" font-size="10.5" fill="#3B4A63">rooms × nights · availability</text>`;
}

function repo({ file, name, desc, lang, langColor, tags, viz }) {
  const short = lang === 'Kotlin' ? 'Kt' : lang === 'C#' ? 'C#' : 'Jv';
  save(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 112" width="900" height="112" role="img" aria-label="Repository ${esc(name)}: ${esc(desc)}">
  <defs>${accentGrad('g')}
    <linearGradient id="hl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${langColor}" stop-opacity=".10"/><stop offset=".45" stop-color="${langColor}" stop-opacity="0"/></linearGradient>
  </defs>
  <style>${BASE_CSS}${REDUCED}</style>
  <rect x="1" y="1" width="898" height="110" rx="16" fill="${C.card}" stroke="${C.line}" stroke-width="1.5"/>
  <rect x="1" y="1" width="898" height="110" rx="16" fill="url(#hl)"/>
  <g class="rise">
    <rect x="26" y="30" width="52" height="52" rx="14" fill="${C.bg}" stroke="${langColor}" stroke-opacity=".7" stroke-width="1.5"/>
    <text class="mono" x="52" y="62" font-size="17" font-weight="700" fill="${langColor}" text-anchor="middle">${short}</text>
    <text class="mono" x="100" y="45" font-size="19" font-weight="700" fill="${C.white}">${esc(name)}<tspan fill="${C.dim}" font-weight="400" font-size="15">  ↗</tspan></text>
    <text class="sans" x="100" y="70" font-size="14.5" fill="${C.muted}">${esc(desc)}</text>
    <circle cx="105" cy="89" r="5" fill="${langColor}"/>
    <text class="mono" x="116" y="93" font-size="12" fill="${C.text}">${lang}<tspan fill="${C.dim}">${tags.map((t) => '  ·  ' + esc(t)).join('')}</tspan></text>
  </g>
  <line x1="628" y1="22" x2="628" y2="90" stroke="${C.line}"/>
  <g transform="translate(650 26)">${viz}
  </g>
</svg>`);
}

/* ───────────────────────────── FOOTER ───────────────────────────── */
function footer() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 190" width="1200" height="190" role="img" aria-label="Let's build something that lasts. Thanks for stopping by.">
  <defs>${accentGrad('g')}
    <mask id="back"><path fill="#fff" d="M0 120 Q150 90 300 120 T600 120 T900 120 T1200 120 T1500 120 T1800 120 T2100 120 T2400 120 V190 H0 Z">
      <animateTransform attributeName="transform" type="translate" from="-600 0" to="0 0" dur="11s" repeatCount="indefinite"/></path></mask>
    <mask id="front"><path fill="#fff" d="M0 140 Q150 115 300 140 T600 140 T900 140 T1200 140 T1500 140 T1800 140 T2100 140 T2400 140 V190 H0 Z">
      <animateTransform attributeName="transform" type="translate" from="0 0" to="-600 0" dur="7s" repeatCount="indefinite"/></path></mask>
  </defs>
  <style>${BASE_CSS}
    .type{clip-path:inset(0 100% 0 0);animation:type 1.6s .4s steps(34) both}
    .caret{animation:blink 1s steps(1) infinite}
    @keyframes type{to{clip-path:inset(0 0 0 0)}}
    @keyframes blink{50%{opacity:0}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}.type{clip-path:none}}
  </style>
  <text class="mono type" x="600" y="44" font-size="20" fill="#8B9BB4" text-anchor="middle"><tspan fill="${C.green}">❯</tspan> let's build something that lasts<tspan class="caret" fill="${C.green}">▍</tspan></text>
  <text class="mono rise" style="animation-delay:2s" x="600" y="74" font-size="13" fill="#64748B" text-anchor="middle" letter-spacing="1.5">THANKS FOR STOPPING BY</text>
  <rect width="1200" height="190" fill="url(#g)" opacity=".35" mask="url(#back)"/>
  <rect width="1200" height="190" fill="url(#g)" opacity=".85" mask="url(#front)"/>
</svg>`;
}

/* ───────────────────────────── BUILD ───────────────────────────── */
save('header.svg', header());
save('now.svg', terminal());
save('footer.svg', footer());

const sections = { about: ['01', 'About'], now: ['02', 'Right now'], work: ['03', 'Selected work'], oss: ['04', 'Open source'], stack: ['05', 'Stack'], certs: ['06', 'Certifications'], activity: ['07', 'Activity'] };
for (const [k, [n, t]] of Object.entries(sections)) {
  save(`title-${k}-dark.svg`, title(n, t, 'dark'));
  save(`title-${k}-light.svg`, title(n, t, 'light'));
}

card({ file: 'project-zh.svg', n: '01', kicker: 'IOT · MONITORING', accent: C.green, name: 'ZH Solution ONE',
  desc: ['Monitoring platform for NOx sensors', 'and catalytic efficiency systems.'], chips: ['IoT', 'Real-time', 'Emissions'], badge: 'private',
  viz: vizNox(C.green), aria: 'ZH Solution ONE: monitoring platform for NOx sensors and catalytic efficiency systems. Client work.' });
card({ file: 'project-daf.svg', n: '02', kicker: 'FLEET · TELEMETRY', accent: C.cyan, name: 'DAF',
  desc: ['Live status of trucks and their', 'emission-control equipment.'], chips: ['Fleet', 'Telemetry', 'Diagnostics'], badge: 'private',
  viz: vizFleet(C.cyan), aria: 'DAF: monitoring truck status and emission-control equipment. Client work.' });
card({ file: 'project-artif.svg', n: '03', kicker: 'AI · HEALTHTECH', accent: C.violet, name: 'Artif',
  desc: ['Humanized AI assistant that handles', 'orthodontic customer service.'], chips: ['Vue', 'LLM', 'Healthtech'], badge: 'private',
  viz: vizChat(C.violet), aria: 'Artif: humanized AI assistant platform for orthodontic customer service. Client work.' });
card({ file: 'project-vaccine.svg', n: '04', kicker: 'PUBLIC HEALTH · ACADEMIC', accent: C.blue, name: 'Vaccine Control',
  desc: ['Extension project that manages', 'vaccination records and doses.'], chips: ['Java', 'Public health', 'Extension'], badge: 'source',
  viz: vizDoses(), aria: 'Vaccine Control Platform: extension project for managing vaccination data. Source code on GitHub.' });

repo({ file: 'repo-blueprint.svg', name: 'Blueprint', desc: 'Ingesting 5-million-row CSVs with Spring Boot and PostgreSQL.',
  lang: 'Java', langColor: '#E76F00', tags: ['Spring Boot', 'PostgreSQL', 'performance'], viz: vizIngest() });
repo({ file: 'repo-hexagonal-kotlin.svg', name: 'hexagonal-architecture-with-kotlin', desc: 'Customer API: CEP lookup, MongoDB and async CPF validation via Kafka.',
  lang: 'Kotlin', langColor: '#A97BFF', tags: ['Hexagonal', 'Kafka', 'MongoDB'], viz: vizKafka() });
repo({ file: 'repo-hotelbooking.svg', name: 'HotelBooking', desc: 'Reservation system: book rooms, manage stays, explore hotel services.',
  lang: 'C#', langColor: '#3FB950', tags: ['.NET', 'Clean architecture'], viz: vizRooms() });

console.log('ok');
