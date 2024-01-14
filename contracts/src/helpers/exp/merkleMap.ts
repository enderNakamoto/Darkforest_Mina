/* learnings to be used in the future

1. const map = new MerkleMap();,
 map.set(key, value), 
 map.get(key), 
 map.getRoot(), 
 map.getWitness(key) 
- these can be used , outside the contract to access the merkle map in the contract. 

2. const key = Poseidon.hash(PlayerA.toFields()) is how we can store key in the merkle map.
    playerA is a public key, and we need to convert it to a field, and hashed to store it in the merkle map.

3. const value = Poseidon.hash([Field(50), Field(80)]); is how we can store co-ordinate value in the merkle map.

4. when we try to get the value of a key that does not exist in the merkle map, we get a value of 0.
    - map.get(keyB).toString() returns '0'

5. we can use map.getRoot() to get the root of the merkle map.

6. we can use const witness = map.getWitness(key) to get the witness of the merkle map, for a specific key in the merkle map.

7. if we try to get the witness of a key that does not exist in the merkle map, we DO NOT get an error.
    - it is hard to tell if the witness is valid or not, because we get a witness even for a key that does not exist in the merkle map.

8. we can pass in the witness to contract functions, and the contract can use the witness to verify the value of the key in the merkle map.

8. we can use const [calculatedRoot, calculatedKey] = witness.computeRootAndKey(value) to compute the root and key of the merkle map, 
   for a specific value in the merkle map.

9. with valid witness, we can compute the root and key of the merkle map, for a specific value in the merkle map, 
with bad value, we will get a different root and value, so we can verify the stored merkle root.


*/
import { Field, Poseidon, MerkleMap, PrivateKey, PublicKey } from "o1js";

const map = new MerkleMap();

// we turn all Fields and Hashes to string if possible for easy reading

let PlayerAPrivate = PrivateKey.random();
let PlayerA = PublicKey.fromPrivateKey(PlayerAPrivate)

let PlayerBPrivate = PrivateKey.random();
let PlayerB = PublicKey.fromPrivateKey(PlayerBPrivate)

const key = Poseidon.hash(PlayerA.toFields());
const value = Poseidon.hash([Field(50), Field(80)]);

// THIS VALUE IS NOT IN THE MERKLE MAP
const valueB = Poseidon.hash([Field(100), Field(180)]);

console.log("------------------ MAP SET AND GET ----------------------------")

console.log("value is", value.toString());

map.set(key, value);

console.log('value for key', key.toString() + '=========>', map.get(key).toString());

console.log("------------------ INVALID KEY ----------------------------")

const keyB = Poseidon.hash(PlayerB.toFields());
console.log('value for key B (value does not exist)', keyB.toString() + ':', map.get(keyB).toString());

console.log("------------------ GET ROOT ----------------------------")

const root = map.getRoot()
console.log("root is .......", root.toString());

console.log("----------------- VALID WITNESS-----------------------------")

const validWitness = map.getWitness(key)
//console.log("valid witness is", validWitness.toJSON())

console.log("---------------- INVALID WITNESS ------------------------------")

const invalidWitness = map.getWitness(keyB)
// console.log("in valid witness is", invalidWitness.toJSON())

console.log("------------------ VALID WITNESS, VALID VALUE ----------------------------")

const [calculatedRoot, calculatedKey] = validWitness.computeRootAndKey(value);

console.log("we know root is", root.toString());
console.log("calculated root is", calculatedRoot.toString());

//console.log("test gives", calculatedRoot.assertEquals(root));

if ( root.toString() == calculatedRoot.toString()) {
    console.log('roots match')
}

console.log("we know key is", key.toString());
console.log("calculated key is", calculatedKey.toString());

if ( key.toString() == calculatedKey.toString()) {
    console.log('keys match')
}

console.log("------------------  VALID WITNESS, INVALID VALUE ----------------------------")


const [calculatedRootB, calculatedKeyB] = validWitness.computeRootAndKey(valueB);

console.log("we know root is", root.toString());
console.log("calculated root is", calculatedRootB.toString());

console.log("we know key is", key.toString());
console.log("calculated key is", calculatedKeyB.toString());

console.log("------------------  INVALID WITNESS, VALID VALUE ----------------------------")

const [calculatedRootC, calculatedKeyC] = invalidWitness.computeRootAndKey(value);

console.log("we know root is", root.toString());
console.log("calculated root is", calculatedRootC.toString());

console.log("we know key is", key.toString());
console.log("calculated key is", calculatedKeyC.toString());

console.log("------------------  TEST FOR INITIAZING KEYS, ONLY WHEN IT DOES NTO EXIST ----------------------------")

let PlayerCPrivate = PrivateKey.random();
let PlayerC = PublicKey.fromPrivateKey(PlayerCPrivate)
const keyC = Poseidon.hash(PlayerC.toFields());
console.log("key C is", keyC.toString());
const valueC = Field(100);

let PlayerDPrivate = PrivateKey.random();
let PlayerD = PublicKey.fromPrivateKey(PlayerDPrivate)
const keyD = Poseidon.hash(PlayerD.toFields());
console.log("key D is", keyD.toString());
const valueD = Field(200);

const mapA = new MerkleMap();
const rootA = mapA.getRoot();
console.log("root is .......", rootA.toString());

let derivedRootA, derivedKeyC; 

const KeyCWitness = mapA.getWitness(keyC);

[derivedRootA, derivedKeyC] = KeyCWitness.computeRootAndKey(Field(0));
console.log("derived root is", derivedRootA.toString());
console.log("derived key C is", derivedKeyC.toString());
