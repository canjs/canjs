@property {String} can-component.prototype.tag tag
@parent can-component.define 1

Specifies the HTML tag (or node-name) the [can-component] will be created on.

@option {String} The tag name the [can-component]
will be created on. Tag names should be lower cased and
hyphenated like: `foo-bar`. Components register their
tag with [can-view-callbacks.tag can-view-callbacks.tag()].  
