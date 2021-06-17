
export interface Trait {
  traitType: string;
  value: string | number | null;
  displayType?: string;
  maxValue?: number;
  boostNumber?: number;
  boostPercentage?: number;
}

export interface MetaData {
  name: string;
  description: string;
  image: string;
  // official external url of this asset
  externalUrl?: string;
  // A URL to a multi-media attachment for the item.
  // The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV,
  // and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA.
  animationUrl?: string;
  // ERC721 Opensea Traits
  traits?: Trait[];
}