import { parse } from './parser';
import { writeDomain } from './domain';

let puzzle = parse();
console.log(`No. of cars: ${puzzle.cars.length}`);
writeDomain(puzzle);