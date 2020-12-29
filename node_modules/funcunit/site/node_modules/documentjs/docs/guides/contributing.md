@page DocumentJS.guides.contributing contributing
@parent DocumentJS.guides 5

Learn how to contribute to DocumentJS.

@body

## Developing

To develop DocumentJS, fork and clone [DocumentJS](http://github.com/bitovi/documentjs). Make sure you
have NodeJS installed.  Then:

1.  Install npm modules

        > npm install
     
2.  Run tests:

        > npm test

## Code Organization

DocumentJS's functionality and code are broken down into the following folders within `documentjs/lib`:

- find - Gets each file that should be processed.
 
- [documentjs.process] - Converts comments and files 
  into a [documentjs.process.docObject] and puts every docObject in 
  the [documentjs.process.docMap].

- [documentjs.tags tags] - Tags used by [documentjs.process] to add properties to a [documentjs.process.docObject].
 
- [documentjs.generators.html generators/html] - Generates an HTML 
  site given a [documentjs.process.docMap]. This process is futher broken down into:
  
  - [documentjs.generators.html.build generators/html/build] - Compile the templates, static resources, and mustache helpers used to generate the site.
  - [documentjs.generators.html.write generators/html/write] - Uses the compiled templates, static resources, and helpers to write out the site.

- [documentjs.generate] - Given `options`, coordinates between [documentjs.find find] and the [documentjs.generators.html html generator] to 
  produce a site.

- configure - Reads `documentjs.json` and calls out to modules in the previous folders. 

## Testing

To run all tests, run:

    > npm test
    
This runs mocha on `test.js` like:

    > mocha test.js --reporter spec
    
`test.js` require's other test files within lib.  

## Website and Documentation

DocumentJS's [gh-pages branch](https://github.com/bitovi/documentjs/tree/gh-pages) contains 
documentjs.com's code. It uses DocumentJS to produce the website. The best way to 
edit the docs is to:

1. Fork/Clone https://github.com/bitovi/documentjs/tree/gh-pages next to the version
of `documentjs` you want to be documented:

       documentjs> cd ..
       > git clone git@github.com:bitovi/documentjs -b gh-pages documentjs.com

2. Install NPM dependencies:

       > cd documentjs.com
       documentjs.com> npm install

4. Generate the entire site with:

       documentjs.com> npm run-script documentjs

5. Update the site with changes in your local `documentjs`. Change the version number `0.0.0` accordingly:

       documentjs.com> node node_modules/.bin/documentjs 0.0.0@../documentjs

5. Edit source in `documentjs`.

6. Regenerate site and check changes:

       documentjs.com> node node_modules/.bin/documentjs 0.0.0@../documentjs

7. Check in and push changes to documentjs.

8. Check in and push gh-pages branch changes.

