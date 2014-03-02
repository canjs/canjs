steal("can/util","can/view/target",function( can, target) {


	can.extend(Section.prototype,{
		// Adds a subsection.
		subSectionStart: function(process){
			
			
			var subSection = new this.SubSection();
			this.last().add(this._addedSubSection(subSection, process))
			this.stack.push(subSection)
		},
		_addedSubSection: function(subSection, process){
			
		},
		subSectionEnd: function(){
			this.stack.pop()
		},
		inverse: function(){
			this.pop();
			var falseySection = new TextSubSection();
			this.last().last().falsey = falseySection;
			this.stack.push(falseySection);
		},
		add: function(chars){
			this.last().add(chars)
		},
		subSectionDepth: function(){
			return this.stack.length - 1;
		},
		last: function(){
			return this.stack[this.stack.length - 1];
		},
		compile: function(state){
			
			var renderer = this.stack[0].compile(),
				compute;
			
			return function(scope, options){
				
				var compute = can.compute(function(){
					return renderer(scope, options);
				}, this, false);
				
				compute.bind("change", emptyHandler);
				var value = compute();
				
				if( compute.hasDependencies ) {
					if(state.attr) {
						live.simpleAttribute(this, state.attr, compute);
					} else {
						live.attributes( this, compute );
					}
					compute.unbind("change", emptyHandler);
				} else {
					if(state.attr) {
						can.attr.set(this, state.attr, value);
					} else {
						live.setAttributes(this, value);
					}
				}
			};
		}
	});
	
});