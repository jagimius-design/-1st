// Campaign opponents, tutorial lessons and board themes. `level` is a LEVELS index or a level object.

export const DEMO_OPPONENTS = 3; // the demo plays opponents [0, DEMO_OPPONENTS)
export const DEMO_LEVELS = 3;    // and Quick Play levels [0, DEMO_LEVELS)

export const OPPONENTS = [
  { name: 'The Bone Scribe', title: 'First step', color: '#c9b27c', glyph: 'S', level: 0,
    look: { head: 'scribe', skin: '#9c6440', eyes: '#d8e4ff', paint: 'ink', mouth: 'thin' },
    lines: {
      intro: ['Another name for my codex. Tell me yours, so I can write it among the fallen.', 'I have recorded every challenger who climbed these steps. None of the endings were happy.'],
      capture: ['Noted.', 'One more line in the codex.'],
      lost: ['A blot of ink. It changes nothing.', 'Hmph. Erasable.'],
      win: ['Your name is written. Your climb is over.'],
      lose: ['…I will write this down. In very small letters.'] },
    blurb: 'Writes down the name of every challenger who falls.' },
  { name: 'The Harvester', title: 'Second step', color: '#d9a441', glyph: 'H', level: 1,
    look: { head: 'farmer', skin: '#8a5230', eyes: '#ffb347', paint: 'jaw', mouth: 'frown' },
    lines: {
      intro: ['Every season I cut the field down to the root. This season, it is you.', 'Kneel in the rows, little stalk.'],
      capture: ['Cut.', 'Into the basket.'],
      lost: ['Weeds. They always grow back.', 'A poor harvest. I will take it out on you.'],
      win: ['Reaped.'],
      lose: ['The field is yours… for one season.'] },
    blurb: 'Cuts down whatever grows too tall.' },
  { name: 'The Cacao Broker', title: 'Third step', color: '#9a5b3a', glyph: 'C', level: { depth: 2, noise: 30, quiesce: true },
    look: { head: 'trader', skin: '#8f5530', eyes: '#ffd34d', paint: 'dots', mouth: 'smirk' },
    lines: {
      intro: ['Your stones, your stars, your pride. I buy all of it. Cheap.', 'Everyone who climbs owes me something. Today you pay.'],
      capture: ['Paid in full.', 'Mine now.'],
      lost: ['Put that on your tab. With interest.', 'You will regret that trade.'],
      win: ['A pleasure robbing you.'],
      lose: ['Take the step. The debt remains.'] },
    blurb: 'Buys stones. Sells regrets.' },
  { name: 'The Jaguar Stalker', title: 'Fourth step', color: '#d98a2b', glyph: 'J', level: 2,
    look: { head: 'jaguar', skin: '#7d4526', eyes: '#ffcc33', paint: 'claw', mouth: 'snarl' },
    lines: {
      intro: ['I have been watching you since the first step. You never saw me.', 'Run if you like. I prefer it when they run.'],
      capture: ['Pounced.', 'Too slow.'],
      lost: ['A scratch.', 'Now I am hungry.'],
      win: ['The jungle swallows another one.'],
      lose: ['You live. Tonight.'] },
    blurb: 'Waits in the dark, then strikes from across the board.' },
  { name: 'The Night Seer', title: 'Fifth step', color: '#4fa3b8', glyph: 'N', level: { depth: 3, noise: 6, quiesce: true, time: 1500 },
    look: { head: 'stargazer', skin: '#8f5530', eyes: '#7fe8ff', paint: 'band', mouth: 'thin' },
    lines: {
      intro: ['The stars showed me your defeat three nights ago. Shall we make it true?', 'Venus is rising. It always rises over the fallen.'],
      capture: ['Foretold.', 'The sky turns against you.'],
      lost: ['A passing cloud. The stars still see you.', 'An omen… for you.'],
      win: ['Written in the heavens. Erased from the steps.'],
      lose: ['The stars lied. Someone will pay for that.'] },
    blurb: 'Read your defeat in the stars before you arrived.' },
  { name: 'The Ballcourt Champion', title: 'Sixth step', color: '#b5432e', glyph: 'B', level: 3,
    look: { head: 'champion', skin: '#7d4526', eyes: '#ff6a3d', paint: 'redband', mouth: 'snarl' },
    lines: {
      intro: ['In the old ballgame, the losers paid with more than pride. Begin.', 'The crowd came for a loser. It is never me.'],
      capture: ['Through the ring!', 'Hear the crowd? They roar for me.'],
      lost: ['Lucky bounce.', 'Hah! At last, a fight.'],
      win: ['The crowd has its loser.'],
      lose: ['The court is yours. Do not come back.'] },
    blurb: 'In the old ballgame, losing cost more than pride.' },
  { name: 'The Smoke Priestess', title: 'Seventh step', color: '#3e8e6b', glyph: 'P', level: { depth: 6, noise: 0, quiesce: true, time: 2000 },
    look: { head: 'priestess', skin: '#8f5530', eyes: '#ff3b3b', paint: 'skull', mouth: 'thin' },
    lines: {
      intro: ['I have already seen how this ends. You do not want to know.', 'The smoke whispered your name. It was not kind.'],
      capture: ['Foreseen.', 'The smoke takes it.'],
      lost: ['…That, I did not see.', 'The vision clouds. It will clear.'],
      win: ['As it was written in the smoke.'],
      lose: ['Go to the summit, then. He is waiting for you.'] },
    blurb: 'Sees five moves ahead, and smiles at what she sees.' },
  { name: 'The Serpent King', title: 'Temple summit', color: '#e2b35a', glyph: 'K', level: 4,
    look: { head: 'serpent', skin: '#6e3c22', eyes: '#ffe14d', paint: 'scales', mouth: 'fangs' },
    lines: {
      intro: ['So. You climbed every step. The serpent waits at the top for a reason.', 'Kneel. No? Then fall.'],
      capture: ['Ssso predictable.', 'The serpent strikes.'],
      lost: ['You dare?', 'A scratch. Nothing more.'],
      win: ['Back down the stairs. All of them.'],
      lose: ['Then the summit is yours… Loopmaster.'] },
    blurb: 'Coiled at the top of the pyramid. No one remembers the last time it lost.' },
];

