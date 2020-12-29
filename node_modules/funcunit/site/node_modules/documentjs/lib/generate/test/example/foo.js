/**
 * @page mylib
 * @group grouping Grouping
 * @outline 2 ol
 * Hello World
 * @body
 * 
 * ## h2
 * 
 * ### h3
 * 
 * #### h4
 * 
 * ## h2-2
 * 
 * ### h3-A
 * 
 * ### h3-B
 */
//
/**
 * @page subpage
 * @parent mylib
 */
//
/**
 * @page sub-sub-page
 * @parent grouping
 */
//
/**
 * @constructor Foo
 * @parent mylib
 * @body
 * 
 *     //A Comment!
 */
function Foo(){};


/**
 * @prototype
 */
Foo.prototype = {
	/**
	 * @function Foo.prototype.bar bar
	 */
	bar: function(){
		
	}
};