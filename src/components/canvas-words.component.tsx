import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useImmutableRef } from '@mertsolak/use-immutable-ref';

import { coordinateHelper } from '../helpers';
import { Props, ConfiguredSentence, Boundary } from '../definitions';
import { canvasConfig } from '../configs';

export const CanvasWords: React.FC<Props> = ({
  canvasWidth,
  canvasHeight,
  backgroundColor,
  className,
  sentences,
  stepNumberForReturn = canvasConfig.defaults.stepNumberForReturn,
  characterSpeed = canvasConfig.defaults.characterSpeed,
}) => {
  const [canvas, setCanvas] = useImmutableRef<HTMLCanvasElement>();
  const [context, setContext] = useState<CanvasRenderingContext2D | undefined>();
  const [configuredSentences, setConfiguredSentences] = useState<ConfiguredSentence[] | undefined>();

  const mouseCoordinateRef = useRef({ x: 0, y: 0 });

  /**
   * split sentences into words and characters,
   * sets coordinates to make them fit in canvas and
   * set boundaries to trigger animation
   * @param contextParam @type CanvasRenderingContext2D
   */
  const configureSentences = useCallback(
    (contextParam: CanvasRenderingContext2D) => {
      let newConfiguredWords: ConfiguredSentence[] = [];

      let marginTop = 0;
      sentences.forEach((sentence) => {
        contextParam.font = coordinateHelper.getFont(sentence.fontSize, sentence.fontFamily);
        const wordsInSentence = sentence.text.split(/\s/g);
        const sentenceHeight = +sentence.fontSize.replace('px', '');
        const emptySpaceWidth = contextParam.measureText(' ').width;

        const boundary: Boundary = {
          x1: sentence.coordinates.x,
          y1: sentence.coordinates.y + marginTop,
          x2: sentence.coordinates.x,
          y2: sentence.coordinates.y + marginTop - sentenceHeight,
        };

        let marginLeft = 0;
        wordsInSentence.forEach((word, wordIndex) => {
          const wordWidth = contextParam.measureText(word).width;
          const newConfiguredWord: ConfiguredSentence = {
            ...sentence,
            characters: [],
            boundary: {
              ...boundary,
            },
            text: word,
          };

          if (sentence.coordinates.x + marginLeft + wordWidth > canvasWidth) {
            marginTop += sentenceHeight;
            marginLeft = 0;

            boundary.y1 += sentenceHeight;
          }

          let sentenceWidth = 0;
          for (let index = 0; index < word.length; index += 1) {
            const character = word.charAt(index);

            const characterWidth = contextParam.measureText(character).width;
            const coordinates = {
              x: sentence.coordinates.x + marginLeft + sentenceWidth,
              y: sentence.coordinates.y + marginTop,
            };
            const newCharacter = {
              value: character,
              coordinates,
              baseCoordinates: coordinates,
              velocity: { x: 0, y: 0 },
              width: characterWidth,
            };
            newConfiguredWord.characters.push(newCharacter);

            sentenceWidth += characterWidth;

            if (wordIndex !== wordsInSentence.length - 1 && index === word.length - 1) {
              newConfiguredWord.characters.push({
                value: ' ',
                coordinates,
                baseCoordinates: coordinates,
                velocity: { x: 0, y: 0 },
                width: characterWidth,
              });

              sentenceWidth += emptySpaceWidth;
            }
          }

          boundary.x2 = Math.max(boundary.x2, boundary.x1 + marginLeft + wordWidth);

          newConfiguredWords.push({ ...newConfiguredWord, boundary: { x1: 0, x2: 0, y1: 0, y2: 0 } });

          marginLeft += sentenceWidth;
        });

        newConfiguredWords = newConfiguredWords.map((word) => {
          if (
            word.boundary.x1 === 0 &&
            word.boundary.x2 === 0 &&
            word.boundary.y1 === 0 &&
            word.boundary.y2 === 0
          ) {
            return { ...word, boundary };
          }

          return word;
        });
      });

      setConfiguredSentences(newConfiguredWords);
    },
    [sentences],
  );

  /**
   * draws characters recursively and updates
   * coordinates and velocities for the next frame
   * @param contextParam @type CanvasRenderingContext2D
   * @param configuredSentencesParam @type ConfiguredSentence[]
   */
  const draw = useCallback(
    (contextParam: CanvasRenderingContext2D, configuredSentencesParam: ConfiguredSentence[]) => {
      contextParam.clearRect(0, 0, canvasWidth, canvasHeight);

      const updatedSentencesParam = configuredSentencesParam.map((sentence) => {
        const newCharacters = sentence.characters.map((character) => {
          contextParam.font = coordinateHelper.getFont(sentence.fontSize, sentence.fontFamily);
          contextParam.fillText(
            character.value,
            character.coordinates.x,
            character.coordinates.y,
            character.width,
          );

          const mouseInsideBoundary = coordinateHelper.isMouseInsideBoundary(
            mouseCoordinateRef.current,
            sentence.boundary,
          );
          const isCharacterMoving = character.velocity.x !== 0 || character.velocity.y !== 0;
          const isCharacterAtBase =
            character.coordinates.x === character.baseCoordinates.x &&
            character.coordinates.y === character.baseCoordinates.y;

          const newCoordinates = coordinateHelper.updateCoordinates(
            character.coordinates,
            character.baseCoordinates,
            character.velocity,
            mouseInsideBoundary,
          );
          const newVelocity = coordinateHelper.updateVelocity(
            newCoordinates,
            character.velocity,
            character.width,
            character.baseCoordinates,
            mouseInsideBoundary,
            isCharacterMoving,
            isCharacterAtBase,
            canvasWidth,
            canvasHeight,
            stepNumberForReturn,
            characterSpeed,
          );
          return {
            ...character,
            coordinates: newCoordinates,
            velocity: newVelocity,
          };
        });

        return { ...sentence, characters: newCharacters };
      });

      requestAnimationFrame(() => draw(contextParam, updatedSentencesParam));
    },
    [canvasWidth, canvasHeight, stepNumberForReturn, characterSpeed],
  );

  /**
   * sets given height and width to canvas
   */
  useEffect(() => {
    if (!canvas) {
      return;
    }

    canvas?.setAttribute('width', canvasWidth.toString());
    canvas?.setAttribute('height', canvasHeight.toString());
  }, [canvas, canvasWidth, canvasHeight]);

  /**
   * sets event listener to follow cursor
   * and sets context
   */
  useEffect(() => {
    if (!canvas) {
      return () => {};
    }

    const context2D = canvas?.getContext('2d');
    setContext(context2D);

    const mouseMove = (event: MouseEvent) => {
      mouseCoordinateRef.current = {
        x: event.offsetX,
        y: event.offsetY,
      };
    };

    canvas?.addEventListener('mousemove', mouseMove);
    return () => canvas?.removeEventListener('mousemove', mouseMove);
  }, [canvas]);

  /**
   * calls configureSentences to before drawing
   */
  useEffect(() => {
    if (!context) {
      return;
    }

    configureSentences(context);
  }, [configureSentences, context]);

  /**
   * starts drawing if sentences ready
   */
  useEffect(() => {
    if (!context || !configuredSentences) {
      return;
    }

    draw(context, configuredSentences);
  }, [draw, context, configuredSentences]);

  return (
    <canvas
      style={{ backgroundColor, margin: 0, padding: 0, display: 'block' }}
      ref={setCanvas}
      className={className}
    />
  );
};
