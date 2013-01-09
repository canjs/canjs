(function() {
	module("can/view");

	test("multiple template types work", function(){
		var expected = '<h3>helloworld</h3>';
		can.each(["micro","ejs","jaml", "mustache"], function(ext){
			var actual = can.view.render("//can/view/test/template." + ext, {
				"message" :"helloworld"
			}, {
				helper: function(){
					return "foo"
				}
			});

			equal(can.trim(actual), expected, "Text rendered");
		})
	});

	test("helpers work", function(){
		var expected = '<h3>helloworld</h3><div>foo</div>';
		can.each(["ejs", "mustache"], function(ext){
			var actual = can.view.render("//can/view/test/helpers." + ext, {
				"message" :"helloworld"
			}, {
				helper: function(){
					return "foo"
				}
			});

			equal(can.trim(actual), expected, "Text rendered");
		})
	});

	test("buildFragment works right", function(){
		can.append( can.$("#qunit-test-area"), can.view("//can/view/test//plugin.ejs",{}) )
		ok(/something/.test( can.$("#something span")[0].firstChild.nodeValue ),"something has something");
		can.remove( can.$("#something") );
	});



	test("async templates, and caching work", function(){
		stop();
		var i = 0;

		can.view.render("//can/view/test//temp.ejs",{"message" :"helloworld"}, function(text){
			ok(/helloworld\s*/.test(text), "we got a rendered template");
			i++;
			equals(i, 2, "Ajax is not synchronous");
			start();
		});
		i++;
		equals(i, 1, "Ajax is not synchronous")
	})
	test("caching works", function(){
		// this basically does a large ajax request and makes sure
		// that the second time is always faster
		stop();
		var startT = new Date(),
			first;
		can.view.render("//can/view/test//large.ejs",{"message" :"helloworld"}, function(text){
			first = new Date();
			ok(text, "we got a rendered template");


			can.view.render("//can/view/test//large.ejs",{"message" :"helloworld"}, function(text){
				var lap2 = (new Date()) - first,
					lap1 =  first-startT;
				// ok( lap1 > lap2, "faster this time "+(lap1 - lap2) )

				start();
			})

		})
	})
	test("hookup", function(){

		can.view("//can/view/test//hookup.ejs",{})

	})

	test("inline templates other than 'tmpl' like ejs", function(){
		var script = document.createElement('script');
		script.setAttribute('type', 'test/ejs')
		script.setAttribute('id', 'test_ejs')
		script.text = '<span id="new_name"><%= name %></span>';
		document.getElementById("qunit-test-area").appendChild(script);

		var div = document.createElement('div');
		div.appendChild(can.view('test_ejs', {name: 'Henry'}))

		equal( div.getElementsByTagName("span")[0].firstChild.nodeValue , 'Henry');
	});

	//canjs issue #31
	test("render inline templates with a #", function(){
		var script = document.createElement('script');
		script.setAttribute('type', 'test/ejs')
		script.setAttribute('id', 'test_ejs')
		script.text = '<span id="new_name"><%= name %></span>';
		document.getElementById("qunit-test-area").appendChild(script);

		var div = document.createElement('div');
		div.appendChild(can.view('#test_ejs', {name: 'Henry'}));

		//make sure we aren't returning the current document as the template
		equals(div.getElementsByTagName("script").length, 0, "Current document was not used as template")
		if(div.getElementsByTagName("span").length === 1) {
			equal( div.getElementsByTagName("span")[0].firstChild.nodeValue , 'Henry');
		}
	});

	test("object of deferreds", function(){
		var foo = new can.Deferred(),
			bar = new can.Deferred();
		stop();
		can.view.render("//can/view/test//deferreds.ejs",{
			foo : typeof foo.promise == 'function' ? foo.promise() : foo,
			bar : bar
		}).then(function(result){
			equals(result, "FOO and BAR");
			start();
		});
		setTimeout(function(){
			foo.resolve("FOO");
		},100);
		bar.resolve("BAR");

	});

	test("deferred", function(){
		var foo = new can.Deferred();
		stop();
		can.view.render("//can/view/test//deferred.ejs",foo).then(function(result){
			equals(result, "FOO");
			start();
		});
		setTimeout(function(){
			foo.resolve({
				foo: "FOO"
			});
		},100);

	});

	test("hyphen in type", function(){
		var script = document.createElement('script');
		script.setAttribute('type', 'text/x-ejs')
		script.setAttribute('id', 'hyphenEjs')
		script.text = '\nHyphen\n';
		document.getElementById("qunit-test-area").appendChild(script);
		var div = document.createElement('div');
		div.appendChild(can.view('hyphenEjs', {}))

	    ok( /Hyphen/.test(div.innerHTML) , 'has hyphen');
	})

	test("create template with string", function(){
		can.view.ejs("fool", "everybody plays the <%= who %> <%= howOften %>");

		var div = document.createElement('div');
		div.appendChild(can.view('fool', {who: "fool", howOften: "sometimes"}));

		ok( /fool sometimes/.test(div.innerHTML) , 'has fool sometimes'+div.innerHTML);
	})


	test("return renderer", function() {
		var directResult = can.view.ejs('renderer_test', "This is a <%= test %>");
		var renderer = can.view('renderer_test');
		ok(can.isFunction(directResult), 'Renderer returned directly');
		ok(can.isFunction(renderer), 'Renderer is a function');
		equal(renderer({ test : 'working test' }), 'This is a working test', 'Rendered');
		renderer = can.view("//can/view/test//template.ejs");
		ok(can.isFunction(renderer), 'Renderer is a function');
		equal(renderer({ message : 'Rendered!' }), '<h3>Rendered!</h3>', 'Synchronous template loaded and rendered');
		// TODO doesn't get caught in Zepto for whatever reason
		// raises(function() {
		//      can.view('jkflsd.ejs');
		// }, 'Nonexistent template throws error');
	});

	test("nameless renderers (#162, #195)", 8, function() {
		// EJS
		var nameless = can.view.ejs('<h2><%= message %></h2>'),
			data = {
				message : 'HI!'
			},
			result = nameless(data),
			node = result.childNodes[0];

		ok('ownerDocument' in result, 'Result is a document fragment');
		equal(node.tagName.toLowerCase(), 'h2', 'Got h2 rendered');
		equal(node.innerHTML, data.message, 'Got EJS result rendered');
		equal(nameless.render(data), '<h2>HI!</h2>', '.render EJS works and returns HTML');

		// Mustache
		nameless = can.view.mustache('<h3>{{message}}</h3>');
		data = {
			message : 'MUSTACHE!'
		};
		result = nameless(data);
		node = result.childNodes[0]

		ok('ownerDocument' in result, 'Result is a document fragment');
		equal(node.tagName.toLowerCase(), 'h3', 'Got h3 rendered');
		equal(node.innerHTML, data.message, 'Got Mustache result rendered');
		equal(nameless.render(data), '<h3>MUSTACHE!</h3>', '.render Mustache works and returns HTML');
	});

	test("deferred resolves with data (#183, #209)", function(){
		var foo = new can.Deferred();
		var bar = new can.Deferred();
		var original = {
			foo : foo,
			bar : bar
		};

		stop();
		ok(can.isDeferred(original.foo), 'Original foo property is a Deferred');
		can.view("//can/view/test//deferred.ejs", original).then(function(result, data){
			ok(data, 'Data exists');
			equal(data.foo, 'FOO', 'Foo is resolved');
			equal(data.bar, 'BAR', 'Bar is resolved');
			ok(can.isDeferred(original.foo), 'Original property did not get modified');
			start();
		});
		setTimeout(function(){
			foo.resolve('FOO');
		},100);
		setTimeout(function() {
			bar.resolve('BAR');
		}, 50);
	});

	test("Empty model displays __!!__ as input values (#196)", function() {
		can.view.ejs("test196", "User id: <%= user.attr('id') || '-' %>" +
			" User name: <%= user.attr('name') || '-' %>");

		var frag = can.view('test196', {
			user: new can.Observe()
		});
		var div = document.createElement('div');
		div.appendChild(frag);
		equal(div.innerHTML, 'User id: - User name: -', 'Got expected HTML content');

		can.view('test196', {
			user : new can.Observe()
		}, function(frag) {
			div = document.createElement('div');
			div.appendChild(frag);
			equal(div.innerHTML, 'User id: - User name: -', 'Got expected HTML content in callback as well');
		});
	});

	test("Select live bound options don't contain __!!__", function() {
		var domainList = new can.Observe.List([{
		  id: 1,
		  name: 'example.com'
		}, {
		  id: 2,
		  name: 'google.com'
		}, {
		  id: 3,
		  name: 'yahoo.com'
		}, {
		  id: 4,
		  name: 'microsoft.com'
		}]),
		frag = can.view("//can/view/test/select.ejs", {
			domainList: domainList
		}),
		div = document.createElement('div');

		div.appendChild(frag);
		can.append( can.$("#qunit-test-area"), div)
		equal(div.outerHTML.match(/__!!__/g), null, 'No __!!__ contained in HTML content')

		//equal(can.$('#test-dropdown')[0].outerHTML, can.$('#test-dropdown2')[0].outerHTML, 'Live bound select and non-live bound select the same');

		
	});

	test("Resetting a live-bound <textarea> changes its value to __!!__ (#223)", function() {
		var template = can.view.ejs("<form><textarea><%= this.attr('test') %></textarea></form>"),
			frag = template(new can.Observe({
				test : 'testing'
			})),
			form, textarea;

		can.append(can.$("#qunit-test-area"), frag);

		form = document.getElementById('qunit-test-area').getElementsByTagName('form')[0];
		textarea = form.children[0];

		equal(textarea.value, 'testing', 'Textarea value set');
		textarea.value = 'blabla';
		equal(textarea.value, 'blabla', 'Textarea value updated');

		form.reset();
		equal(form.children[0].value, 'testing', 'Textarea value set back to original live-bound value');
	});
})();