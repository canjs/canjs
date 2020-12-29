@property {Object} can-connect-ndjson/DefineList.prototype.streamError streamError
@parent can-connect-ndjson/DefineList

@description Set on the list if the underlying stream has an error.


@type {Object}

Below is an example using `streamError` with a `DefineList` named `todos`:

```
const todos = Todo.getList({}).then(todos => {
  return todos;
}).then(todos => {
  if (todos.value.streamError) {
    console.error(todos.value.streamError)
  }
  return todos;
});

```

Here we are using `streamError` in a `can-stache` template to communicate to your users that data is still being recieved from the stream:

```
{{#if todos.value.streamError}}
  <li style="color:red">NDJSON Stream Error: {{todos.value.streamError.message}}</li>
{{/if}}
```