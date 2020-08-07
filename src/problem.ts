import * as fs from 'fs';
import { Puzzle } from './parser';

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

function writeInit(path: string, puzzle: Puzzle) {
  
}

export function writeProblem(puzzle: Puzzle) {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const path = data['problem-file'];

  fs.writeFileSync(path, `(define (problem ${puzzle.problem_name})\n(:domain ${puzzle.domain_name})\n`);

  writeObjects(path, puzzle);

  fs.writeFileSync(path, `)\n`, { flag: 'a' });
}