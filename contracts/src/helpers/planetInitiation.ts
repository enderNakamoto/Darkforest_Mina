import { Poseidon, Field } from 'o1js';

// gameworld is a cirdular world with a radius of worldRadius
function getRandomHomePlanetCoordsCircle(worldRadius: number): [{x: number, y: number}, Field]  {
    let count = 1000;
    let cutoff = 179794564687457839956419684630393576868452302619104417668738877266031346568; 
    let validHomePlanet = false;
    let x, y, hash;

    do {
        const t = Math.random() * 2 * Math.PI;
        const r = (0.5 + Math.random() * 0.5) * worldRadius;
        x = Math.floor(Math.cos(t) * r);
        y = Math.floor(Math.sin(t) * r);
    
        if (x ** 2 + y ** 2 >= worldRadius ** 2) continue;
        hash = Poseidon.hash([Field(x), Field(y)]);

        if (hash.lessThan(cutoff)) {
            validHomePlanet = true
        }
    
        count -= 1;
    } while (!validHomePlanet && count > 0);

    if (validHomePlanet) {
        return [{ x, y}, hash];
    }
    return [{ x: 0, y: 0}, Field(0)];
}

// if the game world is a square of NxN
function getRandomHomePlanetCoordsSquare(N: number): [{x: number, y: number}, Field]  {
    let count = 1000;
    let cutoff = 179794564687457839956419684630393576868452302619104417668738877266031346568; 
    let validHomePlanet = false;
    let x, y, hash;

    do {
        x = Math.floor(Math.random() * N);
        y = Math.floor(Math.random() * N);
        hash = Poseidon.hash([Field(x), Field(y)]);

        if (hash.lessThan(cutoff)) {
            validHomePlanet = true
        }
    
        count -= 1;
    } while (!validHomePlanet && count > 0);

    if (validHomePlanet) {
        return [{ x, y}, hash];
    }
    return [{ x: 0, y: 0}, Field(0)];
}

export default { getRandomHomePlanetCoordsCircle, 
    getRandomHomePlanetCoordsSquare};