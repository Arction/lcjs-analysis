// gulpfile.js
const { series, parallel, src, dest, gulp } = require('gulp')
const mocha = require('gulp-mocha')
const tslint = require('gulp-tslint')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript2')
const rollupNodeResolve = require('rollup-plugin-node-resolve')
const rollupCommonjs = require('rollup-plugin-commonjs')
const rollupSourceMaps = require('rollup-plugin-sourcemaps')
const terser = require('gulp-terser')
const del = require('del')
const pkg = require('./package.json')
const typedoc = require('gulp-typedoc')
const watch = (paths, tasks) => () => gulp.watch(paths, tasks)
const allFiles = ['src/**/*.ts', 'test/**/*.ts']

// Functions
function bundle() {
    return rollup.rollup({
        input: 'src/index.ts',
        plugins: [
            rollupTypescript({ typescript: require('typescript'), tsconfig: './tsconfig.json' }),
            rollupCommonjs(),
            rollupNodeResolve(),
            rollupSourceMaps()
        ]
    })
        .then(bundle =>
            Promise.all([
                bundle.write({
                    file: pkg.main,
                    format: 'cjs',
                    exports: 'named',
                    sourcemap: true,
                    name: 'xydata'
                }),
                bundle.write({
                    file: pkg.module,
                    format: 'es',
                    exports: 'named',
                    sourcemap: true,
                    name: 'xydata'
                }),
                bundle.write({
                    file: pkg.iife,
                    format: 'iife',
                    exports: 'named',
                    sourcemap: true,
                    name: 'xydata'
                })
            ])
        )
}

function minify() {
    return src([pkg.iife])
        .pipe(terser({
            mangle: {
                toplevel: true,
                reserved: [
                    'xydata'
                ],
                properties: {
                    regex: /\b_\w*/,
                    keep_quoted: true
                }
            },
            keep_classnames: false,
            keep_fnames: false
        }))
        .pipe(dest('dist'))
}

function docs() {
    return src(['src/**/*.ts'])
        .pipe(typedoc({
            module: 'commonjs',
            target: 'ES5',
            excludeProtected: true,
            excludePrivate: true,
            excludeExternals: true,
            out: 'docs/v0.0.0',
            mode: 'file',
            tsConfig: 'tsconfig.json',
            name: 'XYData Generator API Documentation',
            hideGenerator: true
        }))
}

function lint() {
    return src(allFiles)
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report({ allowWarnings: true }))
}

function test() {
    return src('./test/**/*.spec.ts', { read: false })
        .pipe(mocha({
            "timeout": 100000,
            require: 'ts-node/register',
            reporter: 'spec'
        }))
}

function clean() {
    return del('dist')
}

const build = series(clean, bundle, minify)

/**
 * Testing Tasks
 */
// gulp.task('test', test)
// gulp.task('testWatch', gulp.series('test', watch(allFiles, gulp.series('test'))))
/**
 * Linting Tasks
 */
//gulp.task('lint', lint)
//gulp.task('lint:watch', gulp.series('lint', watch(allFiles, gulp.series('lint'))))
/**
 * General
 */
//gulp.task('ci:watch', gulp.parallel('test', 'lint'), watch(allFiles, gulp.parallel('test', 'lint')))
//gulp.task('clean', () => clean('dist'))
/**
 * Build
 */
//gulp.task('build:rollup', bundle)
//gulp.task('build:terser', minify)
//gulp.task('build', gulp.series('clean', 'build:rollup', 'build:terser'))
//gulp.task('build:watch', gulp.series('build', watch(allFiles, gulp.series('build'))))
/**
 * TypeDoc Tasks
 */
exports.docs = docs
exports.test = test
exports.testWatch = series(test, watch(allFiles, series(test)))
exports.lint = lint
exports.lintWatch = series(lint, watch(allFiles, series(lint)))
exports.ciWatch = parallel(test, lint), watch(allFiles, parallel(test, lint))
exports.clean = clean
exports.bundle = bundle
exports.minify = minify
exports.build = build
exports.buildWatch = series(build, watch(allFiles, build))