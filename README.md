# XYData generator library

A data generator library.

## Installation

`npm install --save xydata`

## Getting started

```ts
import { createProgressiveRandomGenerator } from 'xydata'

createProgressiveRandomGenerator()
    .setNumberOfPoints(1000)
    .generate()
    .setStreamInterval(250)
    .setStreamBatchSize(10)
    .setStreamRepeat(true)
    .toStream()
    .forEach(data=>{
        console.log(data)
    })
```
This creates a basic progressive random generator and uses the Stream API to output the data to console.

## Project structure

| Folder | Description |
|--------|-------------|
| src    | project source code |
| src/generators | the invidual generators |
| test   | unit tests  |

## Development instructions

The project is developed on TypeScript. Build system of the project heavily rely on Node.js. Dependencies are managed by *npm*, therefore, remember to run **npm install** before starting of anything else. 

The project uses RollUp for creating the distributable library files.

There are several *npm scripts*, which are used in development process:

| Name     | Command          | Description              |
| ---------|------------------|--------------------------|
| test     | npm test         | run tests and watch      |
| lint     | npm run lint     | run static analyzer and watch
| ci:test  | npm run ci:test  | run tests once
| ci:lint  | npm run ci:lint  | run static analyzer once
| ci:watch | npm run ci:watch | run CI circle and watch
| build    | npm run build    | build the library
| build:watch| npm run build:watch | build the library and watch
| docs     | npm run docs     | build documentation
