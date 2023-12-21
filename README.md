# Game Overview

Dark Forest is a MMO (massively multiplayer online) game using Zero Knowledge Proofs to simulate fog of war .

The most important aspect of the dark forest universe is `Planet`

```
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

```
export class Position extends Struct({
  x: Field,
  y: Field,
  panetId: Field
}){ }

```

Players can also move their Fleet, and move population or Ore with it. It is represented by the Struct as follows

```
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


## Refrences 

[Simple Game Explanation](https://trapdoortech.medium.com/dark-forest-one-interesting-game-with-zk-snark-technology-47528fa7691e)
[ZK Global Game Overview](https://www.youtube.com/watch?v=nwUCccUS75k)
[https://github.com/darkforest-eth](Original Dark Forest Github)