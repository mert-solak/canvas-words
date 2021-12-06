## Canvas Words

When cursor hover over the words, letters are separated in the canvas.

![npm](https://img.shields.io/npm/v/@mertsolak/canvas-words)
![license](https://img.shields.io/npm/l/@mertsolak/canvas-words)
![size](https://img.shields.io/bundlephobia/min/@mertsolak/canvas-words)
![issue](https://img.shields.io/github/issues/mert-solak/canvas-words)

## Installation

Use node package manager to install @mertsolak/canvas-words.

```bash
npm i @mertsolak/canvas-words
```

## Basic Usage

```typescript
import { CanvasWords } from '@mertsolak/canvas-words';

const App = () => (
  <CanvasWords
    canvasWidth={500}
    canvasHeight={1080}
    characterSpeed={5}
    sentences={[
      {
        coordinates: { x: 100, y: 300 },
        fontFamily: 'sans-serif',
        fontSize: '20px',
        text: 'Test sentence',
        color: 'black',
        printOption: 'fillText',
      },
    ]}
  />
);
```
