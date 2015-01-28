// @md hoge

// @md
// これを抜き出したい
// 改行も含めて
// この場合はコメントアウトの文字列を消したい
// md@

function(){

    // @md
    //   ほげ
    // md@

    return "hoge";
}

// @md[js]
// この場合はコメントもそのまま
function(){
    return "fuga"
}
// md@

// これはいらいない