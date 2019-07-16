@page guides/contributing/site-style-guide Site Style Guide
@parent guides/contribute 7

@description
This is the CanJS Site Style Guide

@body

<h2>Headings</h2>
<h2>H2</h2>
<p>Paragraph</p>
<h2>H2 with <code>code</code></h2>
<h3>H3</h3>
<p>Paragraph</p>
<h4>H4</h4>
<p>Paragraph</p>
<h5>H5</h5>
<p>Paragraph</p>
<h6>H6</h6>
<p>Paragraph</p>
<h2>Block elements</h2>
<p>A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
<p>Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<ul>
<li>List element</li>
<li>Another item</li>
<li>Another item</li>
</ul>
<p>Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
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
<p>Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<ol>
<li>Order lists</li>
<li>Number two</li>
<li>Number three</li>
</ol>
<blockquote>
<p>Blockquote. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</blockquote>
<p><details>
<summary>This is a summary element that shows a paragraph</summary></p>
<p>Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<p></details></p>
<p><details>
<summary>This is a summary element that shows a pre</summary></p>
<pre><code class="language-js">foo();
</code></pre>
<p></details></p>
<p>HTML code example:</p>
<pre><code class="language-html">&lt;hello-world&gt;&lt;/hello-world&gt;
</code></pre>
<p>JS code example:</p>
<pre><code class="language-js">console.log(&quot;Hello There&quot;)
</code></pre>
<p>CodePen example:</p>
<pre><code class="language-js">console.log(&quot;Hello There&quot;)
</code></pre>
<div class='codepen'></div>
<p>Highlight only example:</p>
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
<h2>Text elements</h2>
<p>The following is a very long sentence that will hopefully go across many lines because it
is so long and filled with <code>code elements</code>, <strong>bold elements</strong>, <em>italic elements</em>, <a href="#">link elements</a>.</p>