(function() {

    // 設計思想

    // @md
    // このコメントを .md に出力する
    // md@

    // @md[php]
    // このコメントは ```php として出力する
    // md@

    // デフォの出力先は Readme.md
    // 存在していた場合は 末尾もしくは
    // <!-- mdpick -->
    // <!-- endmdpick -->
    // 内に出力する.

    "use strict;"

    var PLUGIN_NAME = 'gulp-mdpick';

    var fs       = require('fs'),
        path     = require('path'),
        gutil    = require('gulp-util'),
        through2 = require('through2'),
        Result   = require('./Result.js');

    // --- Log utils.

    function log( message ) {
        gutil.log( gutil.colors.magenta(PLUGIN_NAME), message);
    }

    function warn (message) {
        log(gutil.colors.red('WARNING') + ' ' + message);
    }

    function error (message) {
        return new gutil.PluginError( PLUGIN_NAME, message );
    }

    // --- exports.

    return module.exports = function ( options ) {

        var out = "README.md";
        var into;

        if( typeof options !== "undefined" ){
            if( typeof options.out === "string" ){
                out  = options.out;
            }
            if( typeof options.into === "string" ){
                into = fs.readFileSync( path.resolve( ".", options.into ) );
            }
        }

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

            log( "Reading " + filename + "." )

            // ファイルの内容を１行ずつ調べ格納する.

            var result;
            var mdpick = [["## "+filename]];
            var lines  = file.contents.toString().split(/\r?\n/);

            for( var i=0,len=lines.length; i<len; i++ ){

                var r = new Result(lines[i]);

                if( r.isMatched() ){
                    if( r.isStart() ){
                        var src   = [];
                        var isEnd = false;

                        if( r.useSyntax() ){
                            src.push("```"+ r.syntax);
                        }
                        do{
                            if( ++i == len ){
                                isEnd = true;
                            }else{
                                var r2 = new Result(lines[i]);
                                if( r2.isEnd() ){
                                    isEnd = true;
                                }else{
                                    src.push(r.replace(lines[i]));
                                }
                            }
                        }while( !isEnd );
                        if( r.useSyntax() ){
                            src.push("```");
                        }
                    }
                    mdpick.push( src.join("\n") );
                }

            }

            output.push( mdpick.join("\n\n") );

            callback();

        }

        function flush(callback){

            // 出力ファイルを生成（新規ファイル生成にはgulp-utilのFileを利用する）

            var outputFile = new gutil.File({
                base : path.join( __dirname, './fixtures/'),
                cwd  : __dirname,
                path : path.join( __dirname, './fixtures/', out )
            });

            output.push("<!-- mdpick@ -->");

            if( typeof into !== "undefined" ){

                var reg = /<!\-+\s*@mdpick\s*\-+>(.|\n|\r)+<!\-+\s*mdpick@\s*\-+>/m;
                var src = into.toString();

                if( src.match(reg) ){
                    outputFile.contents = new Buffer( src.replace(reg,output.join("\n\n")) );
                }else{
                    outputFile.contents = new Buffer( src + "\n\n" + output.join("\n\n") );
                }

                log("Write markdown into '" + options.into + "'");

            }else{


                outputFile.contents = new Buffer(output.join("\n\n"));

                log("Create markdown file '" + out + "'");

            }

            this.push(outputFile);

            callback();

        }

        return through2.obj(transform,flush);

    };

}).call(this);