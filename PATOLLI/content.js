// Rivals, rule variants, rules cards, achievements and unlockable looks.

export const DEMO_RIVALS = 2;  // the demo plays rivals [0, DEMO_RIVALS)
export const DEMO_LEVELS = 2;  // and Quick Play levels [0, DEMO_LEVELS)

export const VARIANT_INFO = {
  classic: { name: 'Classic', text: 'Three stones each, six jade beads. Bring every stone home, or break the bank.' },
  stakes: { name: 'High Stakes', text: 'Four beads each, and every capture, skull and homecoming moves two. Short and savage.' },
  long: { name: 'Long Road', text: 'Four stones each and eight beads. A longer race with more room for comebacks.' },
};

// level: an ai.js LEVELS index or a level object. variant: the rules this rival plays (classic unless set).
export const RIVALS = [
  { name: 'The Bean Counter', title: 'First table', color: '#c9b27c', level: 0,
    look: { head: 'scribe', skin: '#9c6440', eyes: '#d8e4ff', paint: 'ink', mouth: 'thin' },
    blurb: 'Counts every bead you lose, out loud.',
    lines: {
      intro: ['Sit. Every bean you throw, I will count. Every bead you lose, I will keep.', 'Your purse looks heavy. Let me fix that.'],
      capture: ['One bead. Noted.', 'Back to your hand. And your bead to mine.'],
      captured: ['A miscount. It will not happen twice.', 'Hm. Write that down as luck.'],
      sun: ['The sun favours the patient.', 'Again. I throw again.'],
      skull: ['The skull takes its share. I take the rest.', 'Pay up.'],
      win: ['Your account is closed.'], lose: ['…The numbers lied. Go on.'] } },
  { name: 'The Market Swindler', title: 'Second table', color: '#9a5b3a', level: { noise: 9, risk: 0.5 },
    look: { head: 'trader', skin: '#8f5530', eyes: '#ffd34d', paint: 'dots', mouth: 'smirk' },
    blurb: 'Every throw is honest. Probably.',
    lines: {
      intro: ['Fair beans, fair mat, fair game. Ha! Sit down.', 'I have sold worse players than you for a sack of cacao.'],
      capture: ['Mine now.', 'A bargain!'],
      captured: ['Thief! …Well played, thief.', 'That will cost you later.'],
      sun: ['Lucky me. Again!', 'The sun owes me money.'],
      skull: ['The skull collects. So do I.', 'Ooh, that hurts your purse.'],
      win: ['A pleasure robbing you.'], lose: ['Fine. Take the table. The debt remains.'] } },
  { name: 'The Masked Gambler', title: 'Third table', color: '#d98a2b', level: 1, variant: 'long',
    look: { head: 'jaguar', skin: '#7d4526', eyes: '#ffcc33', paint: 'claw', mouth: 'snarl' },
    blurb: 'Nobody has seen the face beneath the mask. Nobody who lost.',
    lines: {
      intro: ['The road is long tonight. Long enough to lose everything.', 'You will not see my face. You will see my back as I leave with your jade.'],
      capture: ['Pounced.', 'Back to the start, prey.'],
      captured: ['A scratch.', 'Now I am interested.'],
      sun: ['The sun hunts with me.', 'Again.'],
      skull: ['The skull bites. Good.', 'Bleed, little purse.'],
      win: ['The jungle swallows another one.'], lose: ['You live. Tonight.'] } },
  { name: 'The Feather Duelist', title: 'Fourth table', color: '#b5432e', level: { noise: 3, risk: 0.9 },
    look: { head: 'champion', skin: '#7d4526', eyes: '#ff6a3d', paint: 'redband', mouth: 'snarl' },
    blurb: 'Plays fast, bets big and never looks at the beans.',
    lines: {
      intro: ['I have never lost a throw that mattered. Begin.', 'The crowd came to watch you lose. Do not disappoint them.'],
      capture: ['Struck!', 'Hear the crowd?'],
      captured: ['Lucky bounce.', 'Hah! At last, a duel.'],
      sun: ['The sun loves a showman.', 'Again! The crowd demands it.'],
      skull: ['The skull has chosen you.', 'Pay the skull, then pay me.'],
      win: ['The crowd has its loser.'], lose: ['The table is yours. Do not come back.'] } },
  { name: 'The Debt Collector', title: 'Fifth table', color: '#3e8e6b', level: 2, variant: 'stakes',
    look: { head: 'priestess', skin: '#8f5530', eyes: '#ff3b3b', paint: 'skull', mouth: 'thin' },
    blurb: 'Plays only High Stakes. Collects every debt, with interest.',
    lines: {
      intro: ['Everyone at this court owes me something. Tonight, you will too.', 'High stakes only. Low stakes are for the living.'],
      capture: ['Collected.', 'Two beads. As agreed.'],
      captured: ['…That will be added to your debt.', 'Interest is accruing.'],
      sun: ['Even the sun pays me.', 'Again.'],
      skull: ['The skull and I are old partners.', 'Your debt grows.'],
      win: ['Your debt is paid. With everything.'], lose: ['The ledger is closed. For now.'] } },
  { name: 'The Lord of the Mat', title: 'High table', color: '#e2b35a', level: 2,
    look: { head: 'serpent', skin: '#6e3c22', eyes: '#ffe14d', paint: 'scales', mouth: 'fangs' },
    blurb: 'Owns the court, the mat and most of the city. Wants the rest.',
    lines: {
      intro: ['So. You emptied every purse in my court. Now try mine.', 'Kneel at the mat. No? Then throw.'],
      capture: ['Ssso predictable.', 'Back to your hand. Where you belong.'],
      captured: ['You dare?', 'A scratch. Nothing more.'],
      sun: ['The sun rises for its lord.', 'Again. Of course again.'],
      skull: ['The skull answers to me.', 'Feed the skull.'],
      win: ['Your jade, your stones, your name. All mine.'], lose: ['Then the court is yours… Lord of Fortune.'] } },
];

