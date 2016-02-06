import _ from 'lodash';
import del from 'del';
import pngquant from 'imagemin-pngquant';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import plumber from 'gulp-plumber';
import livereload from 'gulp-livereload';
import sass from 'gulp-sass';
import gzip from 'gulp-gzip';
import clone from 'gulp-clone';
import babel from 'gulp-babel';
import imagemin from 'gulp-imagemin';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import gulpif from 'gulp-if';
import rev from 'gulp-rev';
import uglify from 'gulp-uglify';
import cssnano from 'gulp-cssnano';
import newer from 'gulp-newer';
import eslint from 'gulp-eslint';

let env = process.env.NODE_ENV || 'development';
const serverFolder = 'server';
const sourceFolder = 'src';
const publicFolder = 'public';
const configFolder = 'config';

const scriptsSrcFolder = `${sourceFolder}/scripts`;
const scriptsDestFolder = `${publicFolder}/scripts`;
const vendorScripts = [
  './node_modules/babel-polyfill/dist/polyfill.min.js',
];

const stylesSrcFolder = `${sourceFolder}/styles`;
const stylesDestFolder = `${publicFolder}/styles`;

const isProduction = () => env === 'production';

const getRevManifestPath = key => `rev-manifest-${key}.json`;

const promisifyTask = (gulpTask) => new Promise((resolve, reject) => {
  gulpTask
    .on('end', resolve)
    .on('error', reject);
});

const cleanup = (done) => del(
  [
    `${configFolder}/rev-manifest*.json`,
    `${publicFolder}/**/*`,
    `${publicFolder}/!.gitignore`,
  ], done
);

gulp.task('cleanup', cleanup);

const buildSass = () => promisifyTask(
  gulp.src(`${stylesSrcFolder}/*.scss`)
    .pipe(plumber())
    .pipe(gulpif(!isProduction(), sourcemaps.init()))
    .pipe(sass())
    .pipe(gulpif(isProduction(), cssnano({
      autoprefixer: {
        browsers: ['last 2 versions'],
        cascade: false,
      },
    })))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(isProduction(), rev()))
    .pipe(gulp.dest(stylesDestFolder))
    .pipe(gulpif(isProduction(), rev.manifest(getRevManifestPath('style'))))
    .pipe(gulpif(isProduction(), gulp.dest(configFolder)))
    .pipe(livereload())
);

gulp.task('sass', buildSass);

const babelify = () => promisifyTask(
  gulp.src(`${scriptsSrcFolder}/**/*.js`)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(!isProduction(), sourcemaps.init()))
    .pipe(babel({
      presets: ['es2015', 'stage-3'],
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(isProduction(), concat('app.js')))
    .pipe(gulpif(isProduction(), uglify()))
    .pipe(gulpif(isProduction(), rev()))
    .pipe(gulp.dest(scriptsDestFolder))
    .pipe(gulpif(isProduction(), rev.manifest(getRevManifestPath('app'))))
    .pipe(gulpif(isProduction(), gulp.dest(configFolder)))
    .pipe(livereload())
);

gulp.task('babelify', babelify);

const gzipAssets = (source, destination) => promisifyTask(
  gulp.src(source)
    .pipe(plumber())
    .pipe(clone())
    .pipe(gzip({
      preExtension: 'gz',
      gzipOptions: {
        level: 9,
        memLevel: 9,
      },
    }))
    .pipe(gulp.dest(destination))
    .pipe(livereload())
);

const gzipCss = () => gzipAssets(`${stylesDestFolder}/*.css`, stylesDestFolder);

gulp.task('gzipCss', gzipCss);

const gzipJs = () => gzipAssets(`${scriptsDestFolder}/*.js`, scriptsDestFolder);

gulp.task('gzipJs', gzipJs);

const copyImages = () => {
  const faviconDestination = `${sourceFolder}/favicon.ico`;
  gulp.src(faviconDestination)
    .pipe(plumber())
    .pipe(gulp.dest(publicFolder));
  const imagesDestination = `${publicFolder}/images`;
  return promisifyTask(
    gulp.src(`${sourceFolder}/images/*`)
      .pipe(newer(imagesDestination))
      .pipe(plumber())
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false,
        }],
        use: [pngquant()],
      }))
      .pipe(gulp.dest(imagesDestination))
      .pipe(livereload())
  );
};

gulp.task('copyImages', copyImages);

const mergeVendorScripts = () => promisifyTask(
  gulp.src(vendorScripts)
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulpif(isProduction(), rev()))
    .pipe(gulp.dest(scriptsDestFolder))
    .pipe(gulpif(isProduction(), rev.manifest(getRevManifestPath('vendor'))))
    .pipe(gulpif(isProduction(), gulp.dest(configFolder)))
    .pipe(livereload())
);

const gzipCode = () => {
  if (isProduction()) {
    return Promise.all([
      gzipCss(),
      gzipJs(),
    ]);
  }
  return Promise.resolve();
};

const build = (overrideEnv) => () => {
  if (_.isString(overrideEnv)) {
    console.log('\n', 'Overriding env to:', `"${overrideEnv}"`);
    env = overrideEnv;
  }
  console.info('\n', 'Building:', `"${env}"`, '\n');
  return Promise.all([
    copyImages(),
    buildSass(),
    mergeVendorScripts(),
    babelify(),
  ]).then(gzipCode);
};

gulp.task('build', ['cleanup', 'lint'], build());

gulp.task('build:prod', ['cleanup', 'lint'], build('production'));

const watchSass = () => gulp.watch(
  'styles/**/*.scss',
  {
    cwd: sourceFolder,
  },
  ['sass']
);

gulp.task('watchSass', watchSass);

const watchJs = () => gulp.watch(
  'scripts/**/*.js',
  {
    cwd: sourceFolder,
  },
  ['babelify']
);

gulp.task('watchJs', watchJs);

const watchImages = () => gulp.watch(
  'images/*',
  {
    cwd: sourceFolder,
  },
  ['copyImages']
);

gulp.task('watchImages', watchImages);

const watchServer = () => gulp.watch(
  '**/*.js',
  {
    cwd: serverFolder,
  },
  ['lint']
);

gulp.task('watchServer', watchServer);

const develop = () => {
  livereload.listen();
  nodemon({
    script: 'index',
    ext: 'js handlebars coffee',
    stdout: false,
  }).on('readable', function () {
    this.stdout.on('data', chunk => {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
};

gulp.task('lint', () => gulp.src(
  [
    `${scriptsSrcFolder}/**/*.js`,
    'server/**/*.js',
  ]
  )
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
);

gulp.task('develop', develop);

gulp.task('watch', [
  'watchSass',
  'watchJs',
  'watchImages',
  'watchServer',
]);

gulp.task('serve', [
  'develop',
  'build',
  'watch',
]);

gulp.task('default', ['serve']);
