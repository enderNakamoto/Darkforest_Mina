import { Field, method, ZkProgram } from 'o1js';
import { Fleet } from '../../utils/globalTypes.js';
import {Const} from '../../utils/const.js';

const SimpleBattleProof = ZkProgram({
  name: "simple-battle-proof",
  publicInput: Fleet,

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

          const result = battleshipsBeatsDestroyers.add(destroyersBeatsCarriers).add(carriersBeatsBattleships);

          return result;
      },
    }
  }
});