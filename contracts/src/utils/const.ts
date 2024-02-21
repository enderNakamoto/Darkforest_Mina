import {
    Field,
  } from 'o1js';


export namespace Const {

    // initial values
    export const INITIAL_GAME_RADIUS = Field(1000); // initiates pi * 1000 * 1000 grid 
    export const INITIAL_GAME_LENGTH = Field(1000); // initiates 1000 x 1000 grid


    // game limitations 
    export const MAX_NUM_PLANETS = 10000;
    export const MAX_NUM_PLAYERS = 1000;
    export const MAX_LENGTH = 1000000;
    export const MAX_RADIUS = 1000000;


    // Initial Planet Values
    export const INITIAL_POPULATION = Field(1000);
    export const INITIAL_POPULATION_CAP = Field(10000);
    export const INITIAL_POPULATION_GROWTH = Field(10);
    export const INITIAL_ORE = Field(1000);
    export const INITIAL_ORE_CAP = Field(10000);
    export const INITIAL_ORE_GROWTH = Field(10);

    // determine how spread out the planets are
    export const DIFFICULTY_CUTOFF = Field(100000007457839956419684630393576868452302619104417668738877266031346568);
    // determines how hard browser should work to find a planet
    export const TRIES = 1000000;

    // player Nullifier Ssates 
    export const UNINITIALIZED_VALUE = Field(0);
    export const WHITELISTED_VALUE = Field(1);
    export const HOMEWORLD_SET_VALUE = Field(2);

    // fleet values
    export const BATTLESHIP_COST = Field(4);
    export const DESTROYER_COST = Field(2);
    export const CARRIER_COST = Field(6);
}








