import {restModel, fixture, QueryLogic} from "//unpkg.com/can@5/core.mjs";
import Todo from "./todo.mjs";
import TodoList from "./todo-list.mjs";

Todo.connection = restModel({
    Map: Todo,
    List: TodoList,
    url: "/api/todos/{id}"
});

const terms = ["can you","please","","","",""],
      verbs = ["clean","walk","do","vaccum","organize","fold","wash","dust","pay","cook","get","take out"],
      subjects = ["dog","laundry","diapers","clothes","car","windows","carpet","taxes","food","gas","trash"];

const dayInMS = 24*60*60*1000;
const lastWeek = new Date() - (7*dayInMS);
const fourWeeks = new Date().getTime() + (4*7*dayInMS);

const todoStore = fixture.store(30, function(){
    return {
        complete: fixture.rand([true, false],1)[0],
        dueDate: new Date( fixture.rand(lastWeek, fourWeeks) ).toString(),
        name: (fixture.rand(terms,1)[0]+" "+fixture.rand(verbs,1)[0]+" "+fixture.rand(subjects,1)[0]).trim()
    };
}, Todo );

fixture("/api/todos/{id}", todoStore);

export default Todo;
