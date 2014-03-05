@constructor can.Component
@download can/component
@test can/component/test.html
@parent canjs
@link ../docco/component.html docco

@description Create widgets that use a template, a view-model 
and custom tags.

@signature `< TAG [ATTR-NAME=ATTR-VALUE] >`

Create an instance of a component on a particular 
tag. Currently, this only works within [can.Mustache] templates.

@param {String} TAG An HTML tag name that matches the [can.Component::tag tag]
property of the component.

@param {String} ATTR-NAME An HTML attribute name. Any attribute name is
valid. Any attributes added to the element are added as properties to the
component's [can.Component::scope scope].

@param {String} ATTR-VALUE Specifies the value of a property passed to
the component instance's [can.Component::scope scope]. By default `ATTR-VALUE`
values are looked up in the [can.view.Scope can.Mustache scope]. If the string value
of the `ATTR-NAME` is desired, this can be specified like: 

    ATTR-NAME: "@"
    
@body

## Use

To create a `can.Component`, you must first [can.Component.extend extend] `can.Component` 
with the methods and properties of how your component behaves:

    can.Component.extend({
      tag: "hello-world",
      template: "{{#if visible}}{{message}}{{else}}Click me{{/if}}",
      scope: {
        visible: false,
        message: "Hello There!"
      },
      events: {
        click: function(){
        	this.scope.attr("visible", !this.scope.attr("visible") );
        }
      }
    });

This element says "Click me" until a user clicks it and then 
says "Hello There!".  To create a a instance of this component on the page, 
add `<hello-world></hello-world>` to a mustache template, render
the template and insert the result in the page like:

    var template = can.view.mustache("<hello-world></hello-world>");
    $(document.body).append( template() );

Check this out here:

@demo can/component/examples/click_me.html



Typically, you do not append a single component at a time.  Instead, 
you'll render a template with many custom tags like:

    <srchr-app>
      <srchr-search models="models">
        <input name="search"/>
      </srchr-search>
      <ui-panel>
        <srchr-history/>
        <srchr-results models="models"/>
      </ui-panel>
    </srchr-app>

### Extending can.Component

Use [can.Component.extend] to create a can.Component constructor function
that will automatically get initialized whenever the component's tag is 
found.

### Tag

A component's [can.Component::tag tag] is the element node name that
the component will be created on.


The following matches `<hello-world>` elements.

    can.Component.extend({
      tag: "hello-world"
    });

### Template

A component's [can.Component::template template] is rendered as
the element's innerHTML.

The following component:

    can.Component.extend({
      tag: "hello-world",
      template: "<h1>Hello World</h1>"
    });

Changes `<hello-world></hello-world>` elements into:

    <hello-world><h1>Hello World</h1></hello-world>

Use the `<content/>` tag to position the custom element's source HTML.

The following component:

    can.Component.extend({
      tag: "hello-world",
      template: "<h1><content/></h1>"
    });

Changes `<hello-world>Hi There</hello-world>` into:

    <hello-world><h1>Hi There</h1></hello-world>

### Scope

A component's [can.Component::scope scope] defines a can.Map that
is used to render the component's template. The maps properties 
are typically set by attributes on the custom element's 
HTML. By default, every attribute's value is looked up in the parent scope
of the custom element and added to the scope object.

The following component:

    can.Component.extend({
      tag: "hello-world",
      template: "<h1>{{message}}</h1>"
    });

Changes the following rendered template:

    var template = can.view.mustache("<hello-world message='greeting'/>");
    template({
      message: "Salutations"
    })

Into:

    <hello-world><h1>Salutations</h1></hello-world>

Default values can be provided. The following component:

    can.Component.extend({
      tag: "hello-world",
      template: "<h1>{{message}}</h1>",
      scope: {
        message: "Hi"
      }
    });

Changes the following rendered template:

    var template = can.view.mustache("<hello-world message='greeting'/>");
    template({})

Into:

    <hello-world><h1>Hi</h1></hello-world>

If you want to set the string value of the attribute on scope, give scope a 
default value of "@".  The following component:

    can.Component.extend({
      tag: "hello-world",
      template: "<h1>{{message}}</h1>",
      scope: {
        message: "@"
      }
    });

