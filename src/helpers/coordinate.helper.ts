import { Boundary, Coordinates, Velocity } from '../definitions';

/**
 * returns -1 or 1 randomly
 * @returns number
 */
export const getRandomSign = (): number => (Math.round(Math.random() * 10) % 2 === 0 ? -1 : 1);

/**
 * sets random velocities with max speed parameter
 * @param newVelocity @type Velocity
 * @param speedParam @type number
 */
export const setRandomVelocity = (newVelocity: Velocity, speedParam: number) => {
  newVelocity.x = Math.random() * speedParam * getRandomSign();
  newVelocity.y = Math.random() * speedParam * getRandomSign();
};

/**
 * returns true if cursor inside boundary
 * @param mouseCoordinates @type Coordinates
 * @param boundary @type Boundary
 * @returns boolean
 */
export const isMouseInsideBoundary = (mouseCoordinates: Coordinates, boundary: Boundary): boolean => {
  const mouseX = mouseCoordinates.x;
  const mouseY = mouseCoordinates.y;

  const mouseInsideBoundaryX = mouseX > boundary.x1 && mouseX < boundary.x2;
  const mouseInsideBoundaryY = mouseY < boundary.y1 && mouseY > boundary.y2;
  return mouseInsideBoundaryX && mouseInsideBoundaryY;
};

/**
 * updates velocities with 0
 * @param velocity @type Velocity
 */
export const stopCharacter = (velocity: Velocity) => {
  velocity.x = 0;
  velocity.y = 0;
};

/**
 * sets velocities to make character return
 * to base coordinates
 * @param baseCoordinates @type Coordinates
 * @param coordinates  @type Coordinates
 * @param velocity  @type Velocity
 * @param newVelocity  @type Velocity
 * @param isCharacterMoving  @type boolean
 * @param stepNumberForReturn  @type number
 */
export const setVelocityForReturn = (
  baseCoordinates: Coordinates,
  coordinates: Coordinates,
  velocity: Velocity,
  newVelocity: Velocity,
  isCharacterMoving: boolean,
  stepNumberForReturn: number,
) => {
  const xDiff = baseCoordinates.x - coordinates.x;
  const yDiff = baseCoordinates.y - coordinates.y;

  const isReturning = Math.atan2(yDiff, xDiff).toFixed(5) === Math.atan2(velocity.y, velocity.x).toFixed(5);

  if (!isReturning && isCharacterMoving) {
    newVelocity.x = xDiff / stepNumberForReturn;
    newVelocity.y = yDiff / stepNumberForReturn;
  }
};

/**
 * sets velocities to prevent character to
 * go outside of the canvas
 * @param coordinates @type Coordinates
 * @param velocity @type Velocity
 * @param textWidth @type number
 * @param newVelocity @type Velocity
 * @param width @type number
 * @param height @type number
 */
export const setVelocityToStayInCanvas = (
  coordinates: Coordinates,
  velocity: Velocity,
  textWidth: number,
  newVelocity: Velocity,
  width: number,
  height: number,
) => {
  if (coordinates.x + textWidth > width) {
    newVelocity.x = Math.abs(velocity.x) * -1;
  } else if (coordinates.x < 0) {
    newVelocity.x = Math.abs(velocity.x);
  }

  if (coordinates.y > height) {
    newVelocity.y = Math.abs(velocity.y) * -1;
  } else if (coordinates.y - textWidth < 0) {
    newVelocity.y = Math.abs(velocity.y);
  }
};

/**
 * decides how to update velocity and
 * makes the update
 * @param coordinates @type Coordinates
 * @param velocity  @type Velocity
 * @param textWidth  @type number
 * @param baseCoordinates  @type Coordinates
 * @param mouseInsideBoundary  @type boolean
 * @param isCharacterMoving  @type boolean
 * @param isCharacterAtBase  @type boolean
 * @param width  @type number
 * @param height  @type number
 * @param stepNumberForReturn  @type number
 * @param characterSpeed  @type number
 * @returns Velocity
 */
export const updateVelocity = (
  coordinates: Coordinates,
  velocity: Velocity,
  textWidth: number,
  baseCoordinates: Coordinates,
  mouseInsideBoundary: boolean,
  isCharacterMoving: boolean,
  isCharacterAtBase: boolean,
  width: number,
  height: number,
  stepNumberForReturn: number,
  characterSpeed: number,
): Velocity => {
  const newVelocity: Velocity = { ...velocity };

  if (!mouseInsideBoundary) {
    setVelocityForReturn(
      baseCoordinates,
      coordinates,
      velocity,
      newVelocity,
      isCharacterMoving,
      stepNumberForReturn,
    );
  }

  if (!mouseInsideBoundary && isCharacterAtBase) {
    stopCharacter(newVelocity);
  }

  if (mouseInsideBoundary && !isCharacterMoving) {
    setRandomVelocity(newVelocity, characterSpeed);
  }

  setVelocityToStayInCanvas(coordinates, velocity, textWidth, newVelocity, width, height);

  return newVelocity;
};

/**
 * updates coordinates using by velocities
 * @param coordinates @type Coordinates
 * @param baseCoordinates  @type Coordinates
 * @param velocity  @type Velocity
 * @param mouseInsideBoundary @type boolean
 * @returns Coordinates
 */
export const updateCoordinates = (
  coordinates: Coordinates,
  baseCoordinates: Coordinates,
  velocity: Velocity,
  mouseInsideBoundary: boolean,
) => {
  const newCoordinates = { ...coordinates };

  if (!mouseInsideBoundary) {
    const xDiff = coordinates.x - baseCoordinates.x;
    const yDiff = coordinates.y - baseCoordinates.y;

    if (Math.abs(xDiff) < 5 && Math.abs(yDiff) < 5) {
      return baseCoordinates;
    }
  }

  newCoordinates.x += velocity.x;
  newCoordinates.y += velocity.y;

  return newCoordinates;
};

/**
 * returns font for canvas
 * @param fontSize @type string
 * @param fontFamily  @type string
 * @returns string
 */
export const getFont = (fontSize: string, fontFamily: string): string => `${fontSize} ${fontFamily}`;
