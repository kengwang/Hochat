/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */
// Load plugins
var theme = 'default';

var gulp = require('gulp'),
    replace = require('gulp-replace'),
    header = require('gulp-header'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    cleancss = require('gulp-clean-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    htmlclean = require('gulp-htmlclean'),
    htmlmin = require('gulp-htmlmin'),
    gulpif = require('gulp-if'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del');

// Styles
gulp.task('styles', function () {
    return gulp.src('theme/' + theme + '/style/*.css')
        .pipe(concat('main.css'))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 10 versions', 'Firefox >= 20', 'Opera >= 36', 'ie >= 9', 'Android >= 4.0',],
            cascade: true, //是否美化格式
            remove: false //是否删除不必要的前缀
        }))
        //.pipe(rename({ suffix: '.min' }))
        // .pipe(gulpif(conditionCss, cleancss({
        //     keepSpecialComments: '*' //保留所有特殊前缀
        // })))
        .pipe(minifycss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('cdn/theme/' + theme + '/style'))
        .pipe(notify({message: 'Styles task complete'}));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['theme/' + theme + '/js/*.js'])
        .pipe(sourcemaps.init())
        /*.pipe(babel({
            presets: ['es2015']
        }))*/
        .pipe(jshint({
            'undef': true,
            'unused': true
        }))
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        //.pipe(uglify())
        .pipe(gulp.dest('cdn/theme/' + theme + '/js'))
        .pipe(notify({message: 'Scripts task complete'}));
});

//theme-make
gulp.task('make-theme', function () {
    return gulp.src('theme/' + theme + '/' + theme + '.html')
        .pipe(header('<?php define(\'THEMENAME\',\'' + theme + '\'); if (THEME!=THEMENAME) exit;?>\n'))
        //<%= comment.username %=>
        .pipe(replace(/<%=\s*(.*)\s*=%>/g, '<?php echo $FRONT[\'$1\'];?>'))
        .pipe(replace(/<#\s*loop\s+(.*)\s+as\s+(.*)\s+#>/g, "<?php foreach ($FRONT['$1'] as $$$2): arraytofront('$2',$$$2); ?>"))
        //<# if (%comment.username%="3") #>  ===>  if ($FRONT['comment.username'] == '3')
        .pipe(replace(/<#\\s*if\\s+%(.*)%\\s*(==|!=)\\s*\"(.*)\"\\s*#>/g, "<?php if ($FRONT['$1']  $2 '$3':?>"))
        .pipe(replace(/<#\s*endif\s*#>/g, "<?php endif; ?"))
        .pipe(replace(/<#\s*endloop\s*#>/g, "<?php endforeach; ?>"))
        .pipe(rename({extname: '.theme.php'}))
        .pipe(gulp.dest('theme/'))
        .pipe(notify({message: 'Theme make done!'}));
});

//html
gulp.task('html', function () {
    return gulp.src('theme/' + theme + '/' + theme + '.html')
        .pipe(htmlclean())
        // .pipe(htmlmin({
        //     removeComments: true, //清除HTML注释
        //     collapseWhitespace: true, //压缩HTML
        //     minifyJS: true, //压缩页面JS
        //     minifyCSS: true, //压缩页面CSS
        //     minifyURLs: true
        // }))
        .pipe(rename({extname: '.theme.html'}))
        .pipe(gulp.dest('theme/' + theme + '/'))
        //.pipe(del('../theme/' + theme + '.html'))
        .pipe(notify({message: 'HTML task complete'}));
});

// Images
gulp.task('images', function () {
    return gulp.src('theme/' + theme + '/img/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('cdn/theme/' + theme + '/img'))
        .pipe(notify({message: 'Images task complete'}));
});

/*
// Clean
gulp.task('clean', function(cb) {
    del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img'], cb)
});
*/
// Default task
gulp.task('default', gulp.series('scripts', 'images', 'styles', 'make-theme'));

// // Watch
// gulp.task('watch', function() {
//   // Watch .scss files
//   gulp.watch('src/styles/**/*.scss', ['styles']);
//   // Watch .js files
//   gulp.watch('src/scripts/**/*.js', ['scripts']);
//   // Watch image files
//   gulp.watch('src/images/**/*', ['images']);
//   // Create LiveReload server
//   livereload.listen();
//   // Watch any files in dist/, reload on change
//   gulp.watch(['dist/**']).on('change', livereload.changed);
// });