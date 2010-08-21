steal.plugins('jquery/view').then(function(){
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

  var cache = {};
  
  function MicroTemplate(str, data){
	var body =  
		"var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str.replace(/[\r\t\n]/g, " ")
   .replace(/'(?=[^%]*%})/g,"\t")
   .split("'").join("\\'")
   .split("\t").join("'")
   .replace(/{%=(.+?)%}/g, "',$1,'")
   .split("{%").join("');")
   .split("%}").join("p.push('")+ "');}return p.join('');"
	
    var fn =  new Function("obj",body);
	fn.body = body;
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };

	$.View.register({
		suffix : "micro",
		renderer: function( id, text ) {
			var mt = MicroTemplate(text)
			return function(data){
				return mt(data)
			}
		},
		get: function( id, url ) {
			var text = $.ajax({
					async: false,
					url: url,
					dataType: "text",
					error: function() {
						throw "micro.js ERROR: There is no template or an empty template at "+url;
					}
				}).responseText
			return this.renderer(id, text);
			
		},
		script: function( id, str ) {
			return "function(obj){"+MicroTemplate(str).body+"}";
		}
	})
	jQuery.View.ext = ".micro"
	

});