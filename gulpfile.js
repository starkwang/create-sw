/* eslint-env node */
const eslint = require('gulp-eslint')
const gulp = require('gulp')
const mocha = require('gulp-mocha')
const watch = require('gulp-watch')

gulp.task('default', ['test', 'lint'])

gulp.task('lint', () => gulp.src(['lib/*.js', 'runtime.js', 'cli.js'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError()))

gulp.task('test', () => gulp.src('test/*.js', { read: false })
  .pipe(mocha())
  .on('error', (error) => {
    console.error(error)
    process.exit(1)
  }))

gulp.task('watch', () => watch('lib/*.js', () => {
  gulp.run(['test', 'lint'])
}))

gulp.task('watch:test', () => watch('lib/*.js', () => {
  gulp.run(['test'])
}))

gulp.task('watch:lint', () => watch('lib/*.js', () => {
  gulp.run(['lint'])
}))
