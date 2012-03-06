@class can.EJS
@parent can.view

EJS provides __live__ ERB style client-side templates. Use EJS 
with [can.view] and for live templating use EJS with [can.Observe].

## Basic Example

The following renders a Teacher's name and students into an element.  First, 
create a teacher template in a script tag like:

    <script type='text/ejs' id='teacherEJS'>
    
      <h2 class='<%= teacher.grade < 'c' : "good" : "bad" %>'>
        <%= teacher.name %>
      </h2>
      
      <ul>
        <% for(var i =0; i< teacher.students.length; i++){ %>
          <li><%= teaher.students[i].name %></li>
        <% } %>
      </ul>
      
    </script>

Notice the magic tags?  Those are things that look like `<% %>` and 
`<%= %>`.  Code between `<% %>` is run and the return value of code
between `<%= %>` is inserted into the page.

Next, create a teacher and use can.view to render the template:

    var teacher = {
      name : "Mr. Smith",
      grade : "a"
      students : [
        {name : "Suzy"},
        {name : "Payal"},
        {name : "Curtis"},
        {name : "Alexis"}
      ]
    };
    
    document.getElementById('teacher')
      .appendChild( can.view("teacherEjs", teacher) )

This results in HTML like:

    <div id='teachers'>
      <h2 class='good'>
        Mr. Smith
      </h2>

      <ul>
         <li>Suzy</li>
         <li>Payal</li>
         <li>Curtis</li>
         <li>Alexis</li>
      </ul>
    </div>
    
This is nice, but what if we change properties of the teacher?

## Basic Live Binding Example

EJS sets up live templating binding when a [can.Observe]'s properties are read 
via [can.Observe::attr attr] within a magic tag.  To make this template
respond to changes in the teacher data, first rewrite the template
to use the attr method to read properties and `list( observeList, cb(item, i) )`
to iterate through a list like:

    <script type='text/ejs' id='teacherEJS'>
    
      <h2 class='<%= teacher.attr('grade') < 'c' : "good" : "bad" %>'>
        <%= teacher.attr('name') %>
      </h2>
      
      <ul>
        <% list(teacher.students, function(student){ %>
          <li><%= student.attr('name') %></li>
        <% }) %>
      </ul>
      
    </script>

__Note:__ The end of this page discusses why using `list` is 
helpful, but it does nothing fancy.

Next, turn your teacher into a `new can.Observe(object)` and pass
that to `can.view`:

    var teacher = can.Observe({
      name : "Mr. Smith",
      grade : "a"
      students : [
        {name : "Suzy"},
        {name : "Payal"},
        {name : "Curtis"},
        {name : "Alexis"}
      ]
    });
    
    document.getElementById('teacher')
      .appendChild( can.view("teacherEjs", teacher) );
      
Finally, update some properties of teacher and slap your 
head with disbelief ...

    teacher.attr('name',"Prof. Snape")
    teacher.attr('grade','f+')
    teacher.attr('students').push({
      name : "Harry Potter"
    })

... but don't slap it too hard, you'll need it for building awesome apps.

## Magic Tags

EJS uses 5 types of tags:
 
__`<% CODE %>`__ - Runs JS Code.

This type of magic tag does not modify the template but is used for JS control statements 
like for-loops, if/else, switch, etc.  Some examples:

    <% if( items.attr('length') === 0 ) { %>
        <tr><td>You have no items</td></tr>
    <% } else { %>
        <% list(items, function(){ %>
          <tr> .... </tr>
        <% }) %>
    <% } %>


    <% var address = person.attr('address') %>
    <span><%= address.attr('street') %><span>

__`<%= CODE %>`__ - Runs JS Code and writes the _escaped_ result into the result of the template.

The following results in the user seeing "my favorite element is &lt;blink>BLINK&lt;blink>" and not
<blink>BLINK</blink>.

     <div>my favorite element is <%= '<blink>BLINK</blink>' %>.</div>
         
__`<%== CODE %>`__  - Runs JS Code and writes the _unescaped_ result into the result of the template.

The following results in "my favorite element is <B>B</B>.". Using `<%==` is useful
for sub-templates.
     
         <div>my favorite element is <%== '<B>B</B>' %>.</div>
         
__`<%% CODE %>`__ - Writes <% CODE %> to the result of the template.  This is very useful for generators.
     
         <%%= 'hello world' %>
         
__`<%# CODE %>`__  - Used for comments.  This does nothing.
     
         <%# 'hello world' %>

## Live Binding

How it works ...

It works by wrapping the 

problems ...

understanding closures ....


    <% for(var i =0; i < items.attr('length'); i++){ %>
      <li><%= items[i].attr('name') %></li>
    <% } %>


This does not work b/c when `items[i].attr('name')` is called again, `i` will 
not be the index of the item, but instead be items.length.

Using list provides a callback function with a reference to the item (it also binds on
length for you).


what's passed in becomes this and also accessed directly ...