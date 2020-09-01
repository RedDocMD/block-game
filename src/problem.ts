import * as fs from 'fs';
import { Puzzle, Car, Orientation } from './parser';

function writeObjects(path: string, puzzle: Puzzle) {
  let objects = '';
  for (let i = 1; i <= puzzle.cars.length; i++) {
    objects += `car_${i} `;
  }
  objects += `- car\n`;
  for (let i = 1; i <= puzzle.rows; i++) {
    for (let j = 1; j <= puzzle.columns; j++) {
      objects += `sq_${i}_${j} `;
    }
  }
  objects += `- square\n`

  fs.writeFileSync(path, `(:objects\n${objects})\n\n`, { flag: 'a' });
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
  for (let id = 0; id < puzzle.cars.length; id++) {
    const car = puzzle.cars[id];
    if (car.orientation == Orientation.HORIZONTAL) {
      init += `(is_horizontal car_${id + 1})\n`;
    } else {
      init += `(is_vertical car_${id + 1})\n`;
    }
  }
  for (let i = 1; i <= puzzle.rows; i++) {
    for (let first = 1; first <= puzzle.columns; first++) {
      for (let second = first + 1; second <= puzzle.columns; second++) {
        init += `(is_left_of sq_${i}_${first} sq_${i}_${second})\n`;
        init += `(is_right_of sq_${i}_${second} sq_${i}_${first})\n`;
      }
    }
  }
  for (let j = 1; j <= puzzle.columns; j++) {
    for (let first = 1; first <= puzzle.rows; first++) {
      for (let second = first + 1; second <= puzzle.rows; second++) {
        init += `(is_top_of sq_${first}_${j} sq_${second}_${j})\n`;
        init += `(is_down_of sq_${second}_${j} sq_${first}_${j})\n`;
      }
    }
  }
  for (let id = 1; id <= puzzle.cars.length; id++) {
    const car = puzzle.cars[id - 1];
    if (car.orientation === Orientation.HORIZONTAL) {
      init += `(is_leftmost car_${id} sq_${car.startY}_${car.startX})\n`;
      init += `(is_rightmost car_${id} sq_${car.startY}_${car.startX + car.length - 1})\n`;
    } else {
      init += `(is_topmost car_${id} sq_${car.startY}_${car.startX})\n`;
      init += `(is_rightmost car_${id} sq_${car.startY + car.length - 1}_${car.startX})\n`;
    }
  }
  for (let i = 1; i <= puzzle.rows; i++) {
    for (let len = 1; len <= puzzle.columns; len++) {
      for (let first = 1; first <= puzzle.columns - len + 1; first++) {
        for (let second = first + 1; second <= puzzle.columns - len + 1; second++) {
          const firstStop = first + len - 1;
          const secondStop = second + len - 1;
          init += `(is_same_distance sq_${i}_${first} sq_${i}_${firstStop} sq_${i}_${second} sq_${i}_${secondStop})\n`;
          init += `(is_same_distance sq_${i}_${second} sq_${i}_${secondStop} sq_${i}_${first} sq_${i}_${firstStop})\n`;
        }
      }
    }
  }
  for (let j = 1; j <= puzzle.columns; j++) {
    for (let len = 1; len <= puzzle.rows; len++) {
      for (let first = 1; first <= puzzle.rows - len + 1; first++) {
        for (let second = first + 1; second <= puzzle.rows - len + 1; second++) {
          const firstStop = first + len - 1;
          const secondStop = second + len - 1;
          init += `(is_same_distance sq_${first}_${j} sq_${firstStop}_${j} sq_${second}_${j} sq_${secondStop}_${j})\n`;
          init += `(is_same_distance sq_${second}_${j} sq_${secondStop}_${j} sq_${first}_${j} sq_${firstStop}_${j})\n`;
        }
      }
    }
  }
  for (let i = 1; i <= puzzle.rows; i++) {
    for (let first = 1; first <= puzzle.columns; first++) {
      for (let second = first + 1; second <= puzzle.columns; second++) {
        for (let j = first + 1; j <= second; j++) {
          init += `(is_in_between sq_${i}_${first} sq_${i}_${second} sq_${i}_${j})\n`;
        }
      }
    }
    for (let first = puzzle.columns; first >= 1; first--) {
      for (let second = first - 1; second >= 1; second--) {
        for (let j = first - 1; j >= second; j--) {
          init += `(is_in_between sq_${i}_${first} sq_${i}_${second} sq_${i}_${j})\n`;
        }
      }
    }
  }
  for (let j = 1; j <= puzzle.columns; j++) {
    for (let first = 1; first <= puzzle.rows; first++) {
      for (let second = first + 1; second <= puzzle.rows; second++) {
        for (let i = first + 1; i <= second; i++){
          init += `(is_in_between sq_${first}_${j} sq_${second}_${j} sq_${i}_${j})\n`;
        }
      }
    }
    for (let first = puzzle.rows; first >= 1; first--) {
      for (let second = first - 1; second >= 1; second--) {
        for (let i = first - 1; i >= second; i--) {
          init += `(is_in_between sq_${first}_${j} sq_${second}_${j} sq_${i}_${j})\n`;
        }
      }
    }
  }
  for (let i = 1; i <= puzzle.rows; i++) {
    for (let j = 1; j <= puzzle.columns; j++) {
      let inCar = false;
      for (let id in puzzle.cars) {
        const car = puzzle.cars[id];
        if (isInCar(car, i, j)) {
          inCar = true;
          break;
        }
      }
      if (!inCar) {
        init += `(is_clear sq_${i}_${j})\n`;
      }
    }
  }
  fs.writeFileSync(path, `(:init ${init})\n`, { flag: 'a' });
}

function writeGoal(path: string, puzzle: Puzzle) {
  let iExit = puzzle.exit[1];
  let jExit = puzzle.exit[0];
  let goal: string;
  if (jExit === 1) {
    goal = `(:goal (is_leftmost car_1 sq_${iExit}_${jExit}))\n`;
  } else if (jExit === puzzle.columns) {
    goal = `(:goal (is_rightmost car_1 sq_${iExit}_${jExit}))\n`;
  } else if (iExit === 1) {
    goal = `(:goal (is_topmost car_1 sq_${iExit}_${jExit}))\n`;
  } else {
    goal = `(:goal (is_bottommost car_1 sq_${iExit}_${jExit}))\n`;
  }
  fs.writeFileSync(path, goal, { flag: 'a' });
}

export function writeProblem(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['problem-file'];

  fs.writeFileSync(path, 
`(define (problem ${puzzle.problem_name})
(:domain ${puzzle.domain_name})
`);

  writeObjects(path, puzzle);
  writeInit(path, puzzle);
  writeGoal(path, puzzle);

  fs.writeFileSync(path, `)\n`, { flag: 'a' });
}