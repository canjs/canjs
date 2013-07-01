@typedef {{fn:function,inverse:function,hash:Object}} can.Mustache.helperOptions helperOptions
@parent can.Mustache.types 

@description The options argument pass to a [can.Mustache.helper helper function].

@option {function(*)} [fn(context)] Provided if a 
[can.Mustache.helpers.sectionHelper section helper] is called.  Call `fn` to
render the BLOCK with the specified `context`.


@option {function(*)} [inverse(context)] Provided if a 
[can.Mustache.helpers.sectionHelper section helper] is called 
with [can.Mustache.helpers.else {{else}}].  Call `inverse` to
render the INVERSE with the specified `context`.

@option {Object.<String,*|String|Number>} hash
