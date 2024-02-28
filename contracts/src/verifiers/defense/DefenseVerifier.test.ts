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
  import { DefenseVerifier } from './DefenseVerifier';
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

  describe('DefenseVerifier', () => {
    let deployerKey: PrivateKey, 
    deployerAccount: PublicKey,
    senderKey: PrivateKey,
    senderAccount: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkApp: DefenseVerifier,
    defenseMap: MerkleMap;

    beforeAll(async () => {
      if (proofsEnabled) await DefenseVerifier.compile();
    });

    beforeEach(async () => {
      // setup a local blockchain 
      const Local = Mina.LocalBlockchain({ proofsEnabled });
      Mina.setActiveInstance(Local);

      // Local.testAccounts is an array of 10 test accounts that have been pre-filled with Mina, 
      // we initalize deploment and sender accounts
      ({ privateKey: deployerKey, publicKey: deployerAccount } =Local.testAccounts[0]);
      ({ privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1]);

      // create a new DefenseVerifier instance
      zkAppPrivateKey = PrivateKey.random();
      zkAppAddress = zkAppPrivateKey.toPublicKey();
      zkApp = new DefenseVerifier(zkAppAddress);

      // initialize the defense map
      defenseMap = new MerkleMap();

      // deploy defense verifier
      await localDeployandInitate();

    });

    async function localDeployandInitate() {
      const txn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkApp.deploy();
        zkApp.initDefenses(defenseMap.getRoot());
      });
      await txn.prove();

      // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
      await txn.sign([deployerKey, zkAppPrivateKey]).send();
    }

    it('deploy and initialize the defense verifier', async () => {

      const planetsWIthDefense = zkApp.numDefenses.get();
      expect(planetsWIthDefense).toEqual(Field(0));

      const defenseRoot = zkApp.defenseRoot.get();
      expect(defenseRoot).toEqual(defenseMap.getRoot());
    });

    it('cannot add defense if fleet strength is over 1000', async() => {

      let planetId = Field(1);
      let planetKeyWitness = defenseMap.getWitness(planetId);

      let inValidDefenseFleet = createFLeet(Field(1), Field(500), Field(300), Field(300));

      expect(async () => {
        let txn = await Mina.transaction(senderAccount, () => {
          zkApp.updateDefense(planetId, inValidDefenseFleet, planetKeyWitness);
        });
      }).rejects.toThrow(Errors.FLEET_STRENGTH_ERROR);
    });

    it('can add defense if fleet strength is less than 1000', async() => {

      let planetId = Field(1);
      let planetKeyWitness = defenseMap.getWitness(planetId);

      let validDefenseFleet = createFLeet(Field(2),Field(500), Field(300), Field(200));
      const validDefenseHash = Poseidon.hash(Fleet.toFields(validDefenseFleet));
      defenseMap.set(planetId, validDefenseHash);

      let txn = await Mina.transaction(senderAccount, () => {
        zkApp.updateDefense(planetId, validDefenseFleet, planetKeyWitness);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();

      const defenseRoot = zkApp.defenseRoot.get();
      expect(defenseRoot).toEqual(defenseMap.getRoot());

      const numberOfSetDefenses = zkApp.numDefenses.get();
      expect(numberOfSetDefenses).toEqual(Field(1));
    });

  });

