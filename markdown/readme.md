# templates markdown

Generate Markdown-formatted document

* Usage:
  `./jsdoc test.js -t templates/markdown -q "filename=test.md&title=Test&captions=ja"`

* query
   * filename: output filename (default: "readme.md")
   * ext: file extension (default: ".md")
   * title: document title (default: "")
   * captions: captions file

かなり雑に作ってるのでもし使用する場合は注意してください


## Example:

### javascript code:

```javascript
/**
 * test test
 * @example
 * var t = new Test("abc", 123);
 * var r = t.dayo();
 * @constructor
 * @param {string} a abcdefg
 * @param {number|string} b
 */
function Test(a, b){}

/**
 * name
 * @const
 * @type {string|number}
 */
Test.prototype.NAME = 'TEST';

/** 
 * @type {string}
 * @default "a"
 */
Test.prototype.fuga = "a";

/**
 * hogehoge method
 * @example
 * var test = new Test();
 * var r = test.hoge("hoga");
 * @param {?string} [a=true] hoge hoge
 * @param {...*} var_args
 * @return {boolean}
 */
Test.prototype.hoge = function(a, var_args){};
```

### markdown document:

***********************************************

Classes:
========

Test
----

   * new Test(a, b)  
      test test

      * Parameters:

      | Name | Type          | Description |
      |------|---------------|-------------|
      | a    | string        | abcdefg     |
      | b    | number,string |             |
      

      * Examples:  

         ```
         var t = new Test("abc", 123);
         var r = t.dayo();
         ```  

   * Members:  

      * (constant) NAME : {string|number}  
         name  

      * fuga : {string}  (default:"a")  

   * Methods:  

      * hoge(a, var_args) -> {boolean}  
         hogehoge method

         * Parameters:

         | Name     | Type   | Argument             | Default | Description |
         |----------|--------|----------------------|---------|-------------|
         | a        | string | optional<br>nullable | true    | hoge hoge   |
         | var_args | *      | repeatable           |         |             |
         

         * Returns:   

            * {boolean}

         * Examples:  

            ```
            var test = new Test();
            var r = test.hoge("hoga");
            ```  

***********************************************
