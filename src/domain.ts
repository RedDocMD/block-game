import * as fs from 'fs';
import { Puzzle } from './parser';

function writeMoveAction(path: string, direction: string) {
  let start: string, end: string, axis: string;
  if (direction === 'left' || direction === 'right') {
    start = 'left';
    end = 'right';
    axis = 'horizontal';
  } else {
    start = 'top';
    end = 'bottom';
    axis = 'vertical';
  }
  let action = 
`(:action move_car_${direction}
  :parameters (?car - car ?from_${start} ?from_${end} ?to_${start} ?to_${end} - square)
  :precondition (forall (?sq - square)
                  (and 
                    (or (not (is_between ?from_${start} ?to_${start} ?sq))
                      (is_clear ?sq)
                    )
                    (is_${axis} ?car)
                    (is_${direction}_of ?to_${start} ?from_${start})
                    (is_${direction}_of ?to_${end} ?from_${end})
                    (not (= ?to_${start} ?from_${start}))
                    (is_${start}most ?car ?from_${start})
                    (is_${end}most ?car ?from_${end})
                    (is_same_distance ?from_${start} ?from_${end} ?to_${start} ?to_${end})
                  )  
                )
  :effect (forall (?sq - square)
            (and   
              (when (not (is_between ?to_${start} ?to_${end} ?sq))
                  (not (is_clear ?sq))
              )
              (when (not (is_between ?from_${start} ?from_${end} ?sq))
                (is_clear ?sq)
              )
              (is_clear ?from_${start})
              (not (is_clear ?to_${start}))
              (not (is_${start}most ?car ?from_${start}))
              (not (is_${end}most ?car ?from_${end}))
              (is_${start}most ?car ?to_${start})     
              (is_${end}most ?car ?to_${end})
            )
          )
)
`;
  fs.writeFileSync(path, action, { flag: 'a' });
}

function writeMoves(path: string) {
  const directions = ['right', 'left', 'top', 'bottom'];

  for (let key in directions) {
    let direction = directions[key];
    writeMoveAction(path, direction);
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
 )
 `;

  fs.writeFileSync(path, predicates, { flag: 'a' });
}

export function writeDomain(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['domain-file'];

  fs.writeFileSync(path, 
`(define (domain ${puzzle.domain_name})
(:requirements :adl :typing :equality)
(:types car square)
`);

  writePredicates(path);  
  writeMoves(path);

  fs.writeFileSync(path, ')\n', { flag: 'a' });
}