@page can-view-import.pages.dynamic Dynamic Imports
@parent can-view-import.pages

Dynamic imports are used in conditional situations such as within an [can-stache.helpers.if] to prevent unnecessarily fetching resources that might not be needed in all cases.

### Example

These `can-dynamic-import` and Steal import examples are equivalent:

```
<can-dynamic-import from="components/foobar">
  {{#if isResolved}}
    <foobar/>
  {{/if}}
</can-dynamic-import>
```

```
steal.import('components/foobar').then(function(foobar) {
 // access to the module you loaded.
 // e.g. access to a component's ViewModel 
 // foobar.ViewModel
});
```

__Note:__ when dynamically importing modules in a stache file, the scope inside [can-view-import <can-import>] is a Promise, so you have to wait until it is resolved before injecting something like a [can-component]. Use the `{{#if isResolved}}` helper to determine whether the Promise has been resolved.
