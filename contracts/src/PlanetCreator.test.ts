import { PlanetCreator } from './PlanetCreator';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'o1js';

let proofsEnabled = false;

describe('PlanetCreator', () => {
    let deployerAccount: PublicKey,
      deployerKey: PrivateKey,
      senderAccount: PublicKey,
      senderKey: PrivateKey,
      zkAppAddress: PublicKey,
      zkAppPrivateKey: PrivateKey,
      zkApp: PlanetCreator;
  
    beforeAll(async () => {
      if (proofsEnabled) await PlanetCreator.compile();
    });
  
    beforeEach(() => {
      const Local = Mina.LocalBlockchain({ proofsEnabled });
      Mina.setActiveInstance(Local);
      ({ privateKey: deployerKey, publicKey: deployerAccount } =
        Local.testAccounts[0]);
      ({ privateKey: senderKey, publicKey: senderAccount } =
        Local.testAccounts[1]);
      zkAppPrivateKey = PrivateKey.random();
      zkAppAddress = zkAppPrivateKey.toPublicKey();
      zkApp = new PlanetCreator(zkAppAddress);
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

    it('generates and deploys the PlanetCreator smart contract, and initializes correctly', async () => {
        await localDeploy();
        const gameRadius = zkApp.gameRadius.get();
        expect(gameRadius).toEqual(Field(100));
        const numberOfPlanets = zkApp.numberOfPlanets.get();
        expect(numberOfPlanets).toEqual(Field(0));
    });
  
});
