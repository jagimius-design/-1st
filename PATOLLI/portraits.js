// Character portraits for the Temple Ascent rivals, drawn as SVG busts in a flat, carved style.
// portrait(look, color) returns markup; `look` comes from the opponent's entry in content.js.

let uid = 0;
const DARK = '#1b120c', JADE = '#3f9a72', GOLD = '#e2b35a';

const HEADS = {
  scribe: () => `
    <rect x="33" y="36" width="34" height="6" rx="2" fill="#f1e6cc"/>
    <path d="M64 39L77 21" stroke="#6b4423" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M77 21l3-6-1 7z" fill="${DARK}"/>
    <circle cx="35" cy="39" r="3" fill="#f1e6cc"/>`,
  farmer: () => `
    <rect x="33" y="36" width="34" height="5" rx="2" fill="#6d8b3a"/>
    <g transform="rotate(28 66 28)">
      <path d="M66 40q-9-8-4-20q2 10 4 20z" fill="#6d8b3a"/>
      <ellipse cx="66" cy="27" rx="4.5" ry="10" fill="#f2c94c"/>
      <path d="M63 21h6M62 25h8M62 29h8M63 33h6" stroke="#c99a2e" stroke-width="1"/>
      <path d="M66 40q9-8 4-20q-2 10-4 20z" fill="#86a948"/>
    </g>`,
  trader: () => `
    <path d="M31 45q-3-20 19-22q23 2 19 22q-8-10-19-10q-11 0-19 10z" fill="#8a5a3a"/>
    <path d="M34 36q16-8 32 0" stroke="#d9a441" stroke-width="2" fill="none"/>
    <ellipse cx="72" cy="40" rx="4" ry="7" fill="#7a3b1e" transform="rotate(20 72 40)"/>
    <path d="M70 34q2 6 0 12M73 34q1 6-1 12" stroke="#4e2410" stroke-width=".8" fill="none"/>`,
  jaguar: () => `
    <circle cx="31" cy="27" r="7" fill="#d9a03a"/><circle cx="69" cy="27" r="7" fill="#d9a03a"/>
    <circle cx="31" cy="27" r="3.5" fill="#7a4a16"/><circle cx="69" cy="27" r="3.5" fill="#7a4a16"/>
    <path d="M27 64q-6-40 23-42q29 2 23 42q-4-22-23-24q-19 2-23 24z" fill="#d9a03a"/>
    <path d="M36 41l3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5 3 5" fill="#fff6e0" stroke="none"/>
    <g fill="${DARK}"><circle cx="38" cy="30" r="2"/><circle cx="50" cy="27" r="2.2"/><circle cx="62" cy="30" r="2"/>
      <circle cx="30" cy="44" r="1.8"/><circle cx="70" cy="44" r="1.8"/><circle cx="28" cy="55" r="1.6"/><circle cx="72" cy="55" r="1.6"/>
      <circle cx="44" cy="33" r="1.2"/><circle cx="56" cy="33" r="1.2"/></g>`,
  stargazer: () => `
    <path d="M33 46q-2 18 2 30h6q-4-12-3-30zM67 46q2 18-2 30h-6q4-12 3-30z" fill="${DARK}"/>
    <rect x="33" y="35" width="34" height="5" rx="2" fill="#3b8fa8"/>
    <path d="M50 26l2.2 6.5 6.8.5-5.3 4.2 1.8 6.6L50 40l-5.5 3.8 1.8-6.6-5.3-4.2 6.8-.5z" fill="${GOLD}" transform="translate(0 -4) scale(1)"/>
    <g fill="#fff8d6"><circle cx="18" cy="20" r="1.2"/><circle cx="84" cy="16" r="1.5"/><circle cx="80" cy="34" r=".9"/><circle cx="14" cy="38" r="1"/></g>`,
  champion: () => `
    <path d="M31 43q-1-17 19-17q20 0 19 17q-6-6-19-6q-13 0-19 6z" fill="#b5432e"/>
    <path d="M31 40h38" stroke="#f1e6cc" stroke-width="3"/>
    <path d="M66 40l8-4-2 8z" fill="#f1e6cc"/>`,
  priestess: () => `
    <g fill="${JADE}">${[-62, -40, -20, 0, 20, 40, 62].map(a => `<ellipse cx="50" cy="12" rx="4.5" ry="15" transform="rotate(${a} 50 34)"/>`).join('')}</g>
    <g fill="#2f7a59">${[-50, -30, -10, 10, 30, 50].map(a => `<ellipse cx="50" cy="16" rx="2" ry="10" transform="rotate(${a} 50 34)"/>`).join('')}</g>
    <path d="M32 42q0-10 18-10q18 0 18 10q-8-4-18-4q-10 0-18 4z" fill="${GOLD}"/>
    <circle cx="50" cy="36" r="3.5" fill="${JADE}" stroke="${DARK}" stroke-width=".8"/>`,
  serpent: () => `
    <g fill="#2b8a6a">${[-55, -35, 35, 55].map(a => `<ellipse cx="50" cy="12" rx="4" ry="14" transform="rotate(${a} 50 36)"/>`).join('')}</g>
    <path d="M28 44q-2-22 22-24q24 2 22 24q-10-8-22-8q-12 0-22 8z" fill="${GOLD}"/>
    <path d="M32 33q18-10 36 0" stroke="${JADE}" stroke-width="3" fill="none" stroke-dasharray="3 2"/>
    <path d="M34 22q16-14 32 0l-4 7q-12-8-24 0z" fill="#c9962f"/>
    <circle cx="42" cy="21" r="2.2" fill="${DARK}"/><circle cx="58" cy="21" r="2.2" fill="${DARK}"/>
    <path d="M40 28l2 4 2-4 2 4 2-4 2 4 2-4 2 4 2-4 2 4 2-4" fill="#fff6e0"/>`,
};

