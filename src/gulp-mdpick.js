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
            "out"         : "README.md",
            "into"        : undefined,
            "startSymbol" : "@md",
            "endSymbol"   : "md@",
            "verbose"     : false,
            "independent" : false
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

            if( options.verbose == true ){
                log( "Processing " + fileRelativePath );
            }

            // 行単位で読み込み処理する.

            var picked = [["## "+filename]];
            var lines  = file.contents.toString().split(/\r?\n/);

            for( var i=0,len=lines.length; i<len; i++ ){

                var r = new Line( lines[i], options.startSymbol, options.endSymbol, extension );

                // マーカーの上限とマッチした場合.
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
            if( options.independent == true ){
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
            // TODO ファイルを生成するが independent の場合はsrc をそのまま返す.
            
            if( options.independent ){
                
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