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
  if (car.orientation == Orientation.HORIZONTAL) {
    return i >= car.startX && (i < car.startX + car.length) && j == car.startY;
  } else {
    return j >= car.startY && (j < car.startY + car.length) && i == car.startX;
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
  fs.writeFileSync(path, `(:init ${init})\n`, { flag: 'a' });
}

export function writeProblem(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['problem-file'];

  fs.writeFileSync(path, `(define (problem ${puzzle.problem_name})\n(:domain ${puzzle.domain_name})\n`);

  writeObjects(path, puzzle);
  writeInit(path, puzzle);

  fs.writeFileSync(path, `)\n`, { flag: 'a' });
}