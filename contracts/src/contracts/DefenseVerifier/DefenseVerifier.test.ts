import {
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    AccountUpdate,
    Signature,
    MerkleTree, 
    CircuitString, 
    Poseidon,
    MerkleMap
  } from 'o1js';

  import { DefenseVerifier, Fleet } from './DefenseVerifier';

  let proofsEnabled = false;


  function createFLeet(battleships: Field, destroyers: Field, carriers: Field){
    return new Fleet({
      battleships,
      destroyers,
      carriers
    });
  }

  describe('OdometerVerifier', () => {
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

    beforeEach(() => {
      const Local = Mina.LocalBlockchain({ proofsEnabled });
      Mina.setActiveInstance(Local);
      ({ privateKey: deployerKey, publicKey: deployerAccount } =Local.testAccounts[0]);
      ({ privateKey: senderKey, publicKey: senderAccount } =
        Local.testAccounts[1]);
      zkAppPrivateKey = PrivateKey.random();
      zkAppAddress = zkAppPrivateKey.toPublicKey();
      zkApp = new DefenseVerifier(zkAppAddress);
    });

    async function localDeploy() {
      const txn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkApp.deploy();
      });
      await txn.prove();
      // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
      await txn.sign([deployerKey, zkAppPrivateKey]).send();
    }

    it('makes sure the defense fleet is not more than 1000', async() => {
    });
  });

