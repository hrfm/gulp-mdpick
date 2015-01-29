var g      = require('gulp');
var mdpick = require('./index.js');

g.src(["**/*.*","!dest/"])
 .pipe( mdpick({
        into : "dest/Readme.md",
        verbose : false
    }) )
 .pipe( g.dest("dest") );