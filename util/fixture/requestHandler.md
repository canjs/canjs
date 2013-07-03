@typedef {function(can.AjaxSettings,can.fixture.types.responseHandler)} can.fixture.types.requestHandler(request,response) requestHandler
@parent can.fixture.types

@description Specifies the response of a fixture. Used in [can.fixture].

@param {can.AjaxSettings} request The ajax settings object that
was passed to [can.ajax] or a jQuery ajax method.  Any templated
portions of the url passed to [can.fixture] are added as
data to `request.data`.  For example, calling:

    GET /todos/5
    
With the following fixture:

    can.fixture("/todos/:id",function(request, response){
      
    })

`request.data.id` will be `5.

@param {can.fixture.types.responseHandler} [response]

Optionally called to specify the response of the fixture.



@return {*|undefined} If a value is returned, it is used as a JSON
response body. If nothing is returned, it's expected that `responseHandler`
was used.
