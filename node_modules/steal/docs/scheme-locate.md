@property locate://
@parent StealJS.schemes

A path scheme that rewrites the path via the steal path resolution system. This syntax is only available in a file
loaded by a supported extension.

Currently this syntax is supported in the bundled CSS, LESS & Stache extensions.

Note: In LESS & Stache this syntax is available recursively, that is, it's available in stache & LESS files that are
sub-imports of those you include directly in your modules & pages. However this isn't available for CSS imports, as CSS
imports are handled by the browser without the Steal CSS plugin having a chance to rewrite any 'locate://' paths.

As an example in a LESS context, we could import bootstrap into a stylesheet from the bootstrap npm module:

/my-app/a/nested/stylesheet.less

`@import 'locate://bootstrap/less/bootstrap.less';`

it would be rewritten (assuming the default location of node_modules) to:

`@import '../../node_modules/bootstrap/less/bootstrap.less'`

@signature `locate://resourcePath`

@param {String} resourcePath Path to a resource to resolve via Steal. May be relative to the file, the baseURL, a npm module, or any stealable module.

@return {String} A path to the located resource, relative to the importing file.
