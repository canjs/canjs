steal.plugins("jquery/view").then(function(){
	


/**
 * @class Jaml
 * @plugin jquery/view/jaml
 * @parent jQuery.View
 * @author Ed Spencer (http://edspencer.net)
 * Jaml is a simple JavaScript library which makes 
 * HTML generation easy and pleasurable.
 * 
 * Instead of magic tags, Jaml is pure JS.  It looks like:
 * 
 * @codestart
 * function(data) {
 *   h3(data.message);
 * }
 * @codeend
 * 
 * Jaml is integrated into jQuery.View so you can use it like:
 * 
 * @codestart
 * $("#foo").html('//app/views/template.jaml',{});
 * @codeend
 * 
 * ## Use
 * 
 * For more info check out:
 * 
 *  - [http://edspencer.net/2009/11/jaml-beautiful-html-generation-for-javascript.html introduction]
 *  - [http://edspencer.github.com/jaml examples]
 * 
 */
Jaml = function() {
  return {
    templates: {},
    helpers  : {},
    
    /**
     * Registers a template by name
     * @param {String} name The name of the template
     * @param {Function} template The template function
     */
    register: function(name, template ) {
      this.templates[name] = template;
    },
    
    /**
     * Renders the given template name with an optional data object
     * @param {String} name The name of the template to render
     * @param {Object} data Optional data object
     */
    render: function(name, data ) {
      var template = this.templates[name],
          renderer = new Jaml.Template(template);
          
      return renderer.render(data);
    },
    
    /**
     * Registers a helper function
     * @param {String} name The name of the helper
     * @param {Function} helperFn The helper function
     */
    registerHelper: function(name, helperFn ) {
      this.helpers[name] = helperFn;
    }
  };
}();


$.View.register({
	suffix : "jaml",
	script: function(id, str ) {
		return "((function(){ Jaml.register("+id+", "+str+"); return function(data){return Jaml.render("+id+", data)} })())"
	},
	renderer: function(id, text ) {
		var func;
		eval("func = ("+text+")");
		Jaml.register(id, func);
		return function(data){
			return Jaml.render(id, data)
		}
	}
})


}).then('node','template')