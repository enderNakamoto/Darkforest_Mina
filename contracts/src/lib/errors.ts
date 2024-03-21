import {
    Field,
  } from 'o1js';


export namespace ERRORS {

    // create a new planet error messages
    export const COORDINATE_OUT_OF_RANGE_ERROR = 'Coordinate out of range';
    export const PLANET_NOT_FOUND_ERROR = 'Planet not found';
    export const PLANET_ALREADY_EXISTS_ERROR = 'Planet already exists';
    
    // set defense error messages
    export const DEFENSE_FLEET_ERROR = 'Planetary defense does not meet requirements';

    // attack error messages
    export const PLANET_UNDER_ATTACK_ERROR = 'Planet is already under attack';
    export const NO_DEFENSE_ERROR = 'Planet has no defense';
    export const INVALID_ATTACK_FLEET_ERROR = 'Invalid attack fleet';

    // resolve attack error messages
    export const ATTACK_DOES_NOT_MATCH_ERROR = 'Attack does not match';
    export const DEFENSE_DOES_NOT_MATCH_ERROR = 'Defense does not match';

    // forfeit error messages
    export const FORFEIT_CLAIM_ERROR = 'Forfeit can not be claimed';

}