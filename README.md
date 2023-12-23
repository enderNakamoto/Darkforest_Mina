# Game Overview

## Introduction 
Dark Forest is a MMO (massively multiplayer online) game using Zero Knowledge Proofs to simulate verifiable fog of war .

## Game Objects
The most important aspect of the dark forest universe is `Planet`

```typescript
export class Planet extends Struct({
  id: Field,
  population: Field,
  position: CircuitString,
  populationCap: Field,
  populationGrowth: Field,
  ore: Field,
  oreCap: Field,
  oreGrowth: Field,
}){ }
```

The Planet has two resources - population and ore (more can be added later), both of which grows gradually, and has a cap. 

The Planet's position that is kept secret. Players can only observe (detect) the limited universe around them as they move around (enumerate) through the coordinates. They can detect other planets with hash collisions 

```typescript
export class Position extends Struct({
  x: Field,
  y: Field,
  panetId: Field
}){ }

```

Players can also move their Fleet, and move population or Ore with it. It is represented by the Struct as follows

```typescript
export class Movement extends Struct({
  id: Field,
  initiator: PublicKey,
  fromPlanet: Field,
  toPlanet: Field,
  popArriving: Field,
  oreMoved: Field,
  departureTime: Field,
  arrivalTime: Field
}){ }
```

If the population landed via fleet exceeds current population of the planet, player can take over the planet. If the planet already belonged to a player, then the population gets added. 

## Spawning Solar systems/Planets
Creating a universe that balances realism with engaging gameplay presents a unique challenge. 
We use Poseidon hash functions to generate planet coordinates, adjusting their rarity by modifying the number of leading zeros in the hash values. This method creates a randomized yet controlled distribution of planets, essential for gameplay dynamics. The scripts for the numerical tests is in `helpers/birthing.ts` 

### Numerical Insights
**Initial Test**: On a 200 x 200 grid, the number of planets varied significantly with the change in leading zeros:

* With no leading zeros, 34,930 planets (87.325% of coordinates)
* With one zero, 7,151 planets (17.8775%)
* With two zeros, 243 planets (0.60825%)

Increasing zeros further drastically reduced the number of planets.

**Realistic Comparison**: In reality, only about 14 known stars exist within a 10 light-year radius of our Sun. This sparsity contrasts with the game's initial setting, where around 190 stars are placed within a 100 light-year radius, with a difficulty of three leading zeros.


## References 

* [Simple Game Explanation](https://trapdoortech.medium.com/dark-forest-one-interesting-game-with-zk-snark-technology-47528fa7691e)
* [ZK Global Game Overview](https://www.youtube.com/watch?v=nwUCccUS75k)
* [Original DF git repo](https://github.com/darkforest-eth)