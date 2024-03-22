import { 
    Field, 
    SmartContract, 
    state,
    State, 
    method,
    PublicKey,
    CircuitString, 
    MerkleMapWitness,
    Poseidon
} from 'o1js';

import { Const } from '../lib/const';
import { PlanetDetails, Fleet } from '../lib/models';
import { Errors } from '../lib/errors';
import { verifyFleetStrength } from '../lib/gameLogic';

export class DarkArmada extends SmartContract {

    /**
     * State variables. on-chain game state
     */
    @state(Field) numberOfPlanets = State<Field>();
    // Planet Ledger Merkle Map - (key, value) pair is (playerAddress, homePlanetHash)
    @state(Field) ledgerRoot = State<Field>(); 
    // Planet Details Merkle Map - (key, value) pair is (homePlanetHash, PlanetDetailsHash)
    @state(Field) detailsRoot = State<Field>();
    // Planet Attacks Merkle Map - (key, value) pair is (homePlanetHash, incomingAttachHash)
    @state(Field) attacksRoot = State<Field>();
    // Planet Defense Merkle Map - (key, value) pair is (homePlanetHash, planetaryDefenseHash)
    @state(Field) defensesRoot = State<Field>();
    // Planet Last attacked Merkle Map - (key, value) pair is (homePlanetHash, lastAttackTime)
    @state(Field) historyRoot = State<Field>();

    /** 
     * Game Events  
    */
    events = { 
        "Planet Created": Field,
        "Defense Set": Field,
        "Attack Launched": Field,
        "Battle Concluded": Field,
        "Forfeit Claimed": Field,
    }

    // constructor 
    init() {
        super.init();
        this.numberOfPlanets.set(Field(0));
        this.ledgerRoot.set(Const.EMPTY_MAP_ROOT);
        this.detailsRoot.set(Const.EMPTY_MAP_ROOT);
        this.attacksRoot.set(Const.EMPTY_MAP_ROOT);
        this.defensesRoot.set(Const.EMPTY_MAP_ROOT);
        this.historyRoot.set(Const.EMPTY_MAP_ROOT);
      }


    /**
     * Verify all the requirements to create a planet, and update on-chain states.
     * 
     * @param name
     * @param faction
     * @param x
     * @param y
     * @param planetHash
     * @param ledgerKeyWitness
     * @param planetDetailsKeyWitness
     */
    @method createPlanet(
        name: CircuitString, 
        faction: Field, 
        x: Field, 
        y: Field, 
        planetHash: Field,
        ledgerKeyWitness: MerkleMapWitness, 
        planetDetailsKeyWitness: MerkleMapWitness
    ) {
        let ledgerRootAfter, detailsRootAfter, _

        // verify that the max number of planets has not been reached
        const numPlanetsState = this.numberOfPlanets.getAndRequireEquals();
        numPlanetsState.assertLessThan(Const.MAX_NUM_PLANETS, Errors.MAX_NUM_PLANETS_ERROR);

        // verify that the player has not already created a home planet
        const ledgerState = this.ledgerRoot.getAndRequireEquals();
        const [ derivedledgerRoot, derivedledgerKey ] = ledgerKeyWitness.computeRootAndKey(Const.UNINITIALIZED_VALUE);
        derivedledgerRoot.assertEquals(ledgerState, Errors.PLANET_ALREADY_EXISTS_ERROR);
        derivedledgerKey.assertEquals(Poseidon.hash(this.sender.toFields()), Errors.PLANET_ALREADY_EXISTS_ERROR);


        // verify that the planet is within the game map
        x.assertLessThan(Const.MAX_GAME_MAP_LENGTH, Errors.COORDINATE_OUT_OF_RANGE_ERROR);
        y.assertLessThan(Const.MAX_GAME_MAP_LENGTH, Errors.COORDINATE_OUT_OF_RANGE_ERROR);

        // verify that the planet coordiantes are not taken
        const detailsState = this.detailsRoot.getAndRequireEquals();
        const [ derivedDetailsRoot, derivedDetailsKey ] = planetDetailsKeyWitness.computeRootAndKey(Const.UNINITIALIZED_VALUE);
        derivedDetailsRoot.assertEquals(detailsState, Errors.PLANET_ALREADY_EXISTS_ERROR);
        derivedDetailsKey.assertEquals(planetHash, Errors.PLANET_ALREADY_EXISTS_ERROR);

        // x,y coordinate hash must be less than the difficulty cutoff
        planetHash.assertLessThan(Const.BIRTHING_DIFFICULTY_CUTOFF, Errors.COORDINATE_NOT_SUITABLE_ERROR);

        // update merkle maps with the new planet details
        const planetDetails = new PlanetDetails({name, faction, points: Field(0)});
        const planetDetailsHash = Poseidon.hash(PlanetDetails.toFields(planetDetails));

        [ detailsRootAfter, _ ] = planetDetailsKeyWitness.computeRootAndKey(planetDetailsHash);
        this.detailsRoot.set(detailsRootAfter);

        [ ledgerRootAfter, _ ] = ledgerKeyWitness.computeRootAndKey(planetHash);
        this.ledgerRoot.set(ledgerRootAfter);

        // increase the number of planets
        this.numberOfPlanets.set(numPlanetsState.add(Field(1)));

        // emit the event
        this.emitEvent("Planet Created", planetHash);
    }


