import * as fs from 'fs';
import { Puzzle } from './parser';

function writeMoveAction(buffer: string, direction: string, length: number) {
  const actionName = `move-${direction}-${length}`;
  fs.writeFileSync(buffer, `(:action ${actionName}\n`, { flag: 'a' });

  fs.writeFileSync(buffer, ':parameters (?car)\n', { flag: 'a' });

  let precondition = ':precondition (and (is-car ?car)\n';
  if (direction === 'left' || direction === 'right') {
    precondition += '(is-horizontal ?car)\n';
  } else {
    precondition += '(is-vertical ?car)\n';
  }
  precondition += '(forall (?sq1 ?sq2 ?car2) (and ';
  precondition += '(is-car ?car2)\n';
  precondition += '(is-sq ?sq1)\n';
  precondition += '(is-sq ?sq2)\n';
  precondition += '(in-car ?car ?sq1)\n';
  precondition += '(not (in-car ?car2 ?sq2))\n';
  precondition += `(in-${direction}-dist-${length} ?sq1 ?sq2))))\n`;
  fs.writeFileSync(buffer, precondition, { flag: 'a' });

  let effect = ':effect (forall (?sq1 ?sq2) (when (and ';
  effect += '(is-sq ?sq1)\n';
  effect += '(is-sq ?sq2)\n';
  effect += '(in-car ?car ?sq1)\n';
  effect += `(in-${direction}-dist-${length} ?sq1 ?sq2)))\n`;
  effect += '(and ';
  effect += '(not (in-car ?car ?sq1))\n';
  effect += '(in-car ?car ?sq2)))\n';
  fs.writeFileSync(buffer, effect, { flag: 'a' });

  fs.writeFileSync(buffer, ')\n\n', { flag: 'a' });
}

function writeMoves(path: string, puzzle: Puzzle) {
  const directions = ['right', 'left', 'up', 'down'];
  fs.writeFileSync(path, '');

  for (let key in directions) {
    let limit: number;
    let direction = directions[key];
    if (direction === 'left' || direction === 'right') {
      limit = puzzle.columns;
    } else {
      limit = puzzle.rows;
    }
    for (let i = 1; i < limit; i++) {
      writeMoveAction(path, direction, i);
    }
  }
}

export function writeDomain(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['domain-file'];

  writeMoves(path, puzzle);
}