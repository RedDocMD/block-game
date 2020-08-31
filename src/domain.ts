import * as fs from 'fs';
import { Puzzle } from './parser';

function writeMoveAction(path: string, direction: string, length: number) {
  const actionName = `move_${direction}_${length}`;
  fs.writeFileSync(path, `(:action ${actionName}\n`, { flag: 'a' });

  fs.writeFileSync(path, ':parameters (?car)\n', { flag: 'a' });

  let precondition = ':precondition (and (is_car ?car)\n';
  if (direction === 'left' || direction === 'right') {
    precondition += '(is_horizontal ?car)\n';
  } else {
    precondition += '(is_vertical ?car)\n';
  }
  precondition += '(forall (?sq1 ?sq2) (and ';
  precondition += '(is_sq ?sq1)\n';
  precondition += '(is_sq ?sq2)\n';
  precondition += '(in_car ?car ?sq1)\n';
  precondition += '(not (is_occupied ?sq2))\n';
  precondition += `(in_${direction}_dist_${length} ?sq1 ?sq2))))\n`;
  fs.writeFileSync(path, precondition, { flag: 'a' });

  let effect = ':effect (forall (?sq1 ?sq2) (when (and ';
  effect += '(is_sq ?sq1)\n';
  effect += '(is_sq ?sq2)\n';
  effect += '(in_car ?car ?sq1)\n';
  effect += `(in_${direction}_dist_${length} ?sq1 ?sq2))\n`;
  effect += '(and ';
  effect += '(not (is_occupied ?sq1))\n';
  effect += '(is_occupied ?sq2)\n';
  effect += '(not (in_car ?car ?sq1))\n';
  effect += '(in_car ?car ?sq2))))\n';
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

function writePredicates(path: string) {
  const predicates = 
`(:predicates
  (is_horizontal ?car - car)
  (is_vertical ?car - car)
  (is_left_of ?sq1 - square ?sq2 - square)
  (is_right_of ?sq1 - square ?sq2 - square)
  (is_top_of ?sq1 - square ?sq2 - square)
  (is_bottom_of ?sq1 - square ?sq2 - square)
  (is_leftmost ?car - car ?sq - square)
  (is_rightmost ?car - car ?sq - square)
  (is_topmost ?car - car ?sq - square)
  (is_bottommost ?car - car ?sq - square)
  (is_same_distance ?sq1 ?sq2 ?sq3 ?sq4 - square)
  (is_between ?sq_first ?sq_second ?sq - square)
  (is_clear ?sq - square)
 )`;

  fs.writeFileSync(path, predicates, { flag: 'a' });
}

export function writeDomain(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['domain-file'];

  fs.writeFileSync(path, 
`(define (domain ${puzzle.domain_name})
(:requirements :adl :typing)
(:types car square)
`);

  writePredicates(path);  
  fs.writeFileSync(path, ')\n', { flag: 'a' });
}