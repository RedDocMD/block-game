import * as fs from 'fs';
import { Puzzle } from './parser';

function writeMoveAction(path: string, direction: string, length: number) {
  const actionName = `move-${direction}-${length}`;
  fs.writeFileSync(path, `(:action ${actionName}\n`, { flag: 'a' });

  fs.writeFileSync(path, ':parameters (?car)\n', { flag: 'a' });

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
  fs.writeFileSync(path, precondition, { flag: 'a' });

  let effect = ':effect (forall (?sq1 ?sq2) (when (and ';
  effect += '(is-sq ?sq1)\n';
  effect += '(is-sq ?sq2)\n';
  effect += '(in-car ?car ?sq1)\n';
  effect += `(in-${direction}-dist-${length} ?sq1 ?sq2)))\n`;
  effect += '(and ';
  effect += '(not (in-car ?car ?sq1))\n';
  effect += '(in-car ?car ?sq2)))\n';
  fs.writeFileSync(path, effect, { flag: 'a' });

  fs.writeFileSync(path, ')\n\n', { flag: 'a' });
}

function writeMoves(path: string, puzzle: Puzzle) {
  const directions = ['right', 'left', 'up', 'down'];

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

function writePredicates(path: string, puzzle: Puzzle) {

}

export function writeDomain(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['domain-file'];

  fs.writeFileSync(path, '(define (domain BLOCK_PUZZLE)\n(:requirements :adl)\n');

  writeMoves(path, puzzle);
  writePredicates(path, puzzle);

  fs.writeFileSync(path, ')\n', { flag: 'a' });
}