@typedef {function(documentjs.process.docMap,Object,function)} documentjs.generators.html.types.makeHelpers(docMap,options,getCurrent) makeHelpers
@parent documentjs.generators.html.build.types

@param {documentjs.process.docMap} docMap Contains 
every [documentjs.process.docObject docObject] keyed by its name.

@param {Object} options The options passed to [documentjs.generate]. 

@param {function():documentjs.process.docObject} getCurrent Returns the 
current [documentjs.process.docObject docObject] being rendered.

@param {documentjs.generators.html} helpers The default helpers object that
the return value will be added to.



@return {Object<String,function>} A map of Handlebars function helpers 
that will be registered.

@body

## Use

To create a helper that loops through every function's name excluding
the current page's name:

    module.exports = function(docMap,options,getCurrent, defaultHelpers, Handlebars){
      return {
        eachFunction: function(options){
          for(var name in docMap) {
            var docObject = docMap[name];
            if(docObject.type === "function" && name !== getCurrent().name) {
              return options.fn(name);
            }
          }
        }
      };
    };
