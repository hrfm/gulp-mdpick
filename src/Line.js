(function() {

    "use strict;"

    var _uncomment = require("./uncomment.js");

    var Line = function( line, marker, extension ){

        if( typeof marker === "undefined" ){
            marker = "md";
        }

        var uncmt  = _uncomment(extension);
        var result = line.match(
            new RegExp(
                "^(\\s*)" +                                 // Starting \s if exists
                uncmt +                                     // uncomment string
                "(\\s*)" +                                  // \s if exists
                "(@"+marker+"|"+marker+"@)(?=\\[|\\s|$)" +  // mdpick marker that is before '[' or \s or $
                "(?:\\[(\\w*)\\])?" +                       // syntax if exists.
                "\\s*(.*)"                                  // inline text.
            )
        );

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
                this.replaceReg = new RegExp("^\\s{0,"+this.indent.length+"}"+uncmt+"\\s{0,"+this.whiteSpace.length+"}");
            }

        }

    }

    /**
     * @md
     * ### isMatched
     * md@
     */
    Line.prototype.isMatched = function(){
        return ( typeof this.indent !== "undefined" );
    }

    /**
     * @md
     * ### isStart
     * md@
     */
    Line.prototype.isStart = function(){
        return this.marker && this.marker.indexOf("@") == 0;
    }

    /**
     * @md
     * ### isEnd
     * md@
     */
    Line.prototype.isEnd = function(){
        return this.marker && this.marker.lastIndexOf("@") == this.marker.length-1;
    }

    /**
     * @md
     * ### isEnd
     * md@
     */
    Line.prototype.isInline = function(){
        return this.inline && this.inline != "";
    }

    /**
     * @md
     * ### isEnd
     * md@
     */
    Line.prototype.useSyntax = function(){
        return this.syntax && this.syntax != "";
    }

    /**
     * @md
     * ### replace
     * md@
     */
    Line.prototype.replace = function( line, str ){
        if( !str ){
            str = "";
        }
        return line.replace(this.replaceReg,str);
    }
    
    return module.exports = Line;

}).call(this);