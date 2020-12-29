@constructor documentjs.tags.module @module
@tag documentation
@parent documentjs.tags 

Declares the export value for a module.

@signature `@module {TYPE} NAME [TITLE]`

@codestart
/**
 * @module {{}} lib/componentProps props
 * @option {String} name The name of the component.
 * @option {String} title The title of the component.
 *|
@codeend

@param {documentjs.typeExpression} [TYPE] A [documentjs.typeExpression type expression]. This
is typically an object specified like: `{{}}` or a function like `{function}`.  

@param {String} NAME The name of the type.

@param {String} TITLE The title of the type used for display purposes.

@body

## Use

Use `@module` to specify what a module exports.  Depending on what the module
exports you might use as one of the following:

#### A single function export

```
/**
 * @module {function} multi/util/add
 * @parent multi.modules
 * 
 * Adds two numbers together.
 * 
 * @signature `add(first, second)`
 * 
 * @param {Number} first The first number.
 * @param {Number} second The second number to add.
 * @return {Number} The two numbers added together.
 * 
 */
module.exports = function(first, second){
	return first+second;
};
```

#### Multiple export values

```
/**
 * @module {Module} multi/util/date-helpers
 * @parent multi.modules
 * 
 * Provides an object of date helpers.
 */
// 
/**
 * @function tomorrow
 * Provides the start time of tomorrow. 
 */
exports.tomorrow = function(){ };
/**
 * @function yesterday
 * Provides the start time of yesterday. 
 */
exports.yesterday = function(){ };
```

#### A single constructor function export

```
/**
 * @module {function(new:multi/lib/graph)} multi/lib/graph
 * @parent multi.modules
 * 
 * @signature `new Graph(graphData)`
 * @param {Object} graphData
 */
function Graph(graphData){ … }
/**
 * @prototype
 */
Graph.prototype = {
	/**
	 * @function toChart
	 */
	toChart: function(){}
};
module.exports = Graph;
```