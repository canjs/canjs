steal('can/observe/compute', 
      'can/view', 
      'can/view/scanner.js')
.then('can/view/render.js')
.then(function(){

/**
 * These are the tokens for the scanner.
 */
can.view.tokens = {
    tLeft: "{{$", // Template  ---- Not supported
    tRight: "$}}", // Right Template  ---- Not supported
    rLeft: "{{{", // Return
    rRight: "}}}",
    reLeft: "{{", // Return Escaped
    cmntLeft: "{{#", // Comment ---- Not supported
    left: "{{%", // Run --- this is hack for now
    right: "}}" // Right -> All have same FOR EJS ...
};

can.view.ext = ".mustache";

can.Mustache = Mustache = function( options ) {
  // Supports calling EJS without the constructor
  // This returns a function that renders the template.
  if ( this.constructor != Mustache ) {
    var mustache = new Mustache(options);

    return function( data, helpers ) {
      return mustache.render(data, helpers);
    };
  }

  // If we get a `function` directly, it probably is coming from
  // a `steal`-packaged view.
  if ( typeof options == "function" ) {
    this.template = {
      fn: options
    };
    return;
  }

  // Set options on self.
  can.extend(this, options);
  this.template = can.view.scan(this.text, this.name);
};

/** 
 * @Prototype
 */
Mustache.prototype.
/**
 * Renders an object with view helpers attached to the view.
 * 
 *     new EJS({text: "<%= message %>"}).render({
 *       message: "foo"
 *     },{helper: function(){ ... }})
 *     
 * @param {Object} object data to be rendered
 * @param {Object} [extraHelpers] an object with view helpers
 * @return {String} returns the result of the string
 */
render = function( object, extraHelpers ) {
  object = object || {};
  return this.template.fn.call(object, object, new Mustache.Helpers(object, extraHelpers || {}));
};

Mustache.Helpers = function( data, extras ) {
    this._data = data;
    this._extras = extras;
    can.extend(this, extras);
};

/**
 * Register the view.
 */
can.view.register({
  suffix: "mustache",

  contentType: "x-mustache-template",

  // returns a `function` that renders the view.
  script: function( id, src ) {
    return "can.Mustache(function(_CONTEXT,_VIEW) { " + new Mustache({
      text: src,
      name: id
    }).template.out + " })";
  },

  renderer: function( id, text ) {
    return Mustache({
      text: text,
      name: id
    });
  }
});

});