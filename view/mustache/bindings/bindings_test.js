(function(){
	
	module("view/mustache/bindings",{
		setup: function(){
			document.getElementById("qunit-test-area").innerHTML = "";
		}
	});
	
	
	test("can-event handlers", function(){
		expect(4)
		var template = can.view.mustache("<div>"+
				"{{#each foodTypes}}"+
				"<p can-click='doSomething'>{{content}}</p>"+
				"{{/each}}"+
				"</div>");
		
		var foodTypes= new can.List([
			{title: "Fruits", content: "oranges, apples"},
			{title: "Breads", content: "pasta, cereal"},
			{title: "Sweets", content: "ice cream, candy"}
		])
		var doSomething = function(foodType, el , ev){
			ok(true, "doSomething called")
			equal(el[0].nodeName.toLowerCase(), "p", "this is the element");
			equal(ev.type, "click","1st argument is the event");
			equal(foodType, foodTypes[0], "2nd argument is the 1st foodType");
			
		}
		var frag = template({
			foodTypes: foodTypes,
			doSomething: doSomething
		})
		
		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		var p0 = ta.getElementsByTagName("p")[0]
		can.trigger( p0, "click" )
		
		
		// remove from the DOM and try again ..
		can.remove( can.$(ta.getElementsByTagName("div")[0]) )
		
		can.trigger( p0, "click" )
		
	});
	
	test("can-value input text", function(){
		
		var template = can.view.mustache("<input can-value='age'/>")
		
		var map = new can.Map({age: "30"})
		
		var frag = template( map )
		
		
		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		
		var input = ta.getElementsByTagName("input")[0];
		equal(input.value, "30", "input value set correctly")
		
		map.attr("age","31");
		
		equal(input.value, "31", "input value update correctly");
		
		input.value = "32";
		
		can.trigger(input,"change")
		
		equal(map.attr("age"),"32", "updated from input");
		
	})
	
	
	test("can-value input radio", function(){
		
		
		
		var template = can.view.mustache(
			"<input type='radio' can-value='color' value='red'/> Red<br/>"+
			"<input type='radio' can-value='color' value='green'/> Green<br/>")
		
		var map = new can.Map({color: "red"})
		
		var frag = template( map )
		
		
		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		
		var inputs = ta.getElementsByTagName("input");
		
		
		ok(inputs[0].checked, "first input checked");
		ok(!inputs[1].checked, "second input not checked");
		
		map.attr("color","green");
		
		ok(!inputs[0].checked, "first notinput checked");
		ok(inputs[1].checked, "second input checked");
		
		inputs[0].checked = true;
		inputs[1].checked = false;
		
		can.trigger(inputs[0],"change")
		
		equal(map.attr("color"),"red", "updated from input");
		
	})
	
	
	
})()
