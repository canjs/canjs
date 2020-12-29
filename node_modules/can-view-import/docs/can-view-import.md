@module {function} can-view-import can-view-import
@parent can-views
@collection can-ecosystem
@package ../package.json
@group can-view-import.pages 0 Pages
@group can-view-import.attributes 1 Attributes

@signature `<can-import from="MODULE_NAME" />`

Statically import a module from within a [can-stache] template. *MODULE_NAME* will be imported before the template renders.

```
<can-import from="components/tabs" />
<tabs-widget />
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@signature `<can-import from="MODULE_NAME" module.EXPORT_NAME:to="VAR_NAME" />`

Statically import a module from within a [can-stache] template. *MODULE_NAME* will be imported before the template renders. *VAR_NAME* will be set during initial template rendering.

```
<can-import from="app/helpers/properCase" module.properCase:to="properCaseHelper" />
<can-import from="app/data/person" module.default:to="person" />
{{properCaseHelper(person.name)}}
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.
@param {exportName} [EXPORT_NAME] The name of the named export of the module. If referencing the default export rather than a named export this should be `module.default:to`. If the module referenced by *MODULE_NAME* is not an ES6 module, you may need to omit this parameter and just bind directly to module, eg. `module:to="foo"`.
@param {varName} [VAR_NAME] A scope variable name that the loaded module will be set to.

@signature `<can-import from="MODULE_NAME">content</can-import>`

Dynamically import *MODULE_NAME* if *content* is anything other than whitespace; the scope within the template is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```
<can-import from="components/tabs">
  {{#if (isResolved)}}
    <tabs-widget />
  {{/if}}
</can-import>
```

@signature `<can-import from="MODULE_NAME">content</can-import>`

Dynamically import *MODULE_NAME* if *content* is anything other than whitespace; the scope within the template is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```
<can-import from="components/tabs">
  {{#if (isResolved)}}
    <tabs-widget />
  {{/if}}
</can-import>
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@signature `<can-dynamic-import from="MODULE_NAME">content</can-dynamic-import>`

Dynamically import *MODULE_NAME*; the scope within the template is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```
<can-dynamic-import from="components/tabs">
  {{#if (isResolved)}}
    <tabs-widget />
  {{/if}}
</can-dynamic-import>
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@signature `<can-dynamic-import from="MODULE_NAME" value:to="*MODULE_REF"/>`

Dynamically import a module from within a [can-stache] template. Since there is no subtemplate to attach the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to as the current scope, you must export the Promise's resolved value to the template's refs scope using [can-view-import.value].

```
<can-dynamic-import from="components/tabs" value:to="scope.vars.tabsWidget" />
{{#if scope.vars.tabsWidget}}
	<tabs-widget />
{{/if}}

{{! other can-reflect-promise keys also work, as does the *REFERENCE shorthand from can-stache-bindings }}

<can-dynamic-import from="components/tabs" 
	isPending:to="scope.vars.tabsWidgetPending"
	isRejected:to="scope.vars.tabsWidgetError"
	this:to"scope.vars.tabsWidgetPromise" />
{{#if scope.vars.tabsWidgetPending}}
	Loading...
{{else}}
	<tabs-widget />
	{{#if scope.vars.tabsWidgetError}}
		{{scope.vars.tabsWidgetPromise.reason}}
	{{/if}}
{{/if}}

<can-dynamic-import from "my-partial.stache" value:to="scope.vars.myPartial" />
{{> scope.vars.myPartial}}
```

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

Currently this __only__ works with [can-view-autorender] or the [steal-stache] plugin.

## Progressive Loading

A template may (conditionally) load a module after the initial page load. `<can-import>` allows progressive loading by using an end tag.

This example shows a component being loaded ad hoc:

```
<can-import from="components/home"></can-import>
```

This example illustrates conditionally loading modules based on some application state:

```
{{#eq location 'home'}}
  <can-import from="components/home">
    ...
  </can-import>
{{/eq}}

{{#eq location 'away'}}
  <can-import from="components/away">
    ...
  </can-import>
{{/eq}}
```
