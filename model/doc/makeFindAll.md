@function  can.Model.makeFindAll makeFindAll
@parent can.Model.static

@signature `can.Model.makeFindAll: function(findAllData) -> findAll`

Returns the external `findAll` method given the implemented [can.Model.findAllData findAllData] function.

@param {can.Model.findAllData} findAllData

[can.Model.findAll] is implemented with a `String`, [can.AjaxSettings ajax settings object], or
[can.Model.findAllData findAllData] function. If it is implemented as
a `String` or [can.AjaxSettings ajax settings object], those values are used
to create a [can.Model.findAllData findAllData] function.

The [can.Model.findAllData findAllData] function is passed to `makeFindAll`. `makeFindAll`
should use `findAllData` internally to get the raw data for the request.

@return {function(params,success,error):can.Deferred}

Returns function that implements the external API of `findAll`.

@body

## Use

`makeFindAll` can be used to implement base models that perform special
behavior. `makeFindAll` is passed a [can.Model.findAllData findAllData] function that retrieves raw
data. It should return a function that when called, uses
the findAllData function to get the raw data and manually convert it to model instances with
[can.Model.models models].

## Caching

The following uses `makeFindAll` to create a base `CachedModel`:

```js
CachedModel = can.Model.extend({
  makeFindAll: function(findAllData){
    // A place to store requests
    var cachedRequests = {};

    return function(params, success, error){
      // is this not cached?
      if(! cachedRequests[JSON.stringify(params)] ) {
        var self = this;
        // make the request for data, save deferred
        cachedRequests[JSON.stringify(params)] =
          findAllData(params).then(function(data){
            // convert the raw data into instances
            return self.models(data)
          })
      }
      // get the saved request
      var def = cachedRequests[JSON.stringify(params)]
      // hookup success and error
      def.then(success,error)
      return def;
    }
  }
},{})
```

The following Todo model will never request the same list of todo's twice:

```js
Todo = CachedModel({
  findAll: "/todos"
},{})

// widget 1
Todo.findAll({})

// widget 2
Todo.findAll({})
```
