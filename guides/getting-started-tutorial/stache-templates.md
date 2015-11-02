@page StacheTemplates Stache Templates
@parent Tutorial 5
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Stache Templates

Get the code for: [chapter: stache templates](https://github.com/canjs/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-2_canjs-getting-started.zip?raw=true)

- - -

Now that we have a basic sketch of our application, and we've covered a few CanJS fundamentals,
it’s time for us to start working with the sample application. We'll begin with the
application's templates.

As mentioned in the [introduction](/guides/Tutorial.html), we’re using Stache templates in
our app. Remember that when we downloaded our custom build of CanJS, we
included the `can.stache` plugin. The CanJS docs tell us that,
“Stache templates look similar to normal HTML, except they contain keys for
inserting data into the template and *sections* to *enumerate* and/or *filter*
the enclosed template blocks.” They can also contain limited *conditional
logic* to show or hide content.

Stache templates support both [Mustache](https://github.com/janl/mustache.js/)
and [Handlebar](http://handlebarsjs.com/) formatting arguments. For more
information on the details of these formats, see their respective websites.

There are four aspects of Stache templates that we’ll review:

- [sections & context](#context),
- [enumeration](#enumeration),
- [conditional logic](#conditionallogic), and
- [partials](#partials)

It will be easiest for us to look at these with an example, so let’s work with
one. Open up your `components/order_details/order_details.stache` file.
It should look like this:


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

<a name="context"></a>
## Sections and Context
Assume for the moment that we have the following customerOrder object passed in to our Stache template:

```
{
   customerNumber: 12543,
   customerType: 'Business',
   order: {
      name: 'Rudloph Steiner',
      _id: 837267,
      items: [
         {
            name: 'Garden Gnome',
            price: 23.70
         }
      ],
      total: 23.70,
      phone: '+49 170 345 6789',
      address: 'Beuselstrasse 15, Berlin'
   }
}
```
We can easily access the:

- customerNumber,
- customerType, and
- order

fields in our Stache template. These are the properties that are 
directly available off of the object passed in to the template, and are therefore
a part of the template’s root context. We can reference them simply by wrapping
them in double curly braces, e.g., `{{customerNumber}}`. If, however, we 
want to reference a value off of the order property&mdash;such as "name", or "_id"&mdash;we 
need to use dot notation, e.g., `{{order.name}}`. If you have a lot of properties
you need to reference off of a nested object, using dot notation can be tedious. 
Stache provides you the ability to create contexts to make working with nested objects
easier.

A context loosely refers to the data that is available for you to 
_directly access_. Direct access means accessing a property without
providing any contextual identifiers (such as a dot, or a path). A valid context must be 
either an object or an array. 

Sections are execution blocks that define context. In the following example, 
you can directly access the "name" property of the order object using `{{name}}`, because the context 
has been set to the order object. If the context were not set to the order object, you would have to 
refer to the name property using `{{order.name}}`.

```html
{{#with order}}
  <h3>Thanks for your order {{name}}!</h3>
  <div>
  	<label class="control-label">Confirmation Number: {{_id}}</label>
  </div>
...
{{/with}}
```

From within a given context, you can also reference the context object, itself, or items outside the
context using a notation similar to that used by an operating system to reference its context. 
See examples below:

```html
{{#with order}}
   <div>My Current Context Object: {{.}}</div> <!-- references the order object-->
   <div>My Parent Context Object: {{../}}</div>  <!-- references the customerOrder object--> 
   <div>An Item on my Parent Context's Object: {{../customerNumber}}</div>
   <div>My Parent's Parent Context Object: {{../../}}</div> <!-- example of how you might access the parent of a parent -->
{{/with}}
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

Because the context of the `{{#each}}` block is `items`, we can reference
the `name` and `price` properties of `items` directly&mdash;i.e, we don't need to
write `{{items.name}}` or `{{items.price}}`, we can just write `{{name}}` or `{{price}}`.

<a name="conditionallogic"></a>
## Conditional Logic
Stache templates have a limited capacity for conditional logic. Open up your
`main.stache` file. It should look like this:

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

In general, it’s best to keep complex logic out of your templates. Their main function
should be to display data from the view model. If you need to use more complex logic 
to display data in your templates, you can use a helper. Helpers are not covered in detail 
in this guide; but you can get more information on them in the API: [Helpers](../docs/can.Component.prototype.helpers.html)

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
