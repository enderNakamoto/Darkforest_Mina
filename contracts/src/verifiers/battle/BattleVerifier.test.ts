import {
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    AccountUpdate,
    Poseidon,
    MerkleMap
  } from 'o1js';

  import { Fleet } from '../../utils/globalTypes';
  import { BattleVerifier } from './BattleVerifier';
  import  { Errors } from '../../utils/errors';


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
    battleMerkleMap: MerkleMap;

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

      // deploy defense verifier
      await localDeployandInitate();

    });

    async function localDeployandInitate() {
      const txn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkApp.deploy();
        zkApp.initBattleHistory(battleMerkleMap.getRoot());
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
    });

    it('calculates right attacker', async() => {

        const attackerId = Field(1);
        const defenderId = Field(2);

        const attacker = createFLeet(attackerId, Field(10), Field(20), Field(30));
        const defender = createFLeet(defenderId, Field(5), Field(10), Field(15));
    
        const winner = zkApp.calculateWinner(attacker, defender);
        expect(winner).toEqual(Field(1));

    });

  });