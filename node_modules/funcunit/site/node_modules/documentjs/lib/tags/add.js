
/**
 * @constructor documentjs.tags.add @add 
 * @parent documentjs.tags
 * 
 * @description 
 * 
 * Sets a [documentjs.process.docObject] as the 
 * current scope. 
 * 
 * @signature `@add NAME`
 * 
 * @param {STRING} NAME The name of [documentjs.process.docObject]
 * to set as the scope.
 * 
 * @body
 * 
 * ## Use
 * 
 * [documentjs.tags.function]
 * or [documentjs.tags.property] tags created
 * without a name, or with a "short name" will use the current
 * scope to guess their full name and parent. `@add` can set the scope,
 * allowing comments to not have to write out a full name and [documentjs.tags.parent] tag.
 * 
 * In the following example, a docObject named `lib.Component.prototype.plugin`
 * and `lib.Component.prototype.draw` will be created, each with `lib.Component.prototype`
 * as their parent.
 * 
 * @codestart javascript
 * /** @@add lib.Component.prototype *|
 * lib.extend(lib.Component.prototype,{
 *   /**
 *    * A plugin method on [lib.Component]
 *    *|
 *   plugin: function(){},
 *   /**
 *    * @property draw
 *    * A plugin method on [lib.Component]
 *    *|
 *   draw: {}
 * })
 * @codeend
 */
module.exports = {
	add: function(line, curData, scope, docMap){
		
		var name = line.match(/\s*@add\s*([^\s]+)/)[1]
		if(name){
			var docObject = docMap[name] ?
				docMap[name] :
				// add type so it can be hit by prototype and such
				docMap[name] = {name: name, type: "add"};
			
			return ["scope",docObject, docObject];
		}
	}
};
