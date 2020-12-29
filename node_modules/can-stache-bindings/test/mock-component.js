var stacheBindings = require('can-stache-bindings');
var CanMap = require("can-map");
var viewCallbacks = require('can-view-callbacks');
var canSymbol = require('can-symbol');

var domData = require('can-dom-data');
var domMutate = require('can-dom-mutate');
var MockComponent;
module.exports = MockComponent = {
	extend: function(proto){

		viewCallbacks.tag(proto.tag, function(el, componentTagData){
			var viewModel;
			var teardownBindings = stacheBindings.behaviors.viewModel(el, componentTagData, function(initialViewModelData) {
				if(typeof proto.viewModel === "function") {
					return viewModel = new proto.viewModel(initialViewModelData);
				} else if(proto.viewModel instanceof CanMap){
					return viewModel = proto.viewModel;
				} else {
					var VM = CanMap.extend(proto.viewModel);
					return viewModel = new VM(initialViewModelData);
				}

			}, {});
			el[canSymbol.for('can.viewModel')] = viewModel;
			el.viewModel = viewModel;
			el[canSymbol.for('can.preventDataBindings')] = true;

			if(proto.template) {
				var shadowScope = componentTagData.scope.add(viewModel);
				domData.set(el, "shadowScope", shadowScope);
				domMutate.onNodeRemoved(el, function(){
					teardownBindings();
				});

				var frag = proto.template(shadowScope, componentTagData.options);

				domMutate.appendChild.call(el, frag);
			}
		});
	}
};
