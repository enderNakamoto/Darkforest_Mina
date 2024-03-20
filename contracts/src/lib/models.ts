import { Struct, Field, CircuitString } from 'o1js';

// Structs 
export class Fleet extends Struct({
    playerId: Field, 
    battleships: Field,
    destroyers: Field,
    carriers: Field
  }){
    strength(){
      const fleetSTrength = this.battleships.add(this.destroyers).add(this.carriers);
      return fleetSTrength;
    };
  };
 
export class PlanetDetails extends Struct({
     name: CircuitString,
     coordinateHash: Field,
     faction: Field,
     status: Field,
     points: Field,
     owner: Field,
     defense: Fleet,
     incomingAttack: Fleet,
}){}