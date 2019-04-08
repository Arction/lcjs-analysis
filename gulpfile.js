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
const allFiles = ['src/**/*.ts', 'test/**/*.ts']
const watch = (paths, tasks) => () => gulp.watch(paths, tasks)

/**
 * Bundle task
 */
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
/**
 * Minify task
 */
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
/**
 * TypeDoc Task
 */
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
/**
 * Linting tasks
 */
function lint() {
    return src(allFiles)
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report({ allowWarnings: true }))
}
// Lint watcher
const lintWatch = series(lint, watch(allFiles, series(lint)))
/**
 * Testing task
 */
function test() {
    return src('./test/**/*.spec.ts', { read: false })
        .pipe(mocha({
            "timeout": 100000,
            require: 'ts-node/register',
            reporter: 'spec'
        }))
}
// Test watcher
const testWatch = series(test, watch(allFiles, series(test)))
// CI watcher
const ciWatch = series(parallel(test, lint), watch(allFiles, parallel(test, lint)))
/**
 * Cleaning task
 */
function clean() {
    return del('dist')
}
/**
 * Building tasks
 */
const build = series(clean, bundle, minify)
const buildWatch = series(build, watch(allFiles, series(build)))

// Export tasks for CLI
exports.docs = docs
exports.test = test
exports.testWatch = testWatch
exports.lint = lint
exports.lintWatch = lintWatch
exports.ciWatch = ciWatch
exports.clean = clean
exports.bundle = bundle
exports.minify = minify
exports.build = build
exports.buildWatch = buildWatch