var g      = require('gulp');
var concat = require('gulp-concat')
var mdpick = require('./index.js');

g.src(["test/a.php","test/b.scss","test/c.js"])
 .pipe( mdpick({
        "base"          : "Readme.md",
        "verbose"       : false,
        "independently" : true
    }) )
 .pipe( concat("test.txt") )
 .pipe( g.dest(".") );