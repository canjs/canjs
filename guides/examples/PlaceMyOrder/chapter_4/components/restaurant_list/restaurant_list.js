can.Component.extend({
	tag: 'pmo-restaurant-list',
	template: can.view('components/restaurant_list/restaurant_list.stache'),
	viewModel: {
		currentRestaurant: 'Hello Restaurant Customer'
	}
});