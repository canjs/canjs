steal('can/view/stache/', 'can/component/', 'can/view/stache/intermediate_and_imports.js', 'can/view/import/', 'steal-qunit',
	function(stache, Component, getIntermediateAndImports) {
		if(!window.steal) {
			return;
		}

		QUnit.module("can/view/import");

		var test = QUnit.test;
		var equal = QUnit.equal;


		test("static imports are imported", function(){
			var iai = getIntermediateAndImports("<can-import from='can/view/import/test/hello'/>" +
			"<hello-world></hello-world>");

			equal(iai.imports.length, 1, "There is one import");
		});

		test("dynamic imports are not imported", function(){
			var iai = getIntermediateAndImports("{{#if a}}<can-import from='can/view/import/test/hello'>" +
			"<hello-world></hello-world></can-import>{{/if a}}");

			equal(iai.imports.length, 0, "There are no imports");
		});

		asyncTest("dynamic imports will only load when in scope", function(){
			expect(4);

			var iai = getIntermediateAndImports("{{#if a}}<can-import from='can/view/import/test/hello'>" +
			"{{#eq state 'resolved'}}<hello-world></hello-world>{{/eq}}</can-import>{{/if a}}");
			var template = stache(iai.intermediate);

			var a = can.compute(false);
			var res = template({ a: a });

			equal(res.childNodes[0].childNodes.length, 0, "There are no child nodes immediately");
			a(true);

			can["import"]("can/view/import/test/hello").then(function(){
				equal(res.childNodes[0].childNodes.length, 1, "There is now a nested component");
				equal(res.childNodes[0].childNodes[0].tagName.toUpperCase(), "HELLO-WORLD", "imported the tag");
				equal(res.childNodes[0].childNodes[0].childNodes[0].nodeValue, "Hello world!", "text inserted");
				start();
			});
		});



		test("if a can-tag is present, handed over rendering to that tag", function(){
			var iai = getIntermediateAndImports("<can-import from='can/view/import/test/hello' can-tag='loading'/>");
			can.view.tag("loading", function(el){
				var template = stache("it worked");
				can.appendChild(el, template());
			});
			var template = stache(iai.intermediate);

			var res = template();
			equal(res.childNodes[0].childNodes[0].nodeValue, "it worked", "Rendered with the can-tag");
		});



		asyncTest("can use an import's value", function(){
			var template = "<can-import from='can/view/import/test/person' {^value}='*person' />hello {{*person.name}}";

			var iai = getIntermediateAndImports(template);

			var renderer = stache(iai.intermediate);
			var res = renderer(new can.Map());

			can["import"]("can/view/import/test/person").then(function(){
				equal(res.childNodes[2].nodeValue, "world", "Got the person.name from the import");
				start();
			});
		});

		asyncTest("can import a template and use it", function(){
			var template = "<can-import from='can/view/import/test/other.stache!' {^@value}='*other' />{{{*other()}}}";

			can.stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				can["import"]("can/view/import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});
		});

		asyncTest("can import a template and use it using the > syntax", function(){
			var template = "<can-import from='can/view/import/test/other.stache!' {^@value}='*other' />{{> *other}}";

			can.stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				can["import"]("can/view/import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});
		});

		asyncTest("importing a template works with can-tag", function(){
			Component.extend({
				tag: "my-waiter",
				template: can.stache("{{#isResolved}}" +
				"<content></content>" +
				"{{else}}" +
				"<div class='loading'></div>" +
				"{{/isResolved}}")
			});

			var template = "<can-import from='can/view/import/test/other.stache!' {^@value}='*other' can-tag='my-waiter'>{{{*other()}}}</can-import>";

			can.stache.async(template).then(function(renderer){
				var frag = renderer(new can.Map());

				can["import"]("can/view/import/test/other.stache!").then(function(){
					ok(frag.childNodes[0].childNodes.length > 1, "Something besides a text node is inserted");
					equal(frag.childNodes[0].childNodes[2].firstChild.nodeValue, "hi there", "Partial worked with can-tag");

					QUnit.start();
				});
			});
		});

		asyncTest("can dynamically import a template and use it", function(){
			var template = "<can-import from='can/view/import/test/other-dynamic.stache!' {^@value}='*other'/>{{> *other}}";

			can.stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				can["import"]("can/view/import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});

		});

	});
