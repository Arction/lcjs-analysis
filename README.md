# XYData generator library

A data generator library.

## Installation

`npm install --save @arction/xydata`

## Getting started

```ts
import { createProgressiveRandomGenerator } from '@arction/xydata'

// create new instance of progressive random generator
createProgressiveRandomGenerator()
    // define that 1000 points should be generated
    .setNumberOfPoints(1000)
    // generate those 1000 points
    .generate()
    // set stream to progress every 250 milliseconds
    .setStreamInterval(250)
    // set stream to output 10 points at a time
    .setStreamBatchSize(10)
    // make the stream infinite
    .setStreamRepeat(true)
    // create a new stream with previously defined stream settings
    .toStream()
    // every time the stream outputs data, run this function on each of the data points
    .forEach(data=>{
        console.log(data)
    })
```
This creates a basic progressive random generator and uses the Stream API to output the data to console.

> Note: You should newer create a new instance of any generator using the `new` keyword. Generators should only be created with the `create...` functions.

## Generators

| Generator | Description |
|-----------|-------------|
| Delta Function | Generate mostly flat data with random spikes. |
| OHLC | Generate Open, High, Low, Close data. |
| Progressive Function | Sample a user defined function with given X step. |
| Progressive Random | Generate random progressive data that has progessive X step. |
| Progressive Trace | Generate random trace data from previous point that has progressive X step. |
| Sample Data | Sample given array with specified frequency and user defined step. |
| Trace | Generate random trace data that can go to any direction on the XY coordinates. |
| White Noise | Generate white noise. |

## Project structure

| Folder | Description |
|--------|-------------|
| src    | project source code |
| src/generators | the invidual generators |
| test   | unit tests  |

## Development instructions

The project is developed using TypeScript. Build system of the project heavily relies on Node.js. Dependencies are managed with *npm*, therefore, remember to run **npm install** before starting of anything else. 

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
