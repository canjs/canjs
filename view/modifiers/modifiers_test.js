steal("can/map", "can/view/ejs", "can/view/modifiers", "can/test", function () {
	// this only applied to jQuery libs
	if (!window.jQuery) {
		return;
	}
	module('can/view/modifiers');
	
	test('modifier with a deferred', function () {
	
		$('#qunit-test-area')
			.html('');
			
		stop();
		var foo = can.Deferred();
		
		$('#qunit-test-area')
			.html(can.test.path('view/test/deferred.ejs'), foo);
	
		var templateLoaded = new can.Deferred(),
			id = can.view.toId( can.test.path('view/test/deferred.ejs') );
			
		setTimeout(function () {
			foo.resolve({
				foo: 'FOO'
			});
		}, 1);
			
		// keep polling cache until the view is loaded
		var check = function(){
			if(can.view.cached[id]) {
				templateLoaded.resolve();
			} else {
				setTimeout(check, 10);
			}
		};
		setTimeout(check, 10);

		can.when(foo, templateLoaded).then(function(foo){
			setTimeout(function(){
				equal($('#qunit-test-area')
					.html(), 'FOO', 'worked!');
				start();
				ONMODIFIER = false;
			},10);
			
		});
		
	});
	
	/*test("non-HTML content in hookups", function(){
	 $("#qunit-test-area").html("<textarea></textarea>");
	 can.render.hookup(function(){});
	 $("#qunit-test-area textarea").val("asdf");
	 equal($("#qunit-test-area textarea").val(), "asdf");
	 });*/
	test('html takes promise', function () {
		var d = new can.Deferred();
		can.$('#qunit-test-area')
			.html(d);
		stop();
		d.done(function () {
			equal(can.$('#qunit-test-area')
				.html(), 'Hello World', 'deferred is working');
			start();
		});
		setTimeout(function () {
			d.resolve('Hello World');
		}, 10);
	});
	test('val set with a template within a hookup within another template', function () {
		var frag = can.view(can.test.path('view/test/hookupvalcall.ejs'), {});
		var div = document.createElement('div');
		div.appendChild(frag);
		equal(div.getElementsByTagName('div')[0].getElementsByTagName('h3')[0].innerHTML, 'in div', 'Rendered withing other template');
	});
	test('jQuery.fn.hookup', function () {
		can.$('#qunit-test-area')
			.html('');
		var els = $(can.view.render(can.test.path('view/test/hookup.ejs'), {}))
			.hookup();
		can.$('#qunit-test-area')
			.html(els);
		//makes sure no error happens
		equal(can.$('#qunit-test-area')[0].getElementsByTagName('div')[0].id, 'dummy', 'Element hooked up');
	});
	test('hookups don\'t break script execution (issue #130)', function () {
		// this simulates a pending hookup (hasn't been run yet)
		can.view.hook(function () {});
		// this simulates HTML with script tags being loaded (probably legacy code)
		can.$('#qunit-test-area')
			.html('<script>can.$(\'#qunit-test-area\').html(\'OK\')</script>');
		equal(can.$('#qunit-test-area')
			.html(), 'OK');
		can.$('#qunit-test-area')
			.html('');
			
		// clear hookups we check that;
		can.view.hookups = {};
	});
});
