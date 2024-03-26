import { 
    Field,
    UInt64,
    SmartContract, 
    state,
    State, 
    method,
    PublicKey,
    CircuitString, 
    MerkleMapWitness,
    MerkleWitness,
    Poseidon
} from 'o1js';

import { Const } from '../lib/const';
import { PlanetDetails, Fleet } from '../lib/models';
import { Errors } from '../lib/errors';
import { verifyFleetStrength, calculateWinner } from '../lib/gameLogic';

/**
 * MerkleTree witnesses
 * 
 * @note: The height of the tree is 12, therefor the number of leaves is 2^(12-1) = 2048
 * @note: The max number of planets is 1000, so, the tree is big enough to hold all the planets
 * @note: the index of the leaf is planetId, and the same index(planetId) is used in all the trees, to store the same planet data
 * @note: e.g. leaf 2 in planetTreeWitness, ownershipTreeWitness, detailsTreeWitness, defenseTreeWitness, attackTreeWitness, all represent the same planet(planetId=2)
 */
class planetTreeWitness extends MerkleWitness(12) {} 
class ownershipTreeWitness extends MerkleWitness(12) {}
class detailsTreeWitness extends MerkleWitness(12) {}
class defenseTreeWitness extends MerkleWitness(12) {}
class attackTreeWitness extends MerkleWitness(12) {}

export class DarkArmada extends SmartContract {
    /**
     * State variables. on-chain game state (max 8 fields)
     */
    @state(Field) numberOfPlanets = State<Field>(); // Number of initalized planets
    @state(Field) planetTreeRoot = State<Field>(); // Planet ownership MerkleTree root (index -> planetHash)
    @state(Field) ownershipTreeRoot = State<Field>(); // Planet ownership MerkleTree root (index -> playerAddress)
    @state(Field) detailsTreeRoot = State<Field>(); // Planet Details MerkleTree root (index -> serializedDetails)
    @state(Field) defenseTreeRoot = State<Field>(); // Planetary defense MerkleTree root (index -> defenseHash)
    @state(Field) attackTreeRoot = State<Field>(); // Incoming attack MerkleTree root (index -> serializedAttack)
    @state(Field) playerNullifierRoot = State<Field>(); // Player nullifier MerkleMap root (playerAddress -> numberofOwnedPlanets)
    @state(Field) planetNullifierRoot = State<Field>(); // Planet nullifier MerkleMap root (planetHash -> boolean)


    /** 
     * Game Events  
     */
    events = { 
        "Planet Created": Field,
        "Defense Set": Field,
        "Attack Launched": Field,
        "Battle Concluded": Field,
        "Forfeit Claimed": Field,
    }

    // constructor
    init() {
        super.init();
        this.numberOfPlanets.set(Field(0));
        this.planetTreeRoot.set(Const.EMPTY_TREE_ROOT12);
        this.ownershipTreeRoot.set(Const.EMPTY_TREE_ROOT12);
        this.detailsTreeRoot.set(Const.EMPTY_TREE_ROOT12);
        this.defenseTreeRoot.set(Const.EMPTY_TREE_ROOT12);
        this.attackTreeRoot.set(Const.EMPTY_TREE_ROOT12);
        this.playerNullifierRoot.set(Const.EMPTY_MAP_ROOT);
        this.planetNullifierRoot.set(Const.EMPTY_MAP_ROOT);
      }
}