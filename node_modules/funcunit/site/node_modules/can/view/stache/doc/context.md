@page can.stache.scopeAndContext Scope and Context
@parent can.stache.pages 1


## Scope and Contexts

Every part of a stache template is rendered with a 
given [can.view.Scope scope]. The scope is used to lookup 
values. A scope can contain multiple places to lookup values. 

Lets look at what happens with the scope the following example:

```
Template:
	<h1>{{message}} {{#person}}{{first}}  {{last}}{{/person}}</h1>

Data:
	{ person: {first: "Alexis"},
	  last: "Abril",
	  message: "Hello" }

Result:
	<h1>Hello Alexis Abril</h1>
```

1. The template is rendered with `Data` as the only item in the scope. `scope:[Data]`
2. `{{message}} is looked up within `Data`.
3. `{{#person}}` adds the `person` object to the top of the scope. `scope:[Data,Data.person]`
4. `{{first}}` is looked up in the scope.  It will be found on `Data.person`.
5. `{{last}}` is looked up in the scope.  
   1. `last` is looked in `Data.person`, it's not found.
   2. `last` is looked up in `Data` and returned.
6. `{{/person}}` removes `person` from the scope. `scope:[Data]`

The scope used to lookup a value can be controlled by adding `../` or `./` before a 
key. For instance, if we wanted to make sure `last` was only going to lookup on `person`,
we could change the template to:

```
Template:
	<h1>{{message}} {{#person}}{{first}}  {{./last}}{{/person}}</h1>

Data:
	{ person: {first: "Alexis"},
	  last: "Abril",
	  message: "Hello" }

Result:
	<h1>Hello Alexis </h1>
```

[can.stache.tags.section Sections], Helpers, 
and [can.Component custom elements] can modify the scope used to render a subsection.

## Older


When using [can.stache.Basics tags] in Stache, the `key` in `[can.stache.tags.escaped {{key}}]` 
references a property on the current context object. The default context always points to the data 
object initially passed to the template.

Instead of simply referencing a key matching a property on the current context object, a full path can 
be included instead. When a path is found, Stache will look for a matching property using the entire path:

	Template:
		{{person.name}}

	Data:
		{ 
			person: {
				name: "Austin"
			}
		}

	Result:
		Austin

Additionally, the current context can be changed by using [can.stache.Sections sections]. Anytime a section 
is opened, any tags inside of it will use that object as the local context for any key lookups:

	Template:
		{{#person}}
			{{name}}
		{{/person}}

	Data:
		{ 
			person: {
				name: "Austin"
			}
		}

	Result:
		Austin

If the key used within a section is not found on the local context, Stache will look up the 
stack of contexts until it finds a matching key:

	Template:
		{{#person}}
			{{name}} is {{age}}
		{{/person}}

	Data:
		{ 
			person: {
				name: "Austin"
			}
			age: 29
		}

	Result:
		Austin is 29
		