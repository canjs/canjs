@module can/view/stache/system.import <can-import>
@parent can.stache.plugins

@signature `<can-import from="MODULE_NAME"/>`

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@body

## Use

A template might depend on component or helper modules. `<can-import>` allows
you to specify these dependencies.

Example:

```
<can-import from="components/my_tabs"/>
<can-import from="helpers/prettyDate"/>

<my-tabs>
  <my-panel title="{{prettyDate start}}">...</my-panel>
  <my-panel title="{{prettyDate end}}">...</my-panel>
</my-tabs>
```

Currently this __only__ works with [can/view/autorender] or the [can/view/stache/system] plugin.

## Progressive Loading

A template may load or conditionally load a module after the initial page load. `<can-import>` allows progressive loading by using an end tag.

The first example below shows a component being loaded ad hoc. The second illustrates conditionally loading modules based on some application state.

Example:

```
<can-import from="components/home"></can-import>
```

```
{{#eq location 'home'}}
<can-import from="components/home"></can-import>
{{/eq}}

{{#eq location 'away'}}
<can-import from="components/away"></can-import>
{{/eq}}
```

## static & dynamic import
### static
These are imports that are direct dependencies of a template.

Example:

```
<can-import from="mymodule"/>
```
which is equivalent to a ES6 import like:
```
import from "mymodule";
```

### dynamic
These are conditional imports, things you only want to import in certain situations. Like described before in section "Progressive Loading".
```
<can-import from="components/foobar">
  {{#if isResolved}}
  <foobar/>
  {{/if}}
</can-import>
```
which is equivalent to a stealJS import like:
```
import loader from "@loader";

loader.import('components/foobar').then(function(foobar) {
 // access to the module you loaded.
 // e.g. access to a component's ViewModel 
 // foobar.ViewModel
});
```

Note that when dynamically importing in a stache file, the scope inside `<can-import>` is a Promise, so you have to wait for until it is resolved.
Use the `{{#if isResolved}}` helper for that.

## can-tag

`can-tag` allows for injecting a component, using the imported promise as the
injected component's view model.

The example below shows a loading graphic until the cart component has been loaded.
Once the cart promise is resolved, `<shopping-cart></shopping-cart>` is injected
into the page.

Loading Indicator Component

```
can.Component.extend({
  tag: "loading-indicator",
  template: can.stache("{{#isResolved}}<content/>{{else}}<img src="loading.gif"/>{{/isResolved}}")
});
```

Main Template

```
<can-import from="cart" can-tag="loading-indicator">
  <shopping-cart></shopping-cart>
</can-import>
```
