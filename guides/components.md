@page Components Components
@parent Tutorial 9

Now that you've learned about observables, templates, and controls, it's time to learn
about [can.Component](../docs/can.Component.html). can.Component makes it easy to 
combine the functionality of these features. We'll use it to rewrite the todo 
example. 

Create a component constructor function by
[extend](../docs/can.Component.extend.html) can.Component like:

    can.Component.extend({
      tag: "my-element",
      scope: {
        visible: true,
        toggle: function(){
          this.attr("visible", !this.attr("visible") )
        }
      },
      template: "<div can-click='toggle'>"+
                  "{{#isVisible}}"+
                    "<content/>"+
                  "{{else}}"+
                    "I am hidden"+
                  "{{/isVisible}}"+
                "</div>",
      helpers: {
        isVisible: function(options){
          return this.attr("visible") ?
            options.fn() : options.inverse();
        }
      },
      events: {
        "inserted": function(){
          console.log("you add a my-element to the page")
        }
      }
    })

Where:

 - [tag](../docs/can.Component.prototype.tag.html) - Specifies the HTML element that 
   components are created on.
 - [scope](../docs/can.Component.prototype.scope.html) - Describes a [can.Map](../docs/can.Map.html) that
   is added to the scope used to render the component's template.
 - [template](../docs/can.Component.prototype.template.html) - A template who's content
   gets inserted within the component's element.
 - [helpers](../docs/can.Component.prototype.helpers.html) - Local mustache helpers
   available within the component's template.
 - [events](../docs/can.Component.prototype.events.html) - Listen to events like a 
   [can.Control](../docs/can.Control.html).

Now let's dive into component's properties a bit more.

## Tag

A component represents a custom html element whose nodeName 
is specified by the component's [tag](../docs/can.Component.prototype.tag.html) attribute.  To create
a can.Component constructor function that manages
functionality on a `<todos-editor>` elements, 
[extend](../docs/can.Component.extend.html) can.Component like:

    can.Component.extend({
      tag: "todos-editor"
    })

Now, when a `<todos-editor>` element is found in a mustache template,
an instance of the component is created on the element.

    var template = can.view.mustache("Here is my "+
                     "<todos-editor>todos-editor element</todos-editor>")

    var frag = template();
    frag.childNodes[1].nodeName //-> "todos-editor element"

This control doesn't do anything.  Lets change that by filing out other
properties.

## Template

Lets put an `<input/>` element inside `<todos-editor>` elements
by adding a [template](../docs/can.Component.prototype.template.html) property:

    can.Component.extend({
      tag: "todos-editor",
      template: "<input type='text'/>"
    })

This replaces any source content with the component's template.  The result
of rendering `template` looks like:

@demo guides_source/components/template-0.html

Notice that "todos-editor element" is removed.

To render the source content within the template, add a `<content/>` tag like:

    can.Component.extend({
      tag: "todos-editor",
      template: "<content/><input type='text'/>"
    })

This results in:

@demo guides_source/components/template-1.html

If no source content is provided between the custom tags, you can specify default
content to use within the `<content></content>` tags like:

    can.Component.extend({
      tag: "todos-editor",
      template: "<content>Edit </content><input type='text'/>"
    })

If the source template is changed to:

    var template = can.view.mustache("Here is my "+
                     "<todos-editor></todos-editor>")

This results in:

@demo guides_source/components/template-2.html

You can also specify the template as a [can.view.renderer](../docs/can.view.renderer.html) like:

    var template = can.view.mustache("<content>Edit </content>"+
                                     "<input type='text'/>");
    
    can.Component.extend({
      tag: "todos-editor",
      template: template
    })

By default the component's template renders with the 
same [can.view.Scope scope] as the scope where the custom element is 
found within the source template. But, you can adjust the 
scope with can.Component's scope property.

## Scope 

A template's [scope](../docs/can.Component.prototype.scope.html) property 
allows you to adjust the scope used to render the component's 
template.  If a plain JavaScript object is used, that object is used
to extend and create an instance of [can.Map](../docs/can.Map.html) and
add to the top to the scope used to render the template.

For example, we can add a visible property to control if the input element
is visible or not:

    can.Component.extend({
      tag: "todos-editor",
      template: "<form>Editor: "+
                  "{{#if visible}}<input type='text'/>{{/if}}"+
                "</form>",
      scope: {
        visible: true
      }
    })

### Scope bindings

This isn't interesting without a way to change toggling the 
visible property. We can tell our template to call a `toggle` method
on the scope anytime someone clicks the form 
with [template bindings](../docs/can.view.bindings.html) like:

    can.Component.extend({
      tag: "todos-editor",
      template: "<form can-click='toggle'>Editor: "+
                  "{{#if visible}}<input type='text'/>{{/if}}"+
                "</form>",
      scope: {
        visible: true,
        toggle: function(context, el, ev){
          this.attr("visible", !this.attr("visible") )
        }
      }
    })

Check it out here:

@demo guides_source/components/scope-0.html

When bindings are used like this, the scope function is called back with
the element's context, the element, and the event.

### Scope value functions

Scope functions can also be called for their value. For example:

    can.Component.extend({
      tag: "todos-editor",
      template: "<form can-click='toggle'>{{visibility}}: "+
                  "{{#if visible}}<input type='text'/>{{/if}}"+
                "</form>",
      scope: {
        visible: true,
        toggle: function(context, el, ev){
          this.attr("visible", !this.attr("visible") )
        },
        visibility: function(){
          return this.attr("visible") ?
            "visible" : "invisible"
        }
      }
    })

