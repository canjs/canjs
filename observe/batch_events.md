@page can.Observe.batchEvents Batch Events
@parent can.Observe

`can.Observe.startBatch( batchStopHandler )` and
`can.Observe.stopBatch( force, callStart )`
are used to specify atomic operations. `startBatch`
prevents change events from being fired until `stopBatch` is called.

The following listens to changes on a `player`:

	var player = new can.Observe({
      tvshow: "The Simpsons"
    });
    
    player.bind("change",function(ev, attr, how, newVal, oldVal){
      console.log("changed", attr );
    });
    
The "change" callback handler does not get called until
after `tvshow` is removed, `song` is added, and `stopBatch` 
is called.
    
    can.Observe.startBatch();
    
    player.removeAttr("tvshow");
    player.attr("song","What makes you beautiful");
    
    can.Observe.stopBatch();

Performance and correctness are the two most common reasons
to use batch operations.

## Correctness

Sometimes, an object can be temporarily in an invalid 
state. For example, the previous `player` should have 
a `tvshow` or `song` property, but not both. Event listeners should 
never be called in an intermediate state.  We can make this happen 
with `startBatch`, `stopBatch` and
the `can/observe/setter` plugin as follows:

    // Selection constructor function inherits from Observe
    Player = can.Observe({
    
      // called when setting tvshow
      setTvshow: function(newVal, success){
        can.Observe.startBatch();
        this.removeAttr("song")
        success(newVal);
        can.Observe.stopBatch();
      },
      // called when setting song
      setSong: function(newVal, success){
        can.Observe.startBatch();
        this.removeAttr("tvshow")
        success(newVal);
        can.Observe.stopBatch();
      }
    });

    // a new selection instance
    var player =   new Player({song: "Amish Paradise"});

    player.bind("change", function( ev, attr, how, newVal, oldVal ){
      console.log("changed", attr, how, s.attr() );
    });
 
    console.log("start")
    s.attr("tvshow","Breaking Bad");
    console.log("end")

Use `statBatch` and `stopBatch` to make sure events 
are triggered when an observe is in a valid state. 

## Performance

CanJS synchronously sends events when a property changes.
This makes certain patterns easier. For example, if you 
are doing live-binding, and change a property, the DOM is 
immediately updated.

Occasionally, you may find yourself changing many properties at once. To 
prevent live-binding from performing unnecessary updates, 
write the property updates within a `startBatch`/`stopBatch`.

Consider a list of items like:

    var items = new Items([
      {selected: false},
      {selected: true},
      {selected: false}
    ])

And a template that renders the number of selected items:

    var template = can.view.mustache("{{count}}")

	$("#itemCount").html(template({
	  count: function(){
	      var count = 0;
	      items.each(function(item){
	        count += item.attr('selected') ? 1 : 0
	      })
	      return count
	   }
	}))

The following updates the DOM once per click:

    $("#selectAll").click(function(){
        can.Observe.startBatch()
        items.each(function(item){
          item.attr('selected', true)
        })
        can.Observe.stopBatch()
    })

## batchNum

All events created within a `startBatch` / `stopBatch` share the same batchNum value. To 
respond only once for a given batchNum, you can do it like:

    var batchNum;
    obs.bind("change", function( ev, attr, how, newVal, oldVal ){
     if( !ev.batchNum || ev.batchNum !== batchNum ) {
       batchNum = ev.batchNum;
       // do your code here!
     }
    });

## Automatic Batching

Libraries like Angular and Ember always batch 
operations. Set this up with:

    can.Observe.startBatch();
    setTimeout(function(){
      can.Observe.stopBatch(true, true);
      setTimeout(arguments.callee, 10)
    },10);

This batches everything that happens within the same thread of execution
and/or within 10 ms of ech other. 
