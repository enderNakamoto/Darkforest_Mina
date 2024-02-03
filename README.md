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


## Mining Planets (Benchmarking)

The coordinates of planets are stored as private data and are not publicly disclosed.The only information available to the public is the Poseidon hash of these coordinates, leveraging the Poseidon.hash([x, y]) function, known for its efficiency in SNARK-friendly environments.

In a game arena, be it a square grid of dimensions N x N or a circle with radius R, the objective is to discover the private coordinates of all planets. This is achieved through identifying hash collisions - by generating and comparing the Poseidon hashes for every possible coordinate pair within the game's defined space.

Thhe experiment at `helpers/exp/mining.ts` aims to determine the time frame necessary to uncover the coordinates of all planets via hash collisions. The findings from this experiment will be pivotal in defining the size of the search space (game world), ensuring it offers an adequate level of challenge while maintaining cryptographic integrity.

We also compare Poseidon with with Keccak 

#### Poseidon hashing on M1 Mac
* time taken to hash 100 coordinates: 29 ms
* time taken to hash 1000 coordinates: 253 ms
* time taken to hash 10000 coordinates: 2475 ms

#### Keccak256 hashing on M1 Mac
* time taken to hash 100 coordinates: 124 ms
* time taken to hash 1000 coordinates: 1043 ms
* time taken to hash 10000 coordinates: 10320 ms

Hashing with `Hash.SHA3_256.hash(bytes), Hash.SHA3_512.hash(bytes) and Hash.SHA3_384.hash(bytes)`, yielded similar results to keccak256 

Therefore, it might be better to use the Keccak hash to save planet locations publicly to add extra layer of protection. Ironically, because Keccak is less efficient, it yields better protection.

According to [Shigoto-dev19](https://github.com/Shigoto-dev19)'s, recommenation we should probably just use Poseidon chain hash - that is to create a final hash, we can hash the function to itself N number of times to increase the time 

### Chain Poseidon (1000) on M1 Mac 
* time taken to hash 100 coordinates: 25062 ms

We can arbitrarily increase the time needed to hash every co-ordinate to make this super hard for anyone to bruteforce all the co-ordinates in the map easily 

e.g. hashing 100,000 times -  100 co-ordinates mwill take more than 4 minutes. 

Given a big enough universe, it would be quite hard for anyone to bruteforce all the co-ordinates.

## Game Notes

### TODO for Planet initialization

1. Need to come up with a realistic initial radius 
2. figure how to space the planets apart 
3. How to randomly initiate planets 
4. Mina has access to VRF?
5. Mina has no mapping, so save planets in Merkle Tree(nullifier perhaps?)
7. A way to increase radius based on planets 
9. to counter Sybil, requitre Mina to initiate a planet
10. DarkForest uses MIMC hash, can we use Poseidon instead? 


* Deploy Contract with initial MerkleMap(Merkle Tree) to hold Planet Hashes and World Radius
* A player is initiated on the client side within a radius, when a user interacts with UI (Join Game Button).
* A user is asked to give a secret phrase (salt).
* 
* 
   