import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    Struct, 
    Poseidon,
    Bool,
    MerkleMapWitness
   } from 'o1js';

import { Const } from '../../lib/const';
import { Errors } from '../../lib/errors';

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
  @state(Field) admin = State<Field>();
  @state(Field) gameRadius = State<Field>();
  @state(Field) gameLength = State<Field>();
  @state(Field) numberOfPlanets = State<Field>();
  @state(Field) numberOfWhiteListedPlayers = State<Field>();
  
  // Merkle Map to store player Address (Key) and Planet (value), to store who owns which planet
  @state(Field) planetLedgerRoot = State<Field>(); // player address (key) and planetPosition (value)
  @state(Field) playerNullifierRoot = State<Field>(); // player address (key) and nullifier (value)
  @state(Field) planetDetailsRoot = State<Field>(); // planet Position (key) and planet Details Hash (value)

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
  @method initGame(initialLedgerRoot: Field, initialNullifierRoot: Field) {
    this.planetLedgerRoot.set(initialLedgerRoot);
    this.playerNullifierRoot.set(initialNullifierRoot);
    // set sender as admin
    this.admin.set(Poseidon.hash(this.sender.toFields()));   
  }

  // add elgible addresses, set value to Field(1), in playerNullifier
  @method addEligibleAddress(
    keyWitness: MerkleMapWitness,
  ) {
    let derivedNullRoot, nullRootAfter, _; 

    // STEP 0: check if the sender is admin
    const currentSender = Poseidon.hash(this.sender.toFields());
    this.admin.getAndRequireEquals().assertEquals(currentSender, Errors.NOT_ADMIN_ERROR);

    // STEP 1: check if the number of addresses reached MAX_NUM_PLANETS
    let playersNumBefore = this.numberOfWhiteListedPlayers.getAndRequireEquals();
    playersNumBefore.assertLessThan(Const.MAX_NUM_PLAYERS);

    // STEP 2: check if the address is already in the whitelist, or has initiated a homeworld
    let nullRootBefore = this.playerNullifierRoot.getAndRequireEquals();
    [ derivedNullRoot, _ ] = keyWitness.computeRootAndKey(Const.UNINITIALIZED_VALUE);
    derivedNullRoot.assertEquals(nullRootBefore, Errors.ALREADY_WHITELISTED_ERROR);

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
    planet: Planet,
    nullifierKeyWitness: MerkleMapWitness,
    detailKeyWitness: MerkleMapWitness,
    ledgerKeyWitness: MerkleMapWitness
    ) {
      let derivedNullRoot, derivedNullKey, nullRootAfter, ledgerRootAfter, detailsRootAfter, _; 

      // STEP 1: check if the number of planets reached MAX_NUM_PLANETS
      let planetsNumBefore = this.numberOfPlanets.getAndRequireEquals();
      planetsNumBefore.assertLessThan(Const.MAX_NUM_PLANETS, Errors.MAX_NUM_PLANETS_ERROR);
  
      // STEP 2: check if the player is in the whitelist, and has not initiated a homeworld
      const currentPlayer = Poseidon.hash(this.sender.toFields());
      let nullRootBefore = this.playerNullifierRoot.getAndRequireEquals();
  
      [ derivedNullRoot, derivedNullKey ] = nullifierKeyWitness.computeRootAndKey(Const.WHITELISTED_VALUE);
      derivedNullRoot.assertEquals(nullRootBefore, Errors.PLAYER_CANNOT_INITIATE_ERROR);
      derivedNullKey.assertEquals(currentPlayer, Errors.PLAYER_CANNOT_INITIATE_ERROR);
    

    // STEP 3: check if the coordinate is within the game radius
    const gameRadius = this.gameRadius.getAndRequireEquals();

    const xSquared = x.mul(x);
    const ySquared = y.mul(y);
    const rSquared = gameRadius.mul(gameRadius);
    xSquared.add(ySquared).assertLessThan(rSquared, Errors.COORDINATE_OUT_OF_RANGE_ERROR);

    // STEP 4: make sure that the planet does not belong to someone else already
    const positionHash = Poseidon.hash([x, y]); 
    const initialRoot = this.planetLedgerRoot.getAndRequireEquals();
    //  TO DO : check if the planet already exists, does not belong to someone else

    planet.population.assertEquals(Const.INITIAL_POPULATION, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.populationCap.assertEquals(Const.INITIAL_POPULATION_CAP, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.populationGrowth.assertEquals(Const.INITIAL_POPULATION_GROWTH, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.ore.assertEquals(Const.INITIAL_ORE, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.oreCap.assertEquals(Const.INITIAL_ORE_CAP, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.oreGrowth.assertEquals(Const.INITIAL_ORE_GROWTH, Errors.PLANET_INIT_WRONG_VALUES_ERROR);

    const planetDetailsHash = Poseidon.hash(Planet.toFields(planet));
    [ detailsRootAfter, _ ] = detailKeyWitness.computeRootAndKey(planetDetailsHash);
    this.planetDetailsRoot.set(detailsRootAfter);

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
    planet: Planet,
    nullifierKeyWitness: MerkleMapWitness, 
    detailKeyWitness: MerkleMapWitness,
    ledgerKeyWitness: MerkleMapWitness
    ) {
    let derivedNullRoot, derivedNullKey, nullRootAfter, ledgerRootAfter, detailsRootAfter, _; 

    // STEP 1: check if the number of planets reached MAX_NUM_PLANETS
    let planetsNumBefore = this.numberOfPlanets.getAndRequireEquals();
    planetsNumBefore.assertLessThan(Const.MAX_NUM_PLANETS, Errors.MAX_NUM_PLANETS_ERROR);

    // STEP 2: check if the player is in the whitelist, and has not initiated a homeworld
    const currentPlayer = Poseidon.hash(this.sender.toFields());
    let nullRootBefore = this.playerNullifierRoot.getAndRequireEquals();

    [ derivedNullRoot, derivedNullKey ] = nullifierKeyWitness.computeRootAndKey(Const.WHITELISTED_VALUE);
    derivedNullRoot.assertEquals(nullRootBefore, Errors.PLAYER_CANNOT_INITIATE_ERROR);
    derivedNullKey.assertEquals(currentPlayer, Errors.PLAYER_CANNOT_INITIATE_ERROR);
    

    // STEP 3: check if the coordinate is within the game radius
    const gameLength = this.gameLength.getAndRequireEquals();

    x.assertLessThan(gameLength, Errors.COORDINATE_OUT_OF_RANGE_ERROR);
    y.assertLessThan(gameLength, Errors.COORDINATE_OUT_OF_RANGE_ERROR);

    // STEP 4: make sure that the planet does not belong to someone else already
    const positionHash = Poseidon.hash([x, y]); 
    const initialRoot = this.planetLedgerRoot.getAndRequireEquals();
    //  TO DO : check if the planet already exists, does not belong to someone else

    planet.population.assertEquals(Const.INITIAL_POPULATION, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.populationCap.assertEquals(Const.INITIAL_POPULATION_CAP, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.populationGrowth.assertEquals(Const.INITIAL_POPULATION_GROWTH, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.ore.assertEquals(Const.INITIAL_ORE, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.oreCap.assertEquals(Const.INITIAL_ORE_CAP, Errors.PLANET_INIT_WRONG_VALUES_ERROR);
    planet.oreGrowth.assertEquals(Const.INITIAL_ORE_GROWTH, Errors.PLANET_INIT_WRONG_VALUES_ERROR);

   // STEP 5: add the planet to the merkle map, by updating the root   
    [ ledgerRootAfter, _ ] = ledgerKeyWitness.computeRootAndKey(positionHash);
    this.planetLedgerRoot.set(ledgerRootAfter);


    const planetDetailsHash = Poseidon.hash(Planet.toFields(planet));
    [ detailsRootAfter, _ ] = detailKeyWitness.computeRootAndKey(planetDetailsHash);
    this.planetDetailsRoot.set(detailsRootAfter);


    // STEP 6: increment the number of planets
    this.numberOfPlanets.set(planetsNumBefore.add(Field(1)));

    // STEP 7: update playerNullifier to show player has initiated a homeworld
    [ nullRootAfter, _ ] = nullifierKeyWitness.computeRootAndKey(Const.HOMEWORLD_SET_VALUE);
    this.playerNullifierRoot.set(nullRootAfter);

    // STEP 8: emit event
    this.emitEvent('homeworld-initiated', positionHash);
  }


  // TODO: 
  // 1. Make sure that the planet exists in the game
  // 2. Make sure that the planet is within the game radius
  // 3. Make sure that the planet is not occupoied by the same player
  // 4. Make sure that the attacker has enough troops to attack
  @method attackPlanetSquareUniverse(
    target_x: Field, 
    target_y: Field,
  ) {
      const gameLength = this.gameLength.getAndRequireEquals();

      target_x.assertLessThan(gameLength, Errors.COORDINATE_OUT_OF_RANGE_ERROR);
      target_y.assertLessThan(gameLength, Errors.COORDINATE_OUT_OF_RANGE_ERROR);
  }

}
