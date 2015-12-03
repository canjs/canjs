@property {Object|can.Map|function} can.Component.prototype.viewModel
@parent can.Component.prototype

@description

Provides or describes a [can.Map] constructor function or `can.Map` instance that will be
used to retrieve values found in the component's [can.Component::template template]. The map 
instance is initialized with values specified by the component element's attributes.

__Note:__ This page documents behavior of components in [can.stache]. [can.mustache] behaves
slightly differently. If you want the behavior of components with [can.mustache], 
please look at versions of this page prior to 2.3. In 2.3, use [can.view.bindings] [can.view.bindings.toChild], 
[can.view.bindings.toParent] and [can.view.bindings.twoWay] to setup viewModel 
bindings.

@option {Object} A plain JavaScript object that is used to define the prototype methods and properties of
[can.Construct constructor function] that extends [can.Map]. For example:

    can.Component.extend({
      tag: "my-paginate",
      viewModel: {
        offset: 0,
        limit: 20,
        next: function(){
          this.attr("offset", this.offset + this.limit);
        }
      }
    });

@option {can.Map} A `can.Map` constructor function will be used to create an instance of the observable
`can.Map` placed at the head of the template's viewModel.  For example:

    var Paginate = can.Map.extend({
      offset: 0,
      limit: 20,
      next: function(){
        this.attr("offset", this.offset + this.limit);
      }
    })
    can.Component.extend({
      tag: "my-paginate",
      viewModel: Paginate
    })
    

@option {function} Returns the instance or constructor function of the object that will be added
to the viewModel.

@param {Object} attrs An object of values specified by the custom element's attributes. For example,
a template rendered like:

    can.mustache("<my-element title="name"></my-element>")({
      name: "Justin"
    })

Creates an instance of following control:

    can.Component.extend({
    	tag: "my-element",
    	viewModel: function(attrs){
    	  attrs.title //-> "Justin";
    	  return new can.Map(attrs);
    	}
    })

And calls the viewModel function with `attrs` like `{title: "Justin"}`.

@param {can.view.viewModel} parentScope

The viewModel the custom tag was found within.  By default, any attribute's values will
be looked up within the current viewModel, but if you want to add values without needing
the user to provide an attribute, you can set this up here.  For example:

    can.Component.extend({
    	tag: "my-element",
    	viewModel: function(attrs, parentScope){
    	  return new can.Map({title: parentScope.attr('name')});
    	}
    });

Notice how the attribute's value is looked up in `my-element`'s parent viewModel.

@param {HTMLElement} element The element the [can.Component] is going to be placed on. If you want
to add custom attribute handling, you can do that here.  For example:

    can.Component.extend({
    	tag: "my-element",
    	viewModel: function(attrs, parentScope, el){
    	  return new can.Map({title: el.getAttribute('title')});
    	}
    });

@return {can.Map|Object} Specifies one of the following:

 - The data used to render the component's template.
 - The prototype of a `can.Map` that will be used to render the component's template.
 
@option {can.Map} If an instance of `can.Map` is returned, that instance is placed
on top of the viewModel and used to render the component's template.

@option {Object} If a plain JavaScript object is returned, that is used as a prototype
definition used to extend `can.Map`.  A new instance of the extended Map is created.

@body

## Use

[can.Component]'s viewModel property is used to define an __object__, typically an instance
of a [can.Map], that will be used to render the component's 
template. This is most easily understood with an example.  The following
component shows the current page number based off a `limit` and `offset` value:

    can.Component.extend({
      tag: "my-paginate",
      viewModel: {
        offset: 0,
        limit: 20,
        page: function(){
          return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
        }
      },
      template: can.stache("Page {{page}}.")
    })

If this component HTML was inserted into the page like:

    var template = can.stache("<my-paginate/>")
    $("body").append(template())

It would result in:

    <my-paginate>Page 1</my-paginate>
    
This is because the provided viewModel object is used to extend a can.Map like:

    CustomMap = can.Map.extend({
      offset: 0,
      limit: 20,
      page: function(){
        return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
      }
    })

