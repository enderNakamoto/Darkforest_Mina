import {
    Field,
    MerkleMap
  } from 'o1js';

const emptyMerkleMap = new MerkleMap();  

export namespace Const {

    // initial values for the game
    export const EMPTY_MAP_ROOT = emptyMerkleMap.getRoot();
    export const MAX_GAME_MAP_LENGTH = Field(1000000); // initiates 1_000_000 x 1_000_000 grid

    // game limitations
    export const MAX_NUM_PLANETS = 1000;

    // nullifier states
    export const UNINITIALIZED_VALUE = Field(0);


}