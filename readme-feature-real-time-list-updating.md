## Real-time list updating

Here you can see CanJS’s model layer in action. When `Todo.getList({sort: "name"})` is called, CanJS makes a GET request to `/api/todos?sort=name`

When the array of to-dos comes back, CanJS associates that array with the query `{sort: "name"}`. When new to-dos are created, they’re added to the list that’s returned automatically, and in the right spot! You don’t have to write any code to make sure the new to-do gets inserted into the right spot in the list.

CanJS does this for filtering as well. If you make a query with a filter (e.g. `{filter: {complete: true}}`), when items are added, edited, or deleted that match that filter, those lists will be updated automatically.

Save yourself time by not writing code that updates your app’s UI.

```js
import { realtimeRestModel } from "can";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

// Get completed todos
Todo.getList({sort: "name"}).then(todos => {
  // Let’s assume the API came back with
  // todos = [ {name: "a"}, {name: "c"} ]

  // Create a new todo client-side
  const newTodo = new Todo({name: "b"});

  // The todos list is immediately updated with the
  // new to-do in the right place, alphabetically:
  // todos = [ {name: "a"}, {name: "b"}, {name: "d"} ]
});
```