import {parse} from './parser';

let puzzle = parse();
console.log(`No. of cars: ${puzzle.cars.length}`);