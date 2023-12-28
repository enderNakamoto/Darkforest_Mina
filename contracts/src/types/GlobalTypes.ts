export type LocationId = string

export interface WorldCoords {
    x: number;
    y: number;
}

export interface Location {
    coords: WorldCoords;
    hash: LocationId;
    perlin: number;
}

export interface ChunkFootprint {
    bottomLeft: WorldCoords;
    sideLength: number;
}
  
export class ExploredChunkData {
    chunkFootprint: ChunkFootprint;
    planetLocations: Location[];
}