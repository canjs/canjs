steal("can/util","can/view/mustache", "can/control", function(can){
	
	can.view.Scanner.attribute("can-model", function(data, el){
		
		var attr = el.getAttribute("can-model"),
			value = data.scope.compute(attr);
		
		if(el.nodeName.toLowerCase() === "input"){
			if(el.type === "checkbox") {
				if( el.hasAttribute("can-true-value") ) {
					var trueValue = data.scope.compute( el.getAttribute("can-true-value") )
				} else {
					var trueValue = can.compute(true)
				}
				if( el.hasAttribute("can-false-value") ) {
					var falseValue = data.scope.compute( el.getAttribute("can-false-value") )
				} else {
					var falseValue = can.compute(false)
				}
			}
			
			if(el.type === "checkbox" || el.type === "radio") {
				new Checked(el,{
					value: value,
					trueValue: trueValue,
					falseValue: falseValue
				});
				return;
			}
		}
		
		new Value(el,{value: value})
	})
	
	can.view.Scanner.attribute(/can-[\w\.]+/,function(data, el){
		
		var event = data.attr.substr("can-".length),
			attr = el.getAttribute(data.attr),
			scopeData = data.scope.get(attr),
			handler = function(ev){
				
				return scopeData.value.call(scopeData.parent, $(this), ev, data.scope.attr(".") )
			};
		
		can.bind.call( el, event, handler);
		// not needed as all event handlers are removed anyway.
		
		/*can.bind.call( el, "removed",function(){
			can.unbind.call( el, event, handler);
		})*/
		
	});
	
	
	var Value = can.Control.extend({
		init: function(){
			if(this.element.prop('nodeName').toUpperCase() === "SELECT"){
				// need to wait until end of turn ...
				setTimeout($.proxy(this.set,this),1)
			} else {
				this.set()
			}
			
		},
		"{value} change": "set",
		set: function(){
			this.element.val(this.options.value())
		},
		"change": function(){
			this.options.value(this.element.val())
		}
	})
	
	var Checked = can.Control.extend({
		init: function(){
			this.check()
		},
		"{value} change": "check",
		"{trueValue} change": "check",
		"{falseValue} change": "check",
		check: function(){
			if(this.element.prop("type") == "checkbox"){
				var value =  this.options.value(),
					trueValue = this.options.trueValue() || true,
					falseValue = this.options.falseValue() || false;
					
				this.element.prop("checked", value == trueValue )
			} else {
				if(this.options.value() === this.element.val()){
					this.element.prop("checked", true)
				} else {
					this.element.prop("checked", false)
				}
			}
			
			
		},
		"change": function(){
			
			if(this.element.prop("type") == "checkbox"){
				this.options.value( this.element.is(":checked") ? this.options.trueValue() : this.options.falseValue() );
			} else {
				if(this.element.is(":checked")){
					this.options.value( this.element.val() );
				}
			}
			
		}
	});
	
})
