import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    Provable,
    MerkleMapWitness
   } from 'o1js';

import { Errors } from '../../utils/errors';
import { Const } from '../../utils/const';
import { Fleet } from '../../utils/globalTypes';

function calculateWinner(attackFleet: Fleet, defenseFleet: Fleet): Field{
  const attackeBattleships = attackFleet.battleships.mul(Const.BATTLESHIP_COST);
  const attackeDestroyers = attackFleet.destroyers.mul(Const.DESTROYER_COST);
  const attackeCarriers = attackFleet.carriers.mul(Const.CARRIER_COST);

  const defenderBattleships = defenseFleet.battleships.mul(Const.BATTLESHIP_COST);
  const defenderDestroyers = defenseFleet.destroyers.mul(Const.DESTROYER_COST);
  const defenderCarriers = defenseFleet.carriers.mul(Const.CARRIER_COST);

    //  battleships > destroyers
    const battleshipsBeatsDestroyers = attackeBattleships.sub(defenderDestroyers);

    // destroyers > carriers
    const destroyersBeatsCarriers = attackeDestroyers.sub(defenderCarriers);

    // carriers > battleships
    const carriersBeatsBattleships = attackeCarriers.sub(defenderBattleships);

    const battleResult = battleshipsBeatsDestroyers.add(destroyersBeatsCarriers).add(carriersBeatsBattleships);

    const calculatedWinner = Provable.if(
      battleResult.greaterThanOrEqual(
        Field(0)
      ),
      defenseFleet.playerId,
      attackFleet.playerId
    );

    return calculatedWinner
}  

// function attackFleetVerifier(fleet: Fleet){
//   const fleetStrength = fleet.strength();
//   fleetStrength.assertLessThanOrEqual(Const.MAX_ARMY_STRENGTH, Errors.ARMY_STRENGTH_ERROR);
// }


export class BattleVerifier extends SmartContract {

  // public state stored in Mina blockchain
  @state(Field) numberOfBattles = State<Field>();
  @state(Field) battleHistoryMapRoot = State<Field>();

  // events emitted by the smart contract  
  events = {
    "battle winner": Field,
  }

  // initialize the smart contract
  init() {
      super.init();
      this.numberOfBattles.set(Field(0));
  }

  initBattleHistory(_initialBattleHistoryMapRoot: Field){
      this.battleHistoryMapRoot.set(_initialBattleHistoryMapRoot);
  }

  // update the defense of a planet
  @method computeBattle(
      attackFleet: Fleet,
      defenseFleet: Fleet,
      battleKeyWitness: MerkleMapWitness
  )
  {
      // STEP 1 :calculate the winner
      const winner = calculateWinner(attackFleet, defenseFleet);
      
      // STEP 2 : Set the winner 
      const [battleMapRoot, _] = battleKeyWitness.computeRootAndKey(winner);
      this.battleHistoryMapRoot.set(battleMapRoot);
      
      // STEP 3 : Increment the number of battles
      const currentBattles = this.numberOfBattles.getAndRequireEquals();
      this.numberOfBattles.set(currentBattles.add(Field(1)));

      // STEP 4 : emit the event
      this.emitEvent("battle winner", winner);
  }
}