@constructor can.Component
@download can/component
@test can/component/test.html
@parent canjs

@description Create widgets that use a template, a view-model 
and custom tags.

@signature `<TAGNAME ATTR-NAME=[ATTR-VALUE]>`
@version 1.2

Create an instance of a component on a particular 
tag. Currently, this only works within [can.Mustache] templates.

@param {String} TAGNAME An HTML tag name that matches the [can.Component::tag tag]
property of the component.

@param {String} ATTR-NAME An HTML attribute name. Any attribute name is
valid. Any attributes added to the element are added as properties to the
component's [can.Component::scope scope].

@param {String} ATTR-VALUE Specifies the value of a property passed to
the component instance's [can.Component::scope scope]. By default `ATTR-VALUE`
values are looked up in the can.Mustache scope. If the string value
of the `ATTR-VALUE` is desired, this can be specified like: 

    ATTR-VALUE: "@"
    
@body

## Use

To create a `can.Component`, you must first [can.Component.extend] `can.Component` 
with the methods and properties of how your component behaves:

    can.Component.extend({
      tag: "hello-world",
      template: "{{#if visible}}{{message}}{{else}}Click me{{/if}}"
      scope: {
        visible: false
        message: "Hello There!"
      },
      events: {
        click: function(){
        	this.scope.attr("visible", true)
        }
      }
    })

This element says "Click me" until a user clicks it and then 
says "Hello There!".  To create a a instance of this component on the page, 
add `<hello-world></hello-world>` to a mustache template, render
the template and insert the result in the page like:

    var template = can.view.mustache("<hello-world></hello-world>");
    $(document.body).append( template() );

Typically, you do not append a single component at a time.  Instead, 
you'll render a template with many custom tags like:

    <srchr-app>
        <srchr-search>
          
        </srchr-search>
    </srchr-app>

## Extending can.Component

## Tag

## Template

## Scope

## Events

## Passing 








