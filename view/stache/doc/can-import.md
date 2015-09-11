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