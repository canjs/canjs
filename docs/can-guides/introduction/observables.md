Object Oriented Programming

__Why Object Oriented Programming is Great_



Functional Programming is on the rise!

But people think like OO.


CanJS's observables are both object oriented and functional.  This is another example of CanJS
being the Goldilocks of JavaScript frameworks.

__Power everything__

__What are they__

Observables are special types of data that allow their property changes to be "observed" using typical event listeners. In modern web applications, they also enable “data bound” templates, which cause sections of the UI to be automatically re-rendered whenever certain data properties change, a powerful feature that removes large amounts of repetitive application code.

CanJS has an observable layer that is powerful, performant, and flexible. It binds together various parts of applications, using expressive property definitions.

```javascript
var define = require("can-define");

var Person = function(first, last){
	this.first = first;
	this.last = last;
};
define(Person.prototype,{
	first: { type: "string" },
	last: { type: "string" },
	fullName: {
		get: function(){
			return this.first+" "+this.last;
		}
	}
});
```

Observables are very powerful and easy to use on their own, but in CanJS applications, they are also used as a ViewModel, a layer that sits between the model and the view and contains the state of the application. More on ViewModels [below](#ViewModels).

__Why they’re powerful__

Observables as a concept enable an important architectural advantage in large applications.

Say you have an application with three discrete components.

[//]: # (IMAGE: app with 3 things)

Without observables, you might have component A tell component B to update itself when something happens, like user input.

[//]: # (IMAGE: arrows showing this happening)

With observables, you would separate the state of your application into a separate layer, and each component would be able to change parts of the state it cares about and listen to parts of the state it needs. When the same user input occurs, component A would update the observable state object. Component B would be notified that a property of the observable state has changed, and update itself accordingly.

[//]: # (IMAGE: show this happening)

Why is this better? Because this allows each component to be untied from the rest. They each get passed the state they need, but are unaware of the rest of the components and their needs. The architecture diagram changes from this:

[//]: # (IMAGE: arrows pointing at everything)

<img src="../../docs/can-guides/images/introduction/no-observables.png" style="width:100%;max-width:750px" alt="Diagram of app without observables"/>

To this:

[//]: # (IMAGE: state is in the middle)

<img src="../../docs/can-guides/images/introduction/with-observables.png" style="width:100%;max-width:750px" alt="Diagram of app using observables"/>

Not only is this simpler to understand, these components are more easily testable and shareable, and changes are more contained are less risky to have unwanted side effects. All of these advantages are possible because of observables.
