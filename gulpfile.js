const gulp = require('gulp');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cache = require('gulp-cache');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync');
const server = browserSync.create();

function serve(done) {
  server.init({
    server: {
       baseDir: './'
    }
  });
  done();
}

function styles() {
  let stream = gulp.src(['src/scss/*.scss'])
                   .pipe(plumber({
                     errorHandler: function (error) {
                       console.log(error.message);
                       this.emit('end');
                   }}))
                   .pipe(sass().on('error', sass.logError))
                   .pipe(gulp.dest('dist/css/'))
                   .pipe(rename({suffix: '.min'}))
                   .pipe(cleanCSS());

  return stream.pipe(gulp.dest('dist/css/'));
}

function scripts(){
  let stream = gulp.src(['src/scripts/*.js'])
                   .pipe(plumber({
                     errorHandler: function (error) {
                       console.log(error.message);
                       this.emit('end');
                   }}))
                   .pipe(babel({
                     presets: ['es2015']
                   }))
                   .pipe(gulp.dest('dist/scripts/'))
                   .pipe(rename({suffix: '.min'}))
                   .pipe(uglify());

  return stream.pipe(gulp.dest('dist/scripts/'));
}

function reload(done) {
  server.reload();
  done();
}


const watch = () => {
  gulp.watch('*.html', reload);
  gulp.watch('src/scss/*.scss', gulp.series(styles, reload));
  gulp.watch('src/scripts/*.js', gulp.series(scripts, reload));
}

gulp.task('default', gulp.series(serve, watch));
