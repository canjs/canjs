var QUnit = require("steal-qunit");

var helpers = require("./helpers");
var stache = require("can-stache");
var Component = require("can-component");

helpers.makeTests("can-component helpers", function(){

    QUnit.test("helpers reference the correct instance (#515)", function(assert) {
		assert.expect(2);
		Component({
			tag: 'my-text',
			view: stache('<p>{{valueHelper()}}</p>'),
			helpers: {
				valueHelper: function () {
					return this.get("value");
				}
			}
		});

		var renderer = stache('<my-text value:from="\'value1\'"></my-text><my-text value:from="\'value2\'"></my-text>');

		var frag = renderer({});

		assert.equal(frag.firstChild.firstChild.firstChild.nodeValue, 'value1');
		assert.equal(frag.lastChild.firstChild.firstChild.nodeValue, 'value2');
	});
});