// goal: 'step' (any non-capture), 'capture' (any capture), 'win' (beat the Beginner level)
export const LESSONS = [
  { title: 'Moving', task: 'Move your stone one step.', goal: 'step',
    text: 'Stones move one point in any direction, diagonals included, onto an empty point. Tap your stone, then a glowing dot.',
    layout: ['......', '......', '......', '..x...', '......', '......'] },
  { title: 'Riding the loops', task: 'Capture the obsidian stone.', goal: 'capture',
    text: 'To capture, slide along a coloured line, around at least one loop, and land on an enemy stone. The path must be clear. Capture the obsidian stone!',
    layout: ['......', '...o..', '......', '......', '......', '.x....'] },
  { title: 'No shortcuts', task: 'Capture the obsidian stone.', goal: 'capture',
    text: 'A straight shot does not count: the path must go through a loop. Paths can be long. Find the way round.',
    layout: ['......', '......', 'x...o.', '......', '......', '......'] },
  { title: 'Your first game', task: 'Win the game: capture every obsidian stone.', goal: 'win',
    text: 'Capture every enemy stone to win. If 50 moves pass with no capture, whoever has more stones wins. Corners are safe: no line runs through them.',
    layout: ['......', '.o..o.', '......', '......', '.x..x.', '..x...'] },
];

