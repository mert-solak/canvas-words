export interface Sentence {
  coordinates: Coordinates;
  fontFamily: string;
  fontSize: string;
  text: string;
}

export interface Props {
  canvasWidth: number;
  canvasHeight: number;
  sentences: Sentence[];
  characterSpeed?: number;
  stepNumberForReturn?: number;
  backgroundColor?: string;
  className?: string;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Boundary {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Character {
  value: string;
  coordinates: Coordinates;
  baseCoordinates: Coordinates;
  velocity: Velocity;
  width: number;
}

export interface ConfiguredSentence extends Sentence {
  characters: Character[];
  boundary: Boundary;
}
