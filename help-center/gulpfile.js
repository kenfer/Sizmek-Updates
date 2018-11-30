var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var pump = require('pump');
var cssnano = require('gulp-cssnano');
var runSequence = require('run-sequence');
const changed = require('gulp-changed');

const src = '../help-center/Sizmek Help Center/src'; //set this to the directory with the source files 
const dest = '../help-center/Sizmek Help Center/dist/'; //set this to the directory where you want the files to be output 

gulp.task('compressjs', function (cb) {
  pump([
        gulp.src(src+'/*.js'),		
		changed(dest+'/js'),
		uglify(),		
        gulp.dest(dest+'/js')
    ],
    cb
  );  
});

gulp.task('compresscss', function (cb) {
  pump([
        gulp.src(src+'/*.css'),
		changed(dest+'/css'),
		cssnano(),        
        gulp.dest(dest+'/css')
    ],
    cb
  );  
});

gulp.task('default', function(callback) {
  runSequence(['compressjs', 'compresscss'], callback);
});