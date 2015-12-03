@constructor can.Component
@download can/component
@test can/component/test.html
@parent canjs
@release 2.0
@link ../docco/component/component.html docco


@description Create widgets that use a template, a view-model 
and custom tags.

@signature `< TAG BINDINGS... >`

  Create an instance of a component on a particular tag in a [can.stache] template.
  In 2.3, use the [can.view.bindings bindings] syntaxes to setup bindings.

  @release 2.3
  
  @param {String} TAG An HTML tag name that matches the [can.Component::tag tag]
  property of the component.
  
  @param {can.view.bindings} BINDINGS Use the following binding syntaxes
  to connect the component's [can.Component::viewModel] to the template's [can.view.Scope scope]:
  
   - [can.view.bindings.toChild]=[can.stache.key] - one way binding to child
   - [can.view.bindings.toParent]=[can.stache.key] - one way binding to parent
   - [can.view.bindings.twoWay]=[can.stache.key] - two way binding child to parent
   
  Example:
  
  ```
  <my-tag {to-child}="key" 
          {^to-parent}="key" 
          {(two-way)}="key"></my-tag>
  ```

@signature `< TAG [ATTR-NAME="{KEY}|ATTR-VALUE"] >`

  Create an instance of a component on a particular 
  tag in a [can.stache] template.  This form of two way bindings is deprecated as of 2.3. It looked like:

  ```
  <my-tag attr-name="{key}"></my-tag>
  ```  

  @release 2.1
  
   Please check earlier versions of the documentation for more information.

@signature `< TAG [ATTR-NAME=KEY|ATTR-VALUE] >`

  Create an instance of a component on a particular 
  tag in a [can.mustache] template. Use of [can.mustache] is deprecated as of 
  2.3.  Please check earlier versions of the documentation for more information.



@body


## Use

To create a `can.Component`, you must first [can.Component.extend extend] `can.Component`
with the methods and properties of how your component behaves:

    can.Component.extend({
      tag: "hello-world",
      template: can.stache("{{#if visible}}{{message}}{{else}}Click me{{/if}}"),
      viewModel: {
        visible: false,
        message: "Hello There!"
      },
      events: {
        click: function(){
        	this.viewModel.attr("visible", !this.viewModel.attr("visible") );
        }
      }
    });

This element says "Click me" until a user clicks it and then 
says "Hello There!".  To create a a instance of this component on the page, 
add `<hello-world></hello-world>` to a mustache template, render
the template and insert the result in the page like:

    var template = can.stache("<hello-world></hello-world>");
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

### Creating a can.Component

Use [can.Component.extend] to create a `can.Component` constructor function
that will automatically get initialized whenever the component's tag is 
found. 

Note that inheriting from components works differently than other CanJS APIs. You 
can't call `.extend` on a particular component to create a "subclass" of that component. 

Instead, components work more like HTML elements. To reuse functionality from a base component, build on top of it with parent 
components that wrap other components in their template and pass any needed viewModel properties via attributes.

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
      template: can.stache("<h1>Hello World</h1>")
    });

Changes `<hello-world></hello-world>` elements into:

    <hello-world><h1>Hello World</h1></hello-world>

Use the `<content/>` tag to position the custom element's source HTML.

The following component:

    can.Component.extend({
      tag: "hello-world",
      template: can.stache("<h1><content/></h1>")
    });

Changes `<hello-world>Hi There</hello-world>` into:

    <hello-world><h1>Hi There</h1></hello-world>

### viewModel

A component's [can.Component::viewModel viewModel] defines a can.Map that
is used to render the component's template. The maps properties 
are typically set by attribute [can.view.bindings bindings] on the custom element. 
By default, every attribute's value is looked up in the parent viewModel
of the custom element and added to the viewModel object.

The following component:

    can.Component.extend({
      tag: "hello-world",
      template: can.stache("<h1>{{message}}</h1>")
    });

Changes the following rendered template:

    var template = can.stache("<hello-world {message}='greeting'/>");
    template({
      greeting: "Salutations"
    })

Into:

    <hello-world><h1>Salutations</h1></hello-world>

Default values can be provided. The following component:

    can.Component.extend({
      tag: "hello-world",
      template: can.stache("<h1>{{message}}</h1>"),
      viewModel: {
        message: "Hi"
      }
    });

Changes the following rendered template:

    var template = can.stache("<hello-world/>");
    template({})

Into:

    <hello-world><h1>Hi</h1></hello-world>

If you want to set the string value of the attribute on viewModel,
set an attribute without any binding syntax.

The following template, with the previous `"hello-world"` component:

    var template = can.stache("<hello-world message='Howdy'/>");
    template({})

Renders to:

    <hello-world><h1>Howdy</h1></hello-world>

### Events

