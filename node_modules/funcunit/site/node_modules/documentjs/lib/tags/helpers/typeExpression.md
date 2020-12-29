@typedef {String} documentjs.typeExpression TYPE-EXPRESSION
@parent documentjs.tags

@option {String}

Represents 
a [Google Closure type expression](https://developers.google.com/closure/compiler/docs/js-for-compiler#types). These
produce [documentjs.process.typeData typeData].  They are used by [documentjs.tags.params], 
[documentjs.tags.return], [documentjs.tags.option] and [documentjs.tags.module] to specify the shape of
some data.



@body

The various supported types are documented [here](https://developers.google.com/closure/compiler/docs/js-for-compiler#types).

Examples:

- Type Name - `{Boolean}` `{Window}` `{goog.ui.Menu}`
- The ALL type - `{*}`
- The UNKNOWN type - `{?}`
- Type Application - `{Array.<String>}` `{Object<String, Number>}`
- Type Union - `{Number-Boolean}`
- Record Type - `{{myNum: number, myObject}}`
- Nullable type - `{?number}`
- Non-nullable type - `{!Object}`
- Variable parameters - `{...number}`
- Optional parameter - `{number=}`



- Function Type - `{function(string, boolean)}`
- Function Return Type - `{function(): number}`
- Function this Type - `{function(this:Menu, string)}`
- Function new Type - `{function(new:Menu, string)}`
- Variable parameters - `{function(string, ...[number])}`











