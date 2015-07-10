@page TemplatesAndViews Templates and Views
@parent Tutorial 5
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Stache Templates

Get the code for: [chapter: templates and views](https://github.com/bitovi/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-2_canjs-getting-started.zip?raw=true)

- - -

As mentioned in the [introduction](/guides/Tutorial.html), we’re using Stache templates in
our app. Remember that when we downloaded our custom build of CanJS, we
included the `can.stache` plugin. The CanJS docs tell us that,
“Stache templates look similar to normal HTML, except they contain keys for
inserting data into the template and *sections* to *enumerate* and/or filter
the enclosed template blocks.” They can also contain limited *conditional
logic* to show or hide content.

There are four aspects of Stache templates that we’ll review:

- [sections & context](#context),
- [enumeration](#enumeration),
- [conditional logic](#conditionallogic), and
- [partials](#partials)

It will be easiest for us to look at these with an example, so let’s create
one. Open up your `components/order_details/order_details.stache` file.
Edit it as follows:


```html
{{#with order}}
  <h3>Thanks for your order {{name}}!</h3>
  <div>
  	<label class="control-label">Confirmation Number: {{_id}}</label>
  </div>

  <h4>Items ordered:</h4>
  <ul class="list-group panel">
    {{#each items}}
      <li class="list-group-item">
        <label>
          {{name}} <span class="badge">${{price}}</span>
        </label>
      </li>
    {{/each}}

    <li class="list-group-item">
      <label>Total <span class="badge">${{total}}</span></label>
    </li>
  </ul>

  <div><label class="control-label">Phone: {{phone}}</label></div>
  <div><label class="control-label">Address: {{address}}</label></div>
{{/with}}
```

Stache templates support both [Mustache](https://github.com/janl/mustache.js/)
and [Handlebar](http://handlebarsjs.com/) formatting arguments. For more
information on the details of these formats, see their respective websites.

<a name="context"></a>
## Sections and Context
There may be times when you want to work only with a subset of data. You can do this by 
defining a new context. A context loosely refers to the data that is available for you to 
_directly access_ from a Stache template. Direct access means accessing a property without
providing any contextual identifiers (such as a dot, or a path). A valid context must be 
either an object or an array. 

Sections are execution blocks that define context. In the example above, you can directly access 
the "name" property of the order object using `{{name}}`, because the context has been set to the 
order object. If the context were not set to the order object, you would have to refer to the name 
property using `{{order.name}}`.

From within a given context, you can also reference the context object, itself, or items outside the
context using a notation similar to that used by an operating system to reference its context. 
See examples below:

```html
<div>My Current Context Object: {{.}}</div> 
<div>My Parent Context Object: {{../}}</div> 
<div>An Item on my Parent Context's Object: {{../myItem}}</div>
<div>My Parent's Parent Context Object: {{../../}}</div>
```

<a name="enumeration"></a>
## Enumeration
Enumerating allows you to loop through the contents of an iterable item. We’ve done this above for
the options in our select dropdown. The `{{#each key}} ... {{/each}}` tag set
is used to iterate over an enumerable collection, such as an array. In the
example above, we are looping over an array of objects. As with [sections](#sections),
the properties of the objects we are iterating over are accessible
from data keys inside the `#each` scope without dot notation. In the example
above, we saw:

```html
{{#each items}}
  <li class="list-group-item">
	<label>
	  {{name}} <span class="badge">${{price}}</span>
	</label>
  </li>
{{/each}}
```

Because the scope of the `{{#each}}` block is `items`, we can reference
the `name` and `price` properties of `items` directly&mdash;i.e, we don't need to
write `{{items.name}}` or `{{items.price}}`, we can just write `{{name}}` or `{{price}}`.

<a name="conditionallogic"></a>
## Conditional Logic
Stache templates have a limited capacity for conditional logic. Open up your
`main.stache` file and edit it as follows:

```
{{> header.stache}}

{{#eq page "home"}}
  {{> home.stache}}
{{/eq}}

{{#eq page "restaurants"}}
  {{#if slug}}
    {{#eq action 'order'}}
      <pmo-order slug="{slug}"></pmo-order>
    {{/eq}}
    {{^if action}}
      <pmo-restaurant-details slug="{slug}"></pmo-restaurant-details>
    {{/if}}
  {{else}}
    <pmo-restaurant-list></pmo-restaurant-list>
  {{/if}}
{{/eq}}

{{#eq page "orders"}}
  <pmo-order-history></pmo-order-history>
{{/eq}}
```

You’ll see two different helpers: `eq` and `if`. The `eq` helper takes two
arguments: the first being the key that is within the current section, and
the second a value to compare to the first argument to see if they are equal.
The `if` helper checks for one truthy argument before rendering what the
`if` block contains.

You might also notice the use of the `^` character, which will render the
section if the result of the helper is false. In other words, you can write
`{{^if action}}content{{/if}}` instead of `{{#if action}}{{else}}content{{/if}}`

If you need to use more complex logic in your application, `can.Component`
provides [helpers](../docs/can.Component.prototype.helpers.html).

<a name="partials"></a>
## Partials
You can nest templates in other templates by using partials. Partials inherit
the context from which they are called. They are evaluated at render time, so you
should be careful to avoid infinite loops. To include a partial, put its URL or
ID inside `{{> }}`.

In our example above, you can see that `{{> header.stache}}` includes the
`header.stache` file into the template.

- - -

<span class="pull-left">[&lsaquo; The Define Plugin](TheDefinePlugin.html)</span>
<span class="pull-right">[App State and Routing &rsaquo;](AppStateAndRouting.html)</span>

</div>
