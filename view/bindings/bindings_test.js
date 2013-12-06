(function(){
	
	module("can/view/bindings",{
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
		can.trigger( p0, "click" );
		
	});
	
	test("can-value input text", function(){
		
		var template = can.view.mustache("<input can-value='age'/>")
		
		var map = new can.Map()
		
		var frag = template( map )
		
		
		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		
		var input = ta.getElementsByTagName("input")[0];
		equal(input.value, "", "input value set correctly if key does not exist in map");

		map.attr("age", "30");

		equal(input.value, "30", "input value set correctly");
		
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
	
	test("can-enter", function(){
		var template = can.view.mustache("<input can-enter='update'/>");
		
		var called = 0;
		
		var frag = template({
			update: function(){
				called++;
				ok( called, 1, "update called once" );
			}
		})
		
		var input = frag.childNodes[0];
		
		can.trigger( input, {type: "keyup", keyCode: 38})
		
		can.trigger( input, {type: "keyup", keyCode: 13})
		
	})
	
	test("two bindings on one element call back the correct method", function(){
		expect(2)
		var template = can.view.mustache("<input can-blur='first' can-click='second'/>");
		
		var callingFirst = false,
			callingSecond = false;
		
		var frag = template({
			first: function(){
				ok(callingFirst, "called first")
			},
			second: function(){
				ok(callingSecond, "called second")
			}
		});
		var input = frag.childNodes[0];
		
		callingFirst = true;
		can.trigger( input, {type: "blur"})
		
		callingFirst = false;
		callingSecond = true;
		can.trigger( input, {type: "click"})
	})
	
	test("can-value select single", function(){
		var template = can.view.mustache(
			"<select can-value='color'>"+
				"<option value='red'>Red</option>"+
				"<option value='green'>Green</option>"+
			"</select>");
		
		var map = new can.Map({color: "red"})
		
		var frag = template( map )
		
		
		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		
		var inputs = ta.getElementsByTagName("select");
		
		
		equal(inputs[0].value, 'red', "default value set");
		
		map.attr("color", "green");
		equal(inputs[0].value, 'green', "alternate value set");
				
		can.each(document.getElementsByTagName('option'), function(opt) { 
			if(opt.value==='red') {
				opt.selected = 'selected';
			}
		});

		equal(map.attr("color"), "green", "not yet updated from input");
		can.trigger(inputs[0], "change")
		equal(map.attr("color"), "red", "updated from input");

		can.each(document.getElementsByTagName('option'), function(opt) { 
			if(opt.value==='green') {
				opt.selected = 'selected';
			}
		});
		equal(map.attr("color"), "red", "not yet updated from input");
		can.trigger(inputs[0], "change")
		equal(map.attr("color"), "green", "updated from input");
	})

	test("can-value select multiple", function(){
		var template = can.view.mustache(
			"<select can-value='color' multiple>"+
				"<option value='red'>Red</option>"+
				"<option value='green'>Green</option>"+
				"<option value='ultraviolet'>Ultraviolet</option>"+
			"</select>");
		
		var map = new can.Map({color: "red"})
		
		var frag = template( map )
		
		
		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		
		var inputs = ta.getElementsByTagName("select");
		
		
		equal(inputs[0].value, 'red', "default value set");
		
		map.attr("color", "green");
		equal(inputs[0].value, 'green', "alternate value set");
				
		can.each(document.getElementsByTagName('option'), function(opt) { 
			if(opt.value==='red') {
				opt.selected = 'selected';
			}
		});

		equal(map.attr("color"), "green", "not yet updated from input");
		can.trigger(inputs[0], "change")
		equal(map.attr("color"), "red;green", "updated from input");
		
		map.removeAttr("color");
		equal(inputs[0].value, '', "attribute removed from map");

		can.each(document.getElementsByTagName('option'), function(opt) { 
			if(opt.value==='green') {
				opt.selected = 'selected';
			}
		});
		can.trigger(inputs[0], "change")
		equal(map.attr("color"), "green", "updated from input");

		map.attr("color", "red;green");
		can.each(document.getElementsByTagName('option'), function(opt) { 
			if(opt.value === 'green' || opt.value === 'red') {
				ok(opt.selected, 'option selected from map');
			} else {
				ok(!opt.selected, 'option not selected, bc not in map');
			}
		});
	})
	
})()
