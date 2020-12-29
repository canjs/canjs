@module {Object} can-diff
@parent can-js-utilities
@collection can-infrastructure
@package ./package.json

Utilities for comparing and applying differences between data structures.

@type {Object}

  `can-diff` exports an object that contains all of its module functions:

  ```js
  import {diff} from "can-diff";

  // Difference between two lists
  diff.list(["a","b"], ["a","c"])
  //-> [{type: "splice", index: 1, deleteCount: 1, insert: ["c"]}]

  // Difference between two objects
  diff.map({a: "a"},{a: "A"})
  //-> [{type: "set", key: "a", value: "A"}]

  // Diffs an object or array "deeply"
 diff.deep({inner: []}, {inner: ['a']});
  //-> [{
  //    key: 'inner',
  //    type: "splice",
  //    index: 0,
  //    deleteCount: 0,
  //    insert: ['a']
  // }]


  var ramiya = new User({id: 21, name: "Ramiya"});

  var todo = new Todo({
      name: "mow lawn",
      assignedTo: [{id: 20, name: "Justin"}, ramiya]
  });

  // Updates `dest` with source using identity awareness
  diff.mergeDeep(todo, {
      id: 1,
      name: "mow lawn",
      complete: true,
      assignedTo: [{
          id: 21, name: "Ramiya Meyer"
      }]
  });

  ramiya //-> User({id: 21, name: "Ramiya Meyer"})


  var hobbies = new DefineList(["dancin","programmin"]);
  var hobbiesObservable = value.fromValue(hobbies);

  // Emits patches from changes in a source observable
  var patcher = new Patcher(hobbies);

  canReflect.onPatches(patcher, console.log);
  ```
