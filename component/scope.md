@property {Object|can.Map|function} can.Component.prototype.scope
@parent can.Component.prototype

Provides or describes a [can.Map] constructor function or can.Map instance that will be 
used to retrieve values found in the component's [can.Component::template template]. The map 
instance is initialized with values specified by the component's attributes.

@option {Object} A plain JavaScript object that is used to define the prototype methods and properties of 
[can.Construct constructor function] that extends can.Map. For example:

    can.Component.extend({
      tag: "my-paginate",
      scope: {
        offset: 0,
        limit: 20,
        next: function(){
          this.attr("offset", this.offset + this.limit);
        }
      }
    })

Prototype properties that have values of `"@"` are not looked up in the current scope, instead
the literal string value of the relevant attribute is used.  For example:

    can.Component.extend({
      tag: "my-tag",
      scope: {
        title: "@"
      },
      template: "<h1>{{title}}</h1>"
    });
   
With source HTML like:

    <my-tag title="hello"></my-tag>
    
Results in:

    <my-tag><h1>hello</h1></my-tag>

@option {can.Map} A can.Map constructor function will be used to create an instance of the observable
can.Map placed at the head of the template's scope.  For example:

    var Paginate = can.Map.extend({
      offset: 0,
      limit: 20,
      next: function(){
        this.attr("offset", this.offset + this.limit);
      }
    })
    can.Component.extend({
      tag: "my-paginate",
      scope: Paginate
    })
    

@option {function} Returns the instance or constructor function of the object that will be added
to the scope.

@param {Object} attrs An object of values specified by the custom element's attributes. For example,
a template rendered like:

    can.view.mustache("<my-element title="name"></my-element>")({
      name: "Justin"
    })

Creates an instance of following control:

    can.Component.extend({
    	tag: "my-element",
    	scope: function(attrs){
    	  attrs.title //-> "Justin";
    	  return new can.Map(attrs);
    	}
    })

And calls the scope function with `attrs` like `{title: "Justin"}`.

@param {can.view.Scope} parentScope

The scope the custom tag was found within.  By default, any attribute's values will
be looked up within the current scope, but if you want to add values without needing
the user to provide an attribute, you can set this up here.  For example:

    can.Component.extend({
    	tag: "my-element",
    	scope: function(attrs, parentScope){
    	  return new can.Map({title: parentScope.attr('name')});
    	}
    });

Notice how the attribute's value is looked up in `my-element`'s parent scope.

@param {HTMLElement} element The element the can.Component is going to be placed on. If you want 
to add custom attribute handling, you can do that here.  For example:

    can.Component.extend({
    	tag: "my-element",
    	scope: function(attrs, parentScope, el){
    	  return new can.Map({title: el.getAttribute('title')});
    	}
    });

@return {can.Map|Object} Specifies one of the following:

 - The data used to render the component's template.
 - The prototype of a `can.Map` that will be used to render the component's template.
 
@option {can.Map} If an instance of `can.Map` is returned, that instance is placed
on top of the scope and used to render the component's template.

@option {Object} If a plain JavaScript object is returned, that is used as a prototype
definition used to extend `can.Map`.  A new instance of the extended Map is created.

@body

## Use

[can.Component]'s scope property is used to define an __object__, typically an instance
of a [can.Map], that will be used to render the component's 
template. This is most easily understood with an example.  The following
component shows the current page number based off a `limit` and `offset` value:

    can.Component.extend({
      tag: "my-paginate",
      scope: {
        offset: 0,
        limit: 20,
        page: function(){
          return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
        }
      },
      template: "Page {{page}}."
    })

If this component HTML was inserted into the page like:

    var template = can.view.mustache("<my-paginate></my-paginate>")
    $("body").append(template())

It would result in:

    <my-paginate>Page 1</my-paginate>
    
This is because the provided scope object is used to extend a can.Map like:

    CustomMap = can.Map.extend({
      offset: 0,
      limit: 20,
      page: function(){
        return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
      }
    })

Any primitives found on a can.Map's prototype (ex: `offset: 0`) are used as 
default values.

Next, a new instance of CustomMap is created with the attribute data within `<my-paginate>`
(in this case there is none) like:

    componentData = new CustomMap(attrs);
    
And finally, that data is added to the `parentScope` of the component, used to 
render the component's template, and inserted into the element:

    var newScope = parentScope.add(componentData),
        result = can.view.mustache("Page {{page}}.")(newScope);
    $(element).html(result);

## Values passed from attributes

By default, custom tag attributes other than "class" and "id" are looked up
in the parent scope and set as observable values on the [can.Map] instance.

For example, the following component requires an offset and 
limit:

    can.Component.extend({
      tag: "my-paginate",
      scope: {
        page: function(){
          return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
        }
      },
      template: "Page {{page}}."
    });

If `<my-paginate>`'s source html is rendered like:

    var template = can.view.mustache("<my-paginate offset='index' limit='size'></my-paginate>");
    
    var pageInfo = new can.Map({
      index: 0,
      size: 20
    });
    
    $("body").append( template( pageInfo ) );

... `pageInfo`'s index and size are set as the component's offset and 
limit attributes. If we were to change the value of `pageInfo`'s 
index like:

    pageInfo.attr("index",20)

... the component's offset value will change and it's template
will update to:

    <my-paginate>Page 1</my-paginate>

### Using attribute values

If you want the literal string value of the attribute instead of the attribute's value looked up in
the parent scope, you can set scope properties to have values of "@".  For example:

    can.Component.extend({
      tag: "my-tag",
      scope: {
        title: "@"
      },
      template: "<h1>{{title}}</h1>"
    });
   
With source HTML like:

    <my-tag title="hello"></my-tag>
    
Results in:

    <my-tag><h1>hello</h1></my-tag>

## Calling methods on scope from events within the template

Using html attributes like `can-EVENT=METHOD`, you can directly call a scope method 
from a template. For example, we can make `<my-paginate>` elements include a next
button that calls the scope's `next` method like:

    can.Component.extend({
      tag: "my-paginate",
      scope: {
        offset: 0,
        limit: 20,
        next: function(context, el, ev){
          this.attr("offset", this.offset + this.limit);
        },
        page: function(){
          return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
        }
      },
      template: "Page {{page}} <button can-click='next'>Next</button>"
    })

Scope methods get called back with the current context, the element that you are listening to
and the event that triggered the callback.

@demo can/component/examples/paginate_next.html








