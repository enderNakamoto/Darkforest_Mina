import { Field, SmartContract, state, State, method, Struct, PublicKey, Poseidon } from 'o1js';

// this has to be private
export class Position extends Struct({
  x: Field,
  y: Field,
  panetId: Field
}){ }

export class Planet extends Struct({
  id: Field,
  population: Field,
  position: Position,
  populationCap: Field,
  populationGrowth: Field,
  ore: Field,
  oreCap: Field,
  oreGrowth: Field,
}){ }

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

// to do notes: 
// 1. need to come up with a realistic initial radius 
// 2. figure how to space the planets apart 
// 3. How to randomly initiate planets 
// 4. Mina has access to VRF?
// 5. Mina has no mapping, so save planets in Merkle Tree(nullifier perhaps?)
// 6. Moving Circuit ...
// 7. A way to increase radius based on planets 
// 8. perhaps, for V1, we can have max, planets and a constant game radius
// 9. to counter Sybil, requitre Mina to initiate a planet
// 10. DarkForest uses MIMC hash, can we use Poseidon instead? 

export class DarkForest extends SmartContract {
  @state(Field) gameRadius = State<Field>();


  init() {
    super.init();
    // set the radius to 
    this.gameRadius.set(Field(100))
  }

  /* 
    init Circuit ensures the coordinate falls in certain range during the creation of planet
    Prove: I know (x,y) such that:
    - x^2 + y^2 <= r^2
    - Poseidon(x,y) = pub
*/
  @method initiatePlanet(x: Field, y: Field) {
    const gameRadius = this.gameRadius.getAndRequireEquals();

    const xSquared = x.mul(x);
    const ySquared = y.mul(y);
    const rSquared = gameRadius.mul(gameRadius);
    xSquared.add(ySquared).assertLessThan(rSquared);

    const positionHash = Poseidon.hash([x, y]); 
    // to do , need to save the hash somewhere - merkle tree may be?
  }


  // During the fleet’s movement, 
  // the move circuit checks the moving range does not exceed a circular area of radius distMax:
  @method moveFleet() {
    // to do - initiate a Planet
  }
}
