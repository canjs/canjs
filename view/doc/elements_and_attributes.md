@page can.elementAndAttributes Elements and Attributes
@parent canjs 0

@description A list of all custom elements and attributes that CanJS supports.

@body

[can.Component], [can.view.attr], [can.view.tag] let you create custom element and
attribute behavior.  However, CanJS and its plugins supply the following behaviors:

## Core

The following is supported by CanJS's [can.mustache] and [can.stache] templates by default:

 - [can.view.bindings.can-EVENT] - Specify a callback function to be called on a particular event. 
 
	`<div can-click="{doSomething item}">...</div>`

  OR

	`<div (click)="{doSomething item}">...</div>`

 - [can.view.bindings.import-scope] - Import values or the complete view model from a child component into the current scope with `[prop]="{childProp}"`

   ```
	<car-selector>
		<year-selector [year]="{selectedYear}" />
		<car-list selection="{year}" />
	</car-selector>
   ```

 - [can.view.bindings.can-value] - Sets up two way bindings in a template.
 
   ```
   <input can-value="{name}"/>
   ```

 - [can.view.href] - Sets an element's href attribute so that it's url will set the specified attribute values on [can.route].

## Plugins

The following functionality is available within plugins:

 - [can/view/autorender.can-autorender] - Autorenders a script tag within the page as a template.
 
   ```
   <script type='text/stache' can-autorender>
     <my-component></my-component>
   </script>
   ```
   
 - [can/view/stache/system.import &lt;can-import&gt;] - Imports dependencies in 
   a stache template using a System loader, StealJS, or AMD. This only works
   in templates loaded by [can/view/autorender.can-autorender] or imported
   with the [can/view/stache/system system plugin].
   
   ```
   <can-import from="components/my-component"/>
   <can import from="helpers/stache-helpers"/>
   <my-component> {{myHelper "value"}} </my-component>
   ```

   You can also dynamically import a module and nest content within:

   ```
   {{#eq page "home"}}
     <can-import from="components/my-component">
       {{#eq state "pending"}}
         <img src="loading.gif"/>
       {{/eq}}

       {{#eq state "resolved"}}
         <my-component></my-component>
       {{/eq}}
     </can-import>
   {{/eq}}
   ```
