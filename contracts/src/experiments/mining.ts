/* The planet's coordinates are private and never revealed to the public.

the public only knows the hash of the coordinates. Poseidon hash is used to hash the coordinates.

if thh game arena square of NxN, or a circle of radius R, 

someone can just hash all known co-ordinates and find the planet coordinates.

This experiment is to see how long it would take to find coordinates of a planet. 

That will determine how big the search space (game world) should be.

*/
import { Field, Poseidon, Bytes, Hash } from 'o1js';

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

// test Poseidon hash
function hashCoordinatesPoseidon(coordinates: {x: number, y: number}[]) {
    console.log('-------------------');
    console.log(`hashing ${coordinates.length} coordinates`);
    let hashes = [];
    for (let i = 0; i < coordinates.length; i++) {
        const hash = Poseidon.hash([Field(coordinates[i].x),Field(coordinates[i].y)]);
        hashes.push(hash);
    }
}


// test Poseidon Chain hash, hash with itself chainLength times
function chainHashPoseidon(coordinates: {x: number, y: number}[], chainLength: number) {
  let currentHash = Poseidon.hash([Field(coordinates[0].x),Field(coordinates[0].y)]);

  for (let i = 1; i < chainLength; i++) {
      currentHash = Poseidon.hash([currentHash, currentHash]);
  }
    return currentHash;
}

// test Poseidon Chain hash
function hashChainCoordinatesPoseidon(coordinates: {x: number, y: number}[], chainLength: number) {
    console.log('-------------------');
    console.log(`hashing ${coordinates.length} coordinates, ${chainLength} times`);
    let hashes = [];
    for (let i = 0; i < coordinates.length; i++) {
        const hash = chainHashPoseidon(coordinates, chainLength);
        hashes.push(hash);
    }
}

function benchmarkHashingPoseidon(num: number) {
    console.log('-------------------');
    console.log(`benchmarking hashing ${num} coordinates`);
    let coordinates = generateRandomCoordinates(num);
    const start = Date.now();
    hashCoordinatesPoseidon(coordinates);
    const end = Date.now();
    console.log(`time taken to hash ${num} coordinates: ${end - start} ms`);
}

// test Keccak hash

function hashCoordinatesKeccak(coordinates: {x: number, y: number}[]) {
    console.log('-------------------');
    console.log(`hashing ${coordinates.length} coordinates`);
    let hashes = [];
    for (let i = 0; i < coordinates.length; i++) {
        const bytes = Bytes.from(new Uint8Array([coordinates[i].x, coordinates[i].y]));
        const hash = Hash.Keccak256.hash(bytes);
        hashes.push(hash);
    }
}

function benchmarkHashingKeccak(num: number) {
    console.log('-------------------');
    console.log(`benchmarking hashing ${num} coordinates`);
    let coordinates = generateRandomCoordinates(num);
    const start = Date.now();
    hashCoordinatesKeccak(coordinates);
    const end = Date.now();
    console.log(`time taken to hash ${num} coordinates: ${end - start} ms`);
 }



// test Keccak hash
function hashCoordinatesSha256(coordinates: {x: number, y: number}[]) {
    console.log('-------------------');
    console.log(`hashing ${coordinates.length} coordinates`);
    let hashes = [];
    for (let i = 0; i < coordinates.length; i++) {
        const bytes = Bytes.from(new Uint8Array([coordinates[i].x, coordinates[i].y]));
        const hash = Hash.SHA3_256.hash(bytes);
        hashes.push(hash);
    }
}

function benchmarkHashingSha256(num: number) {
    console.log('-------------------');
    console.log(`benchmarking hashing ${num} coordinates`);
    let coordinates = generateRandomCoordinates(num);
    const start = Date.now();
    hashCoordinatesSha256(coordinates);
    const end = Date.now();
    console.log(`time taken to hash ${num} coordinates: ${end - start} ms`);
 }

 function benchmarChainPoseidonkHashing(num: number, chainLength: number) {
    console.log('-------------------');
    console.log(`benchmarking hashing ${num} coordinates`);
    let coordinates = generateRandomCoordinates(num);
    const start = Date.now();
    hashChainCoordinatesPoseidon(coordinates, chainLength);
    const end = Date.now();
    console.log(`time taken to hash ${num} coordinates: ${end - start} ms`);
 }



// benchmarkHashingPoseidon(100000);
// benchmarkHashingKeccak(1000);
// benchmarkHashingSha256(100);
benchmarChainPoseidonkHashing(100, 1000);