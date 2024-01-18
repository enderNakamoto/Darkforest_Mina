import {
  Field,
  Bool,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  MerkleMap,
  Poseidon,
  MerkleMapWitness
} from 'o1js';

import { PlanetCreator } from './PlanetCreator';
import { Const } from './helpers/const';

let proofsEnabled = false;

const VALID_COORDINATES = {
  x: Field(10),
  y: Field(10),
};

const INVALID_COORDINATES = {
  x: Field(1000001),
  y: Field(1000001),
};

function initializeRandomPlayer(){
  const playerPrivate = PrivateKey.random();
  const player = PublicKey.fromPrivateKey(playerPrivate)
  return Poseidon.hash(player.toFields());
}


describe('PlanetCreator Contract', () => {
    let deployerAccount: PublicKey,
      deployerKey: PrivateKey,
      senderAccount: PublicKey,
      senderKey: PrivateKey,
      zkAppAddress: PublicKey,
      zkAppPrivateKey: PrivateKey,
      zkAppInstance: PlanetCreator,
      nullifierMap: MerkleMap,
      ledgerMap: MerkleMap,
      txn;

    beforeAll(async () => {
      if (proofsEnabled) await PlanetCreator.compile();
    });

    beforeEach( async () => {
      // set up a local blockchain
      const Local = Mina.LocalBlockchain({ proofsEnabled });
      Mina.setActiveInstance(Local);

      // Local.testAccounts is an array of 10 test accounts that have been pre-filled with Mina
      ({ privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0]);
      ({ privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1]);

      // create a zkApp account
      zkAppPrivateKey = PrivateKey.random();
      zkAppAddress = zkAppPrivateKey.toPublicKey();
      zkAppInstance = new PlanetCreator(zkAppAddress);

      // initialize the MerkleMaps
      nullifierMap = new MerkleMap();
      ledgerMap = new MerkleMap();

      // deploy the zkApp and initialize the MerkleMaps
      await localDeployAndInitMap();
    });

    async function localDeployAndInitMap() {
      // deploy the zkApp
      txn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkAppInstance.deploy();
        zkAppInstance.initMapRoots(nullifierMap.getRoot(), ledgerMap.getRoot());
      });
      await txn.prove();

      // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
      await txn.sign([deployerKey, zkAppPrivateKey]).send();
    }


    describe('deployment and initiation', () => {
      it('sets intitial values as expected', () => {
        const gameRadius = zkAppInstance.gameRadius.get();
        expect(gameRadius).toEqual(Const.INITIAL_GAME_RADIUS);
    
        const numberOfMessages = zkAppInstance.numberOfPlanets.get();
        expect(numberOfMessages).toEqual(Field(0));
    
        const numberOfAddresses = zkAppInstance.numberOfWhiteListedPlayers.get();
        expect(numberOfAddresses).toEqual(Field(0));
    
        const nullifierRoot = zkAppInstance.playerNullifierRoot.get();
        expect(nullifierRoot).toEqual(nullifierMap.getRoot());
    
        const ledgerRoot = zkAppInstance.planetLedgerRoot.get();
        expect(ledgerRoot).toEqual(ledgerMap.getRoot());
      });
    });


    describe('player whitelist', () => {
      it ('can add new accounts to whitelist', async () => {
        let playerKey, nullifierRoot, numAddresses, playerWitness: MerkleMapWitness;
    
         // ----- Adding First Player to whitelist ---- 
         playerKey = initializeRandomPlayer();
         playerWitness = nullifierMap.getWitness(playerKey);
    
        nullifierMap.set(playerKey, Const.WHITELISTED_VALUE);
    
        txn = await Mina.transaction(senderAccount, () => {
          zkAppInstance.addEligibleAddress(playerWitness);
        });
        await txn.prove();
        await txn.sign([senderKey]).send();
    
        // root state changed correctly after adding new address
        nullifierRoot = zkAppInstance.playerNullifierRoot.get();
        expect(nullifierRoot).toEqual(nullifierMap.getRoot());
    
        // numAddresses incremented correctly
        numAddresses = zkAppInstance.numberOfWhiteListedPlayers.get();
        expect(numAddresses).toEqual(Field(1));
    
        // ----- Adding Second Player to whitelist ---- 
    
        playerKey = initializeRandomPlayer();
        playerWitness = nullifierMap.getWitness(playerKey);
    
        nullifierMap.set(playerKey, Const.WHITELISTED_VALUE);
    
        txn = await Mina.transaction(senderAccount, () => {
          zkAppInstance.addEligibleAddress(playerWitness);
        });
        await txn.prove();
        await txn.sign([senderKey]).send();
    
        // root state changed correctly after adding new address
        nullifierRoot = zkAppInstance.playerNullifierRoot.get();
        expect(nullifierRoot).toEqual(nullifierMap.getRoot());
    
        // numAddresses incremented correctly
        numAddresses = zkAppInstance.numberOfWhiteListedPlayers.get();
        expect(numAddresses).toEqual(Field(2));
      });
    
      it ('cannot add an already whitelisted account to whitelist', async () => {
        let playerKey, nullifierRoot, numAddresses, playerWitness: MerkleMapWitness;
          
        playerKey = initializeRandomPlayer();
        playerWitness = nullifierMap.getWitness(playerKey);
    
        nullifierMap.set(playerKey, Const.WHITELISTED_VALUE);
        const rootAFterFirstAdd = nullifierMap.getRoot();
        
        txn = await Mina.transaction(senderAccount, () => {
          zkAppInstance.addEligibleAddress(playerWitness);
        });
        await txn.prove();
        await txn.sign([senderKey]).send();

        // numAddresses incremented correctly
        numAddresses = zkAppInstance.numberOfWhiteListedPlayers.get();
        expect(numAddresses).toEqual(Field(1));

        expect(async () => {
          txn = await Mina.transaction(senderAccount, () => {
            zkAppInstance.addEligibleAddress(playerWitness);
          });
        }).rejects.toThrow(Const.ALREADY_WHITELISTED_ERROR);
        
        // root state changed correctly after adding new address
        nullifierRoot = zkAppInstance.playerNullifierRoot.get();
        expect(nullifierRoot).toEqual(rootAFterFirstAdd);
    
        // numAddresses incremented correctly
        numAddresses = zkAppInstance.numberOfWhiteListedPlayers.get();
        expect(numAddresses).toEqual(Field(1));
      });
      
    })

    describe('homeworld initiation', () => {

      it ('cannot initiate homeworld for non whitelisted players', async () => {
        let playerKey, 
        nullifierWitness: MerkleMapWitness, 
        ledgerWitness: MerkleMapWitness;
  
        playerKey = initializeRandomPlayer();
        nullifierWitness = nullifierMap.getWitness(playerKey);
        ledgerWitness = ledgerMap.getWitness(playerKey);
  
        expect(async () => {
          txn = await Mina.transaction(senderAccount, () => {
          zkAppInstance.initializePlanet(
            VALID_COORDINATES.x,
            VALID_COORDINATES.y, 
            nullifierWitness, 
            ledgerWitness
            );
          });
        }).rejects.toThrow(Const.PLAYER_CANNOT_INITIATE_ERROR);
      });


      it ('can initiate homeworld for non whitelisted players', async () => {
        let playerKey, 
        nullifierWitness: MerkleMapWitness, 
        ledgerWitness: MerkleMapWitness;
  
        playerKey = initializeRandomPlayer();
        nullifierWitness = nullifierMap.getWitness(playerKey);
        ledgerWitness = ledgerMap.getWitness(playerKey);
        ledgerMap.set(playerKey, Poseidon.hash([VALID_COORDINATES.x, VALID_COORDINATES.y]));

        txn = await Mina.transaction(senderAccount, () => {
          zkAppInstance.addEligibleAddress(nullifierWitness);
        });
        await txn.prove();
        await txn.sign([senderKey]).send();
  
        txn = await Mina.transaction(senderAccount, () => {
        zkAppInstance.initializePlanet(
          VALID_COORDINATES.x,
          VALID_COORDINATES.y, 
          nullifierWitness, 
          ledgerWitness
          );
        });
        await txn.prove();
        await txn.sign([senderKey]).send();

        // ledger root state changed correctly after adding new homeworld
        const ledgerRoot = zkAppInstance.planetLedgerRoot.get();
        expect(ledgerRoot).toEqual(ledgerMap.getRoot());

        // numberOfPlanets incremented correctly
        let numPlanets = zkAppInstance.numberOfPlanets.get();
        expect(numPlanets).toEqual(Field(1));
      });

      it ('cannot initiate homeworld for whitelisted players who already have homeworlds', async () => {
        let playerKey, 
        nullifierWitness: MerkleMapWitness, 
        ledgerWitness: MerkleMapWitness;
  
        playerKey = initializeRandomPlayer();
        nullifierWitness = nullifierMap.getWitness(playerKey);
        ledgerWitness = ledgerMap.getWitness(playerKey);
        ledgerMap.set(playerKey, Poseidon.hash([VALID_COORDINATES.x, VALID_COORDINATES.y]));

        txn = await Mina.transaction(senderAccount, () => {
          zkAppInstance.addEligibleAddress(nullifierWitness);
        });
        await txn.prove();
        await txn.sign([senderKey]).send();
  
        txn = await Mina.transaction(senderAccount, () => {
        zkAppInstance.initializePlanet(
          VALID_COORDINATES.x,
          VALID_COORDINATES.y, 
          nullifierWitness, 
          ledgerWitness
          );
        });
        await txn.prove();
        await txn.sign([senderKey]).send();

        // ledger root state changed correctly after adding new homeworld
        const ledgerRoot = zkAppInstance.planetLedgerRoot.get();
        expect(ledgerRoot).toEqual(ledgerMap.getRoot());

        // numberOfPlanets incremented correctly
        let numPlanets = zkAppInstance.numberOfPlanets.get();
        expect(numPlanets).toEqual(Field(1));

        expect(async () => {
          txn = await Mina.transaction(senderAccount, () => {
          zkAppInstance.initializePlanet(
            VALID_COORDINATES.x,
            VALID_COORDINATES.y, 
            nullifierWitness, 
            ledgerWitness
            );
          });
        }).rejects.toThrow(Const.PLAYER_CANNOT_INITIATE_ERROR);
      })
    });

    it ('cannot initiate homeworlds outside of game radius', async () => {
      let playerKey, 
      nullifierWitness: MerkleMapWitness, 
      ledgerWitness: MerkleMapWitness;

      playerKey = initializeRandomPlayer();
      nullifierWitness = nullifierMap.getWitness(playerKey);
      ledgerWitness = ledgerMap.getWitness(playerKey);

      txn = await Mina.transaction(senderAccount, () => {
        zkAppInstance.addEligibleAddress(nullifierWitness);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();

      expect(async () => {
        txn = await Mina.transaction(senderAccount, () => {
        zkAppInstance.initializePlanet(
          INVALID_COORDINATES.x,
          INVALID_COORDINATES.y, 
          nullifierWitness, 
          ledgerWitness
          );
        });
      }).rejects.toThrow(Const.COORDINATE_OUT_OF_RANGE_ERROR);
    });

});