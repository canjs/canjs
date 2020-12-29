@property {Boolean} can-connect-ndjson/DefineList.prototype.isStreaming isStreaming
@parent can-connect-ndjson/DefineList

@description Set to `true` on the list if underlying stream is streaming and `false` when the stream is completed.


@type {Boolean}

Below is an example using `isStreaming` with a `DefineList` named `todos`:

```
var todos = Todo.getList({}).then(todos => {
  console.log(todos.value.isStreaming);
  return todos;
});

```

Here we are using `isStreaming` in a `can-stache` template to communicate to your users that data is still being recieved from the stream:

```
  {{#if todos.value.isStreaming}}
    <li style="color:#ccc">Still loading...</li>
  {{/if}}
```