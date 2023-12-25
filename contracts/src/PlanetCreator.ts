import { Field, SmartContract, state, State, method, Struct, PublicKey, Poseidon } from 'o1js';

export class Planet extends Struct({
  id: Field,
  population: Field,
  populationCap: Field,
  populationGrowth: Field,
  ore: Field,
  oreCap: Field,
  oreGrowth: Field,
}){ }

export class PlanetCreator extends SmartContract {

  // public values stored in Mina Blockchain
  @state(Field) gameRadius = State<Field>();
  @state(Field) numberOfPlanets = State<Field>();
  @state(Field) planetNUllifier = State<Field>(); 

  // initial values
  // - set gameRadius to 100
  // - set numberOfPlanets to 0 
  init() {
    super.init();
    this.gameRadius.set(Field(100))
    this.numberOfPlanets.set(Field(0))
  }

  /* 
    the initialize circuit ensures the coordinate falls 
    in certain range during the creation of planet
    Prove: I know (x,y) such that:
    - x^2 + y^2 <= r^2
    - Poseidon(x,y) = pub
*/
  @method initializePlanet(x: Field, y: Field) {
    const gameRadius = this.gameRadius.getAndRequireEquals();

    const xSquared = x.mul(x);
    const ySquared = y.mul(y);
    const rSquared = gameRadius.mul(gameRadius);
    xSquared.add(ySquared).assertLessThan(rSquared);

    const positionHash = Poseidon.hash([x, y]); 
    // to do , need to save the hash somewhere - merkle tree may be?
  }
}
