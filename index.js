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
            imageNames.push(chunk.path.substring(chunk.path.indexOf(options.img_folder_path)));
            return callback();
        }

        try {
            var ast = css.parse(String(chunk.contents));
            ast.stylesheet.rules.forEach(function (rule) {
                if (rule.type !== 'rule') {
                    return;
                }

                rule.declarations.forEach(function (declaration) {
                    var match = declaration.value.match(/url\(("|'|)(.+?)\1\)/);
                    if (match) {
                        addUsed(match[2]);
                    }
                });
            });
        }
        catch (e) {
            htmlParser.write(String(chunk.contents));
        }

        self.push(chunk);
        callback();
    });

    const fs = require('fs');
    transform.on('finish', function () {
        var unused = _.difference(imageNames, usedImageNames);
        if (unused.length && options.log) {
            var pathto = options.depth_to_folder ;
            var htmlcontent = '<li><img src="' + pathto + unused.join('"/><name></li> <li><img src="' + pathto) + '"/></li>' ;
            fs.readFile(__dirname+'/template/template.html', 'utf-8', function (err,data) {
                if (err) return console.log(err);
				var makeHtml = data.replace(/\n\s*<!--\s*here\s*-->/, htmlcontent);
                fs.writeFile('@unused.html',makeHtml ,function(err) {
                    if (err) return console.log(err);
                })
                // console.log(makeHtml);
              });

        }
    });
    
    return transform;
}

module.exports = findUnusedImages;
