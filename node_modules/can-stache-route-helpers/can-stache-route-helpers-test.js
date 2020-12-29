var QUnit = require('steal-qunit');
var stache = require('can-stache');
var route = require('can-route');
var mockRoute = require("can-route/test/mock-route-binding");
var CanMap = require("can-map");
var helpers = require("./can-stache-route-helpers");

QUnit.module("can-stache-route-helpers");

QUnit.test("exports helper object", function(assert) {
	assert.equal(typeof helpers.routeUrl, "function", "routeUrl exists");
	assert.equal(typeof helpers.routeCurrent, "function", "routeCurrent exists");
});

QUnit.test("routeUrl and routeCurrent", function(assert) {
	var done = assert.async();
	mockRoute.start();
	var routeData = new CanMap({});
	route.data = routeData;
	route.start();

	var template = stache("<a href=\"{{routeUrl(page='recipe' id=recipe.id)}}\">{{recipe.name}}</a>");

	var frag = template({
		recipe: new CanMap({id: 5, name: 'Cool recipe'})
	});

	assert.equal( frag.firstChild.getAttribute("href"), "#!&page=recipe&id=5", "href set");

	template = stache("<a href=\"{{routeUrl(page='recipe' id=recipe.id}}\">{{recipe.name}}</a>");

	frag = template({
		recipe: new CanMap({id: 5, name: 'Cool recipe'})
	});

	assert.equal( frag.firstChild.getAttribute("href"), "#!&page=recipe&id=5", "href set");

	template = stache("{{#routeCurrent(undefined)}}yes{{else}}no{{/routeCurrent}}");

	frag = template({});
	assert.equal(frag.childNodes[1].nodeValue, "yes", "route is current");

	template = stache("{{#routeCurrent()}}yes{{else}}no{{/routeCurrent}}");

	frag = template({});
	assert.equal(frag.childNodes[1].nodeValue, "yes", "route is current");

	route.attr({"foo":"bar", page: 'recipes'});

	setTimeout(function(){

		template = stache("{{#routeCurrent()}}yes{{else}}no{{/routeCurrent}}");

		frag = template({});
		assert.equal(frag.childNodes[1].nodeValue, "no", "route is not current");

		template = stache("{{#routeCurrent(foo='bar', true)}}yes{{else}}no{{/routeCurrent}}");
		frag = template({});
		assert.equal(frag.childNodes[1].nodeValue, "yes", "route is somewhat current");

		template = stache("{{#routeCurrent(foo='bar', true)}}yes{{else}}no{{/routeCurrent}}");
		frag = template({});
		assert.equal(frag.childNodes[1].nodeValue, "yes", "route is somewhat current");

		template = stache("<a href=\"{{routeUrl(page='recipes' id=6, true)}}\"></a>");
		frag = template({});

		assert.equal( frag.firstChild.getAttribute("href"), "#!&foo=bar&page=recipes&id=6", "merge works helper");

		template = stache("<a href=\"{{routeUrl(page='recipe' id=5,true)}}\"></a>");
		frag = template({});

		assert.equal( frag.firstChild.getAttribute("href"), "#!&foo=bar&page=recipe&id=5", "merge works call expression");

		mockRoute.stop();
		done();
	},100);

});