    /**
     * Verify all the requirements to update a planet's defense, and update on-chain states.
     * 
     * @param defenseFleet 
     * @param planetHash
     * @param defenseKeyWitness
     * @param ledgerKeyWitness
     */
    @method setPlanetaryDefense(
        defenseFleet: Fleet, 
        planetHash: Field,
        defenseKeyWitness: MerkleMapWitness,
        ledgerKeyWitness: MerkleMapWitness
        ) {

        // verify that the player is the owner of the planet
        const ledgerState = this.ledgerRoot.getAndRequireEquals();
        const [ derivedledgerRoot, derivedledgerKey ] = ledgerKeyWitness.computeRootAndKey(Const.UNINITIALIZED_VALUE);
        

        // verify that the defense fleet is valid
        verifyFleetStrength(defenseFleet);

        // update the defense
        const defenseHash = Poseidon.hash(Fleet.toFields(defenseFleet));
        const [ defenseRootAfter, _ ] = defenseKeyWitness.computeRootAndKey(defenseHash);

        // emit the event
    }

    /**
     * Verify all the requirements to launch an attack, and update on-chain states.
     * 
     * @param attackFleet
     * @param attackKeyWitness
     */
    @method attackPlanet(attackFleet: Fleet, attackKeyWitness: Field) {
        // verify that the attack fleet is valid
        // verify that the planet has a defense
        // verify that the planet is not already under attack
        // update on-chain state with the new attack
        // emit the event
       
    }

    /**
     * Verify all the requirements to resolve an attack, and update on-chain states.
     * 
     * @param attackFleet 
     * @param defenseFleet
     * @param detailKeyWitness
     */
    @method computeBattleOutcome(defenseFleet: Fleet, attackFleet: Fleet, detailKeyWitness: Field) {
        // verify that the attack fleet is not altered
        // verify that the defense fleet is not altered
        // compute the battle outcome
        // update on-chain state with the battle outcome
        // emit the event
    }

    /**
     * Verify all the requirements to claim a forfeit, and update on-chain states.
     * 
     * @param attackingPlayer 
     * @param detailKeyWitness - defending player's home planet details
     */
    @method claimForfeit(attackingPlayer: PublicKey, detailKeyWitness: Field) {
        // verify that the player who attacked is the one claiming the forfeit
        // verify that the battle is not computed in 24 hours 
        // update on-chain state with the forfeit
        // emit the event
    }

}