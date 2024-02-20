import { 
    Coordinate
} from './globalTypes'

import { 
    Field, 
    Poseidon, 
    Bytes,
    Hash
} from 'o1js'


function findSearchSpace(seed: Coordinate): Coordinate[] {
  const adjacentCordinates: Coordinate[] = []
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const adjacentX = seed.x + i
      const adjacentY = seed.y + j
      const adjacentCordinate = { x: adjacentX, y: adjacentY }
      adjacentCordinates.push(adjacentCordinate)
    }
  }
  adjacentCordinates.push(seed)
  return adjacentCordinates
}

// assuming the world is a circle of radius `worldRadius`
function filterSearchSpaceCircle(searchSpace: Coordinate[], worldRadius: number): Coordinate[] {
  const validCordinates: Coordinate[] = []
  for (let i = 0; i < searchSpace.length; i++) {
    const cordinate: Coordinate = searchSpace[i]
    const { x, y } = cordinate
    if (x ** 2 + y ** 2 < worldRadius ** 2) {
      validCordinates.push(cordinate)
    }
  }
  return validCordinates
}

// assuming the world is a square of NxN
function filterSeatchSpaceSquare(searchSpace: Coordinate[], N: number): Coordinate[] {
  const validCordinates: Coordinate[] = []
  for (let i = 0; i < searchSpace.length; i++) {
    const cordinate: Coordinate = searchSpace[i]
    const { x, y } = cordinate
    if (x >= 0 && x < N && y >= 0 && y < N) {
      validCordinates.push(cordinate)
    }
  }
  return validCordinates
}

function hashSearchSpacePoseidon(searchSpace: Coordinate[]): string[] {
  const hashes: string[] = []
  for (let i = 0; i < searchSpace.length; i++) {
    const cordinate: Coordinate = searchSpace[i]
    const { x, y } = cordinate
    const hash = Poseidon.hash([Field(x),Field(y)]);
    hashes.push(hash.toString())
  }
  return hashes
}

function hashSearchSpaceKeccak(searchSpace: Coordinate[]): string[] {
  const hashes: string[] = []
  for (let i = 0; i < searchSpace.length; i++) {
    const cordinate: Coordinate = searchSpace[i]
    const { x, y } = cordinate
    const bytes = Bytes.from(new Uint8Array([x, y]));
    const hash = Hash.Keccak256.hash(bytes);
    hashes.push(hash.toString())
  }
  return hashes
}

/*  to do
1. get all planet hashes from merkle tree
2. compare with hashes from search space with planet hashes
3. make a explored chuck data object with the search space and mathing planet hashes
*/