// Beginner's Path: one strategy tip each, with a puzzle to solve. goal is checked by coach.meetsGoal.
// miss: what to say when the move falls short. quiet presets the no-capture count.
export const DRILLS = [
  { title: 'Look before you step', task: 'Move one stone to a point no obsidian stone can reach.', goal: 'safe',
    text: 'Before you move, follow the coloured lines from the point you are stepping to. If one leads round a loop to an obsidian stone, it can capture you there. Make a move that keeps both stones safe.',
    miss: 'That point is on a line an obsidian stone can reach.',
    layout: ['...x..', '......', '......', 'x.....', '......', '.o...o'] },
  { title: 'Strike first', task: 'Capture the stone that threatens you.', goal: 'freeCapture',
    text: 'Threats cut both ways: if an enemy can reach your stone round a loop, your stone can reach it back along the same path. One of your stones is under attack, and it is your move. Strike first!',
    miss: 'Your stone was still under attack. When a threat is mutual, take the attacker before it takes you.',
    layout: ['.x...o', '......', '......', '......', '....x.', '.o....'] },
  { title: 'Free stones', task: 'Make the capture that cannot be taken back.', goal: 'freeCapture',
    text: 'Two captures are possible here, but only one is free. After the other, an obsidian stone can take yours straight back. Find the capture that loses nothing.',
    miss: 'After that move, one of your stones could be captured back.' ,
    layout: ['......', '.x..x.', '......', '....o.', '......', '.o..o.'] },
  { title: 'Poisoned stones', task: 'Make a safe move without capturing.', goal: 'safe',
    text: 'Not every capture is a good idea. The only capture here walks into a trap. Make a quiet move that keeps every stone safe instead.',
    miss: 'Your stone could be captured right back.',
    layout: ['......', '.x...o', '......', '......', 'x.o...', '......'] },
  { title: 'Double attack', task: 'Step a stone so it attacks two obsidian stones at once.', goal: 'fork',
    text: 'Most points sit on two lines, so a stone can aim two ways at once. Find the safe step that attacks two obsidian stones together: they can only save one.',
    miss: 'Look for a step that threatens two stones at once and stays safe.',
    layout: ['...o.x', '......', '......', 'o.....', '....x.', '......'] },
  { title: 'Corners are safe', task: 'Find the one move that leaves no stone exposed.', goal: 'safe',
    text: 'No line runs through the four corners, so a stone there can never be captured. Every move here leaves a stone exposed, except one.',
    miss: 'That leaves a stone where an obsidian stone can reach it. Which point is out of reach of every line?',
    layout: ['o.....', '......', '......', '..o...', '....xx', '....x.'] },
  { title: 'Play the clock', task: 'Make a move that keeps every stone safe.', goal: 'safe', quiet: 44,
    text: 'You lead 3 to 2, and 44 moves have passed without a capture. At 50, the side with more stones wins. When you are ahead, play safe and let the count run out.',
    miss: 'Never give stones away when you are ahead and the count is running out.',
    layout: ['x..x..', '....o.', '......', '.....x', '....o.', '......'] },
];

// Boards. unlock: the achievement that unlocks it (null = always open).
export const THEMES = {
  temple: { name: 'Limestone', unlock: null,
    board: ['#d8c79f', '#ae9468'], speck: ['#8a7550', '#f3e7c8'], groove: 'rgba(70,48,22,.55)', ridge: 'rgba(255,248,226,.5)',
    frame: '#8f7650', inner: '#3f9a72', outer: '#3b8fa8', mark: '#fff6dc', danger: '#c8361f' },
  jungle: { name: 'Jungle', unlock: 'victory',
    board: ['#7d8a62', '#4e5d3d'], speck: ['#2f3a24', '#b7c49a'], groove: 'rgba(20,28,12,.6)', ridge: 'rgba(220,235,190,.3)',
    frame: '#3a4a2c', inner: '#e0b84a', outer: '#c8573a', mark: '#fff6dc', danger: '#ff6a3d' },
  cenote: { name: 'Sacred Cenote', unlock: 'halfway',
    board: ['#5f9c96', '#2f6466'], speck: ['#163a3c', '#bfe6dc'], groove: 'rgba(0,30,30,.55)', ridge: 'rgba(210,255,245,.3)',
    frame: '#1f4a4c', inner: '#f2d16b', outer: '#e8f4ef', mark: '#ffffff', danger: '#ff6a5c' },
  venus: { name: 'Night of Venus', unlock: 'stars18',
    board: ['#323850', '#1b1f31'], speck: ['#0d1020', '#7f88b8'], groove: 'rgba(0,0,10,.6)', ridge: 'rgba(160,180,255,.18)',
    frame: '#141829', inner: '#9fd3ee', outer: '#e7b85c', mark: '#ffffff', danger: '#ff5c7a' },
  cinnabar: { name: 'Cinnabar', unlock: 'summit',
    board: ['#bf6a45', '#8a3a24'], speck: ['#5a1f10', '#f0b08a'], groove: 'rgba(50,10,0,.55)', ridge: 'rgba(255,215,190,.35)',
    frame: '#5e2416', inner: '#62c79a', outer: '#5ec2dd', mark: '#fff2e0', danger: '#ffe14d' },
  altar: { name: 'Obsidian Altar', unlock: 'perfect',
    board: ['#2a2626', '#0e0c0c'], speck: ['#000000', '#6a5a5a'], groove: 'rgba(0,0,0,.7)', ridge: 'rgba(255,200,170,.14)',
    frame: '#3a0f0a', inner: '#d9342b', outer: '#e2b35a', mark: '#ffe8d0', danger: '#ff3b2f' },
};

