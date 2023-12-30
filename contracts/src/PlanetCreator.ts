import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    Struct, 
    PublicKey, 
    Poseidon, 
    MerkleMapWitness
   } from 'o1js';

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
  @state(Field) mapRoot = State<Field>(); 

  // initial values
  // - set gameRadius to 100
  // - set numberOfPlanets to 0 
  init() {
    super.init();
    this.gameRadius.set(Field(100))
    this.numberOfPlanets.set(Field(0))
  }

  @method initNullifier(initialRoot: Field) {
    this.mapRoot.set(initialRoot);
  }

  /* 
    the initialize circuit ensures the coordinate falls 
    in certain range during the creation of planet
    Prove: I know (x,y) such that:
    - x^2 + y^2 <= r^2
    - Poseidon(x,y) = pub
*/
  @method initializePlanet(
    x: Field, 
    y: Field, 
    player: Field,
    keyWitness: MerkleMapWitness
    ) {
    const gameRadius = this.gameRadius.getAndRequireEquals();

    const xSquared = x.mul(x);
    const ySquared = y.mul(y);
    const rSquared = gameRadius.mul(gameRadius);
    xSquared.add(ySquared).assertLessThan(rSquared);

    // get the hash of the coordinates
    // add data to merkle map, if it does not exist yet
        // check if palyer has homeworld already
        // if not, add to merkle map


    const positionHash = Poseidon.hash([x, y]); 
    const initialRoot = this.mapRoot.getAndRequireEquals();

    // check the initial state matches what we expect,
    // in this case, value has not been set yet so it should be 0
    const [ rootBefore, key ] = keyWitness.computeRootAndKey(Field(0));
    rootBefore.assertEquals(initialRoot);

    key.assertEquals(player);

    // compute the root after incrementing
    const [ rootAfter, _ ] = keyWitness.computeRootAndKey(positionHash);

    // set the new root
    this.mapRoot.set(rootAfter);
  }
}
