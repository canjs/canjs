@class can.view
@parent index



Render tempaltes into a documentFragement.  A platform for retrieving those fragements
and inserting them into the dom.

Live binding ....

    can.view("//path/to/template",{data}) //-> documentFragement
    
EJS + Observe

EJS knows when you read an observe property with the attr method.  It then sets
itself up to replace the content anytime the EJS file is rendered.

Examples:

INPUT VALUE

template:

    John is <input value='<%= person.attr('age') %>'/> years old
    
    john = new can.Observe({age: 29})
    form.appendChild( can.view('person.ejs', {person: john}) )

Escaped HTML

template:

	<div>My favorite HTML tag is: <%= favorites.attr('tag')%></div>
    
    favorites = new can.Observe({tag: "<div>"})
    favs.appendChild( can.view('favs.ejs', {favorites: favorites}) )

Unescaped HTML

	<div>My favorite HTML tag shows up like: <%== favorites.attr('tag')%></div>
    
    favorites = new can.Observe({tag: "<b>this</b>"})
    favs.appendChild( can.view('favs.ejs', {favorites: favorites}) )

Tag properties

	<input type='checkbox' <%= task.attr('complete') ? 'checked' : "" %>/>
    
    favorites = new can.Observe({tag: "<b>this</b>"})
    favs.appendChild( can.view('favs.ejs', {favorites: favorites}) )

Conditional Blocks

	if() {
	
	} else {
	
	}


Iterative Blocks

	// make sure your block listens on length, but the block 
	part can be re-called

	problem example
	
	<% for(var i =0 ; i < todos.attr('length'); i++) { %>
	  <li class='<%= todos[i].attr('completed') ? 'complete' : '' %>'> .... </li>
	<% } %>
	
This does not work if a todo's completed attr is updated because i will not be the index
of the todo when "todos[i].attr('completed') ? 'complete' : ''" is reevaluated.

To fix this, make sure each iteration of the block gets a referece to the instance it's working on.
EJS has a list helper method that does just this.
