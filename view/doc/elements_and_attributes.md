@page can.elementAndAttributes Elements and Attributes
@parent canjs 0

@description A list of all custom elements and attributes that CanJS supports.

@body

[can.Component], [can.view.attr], [can.view.tag] let you create custom element and
attribute behavior.  However, CanJS and its plugins supply the following behaviors:

## Core

With the release of canJS 2.3 the new [can.view.bindings binding syntax] provides powerful event, one-way and two-way bindings on element attributes, component viewModels, and the scope.

 - Event-Binding
    * Binds events on [can.Component::viewModel viewModel] and calls method on the [can.view.Scope scope] with the [can.stache.expressions specified arguments]
      ```
      <my-component (show)="doSomething('primitive', key, hash1=key1)"/>
      ```
      
    * Binds events on a `DOMEvent` and calls method on the [can.view.Scope scope] with the [can.stache.expressions specified arguments]
      ```
      <div ($click)="doSomething('primitive', key, hash1=key1)"/>
      ```
 
 
 - One-Way-Binding
    * One-Way binds the `value` in the [can.view.Scope scope] to a child component's [can.Component::viewModel viewModel] property (`child-prop`)
      ```
      <example>
        <my-component {child-prop}="value"/>
      </example>
      ```
      
      Updates `child-prop` when `value` changes
      
    * One-Way binds the `value` in the [can.view.Scope scope] to a element's attribute or property.
      ```
      <input {placeholder}="value">
      ```
      
      Updates `placeholder` when `value` changes
      
    * Reverse the One-Way binding by adding a `^` at the beginning.
      ```
      <example>
        <my-component {^child-prop}="value"/>
      </example>
      ```
      
      Updates `value` when `child-prop` changes
      
    * Export a [can.Component::viewModel viewModel] to the references scope by adding an attribute with the hypenated name of the reference scope property
      ```
      <example {child-prop}="*foobar"/>
      <input type="text" {($value)}="*foobar">
      ```
      
      Export `child-prop` from `<example>`'s [can.Component::viewModel viewModel] into `*foobar` (reference scope) and two-way bind `*foobar` to the element's attribute. If the element's attribute changes, `*foobar` will change and updates the `child-prop` on `<example>`. If `child-prop` nothing will happen.
      
      
 - Two-Way-Binding
    * Two-Way binds the `value` in the [can.view.Scope scope] and the child component's [can.Component::viewModel viewModel] property (`child-prop`)
      ```
      <example>
        <my-component {(child-prop)}="value"/>
      </example>
      ```
      
      Updates `child-prop` when `value` changes, updates `value` when `child-prop` changes.
      
    * Two-Way binds the `value` in the [can.view.Scope scope] and the element's attribute or property.
      ```
      <input {($value)}="myValue">
      ```
      
      Updates the element's attribute `value` when `myValue` changes, updates `myValue` when the element's attribute `value` changes.
      
    * Export a [can.Component::viewModel viewModel] to the references scope by adding an attribute with the hypenated name of the reference scope property
      ```
      <example {(child-prop)}="*foobar"/>
      <input type="text" {($value)}="*foobar">
      ```
      
      Export and two-way bind `child-prop` from `<example>`'s [can.Component::viewModel viewModel] into `*foobar` (reference scope) and two-way bind `*foobar` to the element's attribute. If the element's attribute changes, `*foobar` will change and updates the `child-prop` on `<example>`. If `child-prop` changes, `*foobar` will change and updates the element's value attribute.
 
 - Passes primitive to [can.Component::viewModel viewModel]
   This does not binding properties together but show you how you can pass a primitive string to a component [can.Component::viewModel viewModel]
   ```
   <example child-prop="foobar"/>
   ```


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
