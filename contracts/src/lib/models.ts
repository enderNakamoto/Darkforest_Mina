import { Struct, Field, CircuitString } from 'o1js';

// Structs 
export class Fleet extends Struct({
    playerId: Field, 
    battleships: Field,
    destroyers: Field,
    carriers: Field
  }){
    strength(){
      const fleetStrength = this.battleships.add(this.destroyers).add(this.carriers);
      return fleetStrength;
    };
  };
 
export class PlanetDetails extends Struct({
     name: CircuitString,
     faction: Field,
     points: Field,
}){}