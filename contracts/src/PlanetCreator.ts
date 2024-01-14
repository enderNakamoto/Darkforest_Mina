import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    Struct, 
    PublicKey, 
    Poseidon,
    MerkleMap,
    MerkleMapWitness
   } from 'o1js';


   // limitations on the game 
   const MAX_NUM_PLANETS = 10000;
   const MAX_NUM_PLAYERS = 1000;


   // playerNullifier is a Merkle Map (key: Player, Value: State) to store player state:
   // The key is the address, the value is the player initiation state 
   // if value is Field(0), the address is not in the whitelist.
   // if value is Field(1), the address is in the whitelist, but player has not initiated a homeworld.
   // if value is Field(2), the address is in the whitelist, and player has initiated a homeworld.
   const UNINITIALIZED_VALUE = Field(0);
   const WHITELISTED_VALUE = Field(1);
   const HOMEWORLD_SET_VALUE = Field(2);
   
   

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
  @state(Field) numberofWhiteListedPlayers = State<Field>();

  // Merkle Map to store player Address (Key) and Planet (value), to store who owns which planet
  @state(Field) mapRoot = State<Field>();
  @state(Field) playerNullifierRoot = State<Field>();

  // initial values
  // - set gameRadius to 100
  // - set numberOfPlanets to 0 
  init() {
    super.init();
    this.gameRadius.set(Field(100))
    this.numberOfPlanets.set(Field(0))
    this.numberofWhiteListedPlayers.set(Field(0))
  }

  // initialize the mapRoot, and playerNullifierRoot
  @method initMap(initialMapRoot: Field, initialPlayerNullifierRoot: Field) {
    this.mapRoot.set(initialMapRoot);
    this.playerNullifierRoot.set(initialPlayerNullifierRoot);
  }


  // add elgible addresses, set value to Field(1), in playerNullifier
  @method addEligibleAddress(
    addressToAdd: PublicKey,
    keyWitness: MerkleMapWitness,
  ) {
    // STEP 1: change address to key
    const keyToAdd = Poseidon.hash(addressToAdd.toFields());

    // STEP 2: check if the number of addresses reached MAX_NUM_PLANETS
    const playersNumBefore = this.numberofWhiteListedPlayers.getAndRequireEquals();
    playersNumBefore.assertLessThan(MAX_NUM_PLANETS);

    // STEP 3: check if the address is already in the whitelist
    const nullRootBefore = this.playerNullifierRoot.getAndRequireEquals();

    const [ derivedNullRoot, key ] = keyWitness.computeRootAndKey(UNINITIALIZED_VALUE);
    derivedNullRoot.assertEquals(nullRootBefore);
    key.assertEquals(keyToAdd);

    // STEP 3: add whitelist address to the merkle map, by updating the root
    const [ nullRootAfter, _ ] = keyWitness.computeRootAndKey(WHITELISTED_VALUE);
    this.playerNullifierRoot.set(nullRootAfter);

    // STEP 4: increment numPlayers
    const playersNumAfter = playersNumBefore.add(Field(1));
    this.numberofWhiteListedPlayers.set(playersNumAfter);
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
