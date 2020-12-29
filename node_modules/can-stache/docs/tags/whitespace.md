@page can-stache.tags.whitespace {{-expression-}}
@parent can-stache.tags 8

@description Omit whitespace from around the output of the template.

@signature `{{-EXPRESSION-}}`

  Whitespace may be omitted from either or both ends of a magic tag by including a
  `-` character by the braces. When present, all whitespace on that side will be
  omitted up to the next tag, magic tag, or non-whitespace character. It also works with [can-stache.tags.unescaped].

  The following ensures there is no extra whitespace between the second `<pre>`, the output of `{{-this.message-}}`,
  and the `</pre>` closing tag:

  ```html
  <my-demo></my-demo>
  <style>
  pre {border: solid 1px;}
  </style>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      <pre>
        {{this.message}}
      </pre>
      <pre>
        {{- this.message -}}
      </pre>
    `;

    static props = {
      message: "Hi There!"
    };
  }

  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

  @param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} EXPRESSION An expression whose unescaped result is inserted into the page.

@signature `{{--}}`

  Whitespace may be omitted without an expression. This is useful between html tags, for example, where it may cause issues in the display of static inline elements.

  The following ensures there is no extra whitespace between the inline items:

  ```html
  <my-demo></my-demo>
  <style>
  .slantycolors {
    display: inline-block;
    transform: skewX(15deg);
    padding: 10px;
    color: white;
    font-weight: bold;
    background: linear-gradient(to top, orange, black, blue);
  }
  </style>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      <span class="slantycolors">
        orange
      </span>
      {{--}}
      <span class="slantycolors">
        black
      </span>
      {{--}}
      <span class="slantycolors">
        blue
      </span>
      <span class="slantycolors">
        {{message}}
      </span>
    `;

    static props = {
      message: "There's no {{--}} before me."
    };
  }

  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

@body

## Examples

### Basic Usage

```html
<div>
	{{-# if(user.isMarried) -}}
		Mrs
	{{- else -}}
		Miss
	{{-/ if -}}
</div>
```

would render as:

```html
<div>{{# if(user.isMarried) }}Mrs{{ else }}Miss{{/ if }}</div>
```

and

```html
<div>
	{{{- toMarkdown(content) -}}}
</div>
```

would render as:

```html
<div>{{{ toMarkdown(content) }}}</div>
```

### Span Elements

One use case is to remove spaces around span elements.

```html
<div>
	<span>
		{{-# if(user.isMarried) -}}
			Mrs.
		{{- else -}}
			Miss.
		{{-/ if -}}
	</span>
	{{- user.name }}
</div>
```

would render as:

```html
<div>
	<span>{{#if(user.isMarried)}}Mrs.{{else}}Miss.{{/if}}</span>{{ user.name }}
</div>
```

### Empty Elements

Another would be to assure that empty elements are able to match the `:empty`
css pseudo-class (the whitespace that would be otherwise present prevents this),
while still being cleanly formatted for human consumption.

```html
<div>
	{{-! output the users name }}
	{{-# if(user.name) }}
		{{ user.name }}
	{{/ if -}}
</div>
```

would render as:

```html
<div>{{-! output the users name }}{{-# if(user.name) }}
		{{ user.name }}
	{{/ if -}}</div>
```

### Special Case

 You may want to remove all whitespace between elements without output or comment.

 ```html
<ul>
  {{--}}
  <li>Inline Nav Item 1</li>
  {{--}}
  <li>Inline Nav Item 2</li>
  {{--}}
</ul>
```

 would render as:

 ```html
<ul><li>Inline Nav Item 1</li><li>Inline Nav Item 2</li></ul>
```
