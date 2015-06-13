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
			value: [
				{
					cities: ['Green Bay', 'Milwaukee'],
					name: 'Wisconsin'
				},
				{
					cities: ['Detroit', 'Ann Arbor'],
					name: 'Michigan'
				},
				{
					cities: ['Chicago', 'Peoria'],
					name: 'Illinois'
				}
			]
		},
		cities: {
			get: function() {
				var state = this.attr('state');
				return state && this.attr('citiesByState')[state];
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