A component's [can.Component::events events] object is used to listen to events (that are not
listened to with [can.view.bindings view bindings]). The following component
adds "!" to the message every time `<hello-world>` is clicked:

    can.Component.extend({
      tag: "hello-world",
      template: can.stache("<h1>{{message}}</h1>"),
      events: {
        "click" : function(){
          var currentMessage = this.viewModel.attr("message");
          this.viewModel.attr("message", currentMessage+ "!")
        }
      }
    });

Components have the ability to bind to special [can.events.inserted inserted] and [can.events.removed removed] events 
that are called when a component's tag has been inserted into or removed from the page.

### Helpers

A component's [can.Component::helpers helpers] object provides [can.mustache.helper mustache helper] functions
that are available within the component's template.  The following component
only renders friendly messages:

    can.Component.extend({
      tag: "hello-world",
      template: can.stache("{{#isFriendly message}}"+
                  "<h1>{{message}}</h1>"+
                "{{/isFriendly}}"),
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

## Differences between components in can.mustache and can.stache

A [can.mustache] template passes values from the viewModel to a `can.Component`
by specifying the key of the value in the attribute directly.  For example:

    can.Component.extend({
      tag: "my-tag",
      template: "<h1>{{greeting}}</h1>"
    });
    var template = can.mustache("<my-tag greeting='message'></my-tag>");
    
    var frag = template({
      message: "Hi"
    });
    
    frag //-> <my-tag greeting='message'><h1>Hi</h1></my-tag>
   
With [can.stache], you wrap the attribute name with `{}` for parent to child binding. For example:

    can.Component.extend({
      tag: "my-tag",
      template: can.stache("<h1>{{greeting}}</h1>")
    });
    var template = can.stache("<my-tag {greeting}='message'></my-tag>");
    
    var frag = template({
      message: "Hi"
    });
   
    frag //-> <my-tag {greeting}='message'><h1>Hi</h1></my-tag>

If the key was not wrapped, the template would render:

    frag //-> <my-tag greeting='message'><h1>message</h1></my-tag>
 
Because the attribute value would be passed as the value of `greeting`.

## Examples

Check out the following examples built with `can.Component`.

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

To add another panel, all we have to do is add data to `foodTypes` like:

    foodTypes.push({
      title: "Vegetables",
      content: "Carrots, peas, kale"
    })

The secret is that the `<panel>` element listens to when it is inserted
and adds its data to the tabs' list of panels with:

    this.element.parent().viewModel().addPanel( this.viewModel );

### TreeCombo

The following tree combo lets people walk through a hierarchy and select locations.

@demo can/component/examples/treecombo.html

The secret to this widget is the viewModel's `breadcrumb` property, which is an array
of items the user has navigated through, and `selectableItems`, which represents the children of the
last item in the breadcrub.  These are defined on the viewModel like:


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

When the "+" icon is clicked next to each item, the viewModel's `showChildren` method is called, which
adds that item to the breadcrumb like:

    showChildren: function( item, ev ) {
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
    
The `app` component, using the [can.Map.define define plugin], creates an instance of the `Paginate` model
and a `websitesPromise` that represents a request for the Websites
that should be displayed.

    viewModel: {
      define: {
        paginate: {
          value: function() {
            return new Paginate({
              limit: 5
            });
          }
        },
        websitesPromise: {
          get: function() {
            var params = {
                  limit: this.attr('paginate.limit'),
                  offset: this.attr('paginate.offset')
              },
              websitesPromise = Website.findAll(params),
              self = this;
  
            websitesPromise.then(function(websites) {
              self.attr('paginate.count', websites.count);
            });
    
            return websitesPromise;
          }
        }
      }
    }

The `app` control passes paginate, paginate's values, and websitesPromise to
its sub-components:

    <app>
      <grid {promise-data}='websitesPromise'>
        {{#each items}}
          <tr>
            <td width='40%'>{{name}}</td>
            <td width='70%'>{{url}}</td>
          </tr>
        {{/each}}
      </grid>
      <next-prev {paginate}='paginate'></next-prev>
      <page-count {page}='paginate.page' {count}='paginate.pageCount'/>
    </app>

## IE 8 Support

While CanJS does support Internet Explorer 8 out of the box, if you decide
to use `can.Component` then you will need to include [HTML5 Shiv](https://github.com/aFarkas/html5shiv)
in order for your custom tags to work properly.

For namespaced tag names (e.g. `<can:example>`) and hyphenated tag names (e.g. `<can-example>`) to work properly, you will 
need to use version 3.7.2 or later.

## Videos

Watch this video for an overview of can.Component, why you should use it, and a hello world example:

<iframe width="662" height="372" src="https://www.youtube.com/embed/BM1Jc3lVUrk" frameborder="0" allowfullscreen></iframe>

This video provides a more in depth overview of the API and goes over several examples of can.Components:

<iframe width="662" height="372" src="https://www.youtube.com/embed/ogX765S4iuc" frameborder="0" allowfullscreen></iframe>

Note: the videos above reference the `scope` property, which was replaced by the [can.Component::viewModel viewModel] property in 2.2.