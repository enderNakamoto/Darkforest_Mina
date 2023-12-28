/* The planet's coordinates are private and never revealed to the public.

the public only knows the hash of the coordinates. Poseidon hash is used to hash the coordinates.

if thh game arena square of NxN, or a circle of radius R, 

someone can just hash all known co-ordinates and find the planet coordinates.

This experiment is to see how long it would take to find coordinates of a planet. 

That will determine how big the search space (game world) should be.

*/
import { Field, Poseidon } from 'o1js';

console.log('in birthing experiment')

function generateRandomCoordinates(num: number) {
    console.log('-------------------');
    console.log(`generating ${num} random coordinates`);
    let coordinates = [];
    for (let i = 0; i < num; i++) {
        const x = Math.floor(Math.random() * 100000);
        const y = Math.floor(Math.random() * 100000);
        coordinates.push({x, y});
    }
    return coordinates;
}

function hashCoordinates(coordinates: {x: number, y: number}[]) {
    console.log('-------------------');
    console.log(`hashing ${coordinates.length} coordinates`);
    let hashes = [];
    for (let i = 0; i < coordinates.length; i++) {
        const hash = Poseidon.hash([Field(coordinates[i].x),Field(coordinates[i].y)]);
        hashes.push(hash);
    }
}

function benchmarkHashing(num: number) {
    console.log('-------------------');
    console.log(`benchmarking hashing ${num} coordinates`);
    let coordinates = generateRandomCoordinates(num);
    const start = Date.now();
    hashCoordinates(coordinates);
    const end = Date.now();
    console.log(`time taken to hash ${num} coordinates: ${end - start} ms`);
}