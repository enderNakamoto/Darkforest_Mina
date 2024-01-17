import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    Struct, 
    Poseidon,
    MerkleMapWitness
   } from 'o1js';

import { Const } from './helpers/const';

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
  @state(Field) numberOfWhiteListedPlayers = State<Field>();

  // Merkle Map to store player Address (Key) and Planet (value), to store who owns which planet
  @state(Field) planetLedgerRoot = State<Field>();
  @state(Field) playerNullifierRoot = State<Field>();


  init() {
    super.init();
    this.gameRadius.set(Const.INITIAL_GAME_RADIUS)
    this.numberOfPlanets.set(Field(0))
    this.numberOfWhiteListedPlayers.set(Field(0))
  }

  // initialize the mapRoot, and playerNullifierRoot
  @method initMapRoots(initialLedgerRoot: Field, initialNullifierRoot: Field) {
    this.planetLedgerRoot.set(initialLedgerRoot);
    this.playerNullifierRoot.set(initialNullifierRoot);
  }

  // add elgible addresses, set value to Field(1), in playerNullifier
  @method addEligibleAddress(
    keyWitness: MerkleMapWitness,
  ) {
    let derivedNullRoot, nullRootAfter, _; 

    // STEP 1: check if the number of addresses reached MAX_NUM_PLANETS
    let playersNumBefore = this.numberOfWhiteListedPlayers.getAndRequireEquals();
    playersNumBefore.assertLessThan(Const.MAX_NUM_PLAYERS);

    // STEP 2: check if the address is already in the whitelist, or has initiated a homeworld
    let nullRootBefore = this.playerNullifierRoot.getAndRequireEquals();
    [ derivedNullRoot, _ ] = keyWitness.computeRootAndKey(Const.UNINITIALIZED_VALUE);
    derivedNullRoot.assertEquals(nullRootBefore, Const.ALREADY_WHITELISTED_ERROR);

    // STEP 3: add whitelist address to the merkle map, by updating the root
     [ nullRootAfter, _ ] = keyWitness.computeRootAndKey(Const.WHITELISTED_VALUE);
    this.playerNullifierRoot.set(nullRootAfter);

    // STEP 4: increment numPlayers
    this.numberOfWhiteListedPlayers.set(playersNumBefore.add(Field(1)));
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

    // STEP 1: check if the number of planets reached MAX_NUM_PLANETS
    // STEP 2: check if the player is in the whitelist
    // STEP 3: check if the player has already initiated a homeworld
    // STEP 4: check if the coordinate is within the game radius
    // STEP 5: add the coordinate to the merkle map, by updating the root
    // STEP 6: increment the number of planets
    // STEP 7: update playerNullifier to show player has initiated a homeworld
    


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
    const initialRoot = this.planetLedgerRoot.getAndRequireEquals();

    // check the initial state matches what we expect,
    // in this case, value has not been set yet so it should be 0
    const [ rootBefore, key ] = keyWitness.computeRootAndKey(Field(0));
    rootBefore.assertEquals(initialRoot);

    key.assertEquals(player);

    // compute the root after incrementing
    const [ rootAfter, _ ] = keyWitness.computeRootAndKey(positionHash);

    // set the new root
    this.planetLedgerRoot.set(rootAfter);
  }
}
