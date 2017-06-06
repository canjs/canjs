@page guides/contributing/documentation Documentation
@parent guides/contribute

@description Learn how to improve CanJS’s site and documentation.

@body

## Overview

The CanJS site is generated with [bit-docs](https://github.com/bit-docs/bit-docs),
a modified version of [DocumentJS](https://documentjs.com).  Its
content is hosted using GitHub pages publishing the [canjs/canjs#gh-pages](https://github.com/canjs/canjs/tree/gh-pages) repo.

`bit-docs` reads JavaScript comments and markdown files within the `canjs` repo as well as
the individual repositories within `node_modules` to produce a static site.

The high level content (Ex: homepage) and the guides content for the site is within the
`canjs/docs` folder.  Individual repositories contain their own markdown and commented
JavaScript files used to produce their API pages.

## Generate the documentation locally

To generate the CanJS site:

1. Clone [https://github.com/canjs/canjs](https://github.com/canjs/canjs)

   ```
   > git clone git@github.com:canjs/canjs
   ```

2. Install dependencies:

   ```
   > npm install
   ```

3. Run `bit-docs`:

   ```
   > ./node_modules/.bin/bit-docs -d
   ```

This should produce a static site in your `canjs` folder.  Open `canjs/index.html`
and you should see the site.  You might want to use [http-server](https://www.npmjs.com/package/http-server) to start
a simple static file server.

## Improve the theme’s design and styles

The CanJS theme is in
[bit-docs-html-canjs](https://github.com/canjs/bit-docs-html-canjs). It’s
[readme](https://github.com/canjs/bit-docs-html-canjs/blob/master/readme.md)
has instructions on how to test out the theme.  Once the theme is updated and published,

1. Open `canjs/package.json`. Update `bit-docs-html-canjs`’s version to the new theme version.
2. Run `./node_modules/.bin/bit-docs -df` to make sure the theme is correctly applied.

## Test out content from other repos

As noted above, the API docs from each package come from that package.  So if you’re
improving the docs for say `can-compute`, you want to see what `can-compute`’s docs look like,
install your local `can-compute` and re-run bit-docs like:

```
> npm install ../can-compute && ./node_modules/.bin/bit-docs -d
```


## Publish the documentation

Once the docs look right locally, commit your changes, then run:

```
> make
```

The make script will generate the documentation again and push out the `gh-pages` branch.


## Writing API documentation

Our documentation is modeled off of jQuery’s.  Please read
their [guidelines](https://github.com/jquery/api.jquery.com/blob/master/README.md). Also read our
[guides/api].

Generally speaking there are three parts to every documentation page:

 - Its description
 - Its signatures
 - The body (typically "Use" section)

### Description

The description section should be a one or two sentence explanation of what this
piece of documentation does from a _user_-centric view.  Descriptions are a quick summary
of the __why__ and the __what__. It should take on an
active voice.  For example, [can-component]’s description:

> Create a custom element that can be used to manage widgets or application logic.

Notice that it uses "Create" not "Creates".

### Signatures

Signatures are the __what__ and the __how__.  They should include all or most of the following:

 - __What the signature does__, if different from the description, especially if there are
   multiple signatures.
 - High level details on __how the code works__.
 - A simple example showing __how to use the code__.

[can-compute]’s first signature is a good example of this. First, it explains
__what that signature does__:

> Create a compute that derives its value from other observables.

Then it briefly explains __how the code works__:

> Uses can-observation to call the getterSetter and track observables.

Finally, it provides minimal sample code:

```js
var age = compute(32);

var nameAndAge = compute(function(){
    return "Matthew - " + age();
});

nameAndAge() // -> "Matthew - 32"

age(33);

nameAndAge() // -> "Matthew - 33"
```

Not all signatures need to hit all three points.  For example [can-event/batch/batch]’s
signature simply adds a bit more depth to the purpose of [can-event/batch/batch]
and then details __how the code works__.  __How to use the code__ is
left for the `body` section as importing the module is not necessary to show.



Signature titles should follow jQuery’s conventions:

 - Static methods like: `TypeAlias.method()`
 - Prototype methods like: `typeAlias.method()`
 - Spaces in between arguments: `typeAlias.method( arg1, arg2 )`
 - Brackets around optional args: `typeAlias.method( arg1 [, arg2 ], arg3 )` or
   `typeAlias.method( arg1 [, arg2 ][, arg3 ] )`

Make sure to fully document the a signature’s parameters and return
value.  There’s a lot of flexibility in documenting the [type expression](https://documentjs.com/docs/documentjs.typeExpression.html) of
a return value or parameters and the [name expression](https://documentjs.com/docs/documentjs.nameExpression.html) of
parameters.

 - Parameter and descriptions should start with a `Capital` and end with a period like:
   `@param {Type} name Indicates that something should happen.`



### body

Most body sections start with a `## Use` subsection.  This is a mini guide on
how to use that piece of code.  Modules should have long bodies that span
multiple topics.  For example [can-component]’s body has examples and
information about nearly all of its sub-functions.  However
[can-component.prototype.tag can-component.prototype.tag] doesn’t have a
use section because it’s covered in [can-component].


### structuring documentation

- Group names (like `prototype`) should be lower case.
- Types should be capitalized `{String}` except when they are describing a function [can-fixture.requestHandler].
