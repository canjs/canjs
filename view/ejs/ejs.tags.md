@page can.EJS.tags tags
@parent can.EJS

@signature `<% CODE %>`

Runs JavaScript Code.

This type of magic tag does not modify the template but is used for JS control statements 
like for-loops, if/else, switch, etc.  An example:

    <% if( items.attr('length') === 0 ) { %>
        <tr><td>You have no items</td></tr>
    <% } else { %>
        <% list(items, function(){ %>
          <tr> .... </tr>
        <% }) %>
    <% } %>

Variable declarations and control blocks should always be defined in 
their own dedicated tags. Live binding leverages this hinting to ensure that logic is declared and executed at its intended scope.
	
	<!-- Each statement has its own dedicated EJS tag -->
    <% var address = person.attr('address') %>
    <% list(items, function() { %>
        <tr> .... </tr>
    <% }) %>
    <span><%= address.attr('street') %><span>
    
    <!-- This won't work! -->
    <%
      var address = person.attr('address');
      list(items, function() {
    %>
        <tr> .... </tr>
    <% }) %>
    <span><%= address.attr('street') %><span>
    
@signature `<%= CODE %>`

Runs JS Code and writes the _escaped_ result into the result of the template.

The following results in the user seeing "my favorite element is &lt;blink>BLINK&lt;blink>" and not
<blink>BLINK</blink>.

     <div>my favorite element is <%= '<blink>BLINK</blink>' %>.</div>
     
@signature `<%== CODE %>`

Runs JS Code and writes the _unescaped_ result into the result of the template.

The following results in "my favorite element is <B>B</B>.". Using `<%==` is useful
for sub-templates.
     
         <div>my favorite element is <%== '<B>B</B>' %>.</div>
         
@signature `<%% CODE %>` 

 Writes <% CODE %> to the result of the template.  This is useful for generators.
     
         <%%= 'hello world' %>

@signature `<%# CODE %>`

Used for comments.  This does nothing.
     
         <%# 'hello world' %>
         
