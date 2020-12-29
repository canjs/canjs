@typedef {function(Object,{})} documentjs.generators.html.types.builder(options,folders) builder
@parent documentjs.generators.html.build.types

A function that builds the static resources and copies the ones
needed for the html site to a distributable location.

@param {Object} options The options passed to [documentjs.generate]. 

@param {{dist: String, build: String}} folders Paths to where the 
build should take place and the final static content should be copied to.

@option {String} build The path where the default static and `options.static` 
content have been copied. 

@option {String} dist The path where the final static
content should be copied after it has been minfied and prepared.

@return {Promise} A promise that resolves when the build and copying have
been successful.

@body

## Use

A builder that simply copies all static content over:

    var Q = require('q'),
        fs = require('fs-extra'),
        copy = Q.denodify(fs.copy);
    module.exports = function(options, folders){
      return copy(folders.build, folders.dist);
    };
