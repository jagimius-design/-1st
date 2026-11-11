import { chooseMove } from './ai.js';

self.onmessage = e => {
  const { id, state, level } = e.data;
  self.postMessage({ id, move: chooseMove(state, level) });
};
