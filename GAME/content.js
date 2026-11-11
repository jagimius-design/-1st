// Campaign opponents, tutorial lessons and board themes. `level` is a LEVELS index or a level object.

export const DEMO_OPPONENTS = 3; // the demo plays opponents [0, DEMO_OPPONENTS)
export const DEMO_LEVELS = 3;    // and Quick Play levels [0, DEMO_LEVELS)

export const OPPONENTS = [
  { name: 'Pip', title: 'The Curious Pebble', color: '#9bc53d', level: 0,
    blurb: 'Pip learned the rules this morning. Mostly.' },
  { name: 'Moss', title: 'Gardener of Stones', color: '#5fa36a', level: 1,
    blurb: 'Patient, kind, and occasionally sneaky.' },
  { name: 'Juniper', title: 'Riverside Hustler', color: '#3fa7c4', level: { depth: 2, noise: 30, quiesce: true },
    blurb: 'Will take any stone you leave lying around.' },
  { name: 'Corvin', title: 'The Patient Crow', color: '#6c7ae0', level: 2,
    blurb: 'Waits for you to blink, then strikes from across the board.' },
  { name: 'Sable', title: 'Loop Tactician', color: '#a26bd6', level: { depth: 3, noise: 6, quiesce: true, time: 1500 },
    blurb: 'Sees every loop. Every single one.' },
  { name: 'Orrin', title: 'Keeper of Circuits', color: '#d65a8a', level: 3,
    blurb: 'Has never once left a stone unprotected.' },
  { name: 'Vesper', title: 'The Night Weaver', color: '#e07a3f', level: { depth: 6, noise: 0, quiesce: true, time: 2000 },
    blurb: 'Plans five moves ahead and smiles about it.' },
  { name: 'The Loopmaster', title: 'Final Challenge', color: '#f2c14e', level: 4,
    blurb: 'No one remembers the last time it lost.' },
];

// goal: 'step' (any non-capture), 'capture' (any capture), 'win' (beat the Beginner level)
export const LESSONS = [
  { title: 'Moving', goal: 'step',
    text: 'Stones move one point in any direction, diagonals included, onto an empty point. Tap your stone, then a glowing dot.',
    layout: ['......', '......', '......', '..x...', '......', '......'] },
  { title: 'Riding the loops', goal: 'capture',
    text: 'To capture, slide along a coloured line, around at least one loop, and land on an enemy stone. The path must be clear. Capture the dark stone!',
    layout: ['......', '...o..', '......', '......', '......', '.x....'] },
  { title: 'No shortcuts', goal: 'capture',
    text: 'A straight shot does not count: the path must go through a loop. Paths can be long. Find the way round.',
    layout: ['......', '......', 'x...o.', '......', '......', '......'] },
  { title: 'Your first game', goal: 'win',
    text: 'Capture every enemy stone to win. If 50 moves pass with no capture, whoever has more stones wins. Corners are safe: no line runs through them.',
    layout: ['......', '.o..o.', '......', '......', '.x..x.', '..x...'] },
];

// unlock: index of the opponent whose defeat unlocks the theme (null = always open)
export const THEMES = {
  teak: { name: 'Teak', unlock: null, demo: true,
    bg: ['#3a2618', '#20140c'], board: ['#d7a46a', '#b47a43'], grid: 'rgba(60,32,12,.5)',
    inner: '#f4c64e', outer: '#2fa39b', p1: ['#fffaf0', '#e8dcc4', '#a8977a'], p2: ['#5a5a66', '#26262e', '#0b0b10'],
    mark: '#ffffff', danger: '#ff4d4d' },
  jade: { name: 'Jade', unlock: 2, demo: true,
    bg: ['#173a30', '#0b1d18'], board: ['#3f8a6f', '#2b6550'], grid: 'rgba(0,30,20,.5)',
    inner: '#f1e3b0', outer: '#9fe2c8', p1: ['#ffffff', '#dfe8e4', '#93a8a0'], p2: ['#c04848', '#7d1f22', '#3c0b0e'],
    mark: '#fff8d6', danger: '#ffb347' },
  midnight: { name: 'Midnight', unlock: 5, demo: false,
    bg: ['#141a33', '#070912'], board: ['#26305a', '#1a2142'], grid: 'rgba(140,160,255,.25)',
    inner: '#ffb35c', outer: '#62d0ff', p1: ['#ffffff', '#cfd8f0', '#7f8cb0'], p2: ['#b07cff', '#5b2fb0', '#260f55'],
    mark: '#ffffff', danger: '#ff5c8a' },
  sandstone: { name: 'Sandstone', unlock: 7, demo: false,
    bg: ['#4a2e22', '#25150f'], board: ['#e9c99a', '#cfa774'], grid: 'rgba(90,50,20,.45)',
    inner: '#a8322d', outer: '#2c4f6b', p1: ['#fffdf6', '#efe4cc', '#b7a17a'], p2: ['#3c5a7a', '#1c3047', '#08121e'],
    mark: '#3a1c0c', danger: '#d62828' },
};
