import * as fs from 'fs';

function writeMoveAction(buffer: Buffer, direction: string, length: number) {
  const actionName = `move-${direction}-${length}`;
  fs.writeFileSync(buffer, `(:action ${actionName}\n`);

  fs.writeFileSync(buffer, ':parameters (?car)\n');

  let precondition = ':precondition (and (is-car ?car)\n';
  if (direction === 'left' || direction === 'right') {
    precondition += '(is-horizontal ?car)\n';
  } else {
    precondition += '(is-vertical ?car)\n';
  }
  precondition += '(forall (?sq1 ?sq2 ?car2) (and ';
  precondition += '(is-car ?car2)\n';
  precondition += '(is-sq ?sq1)\n';
  precondition += '(is-sq ?sq2)\n';
  precondition += '(in-car ?car ?sq1)\n';
  precondition += '(not (in-car ?car2 ?sq2))\n';
  precondition += `(in-${direction}-dist-${length} ?sq1 ?sq2))))`;
  fs.writeFileSync(buffer, precondition);

  let effect = ':effect (forall (?sq1 ?sq2) (when (and ';
  effect += '(is-sq ?sq1)\n';
  effect += '(is-sq ?sq2)\n';
  effect += '(in-car ?car ?sq1)\n';
  effect += `(in-${direction}-dist-${length} ?sq1 ?sq2)))\n`;
  effect += '(and ';
  effect += '(not (in-car ?car ?sq1))\n';
  effect += '(in-car ?car ?sq2)))\n';
  fs.writeFileSync(buffer, effect);
}