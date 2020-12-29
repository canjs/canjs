@typedef {{}} documentjs.Tag Tag 
@parent documentjs.tags

The interface that [documentjs.tags] implement for
[documentjs.process.comment] and [documentjs.process.code] to
call. This is very likely to change to something better.



@option {function(String):Boolean} codeMatch(codeLine) Returns `true` 
if this tag should process this line of code.

[documentjs.process.code] passes the line of code after a comment block 
to each tag's `codeMatch` function.  The first tag whose `codeMatch` returns
true will have its `code` method called with the same line.


@option {function(String, documentjs.process.docObject, documentjs.process.docMap):documentjs.process.docObject} code(codeLine, scope, docMap) Returns
properties that should be set on the comment's docObject.

@option {Boolean} [codeScope=false] If `code(codeLine)` returns a DocObject,
set this object as the new scope.

@option {function(this:documentjs.process.docObject,String,Object,documentjs.process.docObject, documentjs.process.docMap,String,DocumentJS.siteConfig):} add(line, curData,scope, docMap, currentWrite, options)

`add` is called when a comment line starts with `@` followed by the tag name. This function can:

 - add directly to the docObject
 - push something onto the stack `['push', data]`
 - pop some data off the stack `['pop', String]`
 - change the default property lines are written to `['default',propName]`
 - add to docMap `['add', docObject]`. 
 - change the scope `['scope', scopeDocObject]` or the scope and the docObject being added to `['scope',scopeDocObject, docObject]`

The stack is used to handle tags that might be nested, for example 
`@codestart` and `@codeend`. It provides something to collect data
until the closing tag, and have the compiled data "popped" to the parent.




@option {function(this:documentjs.process.docObject,String,Object,documentjs.process.docObject, documentjs.process.docMap):} addMore(line, curData,scope, docMap)

`addMore` is called if `add` returns an object.

@option {function(this:documentjs.process.docObject,String,Object,documentjs.process.docObject, documentjs.process.docMap):} end(line, curData,scope, docMap)

`end` is called on a tag when the comment switches to another tag.
