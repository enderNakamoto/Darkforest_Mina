import { 
    Field, 
    SmartContract, 
    state,
    State, 
    method, 
} from 'o1js';

import { Const } from '../lib/const';}

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


    // method to create a planet
    @method createPlanet() {
    }


    // method to set planetary defense 
    @method setPlanetaryDefense() {
    }

    // method to attack a planet

    // method to compute the outcome of an attack

    // method to collect forfiet on a planet

}