import { 
    Field, 
    SmartContract, 
    state,
    State, 
    method,
    PublicKey,
    CircuitString, 
} from 'o1js';

import { Const } from '../lib/const';
import { Fleet } from '../lib/models';

export class DarkArmada extends SmartContract {

    /**
     * State variables. on-chain game state
     */
    @state(Field) numberOfPlanets = State<Field>();
    @state(Field) numberofAttacks = State<Field>();
    // max side(N) of NxN game map
    @state(Field) gameMapSize = State<Field>(); 
    // Planet Ledger Merkle Map key, value pair is (playerAddress, homePlanetHash)
    @state(Field) planetLedgerRoot = State<Field>(); 
    // Planet Details Merkle Map key, value pair is (homePlanetHash, PlanetDetailsHash)
    @state(Field) planetDetailsRoot = State<Field>();
    // Planet Attacks Merkle Map key, value pair is (homePlanetHash, incomingAttachHash)
    @state(Field) planetAttacksRoot = State<Field>();
    // Planet Defense Merkle Map key, value pair is (homePlanetHash, planetaryDefenseHash)
    @state(Field) planetDefenseRoot = State<Field>();


    /** 
     * Game Events  
    */
    events = { 
        "New Homeworld Founded: A New player has joined": Field,
        "Homeworld Defense Updated: Planetary Defenses updated. Bring it on!": Field,
        "Attack Launched: Attack Fleet launched": Field,
        "Attack Vanquished: The Defense fleet successfully repelled the aggresors": Field,
        "Dfense Breached: The Defense fleet was overpowered": Field,
        "Forfeit Claimed: The Defense fleet fled like cowards": Field,
    }

    // constructor 
    init() {
        super.init();
        this.numberOfPlanets.set(Field(0));
        this.numberofAttacks.set(Field(0));
        this.gameMapSize.set(Const.INITIAL_GAME_LENGTH);
        this.planetLedgerRoot.set(Const.EMPTY_MAP_ROOT);
        this.planetDetailsRoot.set(Const.EMPTY_MAP_ROOT);
        this.planetAttacksRoot.set(Const.EMPTY_MAP_ROOT);
        this.planetDefenseRoot.set(Const.EMPTY_MAP_ROOT);

      }


    /**
     * Verify all the requirements to create a planet, and update on-chain states.
     * 
     * @param name
     * @param faction
     * @param x
     * @param y
     * @param ledgerKeyWitness
     * @param planetDetailsKeyWitness
     */
    @method createPlanet(name: CircuitString, faction: Field, x: Field, y: Field, ledgerKeyWitness: Field, planetDetailsKeyWitness: Field) {
        // verify that the player has not already created a home planet
        // verify that the planet is within the game map
        // verify that the planet coordiantes are not taken
        // x,y coordinate hash must be less than the difficulty cutoff
        // update merkle maps with the new planet details
        // increase the number of planets
        // emit the event
    }


    /**
     * Verify all the requirements to update a planet's defense, and update on-chain states.
     * 
     * @param DefenseFleet 
     * @param defenseKeyWitness
     */
    @method setPlanetaryDefense(defenseFleet: Fleet, defenseKeyWitness: Field) {
        // verify that the defense fleet is valid
        // update the defense
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
        // verify that the attack fleet is valid
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