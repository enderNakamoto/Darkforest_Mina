import {
    Field,
  } from 'o1js';


export namespace Const {
    // game limitations 
    export const MAX_NUM_PLANETS = 10000;
    export const MAX_NUM_PLAYERS = 1000;
    export const MAX_LENGTH = 1000000;
    export const MAX_RADIUS = 1000000;

    // determine how spread out the planets are
    export const DIFFICULTY_CUTOFF = Field(100000007457839956419684630393576868452302619104417668738877266031346568);
    // determines how hard browser should work to find a planet
    export const TRIES = 1000000;

    // player Nullifier Ssates 
    export const UNINITIALIZED_VALUE = Field(0);
    export const WHITELISTED_VALUE = Field(1);
    export const  HOMEWORLD_SET_VALUE = Field(2);

    // Error Messages
    export const ALREADY_WHITELISTED_ERROR = 'address already in whitelist';
    export const NOT_WHITELISTED_ERROR = 'address not in whitelist';
    export const HOMEWORLD_ALREADY_INITIATED_ERROR = 'homeworld has already been initiated fopr this player';
    export const PLAYER_CANNOT_INITIATE = 'player is not in whitelist, or has already initiated a homeworld';
}








