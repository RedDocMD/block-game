import * as fs from 'fs';
import { Puzzle, Car, Orientation } from './parser';

function writeObjects(path: string, puzzle: Puzzle) {
  let objects = '';
  for (let i = 1; i <= puzzle.cars.length; i++) {
    objects += `car_${i}\n`;
  }
  for (let i = 1; i <= puzzle.rows; i++) {
    for (let j = 1; j <= puzzle.columns; j++) {
      objects += `sq_${i}_${j}\n`;
    }
  }

  fs.writeFileSync(path, `(:objects\n${objects}\n)\n\n`, { flag: 'a' });
}

function isInCar(car: Car, i: number, j: number): boolean {
  if (car.orientation == Orientation.VERTICAL) { 
    return i >= car.startY && (i < car.startY + car.length) && j == car.startX;
  } else {
    return j >= car.startX && (j < car.startX + car.length) && i == car.startY;
  }
}

function writeInit(path: string, puzzle: Puzzle) {
  let init = '';
  for (let i = 1; i <= puzzle.cars.length; i++) {
    init += `(is_car car_${i})\n`;
  }
  for (let i = 1; i <= puzzle.rows; i++) {
    for (let j = 1; j <= puzzle.columns; j++) {
      init += `(is_sq sq_${i}_${j})\n`;
    }
  }
  for (let id = 0; id < puzzle.cars.length; id++) {
    const car = puzzle.cars[id];
    if (car.orientation == Orientation.HORIZONTAL) {
      init += `(is_horizontal car_${id + 1})\n`;
      init += `(not (is_vertical car_${id + 1}))\n`;
    } else {
      init += `(not (is_horizontal car_${id + 1}))\n`;
      init += `(is_vertical car_${id + 1})\n`;
    }
  }
  for (let id = 0; id < puzzle.cars.length; id++) {
    const car = puzzle.cars[id];
    for (let i = 1; i <= puzzle.rows; i++) {
      for (let j = 1; j <= puzzle.columns; j++) {
        if (isInCar(car, i, j)) {
          init += `(in_car car_${id + 1} sq_${i}_${j})\n`
        } else {
          init += `(not (in_car car_${id + 1} sq_${i}_${j}))\n`
        }
      }
    }
  }
  const directions = ['right', 'left', 'up', 'down'];

  for (let key in directions) {
    let direction = directions[key];
    if (direction === 'right') {
      for (let dist = 1; dist < puzzle.columns; dist++) {
        for (let outer = 1; outer <= puzzle.rows; outer++) {
          for (let innerFirst = 1; innerFirst <= puzzle.columns; innerFirst++) {
            for (let innerSecond = 1; innerSecond <= puzzle.columns; innerSecond++) {
              if (innerSecond - innerFirst == dist) {
                init += `(in_${direction}_dist_${dist} sq_${outer}_${innerFirst} sq_${outer}_${innerSecond})\n`;
              } else {
                init += `(not (in_${direction}_dist_${dist} sq_${outer}_${innerFirst} sq_${outer}_${innerSecond}))\n`;
              }
            }
          }
        }
      }
    } else if (direction === 'left') {
      for (let dist = 1; dist < puzzle.columns; dist++) {
        for (let outer = 1; outer <= puzzle.rows; outer++) {
          for (let innerFirst = 1; innerFirst <= puzzle.columns; innerFirst++) {
            for (let innerSecond = 1; innerSecond <= puzzle.columns; innerSecond++) {
              if (innerFirst - innerSecond == dist) {
                init += `(in_${direction}_dist_${dist} sq_${outer}_${innerFirst} sq_${outer}_${innerSecond})\n`;
              } else {
                init += `(not (in_${direction}_dist_${dist} sq_${outer}_${innerFirst} sq_${outer}_${innerSecond}))\n`;
              }
            }
          }
        }
      }
    } else if (direction === 'down') {
      for (let dist = 1; dist < puzzle.rows; dist++) {
        for (let outer = 1; outer <= puzzle.columns; outer++) {
          for (let innerFirst = 1; innerFirst <= puzzle.rows; innerFirst++) {
            for (let innerSecond = 1; innerSecond <= puzzle.rows; innerSecond++) {
              if (innerSecond - innerFirst == dist) {
                init += `(in_${direction}_dist_${dist} sq_${innerFirst}_${outer} sq_${innerSecond}_${outer})\n`;
              } else {
                init += `(not (in_${direction}_dist_${dist} sq_${innerFirst}_${outer} sq_${innerSecond}_${outer}))\n`;
              }
            }
          }
        }
      }
    } else if (direction === 'up') {
      for (let dist = 1; dist < puzzle.rows; dist++) {
        for (let outer = 1; outer <= puzzle.columns; outer++) {
          for (let innerFirst = 1; innerFirst <= puzzle.rows; innerFirst++) {
            for (let innerSecond = 1; innerSecond <= puzzle.rows; innerSecond++) {
              if (innerFirst - innerSecond == dist) {
                init += `(in_${direction}_dist_${dist} sq_${innerFirst}_${outer} sq_${innerSecond}_${outer})\n`;
              } else {
                init += `(not (in_${direction}_dist_${dist} sq_${innerFirst}_${outer} sq_${innerSecond}_${outer}))\n`;
              }
            }
          }
        }
      }
    }
  }
  fs.writeFileSync(path, `(:init ${init})\n`, { flag: 'a' });
}

function writeGoal(path: string, puzzle: Puzzle) {
  let goal = `(:goal (in_car car_1 sq_${puzzle.exit[1]}_${puzzle.exit[0]}))\n`;
  fs.writeFileSync(path, goal, { flag: 'a' });
}

export function writeProblem(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['problem-file'];

  fs.writeFileSync(path, `(define (problem ${puzzle.problem_name})\n(:domain ${puzzle.domain_name})\n`);

  writeObjects(path, puzzle);
  writeInit(path, puzzle);
  writeGoal(path, puzzle);

  fs.writeFileSync(path, `)\n`, { flag: 'a' });
}