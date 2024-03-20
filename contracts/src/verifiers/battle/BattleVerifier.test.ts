import {
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    AccountUpdate,
    MerkleMap
  } from 'o1js';

  import { Fleet } from '../../utils/globalTypes';
  import { BattleVerifier } from './BattleVerifier';
  import  { Errors } from '../../lib/errors';


  let proofsEnabled = false;


  function createFLeet(playerId: Field, battleships: Field, destroyers: Field, carriers: Field){
    return new Fleet({
      playerId,
      battleships,
      destroyers,
      carriers
    });
  }

  describe('BattleVerifier', () => {
    let deployerKey: PrivateKey, 
    deployerAccount: PublicKey,
    senderKey: PrivateKey,
    senderAccount: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkApp: BattleVerifier,
    battleMerkleMap: MerkleMap,
    planetStateMap: MerkleMap;

    beforeAll(async () => {
      if (proofsEnabled) await BattleVerifier.compile();
    });

    beforeEach(async () => {
      // setup a local blockchain 
      const Local = Mina.LocalBlockchain({ proofsEnabled });
      Mina.setActiveInstance(Local);

      // Local.testAccounts is an array of 10 test accounts that have been pre-filled with Mina, 
      // we initalize deploment and sender accounts
      ({ privateKey: deployerKey, publicKey: deployerAccount } =Local.testAccounts[0]);
      ({ privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1]);

      // create a new BattleVerifier instance
      zkAppPrivateKey = PrivateKey.random();
      zkAppAddress = zkAppPrivateKey.toPublicKey();
      zkApp = new BattleVerifier(zkAppAddress);

      // initialize the defense map
      battleMerkleMap = new MerkleMap();
      planetStateMap = new MerkleMap();

      // deploy defense verifier
      await localDeployandInitate();

    });

    async function localDeployandInitate() {
      const txn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkApp.deploy();
        zkApp.initBattleHistory(battleMerkleMap.getRoot(), planetStateMap.getRoot());
      });
      await txn.prove();

      // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
      await txn.sign([deployerKey, zkAppPrivateKey]).send();
    }

    it('deploy and initialize the defense verifier', async () => {

      const planetsWIthDefense = zkApp.numberOfBattles.get();
      expect(planetsWIthDefense).toEqual(Field(0));

      const battleMapRoot = zkApp.battleHistoryMapRoot.get();
      expect(battleMapRoot).toEqual(battleMerkleMap.getRoot());

      const planetStateMapRoot = zkApp.PlanetStateMapRoot.get();
      expect(planetStateMapRoot).toEqual(planetStateMap.getRoot());
    });

    it('calculates right winner', async() => {

      let battleId = Field(1);
      let battleKeyWitness = battleMerkleMap.getWitness(battleId);

      const attackerId = Field(1);
      const defenderId = Field(2);

      const attackFleet = createFLeet(attackerId, Field(10), Field(20), Field(30));
      const defenseFleet = createFLeet(defenderId, Field(5), Field(10), Field(15));
      
      battleMerkleMap.set(battleId, defenderId);

      let txn = await Mina.transaction(senderAccount, () => {
        zkApp.computeBattle(attackFleet, defenseFleet, battleKeyWitness);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();

      console.log('battleMerkleMap.getRoot()', battleMerkleMap.getRoot());
      console.log('zkApp.battleHistoryMapRoot.get()', zkApp.battleHistoryMapRoot.get());

      const battleHistoryMapRoot = zkApp.battleHistoryMapRoot.get();
      expect(battleHistoryMapRoot).toEqual(battleMerkleMap.getRoot());

      const numberOfSetBattles = zkApp.numberOfBattles.get();
      expect(numberOfSetBattles).toEqual(Field(1));

    });

    it('cannot attack if fleet strength is over max strength', async() => {

      let battleId = Field(1);
      let battleKeyWitness = battleMerkleMap.getWitness(battleId);

      let inValidAttackFleet = createFLeet(Field(1), Field(500), Field(300), Field(300));
      let validDefenseFleet = createFLeet(Field(2), Field(5), Field(3), Field(10));

      expect(async () => {
        let txn = await Mina.transaction(senderAccount, () => {
          zkApp.computeBattle(inValidAttackFleet, validDefenseFleet, battleKeyWitness);
        });
      }).rejects.toThrow(Errors.FLEET_STRENGTH_ERROR);
    });

  });