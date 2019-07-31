## Model layer

With a single line of code, CanJS creates a model that represents the objects returned by a backend API. See how `Todo` is created by passing a URL to [realtimeRestModel()](https://canjs.com/doc/can-realtime-rest-model.html).

The model layer is responsible for making GET, POST, PUT, and DELETE requests to your backend. With your component UI code using the model’s standard interface to make requests, if the backend API changes, you only have to configure the model and not change every component that uses that backend API.

By default, CanJS assumes your backend API is RESTful. If your backend API isn’t RESTful, that’s ok! CanJS has configuration options for you to control how it makes requests, parses data, and more.

```js
import { realtimeRestModel } from "can";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

// Get todos sorted by name
const todosPromise = Todo.getList({sort: "name"});
todosPromise.then(todos => {
  // Your backend API might return something like:
  // todos = [ {name: "a"}, {name: "b"}, {name: "c"} ]
});
```