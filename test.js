var g      = require('gulp');
var mdpick = require('./index.js');

g.src("test/exsample.js")
 .pipe( mdpick({
        into : "dest/Readme.md"
    }) )
 .pipe( g.dest("dest") );