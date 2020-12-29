@typedef {function(Object,Object.<String, function>):documentFragment} can-stache.view(data, helpers) view
@parent can-stache.types

@description A function returned by [can-stache] that renders a
template into an html documentFragment.

@signature `view(data, [helpers])`

  A "view" function is a function returned by templates that can be used
  to render data into a documentFragment.

  @param {Object} data An object of data used to render the template.

  @param {Object.<String, function>} [helpers] Local helper functions used by the template.

  @return {documentFragment} A documentFragment that contains the HTML rendered by the template.

@body
