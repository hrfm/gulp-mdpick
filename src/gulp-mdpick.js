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
            "startSymbol"   : "@md",       // 開始文字列.
            "endSymbol"     : "md@",       // 終了文字列.
            "out"           : "README.md", // 出力ファイル名.
            "into"          : undefined,   // 元となるファイルを指定するかどうか.
            "writeFileName" : true,        // ファイル名を出力するか. 文字列を指定した場合 その文字列を手前に差し込みます.
            "independently" : false,       // true の場合 src を変更せずファイルだけ出力し次に回す.
            "verbose"       : false        // 細かなログを出力するかどうか.
        },options);
        
        // --- 出力の設定.

        var output = ["<!-- @mdpick -->"];

        /**
         * 渡された file から symbol で囲まれた内容を抜き取る
         * 
         * @param file
         * @param encoding
         * @param callback
         * @returns {*}
         */
        function transform( file, encoding, callback ){

            // --------------------------------------------------------------------------
            // 利用可能なファイルかをチェックする.

            // If file is null.
            // Skip this transform.
            if (file.isNull()) {
                //this.push(file);
                return callback();
            }

            // If file is stream.
            // Emit error.
            if (file.isStream()) {
                this.emit( 'error', error('Streaming not supported') );
                return callback();
            }

            // Paths are resolved by gulp

            var fileRelativePath = path.relative( ".", file.path );
            var filename  = file.path.substr( file.path.lastIndexOf("/")+1, file.path.length );
            var extension = filename.substr( filename.lastIndexOf(".")+1, filename.length );

            // markdown は無視.
            if( extension.toLowerCase() == "md" ){
                callback();
                return;
            }

            // --------------------------------------------------------------------------

            var picked = [];
            var lines  = file.contents.toString().split(/\r?\n/);

            // ファイル名の出力設定があった場合出力する.
            if( options.writeFileName === true ){
                picked.push( [ "## " + filename ] );
            }else if( typeof options.writeFileName === "string" ){
                picked.push( [ options.writeFileName + filename ] );
            }

            if( options.verbose == true ){
                log( "Processing " + fileRelativePath );
            }

            for( var i=0,len=lines.length; i<len; i++ ){

                var r = new Line( lines[i], options.startSymbol, options.endSymbol, extension );

                // マーカーの条件とマッチした場合.
                if( r.isMatched() ){

                    var src = [], isEnd = false;

                    // 開始タグであった場合 pick を開始する.
                    if( r.isStart() ){

                        // コードハイライト用の syntax 指定がある場合は開始文字列を追記.
                        if( r.useSyntax() ) src.push("```"+ r.syntax);

                        if( r.isInline() ){

                            // inline 記述の場合は閉じタグを調べずその後に書かれたものを出力する.
                            src.push(r.inline);

                        }else{

                            // それ以外の場合. isEnd == true になるまで行を処理しつづける.
                            do{

                                if( ++i == len ){
                                    
                                    // 最終行であった場合は終了.
                                    isEnd = true;

                                }else{

                                    // 次の行を調べる.
                                    var r2 = new Line( lines[i], options.startSymbol, options.endSymbol, extension);

                                    if( r2.isStart() ){
                                        // 開始タグ内に開始タグがある場合はエラー
                                        error("Can't use startSymbol during picking.");
                                    }else if( r2.isEnd() ){
                                        // 閉じタグがある場合は終了
                                        isEnd = true;
                                    }else{
                                        // それ以外の場合はインデント等を消して出力に追加.
                                        src.push(r.replace(lines[i]));
                                    }

                                }

                            }while( !isEnd );

                        }

                        // コードハイライト用の syntax 指定がある場合は終了文字列を追記.
                        if( r.useSyntax() ) src.push("```");

                    }
                    
                    picked.push( src.join("  \n") );

                }

            }

            // pick された行が1行以上ある場合に output に追加.
            if( 1 < picked.length ){
                //if( options.verbose == true ){
                    log( "Pick from " + fileRelativePath );
                //}
                output.push( picked.join("\n\n") );
            }
            
            // 独立して処理したい場合はファイルを追加する.
            if( options.independently == true ){
                this.push(file);
            }

            callback();

        }

        function flush(callback){

            output.push("<!-- mdpick@ -->");

            var buffer;

            if( typeof options.into !== "undefined" ){

                log( "Write markdown into " + options.into );

                try{

                    var into = fs.readFileSync( path.resolve( ".", options.into ) );

                    var reg  = /<!\-+\s*@mdpick\s*\-+>(.|\n|\r)+<!\-+\s*mdpick@\s*\-+>/m;
                    var src  = into.toString();

                    if( src.match(reg) ){
                        buffer = new Buffer( src.replace(reg,output.join("\n\n")) );
                    }else{
                        buffer = new Buffer( src + "\n\n" + output.join("\n\n") );
                    }


                }catch(e){

                    buffer = new Buffer(output.join("\n\n"));

                }
                
            }else{
                
                log( "Create markdown file " + options.out );
                buffer = new Buffer(output.join("\n\n"));

            }

            // 出力ファイルを生成（新規ファイル生成にはgulp-utilのFileを利用する）
            // TODO ファイルを生成するが independently の場合はsrc をそのまま返す.
            
            if( options.independently ){

                fs.writeFile( path.resolve( ".", options.out ), buffer.toString() );

            }else{

                this.push( new gutil.File({
                    base     : path.join( __dirname, './fixtures/'),
                    cwd      : __dirname,
                    path     : path.join( __dirname, './fixtures/', options.out ),
                    contents : buffer
                }) );

            }

            callback();

        }

        return through2.obj(transform,flush);

    };

}).call(this);