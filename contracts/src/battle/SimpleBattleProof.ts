import { Field, method, ZkProgram } from 'o1js';
import { Fleet } from '../objects/Fleet.js';
import {Const} from '../utils/const';

 // battleships, destroyers, carriers
const SimpleBattleProof = ZkProgram({
  name: "simple-battle-proof",
  publicInput: Field,

  methods: {
    calculate: {
      privateInputs: [Fleet, Fleet],

      method(
        attacker: Fleet,
        defender: Fleet
      ) {
        const attackeBattleships = attacker.battleships().mul(Const.BATTLESHIP_COST);
        const attackeDestroyers = attacker.destroyers().mul(Const.DESTROYER_COST);
        const attackeCarriers = attacker.carriers().mul(Const.CARRIER_COST);

        const defenderBattleships = defender.battleships().mul(Const.BATTLESHIP_COST);
        const defenderDestroyers = defender.destroyers().mul(Const.DESTROYER_COST);
        const defenderCarriers = defender.carriers().mul(Const.CARRIER_COST);

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