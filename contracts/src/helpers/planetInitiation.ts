import { Poseidon, Field, MerkleMap } from 'o1js';

import {
    WORLD_LENGTH_SQUARE,
    WORLD_RADIUS_CIRCLE,
    TRIES,
    DIFFICULTY_CUTOFF
} from './const.js';

// gameworld is a cirdular world with a radius of worldRadius
export function getRandomHomePlanetCoordsCircle(worldRadius: number = WORLD_RADIUS_CIRCLE): [{x: number, y: number}, String, number]  {
    let count = TRIES;
    let validHomePlanet = false;
    let x, y;
    let hash = Field(0);

    do {
        const t = Math.random() * 2 * Math.PI;
        const r = (0.5 + Math.random() * 0.5) * worldRadius;
        x = Math.floor(Math.cos(t) * r);
        y = Math.floor(Math.sin(t) * r);
    
        if (x ** 2 + y ** 2 >= worldRadius ** 2) continue;
        hash = Poseidon.hash([Field(x), Field(y)]);

        if (hash.lessThan(DIFFICULTY_CUTOFF).toString() == "true") {
            validHomePlanet = true
        }
    
        count -= 1;
    } while (!validHomePlanet && count > 0);

    if (validHomePlanet) {
        return [{ x, y}, hash.toString(), count];
    }
    return [{ x: 0, y: 0}, '0', count];
}

// if the game world is a square of NxN
export function getRandomHomePlanetCoordsSquare(N: number = WORLD_LENGTH_SQUARE): [{x: number, y: number}, String, number]  {
    let count = TRIES;
    let validHomePlanet = false;
    let x, y, hash;

    do {
        x = Math.floor(Math.random() * N);
        y = Math.floor(Math.random() * N);
        hash = Poseidon.hash([Field(x), Field(y)]);
        
        if (hash.lessThan(DIFFICULTY_CUTOFF).toString() == "true") {
            validHomePlanet = true
        }
        
        console.log('count', count);
        count -= 1;
    } while (!validHomePlanet && count > 0);

    if (validHomePlanet) {
        return [{ x, y}, hash.toString(), count];
    }
    return [{ x: 0, y: 0}, '0', count];
}