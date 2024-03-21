import { Fleet } from "./models";
import { Const } from "./old_const";
import { Errors } from "./old_errors";

export function verifyFleetStrength(fleet: Fleet){
    const fleetStrength = fleet.strength();
    fleetStrength.assertLessThanOrEqual(Const.MAX_FLEET_STRENGTH, Errors.FLEET_STRENGTH_ERROR);
}