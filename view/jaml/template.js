/**
 * Represents a single registered template. Templates consist of an arbitrary number
 * of trees (e.g. there may be more than a single root node), and are not compiled.
 * When a template is rendered its node structure is computed with any provided template
 * data, culminating in one or more root nodes.  The root node(s) are then joined together
 * and returned as a single output string.
 * 
 * The render process uses two dirty but necessary hacks.  First, the template function is
 * decompiled into a string (but is not modified), so that it can be eval'ed within the scope
 * of Jaml.Template.prototype. This allows the second hack, which is the use of the 'with' keyword.
 * This allows us to keep the pretty DSL-like syntax, though is not as efficient as it could be.
 */
Jaml.Template = function(tpl) {
  /**
   * @attribute tpl
   * @type Function
   * The function this template was created from
   */
  this.tpl = tpl;
  
  this.nodes = [];
};

Jaml.Template.prototype = {
  /**
   * Renders this template given the supplied data
   * @param {Object} data Optional data object
   * @return {String} The rendered HTML string
   */
  render: function(data ) {
    data = data || {};
    
    //the 'data' argument can come in two flavours - array or non-array. Normalise it
    //here so that it always looks like an array.
    if (data.constructor.toString().indexOf("Array") == -1) {
      data = [data];
    }
    
    with(this) {
      for (var i=0; i < data.length; i++) {
        eval("(" + this.tpl.toString() + ")(data[i])");
      };
    }
    
    var roots  = this.getRoots(),
        output = "";
    
    for (var i=0; i < roots.length; i++) {
      output += roots[i].render();
    };
    
    return output;
  },
  
  /**
   * Returns all top-level (root) nodes in this template tree.
   * Templates are tree structures, but there is no guarantee that there is a
   * single root node (e.g. a single DOM element that all other elements nest within)
   * @return {Array} The array of root nodes
   */
  getRoots: function() {
    var roots = [];
    
    for (var i=0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      
      if (node.parent == undefined) roots.push(node);
    };
    
    return roots;
  },
  
  tags: [
    "html", "head", "body", "script", "meta", "title", "link", "script",
    "div", "p", "span", "a", "img", "br", "hr",
    "table", "tr", "th", "td", "thead", "tbody",
    "ul", "ol", "li", 
    "dl", "dt", "dd",
    "h1", "h2", "h3", "h4", "h5", "h6", "h7",
    "form", "input", "label"
  ]
};

/**
 * Adds a function for each tag onto Template's prototype
 */
(function() {
  var tags = Jaml.Template.prototype.tags;
  
  for (var i = tags.length - 1; i >= 0; i--){
    var tagName = tags[i];
    
    /**
     * This function is created for each tag name and assigned to Template's
     * prototype below
     */
    var fn = function(tagName) {
      return function(attrs) {
        var node = new Jaml.Node(tagName);
        
        var firstArgIsAttributes =  (typeof attrs == 'object')
                                 && !(attrs instanceof Jaml.Node)
                                 && !(attrs instanceof Jaml.TextNode);

        if (firstArgIsAttributes) node.setAttributes(attrs);

        var startIndex = firstArgIsAttributes ? 1 : 0;

        for (var i=startIndex; i < arguments.length; i++) {
          var arg = arguments[i];

          if (typeof arg == "string" || arg == undefined) {
            arg = new Jaml.TextNode(arg || "");
          }
          
          if (arg instanceof Jaml.Node || arg instanceof Jaml.TextNode) {
            arg.parent = node;
          }

          node.addChild(arg);
        };
        
        this.nodes.push(node);
        
        return node;
      };
    };
    
    Jaml.Template.prototype[tagName] = fn(tagName);
  };
})();