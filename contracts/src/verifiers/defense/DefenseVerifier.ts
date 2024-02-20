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



  export class Fleet extends Struct({
    battleships: Field,
    destroyers: Field,
    carriers: Field
  }){
    strength(){
      const fleetSTrength = this.battleships.add(this.destroyers).add(this.carriers);
      return fleetSTrength;
    };
  }

  export class DefenseVerifier extends SmartContract {
    @state(Field) defenseRoot = State<Field>();

    events = {
      "defense updated": Field,
    }


    @method updateDefense(
      planetId: Field,
      defense: Fleet, 
      planetKeyWitness: MerkleMapWitness
    ){

      // STEP 1: make sure that the defense set is valid
      const fleetStrength = defense.strength();
      fleetStrength.assertLessThan(1000, "defense strength must be less than 1000");

      // STEP 2: update the defense
      const defenseHash = Poseidon.hash(Fleet.toFields(defense));
      const [defenseRoot, _] = planetKeyWitness.computeRootAndKey(defenseHash);
      this.defenseRoot.set(defenseRoot);

      // STEP 3: emit the event
      this.emitEvent("defense updated", planetId);
    }


  }