@typedef {{}} documentjs.process.processOptions processOptions
@parent documentjs.process.types

An options object passed to several of the [documentjs.process] methods.

@parent documentjs.process.types

@option {documentjs.tags} tags 

The tag collection to be used to process the comment.

@option {String} comment 

The comment to be converted

@option {documentjs.process.docObject} scope 

A docObject that can be a parent to the current docObject.

@option {documentjs.process.docMap} docMap 

The map of all docObjects.

@option {documentjs.process.docObject} [docObject] If provided, this will 
be used as the docObject.  This is useful for adding properties to an existing object.

@option {String} [code] The code immediately preceeding the comment.
