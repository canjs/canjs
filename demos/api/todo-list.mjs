import {DefineList} from "//unpkg.com/can@5/core.mjs";
import Todo from "./todo.mjs";

const TodoList = DefineList.extend("TodoList",{

    // Specify the behavior of items in the TodoList
    "#": {Type: Todo},

    // Create a computed `complete` property
    get complete(){
        // Filter all complete todos
        return this.filter({complete: true});
    }
});

export default TodoList;
