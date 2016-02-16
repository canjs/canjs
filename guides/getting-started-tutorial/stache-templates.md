@page StacheTemplates Stache Templates
@parent Tutorial 5
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Stache Templates

Get the code for: [chapter: stache templates](/guides/examples/PlaceMyOrder/ch-2_canjs-getting-started.zip)

- - -

Now that we have a basic sketch of our application, and we've covered a few CanJS fundamentals,
it’s time for us to start working with the sample application. We'll begin with the
application's templates.

As mentioned in the [introduction](./Tutorial.html), we’re using Stache templates in
our app. Remember that when we downloaded our custom build of CanJS, we
included the [can.stache](../docs/can.stache.html) plugin. 

We can create a simple template, render it to a document fragment and insert it into the page like
the following:

```
var template = can.stache("<h1>{{message}}</h1>");
var frag = template({message: "Hello World"});
$("body").append(frag);
```

Stache templates look similar to normal HTML, except they contain magic tags that contain
a very simple language that can be used to:

- [lookup and insert values into the html output](#context)
- [loop over arrays and can.Lists](#enumeration)
- [control-flow behavior like if and switch](#conditionallogic)
- [render other templates with partials](#partials)
- perform custom control-flow behavior


Stache templates support both [Mustache](https://github.com/janl/mustache.js/)
and [Handlebar](http://handlebarsjs.com/) syntax. For more
information on the details of these formats, see their respective websites.

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
## Value lookup

Assume for the moment that we have the following `customerOrder` map passed in to our Stache template:

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
      address: 'Beuselstrasse 15, Berlin',
      
      total: function(){
        var sum = 0;
        this.items.forEach(function(item){
          sum += item.price;
        });
        return sum;
      }
   }
}
```

If we want to show the `customerType` in a `<span>` we can do that in a stache template like the following:

```
<span>{{customerType}}</span>
```

What's inside the magic tags, in this case `customerType`, is a 
[key lookup expression](../docs/can.stache.expressions.html#section_KeyLookupexpressions). 
[Keys](../docs/can.stache.key.html) are used to lookup values in the 
[template scope](../docs/can.view.Scope.html).  

A DOT(`.`) operator
can be used to lookup nested values.  For example:

```
<h3>Thanks for your order {{order.name}}!</h3>
<span>{{customerType}}</span>
```

Similar to variable lookup JavaScript, a stache key lookup can search for a value in multiple places.
Each of these places is called a __context__.  The collection of all available contexts for a key lookup
is called a [scope](../docs/can.view.Scope.html).

The root context is
the data passed to a template. In this case, the root context is the `customerOrder`
object at the begining of this section.  This is why `{{customerType}}` outputs `Business`.

[Sections](../docs/can.stache.tags.section.html)
create contexts in Stache.  A section begins with `{{#EXPRESSION}}` or `{{^EXPRESSION}}`
and ends with `{{/EXPRESSION}}`.  In the following example `{{#with order}}` 
defines a section whose scope lookup starts finding values in the 
`customerOrder`'s `order` object first:

```html
{{#with order}}
  <h3>Thanks for your order {{name}}!</h3>
  <span>{{customerType}}</span>
{{#with order}}
```

In between `{{#with order}}` and `{{/with}}`, the scope's contexts look like:

```
[
  customerOrder.order,
  customerOrder
]
```

The top of the scope is called the __current context__.  In this case it is `customerOrder.order`.


When `{{name}}` is looked up, it will first look for `name` on the __current context__.  As that value
exists, `Rudloph Steiner` will be returned.

When `{{customerType}}` is looked up, it will look for `customerType` on the __current context__.  As
that value does not exist, the next context, `customerOrder`, will be searched. The value of 
`customerOrder.customerType` will be returned.

From within a given scope, you can reference the __current context__ or control which context
should be used to find values.

See examples below:

```html
{{#with order}}
   <div>My Current Context Object: {{.}}</div> <!-- references the order object-->
   <div>My Parent Context Object: {{../.}}</div>  <!-- references the customerOrder object--> 
   <div>An Item on my Parent Context's Object: {{../customerNumber}}</div>
   <div>My Parent's Parent Context Object: {{../../.}}</div> <!-- example of how you might access the parent of a parent -->
{{/with}}
```

<a name="enumeration"></a>
## Looping over arrays
Enumerating allows you to loop through the contents of an iterable item. We’ve done this above for
the options in our select dropdown. The `{{#each key}} ... {{/each}}` tag set
is used to iterate over an enumerable collection, such as an array. In the
example above, we are looping over an array of objects. As with [sections](#context),
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

Call expressions can also be passed 
to [#each](../docs/can.stache.helpers.each.html). For example, a ViewModel might
have a method to get menu items for a particular menu like `"dinner"` or 
`"lunch"` like:

```
var OrderViewModel = can.Map.extend({
  itemsForMenuType: function(type){
    return this.attr("menu.items").filter(function(item){
      return item.attr("type") === type;
    })
  }
})
```

Call this method and return its result to `#each` like:

```
{{#each itemsForMenuType("lunch")}}
  <li>...</li>
{{/each}}
```

Note that [#key](../docs/can.stache.tags.section.html) can also
be used to loop through objects with enumerable properties. In general,
[#each](../docs/can.stache.helpers.each.html) should be used if the key references
[can.List](../docs/can.List.html) or Arrays that have or often have incremental updates. [#key](../docs/can.stache.tags.section.html)
should be used when the list is replaced by a list with items that look
nothing like the previous list's items.

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
      <pmo-order {(slug)}="slug"></pmo-order>
    {{/eq}}
    {{^if action}}
      <pmo-restaurant-details {(slug)}="slug"></pmo-restaurant-details>
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