Changes the following rendered template:

    var template = can.view.mustache("<hello-world message='Howdy'/>");
    template({})

Into:

    <hello-world><h1>Howdy</h1></hello-world>

### Events

A component's [can.Component::events events] object is used to listen to events (that are not
listened to with [can.view.bindings view bindings]). The following component
adds "!" to the message every time `<hello-world>` is clicked:

    can.Component.extend({
      tag: "hello-world",
      template: "<h1>{{message}}</h1>",
      events: {
        "click" : function(){
          var currentMessage = this.scope.attr("message");
          this.scope.attr("message", currentMessage+ "!")
        }
      }
    });

### Helpers

A component's [can.Component::helpers helpers] object provides [can.Mustache.helper mustache helper] functions
that are available within the component's template.  The following component
only renders friendly messages:

    can.Component.extend({
      tag: "hello-world",
      template: "{{#isFriendly message}}"+
                  "<h1>{{message}}</h1>"+
                "{{/isFriendly}}",
      helpers: {
        isFriendly: function(message, options){
          if( /hi|hello|howdy/.test(message) ) {
            return options.fn();
          } else {
            return options.inverse();
          }
        }
      }
    });


## Examples

Check out the following examples built with can.Component.

### Tabs

The following demos a tabs widget.  Click "Add Vegetables"
to add a new tab.

@demo can/component/examples/tabs.html

An instance of the tabs widget is created by creating `<tabs>` and `<panel>`
elements like:

    <tabs>
      {{#each foodTypes}}
        <panel title='title'>{{content}}</panel>
      {{/each}}
    </tabs>

To add another panel, all we have to do is add data to foodTypes like:

    foodTypes.push({
      title: "Vegetables",
      content: "Carrots, peas, kale"
    })

The secret is that the `<panel>` element listens to when it is inserted
and adds its data to the tabs' list of panels with:

    this.element.parent().scope().addPanel( this.scope );    

### TreeCombo

The following tree combo lets people walk through a hierarchy and select locations.

@demo can/component/examples/treecombo.html

The secret to this widget is the scope's `breadcrumb` property, which is an array
of items the user has navigated through, and `selectableItems`, which represents the children of the
last item in the breadcrub.  These are defined on the scope like:


    breadcrumb: [],
    selectableItems: function(){
      var breadcrumb = this.attr("breadcrumb");
	      	
      // if there's an item in the breadcrumb
      if(breadcrumb.attr('length')){
			
        // return the last item's children
        return breadcrumb.attr(""+(breadcrumb.length-1)+'.children');
      } else{
		    
        // return the top list of items
        return this.attr('items');
      }
    }

When the "+" icon is clicked next to each item, the scope's `showChildren` method is called, which
adds that item to the breadcrumb like:

    showChildren: function( item, el, ev ) {
      ev.stopPropagation();
      this.attr('breadcrumb').push(item)
    },

### Paginate

The following example shows 3 
widget-like components: a grid, next / prev buttons, and a page count indicator. And,
it shows an application component that puts them all together.

@demo can/component/examples/paginate.html

This demo uses a `Paginate` can.Map to assist with maintaining a paginated state:

    var Paginate = can.Map.extend({
    ...
    });
    
The `app` component creates an instance of the `Paginate` model
and a `websitesDeferred` that represents a request for the Websites
that should be displayed.

    scope: function () {
      return {
        paginate: new Paginate({
          limit: 5
        }),
        websitesDeferred: can.compute(function () {
          var params = {
            limit: this.attr('paginate.limit'),
            offset: this.attr('paginate.offset')
          },
            websitesDeferred = Website.findAll(params),
            self = this;

          websitesDeferred.then(function (websites) {
            self.attr('paginate.count', websites.count)
          });
    
          return websitesDeferred;
        })
      }
    }

The `app` control passes paginate, paginate's values, and websitesDeferreds to
its sub-components:

    <grid deferredData='websitesDeferred'>
      {{#each items}}
        <tr>
          <td width='40%'>{{name}}</td>
          <td width='70%'>{{url}}</td>
        </tr>
      {{/each}}
    </grid>
    <next-prev paginate='paginate'/>
    <page-count page='paginate.page' count='paginate.pageCount'/>