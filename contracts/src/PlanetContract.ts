import { Field, SmartContract, state, State, method, Struct, PublicKey, Poseidon } from 'o1js';

// this has to be Private
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

// TODO for Planet initialization

// 1. Need to come up with a realistic initial radius 
// 2. figure how to space the planets apart 
// 3. How to randomly initiate planets 
// 4. Mina has access to VRF
// 5. Mina has no mapping, so save planets in Merkle Tree(nullifier perhaps?)
// 7. A way to increase radius based on planets 
// 9. to counter Sybil, requitre Mina to initiate a planet
// 10. DarkForest uses MIMC hash, can we use Poseidon instead? 

export class PlanetContract extends SmartContract {

  // public values stored in Mina 
  @state(Field) gameRadius = State<Field>();
  @state(Field) numberOfPlanets = State<Field>();

  // initial values
  // - set gameRadius to 100
  // - set numberOfPlanets to 0 
  init() {
    super.init();
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
}
