import {
    Field,
    UInt64,
    MerkleMap, 
    MerkleTree,
  } from 'o1js';

const emptyMerkleMap = new MerkleMap();  
const emptyMerkleTree12 = new MerkleTree(12);

export namespace Const {

    // initial values for the game
    export const EMPTY_MAP_ROOT = emptyMerkleMap.getRoot();
    export const EMPTY_TREE_ROOT12 = emptyMerkleTree12.getRoot();
    export const MAX_GAME_MAP_LENGTH = Field(10000); // initiates 10000 x 10000 grid
    export const BIRTHING_DIFFICULTY_CUTOFF = Field(9999999999999999999999684630393576868452302619104417668738877266031346568);

    // game limitations
    export const MAX_NUM_PLANETS = 1000;

    // nullifier states
    export const UNINITIALIZED_VALUE = Field(0);

    // planet defense states
    export const PLANETARY_DEFENSE_NOT_SET = Field(0);

    // planet attack states
    export const NOT_UNDER_ATTACK = Field(0);

    // fleet values
    export const BATTLESHIP_STRENGTH= Field(4);
    export const DESTROYER_STRENGTH= Field(2);
    export const CARRIER_STRENGTH= Field(6);
    export const MAX_FLEET_STRENGTH = Field(1000);

    // forfeit const 
    export const FORFEIT_CLAIM_DURATION = UInt64.from(86400000); // 24 hours in milliseconds

}