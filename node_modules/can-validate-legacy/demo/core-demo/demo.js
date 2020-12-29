"use strict";
var $ = require('jquery');
var Map = require('can-map');
var validate = require('can-validate-legacy');
require('can-stache');
require('can-validate-legacy/shims/validatejs');
var template = require('./demo.stache!');

var validations = {
	myVal: {
		required: true,
		length: {
			minimum: 6,
			message: "My custom message"
		},
	},
	myNum: {
		required: true,
		numericality: {
			greaterThan: 5
		}
	}
};

$('#demo').append(template({
	myVal: 'testing testing',
	myNum: 100,
	errors: [],
	validateField: function (ctx, el) {
		var $el = $(el);
		var $parent = $el.parents('.input-group');
		var $label = $('[for='+$parent.find('input').attr('id') + ']');
		var val = $parent.data('field');

		var errors = validate.once(this[val], validations[val]);
		if (errors) {
			$parent.addClass('has-error');
			$label.find('.text-danger').text(errors[0]);
		} else {
			$parent.removeClass('has-error');
			$label.find('.text-danger').text('');
		}
	},
	updateValue: function (el, prop) {
		var val = $(el).val();
		this[prop] = val;
	}
}));
