# Unused Images

저장소에서 사용되지 않는 이미지 목록을 찾아, 보여줍니다.
gulp find_unused 로 작동하며 (수정 가능) 프로세스가 정상적으로 완료되면 @unused.html이 생기고, 이미지 리스트가 생깁니다. 

## Usage
#### Package.json에 아래 추가

    "gulp-in-unused-images": "git+https://oss.navercorp.com/dhwn97/gulp-in-unused-images.git#master ",
    

이미지 폴더가 하나일 경우 이미지 폴더와 같은 depth여도 무방하지만, <br>
이미지 폴더가 여러개일 경우 제일 상위 depth인 이미지폴더보다 한단계 상위부모와 같은 레벨에서 gulp 실행해주세요.

#### gulpfile.js 예시
	var findUnusedImages = require('gulp-in-unused-images');
	
	
	//이미지 폴더가 하나일 경우 , depth가 같아도됨.
	gulp.task('find_unused', function () {
  		var options = {
    		  multi_folder : false, // 이미지 폴더가 여러개일 경우 true 로 해주시고 img_folder_path를 모든 이미지 폴더의 상위폴더로 적어주세요.
    		  img_folder_path : 'img/', // 이미지 폴더명 입력
    		  depth_to_folder : '', // gulpfile과 이미지 폴더 사이에 depth가 있다면 적어주세요. (저장소 명이라면 저장소명/ , src라면 src/)
  		}
  		return gulp.src(['src/**/img/**/*','src/**/*.html', 'src/css/**/*.css']) //이미지 폴더가 여러개 일경우 폴더명을 모두 적어주세요
		
  		.pipe(findUnusedImages(options))
	});
	
	//이미지 폴더 여러개 일 경우 , 부모 폴더에 위치.
	gulp.task('find_unused', function () {
  	  	var options = {
    		  multi_folder : true, // 이미지 폴더가 여러개일 경우 true 로 해주시고 img_folder_path를 모든 이미지 폴더의 상위폴더로 적어주세요.
    		  img_folder_path : 'src/', // 이미지 폴더명 입력
    		  depth_to_folder : 'src/', //gulpfile과 이미지 폴더 사이에 depth가 있다면 적어주세요. (저장소 명이라면 저장소명/ , src라면 src/)
  		}
  		return gulp.src(['src/**/img/**/*','src/**/image/**/*', 'src/**/*.html', 'src/css/**/*.css']) //이미지 폴더가 여러개 일경우 폴더명을 모두 적어주세요
		
  		.pipe(findUnusedImages(options))
	});


### options

* multi_folder: `Boolean` // 이미지 폴더가 여러개일 경우 true 로 해주시고 img_folder_path를 모든 이미지 폴더의 상위폴더로 적어주세요.
* img_folder_path : `string` // 이미지 폴더명 입력 , 이미지 폴더가 여러개일 경우 모든 이미지 폴더의 상위폴더로 적어주세요.( ex) src/ 또는 저장소명/ )
* depth_to_folder : `string` //gulpfile과 이미지 폴더 사이에 depth가 있다면 적어주세요. (저장소 명이라면 저장소명/ , src라면 src/)

	
## Output

gulpfile 과 같은 레벨에 @unused.html 파일이 생성됩니다. 이미지를 확인하실 수 있습니다.
