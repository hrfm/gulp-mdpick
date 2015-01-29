// @md hoge

/**
 * @md
 * これを抜き出したい
 *   改行も含めて
 * この場合はコメントアウトの文字列を消したい
 * md@
 */

 /** @md
  * * test
  * md@
  */

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

/*
@md
複数コメントアウトのテスト
  a = b + c;
テステス
md@
*/

		/*
		 @md
		 複数コメントアウトかつインデントのテスト
		   a = b + c;
		 テステス
		 md@
		*/

// これはいらいない