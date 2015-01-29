(function() {

    "use strict;"

    var PLUGIN_NAME = 'gulp-mdpick';

    var fs       = require('fs'),
        path     = require('path'),
        gutil    = require('gulp-util'),
        through2 = require('through2'),
        extend   = require('extend'),
        Line     = require('./Line.js');

    // --- Log utils.

    function log( message ) {
        gutil.log( gutil.colors.magenta(PLUGIN_NAME), message);
    }

    function warn(message) {
        log(gutil.colors.red('WARNING') + ' ' + message);
    }

    function error(message) {
        return new gutil.PluginError( PLUGIN_NAME, message );
    }

    // --- exports.

    return module.exports = function ( options ) {

        options = extend({
            "out"    : "README.md",
            "into"   : undefined,
            "marker" : "md"
        },options);

        // --- 出力の設定.

        var output = ["<!-- @mdpick -->"];

        /**
         * 渡された file から @md md@ で囲まれた内容を抜き取る
         *
         * @param file
         * @param encoding
         * @param callback
         * @returns {*}
         */
        function transform( file, encoding, callback ){

            // If file is null.
            // Skip this transform.
            if (file.isNull()) {
                this.push(file);
                return callback();
            }

            // If file is stream.
            // Emit error.
            if (file.isStream()) {
                this.emit( 'error', error('Streaming not supported') );
                return callback();
            }

            // Paths are resolved by gulp

            var filename = file.path.substr(file.path.lastIndexOf("/")+1,file.path.length);

            log( "Picking " + filename );

            // ファイルの内容を１行ずつ調べ格納する.

            var picked = [["## "+filename]];
            var lines  = file.contents.toString().split(/\r?\n/);

            for( var i=0,len=lines.length; i<len; i++ ){

                var r = new Line(lines[i],options.marker);

                if( r.isMatched() ){

                    if( r.isStart() ){

                        var src   = [];
                        var isEnd = false;

                        if( r.useSyntax() ){
                            src.push("```"+ r.syntax);
                        }

                        if( r.isInline() ){
                            // inline 記述の場合は閉じタグを調べずその後に書かれたものを出力する.
                            src.push(r.inline);
                        }else{
                            do{
                                if( ++i == len ){
                                    isEnd = true;
                                }else{
                                    var r2 = new Line(lines[i],options.marker);
                                    if( r2.isStart() ){
                                        error("Can't use @" + options.marker + " during picking.");
                                    }else if( r2.isEnd() ){
                                        isEnd = true;
                                    }else{
                                        src.push(r.replace(lines[i]));
                                    }
                                }
                            }while( !isEnd );
                        }

                        if( r.useSyntax() ){
                            src.push("```");
                        }

                    }
                    
                    picked.push( src.join("\n") );

                }

            }

            if( 1 < picked.length ){
                output.push( picked.join("\n\n") );
            }

            callback();

        }

        function flush(callback){

            // 出力ファイルを生成（新規ファイル生成にはgulp-utilのFileを利用する）

            var outputFile = new gutil.File({
                base : path.join( __dirname, './fixtures/'),
                cwd  : __dirname,
                path : path.join( __dirname, './fixtures/', options.out )
            });

            output.push("<!-- mdpick@ -->");

            if( typeof options.into !== "undefined" ){

                var into = fs.readFileSync( path.resolve( ".", options.into ) );
                var reg  = /<!\-+\s*@mdpick\s*\-+>(.|\n|\r)+<!\-+\s*mdpick@\s*\-+>/m;
                var src  = into.toString();

                if( src.match(reg) ){
                    outputFile.contents = new Buffer( src.replace(reg,output.join("\n\n")) );
                }else{
                    outputFile.contents = new Buffer( src + "\n\n" + output.join("\n\n") );
                }

                log("Write markdown into '" + options.into + "'");

            }else{

                outputFile.contents = new Buffer(output.join("\n\n"));

                log("Create markdown file '" + options.out + "'");

            }

            this.push(outputFile);

            callback();

        }

        return through2.obj(transform,flush);

    };

}).call(this);