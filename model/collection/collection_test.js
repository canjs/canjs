(function() {

var ImageModel = can.Model({
	findAll : '/collection/api/images'
}, {});

var store = can.fixture.store(100, function(i){
	return {
		id : i + 1,
		title : "Image " + i,
		url: 'image/url/' + i
	}
}, function(image, req){
	var filter = req.data && req.data.filter;
	if(filter){
		return image.id % filter === 0;
	}
	return true;
});

can.fixture({
	'/collection/api/images' : store.findAll
})

module("can/model/collection", {
	setup: function() {
	}
})


test('Collection loading', 2, function(){
	stop();
	var collection = new ImageModel.Collection(),
		def        = collection.load();

	equal(collection.isLoading(), true, 'isLoading is set');

	def.done(function(){
		start();
		equal(collection.list.attr('length'), 100, 'First load is 100');
	});
});

test('Collection auto loading on params change', 3, function(){
	var delay = can.fixture.delay,
		collection, req;

	can.fixture.delay = 200;
	stop();

	collection = new ImageModel.Collection({
		limit : 50,
		order : null
	},{
		debounce : 100
	});

	req = collection.load();

	req.fail(function(){
		start();
		ok(true, 'First request was canceled')
		stop();
	})

	collection.params.attr({limit : 50})
	collection.params.attr({order : ['title ASC']});

	setTimeout(function(){
		collection.params.attr({foo : 'bar'});
		collection.params.attr({limit : 25});
	}, 150);

	collection.list.bind('change', function(){
		start();
		deepEqual(collection.params.serialize(), {
			limit : 25,
			order : ['title ASC'],
			foo   : 'bar'
		}, 'Params are correct');
		equal(collection.list.attr('length'), 25, 'Correct ammount of data is loaded');
		can.fixture.delay = delay;
	});
});

test('Params diffs are calculated correctly', 2, function(){
	stop();
	var collection = new ImageModel.Collection({
		limit : 50,
		order : ['title ASC']
	}, {
		debounce : 100
	});

	collection.params.attr({foo : 'bar'});
	collection.params.attr({foo : 'baz'});

	collection.params.attr({limit : 100});

	collection.params.removeAttr('order');

	collection.loaded = function(data, changedParamAttrs, paramChanges){
		start();
		deepEqual(changedParamAttrs, ['foo', 'limit', 'order'], 'Correct params were changed');
		deepEqual(paramChanges, {
			foo : {
				how : 'add',
				oldVal : undefined,
				newVal : 'baz'
			},
			limit : {
				how : 'set',
				oldVal : 50,
				newVal : 100
			},
			order : {
				how : 'remove',
				newVal : undefined,
				oldVal : ['title ASC']
			}
		}, 'Diff is calculated correctly');
	}
})

test('Params diffs are calculated correctly even after first request is aborted', 3, function(){
	stop();
	var collection = new ImageModel.Collection({
			limit : 50,
			order : ['title ASC']
		}),
		delay = can.fixture.delay,
		req;

	can.fixture.delay = 200;

	collection.params.attr({foo : 'bar'});

	req = collection.load();

	req.fail(function(){
		ok(true, 'First request was canceled')
	})
	
	setTimeout(function(){
		collection.params.attr({foo : 'baz'});

		collection.params.attr({limit : 100});

		collection.params.removeAttr('order');
	})

	collection.loaded = function(data, changedParamAttrs, paramChanges){
		start();
		deepEqual(changedParamAttrs, ['foo', 'limit', 'order'], 'Correct params were changed');
		deepEqual(paramChanges, {
			foo : {
				how : 'add',
				oldVal : undefined,
				newVal : 'baz'
			},
			limit : {
				how : 'set',
				oldVal : 50,
				newVal : 100
			},
			order : {
				how : 'remove',
				newVal : undefined,
				oldVal : ['title ASC']
			}
		}, 'Diff is calculated correctly');
	}
})

test('Count is set correctly', 1, function(){
	var collection = new ImageModel.Collection({filter: 3}, {autoLoad : false}),
		req;

	stop();

	req = collection.load();
	req.done(function(){
		start();
		equal(collection.count(), 33, 'Correct count')
	})
})


})();