@typedef {function()} documentjs.generator generator
@parent DocumentJS.apis.internal

A generator module should produce a function that takes the following shape. Generator
modules are used to produce some form of documentation output.  [documentjs.generators.html]
is the default and currently only generator packaged with DocumentJS.

@param {Promise<documentjs.process.docMap>} docMapPromise A promise that will resolve
with a map of all [documentjs.process.docObject docObjects] keyed by their name.

@param {options} The options object passed to [documentjs.generate]. 
@return {Promise} A module that resolves when the output has been built.

@body

## Use

The following exports a generator function that builds a JSON output of the docObject:

    var Q = require('q'),
        fs = require('fs'),
        writeFile = Q.denodify(fs.writeFile),
        path = require('path');
        
    module.exports = function(docMapPromise, options){
       return docMapPromise.then(function(docMap){
         return writeFile(
             path.join(options.dest,'docMap.json'), 
             JSON.stringify(docMap) );
       });
    };
