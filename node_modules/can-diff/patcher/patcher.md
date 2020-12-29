@module {function} can-diff/patcher/patcher
@parent can-diff

Get patches from changes to an underlying
list or from changes from an observable emitting lists.

@signature `new Patcher( observableOrList [, priority] )`

Patcher is used to get consistent patch events from
a variety of source observables.  For example,
a patcher can be used to get patches from changes to
a [can-define/list/list]:

```js
var hobbies = new DefineList(["dancin","programmin"]);

var patcher = new Patcher(hobbies);

canReflect.onPatches(patcher, console.log);

hobbies.push("foosin") // logs {
                       //   type: "splice",
                       //   index: 2,
                       //   deleteCount: 0,
                       //   insert: ["foosin"]
                       // }
```

`Patcher` can also be used to create patches from an observable as it
changes from one list to another list:

```js
var hobbies = new DefineList(["dancin","programmin"]);
var hobbiesObservable = value.fromValue(hobbies);

var patcher = new Patcher(hobbies);

canReflect.onPatches(patcher, console.log);

hobbies.push("foosin") // logs-> {
                       //   type: "splice",
                       //   index: 2,
                       //   deleteCount: 0,
                       //   insert: ["foosin"]
                       // }

hobbiesObservable.value = new DefineList(["dancin","foosin"])
// logs-> {
//   type: "splice",
//   index: 1,
//   deleteCount: 1,
//   insert: []
// }
```

@param {List|SingleValueObservable} observableOrList A list-like object or an observable that implements
[can-reflect/observe.onValue].
@param {Number} [priority] An optional priority used to schedule in [can-queues.deriveQueue] when the
diff between an old list and new list is run.

@body
