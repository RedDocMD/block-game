import { parse } from './parser';
import { writeDomain } from './domain';
import { writeProblem } from './problem';

let puzzle = parse();
console.log(`No. of cars: ${puzzle.cars.length}`);
writeDomain(puzzle);
writeProblem(puzzle);