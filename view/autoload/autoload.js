"format steal";
steal(function(){
	
	var typeMatch = /\s*text\/(mustache|stache|ejs)\s*/;
	function isIn(element, type) {
		while(element.parentNode) {
			element = element.parentNode;
			if(element.nodeName.toLowerCase() === type.toLowerCase()) {
				return true;
			}
		}
	}
	
	function autoload(){
		can.each(  can.$("[can-autoload]"), function( el, i){
			el.style.display = "none";
			
			var $el = can.$(el);
			
			
			var text = $el.html(),
				typeAttr = $el.attr("type"),
				typeInfo = typeAttr.match( typeMatch ),
				type = typeInfo && typeInfo[1];
			
			if (can[type]) {
				
				var scope = $el.scope();
				
				can.each(el.attributes||[], function(attr) {
					var match = /scope-(.+)/.exec(attr.name);
					if (match) {
						scope.attr(can.camelize(match[1].toLowerCase()),
								   $el.attr(attr.name));
					}
				});
				if( isIn(el,"head") ) {
					document.body.appendChild(can[type](text)(scope));
				} else if(el.nodeName.toLowerCase() === "script") {
					$el.after(can[type](text)(scope));
				} else {
					$el.replace(can[type](text)(scope));
				}
			}
		});
	}
	
	
	
	if(window.steal) {
		steal.done().then(function() {
			autoload();
		});
	} else if(window.require) {
		require(["domready"], function(domready){
			domready(autoload);
		});
	} else if(document.body){
		autoload();
	} else {
		can.bind.call(document,"DOMContentLoaded", autoload);
	}
	
});
