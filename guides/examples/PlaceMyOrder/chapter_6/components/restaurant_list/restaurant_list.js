var RestaurantListViewModel = can.Map.extend({
	define: {
		state: {
			value: null,
			set: function() {
				// Remove the city when the state changes
				this.attr('city', null);
			}
		},
		states: {
			get: function() {
				return State.findAll({});
			}
		},
		cities: {
			get: function() {
				var state = this.attr('state');
				return state ? City.findAll({ state: state }) : null;
			}
		},
		citiesByState: {
			get: function() {
				var citiesByState = {};
				this.attr('states').forEach(function(state) {
					citiesByState[state.name] = state.cities;
				});
				return citiesByState;
			}
		},
		city: {
			value: null
		}
	}
});

can.Component.extend({
	tag: 'pmo-restaurant-list',
	template: can.view('components/restaurant_list/restaurant_list.stache'),
	viewModel: RestaurantListViewModel
});