const CLOTH = {
  scribe: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#f1e6cc"/><path d="M38 76l12 12 12-12" stroke="#c9b27c" stroke-width="2" fill="none"/>`,
  farmer: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#e9dcc0"/><path d="M20 90h60" stroke="#6d8b3a" stroke-width="3"/>`,
  trader: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#c98a4a"/><path d="M30 78l40 22" stroke="#5a3a1c" stroke-width="5"/>`,
  jaguar: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#d9a03a"/><g fill="${DARK}"><circle cx="30" cy="88" r="2.4"/><circle cx="44" cy="92" r="2"/><circle cx="62" cy="86" r="2.4"/><circle cx="74" cy="94" r="2"/></g>`,
  stargazer: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#2c5a78"/><g fill="#fff8d6"><circle cx="34" cy="90" r="1.2"/><circle cx="52" cy="94" r="1.4"/><circle cx="66" cy="88" r="1"/></g>`,
  champion: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#f1e6cc"/><path d="M26 84q24-8 48 0v16H26z" fill="#b5432e"/><circle cx="82" cy="84" r="9" fill="#24201c"/><circle cx="79" cy="81" r="2.5" fill="#fff" opacity=".35"/>`,
  priestess: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#e9dcc0"/><g fill="${JADE}" stroke="${DARK}" stroke-width=".6">${[30, 37, 44, 50, 56, 63, 70].map((x, i) => `<circle cx="${x}" cy="${79 + Math.abs(i - 3) * -1.6 + 5}" r="2.8"/>`).join('')}</g>`,
  serpent: c => `<path d="M14 100c2-20 16-26 36-26s34 6 36 26z" fill="#1f5c47"/><path d="M28 80q22 14 44 0l-3 8q-19 10-38 0z" fill="${GOLD}"/>`,
};

const MOUTHS = {
  thin: '<path d="M44 66.5q6-1.6 12 0" stroke="#3a140c" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  frown: '<path d="M43.5 67.5q6.5-4 13 0" stroke="#3a140c" stroke-width="2" fill="none" stroke-linecap="round"/>',
  smirk: '<path d="M44 67q5 0 12-3.5" stroke="#3a140c" stroke-width="2" fill="none" stroke-linecap="round"/>',
  snarl: '<path d="M42.5 66.5q7.5-5 15 0q-7.5 3.5-15 0z" fill="#2a0a06"/><path d="M44.5 65.6l1.3 2 1.3-2.4 1.4 2.5 1.5-2.6 1.5 2.6 1.4-2.5 1.3 2.4 1.3-2" fill="#fff4dc"/>',
  fangs: '<path d="M42 66q8-5 16 0q-8 4-16 0z" fill="#2a0a06"/><path d="M45 65l1.4 4.5 1.4-4.8zM55 65l-1.4 4.5-1.4-4.8z" fill="#fff4dc"/>',
};

