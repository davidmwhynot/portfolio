// imports
const gulp = require('gulp');

const embedSvg = require('gulp-embed-svg');

const srcmaps = require('gulp-sourcemaps');

const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

// config
const AUTOPREFIXER_BROWSERS = ['> 1%', 'last 2 versions'];

// tasks
gulp.task('html', () => {
	return gulp
		.src('src/public/*.html')
		.pipe(embedSvg({ root: './dist/public/media' }))
		.pipe(gulp.dest('dist/public'));
});

gulp.task('sass', () => {
	return gulp
		.src('src/public/sass/*.scss')
		.pipe(srcmaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
		.pipe(srcmaps.write())
		.pipe(gulp.dest('dist/public'));
});

const images = () => {
	gulp
		.src('src/public/media/**/*.png')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/public/media'));
	return gulp
		.src([
			'src/public/media/**/*.png',
			'src/public/media/**/*.jpg',
			'src/public/media/**/*.jpeg'
		])
		.pipe(imagemin())
		.pipe(webp())
		.pipe(gulp.dest('dist/public/media'));
};

const media = () => {
	return gulp
		.src([
			'src/public/media/**/*',
			'!src/public/media/**/*.png',
			'!src/public/media/**/*.jpg',
			'!src/public/media/**/*.jpeg'
		])
		.pipe(gulp.dest('dist/public/media'));
};

gulp.task('media', gulp.parallel(images, media));

gulp.task('redirects', () => {
	return gulp.src('src/_redirects').pipe(gulp.dest('dist/public'));
});

gulp.task(
	'build',
	gulp.parallel(gulp.series('media', 'html'), 'sass', 'redirects')
);

gulp.task(
	'default',
	gulp.series('build', () => {
		gulp.watch('src/public/sass/**/*.scss', gulp.series('sass'));
		gulp.watch('src/public/media/**/*', gulp.series('media'));
		gulp.watch('src/public/*.html', gulp.series('html'));
		gulp.watch('src/_redirects', gulp.series('redirects'));
	})
);
