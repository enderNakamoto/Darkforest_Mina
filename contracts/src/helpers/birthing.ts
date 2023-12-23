
/* 
script to find how to make planet co-ordinates rare, and uniformly distribute planets over a game area

test results ..
example coordinate Hashes
21565680844461314807147611702860246336805372493508489110556896454939225549736
25153834528238352025091411039949114579843839670440790727153524232958326376354
28533297526180747733355271428625961549556743972891714044696528430489949138168
23246147163005692620136408842633273827478401663732220579011479248186601110325
14475412788134061743012706752356733932222083243983723886598121153609833692633
5179794564687457839956419684630393576868452302619104417668738877266031346568
28432586021884609567649709414889505960108884398216826919608693729805752293362
...

test with 200 x 200 grid with leading zeros 

no leading zeros -> 
number of planets 34930
number of empty coordinates 5070
percentage of planets  87.325

one zero -> 
number of planets 7151
number of empty coordinates 32849
percentage of planets  17.8775

two zeroes -> 
number of planets 243
number of empty coordinates 39757
percentage of planets  0.60825

three zeroes -> 
number of planets 7
number of empty coordinates 39993
percentage of planets  0.0175

four zeroes ->
number of planets 2
number of empty coordinates 40000
percentage of planets  0.005

five zeroes ->
number of planets 0
number of empty coordinates 40000
percentage of planets  0

six zeroes ->
number of planets 0
number of empty coordinates 40000
percentage of planets  0

Therfore, in a radius r, with Area pi*r^2 of 200, 
we can expect to find 40000 planets, and 0.00005% 
of the coordinates will have a planet.

Within a 10 light year radius from our Sun, 
there are estimated to be around 14 known stars

In our model, with a 10 light year radius, 
and difficulty of three leading zeros,
we will have - 

-------------------
radius in light years 10
number of stars 1
-------------------
radius in light years 100
number of stars 190
-------------------
radius in light years 200
number of stars 762
-------------------
radius in light years 300
number of stars 1716
-------------------
radius in light years 400
number of stars 3051
-------------------
radius in light years 500
number of stars 4767
-------------------
radius in light years 1000
number of stars 19069
-------------------

This is a bit sparse, but this will do! 
We can initiate the game with a 100 light year radius,
and then expand the game area as more players join.

This will allow ~190 stars to be discovered at the start of the game.

*/

import { Field, Poseidon, Provable } from 'o1js';
import { Integer } from 'o1js/dist/node/bindings/crypto/non-negative';

console.log('in birthing calculator')

function generateExampleCoordinates() {
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const hash = Poseidon.hash([Field(i),Field(j)]);
            console.log(hash.toString());
        }
    }
}

function testCutoff(cutoff: Field) {
    let empty = 0
    let planet = 0
    for (let i = 0; i < 200; i++) {
        for (let j = 0; j < 200; j++) {
            const hash = Poseidon.hash([Field(i),Field(j)]);
            if (hash.lessThan(cutoff).toString() == "true"){
                planet = planet + 1
            } else {
                empty = empty + 1
            }
        }
    }
    console.log('number of planets', planet);
    console.log('number of empty coordinates', empty);
    console.log('percentage of planets ', planet/(empty+planet) * 100);
}

generateExampleCoordinates();

const cutoff_0 = Field(25179794564687457839956419684630393576868452302619104417668738877266031346568);
const cutoff_1 = Field(5179794564687457839956419684630393576868452302619104417668738877266031346568);
const cutoff_2 = Field(179794564687457839956419684630393576868452302619104417668738877266031346568);
const cutoff_3 = Field(79794564687457839956419684630393576868452302619104417668738877266031346568);
const cutoff_4 = Field(9794564687457839956419684630393576868452302619104417668738877266031346568);
const cutoff_5 = Field(794564687457839956419684630393576868452302619104417668738877266031346568);
const cutoff_6 = Field(94564687457839956419684630393576868452302619104417668738877266031346568);


testCutoff(cutoff_0);
testCutoff(cutoff_1);
testCutoff(cutoff_2);
testCutoff(cutoff_3);
testCutoff(cutoff_4);
testCutoff(cutoff_5);
testCutoff(cutoff_6);


function planetsInArea(radius: number, percentage: number = 1) {
    const area = Math.PI * radius * radius;
    const planets = area * (percentage/100);
    console.log('-------------------');
    console.log('radius in light years', radius);
    console.log('number of stars', Math.floor(planets));
}

planetsInArea(10, 0.607);
planetsInArea(100, 0.607);
planetsInArea(200, 0.607);
planetsInArea(300, 0.607);
planetsInArea(400, 0.607);
planetsInArea(500, 0.607);
planetsInArea(1000, 0.607);

