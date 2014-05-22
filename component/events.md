@property {Object} can.Component.prototype.events
@parent can.Component.prototype

Listen to events on elements and observables.

@option {Object.<can.Control.eventDescription,can.Control.eventHandler>} An object of event names and methods 
that handle the event. For example:

    can.Component({
      events: {
        ".next click": function(){
          this.scope.next()
        }
      },
      scope: {
        next: function(){
          this.attr("offset", this.offset + this.limit);
        }
      }
    })


A component's events object is used as the prototype of a [can.Control]. The control gets created on the component's
element. The component's scope is available within event handlers as `this.scope`. 


@body

## Use

[can.Component]'s events object allows you to provide low-level [can.Control]-like abilities to a can.Component
while still accessing can.Component's objects and methods like [can.Component::scope scope].  The following 
example listens to clicks on elements with `className="next"` and calls `.next()` on the component's scope.

@demo can/component/examples/paginate_events_next.html  

The events object can also listen to objects or properties on the component's [can.Component::scope scope]. For instance, instead 
of using live-binding, we could listen to when offset changes and update the page manually:

@demo can/component/examples/paginate_events_next_update_page.html 

## High performance template rendering

While [can.view.bindings] conveniently allows you to call a [can.Component::scope scope] method from a template like:

    <input can-change="doSomething"/>
    
This has the effect of binding an event handler directly to this element. Every element that has a `can-click` or similar attribute has an event handler bound to it. For a large grid or list, this could have a performance penalty.

By contrast, events bound using [can.Component]'s events object use event delegation, which is useful for high performance template rendering. In a large grid or list, event delegation only binds a single event handler rather than one per row.