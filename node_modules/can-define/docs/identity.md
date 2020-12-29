@property {Boolean} can-define.types.identity identity
@parent can-define.behaviors

Specifies that the property uniquely identifies instances of the type.

@type {Boolean}

  If `true`, specifies that the property uniquely identifies instances of the
  type.  `identity` configures the result of [can-reflect.getIdentity].

  The following specifies that the `id` property values uniquely identifies `Todo`
  instances:

  ```js
  import {DefineMap, Reflect as canReflect} from "can";

  const Todo = DefineMap.extend("Todo",{
      id: {type: "number", identity: true},
      name: "string",
      complete: "boolean"
  });

  const todo = new Todo({id: 6, name: "mow lawn"});

  console.log( canReflect.getIdentity(todo) ); //-> 6
  ```
  @codepen

  `identity` can be `true` for multiple properties. If multiple identity properties
  are specified, a sorted JSON string is returned:

  ```js
  import {DefineMap, Reflect as canReflect} from "can";

  const Grade = DefineMap.extend("Grade",{
      classId: {type: "number", identity: true},
      studentId: {type: "number", identity: true},
      grade: "string"
  });

  const grade = new Grade({classId: 5, studentId: 7, grade: "A+"});

  console.log( canReflect.getIdentity(grade) ); //-> "{'classId':5,'studentId':7}"
  ```
  @codepen


@body

## Use

`identity` is useful for models like [can-rest-model], [can-connect] and
[can-query-logic]. For example, it's used by [can-connect/can/map/map.prototype.isNew]
to know if the instance has been saved to the server or not.  It's used by [can-connect/real-time/real-time] to know which instance to update when [can-connect/real-time/real-time.updateInstance] is called.
