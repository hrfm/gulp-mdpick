gulp-mdpick
============

まだ力技でテスト不十分なので
とりあえず日本語でメモがてら。

安定したら npm に公開予定

<!--

## Getting started

You can install this module from npm.

```sh
npm install gulp-mdpick
```
-->

---

## Usage

### `@md` - `md@` 指定で抜き出す

src で指定したファイルから

```
@md

md@
```

でかこった範囲が、Markdown ファイルに出力されます

例えば

a.js
```js
// @md
// a.js のファイルだよ
// @md

// ....

// @md
// いろいろ説明を
// ここに書いておくよ
// @md

```

b.js
```js
// @md
// b.js のファイルだよ
// @md

// ....

```

と書いておき

```js

var mdpick = require("gulp-mdpick");
gulp.src(["a.js","b.js"])
    .pipe( mdpick() )
    .dest( gulp.dest("dest") )
```

と実行すれば

dest/README.md
```
<!-- @mdpick -->

## a.js

a.jsのファイルだよ

いろいろ説明を  
ここに書いておくよ

## b.js

b.jsのファイルだよ

<!-- mdpick@ -->
```

的なファイルが吐き出されます

### インラインで書く

```
@md hoge
```

これはそのまま hoge と出力されます。

この場合はこの行のみ観に行くので

```
// @md hoge
// fuga
// md@
```

と書いた場合 fuga は出力されません.

### コードシンタックス使いたい場合

a.js
```js
// @md
// function の説明。
// md@
// @md[js]
function(){
	return "a";
}
// @md
```

b.js
```js
// @md
// function の説明。
// md@
// @md[js]
function(){
	return "a";
}
// @md
```

的に書いておけば

dest/README.md

<pre>
&lt;!-- @mdpick -->

## a.js

function の説明。

```js
function(){
	return "a"
}
```

## b.js

function の説明。

```js
function(){
	return "b"
}
```

&lt;!-- mdpick@ -->
</pre>

的なのが出力されます。

### いい感じに pick したい

まだ不完全ですが
一応こういう動きをします。

```js
// @md
// コメント
//
//   hogehoge
//
// ---
// md@
```

と書いてあったら `@md` の位置まで削って

```
コメント

  hogehoge

---
```

と出力するように頑張ってます。

## Options

## out

out を指定すると出力ファイル名を指定できます

```js
mdpick({out:"hoge.md"})
```

的な

## into

into は指定した md ファイルに出力内容を追記できます

もともとのファイルが

README.md
```
# MEMO
もともとあったファイルだよ
```

だった場合

README.md
```
# MEMO
もともとあったファイルだよ

<!-- @mdpick -->

## a.js

a.jsのファイルだよ

## b.js

b.jsのファイルだよ

<!-- mdpick@ -->

```

的な感じに出力されます
出力場所を指定しておきたい場合は

```
<!-- @mdpick -->
<!-- mdpick@ -->
```

を書いておけばこの中が書き換わります。

ですので

README.md
```
# MEMO
もともとあったファイルだよ

<!-- @mdpick -->
<!-- mdpick@ -->

まだ話は続くよ
```

というファイルだった場合は

README.md
```
# MEMO
もともとあったファイルだよ

<!-- @mdpick -->

## a.js

a.jsのファイルだよ

## b.js

b.jsのファイルだよ

<!-- mdpick@ -->

まだ話は続くよ
```

というファイルが出力されます。
