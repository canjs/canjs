can.fixture('GET /api/cities', function(request, response) {
	can.ajax({
		url: 'models/' + request.data.state + '.json',
		success: function(data) {
			response(data);
		}
	});
});

can.fixture({
	'POST /api/orders': function(request, response){
		var data = request.data;

		response(can.extend({}, data, {
			"_id":"556f1503fdf0425207000001"
		}));
	},

	'GET /api/orders': 'models/orders.json'
});

can.fixture('GET /api/restaurants', 'models/restaurants.json');
can.fixture('GET /api/restaurants/{_id}', 'models/spago.json');

can.fixture('GET /api/states', 'models/states.json');