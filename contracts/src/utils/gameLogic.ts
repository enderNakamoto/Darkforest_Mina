import { Fleet } from "./globalTypes";
import { Const } from "./const";
import { Errors } from "./errors";

export function verifyFleetStrength(fleet: Fleet){
    const fleetStrength = fleet.strength();
    fleetStrength.assertLessThanOrEqual(Const.MAX_FLEET_STRENGTH, Errors.FLEET_STRENGTH_ERROR);
}