// Stone sets: n1/n2 name each side; p1/p2 are [highlight, body, shadow] and a surface finish per side.
// finish: mottle (veined stone), glass (conchoidal ripples), sun, moon, seam (bean), rubber, glow.
export const STONES = {
  jade: { name: 'Jade & Obsidian', n1: 'Jade', n2: 'Obsidian', unlock: null,
    p1: ['#b8f0cf', '#3f9a6c', '#123e2b'], f1: 'mottle', p2: ['#6b6b78', '#17161c', '#000000'], f2: 'glass' },
  turquoise: { name: 'Turquoise & Basalt', n1: 'Turquoise', n2: 'Basalt', unlock: 'tutorial',
    p1: ['#d9fff8', '#3fc1c0', '#0e5157'], f1: 'mottle', p2: ['#8a7b74', '#3b302c', '#120d0b'], f2: 'mottle' },
  cacao: { name: 'Cacao Beans', n1: 'Cream bean', n2: 'Dark bean', unlock: 'student',
    p1: ['#f6e3c4', '#c99a64', '#6a4220'], f1: 'seam', p2: ['#b07a55', '#5a2f18', '#1e0d05'], f2: 'seam' },
  sunmoon: { name: 'Sun & Moon', n1: 'Sun', n2: 'Moon', unlock: 'longway',
    p1: ['#fff3b0', '#e8b13a', '#8a5a10'], f1: 'sun', p2: ['#f2f4ff', '#9aa3c4', '#3b4260'], f2: 'moon' },
  gold: { name: 'Gold & Onyx', n1: 'Gold', n2: 'Onyx', unlock: 'untouchable',
    p1: ['#fff6cf', '#d9a632', '#6e4a0a'], f1: 'glass', p2: ['#5a5a5a', '#141414', '#000000'], f2: 'glass' },
  ballgame: { name: 'Ballgame Rubber', n1: 'Pale ball', n2: 'Black ball', unlock: 'ballcourt',
    p1: ['#f0d9a8', '#b98b4e', '#5a3a1a'], f1: 'rubber', p2: ['#5a4a40', '#211913', '#050302'], f2: 'rubber' },
  ember: { name: 'Fire & Ash', n1: 'Fire', n2: 'Ash', unlock: 'master',
    p1: ['#fff1a8', '#ff7a1a', '#7a1500'], f1: 'glow', p2: ['#b8b2ab', '#55504c', '#1a1817'], f2: 'mottle' },
};

// full: needs content that only the full game has (later Temple steps, Hard and Master levels).
export const ACHIEVEMENTS = [
  { id: 'tutorial', title: 'First Steps', text: 'Finish the How to Play lessons.' },
  { id: 'student', title: 'Student of the Loops', text: 'Solve all seven Beginner’s Path puzzles.' },
  { id: 'victory', title: 'First Blood', text: 'Win a game against the computer.' },
  { id: 'longway', title: 'The Long Way Round', text: 'Capture with a stone that rides three or more loops.' },
  { id: 'untouchable', title: 'Untouchable', text: 'Win against the computer with 10 or more stones left.' },
  { id: 'halfway', title: 'Jaguar Hunter', text: 'Defeat the Jaguar Stalker, the fourth step.', full: true },
  { id: 'ballcourt', title: 'Ballcourt Glory', text: 'Defeat the Ballcourt Champion, the sixth step.', full: true },
  { id: 'summit', title: 'The Summit', text: 'Defeat the Serpent King at the top of the pyramid.', full: true },
  { id: 'stars18', title: 'Star Collector', text: 'Earn 18 stars on the Temple Ascent.', full: true },
  { id: 'perfect', title: 'Perfect Climb', text: 'Earn three stars on every step.', full: true },
  { id: 'master', title: 'Master Slayer', text: 'Beat the Master level in Quick Play.', full: true },
];
