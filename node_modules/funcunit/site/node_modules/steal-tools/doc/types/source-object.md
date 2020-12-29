@typedef {Object} steal-tools.source.object SourceObject
@parent steal-tools.types

An object representing a source. This object is used internally and returned by [steal-tools.transform].

@option {String} code A string containing the source code.

@option {SourceMapConsumer} map A source map generated for the source code. To get the JSON representation of the source map call `.toString()` on the map.
