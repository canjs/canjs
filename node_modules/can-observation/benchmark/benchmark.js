"use strict";
/* jshint ignore:start */
var b = require("steal-benchmark");
var Observation = require("can-observation");
var simple = require("../test/simple");
var canBatch = require("can-event/batch/batch");

var suite = b.suite("can-observation");
window.canBatch = canBatch;
window.simple = simple;
window.Observation = Observation;
/*
suite.add("binding to 5 observables",
	function(){
		var fn = function(){};
		compute.addEventListener("change", fn);
		compute.removeEventListener("change", fn);
	},
	{
		setup: function(){
			var o1 = simple.observable("o1");
			var o2 = simple.observable("o2");
			var o3 = simple.observable("o3");
			var o4 = simple.observable("o4");
			var o5 = simple.observable("o5");

			var compute = simple.compute(function(){
				return o1.get()+o2.get()+o3.get()+o4.get()+o5.get();
			});
		},
		onStart: function(){
			//console.profile("init")
		},
		onComplete: function(){
			//console.profileEnd("init")
		},
		onError: function(error){
			//debugger;
		}
	});*/







suite.add("reading observable",
	function(){
		sideO.set(Math.random());
	},
	{
		setup: function(){
			var o1 = simple.observable("o1");
			var o2 = simple.observable("o2");
			var o3 = simple.observable("o3");
			var o4 = simple.observable("o4");
			var o5 = simple.observable("o5");

			var childCompute = simple.compute(function(){
				return o1.get()+o2.get();
			});
			var childCompute2 = simple.compute(function(){
				return o4.get()+o5.get();
			});
			childCompute.addEventListener("change", function(){});

			var compute = simple.compute(function(){
				return childCompute()+o3.get()+childCompute2();
			});

			compute.addEventListener("change", function(){});

			var sideO = simple.observable("side0");

			var sideCompute2 = simple.compute(function(){
				return sideO.get();
			});
			sideCompute2.addEventListener("change", function(){});

			var sideCompute = simple.compute(function(){
				Observation.ignore(function(){
					compute()
				})()

				return sideO.get();
			});
			sideCompute.addEventListener("change", function(){});

		},
		teardown: function(){

		},
		onStart: function(){
			//console.profile("init")
		},
		onComplete: function(){
			//console.profileEnd("init")
		},
		onError: function(error){
			setTimeout(function(){
				throw error.message;
			},1);
		}
	});