@demo guides_source/components/scope-1.html

### Scope as a can.Map constructor function

The scope object can also be defined as a can.Map constructor function.  This
makes it easier to test the scope object independent of the component's 
rendering.  For example:

    
    var TodosEditorState = can.Map.extend({
      visible: true,
      toggle: function(context, el, ev){
        this.attr("visible", !this.attr("visible") )
      },
      visibility: function(){
        return this.attr("visible") ?
          "visible" : "invisible"
      }
    })
    
    can.Component.extend({
      tag: "todos-editor",
      template: "<form can-click='toggle'>{{visibility}}: "+
                  "{{#if visible}}<input type='text'/>{{/if}}"+
                "</form>",
      scope: TodosEditorState
    })

    // TEST CODE
    var editor = new TodosEditorState();
    equal( editor.visibility(), "visible" );
    
    editor.toggle();
    equal( editor.visibility(), "invisible" );
    
### Passing values to a component's scope
    
Often, you want to pass values to a component.  This is done by 
setting attributes on the component's element. For example,
we might want to pass a todo to the todo editor from the source
template.  To do this, add a `todo='mytodo'` attribute.

    var template = can.view.mustache("<h1>Todo: {{mytodo.name}}</h1>"+
                     "<todos-editor todo='mytodo'></todos-editor>")

    var mytodo = new can.Map({name: "Do the dishes"})

    can.Component.extend({
      tag: "todos-editor",
      template: "{{#if todo}}"+
                  "<input type='text' can-value='todo.name'/>"+
                "{{/if}}",
      scope: {}
    })

    var frag = template({
      mytodo: mytodo
    })

    document.body.appendChild(frag)

Notice the `can-value` attribute on the input element. This sets up a two-way binding
between the todo's name and the input element.  This lets you change the 
todo's name.
 
@demo guides_source/components/scope-2.html

Sometimes, you want to specify attribute values that are not looked up in the 
scope.  For example, you might want to give `todos-editor` placeholder text as follows:

    var template = can.view.mustache(
                     "<h1>Todo: {{mytodo.name}}</h1>"+
                     "<todos-editor todo='mytodo' "+
                                    "placeholder='name'>"+
                    "</todos-editor>")

We can modify the component to read the string placeholder value by setting
`placeholder` in the scope to "@".  This is a special flag that indicates to 
simply use the attribute's value.

    can.Component.extend({
      tag: "todos-editor",
      template: "{{#if todo}}"+
                  "<input type='text' "+
                         "placeholder='{{placeholder}}' "+
                         "can-value='todo.name'/>"+
                "{{/if}}",
      scope: {
        placeholder: "@"
      }
    })

If you remove the input's text, a placeholder will show up:

@demo guides_source/components/scope-3.html


## Helpers

The helpers object registers local helpers avaialble within the 
component.  The following lists todo and adds a `todoClass` 
helper that is used to set the className on a todo's `<li>` element:

    can.Component.extend({
	  tag: "todos-list",
    	template: 
    		"<ul>"+
    		  "{{#each todos}}"+
    			"<li>"+
    		      "<input type='checkbox' can-value='complete'>"+
    		      "<span {{todoClass}} can-click='select'>{{name}}</span> "+
    			  "<a href='javascript://' can-click='destroy'>X</a>"+
    		    "</li>"+
    		  "{{/each}}"+
    		"</ul>",
    	scope: {
    		todos: new Todo.List({}),
    		select: function(todo){
    			can.route.attr("id",todo.attr("id"))
		    }
	    },
	    helpers: {
    		todoClass: function(options){
    			if(options.context.attr('complete')) {
				return "class='done'"
    			}
    		}
    	}
    });

Notice that `options.context` is used to retrieve the todo because
`this` within `todoClass` is the scope.

@demo guides_source/components/helpers-0.html


## Events

A component's [events](../docs/can.Component.prototype.events.html) object is 
used to create a [can.Control] that has access to scope as 
`this.scope`.  Use it to listen to events safely.

For example, we can create a `todos-app` component that
manages the high-level state of the application. It listens
to changes in [can/route](../docs/can.route.html) and
updates the scope's `todo` property. And, if 
a todo is destroyed that matches the route's `id`,
the route's `id` is removed:

    can.Component.extend({
      tag: "todos-app",
      scope: {
        todo: null
      },
      events: {
        "{can.route} id": function(route, ev, id){
          if(id){
            Todo.findOne({id: id}, $.proxy(function(todo){
              this.scope.attr("todo", todo)
            }, this))
          } else {
            this.scope.removeAttr("todo")
          }
        },
        "{Todo} destroyed": function(Todo, ev, destroyedTodo){
		  if( destroyedTodo.id == can.route.attr("id") ){
		    can.route.removeAttr("id")
		  }
        }
      }
    })


You can use templated event binding to listen to changes in scope 
objects.  Adding the following to `todo-app`'s events object
listens to todo changes and saves the changes.


    "{todo} change": function(todo, ev, attr){
      if( attr === "name" || attr == "complete" ) {
        todo.save()
      }
    }

Finally, to put this all together, we render a template like:

    <todos-app>
      <todos-list></todos-list>
      <todos-editor todo='todo'></todos-editor>
    </todos-app>


@demo guides_source/components/demo.html
