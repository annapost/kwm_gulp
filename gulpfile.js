const {src, dest, watch, parallel, series } = require("gulp");

const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const sync = require("browser-sync").create();
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const inject = require('gulp-inject');

sass.compiler = require('node-sass');

function generateCSS(cb) {
    src('scss/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(dest('public'))
        .pipe(sync.stream());
    cb();
}

function concatJS(cb) {
    src('js/*.js')
        .pipe(concat('main.js'))
        .pipe(dest('public'));
    cb();
}

function uglifyJS(cb) {
    src('public/main.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest('public'));
    cb();
}


function minimCSS(cb) {
    src('public/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest('public'));
    cb();
}


function minimIMG(cb) {
    src('./img/*')
        .pipe(imagemin())
        .pipe(dest('public/img'));
    cb();
}


function indexHelp() {
    let target = src('public/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    let sources = src(['public/main.js', 'public/style.css'], {read: false});
    return target.pipe(inject(sources))
        .pipe(dest('public'));

}



function watchFiles(cb) {
    watch('./js/*.js', parallel(concatJS, uglifyJS));
    watch('./scss/style.scss', generateCSS);
}


function browserSync(cb) {
    sync.init({
        server: {
            baseDir: "localhost:80/advfe_c_hol/public/"
        }
    });

    watch('./js/*.js', parallel(concatJS, uglifyJS));
    watch('./scss/style.scss', generateCSS);
    watch("public/**.html").on('change', sync.reload);
}


exports.css = generateCSS;
exports.concat = concatJS;

exports.uglify = uglifyJS;
exports.cssmin = minimCSS;

// -- my own
exports.imagemin = minimIMG;
exports.index = indexHelp;


exports.watch = watchFiles;
exports.sync = browserSync;


exports.default = series(parallel(generateCSS, minimCSS, concatJS, uglifyJS, minimIMG));