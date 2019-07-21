const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });
  gulp.watch('./src/scss/**/*.scss', gulp.series('styles'));
  gulp.watch('./src/**/*.js', gulp.series('scripts'));
});

gulp.task('clean:styles', function () {
     return gulp.src('/dist/*.css', {read: false})
         .pipe(clean());
 });

 gulp.task('clean:scripts', function() {
     return gulp.src('/dist/*.js', {read: false})
         .pipe(clean());
 });

gulp.task('build:styles', function() {
  return gulp.src('./src/scss/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer({
        browsers: ["> 0.2%"]
      }))
      .pipe(concat('style.css'))
      .pipe(gulp.dest('./dist'))
      .pipe(browserSync.reload({
        stream: true
     }))
  });

gulp.task('build:scripts', function() {
    return gulp.src('./src/**/*.js')
      .pipe(concat('main.bundle.js'))
      .pipe(babel({
        presets: [
          ['@babel/env', {
            modules: false
          }]
        ]
      }))
      .pipe(uglify())
      .pipe(gulp.dest('./dist'))
      .pipe(browserSync.reload({
        stream: true
     }))
  });


gulp.task('styles', gulp.series('clean:styles', 'build:styles'));
gulp.task('scripts', gulp.series('clean:scripts', 'build:scripts'));

gulp.task('build', gulp.parallel('styles', 'scripts'));
gulp.task('start', gulp.series('build','browserSync'));