// Campaign opponents, tutorial lessons and board themes. `level` is a LEVELS index or a level object.

export const DEMO_OPPONENTS = 3; // the demo plays opponents [0, DEMO_OPPONENTS)
export const DEMO_LEVELS = 3;    // and Quick Play levels [0, DEMO_LEVELS)

export const OPPONENTS = [
  { name: 'The Novice Scribe', title: 'First step', color: '#c9b27c', glyph: 'S', level: 0,
    blurb: 'Still learning to count the steps of the pyramid.' },
  { name: 'The Maize Farmer', title: 'Second step', color: '#d9a441', glyph: 'M', level: 1,
    blurb: 'Patient as the growing season, and just as slow.' },
  { name: 'The Cacao Trader', title: 'Third step', color: '#9a5b3a', glyph: 'C', level: { depth: 2, noise: 30, quiesce: true },
    blurb: 'Will take any stone you leave lying around.' },
  { name: 'The Jaguar Scout', title: 'Fourth step', color: '#d98a2b', glyph: 'J', level: 2,
    blurb: 'Waits in the shadows, then strikes from across the board.' },
  { name: 'The Stargazer', title: 'Fifth step', color: '#4fa3b8', glyph: 'V', level: { depth: 3, noise: 6, quiesce: true, time: 1500 },
    blurb: 'Reads every loop like the path of Venus across the sky.' },
  { name: 'The Ballcourt Champion', title: 'Sixth step', color: '#b5432e', glyph: 'B', level: 3,
    blurb: 'Has never once left a stone unprotected.' },
  { name: 'The High Priestess', title: 'Seventh step', color: '#3e8e6b', glyph: 'P', level: { depth: 6, noise: 0, quiesce: true, time: 2000 },
    blurb: 'Sees five moves ahead and smiles about it.' },
  { name: 'The Serpent King', title: 'Temple summit', color: '#e2b35a', glyph: 'K', level: 4,
    blurb: 'Coiled at the top of the pyramid. No one remembers the last time it lost.' },
];

// goal: 'step' (any non-capture), 'capture' (any capture), 'win' (beat the Beginner level)
export const LESSONS = [
  { title: 'Moving', goal: 'step',
    text: 'Stones move one point in any direction, diagonals included, onto an empty point. Tap your stone, then a glowing dot.',
    layout: ['......', '......', '......', '..x...', '......', '......'] },
  { title: 'Riding the loops', goal: 'capture',
    text: 'To capture, slide along a coloured line, around at least one loop, and land on an enemy stone. The path must be clear. Capture the obsidian stone!',
    layout: ['......', '...o..', '......', '......', '......', '.x....'] },
  { title: 'No shortcuts', goal: 'capture',
    text: 'A straight shot does not count: the path must go through a loop. Paths can be long. Find the way round.',
    layout: ['......', '......', 'x...o.', '......', '......', '......'] },
  { title: 'Your first game', goal: 'win',
    text: 'Capture every enemy stone to win. If 50 moves pass with no capture, whoever has more stones wins. Corners are safe: no line runs through them.',
    layout: ['......', '.o..o.', '......', '......', '.x..x.', '..x...'] },
];

