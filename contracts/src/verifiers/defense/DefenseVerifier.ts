import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method,
    Poseidon,
    MerkleMapWitness
   } from 'o1js';

import { Errors } from '../../lib/old_errors';
import { Fleet } from '../../utils/globalTypes';
import { verifyFleetStrength } from '../../lib/gameLogic';


  export class DefenseVerifier extends SmartContract {

    // public state storaed in Mina blockchain
    @state(Field) numDefenses = State<Field>();
    @state(Field) defenseRoot = State<Field>();

    // events emitted by the smart contract  
    events = {
      "defense updated": Field,
    }

    // initialize the smart contract
    init() {
      super.init();
      this.numDefenses.set(Field(0));
    }

    @method initDefenses(_initialDefenseRoot: Field){
      this.defenseRoot.set(_initialDefenseRoot);
    }

    // update the defense of a planet
    @method updateDefense(
      planetId: Field,
      defense: Fleet, 
      planetKeyWitness: MerkleMapWitness
    ){

      // STEP 1: make sure that the defense set is valid
      verifyFleetStrength(defense);

      // STEP 2: update the defense
      const defenseHash = Poseidon.hash(Fleet.toFields(defense));
      const [defenseRoot, _] = planetKeyWitness.computeRootAndKey(defenseHash);
      this.defenseRoot.set(defenseRoot);

      // STEP 3: Increment the number of planets with defense
      const currentDefensesSet = this.numDefenses.getAndRequireEquals();
      this.numDefenses.set(currentDefensesSet.add(Field(1)));

      // STEP 3: emit the event
      this.emitEvent("defense updated", planetId);
    }

    


  }