// How to Play cards: shown with previous/next arrows, then a practice game.
export const RULES = [
  { title: 'Throw the beans', glyph: 'beans',
    text: 'You throw five beans, each marked on one side. Count the marks: that is how far you move. All five marked? Move 10! No marks at all? The gods are silent and your turn passes.' },
  { title: 'Race the cross', glyph: 'cross',
    text: 'Your stones start in your hand. Each throw, move one stone: bring a new one onto your temple square, or move one already on the board. Race once round the whole cross to bring a stone home.' },
  { title: 'Capture', glyph: 'capture',
    text: 'Land exactly on an enemy stone to send it back to their hand, and take a jade bead from them. Stones on the four red temple squares in the middle are safe.' },
  { title: 'Suns and skulls', glyph: 'sunskull',
    text: 'Land on a gold sun at the end of an arm to throw again. Land on a skull and you pay a jade bead to your rival.' },
  { title: 'Win', glyph: 'beads',
    text: 'Bring all your stones home first, or take every last jade bead from your rival. Each stone you bring home also wins you a bead.' },
];

export const ACHIEVEMENTS = [
  { id: 'apprentice', title: 'Apprentice', text: 'Finish the practice game.' },
  { id: 'firstwin', title: 'First Fortune', text: 'Win a match against the computer.' },
  { id: 'ten', title: 'All Five', text: 'Throw all five beans marked.' },
  { id: 'hunter', title: 'Hunter', text: 'Capture three stones in one match.' },
  { id: 'sunrunner', title: 'Sun Runner', text: 'Throw again from a sun three times in one match.' },
  { id: 'untouched', title: 'Untouched', text: 'Win without losing a stone to capture.' },
  { id: 'highroller', title: 'High Roller', text: 'Win a High Stakes match.' },
  { id: 'court', title: 'Lord of Fortune', text: 'Defeat the Lord of the Mat.', full: true },
];

// Mats (the board). unlock: achievement id, or null. Colours: mat weave, track squares, ink.
export const MATS = {
  petate: { name: 'Woven Mat', unlock: null, weave: ['#c9a66b', '#a8834a'], square: '#f1e3c0', ink: '#2a1a0c', temple: '#b5432e', accent: '#e2b35a' },
  plaza: { name: 'Stone Plaza', unlock: 'firstwin', weave: ['#9a958a', '#77736a'], square: '#e6e1d4', ink: '#22201c', temple: '#3b8fa8', accent: '#e2b35a' },
  suncourt: { name: 'Sun Court', unlock: 'sunrunner', weave: ['#d9a441', '#b07a1c'], square: '#fff1c9', ink: '#3a1c06', temple: '#b5432e', accent: '#fff6c0' },
  night: { name: 'Night Court', unlock: 'court', weave: ['#2d3350', '#1a1e33'], square: '#d9dcf0', ink: '#0d0f1c', temple: '#7a4fd0', accent: '#ffd35c' },
};

// Bean sets for throwing: bean colour and mark colour.
export const BEANS = {
  maize: { name: 'Maize Beans', unlock: null, bean: '#f3e6c4', edge: '#b89b62', mark: '#1b120c' },
  jade: { name: 'Jade Beans', unlock: 'apprentice', bean: '#7fd3a8', edge: '#2f7a59', mark: '#0d2a1d' },
  gold: { name: 'Gold Beans', unlock: 'ten', bean: '#f2c94c', edge: '#a8742c', mark: '#3a1c06' },
  bone: { name: 'Bone Dice', unlock: 'hunter', bean: '#f6f1e6', edge: '#c9bfa8', mark: '#a3241a' },
  obsidian: { name: 'Obsidian Beans', unlock: 'untouched', bean: '#3a3a44', edge: '#0b0b10', mark: '#ffd35c' },
  cacao: { name: 'Cacao Beans', unlock: 'highroller', bean: '#8a5a3a', edge: '#4e2a14', mark: '#f6e3c4' },
};
