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
import { PublicKey } from 'o1js/dist/node/provable/curve-bigint';

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
  @state(Field) gameLength = State<Field>();
  @state(Field) numberOfPlanets = State<Field>();
  @state(Field) numberOfWhiteListedPlayers = State<Field>();
  
  // Merkle Map to store player Address (Key) and Planet (value), to store who owns which planet
  @state(Field) planetLedgerRoot = State<Field>(); // player address (key) and planetPosition (value)
  @state(Field) playerNullifierRoot = State<Field>(); // player address (key) and nullifier (value)

  // events 
  events = {
    'homeworld-initiated': Field,
  };


  init() {
    super.init();
    this.gameRadius.set(Const.INITIAL_GAME_RADIUS)
    this.gameLength.set(Const.INITIAL_GAME_LENGTH)
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
  @method initializePlanetinCircularUniverse(
    x: Field, 
    y: Field,
    nullifierKeyWitness: MerkleMapWitness, 
    ledgerKeyWitness: MerkleMapWitness
    ) {
    let derivedNullRoot, nullRootAfter, ledgerRootAfter, _; 

    // STEP 1: check if the number of planets reached MAX_NUM_PLANETS
    let planetsNumBefore = this.numberOfPlanets.getAndRequireEquals();
    planetsNumBefore.assertLessThan(Const.MAX_NUM_PLANETS, Const.MAX_NUM_PLANETS_ERROR);

    // STEP 2: check if the player is in the whitelist, and has not initiated a homeworld
    let nullRootBefore = this.playerNullifierRoot.getAndRequireEquals();
    [ derivedNullRoot, _ ] = nullifierKeyWitness.computeRootAndKey(Const.WHITELISTED_VALUE);
    derivedNullRoot.assertEquals(nullRootBefore, Const.PLAYER_CANNOT_INITIATE_ERROR);
    

    // STEP 3: check if the coordinate is within the game radius
    const gameRadius = this.gameRadius.getAndRequireEquals();

    const xSquared = x.mul(x);
    const ySquared = y.mul(y);
    const rSquared = gameRadius.mul(gameRadius);
    xSquared.add(ySquared).assertLessThan(rSquared, Const.COORDINATE_OUT_OF_RANGE_ERROR);

    // STEP 4: make sure that the planet does not belong to someone else already
    const positionHash = Poseidon.hash([x, y]); 
    const initialRoot = this.planetLedgerRoot.getAndRequireEquals();
    //  TO DO : check if the planet already exists, does not belong to someone else

   // STEP 5: add the planet to the merkle map, by updating the root   
    [ ledgerRootAfter, _ ] = ledgerKeyWitness.computeRootAndKey(positionHash);
    this.planetLedgerRoot.set(ledgerRootAfter);


    // STEP 6: increment the number of planets
    this.numberOfPlanets.set(planetsNumBefore.add(Field(1)));

    // STEP 7: update playerNullifier to show player has initiated a homeworld
    [ nullRootAfter, _ ] = nullifierKeyWitness.computeRootAndKey(Const.HOMEWORLD_SET_VALUE);
    this.playerNullifierRoot.set(nullRootAfter);

    // STEP 8: emit event
    this.emitEvent('homeworld-initiated', positionHash);
  }


  /* 
    the initialize circuit ensures the coordinate falls 
    in certain range during the creation of planet
    Prove: I know (x,y) such that:
    - x < L && y < L
    - Poseidon(x,y) = pub
*/
  @method initializePlanetinSquareUniverse(
    x: Field, 
    y: Field,
    nullifierKeyWitness: MerkleMapWitness, 
    ledgerKeyWitness: MerkleMapWitness
    ) {
    let derivedNullRoot, nullRootAfter, ledgerRootAfter, _; 

    // STEP 1: check if the number of planets reached MAX_NUM_PLANETS
    let planetsNumBefore = this.numberOfPlanets.getAndRequireEquals();
    planetsNumBefore.assertLessThan(Const.MAX_NUM_PLANETS, Const.MAX_NUM_PLANETS_ERROR);

    // STEP 2: check if the player is in the whitelist, and has not initiated a homeworld
    let nullRootBefore = this.playerNullifierRoot.getAndRequireEquals();
    [ derivedNullRoot, _ ] = nullifierKeyWitness.computeRootAndKey(Const.WHITELISTED_VALUE);
    derivedNullRoot.assertEquals(nullRootBefore, Const.PLAYER_CANNOT_INITIATE_ERROR);
    

    // STEP 3: check if the coordinate is within the game radius
    const gameLength = this.gameLength.getAndRequireEquals();

    x.assertLessThan(gameLength, Const.COORDINATE_OUT_OF_RANGE_ERROR);
    y.assertLessThan(gameLength, Const.COORDINATE_OUT_OF_RANGE_ERROR);

    // STEP 4: make sure that the planet does not belong to someone else already
    const positionHash = Poseidon.hash([x, y]); 
    const initialRoot = this.planetLedgerRoot.getAndRequireEquals();
    //  TO DO : check if the planet already exists, does not belong to someone else

   // STEP 5: add the planet to the merkle map, by updating the root   
    [ ledgerRootAfter, _ ] = ledgerKeyWitness.computeRootAndKey(positionHash);
    this.planetLedgerRoot.set(ledgerRootAfter);


    // STEP 6: increment the number of planets
    this.numberOfPlanets.set(planetsNumBefore.add(Field(1)));

    // STEP 7: update playerNullifier to show player has initiated a homeworld
    [ nullRootAfter, _ ] = nullifierKeyWitness.computeRootAndKey(Const.HOMEWORLD_SET_VALUE);
    this.playerNullifierRoot.set(nullRootAfter);

    // STEP 8: emit event
    this.emitEvent('homeworld-initiated', positionHash);
  }


  // TODO: add a function to check if the planet is within the game limits (square) 
  @method attackPlanetSquareUniverse(
    target_x: Field, 
    target_y: Field,
  ) {

      // STEP 1: check if the target planet exists
      // STEP 2: check if the target planet is within the game limits
      // STEP 3: check if the attacker has enough population to attack
      const gameLength = this.gameLength.getAndRequireEquals();

      target_x.assertLessThan(gameLength, Const.COORDINATE_OUT_OF_RANGE_ERROR);
      target_y.assertLessThan(gameLength, Const.COORDINATE_OUT_OF_RANGE_ERROR);
  }

}
