@page can.Model.queue queue
@parent can.Model.plugins
@plugin can/model/queue
@test can/model/queue/test.html
@download http://donejs.com/can/dist/can.model.queue.js

can.Model.queue is a plugin that enables making changes to the data without blocking. Requests will be 
queued and made in the correct order. When `.save()` is called, queue plugin will create snapshot of the 
data which will be used as the request payload. 

@body

The can/model/queue plugin provides following features on top of can.Model:

## Requests are queued and run sequentially

Calling `.save()` adds a request to the queue. The request will be made only after previous requests have completed. For example, consider creating a Task, saving it to the server, and before the response comes back, changing it and saving it two more times:

    var task = new Task({name: "Wash"});
    task.save(); // 1

    task.attr('name',"Wash car");
    task.save(); // 2

    task.attr('name','Wash clothes');
    task.save(); // 3

The requests with their responses are made in the following correct order:

    1. POST /tasks  
            name=Wash  
       => {id: 3, name: "Wash", updated: 1363623400000}
    
    2. PUT  /tasks/3 
            name=Wash car
       => {id: 3, name: "Wash car", updated: 1363623401000}
    
    3. PUT  /tasks/3 
            name=Wash clothes
       => {id: 3, name: "Wash clothes", updated: 1363623402000}

## Non-conflicting property changes sent back by the server are set on the model instance.

When the first request returns, the task’s .attr() data is set to:

    { id: 3, name: "Wash clothes", updated: 1363623400000 }

The task has the id and updated properties returned from the initial request, but name is not overwritten. Instead it remains the last value set by `.attr()`.


## Requests are sent with a snapshot of the model instance’s data

When the second request is made `task.attr('name')` is "Wash clothes". However, `name=Wash` car is sent. This is because requests are sent with a snapshot of model instance taken at the moment `.save()` was called.

## A backup of the last successful state is kept to allow graceful error recovery.

Call `.restore()` to set the model instance’s properties back to their last successful state. For example, if `.save()` should fail, the following restores task’s name property to its last valid value:

    task.attr('name',"Something evil");
    var def = task.save();
    def.fail(function(){
      task.restore();
    })


@demo can/model/queue/queue.html