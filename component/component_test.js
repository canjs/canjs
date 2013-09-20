(function(){
	
	
test("basic select",function(){
	
var template = "<canui-select can-data='Items' can-value='thing.itemId'>\
	<option value='{{id}}'>{{title}}</option>\
</canui-select>"
	
	
	can.component("canui-select",{
		init: function(){
			var Model = this.scope(this.element.attr('can-data'));
			
			this.prop('items', new this.prop('data').List({}))
		},
		template: "{{#items}}{{>userTemplate}}{{/items}}"
	});
	
	
	
})
	
})()