Any primitives found on a `can.Map`'s prototype (ex: `offset: 0`) are used as
default values.

Next, a new instance of CustomMap is created with the attribute data within `<my-paginate>`
(in this case there is none) like:

    componentData = new CustomMap(attrs);
    
And finally, that data is added to the [can.view.Scope parentScope] of the component, used to 
render the component's template, and inserted into the element:

    var newviewModel = parentScope.add(componentData),
        result = can.stache("Page {{page}}.")(newviewModel);
    $(element).html(result);

## Values passed from attributes

Values can be "passed" into the viewModel of a component, similar to passing arguments into a function. Using
[can.view.bindings], the following binding types can be setup:

- [can.view.bindings.toChild] - Update the component's viewModel when the parent scope value changes.
- [can.view.bindings.toParent] - Update the parent scope when the component's viewModel changes.
- [can.view.bindings.twoWay] - Update the parent scope or the component's viewModel when the other changes.

As mentioned in the deprecation warning above, using [can.stache], values are passed into components like this:

    <my-paginate {offset}='index' {limit}='size'></my-paginate>

The above would create an offset and limit property on the component that are initialized to whatever index and size are, NOT cross-bind 
the offset and limit properties to the index and size.

The following component requires an `offset` and `limit`:

    can.Component.extend({
      tag: "my-paginate",
      viewModel: {
        page: function(){
          return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
        }
      },
      template: can.stache("Page {{page}}.")
    });

If `<my-paginate>`'s source html is rendered like:

    var template = can.stache("<my-paginate {offset}='index' {limit}='size'></my-paginate>");
    
    var pageInfo = new can.Map({
      index: 0,
      size: 20
    });
    
    $("body").append( template( pageInfo ) );

... `pageInfo`'s index and size are set as the component's offset and 
limit attributes. If we were to change the value of `pageInfo`'s 
index like:

    pageInfo.attr("index",20)

... the component's offset value will change and its template will update to:

    <my-paginate>Page 1</my-paginate>

### Using attribute values

You can also pass a literal string value of the attribute. To do this in [can.stache], 
simply pass any value not wrapped in single brackets, and the viewModel property will
be initialized to this string value:

    <my-tag title="hello"></my-tag>

The above will create a title property in the component's viewModel, which has a string `hello`.  

If the tag's `title` attribute is changed, it updates the viewModel property 
automatically.  This can be seen in the following example:

@demo can/component/examples/accordion.html

Clicking the __Change title__ button sets a `<panel>` element's `title` attribute like:

    $("#out").on("click", "button", function(){
      $("panel:first").attr("title", "Users")
      $(this).remove();
    });


## Calling methods on viewModel from events within the template

Using html attributes like `can-EVENT-METHOD`, you can directly call a viewModel method
from a template. For example, we can make `<my-paginate>` elements include a next
button that calls the viewModel's `next` method like:

    can.Component.extend({
      tag: "my-paginate",
      viewModel: {
        offset: 0,
        limit: 20,
        next: function(context, el, ev){
          this.attr("offset", this.offset + this.limit);
        },
        page: function(){
          return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
        }
      },
      template: can.stache("Page {{page}} <button ($click)='next()'>Next</button>")
    })

viewModel methods get called back with the current context, the element that you are listening to
and the event that triggered the callback.

@demo can/component/examples/paginate_next.html

## Publishing events on viewModels

Maps can publish events on themselves. For instance, in the following `<player-edit>` component,
it dispatches a `"close"` event when it's close method is called:

```
can.Component.extend({
  tag: "player-edit",
  template: can.view('player-edit-stache'),
  viewModel: {
    close: function(){
      this.dispatch("close");
    }
  }
});
```

These can be listened to with [can.view.bindings.event] bindings like:

```
<player-edit 
  	(close)="removeEdit()" 
  	{player}="editingPlayer"/>
```

The following demo uses this ability to create a close button that 
hides the player editor:

@demo can/component/examples/paginate_next_event.html






