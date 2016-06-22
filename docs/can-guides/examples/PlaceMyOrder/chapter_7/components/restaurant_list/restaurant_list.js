var RestaurantListViewModel = can.Map.extend({
	define: {
		states: {
			get: function() {
				return State.findAll({});
			}
		},
		state: {
			value: null,
			set: function() {
				// Remove the city when the state changes
				this.attr('city', null);
			}
		},
		cities: {
			get: function() {
				var state = this.attr('state');
				return state ? City.findAll({ state: state }) : null;
			}
		},
		city: {
			value: null
		},
		restaurants: {
			get: function(){
				var city = this.attr('city'),
					state = this.attr('state');

				return state && city ?
					Restaurant.findAll({
						'address.state': state,
						'address.city': city
					}) : null;
			}
		}
	}
});

can.Component.extend({
	tag: 'pmo-restaurant-list',
	template: can.view('components/restaurant_list/restaurant_list.stache'),
	viewModel: RestaurantListViewModel
});