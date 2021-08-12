
var gulp = require('gulp');
var findUnusedImages = require('gulp-in-unused-images');

gulp.task('find_unused', function () {
  var options = {
    multi_folder : true, // 이미지 폴더가 여러개일 경우 true 로 해주시고 img_folder_path를 모든 이미지 폴더의 상위폴더로 적어주세요.
    img_folder_path : 'img/', // 이미지 폴더명 입력
    depth_to_folder : 'src/', //gulpfile과 이미지 폴더 사이에 depth가 있다면 적어주세요. (저장소 명이라면 저장소명/ , src라면 src/)
  }
  return gulp.src(['src/**/img/**/*','src/**/image/**/*', 'src/**/*.html', 'src/css/**/*.css']) //이미지 폴더가 여러개 일경우 폴더명을 모두 적어주세요
  .pipe(findUnusedImages(options))
});
