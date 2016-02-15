var gulp = require('gulp'),
    filter = require('gulp-filter'),
    browserSync  = require("browser-sync").create(),
    sass = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer'),
    pngquant = require('imagemin-pngquant'),
    clean = require('gulp-clean'),
    csscomb = require('gulp-csscomb'),
    cssnano = require('gulp-cssnano'),
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    // sprity = require('sprity'),
    cmq = require('gulp-combine-media-queries'),
    jade = require('gulp-jade'),
    prettify = require('gulp-html-prettify'),
    reload = browserSync.reload;

// extra config vars
var config = {
  scssDir: 'src/scss/',
  cssDir: 'dist/css/',
  jsDir: 'dist/js',
  srcDir: 'src/',
  distDir: 'dist/',
  sourceJsDir: 'src/js/',
  sourceImgDir: 'src/sourceimages/',
  imgDir: 'dist/images/',
  logCMQ: false,
  spriteDir: './src/sourceimages/sprites/',
  spriteScssDir: './src/scss/components/',
  autoprefixConf : ['> 1%', 'last 3 versions', 'Firefox ESR', 'Opera 12.1']
}

// compile jade tamplate
gulp.task('templates', function() {
  gulp.src(config.srcDir + '*.jade')
    .pipe(jade())
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest(config.distDir));
});

gulp.task('pretty', ['templates'], function() {
  gulp.src(config.distDir + '*.html')
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest(config.distDir))
});

gulp.task('clean', function () {
  return gulp.src(config.cssDir + '*.*', {read: false})
    .pipe(clean());
});

gulp.task('scripts', function() {
  return gulp.src([
      config.sourceJsDir + 'lib/*.js',
      config.sourceJsDir + 'plugins/*.js',
      config.sourceJsDir + '*.js'
    ])
    .pipe(concat('all.js'))
    .pipe(gulp.dest(config.jsDir));
});

gulp.task('cssmin', function() {
  return gulp.src(config.cssDir + '*.css')
    .pipe(cssnano())
    .pipe(gulp.dest(config.cssDir));
});

gulp.task('cssbeauty', ['sass:dist'], function() {
  return gulp.src(config.cssDir + '/*.css')
    .pipe(csscomb())
    .pipe(gulp.dest(config.cssDir));
});

gulp.task('serve', ['sass:dev', 'templates'], function() {
  browserSync.init({
    server: {
      baseDir: "./dist",
      directory: true
    }
  });

  gulp.watch(config.scssDir + "**/*.scss", ['sass:dev']);
  gulp.watch(config.sourceImgDir + "**", ['imgmin']);
  gulp.watch(config.sourceJsDir + "**/*", ['scripts']);
  gulp.watch(config.srcDir + "**/*.jade", ['templates']);
  gulp.watch(config.distDir + "*.html").on('change', reload);
  gulp.watch(config.jsDir + "**/*.js").on('change', reload);
});

gulp.task('imgmin', function() {
  return gulp.src(config.sourceImgDir + '**')
    .pipe(newer(config.imgDir))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [
        {removeViewBox: false},
        {cleanupIDs: false}
      ],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(config.imgDir));
});

gulp.task('sass:dev', function () {
  return gulp.src(config.scssDir + '**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    // .on('error', function(err){
    //   console.log(err.toString());
    //   this.emit('end');
    // })
    .pipe(sourcemaps.write())// Write the CSS & Source maps
    .pipe(autoprefixer({
      browsers: config.autoprefixConf,
      cascade: false
    }))
    .pipe(gulp.dest(config.cssDir))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('sass:dist', ['clean'],  function () {
  return gulp.src(config.scssDir + '**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: config.autoprefixConf,
      cascade: false
    }))
    .pipe(gulp.dest(config.cssDir))
});

gulp.task('default', ['serve']);
gulp.task('dist', ['cssbeauty', 'templates', 'scripts']);