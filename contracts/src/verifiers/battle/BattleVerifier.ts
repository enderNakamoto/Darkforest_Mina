import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    Provable,
    Poseidon,
    MerkleMapWitness
   } from 'o1js';

import { Errors } from '../../lib/old_errors';
import { Const } from '../../lib/old_const';
import { Fleet, Planet } from '../../utils/globalTypes';
import { verifyFleetStrength } from '../../lib/gameLogic';

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

export class BattleVerifier extends SmartContract {

  // public state stored in Mina blockchain
  @state(Field) numberOfBattles = State<Field>();
  @state(Field) battleHistoryMapRoot = State<Field>();
  @state(Field) PlanetStateMapRoot = State<Field>();

  // events emitted by the smart contract  
  events = {
    "battle winner": Field,
    "planet attacked": Field,
  }

  // initialize the smart contract
  init() {
      super.init();
      this.numberOfBattles.set(Field(0));
  }

  initBattleHistory(_initialBattleHistoryMapRoot: Field, 
    _initialPlanetStateMapRoot: Field){
      this.battleHistoryMapRoot.set(_initialBattleHistoryMapRoot);
      this.PlanetStateMapRoot.set(_initialBattleHistoryMapRoot);
  }


  @method attackPlanet(
    attackingFleet: Fleet,
    target: Planet,
    planetKeyWitness: MerkleMapWitness
  ){
    // STEP 0: make sure that the attacking army is valid
    verifyFleetStrength(attackingFleet);

    // STEP 2 : set the attacking fleet
    target.attackingFleet = attackingFleet;

     // STEP 2: update the defense
     const planetHash = Poseidon.hash(Planet.toFields(target));
     const [planetMapRoot, _] = planetKeyWitness.computeRootAndKey(planetHash);
     this.PlanetStateMapRoot.set(planetMapRoot);

  }

  // update the defense of a planet
  @method computeBattle(
      attackFleet: Fleet,
      defenseFleet: Fleet,
      battleKeyWitness: MerkleMapWitness
  )
  {
      // STEP 0: make sure that the attacking army is valid
      verifyFleetStrength(attackFleet);
    
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