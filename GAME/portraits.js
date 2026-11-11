// Character portraits for the Temple Ascent rivals, drawn as SVG busts in a flat, carved style.
// portrait(look, color) returns markup; `look` comes from the opponent's entry in content.js.

let uid = 0;
const DARK = '#1b120c', JADE = '#3f9a72', GOLD = '#e2b35a';

const BROWS = {
  kind: 'M39 44q5-3 10-1M51 43q5-2 10 1',
  stern: 'M39 42l10 3M61 42l-10 3',
  calm: 'M39 44h10M51 44h10',
  sly: 'M39 43q5-2 10 0M51 45q5-4 10-3',
};
const MOUTHS = {
  smile: 'M44 64q6 5 12 0',
  flat: 'M45 65h10',
  smirk: 'M44 65q7 2 12-3',
  grin: 'M43 63q7 7 14 0z',
};

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

export function portrait(look, color) {
  const id = `pt${++uid}`, { head, skin = '#a8693f', brows = 'kind', mouth = 'smile', paint = false } = look;
  const shade = 'rgba(60,30,10,.35)';
  return `<svg viewBox="0 0 100 100" class="portrait" aria-hidden="true">
    <defs><radialGradient id="${id}" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <clipPath id="${id}c"><rect width="100" height="100" rx="26"/></clipPath></defs>
    <g clip-path="url(#${id}c)">
      <rect width="100" height="100" fill="${color}"/><rect width="100" height="100" fill="url(#${id})"/>
      ${CLOTH[head]()}
      <rect x="43" y="64" width="14" height="14" fill="${skin}"/><rect x="43" y="64" width="14" height="14" fill="${shade}"/>
      <ellipse cx="34" cy="54" rx="3.5" ry="5" fill="${skin}"/><ellipse cx="66" cy="54" rx="3.5" ry="5" fill="${skin}"/>
      <ellipse cx="50" cy="52" rx="16" ry="20" fill="${skin}"/>
      <path d="M34 47q0-17 16-17t16 17q-6-8-16-8t-16 8z" fill="${DARK}"/>
      <circle cx="33" cy="57" r="3.2" fill="${JADE}" stroke="${DARK}" stroke-width=".8"/>
      <circle cx="67" cy="57" r="3.2" fill="${JADE}" stroke="${DARK}" stroke-width=".8"/>
      ${HEADS[head]()}
      <path d="${BROWS[brows]}" stroke="${DARK}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M41 50q4-3 8 0q-4 2-8 0zM51 50q4-3 8 0q-4 2-8 0z" fill="${DARK}"/>
      <path d="M50 51v7q-2 2-4 1" stroke="${shade}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${paint ? `<g fill="#b5432e"><circle cx="40" cy="58" r="1.3"/><circle cx="37" cy="61" r="1.3"/><circle cx="60" cy="58" r="1.3"/><circle cx="63" cy="61" r="1.3"/></g>` : ''}
      <path d="${MOUTHS[mouth]}" stroke="#5a2a1a" stroke-width="1.8" fill="${mouth === 'grin' ? '#fff6e0' : 'none'}" stroke-linecap="round"/>
    </g>
  </svg>`;
}
