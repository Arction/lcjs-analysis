// gulpfile.js
const gulp = require('gulp')
const mocha = require('gulp-mocha')
const tslint = require('gulp-tslint')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript2')
const rollupNodeResolve = require('rollup-plugin-node-resolve')
const rollupCommonjs = require('rollup-plugin-commonjs')
const rollupSourceMaps = require('rollup-plugin-sourcemaps')
const watch = (paths, tasks) => () => gulp.watch(paths, tasks)
const allFiles = ['src/**/*.ts', 'test/**/*.ts']
/**
 * Testing Tasks
 */
gulp
    .task('test', (done) => {
        gulp
            .src('./test/**/*.spec.ts', { read: false })
            .pipe(mocha({
                "timeout": 100000,
                require: 'ts-node/register',
                reporter: 'spec'
            }))
        done()
    })
    .task('test:watch', ['test'], watch(allFiles, ['test']))
/**
 * Linting Tasks
 */
gulp
    .task('lint', (done) => {
        gulp.src(allFiles)
            .pipe(tslint({
                formatter: 'verbose'
            }))
            .pipe(tslint.report({ allowWarnings: true }))
        done()
    })
    .task('lint:watch', ['lint'], watch(allFiles, ['lint']))
/**
 * General
 */
gulp
    .task('ci:watch', ['test', 'lint'], watch(allFiles, ['test', 'lint']))
    .task('build', () => {
        return rollup.rollup({
            input: 'src/index.ts',
            plugins: [
                rollupTypescript({ typescript: require('typescript'), tsconfig: './tsconfig.json' }),
                rollupCommonjs(),
                rollupNodeResolve(),
                rollupSourceMaps()
            ]
        })
            .then(bundle => {
                bundle.write({
                    file: 'dist/xydata.js',
                    format: 'umd',
                    exports: 'named',
                    sourcemap: true,
                    name: 'xydata'
                })
            })
    })
    .task('build:watch', ['build'], watch(allFiles, ['build']))
