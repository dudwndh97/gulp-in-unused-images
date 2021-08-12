var through2 = require('through2'),
    mime = require('mime'),
    css = require('css'),
    htmlparser2 = require('htmlparser2'),
    gutil = require('gulp-util'),
    File = require('vinyl'),
    path = require('path'),
    _ = require('lodash');

var PLUGIN_NAME = 'gulp-in-unused-images';

function findUnusedImages(options) {

    function addUsed(imageUrl) {
        if (!imageUrl.match(/(data|http|https):/)) {
            usedImageNames.push(imageUrl.substring(imageUrl.indexOf(options.img_folder_path)));
        }
    }

    var imageNames = [];
    var usedImageNames = [];
    var ngUsedImages = [];

    var htmlParser = new htmlparser2.Parser({
        onopentag: function onopentag(name, attribs) {
            if (name === 'img') {
                if (attribs.src) {
                    addUsed(attribs.src);
                }
                if (attribs['ng-src']) {
                    ngUsedImages.push(attribs['ng-src']);
                }
            }
			// eg shortcut icon apple-touch-icon, it doesnt matter if we add extras that are not images
            else if (name === 'link' && attribs.href) {
                addUsed(attribs.href);
            }
			// eg msapplication-xxx
            else if (name === 'meta' && attribs.content) {
                addUsed(attribs.content);
            }
            // video posters
            else if (name == 'video' && attribs.poster) {
                addUsed(attribs.poster);
            }
        }
    });

    var transform = through2.obj(function (chunk, enc, callback) {

        var self = this;
    
        if (chunk.isNull()) {
          self.push(chunk);
          return callback();
        }
    
        if (chunk.isStream()) {
          return callback(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }
    
        if (mime.lookup(chunk.path).match(/image\//)) {
          imageNames.push(chunk.path);
          return callback();
        }
    
        try {
          var rl = require('readline').createInterface({
            input: fs.createReadStream(String(chunk.path)),
            terminal: false
          }).on('line', function (line) {
            var filename = (line.match(/((?:((?:[^\(\\\'\"\r\n\t\f\/\s\.])+)\.(?:(png|gif|jpe?g|pdf|xml|apng|svg|mng)\b)))/gmi) || []).pop();
            if (filename) {
              usedImageNames.push(filename);
            }
          }).on('close', function () {
    
            self.push(chunk);
    
            callback();
    
          });
        } catch (e) {
          console.log(e);
          callback();
        }
    
      });
    

    const fs = require('fs');

    transform.on('finish', function () {
        _.mixin({
            findUsedImages: function (imageNames, usedImageNames) {
              return _.filter(imageNames, function (path) {
                return _.includes(usedImageNames, _(path).split('/').last());
              });
            },
        });
        function getImageUrl(element, index, array) {
            if(element.match(options.img_folder_path)) array[index] = element.substring(element.indexOf(options.img_folder_path))
            if(options.multi_folder) {
                if(element.match(options.img_folder_path)) array[index] = element.substring(element.indexOf(options.img_folder_path))
            }
        }

          var usedImages = _.findUsedImages(imageNames, usedImageNames);
          var unusedImages = _.difference(imageNames, usedImages);

        if (unusedImages.length && options.log) {
            unusedImages.forEach(getImageUrl);

            var pathto = options.depth_to_folder ;
            var htmlcontent = '<li><img src="' + pathto + unusedImages.join('"/><name></li> <li><img src="' + pathto) + '"/></li>' ;
            fs.readFile(__dirname+'/template/template.html', 'utf-8', function (err,data) {
                if (err) return console.log(err);
				var makeHtml = data.replace(/\n\s*<!--\s*here\s*-->/, htmlcontent);
                fs.writeFile('@unused.html',makeHtml ,function(err) {
                    if (err) return console.log(err);
                })
              });

        }
    });
    
    return transform;
}

module.exports = findUnusedImages;
