import { Field, SmartContract, state, State, method, Struct, PublicKey, Poseidon } from 'o1js';


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

// TODO for Fleet Movement 

// 1.Make sure Fleet movement is within boudary (mxDistance)
// 2. Compute Attack and Defence 

export class FleetContract extends SmartContract {

  init() {
    super.init();
  }

  // During the fleet’s movement, 
  // the move circuit checks the moving range does not exceed a circular area of radius distMax:
  @method moveFleet() {
    // to do - initiate a Planet
  }
}
