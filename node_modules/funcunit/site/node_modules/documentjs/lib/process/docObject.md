@typedef {{}} documentjs.process.docObject docObject
@parent documentjs.process.types

An object that represents something that is documented. Any 
property added to a docObject is available to the templates and the
client. The following lists the important, near
universal properties:

@option {String} name The unique name of the object being documented. 
@option {String} type The type of the DocType. This typically represents
the type of the object being documented:

 - constructor
 - prototype
 - static
 - function
 - property
 - typedef
 - module

@option {String} parent The name of the parent [documentjs.process.docObject].

@option {String} description The description html content specified by [documentjs.tags.description].
This should typically be one or two sentences.

@option {String} body The body html content specified by [documentjs.tags.body].



@option {Array.<String>} children An array of children names. This typically gets
added by the system based on the `parent` property.

@option {Array<{version: String, description:String}>} deprecated An array
of deprecated warnings created by [documentjs.tags.deprecated].


@body

## Use

You can see a page's `docObject` by typing `docObject` in the console.