steal("can/model/promise","can/compute", "can/util/fixture", "can/test", function () {

	module("can/list/promise");

	test("Model.get returns a compute that behaves like deferred", function(){
		can.fixture('GET /users/{id}', function(request, response){
			if(request.data.id === 1){
				return {
					id: 1,
					name : 'retro'
				}
			} else {
				response(404, "error", {message:"resource does not exist"});
			}
			
		});

		var User = can.Model.extend({
				findOne : "/users/{id}"
			}, {}),
			user = User.get({id: 1}),
			missingUser = User.get({id: 'foo'});

		stop();
		ok(!user.isResolved(), "User is not resolved");
		ok(!user.isResolved(), "User is not rejected");
		ok(user.isPending(), "User is pending");

		user.then(function(data){
			ok(user.isResolved() && user().isResolved(), 'User is resolved')
			equal(data.attr('id'), 1, "User is resolved with the correct data");
		});

		missingUser.fail(function(){
			ok(missingUser.isRejected() && missingUser().isRejected(), 'Missing user is rejected');
			equal(missingUser().reason().responseJSON.message, 'resource does not exist', 'Missing user is rejected with the correct error');
			start();
		});
	});

	test("Model is aware of it's internal deferred state", function(){
		can.fixture("POST /users", function(req){
			return can.extend({id: 1, isSaved : true}, req.data);
		})

		can.fixture("DELETE /users/{id}", function(req, response){
			response(406, "error", {message:"resource can't be destroyed"});
		})

		var User = can.Model.extend({
				create : "POST /users",
				destroy : "DELETE /users/{id}"
			}, {}),
			user = new User,
			def;

		stop();

		ok(user.isResolved(), 'User is in resolved state by default');


		def = user.save();

		ok(user.isPending(), 'Saving user is putting it in the pending state');

		def.then(function(){
			ok(user.isResolved(), 'After saving user is in resolved state');
			def = user.destroy();
			def.fail(function(){
				ok(user.isRejected(), 'Destroying an user is rejected');
				equal(user.reason().responseJSON.message,  "resource can't be destroyed", 'Rejecting returns correct reason');
				def = user.save();
				ok(!user.reason(),  'Saving model clears the reason');
				def.abort();
				start();
			})
		})

	})
});
