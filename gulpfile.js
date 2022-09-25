import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/script.js')
    .pipe(terser())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
};

// Copy favicon

const ico = () => {
  return gulp.src('source/*.ico')
    .pipe(gulp.dest('build'));
};

// Copy manifest

const manifest = (done) => {
  gulp.src('source/manifest.webmanifest')
  .pipe(gulp.dest('build'))
  done();
}

// Images

export const images = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

// WebP

export const createWebp = () => {
  return gulp.src('source/img/*.{png,jpg}')
    .pipe(squoosh({ webp: {} }))
    .pipe(gulp.dest('build/img'))
}

// SVG

export const svg = () =>
  gulp.src('source/img/*.svg', '!source/img/icons/*.svg', '!source/img/sprite.svg')
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));

export const sprite = () => {
  return gulp.src('source/img/*.svg')
    .pipe(svgo())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Copy fonts

export const fonts = (done) => {
  gulp.src('source/fonts/*.{woff2,woff}', { base: 'source' })
    .pipe(gulp.dest('build'))
  done();
}

// Clean

export const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change',  gulp.series(html, browser.reload));
  gulp.watch('source/js/script.js', gulp.series(scripts));
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Build

export const build = gulp.series(
  clean,
  images,
  svg,
  gulp.parallel(
    styles,
    html,
    scripts,
    ico,
    createWebp,
    sprite,
    fonts,
    manifest
  ),
);


// Default

export default gulp.series(
  clean,
  images,
  svg,
  gulp.parallel(
    styles,
    html,
    scripts,
    ico,
    createWebp,
    sprite,
    fonts,
    manifest
  ),
  gulp.series(
    server,
    watcher
  ));
