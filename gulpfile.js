const gulp = require('gulp');
const browserSync = require('browser-sync');
const ssi = require('connect-ssi');
const slim = require('gulp-slim');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const glob = require('gulp-sass-glob');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const changed = require('gulp-changed');
const htmlhint = require('gulp-htmlhint');
const csslint = require('gulp-csslint');
const eslint = require('gulp-eslint');

const paths = {
  rootDir: 'dist/',
  slimSrc: 'src/slim/**/*.slim',
  scssSrc: 'src/assets/scss/**/*.scss',
  jsSrc: 'src/assets/js/**/*.js',
  imgSrc: 'src/assets/img/**/*',
  outSlim: 'dist/',
  outCss: 'dist/assets/css',
  outJs: 'dist/assets/js',
  outImg: 'dist/assets/img',
  mapsCss: 'dist/assets/css/maps',
  mapsJs: 'dist/assets/js/maps'
};

// browser sync
function browserSyncFunc(done){
  browserSync.init({
    server: {
      baseDir: paths.rootDir,
        middleware: [
          ssi({
            baseDir: paths.rootDir,
            notify: false,
            ext: '.html'
          })
        ]
      },
      port: 4000,
      reloadOnRestart: true
    });
  done();
}

// slim
function slimFunc() {
  return gulp.src(paths.slimSrc)
  .pipe(plumber({
    errorHandler: notify.onError('<%= error.message %>'),
  }))
  .pipe(slim({
    require: 'slim/include',
    pretty: true,
    options: 'include_dirs=["src/slim/inc"]'
  }))
  .pipe(gulp.dest(paths.outSlim))
  .pipe(browserSync.stream())
}

// sass
function sassFunc() {
  return gulp.src(paths.scssSrc)
  .pipe(sourcemaps.init())
  .pipe(plumber({
    errorHandler: notify.onError('<%= error.message %>'),
  }))
  .pipe(glob())
  .pipe(sass({
    outputStyle: 'compressed'
  }))
  .pipe(autoprefixer({
    overrideBrowserslist: ['last 2 versions', 'ie >= 11', 'Android >= 4'],
    cascade: false
  }))
  .pipe(sourcemaps.write('maps'))
  .pipe(gulp.dest(paths.outCss))
  .pipe(browserSync.stream());
}

// js
function jsFunc() {
  return gulp.src(paths.jsSrc)
  .pipe(sourcemaps.init())
  .pipe(plumber({
    errorHandler: notify.onError('<%= error.message %>'),
  }))
  .pipe(babel())
  .pipe(uglify({}))
  .pipe(sourcemaps.write('maps'))
  .pipe(gulp.dest(paths.outJs))
  .pipe(browserSync.stream());
}

// img
function imgFunc() {
  return gulp.src(paths.imgSrc)
  .pipe(changed(paths.outImg))
  .pipe(gulp.dest(paths.outImg))
  .pipe(imagemin(
    [
      mozjpeg({
        quality: 80
      }),
      pngquant()
    ],
    {
      verbose: true
    }
  ))
}

// watch
function watchFunc(done) {
  gulp.watch(paths.slimSrc, gulp.parallel(slimFunc));
  gulp.watch(paths.scssSrc, gulp.parallel(sassFunc));
  gulp.watch(paths.jsSrc, gulp.parallel(jsFunc));
  gulp.watch(paths.imgSrc, gulp.parallel(imgFunc));
  done();
}

// lint
function htmlLint() {
  return gulp.src('dist/**/*.html')
    .pipe(htmlhint())
    .pipe(htmlhint.reporter());
}

function cssLint() {
  return gulp.src('dist/assets/**/*.css')
  .pipe(csslint())
  .pipe(csslint.formatter());
}

function esLint() {
  return gulp.src('dist/assets/**/*.js')
  .pipe(eslint({useEslintrc: true}))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
}

// scripts tasks
gulp.task('default',
gulp.parallel(
  browserSyncFunc, watchFunc, slimFunc, sassFunc, jsFunc, imgFunc
  )
);

gulp.task('html-lint', htmlLint);
gulp.task("css-lint", cssLint);
gulp.task('eslint', esLint);
gulp.task('lint',
gulp.series(
  htmlLint, cssLint, esLint
  )
);
