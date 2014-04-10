@description Make a store of objects to use when making requests against fixtures.
@function can.fixture.store store
@parent can.fixture

@signature `can.fixture.store(count, make[, filter])`

@param {Number} count The number of items to create.

@param {Function} make A function that will return the JavaScript object. The
make function is called back with the id and the current array of items.

@param {Function} [filter] A function used to further filter results. Used for to simulate
server params like searchText or startDate.
The function should return true if the item passes the filter,
false otherwise. For example:


    function(item, settings){
        if(settings.data.searchText){
            var regex = new RegExp("^"+settings.data.searchText)
            return regex.test(item.name);
        }
    }

@return {can.fixture.Store} A generator object providing fixture functions for *findAll*, *findOne*, *create*, *update* and *destroy*.

@body
`can.fixture.store(count, generator(index,items))` is used
to create a store of items that can simulate a full CRUD service. Furthermore,
the store can do filtering, grouping, sorting, and paging.

## Basic Example

The following creates a store for 100 todos:

    var todoStore = can.fixture.store(100, function(i){
        return {
            id: i,
            name: "todo number "+i,
            description: "a description of some todo",
            ownerId: can.fixture.rand(10)
        }
    })

`todoStore`'s methods:

- [can.fixture.types.Store.findAll findAll],
- [can.fixture.types.Store.findOne findOne],
- [can.fixture.types.Store.create create],
- [can.fixture.types.Store.update update], and
- [can.fixture.types.Store.destroy destroy]

Can be used to simulate a REST service like:

    can.fixture({
        'GET /todos':         todoStore.findAll,
        'GET /todos/{id}':    todoStore.findOne,
        'POST /todos':        todoStore.create,
        'PUT /todos/{id}':    todoStore.update,
        'DELETE /todos/{id}': todoStore.destroy
    });

These fixtures, combined with a [can.Model] that connects to these services like:

    var Todo = can.Model.extend({
        findAll : 'GET /todos',
        findOne : 'GET /todos/{id}',
        create  : 'POST /todos',
        update  : 'PUT /todos/{id}',
        destroy : 'DELETE /todos/{id}'
    }, {});

... allows you to simulate requests for all of owner 5's todos like:

    Todo.findAll({ownerId: 5}, function(todos){
    
    })


