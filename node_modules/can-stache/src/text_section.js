"use strict";
var live = require('can-view-live');

var utils = require('./utils');

var domMutate = require("can-dom-mutate/node");

var assign = require('can-assign');

var canReflect = require("can-reflect");
var Observation = require("can-observation");

var noop = function(){};

var TextSectionBuilder = function(filename){
	if (filename) {
		this.filename = filename;
	}
	this.stack = [new TextSection()];
};

assign(TextSectionBuilder.prototype,utils.mixins);

assign(TextSectionBuilder.prototype,{
	// Adds a subsection.
	startSection: function(process){
		var subSection = new TextSection();
		this.last().add({process: process, truthy: subSection});
		this.stack.push(subSection);
	},
	endSection: function(){
		this.stack.pop();
	},
	inverse: function(){
		this.stack.pop();
		var falseySection = new TextSection();
		this.last().last().falsey = falseySection;
		this.stack.push(falseySection);
	},
	compile: function(state){

		var renderer = this.stack[0].compile();
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			Object.defineProperty(renderer,"name",{
				value: "textSectionRenderer<"+state.tag+"."+state.attr+">"
			});
		}
		//!steal-remove-end

		return function(scope){
			function textSectionRender(){
				return renderer(scope);
			}
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				Object.defineProperty(textSectionRender,"name",{
					value: "textSectionRender<"+state.tag+"."+state.attr+">"
				});
			}
			//!steal-remove-end
			var observation = new Observation(textSectionRender, null, {isObservable: false});

			canReflect.onValue(observation, noop);

			var value = canReflect.getValue(observation);
			if( canReflect.valueHasDependencies( observation ) ) {
				if(state.textContentOnly) {
					live.text(this, observation);
				}
				else if(state.attr) {
					live.attr(this, state.attr, observation);
				}
				else {
					live.attrs(this, observation, scope);
				}
				canReflect.offValue(observation, noop);
			} else {
				if(state.textContentOnly) {
					this.nodeValue = value;
				}
				else if(state.attr) {
					domMutate.setAttribute.call(this, state.attr, value);
				}
				else {
					live.attrs(this, value);
				}
			}
		};
	}
});

var passTruthyFalsey = function(process, truthy, falsey){
	return function(scope){
		return process.call(this, scope, truthy, falsey);
	};
};

var TextSection = function(){
	this.values = [];
};

assign( TextSection.prototype, {
	add: function(data){
		this.values.push(data);
	},
	last: function(){
		return this.values[this.values.length - 1];
	},
	compile: function(){
		var values = this.values,
			len = values.length;

		for(var i = 0 ; i < len; i++) {
			var value = this.values[i];
			if(typeof value === "object") {
				values[i] = passTruthyFalsey( value.process,
				    value.truthy && value.truthy.compile(),
				    value.falsey && value.falsey.compile());
			}
		}

		return function(scope){
			var txt = "",
				value;
			for(var i = 0; i < len; i++){
				value = values[i];
				txt += typeof value === "string" ? value : value.call(this, scope);
			}
			return txt;
		};
	}
});

module.exports = TextSectionBuilder;
