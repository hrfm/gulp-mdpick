var g      = require('gulp');
var mdpick = require('./index.js');

g.src(["test/a.php","test/b.scss","test/c.js"])
 .pipe( mdpick({
        into : "Readme.md",
        verbose : false
    }) )
 .pipe( g.dest(".") );