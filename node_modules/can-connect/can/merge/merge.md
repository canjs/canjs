@module {connect.Behavior} can-connect/can/merge/merge can/merge
@group can-connect/can/merge/merge.instance-callbacks 5 instance callbacks
@parent can-connect.deprecated

Minimally update nested data structures with the response from the server.

@deprecated {5.0} This behavior is built in to [can-connect/can/map/map].

@signature `canMergeBehavior( baseConnection )`

Overwrites [can-connect/can/map/map]'s instance callbacks so they use [can-diff/merge-deep/merge-deep].
[can-diff/merge-deep/merge-deep] is able to make minimal changes to the nested properties of [can-define] instances
and lists given raw data.
E.g:

```js
let existingStudent;
const classroom = ClassRoom.get( { id: 505 } ).then( function( instance ) {
	instance.id; // 505
	instance.students[ 0 ].id; // 15
	instance.students[ 0 ].name; // 'Samantha Jones'
	existingStudent = instance;
} );

// later in the program new information for the classroom is retrieved

ClassRoom.get( { id: 505 } ).then( function( instance ) {
	instance.id; // 505
	instance.students[ 0 ].id; // 15
	instance.students[ 0 ].name; // 'Samantha Jones-Baker'

	// true, if can-merge behavior is used.
	// a new nested instance isn't created, instead it was updated with the changed fields
	existingStudent === instance.students[ 0 ];
} );

```

To use `can/merge`, the connection's [can-connect/can/map/map._Map], [can-connect/can/map/map._List] and any of their
nested types must be properly configured.  That configuration is discussed in the
[can-connect/can/merge/merge#Use "Use" section] below.

@param {{}} baseConnection `can-connect` connection object that is having the `can/merge` behavior added on to it. Expects
the [can-connect/can/map/map] behavior to already be added to this base connection. If the `connect` helper
is used to build the connection, the behaviors will automatically be ordered as required.

@return {{}} a `can-connect` connection containing the methods provided by `can/merge`.

@body

## Use

To use the `can/merge` behavior, you have to:

1. Add the behavior after [can-connect/can/map/map], and
2. Make sure all types, especially [can-connect/can/map/map._List] type is properly configured.

Adding the `can/merge` behavior after [can-connect/can/map/map] is pretty straightforward.
When you create a custom connection, create it as follows:

```js
import canMergeBehavior from "can-connect/can/merge/merge";
import canMapBehavior from "can-connect/can/map/map";

const ClassRoom = DefineMap.extend( {

	// ...
} );

ClassRoom.List = DefineList.extend( {
	"#": ClassRoom
} );

ClassRoom.queryLogic = new set.Algebra( { /* ... */ } );

ClassRoom.connection = connect( [ /* ... */ , canMapBehavior, canMergeBehavior /* ... */ ], {
	Map: ClassRoom,
	List: ClassRoom.List
} );
```

For [can-diff/merge-deep/merge-deep] to merge correctly, it needs to know how to uniquely identify an instance and
be able to convert raw data to instances and lists.
`map-deep-merge` looks for this configuration on the `.queryLogic` and `.connection` properties of the
[can-define.types.TypeConstructor] setting on [can-define] types.

This is more easily understood in an example.
If the `ClassRoom` has a `students` property that is a list of `Student` instances like:

```js
const ClassRoom = DefineMap.extend( {
	students: Student.List
} );
```

To be able to uniquely identify `Student` instances within that list, make sure `Student` has an `queryLogic` property
that is configured with the identifier property:

```js
Student = DefineMap.extend( { /* ... */ } );

Student.queryLogic = new set.Algebra( set.props.id( "_id" ) );
```

Also make sure that `Student.List` points its [can-define/list/list.prototype.wildcardItems] definition to `Student`
like the following:

```js
Student.List = DefineList.extend( {
	"#": Student
} );
```

**Note:** the typical method used to create a `Student` is `new Student(props)`.
However, if `Student`s have a `.connection`, [can-diff/merge-deep/merge-deep] will use
`Student.connection.[can-connect/constructor/constructor.hydrateInstance](props)`.
This is useful if `Student`s should be looked up in the connection [can-connect/constructor/store/store.instanceStore].

For example, `Student` might have a connection that has an [can-connect/constructor/store/store.instanceStore], like:

```js
Student.connection = baseMap( {
	Map: Student,
	List: Student.List,
	url: "/services/students",
	name: "students"
} );
```
