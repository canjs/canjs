@description Simulate creating a Model with a fixture.
@function can.fixture.types.Store.create
@parent can.fixture.types.Store
@signature `store.create(request, callback)`
@param {Object} request Parameters for the request.
@param {Function} callback A function to call with the created item.

@body
`store.create(request, callback)` simulates a request to add an item to the store.


    todosStore.create({
        url: "/todos"
    }, function(){ });

