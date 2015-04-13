steal("can/component", "can/util",function(Component, can){
	return Component.extend({
		tag: "href-component",
		template: $('#basics').html(),
		viewModel: {
			recipe: {
				name: 'Cool recipe'
			}
		},
		events: {
			"inserted": function(){
				console.log('href-component INSERTED');
			}
		}
	});
});
