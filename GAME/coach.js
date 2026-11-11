// Strategy help: goals for the Beginner's Path puzzles and the in-game coach's advice. Pure.
import { QUIET_LIMIT, other, applyMove, attackedBy, legalMoves } from './core.js';

// True when none of `player`'s stones can be captured in this position.
export const safeFor = (state, player) => attackedBy(state.board, other(player)).size === 0;

// goal: 'safe' (leave nothing capturable), 'freeCapture' (capture and leave nothing capturable),
// 'fork' (a safe step that attacks two or more enemy stones).
export function meetsGoal(goal, before, move) {
  const me = before.turn, after = applyMove(before, move), safe = safeFor(after, me);
  if (goal === 'safe') return safe;
  if (goal === 'freeCapture') return move.capture && safe;
  if (goal === 'fork') return !move.capture && safe && attackedBy(after.board, me).size >= 2;
  return false;
}

const GENERAL = [
  'Threats cut both ways: if an enemy stone can reach yours round a loop, yours can reach it the same way. Whoever moves first wins.',
  'Before each move, follow the coloured lines from the point you are moving to. If one leads round a loop to an enemy stone, you are stepping into its range.',
  'Points where a gold and a blue line cross sit on both circuits. A stone there can strike in more directions.',
  'Corners lie on no circuit. A stone there can never be captured, but it cannot capture either.',
  'Your own stones block your lines too. Moving one out of the way can open a capture for another.',
  'Look for a step that attacks two enemy stones at once. They can only save one.',
  'When you are ahead, trade stones: capture even if you lose one back. Fewer stones means an easier win.',
];

// One line of advice for `me`, whose turn it is. `lost` is true when the opponent's last move was a capture.
export function coachTip(state, me, lost = false) {
  const moves = legalMoves(state.board, me);
  const caps = moves.filter(m => m.capture);
  const free = caps.filter(m => safeFor(applyMove(state, m), me));
  const left = QUIET_LIMIT - state.quiet, lead = state.counts[me] - state.counts[other(me)];

  if (free.length) return { kind: 'good', text: 'You can capture a stone without losing one back. Follow the loops!' };
  if (caps.length) return { kind: 'info', text: lead > 0
    ? 'You can capture, but you would lose a stone back. You are ahead, so the trade is fine.'
    : 'You can capture, but you would lose a stone back. Look for a safer move first.' };
  if (!safeFor(state, me)) return { kind: 'warn', text: 'A stone of yours can be captured. Step it off the enemy’s line, or into a corner.' };
  if (lost) return { kind: 'warn', text: 'That stone was left on an open line. Check where each line leads before you move.' };
  if (left <= 12) return { kind: 'info', text: lead > 0 ? `You are ahead. Play safe: ${left} more moves without a capture and you win.`
    : lead < 0 ? `You are behind and have ${left} moves to capture. Go on the attack!`
    : `Even game. ${left} moves without a capture ends it in a draw.` };
  return { kind: 'tip', text: GENERAL[(state.ply >> 2) % GENERAL.length] };
}
