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

[can.Component]'s events object allow you to provide low-level [can.Control]-like abilities to a can.Component
while still accessing can.Component's objects and methods like [can.Component::scope scope].  The following 
example listens to clicks on elements with `className="next"` and calls `.next()` on the component's scope.

@demo can/component/examples/paginate_events_next.html  

The events object can also listen to objects or properties on the component's [can.Component::scope scope]. For instance, instead 
of using live-binding, we could listen to when offset changes and update the page manually:

@demo can/component/examples/paginate_events_next_update_page.html 

## High performance template rendering

While [can.view.bindings] allow you to call a [can.Component::scope scope] method from a template like:

    <input can-change="doSomething"/>
    
[can.Component]'s events object is useful for high-performance template rendering.  Every element that 
has a `can-click` or similar attribute has to have an event bound to it. This adds to initial render 
times.  Instead, you can use the events object and event delegation.  
 
