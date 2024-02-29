import { Struct, Field } from 'o1js';

// interfaces
export interface Coordinate{
    x: number;
    y: number;
}

// structs     
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

 export class Planet extends Struct({
    owner: Field,
    defense: Fleet,
    attackingFleet: Fleet,
 }){}