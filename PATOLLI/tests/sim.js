// Plays one game between two computer levels. Used by tests and balance checks.
import { P1, newGame, throwBeans, applyThrow, applyMove, winner } from '../core.js';
import { chooseMove } from '../ai.js';

export function play(l1, l2, variant = 'classic') {
  let s = newGame(variant), turns = 0;
  while (s.phase !== 'over' && turns < 3000) {
    s = applyThrow(s, throwBeans()).state;
    if (s.phase === 'move') s = applyMove(s, chooseMove(s, s.turn === P1 ? l1 : l2)).state;
    turns++;
  }
  return { ...winner(s), turns };
}
