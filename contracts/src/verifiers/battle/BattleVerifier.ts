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

import { Errors } from '../../utils/errors';
import { Fleet } from '../../utils/globalTypes';

import { BattleProof } from './SimpleBattleProof';


  export class BattleVerifier extends SmartContract {

    // public state stored in Mina blockchain
      @state(Field) numberOfBattles = State<Field>();
      @state(Field) battleHistoryMapRoot = State<Field>();

    // events emitted by the smart contract  
    events = {
      "battle winner": Field,
    }


    // initialize the smart contract
    init() {
        super.init();
        this.numberOfBattles.set(Field(0));
    }

    // update the defense of a planet
    @method verifyWinner(
        battleProof: BattleProof,
    ){
        // STEP 1 : verify the battle proof

        // STEP 2 : Set the winner 

        // STEP 3 : Increment the number of battles

    }


  }