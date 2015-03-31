@page Components Getting to Know Components
@parent Tutorial 3
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Constructors in CanJS
  - The `extend` function
  - The `init` function
 - First can.Component
  - Auto Instantiation
  - Anatomy of a can.Component

Get the code for: [chapter 2](https://github.com/bitovi/canjs/blob/guides-overhaul/guides/examples/PlaceMyOrder/ch-2_canjs-getting-started.zip?raw=true)

- - -

<a name="first-component"></a>
## First can.Component
If you recall from the introduction, a [can.Component](../docs/can.Component.html) is like a self-contained,
mini web application—i.e., it's encapsulated. Because `can.Component`'s are
encapsulated, they should each contain their own:

- View template file (.stache file)
- JavaScript file
- CSS file

This is why we created a `components` folder for our app — instead of, say, a
`js` folder. Each component we develop will be in a folder that contains all
the files that support that component. This makes components portable,
enabling you to reuse them across projects. It also isolates them, making
them easier to test and maintain.

In the components folder, create a subfolder called `restaurant_list`, along with the following files:

<pre>
└── restaurant_list
    ├── restaurant_list.js
    └── restaurant_list.stache
</pre>

Let's dive in to the good stuff, and start working with the app! Put the following code inside `restaurant_list.js`:

```
can.Component.extend({
  tag: 'restaurant-list',
  template: can.view('components/restaurant_list/restaurant_list.stache'),
  scope: {
    currentRestaurant: 'Hello Restaurant Customer'
  }
});
```

Add the following code to `restaurant_list.stache`:

```
<h1>{{currentRestaurant}}</h1>
```

Add the code below to the `app/base_template.stache` file:

```
<restaurant-list></restaurant-list>
```

Next, open up your `app.js` file, and edit it as follows:

```
$(function () {
  $('#can-app').html(can.view('base_template.stache', {}));
});
```

For the moment, if you don't know what `can.view` does, don't worry. We'll
go over it in detail soon.

Finally, we need to add a reference to `restaurant_list.js` in the
index.html file, as follows:

```
<script src="libs/jquery.js"></script>
<script src="libs/can.custom.js"></script>
<script src="libs/can.fixture.js"></script>
<!--Begin add-->
<script src="components/restaurant_list/restaurant_list.js"></script>
<!--End add-->
<script src="app.js"></script>
```

Now, go back out to your app in the browser and refresh it. You should
see it printing: "Hello Restaurant Customer".

### Auto Instantiation

If you recall from the discussion above regarding `can.Construct`, whenever you
declare an object using `can.Construct`, it must be instantiated. Normally, you
would either directly instantiate objects using the `new` keyword, or pass the
constructor to an object that would create instances of it. *`can.Component` is
an exception*.

All we have to do is declare the `can.Component` using its `extend` function.
Once you declare your `can.Component`, you've registered your component with CanJS.
When CanJS parses the `base_template.stache` file and encounters the
`<restaurant-list>` tag, it will automatically instantiate the `can.Component`
associated with it, generate the Component's view inside of its custom tag,
and bind that view to your component's scope.

Let's look at an image that describes how all of this works, to make it
clearer:

![](../can/guides/images/2_first_component/ComponentLoadCycle.png)

### Basic Anatomy of a can.Component

The `can.Component` we created above had three properties.

- [tag](#tag),
- [template](#template), and
- [scope](#scope)

<a name="tag"></a>
#### The "tag" Property 
The `can.Component`'s `tag` property associates that
`can.Component` with a specific, custom HTML tag:

![](../can/guides/images/2_first_component/ComponentTagLinkDiagram.png)

As mentioned above, when the template containing the `can.Component`'s tag is
parsed, the `can.Component` is instantiated and the contents of its rendered
template are inserted as the HTML contents of the custom tag:

![](../can/guides/images/2_first_component/ComponentTagRenderedHTML.png)

<a name="template"></a>
#### Template 
The `template` property of the `can.Component` contains the string
value of the `can.Component`'s template. Note that the template property just
contains a string value. You can inline the template, if it is small. However,
the recommended way of working with templates, to maintain separation of
concerns, is to keep them in their own files and load them using `can.view`, as
we have done here.

<a name="scope"></a>
#### Scope 
The `scope` object is the `can.Component`'s view model. The view
model is an abstraction of the view that exposes public properties and
functions. Any property or function defined on the scope object is available
from the `can.Component`'s template as either a Stache data key, or a function.
In our example above, we created the property `currentRestaurant` and then
referenced it as a Stache data key in our template.

![](../can/guides/images/2_first_component/ComponentScopeTemplateLink.png)

### can.Map &amp; can.List
The `scope` is a special type of object, called a
[can.Map](../docs/can.Map.html). `can.Map` objects are observable. Observable objects provide a way
for you to listen for and keep track of changes to them. What this means, in
this instance, is that if you make a change to your scope, those changes will
be reflected automatically in your view. If you've cross-bound the values
between your scope and your view, changes to your view will also be reflected
in your scope. We'll see how this works in the next chapter.

`can.Map` objects listen for changes made using their `attr` function. This is
important. In order to broadcast the associated events when you change a
property on a `can.Map`, you must use the `attr` function when setting a value.

The `attr` function can be used to either get or set a property on a `can.Map`.
`attr` works with deep properties&mdash;i.e., properties within properties. Here's
an example:

```
// Get the first property off of the name property off of person
myCanMapInstance.attr('person.name.first');

// Set the last property of the person's name property
myCanMapInstance.attr('person.name.last', 'Bach');
```

Observable arrays are also available with [can.List](can.List.html), which is based on `can.Map`.

- - -

<span class="pull-left">[&lsaquo; Application Foundations](ApplicationFoundations.html)</span>
<span class="pull-right">[More on Components &rsaquo;](MoreOnComponents.html)</span>

</div>