// War paint, drawn over the face (clipped to it).
const PAINT = {
  ink: '<g stroke="#120a08" stroke-width="1.6" stroke-linecap="round" opacity=".85"><path d="M42 53v9M45 53.5v5M58 53v9M55 53.5v5"/></g>',
  jaw: '<g fill="#a3241a" opacity=".9"><path d="M42 66h2.4v8h-2.4zM48.8 68h2.4v8h-2.4zM55.6 66h2.4v8h-2.4z"/></g>',
  dots: '<g fill="#e2b35a"><circle cx="38" cy="58" r="1.3"/><circle cx="41" cy="61" r="1.3"/><circle cx="62" cy="58" r="1.3"/><circle cx="59" cy="61" r="1.3"/></g><path d="M50 40v6" stroke="#a3241a" stroke-width="2.2"/>',
  claw: '<g stroke="#120a08" stroke-width="2" stroke-linecap="round"><path d="M36 54l7 4M35 58l7 3.5M64 54l-7 4M65 58l-7 3.5"/></g>',
  band: '<rect x="30" y="45.5" width="40" height="8" fill="#0b0d14" opacity=".9"/><g fill="#cfe9ff"><circle cx="37" cy="48" r=".7"/><circle cx="63" cy="51" r=".7"/><circle cx="50" cy="47" r=".6"/></g>',
  redband: '<rect x="30" y="45.5" width="40" height="8" fill="#8a1a12" opacity=".92"/>',
  skull: '<path d="M33 52q0-15 17-15t17 15v6q-8 4-17 4t-17-4z" fill="#ece4d6" opacity=".93"/><ellipse cx="44.5" cy="50" rx="5.5" ry="4.5" fill="#0d0705"/><ellipse cx="55.5" cy="50" rx="5.5" ry="4.5" fill="#0d0705"/><path d="M50 53l-1.6 4h3.2z" fill="#0d0705"/>',
  scales: '<g fill="#2b8a6a" opacity=".85"><path d="M36 58q2-3 4 0q-2 2-4 0zM39 62q2-3 4 0q-2 2-4 0zM60 58q2-3 4 0q-2 2-4 0zM57 62q2-3 4 0q-2 2-4 0z"/></g><path d="M34 47h32" stroke="#0b0604" stroke-width="5" opacity=".5"/>',
};

export function portrait(look, color) {
  const id = `pt${++uid}`, { head, skin = '#8f5530', eyes = '#ffcc33', paint = 'jaw', mouth = 'thin' } = look;
  return `<svg viewBox="0 0 100 100" class="portrait" aria-hidden="true">
    <defs>
      <radialGradient id="${id}b" cx=".5" cy="1" r="1"><stop offset="0" stop-color="${color}" stop-opacity=".9"/><stop offset=".55" stop-color="${color}" stop-opacity=".25"/><stop offset="1" stop-color="#0a0605"/></radialGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".45" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="${color}" stop-opacity=".25"/></linearGradient>
      <radialGradient id="${id}e"><stop offset="0" stop-color="${eyes}" stop-opacity=".9"/><stop offset="1" stop-color="${eyes}" stop-opacity="0"/></radialGradient>
      <clipPath id="${id}c"><rect width="100" height="100" rx="26"/></clipPath>
      <clipPath id="${id}h"><ellipse cx="50" cy="52" rx="16" ry="20"/></clipPath>
    </defs>
    <g clip-path="url(#${id}c)">
      <rect width="100" height="100" fill="#0a0605"/><rect width="100" height="100" fill="url(#${id}b)"/>
      ${CLOTH[head]()}<rect y="72" width="100" height="28" fill="#000" opacity=".35"/>
      <rect x="43" y="64" width="14" height="14" fill="${skin}"/><rect x="43" y="64" width="14" height="14" fill="#000" opacity=".45"/>
      <ellipse cx="34" cy="54" rx="3.5" ry="5" fill="${skin}"/><ellipse cx="66" cy="54" rx="3.5" ry="5" fill="${skin}"/>
      <ellipse cx="50" cy="52" rx="16" ry="20" fill="${skin}"/>
      <g clip-path="url(#${id}h)">
        <rect x="30" y="30" width="40" height="44" fill="url(#${id}f)"/>
        <path d="M37 59q4 4 9 3.5M63 59q-4 4-9 3.5" stroke="#000" stroke-opacity=".35" stroke-width="1.6" fill="none"/>
        ${PAINT[paint] || ''}
      </g>
      <path d="M34 47q0-17 16-17t16 17q-6-8-16-8t-16 8z" fill="#0d0805"/>
      <circle cx="33" cy="57" r="3.2" fill="${JADE}" stroke="${DARK}" stroke-width=".8"/>
      <circle cx="67" cy="57" r="3.2" fill="${JADE}" stroke="${DARK}" stroke-width=".8"/>
      ${HEADS[head]()}
      <path d="M36.5 44.5l13 4.2-1 1.6-12.4-3.4zM63.5 44.5l-13 4.2 1 1.6 12.4-3.4z" fill="#0d0805"/>
      <path d="M39 50q5-2.2 10 1.2q-5 1.6-10-1.2zM61 50q-5-2.2-10 1.2q5 1.6 10-1.2z" fill="#0b0503"/>
      <circle cx="44.6" cy="50.6" r="4.5" fill="url(#${id}e)"/><circle cx="55.4" cy="50.6" r="4.5" fill="url(#${id}e)"/>
      <circle cx="44.6" cy="50.6" r="1.25" fill="${eyes}"/><circle cx="55.4" cy="50.6" r="1.25" fill="${eyes}"/>
      <path d="M50 51v7.5q-2.5 2-5 .8" stroke="#000" stroke-opacity=".45" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      ${MOUTHS[mouth]}
    </g>
  </svg>`;
}
