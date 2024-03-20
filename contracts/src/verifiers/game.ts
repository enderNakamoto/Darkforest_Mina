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

import { Const } from './lib/const';
import { Errors } from '../lib/errors';
import { PlanetDetails, Fleet } from './lib/models';

export class PlanetCreator extends SmartContract {

    // state of the game   
    @state(Field) numberOfPlanets = State<Field>();
    @state(Field) numberofAttacks = State<Field>();

    // Planet Ledger Merkle Map key, value pair is (playerAddress, homePlanetHash)
    @state(Field) planetLedgerRoot = State<Field>(); 
    // Planet Details Merkle Map key, value pair is (homePlanetHash, PlanetDetailsHash)
    @state(Field) planetDetailsRoot = State<Field>();
    // Planet Attacks Merkle Map key, value pair is (homePlanetHash, incomingAttachHash)
    @state(Field) planetAttacksRoot = State<Field>();
    // Planet Defense Merkle Map key, value pair is (homePlanetHash, planetaryDefenseHash)
    @state(Field) planetDefenseRoot = State<Field>();


    // events 

    // constructor 

    // method to initialize the game

    // method to create a planet  

    // method to set planetary defense 

    // method to attack a planet

    // method to compute the outcome of an attack

    // method to collect forfiet on a planet

}


