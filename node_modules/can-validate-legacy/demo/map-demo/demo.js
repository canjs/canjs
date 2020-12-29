"use strict";
var $ = require('jquery');
var Map = require('can-map');
require('can-map-define');
require('can-validate-legacy/map/validate/');
require('can-validate-legacy/shims/validatejs');
var template = require('./demo.stache!');


var TestMap = Map.extend({
	define: {
		isRequired: {
			value: false,
			type: 'boolean'
		},
		myNum: {
			value: 'heyo',
			validate: {
				required: true,
				numericality: {
					greaterThan: 5,
					message: '^This is a custom message! Hi!'
				}
			}
		},
		myVal: {
			type: 'string',
			validate: {
				required: function () {
					return this.attr('isRequired') || false;
				},
				validateOnInit: true
			}
		}
	}
});

$('#demo').append(template({
	myMap: new TestMap({isRequired: true}),
	myFailMap: new TestMap({testString: 'hello'}),
	doValidate: function () {
		this.myMap.validate();
	}
}));
