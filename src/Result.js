(function() {

    "use strict;"

    var Result = function( line, marker ){

        if( typeof marker === "undefined" ){
            marker = "md";
        }

        var result = line.match( new RegExp("(\\s*)(\\/*|#*|\\**)?(\\s*)(@"+marker+"|"+marker+"@)\\[?(\\w*)\\]?\\s*(.*)") );

        if( result instanceof Array ){

            this.indent       = result[1] || "";
            this.uncommentStr = result[2];
            this.whiteSpace   = result[3] || "";
            this.marker       = result[4];
            this.syntax       = result[5];
            this.inline       = result[6] || "";

            if( this.useSyntax() ){
                // syntax 指定の場合はインデント文字列を
                // @mdpick が記述されている行のインデント文字列数のみ削除する
                this.replaceReg = new RegExp("^\\s{0,"+this.indent.length+"}");
            }else{
                // それ以外の場合.
                this.replaceReg = new RegExp("^\\s*(\\/+|#+|\\**)\\s{0,"+this.whiteSpace.length+"}");
            }

        }

    }

    Result.prototype.isMatched = function(){
        return ( typeof this.indent !== "undefined" );
    }

    Result.prototype.isStart = function(){
        return this.marker && this.marker.indexOf("@") == 0;
    }

    Result.prototype.isEnd = function(){
        return this.marker && this.marker.lastIndexOf("@") == this.marker.length-1;
    }

    Result.prototype.useSyntax = function(){
        return this.syntax && this.syntax != "";
    }

    Result.prototype.hasInline = function(){
        return this.inline && this.inline != "";
    }

    Result.prototype.replace = function( line, str ){
        if( !str ){
            str = "";
        }
        return line.replace(this.replaceReg,str);
    }

    return module.exports = Result;

}).call(this);