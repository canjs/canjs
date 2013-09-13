@function can.EJS.tags.templated <%% CODE %>
@parent can.EJS.tags 3

@signature `<%% CODE %>` 

Renders <% CODE %> as text in result of the template rather than running CODE itself. This is useful for generators.

The following results in "<%= 'hello world' %>" rather than the string "hello world."
     
         <%%= 'hello world' %>