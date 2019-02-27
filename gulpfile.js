const gulp = require("gulp");

const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");

const AUTOPREFIXER_BROWSERS = ["> 1%", "last 2 versions"];

gulp.task(
  "sass",
  gulp.series(() => {
    return gulp
      .src("src/public/sass/*.scss")
      .pipe(sass().on("error", sass.logError))
      .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe(gulp.dest("dist/public"));
  })
);

gulp.task(
  "default",
  gulp.series(() => {
    gulp.watch("src/public/sass/**/*.scss", gulp.series("sass"));
  })
);
