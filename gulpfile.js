// imports
const gulp = require("gulp");

const embedSvg = require("gulp-embed-svg");

const srcmaps = require("gulp-sourcemaps");

const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");

// config
const AUTOPREFIXER_BROWSERS = ["> 1%", "last 2 versions"];

// tasks
gulp.task("html", () => {
  return gulp
    .src("src/public/*.html")
    .pipe(embedSvg({ root: "./src/public/media" }))
    .pipe(gulp.dest("dist/public"));
});

gulp.task("sass", () => {
  return gulp
    .src("src/public/sass/*.scss")
    .pipe(srcmaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(srcmaps.write())
    .pipe(gulp.dest("dist/public"));
});

gulp.task("media", () => {
  return gulp.src("src/public/media/**/*").pipe(gulp.dest("dist/public/media"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("sass", "media", "html"), () => {
    gulp.watch("src/public/sass/**/*.scss", gulp.series("sass"));
    gulp.watch("src/public/media/**/*", gulp.series("media"));
    gulp.watch("src/public/*.html", gulp.series("html"));
  })
);
