import * as fs from 'fs';

export enum Orientation {
  HORIZONTAL,
  VERTICAL
}

export class Car {
  startX: number;
  startY: number;
  length: number;
  orientation: Orientation;
  id: number;

  constructor(id: number, startX: number, startY: number, length: number, orientation: Orientation) {
    this.startX = startX;
    this.startY = startY;
    this.length = length;
    this.orientation = orientation;
    this.id = id;
    
  }
}

export class Puzzle {
  cars: Car[];
  rows: number;
  columns: number;
  exit: [number, number];
  domain_name: string;
  problem_name: string;

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.cars = [];
    this.domain_name = "BLOCK_DOMAIN";
    this.problem_name = "BLOCK_PUZZLE";
  }

  addCar(car: Car) {
    this.cars.push(car);
  }
}

function parsePuzzle(data: string): Puzzle {
  const lines = data.split('\n');
  const firstLineContent = lines[0].split(' ').map(e => parseInt(e));
  const puzzle = new Puzzle(firstLineContent[0], firstLineContent[1]);
  const noOfCars = parseInt(lines[1]);
  for (let i = 2; i < noOfCars + 2; i++) {
    const fields = lines[i].split(' ');
    const numbers = fields.slice(0, 4).map(e => parseInt(e));
    let orientation: Orientation;
    if (fields[4] == 'H') {
      orientation = Orientation.HORIZONTAL;
    } else {
      orientation = Orientation.VERTICAL;
    }
    const car = new Car(numbers[0], numbers[1], numbers[2], numbers[3], orientation);
    puzzle.addCar(car);
  }
  const exitParam = lines[noOfCars + 2].split(' ').map(e => parseInt(e));
  puzzle.exit = [exitParam[0], exitParam[1]];
  return puzzle;
}

function readProblem(): string {
  const configFile = fs.readFileSync('src/config.json');
  const data = JSON.parse(configFile.toString());
  const problemFile = fs.readFileSync(data['description-file']);
  return problemFile.toString();
}

export function parse(): Puzzle {
  return parsePuzzle(readProblem());
}
