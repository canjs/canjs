@function can-queues.lastTask lastTask
@parent can-queues/methods

@description Return last task to be flushed.

@signature `queues.lastTask()`

  ```js
  import {queues} from "can";

  queues.lastTask() //-> {fn, args, context, meta}
  ```

  @return {Object} Returns a task object that contains:

  - `fn` - The function run
  - `args` - The arguments passed to the function
  - `context` - The context (`this`) the function was called on
  - `meta` - Additional information about the task
