// script ot find how to make planet co-ordinates rare
// should uniformly distribute planets over a game area

import { Field, Poseidon, Provable } from 'o1js';

console.log('in birthing calculator')

/* when difficulty is set to N, only 1 out of N co-ordinates
should be able to birth a planet
*/
//const LARGEST_POSEIDON_HASH = 25121435923894086872719288956061066269396733890648011591972815087903208184580
const CUTOFF = 535407055237939105138338147895579540993691243981032136988441131063228652386799


let empty = 0
let planet = 0
for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
        const hash = Poseidon.hash([Field(i),Field(j)]);
        // Provable.if(
        //     hash.greaterThan(CUTOFF),
        //     planet.add(1),
        //     empty.add(1)
        //   );
        if (hash.greaterThan(CUTOFF).toString() == "true"){
            planet = planet + 1
        } else {
            empty = empty + 1
        }
    }
}

console.log('number of planets', planet);
console.log('number of empty coordinates', empty);