@typedef {{}} documentjs.process.typeData typeData
@parent documentjs.process.types

Data related to a specific type value. These objects are created 
by [documentjs.typeExpression type expressions]. 

@option {String} type The type name this dataType represents.

@option {Array<documentjs.process.valueData>} [template] An array of valueData representing each
specified type argument within `<>`.  They are specified like:

    {PRIMARY_TYPE.<TYPE,TYPE>}

@option {Array<documentjs.process.valueData>} [options] An array of valueData representing each
property name and value type in a record type.  They are specified like:

    {{PROPERTY_NAME: TYPE, PROPERTY_NAME: TYPE}}
    
The PROPERTY_NAME value sets the `name` property on the invidual [documentjs.process.valueData valueDatas].

@option {documentjs.process.valueData} [context] Represents the valueData a function expression can 
have as `this`.  It is specified like:

    {function(this:TYPE)}

@option {documentjs.process.valueData} [constructs] Represents the valueData a function expression will create when
called with the `new` keyword.  It is specified like:

    {function(new:TYPE)}

@option {Array<documentjs.process.valueData>} [params] Represents the arguments a function can
be called with.  They are specified like:

    {function(TYPE,TYPE)}

@option {documentjs.process.valueData} [constructs] Represents the return value of a function expression.  It is specified like:

    {function():TYPE}
    
@body