// Beginner's Path: one strategy tip each, with a puzzle to solve. goal is checked by coach.meetsGoal.
// miss: what to say when the move falls short. quiet presets the no-capture count.
export const DRILLS = [
  { title: 'Look before you step', goal: 'safe',
    text: 'Before you move, follow the coloured lines from the point you are stepping to. If one leads round a loop to an obsidian stone, it can capture you there. Make a move that keeps both stones safe.',
    miss: 'That point is on a line an obsidian stone can reach.',
    layout: ['...x..', '......', '......', 'x.....', '......', '.o...o'] },
  { title: 'Strike first', goal: 'freeCapture',
    text: 'Threats cut both ways: if an enemy can reach your stone round a loop, your stone can reach it back along the same path. One of your stones is under attack, and it is your move. Strike first!',
    miss: 'Your stone was still under attack. When a threat is mutual, take the attacker before it takes you.',
    layout: ['.x...o', '......', '......', '......', '....x.', '.o....'] },
  { title: 'Free stones', goal: 'freeCapture',
    text: 'Two captures are possible here, but only one is free. After the other, an obsidian stone can take yours straight back. Find the capture that loses nothing.',
    miss: 'After that move, one of your stones could be captured back.' ,
    layout: ['......', '.x..x.', '......', '....o.', '......', '.o..o.'] },
  { title: 'Poisoned stones', goal: 'safe',
    text: 'Not every capture is a good idea. The only capture here walks into a trap. Make a quiet move that keeps every stone safe instead.',
    miss: 'Your stone could be captured right back.',
    layout: ['......', '.x...o', '......', '......', 'x.o...', '......'] },
  { title: 'Double attack', goal: 'fork',
    text: 'Most points sit on two lines, so a stone can aim two ways at once. Find the safe step that attacks two obsidian stones together: they can only save one.',
    miss: 'Look for a step that threatens two stones at once and stays safe.',
    layout: ['...o.x', '......', '......', 'o.....', '....x.', '......'] },
  { title: 'Corners are safe', goal: 'safe',
    text: 'No line runs through the four corners, so a stone there can never be captured. Every move here leaves a stone exposed, except one.',
    miss: 'That leaves a stone where an obsidian stone can reach it. Which point is out of reach of every line?',
    layout: ['o.....', '......', '......', '..o...', '....xx', '....x.'] },
  { title: 'Play the clock', goal: 'safe', quiet: 44,
    text: 'You lead 3 to 2, and 44 moves have passed without a capture. At 50, the side with more stones wins. When you are ahead, play safe and let the count run out.',
    miss: 'Never give stones away when you are ahead and the count is running out.',
    layout: ['x..x..', '....o.', '......', '.....x', '....o.', '......'] },
];

// unlock: index of the opponent whose defeat unlocks the theme (null = always open).
// p1 is jade, p2 obsidian: [highlight, body, shadow]. groove/ridge colour the carved lines.
export const THEMES = {
  temple: { name: 'Limestone', unlock: null, demo: true,
    board: ['#d8c79f', '#ae9468'], speck: ['#8a7550', '#f3e7c8'], groove: 'rgba(70,48,22,.55)', ridge: 'rgba(255,248,226,.5)',
    frame: '#8f7650', inner: '#3f9a72', outer: '#3b8fa8',
    p1: ['#b8f0cf', '#3f9a6c', '#123e2b'], p2: ['#6b6b78', '#17161c', '#000000'],
    mark: '#fff6dc', danger: '#c8361f' },
  jungle: { name: 'Jungle', unlock: 2, demo: true,
    board: ['#7d8a62', '#4e5d3d'], speck: ['#2f3a24', '#b7c49a'], groove: 'rgba(20,28,12,.6)', ridge: 'rgba(220,235,190,.3)',
    frame: '#3a4a2c', inner: '#e0b84a', outer: '#c8573a',
    p1: ['#d4ffe6', '#4cbc86', '#0f4a32'], p2: ['#6b6b78', '#17161c', '#000000'],
    mark: '#fff6dc', danger: '#ff6a3d' },
  venus: { name: 'Night of Venus', unlock: 5, demo: false,
    board: ['#323850', '#1b1f31'], speck: ['#0d1020', '#7f88b8'], groove: 'rgba(0,0,10,.6)', ridge: 'rgba(160,180,255,.18)',
    frame: '#141829', inner: '#9fd3ee', outer: '#e7b85c',
    p1: ['#c8fff0', '#45c6a0', '#0b4a3c'], p2: ['#8a78b8', '#1c1630', '#000000'],
    mark: '#ffffff', danger: '#ff5c7a' },
  cinnabar: { name: 'Cinnabar', unlock: 7, demo: false,
    board: ['#bf6a45', '#8a3a24'], speck: ['#5a1f10', '#f0b08a'], groove: 'rgba(50,10,0,.55)', ridge: 'rgba(255,215,190,.35)',
    frame: '#5e2416', inner: '#62c79a', outer: '#5ec2dd',
    p1: ['#c8ffe0', '#3fae78', '#0e4430'], p2: ['#6b6b78', '#17161c', '#000000'],
    mark: '#fff2e0', danger: '#ffe14d' },
};
