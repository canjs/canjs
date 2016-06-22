The "perfect" live-binding template syntax would be:

 - easy to make syntactically correct (meaning your code-editor probably supports its syntax)
 - works when syntactically correct (meaning if your code-editor says it looks ok, the template works as expected)
 - lends itself to a lightweight implementation

Things a live-template should be able to do:

 - conditional blocks - if/else
 - looping
 - live-bind innerHTML, text, attribute values, attributes themselves (select)
 - hook up widgets/controls in the template
 - plugins for common use

##  Magic Tag but JS performs control / looping blocks ( EJS/ ERB )

```
<% if( showNavigation ) { %>
  <ul class="nav nav-list">
	<li class="nav-header">Categories</li>
	<li>
		<a href="javascript://" data-category="all">All (<%= contacts.count('all') %>)</a>
	</li>
	<% categories.each(function(category){ %>
		<li <%= (el)-> el.widget() %> >
			<a href="javascript://" data-category="<%= category.data %>">
				<%= category.name %> (<%= contacts.count(category.data) %>)
			</a>
		</li>
	<% }) %>
  </ul>
<% } %>
```

Positives:
 - lightweight (not much parsing)
 - flexible (works with almost any JS), making plugins stupidly easy to write.
 - ERB, so many IDEs support this syntax

Negatives:
 - easy to make a syntax error

## Magic Tags and special control magic tags (Handlebars)

```
{{#if showNavigation}}
  <ul class="nav nav-list">
	<li class="nav-header">Categories</li>
	<li>
		<a href="javascript://" data-category="all">All ({{contacts.count('all')}})</a>
	</li>
	{{#each categories}}
		<li>
			<a href="javascript://" data-category="{{data}}">
				{{name}} ({{ contacts.count(data) }})
			</a>
		</li>
	{{/each}}
  </ul>
{{/if}}
```
Positives:
 - simple, few control structures
Negatives
 - helpers (like the number contacts for a given filter) will not work
 - needs "computed" properties

More discussion [here](https://gist.github.com/292840).


## Pipes (alternative to ERB/EJS)
```
| if( showNavigation ) { |
<ul class="nav nav-list">
	<li class="nav-header">Categories</li>
	<li>
		<a href="javascript://" data-category="all">All (|= contacts.count('all') |)</a>
	</li>
	| categories.each(function(category){ |
		<li |= (el) -> el.widget() |>
			<a href="javascript://" data-category="|= category.data |">
				|= category.name | (|= contacts.count(category.data) |)
			</a>
		</li>
	| }) |
</ul>
| } |
```

Positives / Negatives - Same as EJS, but a little lighter feeling. `|` doesn't conflict with html's `<` as much.

## CSS + Indent

```
if showNavigation
  ul.nav.nav-list
   li.nav-header Categories
   li
     a[href=javascript://][data-category=all] All ({{ contacts.count('all') }})
   [categories category]
     li|li.widget()|
       a[href=javascript://][data-category={{ category.data }}]
         {{ category.name }} ({{ contacts.count('all') }})
```

Positives
 - very terse syntax
 - less likely to make mistakes?

Negatives
 - harder to parse, making template engine likely bigger
 - less flexible syntax

## Valid HTML (basically knockout)
```
<ul class="nav nav-list" data-bind="if: showNavigation">
	<li class="nav-header">Categories</li>
	<li>
		<a href="javascript://" data-category="all">All (<span data-bind="html: contacts.count('all')"></span>)</a>
	</li>
        <!-- ko foreach: categories -->
		<li data-bind="widget: widget">
			<a href="javascript://" data-bind="attr: {data-category: category.data}">
				<span data-bind="text: name"></span>
                                (<span data-bind="text: data"></span>)
			</a>
		</li>
	<!-- /ko -->
</ul>
```

Positives
 - valid html

Negatives
 - likely bigger (because everything else is bigger than EJS that has live-binding)
 - less flexible syntax? 

## JAML Style
```javascript
if( showNavigation ){
  ul( {className: "nav nav-list"},
    li( {className: "nav-header"} ),
    li(
      a( { href: "javascript://", "data-category": "all"},
         "(", span( contacts.count('all') ), ")"
      )
    ),
    categories.map(function(category){
      return li(
        function(el){ new widget(el) },
        a({href: "javascript://", attr: category.data},
          span( category.name ),
          "(",category.data,")"
        )
      )
    }) 
    })
  )
}
```

Positives
 - can probably be done very lightweight if it can be done w/o parsing
 - valid JS
 - easy on the eyes

Negatives
 - I'm not sure how to make this do live-binding without parsing.