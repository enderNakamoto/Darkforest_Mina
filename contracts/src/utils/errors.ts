export namespace Errors {
    // Defense Verifier Errors
    export const FLEET_STRENGTH_ERROR = 'fleet strength must be less than max fleet strength';

    // Planet Creation Verifier Errors
    export const ALREADY_WHITELISTED_ERROR = 'player already in whitelist';
    export const NOT_WHITELISTED_ERROR = 'player not in whitelist';
    export const HOMEWORLD_ALREADY_INITIATED_ERROR = 'homeworld has already been initiated for this player';
    export const PLAYER_CANNOT_INITIATE_ERROR = 'player is not in whitelist, or has already initiated a homeworld';
    export const MAX_NUM_PLANETS_ERROR = 'maximum number of planets reached';
    export const COORDINATE_OUT_OF_RANGE_ERROR = 'coordinate out of range';
    export const PLANET_INIT_WRONG_VALUES_ERROR = 'planet initialized with wrong values';
    export const NOT_ADMIN_ERROR = 'the caller is not admin';
}