import { Struct, Field } from 'o1js';

// interfaces
export interface Coordinate{
    x: number;
    y: number;
}

// structs     
export class Fleet extends Struct({
   battleships: Field,
   destroyers: Field,
   carriers: Field
 }){
   strength(){
     const fleetSTrength = this.battleships.add(this.destroyers).add(this.carriers);
     return fleetSTrength;
   };
 };