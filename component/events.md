@property {Object} can.Component.prototype.events
@parent can.Component.prototype

Listen to events on elements and observables.

@option {Object.<can.Control.eventDescription,can.Control.eventHandler>} An object of event names and methods 
that handle the event. For example:

    can.Component({
      events: {
        ".next click": function(){
          this.viewModel.next()
        }
      },
      viewModel: {
        next: function(){
          this.attr("offset", this.offset + this.limit);
        }
      }
    })


A component's events object is used as the prototype of a [can.Control]. The control gets created on the component's
element. The component's viewModel is available within event handlers as `this.viewModel`.


@body

## Use

[can.Component]'s events object allows you to provide low-level [can.Control]-like abilities to a `can.Component`
while still accessing `can.Component`'s objects and methods like [can.Component::viewModel viewModel].  The following
example listens to clicks on elements with `className="next"` and calls `.next()` on the component's viewModel.

@demo can/component/examples/paginate_events_next.html

The events object can also listen to objects or properties on the component's [can.Component::viewModel viewModel]. For instance, instead
of using live-binding, we could listen to when offset changes and update the page manually:

@demo can/component/examples/paginate_events_next_update_page.html 

Components have the ability to bind to special [can.events.inserted inserted] and [can.events.removed removed] events that are called when a component's tag has been inserted into or removed from the page:

      events: {
        "inserted": function(){
          // called when the component's tag is inserted into the DOM 
        },
        "removed": function(){
          // called when the component's tag is removed from the DOM 
        }
      }

## Listening to viewModel events

As in [can.Control] we can listening for events inside or outside the Component. We can use a Templated Event Handler for this. Unlike [can.Control] the value inside `{Name}` are looked up on `viewModel` first followed by `this.options` and then the `window` object.
You can use the events for:
* Tracking changes on [can.List] or [can.Map] like `add`, `remove`, `change`, (`replaced`)
* Tracking changes on properties on the viewModel
* Tracking changes on [can.Model]-Instance like `created`, `updated`, `destroyed`
* Tracking promises on [can.Deferred] 

The following example shows all the described possibilities:

    // set up some fixtures
    can.fixture("GET /recipes",function(){
        return [
            {id: 1, name: "omelette"},
            {id: 2, name: "pizza"}
        ];
    });

    can.fixture("POST /recipes",function(){
        return {id: 3, name: "hot dog"};
    });

    can.fixture("PUT /recipes/{id}",function(){
        return {id: 3, name: "sushi"};
    });
    
    
    // describe a resource
    var Recipe = can.Model.extend({
        id: 'id',
        findAll: 'GET /recipes',
        create:  'POST /recipes',
        update:  'PUT /recipes/{id}',
    },{});


    // the components viewModel
    var ViewModel = can.Map.extend({
        define: {
            myMap: {
                value: function() {
                    return new can.Map({
                        eggs: 2,
                        tomatos: 3
                    });
                }
            },
            myList: {
                value: function(){
                    return new can.List({
                        name: 'Marie'
                    });
                }
            },
            foo: {
                value: "say hello"
            },
            bar: {
                get: function(){
                    return this.attr('foo').replace('foo', 'bar');
                }
            },
            recipe: {
                Type: Recipe
            },
            myAsyncData: {
                // async getter
                get: function(lastSet, deferred){
                    this.attr("myPromise").always(deferred);
                }
            },
            myPromise: {
                Value: can.Deferred
            }
        }
    });

    can.Component.extend({
        tag: "example",
        template: '',
        helpers: {},
        simpleHelpers: {},
        viewModel: ViewModel,
        events: {
            inserted: function(){
                // 1.)
                this.viewModel.attr('foo', "say hello world");
                
                // 2.)
                this.viewModel.attr('myList').push({
                    name: 'Justin'
                });
                
                // 3.)
                this.viewModel.attr('myList').splice(1,1);

                // 4.)
                this.viewModel.attr('myList', new can.List(['Maya']));

                // 5.)
                this.viewModel.attr('myList').replace(new can.List(['Peter']));

                // 6.)
                this.viewModel.attr('myMap.eggs', 10);

                // 7.1.)
                this.viewModel.attr('recipe', {name: "hot dog"});
                this.viewModel.attr('recipe').save();
                
                // 8.)
                this.viewModel.attr('myPromise', Recipe.findAll());
            },
            '{viewModel.myMap} change': function(){
                console.log("viewModel's 'myMap' changed!");
            },
            '{viewModel} myMap.eggs': function(){
                console.log("viewModel's 'myMap.eggs' changed!");
            },
            '{myMap} eggs': function(){
                console.log("alias for '{viewModel} myMap.eggs'");
            },
            '{viewModel} myList': function(){
                console.log("viewModel's 'myList' is replaced!");
            },
            '{viewModel.myList} change': function(){
                console.log("viewModel's 'myList' changed!");
            },
            '{viewModel.myList} add': function(){
                console.log("add a item on viewModel's 'myList'");
            },
            '{viewModel.myList} remove': function(){
                console.log("remove a item on viewModel's 'myList'");
            },
            '{viewModel} foo': function(){
                console.log("viewModel's 'foo' changed");
            },
            '{viewModel} bar': function(){
                console.log("viewModel's 'bar' changed");
            },
            '{viewModel.recipe} created': function(response, event){
                console.log("viewModel's 'recipe' created with ID: "+response.attr('id'));

                // add a ID for this instance
                this.viewModel.attr('recipe.id', response.attr('id'));
                this.viewModel.attr('recipe.name','sushi');

                // 7.2.)
                // update
                this.viewModel.attr('recipe').save();
            },
            '{viewModel.recipe} updated': function(response, event){
                console.log("viewModel's 'recipe' updated with name: "+response.attr('name'));
            },
            '{viewModel} myAsyncData': function(viewModel, event, response){
                console.log("viewModel's 'myPromise' is "+this.viewModel.attr('myPromise').state());
            },
            '{window} click': function(){
                console.log("clicked on the window");
            }
        }
    });
    
The Output looks like this:
    
    1.)
    viewModel's 'foo' changed
    viewModel's 'bar' changed
    
    2.)
    viewModel's 'myList' changed!
    add a item on viewModel's 'myList'
    
    3.)
    viewModel's 'myList' changed!
    remove a item on viewModel's 'myList'
    
    4.)
    viewModel's 'myList' is replaced!
    
    5.)
    viewModel's 'myList' changed!
    remove a item on viewModel's 'myList'
    viewModel's 'myList' changed!
    add a item on viewModel's 'myList'
    
    6.)
    viewModel's 'myMap' changed!
    viewModel's 'myMap.eggs' changed!
    alias for '{viewModel} myMap.eggs'
    
    7.1.)
    viewModel's 'recipe' created with ID: 3
    7.2.)
    viewModel's 'recipe' updated with name: sushi
    
    8.)
    viewModel's 'myPromise' is resolved
    
## High performance template rendering

While [can.view.bindings] conveniently allows you to call a [can.Component::viewModel viewModel] method from a template like:

    <input ($change)="doSomething"/>
    
This has the effect of binding an event handler directly to this element. Every element that has a `can-click` or similar attribute has an event handler bound to it. For a large grid or list, this could have a performance penalty.

By contrast, events bound using [can.Component]'s events object use event delegation, which is useful for high performance template rendering. In a large grid or list, event delegation only binds a single event handler rather than one per row.
