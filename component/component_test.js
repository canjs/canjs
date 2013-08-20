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
			removePanel: function(panel){
				var panels = this.attr("panels");
				panels.splice(panels.indexOf(panel),1)
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

	var testArea = can.$("#qunit-test-area")[0],
		lis = testArea.getElementsByTagName("li");
	equal( lis.length, 3, "three lis added");
	
	foodTypes.each(function(type, i){
		equal(lis[i].innerHTML, type.attr("title"),"li "+i+" has the right content")
	})
	
	foodTypes.push({
		title: "Vegies",
		content: "carrots, kale"
	});
	
	lis = testArea.getElementsByTagName("li");
	equal( lis.length, 4, "li added");
	
	foodTypes.each(function(type, i){
		equal(lis[i].innerHTML, type.attr("title"),"li "+i+" has the right content")
	})
	
	equal( testArea.getElementsByTagName("panel").length, 4, "panel added");
	
	foodTypes.shift();
	
	equal( lis.length, 3, "removed li");
	
	foodTypes.each(function(type, i){
		equal(lis[i].innerHTML, type.attr("title"),"li "+i+" has the right content")
	})
	
})
	
})()
