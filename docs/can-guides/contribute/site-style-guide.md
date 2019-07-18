@page guides/contributing/site-style-guide Site Style Guide
@parent guides/contribute 7

@description
This is the CanJS Site Style Guide. It documents all the styles used within the CanJS app. 

@body

# Headings

## H2
A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## H2 with <code>code</code>
A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### H3
A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

#### H4
A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

##### H5
A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

###### H6
A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Block elements
A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

- List element
- Another item
- Another item

Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

<ul>
<li><p>List element</p>
<ul>
<li>nested</li>
<li>next
<ul>
<li>deep
<pre><code>foo
</code></pre></li>
</ul></li>
</ul></li>
<li><p>Another item</p></li>
<li><p>Another item</p>
<p>multiple paragraphs</p></li>
</ul>

Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

1. Order lists
2. Number two
3. Number three

## Blockquote
> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

<p><details>
<summary>This is a summary element that shows a paragraph</summary></p>
<p>Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<p></details></p>

<p><details>
<summary>This is a summary element that shows a pre</summary></p>
<pre><code class="language-js">foo();
</code></pre>
<p></details></p>

### HTML code example:
<pre><code class="language-html">&lt;hello-world&gt;&lt;/hello-world&gt;
</code></pre>

### JS code example:
<pre><code class="language-js">console.log(&quot;Hello There&quot;)
</code></pre>

### CodePen example:
A typical example of configuration: @sourceref ./cookie-session-basic.html @highlight 22-27,only @codepen

An example of a configuration that uses multiple session endpoints: @sourceref ./cookie-session-basic-multi-endpoint.html @highlight 22-27,only @codepen

### Highlight only example:
<pre><code class="language-js">function  myFunction(){
  var message = &quot;Hello There&quot;;
  console.log( message );
}
myFunction();
function  myFunction(){
  var message = &quot;Hello There&quot;;
  console.log( message );
}
myFunction();
</code></pre>

## Bash
```bash
cd project
npm install can --save
```

## Handlebars
```handlebars
{{# for(value of values) }}
    <p>{{ value }}</p>
{{ else }}
    <p>No items</p>
{{/ for }}
```

## Text elements
The following is a very long sentence that will hopefully go across many lines because it
is so long and filled with <code>code elements</code>, <strong>bold elements</strong>, <em>italic elements</em>, <a href="#">link elements</a>.

