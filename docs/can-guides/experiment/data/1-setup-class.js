import ServiceRest from "can-service-rest";
import realtime from "can-connect-realtime";
import CanConnection from "can-connection";
import observe from "can-observe";

// First define a type for instances loaded from the server.
Todo extends observe.Object {}

// And create a type for lists of instances from the server.
TodoList extends observe.Array {}

// Create a restful service.  This lets someone
// CRUD todos "statically"
// todosService.createData()
// todoService.getData()
// todosService.updateData()
// todosService.getListData()
// All of these comply with query / data
const todosService = new ServiceRest("/todos");

@realtime
class TodoConnection extends CanConnection {}


new TodoConnection({
    service: todosService,
    Instance: Todo,
    Instances: TodoList
})
