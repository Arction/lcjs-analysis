# LCJS data analysis tools

A collection of data analysis tools, designed to work directly with LightningChart<sup>&#174;</sup> JS charting library. [https://www.arction.com/](https://www.arction.com/)

## Installation

`npm install --save @arction/lcjs-analysis`

## Documentation

Online documentation is available at [arction.github.io/lcjs-analysis](https://arction.github.io/lcjs-analysis/)

## Getting started

```
import { simpleMovingAverage } from '@arction/lcjs-analysis'

...

```

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
