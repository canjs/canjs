(function(){
	
	
test("basic tabs",function(){
	
	can.Component.extend({
		tag: "tabs",
		template: 	"<ul>\
			    		 {{#panels}}\
			    			<li {{#isActive}}class='active'{{/isActive}} on-click='setActive'>{{title}}</li>\
			    		 {{/panels}}\
			    	</ul>\
			    	<content></content>",
		scope: {
			panels: [],
			addPanel: function(panel){
				this.attr("panels").push(panel)
			},
			removePanel: function(){
				var panel = this.attr("panels");
				panel.splice(panel.indexOf(panel),1)
			},
			setActive: function(scope){
				this.attr("active",scope);
			},
			// this is scope, not mustache
			isActive: function( activeScope, title,options ) {
				if(this.attr('active') == title){
					return true;
				}
			}
		}
	});
	can.Component.extend({
		tag:"panel",
		scope: {
			title: "@"
		},
		events: {
			inserted: function(){
				console.log("inserted")
				this.element.parent().scope().addPanel( this.scope );
			},
			removed: function(){
				this.element.parent().scope().removePanel( this.scope );
			}
		}
	})
	
	
	
var template = can.view.mustache("<tabs>\
  {{#each foodTypes}}\
    <panel title='{{title}}'>{{content}}</panel>\
  {{/each}}\
</tabs>")
	
	var foodTypes= new can.List([
		{title: "Fruits", content: "oranges, apples"},
		{title: "Breads", content: "pasta, cereal"},
		{title: "Sweets", content: "ice cream, candy"}
	])

	can.append(can.$("#qunit-test-area"), template({
		foodTypes: foodTypes
	}) )
	
	window.foodTypes = foodTypes
})
	
})()
