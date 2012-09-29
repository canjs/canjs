steal('funcunit/syn',function(){
	
module("can/view/mustache, rendering",{
	setup : function(){

		this.animals = ['sloth', 'bear', 'monkey']
		if(!this.animals.each){
			this.animals.each = function(func){
				for(var i =0; i < this.length; i++){
					func(this[i])
				}
			}
		}
		
		this.squareBrackets = "<ul><% this.animals.each(function(animal){%>" +
		               "<li><%= animal %></li>" + 
			      "<%});%></ul>"
	    this.squareBracketsNoThis = "<ul><% animals.each(function(animal){%>" +
		               "<li><%= animal %></li>" + 
			      "<%});%></ul>"
	    this.angleBracketsNoThis  = "<ul><% animals.each(function(animal){%>" +
		               "<li><%= animal %></li>" + 
			      "<%});%></ul>";

	}
})

var getAttr = function(el, attrName){
		return attrName === "class"?
			el.className:
			el.getAttribute(attrName);
	}

test("easy hookup", function(){
	var div = document.createElement('div');
	div.appendChild(can.view("//can/view/mustache/easyhookup.mustache",{text: "yes"}))
	
	ok( div.getElementsByTagName('div')[0].className.indexOf("yes") != -1, "has yes" )
});

});