var g      = require('gulp');
var mdpick = require('./index.js');

g.src("**/*.js")
 .pipe( mdpick({
        into : "dest/Readme.md",
        verbose : true
    }) )
 .pipe( g.dest("dest") );