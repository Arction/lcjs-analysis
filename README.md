# XYData generator library

A data generator library.

## Example

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

* **src**: Contains source code for the project.
* **src/generators**: Contains all generators.
* **test**: Contains tests for the project.

## Scripts

Please run **npm install** before running any scripts.

##### (npm run [scriptName])
  - **test**: Run tests and watch
  - **lint**: Run lint and watch
  - **ci:test**: Run tests once
  - **ci:lint**: Run lint once
  - **ci:watch**: Run test and lint, watch
  - **build**: Build the library to dist/ folder
  - **build:watch**: Build the library to dist/ folder and watch the source code for changes.
  - **docs**: Build documentation to docs/ folder
