import { Field, Provable, ZkProgram } from 'o1js';
import { Fleet } from '../../utils/globalTypes.js';
import {Const} from '../../lib/old_const.js';

const SimpleBattle= ZkProgram({
  name: "simple-battle-proof",
  publicInput: Fleet,
  publicOutput: Field,

  methods: {
    calculate: {
      privateInputs: [Fleet],

      method(attackFleet: Fleet, defenseFleet: Fleet) {
        const attackeBattleships = attackFleet.battleships.mul(Const.BATTLESHIP_COST);
        const attackeDestroyers = attackFleet.destroyers.mul(Const.DESTROYER_COST);
        const attackeCarriers = attackFleet.carriers.mul(Const.CARRIER_COST);

        const defenderBattleships = defenseFleet.battleships.mul(Const.BATTLESHIP_COST);
        const defenderDestroyers = defenseFleet.destroyers.mul(Const.DESTROYER_COST);
        const defenderCarriers = defenseFleet.carriers.mul(Const.CARRIER_COST);

          // battleships > destroyers
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

          return calculatedWinner;    
      },
    }
  }
});

export let BattleProof_ = ZkProgram.Proof(SimpleBattle);
export class BattleProof extends BattleProof_ {}