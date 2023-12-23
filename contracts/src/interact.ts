// node build/src/interact.js <deployAlias>


import fs from 'fs/promises';
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';
import { DarkForest } from './DarkForestCore.js';

// // ---------------------------------------
// // Local Blockchain deployment and testing 
// //----------------------------------------

// const useProof = false;
// const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
// Mina.setActiveInstance(Local);
// const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
// const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];

// // ----------------------------------------------------
// // Create a public/private key pair. The public key is your address and where you deploy the zkApp to
// const zkAppPrivateKey = PrivateKey.random();
// const zkAppAddress = zkAppPrivateKey.toPublicKey();

// // create an instance of Add - and deploy it to zkAppAddress
// const zkAppInstance = new Add(zkAppAddress);
// const deployTxn = await Mina.transaction(deployerAccount, () => {
//   AccountUpdate.fundNewAccount(deployerAccount);
//   zkAppInstance.deploy();
// });

// await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
// // get the initial state of Add after deployment
// const num0 = zkAppInstance.num.get();
// console.log('state after init:', num0.toString());


// // ----------------------------------------------------
// const txn1 = await Mina.transaction(senderAccount, () => {
//   zkAppInstance.update();
// });
// await txn1.prove();
// await txn1.sign([senderKey]).send();
// const num1 = zkAppInstance.num.get();
// console.log('state after txn1:', num1.toString());


// check command line arg
// let deployAlias = process.argv[2];
// if (!deployAlias)
//   throw Error(`Missing <deployAlias> argument.

// Usage:
// node build/src/interact.js <deployAlias>
// `);
// Error.stackTraceLimit = 1000;

// // parse config and private key from file
// type Config = {
//   deployAliases: Record<
//     string,
//     {
//       url: string;
//       keyPath: string;
//       fee: string;
//       feepayerKeyPath: string;
//       feepayerAlias: string;
//     }
//   >;
// };
// let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
// let config = configJson.deployAliases[deployAlias];
// let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
//   await fs.readFile(config.feepayerKeyPath, 'utf8')
// );

// let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
//   await fs.readFile(config.keyPath, 'utf8')
// );


// let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
// let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

// console.log("feePayer is", feepayerKey)
// console.log("zk App key is ", zkAppKey)

// // set up Mina instance and contract we interact with
// const Network = Mina.Network(config.url);
// const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
// Mina.setActiveInstance(Network);
// let feepayerAddress = feepayerKey.toPublicKey();
// let zkAppAddress = zkAppKey.toPublicKey();
// let zkApp = new Add(zkAppAddress);

// let sentTx;
// // compile the contract to create prover keys
// console.log('compile the contract...');
// await Add.compile();
// try {
//   // call update() and send transaction
//   console.log('build transaction and create proof...');
//   let tx = await Mina.transaction({ sender: feepayerAddress, fee }, () => {
//     zkApp.update();
//   });
//   await tx.prove();
//   console.log('send transaction...');
//   sentTx = await tx.sign([feepayerKey]).send();
// } catch (err) {
//   console.log(err);
// }
// if (sentTx?.hash() !== undefined) {
//   console.log(`
// Success! Update transaction sent.

// Your smart contract state will be updated
// as soon as the transaction is included in a block:
// ${getTxnUrl(config.url, sentTx.hash())}
// `);
// }

// function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
//   const txnBroadcastServiceName = new URL(graphQlUrl).hostname
//     .split('.')
//     .filter((item) => item === 'minascan' || item === 'minaexplorer')?.[0];
//   const networkName = new URL(graphQlUrl).hostname
//     .split('.')
//     .filter((item) => item === 'berkeley' || item === 'testworld')?.[0];
//   if (txnBroadcastServiceName && networkName) {
//     return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
//   }
//   return `Transaction hash: ${txnHash}`;
// }
