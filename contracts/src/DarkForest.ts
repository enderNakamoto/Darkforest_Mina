import { Field, SmartContract, state, State, method, Struct, PublicKey } from 'o1js';

// this has to be private
export class Position extends Struct({
  x: Field,
  y: Field,
  panetId: Field
}){ }

export class Planet extends Struct({
  id: Field,
  population: Field,
  position: Position,
  populationCap: Field,
  populationGrowth: Field,
  ore: Field,
  oreCap: Field,
  oreGrowth: Field,
}){ }

export class Movement extends Struct({
  id: Field,
  initiator: PublicKey,
  fromPlanet: Field,
  toPlanet: Field,
  popArriving: Field,
  oreMoved: Field,
  departureTime: Field,
  arrivalTime: Field
}){ }


export class DarkForest extends SmartContract {

  init() {
    super.init();
  }

  // init Circuit ensures the coordinate falls in certain range during the creation of planet. 
  // Both x and y coordinates cannot exceed 2³²
  @method initiatePlanet() {
    // to do - initiate a Planet
  }


  // During the fleet’s movement, 
  // the move circuit checks the moving range does not exceed a circular area of radius distMax:
  @method moveFleet() {
    // to do - initiate a Planet
  }
}
