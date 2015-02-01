gulp-mdpick
============

generate markdown from files.

**Now is a beta version.**

<!--

## Getting started

You can install this module from npm.

```sh
npm install gulp-mdpick
```
-->

---

## Usage

Write markdown between symbols or inline.

### a.php
```js
// --- using inline
// @md ## this is a.php markdown

// --- using block
// @md
// - list1
// - list2
// 
// **bold text**
// @md
```

### b.scss
```scss
// --- using inline
// @md this is b.sass markdown

// --- using block
/**
 * @md
 * - listA
 * - listB
 * **bold**
 * md@
 */
/*
@md
- listα
- listβ
**bold**
md@
*/
```

### c.js
```js
// --- using inline
// @md this is c.js markdown

// --- using pre with syntax
// @md[js]
// sum a b.
function(a,b){
	return a+b;
}
// md@
```

Create README.md from these sources.

```js
var mdpick = require("gulp-mdpick");

gulp.src(["a.php","b.scss","c.js"])
    .pipe( mdpick() )
    .dest( gulp.dest("dest") )
```

You can get below.
(Also that is created by gulp-mdpick)

dest/README.md
----
<!-- @mdpick -->

## a.js

## this is a.js markdown

- list1  
- list2  
  
**bold text**

## b.js

this is b.js markdown

- listA  
- listB  
**bold**

- listα  
- listβ  
**bold**

## c.js

this is c.js markdown

```js  
// sum a b.  
function(a,b){  
	return a+b;  
}  
```

<!-- mdpick@ -->
----

## Options

```js
mdpick(options)
```

## out
Type : `string`

default `README.md`

## into
Type : `string`

If you want to add markdown into other file.  
You can set `into` options.

### into behavior

Using `into` option. gulp-mdpick find target likes

<pre>
&lt;!-- @mdpick -->
&lt;!-- mdpick@ -->
</pre>

And write markdown text between markers.

    If into file doesn't have symbols.  
    Simply adding markdown text.


#### exsample

- Sources

into.js
```
@md
// @md This is a.js markdown
md@
```

README.md
<pre>
# MEMO
This is README.md.

&lt;!-- @mdpick -->
&lt;!-- mdpick@ -->

end.
</pre>

- Execute

into.js md into README.md

```js
gulp.src("into.js")
	.pipe({
		"into" : "README.md"
	})
	.pipe( gulp.dest(".") )
```

- Result

README.md
<pre>
# MEMO
This is markdown.

&lt;!-- @mdpick -->

## into.js

This is a.js markdown

&lt;!-- mdpick@ -->

end.
</pre>


    `into` has nothing to do with output file name and directory.  
    If you want to overwrite `into` file.  
    You have to set filename with `out` option and directory with `gulp.dest`.
