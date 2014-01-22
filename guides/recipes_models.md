@page RecipesModels Models
@parent Recipes 3

@body
The following recipes show how to use `can.Model` (and often the `can.fixture` plugin).

### Showing the same data in 2 places

The following recipe shows how `can.Model`'s internal store and `can.view`'s live-binding
can easily solve the editing-data-that-is-represented-two-places problem.  It 
shows two task lists of overlaping data.  Notice how the __"do dishes"__ is listed 
twice. But if you click one "do dishes" checkbox, it updates the other.

<iframe style="width: 100%; height: 300px"
        src="http://jsfiddle.net/donejs/SnRKV/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>


#### How it works

The code first sets up a `can.fixture` to return different, but overlapping lists of 
tasks from the server.  The fixture returns data from the following calls:

 - `/tasks?due=today`
 - `/tasks?type=critical`

You'll notice "do dishes" in both lists.

The code then creates a `Task` model that maps findAll to `/tasks`.  It then uses
`can.view` to render the retrieved tasks with the `tasksEJS` template. 

Finally, it listens when an `input` element's value changes.  When it does,
it gets the task model instance from the `li` element's `$.data` and 
updates it's "complete" property.

___The Secret Sauce___

Model keeps an internal, non-leaking, store of instances your app loads.  When
`Task.findAll({type: "critical"})` and `Task.findAll({due: "today"})` get their
raw JSON data from the server, they convert it to instances.  But before they create
a new instance, they check if the same instance, matched by 
the [id](../docs/can.Model.id.html) property already exists.  If it
does, it uses that instance. 

This means that the `criticalTasks` list and `todaysTasks` list both point to the 
same instance. When `can.EJS` does it's live binding on `<%= task.attr("complete") ? "checked" : "" %>`
it's actually binding on the same "do dishes" intance once.  So updating "do dishes" updates
the DOM in two places!

### Caching Data in Local Storage

The following recipe shows how `can.Model` can be used to create an ORM-like 
model layer for keeping a local copy of a restful API. This type of base model
is perfect for situations where you want a responsive UI, but may not want to 
wait for updates from the server before displaying data, or you need to make 
your data persist offline. Storing your responses in `localStorage` allows you 
to get data to the view as quickly as possible.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/ZhScj/embedded/result%2Cjs/" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

#### How it works

When creating your base model for other models to extend from, you can prefix 
static service methods with `make`, to allow the base model to define how the 
extending model's method will behave. In this example, our base model implements
a static method called `makeFindOne`. This method acts as a hook to define the 
extending model's `findOne` method. Using this, we can create a middleware-like
layer between the extending model and the base model that loads and saves model
data to `localStorage`, while still requesting out to the restful API to get 
updates.

___The Secret Sauce___

The secret sauce for this example is the static `makeFindOne` method along with
EJS's live binding. Because the live binding will automatically update the view when the 
bound model gets updated, we can write our code as usual and allow the base model
to deliver `localStorage` data instantly, while automatically upating with responses
from the server, with no extra effort.

### Real Time Chat 

Type a message in one page, it instantly shows up in the other.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/fbasrawala/yRMSa/embedded/result%2Cjs/" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/fbasrawala/yRMSa/embedded/result%2Cjs/" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

[How it works](http://bitovi.com/blog/2013/02/weekly-widget-chat.html)