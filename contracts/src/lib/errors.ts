import {
    Field,
  } from 'o1js';


export namespace Errors {

    // create a new planet error messages
    export const COORDINATE_OUT_OF_RANGE_ERROR = 'Coordinate out of range';
    export const PLANET_NOT_FOUND_ERROR = 'Planet not found';
    export const PLANET_ALREADY_EXISTS_ERROR = 'Planet already exists';
    export const MAX_NUM_PLANETS_ERROR = 'Max number of planets reached';
    export const COORDINATE_NOT_SUITABLE_ERROR = 'Coordinate not suitable for planet creation';
    
    // fleet error messages
    export const FLEET_STRENGTH_ERROR = 'Fleet strength too high';

    // attack error messages
    export const PLANET_UNDER_ATTACK_ERROR = 'Planet is already under attack';
    export const NO_DEFENSE_ERROR = 'Planet has no defense';


    // resolve attack error messages
    export const ATTACK_DOES_NOT_MATCH_ERROR = 'Attack does not match';
    export const DEFENSE_DOES_NOT_MATCH_ERROR = 'Defense does not match';

    // forfeit error messages
    export const FORFEIT_CLAIM_ERROR = 'Forfeit can not be claimed';

}