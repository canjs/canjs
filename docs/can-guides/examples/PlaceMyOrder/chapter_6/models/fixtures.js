can.fixture('GET /api/cities', function(request, response) {
	can.ajax({
		url: 'models/' + request.data.state + '.json',
		success: function(data) {
			response(data);
		}
	});
});

can.fixture('GET /api/states', 'models/states.json');