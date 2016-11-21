### 1. Computes

Computes are like event streams, but much easier to compose and friendlier to use, because they always have a synchronous value.

They can be used for observable values:

```javascript
var tally = compute(12);
tally(); // 12

tally.on("change",function(ev, newVal, oldVal){
    console.log(newVal,oldVal)
})
```

Or an observable value that derives its value from other observables.

```javascript
var person = new Person({
    firstName: 'Alice',
    lastName: 'Liddell'
});

var fullName = compute(function() {
    return person.firstName + ' ' + person.lastName;
});

fullName.on('change', function(ev, newVal, oldVal) {
        console.log("This person's full name is now " + newVal + '.');
});

person.firstName = 'Allison'; // The log reads:
//-> "This person's full name is now Allison Liddell."
```

### 2. Observable maps and lists

Object-oriented observables that mix in functional behavior, compose state naturally, and are easy to test. These objects and arrays provide the backbone of a strong ViewModel layer and the glue for data binding templates.

```javascript
var Person = DefineMap.extend(
  {
    first: "string",
    last: {type: "string"},
    fullName: {
      get: function(){
        return this.first+" "+this.last;
      }
    },
    age: {value: 0},
  });

var me = new Person({first: "Justin", last: "Meyer"})
me.fullName //-> "Justin Meyer"
me.age      //-> 0
```

### 3. Models

On the surface, encapsulates the data layer and connects to the backend. Behind the surface, a collection of opt-in behaviors provide complex optimizations.

 - [Automatic real-time support](../../can-connect/real-time/real-time.html): Live updates to sets of data that includes or excludes instances based on set logic.
 - Opt-in performance optimizations: [Fallthrough caching](../../can-connect/fall-through-cache/fall-through-cache.html), [request combination](../../can-connect/data/combine-requests/combine-requests.html), [localstorage](../../can-connect/data/localstorage-cache/localstorage-cache.html) and [in-memory](../../can-connect/data/memory-cache/memory-cache.html) data cache
 - [Prevents memory leaks](../../can-connect/constructor/store/store.html): reference counting and removal of unused instances

```javascript
var todoConnection = superMap({
  idProp: "_id",
  Map: Todo,
  List: TodoList,
  url: "/services/todos",
  name: "todo"
});
Todo.getList({}).then(function(todos){ ... });
```

CanJS has a lot of features. This page will dive into details on the best ones and why they’re valuable to developers.


## Modularity


For users that have an existing application, this modularity means they can leave functional parts of their application code alone, forever, while using new CanJS features and modules in future new areas of the application.

### Adopt new framework features without any upgrade effort or library bloat

As new modules are released, containing yet unknown better ways to build applications (i.e. a better template engine or a new model layer), you can incorporate them, without replacing the existing modules. And they’ll share the same lower level dependencies.

For example, say an entire application is built with CanJS 3.0. The following year, the developer is tasked with adding a new feature. At that point, a new templating engine called Beard has been released, with a new set of features superior to Stache. The developer can simply leave the remainder of the application using CanJS 3.0 (can-stache), and import can-beard in the new area of the application. It will likely still share the same lower level dependencies, since those are less likely to change very often, so this adds an insignificant amount of code weight.

[//]: # (IMAGE: show application component blocks using 3.0 and stache, with new area using can-beard, but sharing same low level dependencies)

Angular 1.x to 2.0 is a good counterexample to this approach. The recommended upgrade strategy was to either rewrite your application with 2.0 (a lot of extra work) or load your page with 1.X and 2.0, two full versions of the framework (a lot of code weight). Neither is preferable.

With the modularity described in CanJS, applications can import multiple versions of the high level APIs while avoiding the work of rewriting with future syntaxes and the extra code weight of importing two full frameworks.

### Faster, more stable framework releases

Because CanJS’s pieces can push out updates independently, small bug fixes and performance enhancements can be released immediately, with much lower risk. For example, if a bug is observed and fixed in can-compute, a new version of can-compute will be pushed out that day, as soon as tests pass.

By contrast, with the typical all-in-one structure, there will usually be a much longer delay between the can-compute bug fix and the next release. This is because making a new release for CanJS as a whole is a much more involved, risky endeavour. The can-compute change has to be tested much more rigorously against the framework as a whole. Plus there might be other changes in other areas in progress that need to land before the release can go out.

It’s similar to the difference between making plans with your best friend vs 10 of your friends. The larger group is going to move much more slowly because there are many more pieces to coordinate.
