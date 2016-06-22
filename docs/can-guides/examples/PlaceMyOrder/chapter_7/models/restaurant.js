var Restaurant = can.Model.extend({
	findAll: 'GET /api/restaurants',
	findOne: 'GET /api/restaurants/:id'
}, {
	// Include second, empty parameter object to set instanceProperties
});