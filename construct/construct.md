@class can.Construct
@parent index

can.Construct provides easy prototypal inheritance for JavaScript.    It creates
constructor functions that can be used with the __new__ keyword. It 
is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Constructor]
Inheritance library. 

## Creating Constructor Functions

To create a constructor function, 
call `can.Construct( [ NAME, classProperties, ] instanceProperties )`. 

    var Animal = can.Construct({
      breathe : function(){
         console.log('breathe'); 
      }
    });

`Animal` is a constructor function and instances of Animal have a `breathe()` method. We 
can create a `new Animal` object and call `breathe()` on it like:

    var man = new Animal();
    man.breathe();
    man instanceof Animal //-> true

If you want to create a sub-class (a constructor function that inherits properties from a base constructor function), call the the 
base constructor function with the new constructor function's properties:

    Dog = Animal({
      wag : function(){
        console.log('wag');
      }
    })

    var dog = new Dog;
    dog.wag();
    dog.breathe();

## Instantiation

When a new class instance is created, it calls the class's <code>init</code> method with the arguments passed to the constructor function:

    $.Class('Person',{
      init : function(name){
        this.name = name;
      },
      speak : function(){
        return "I am "+this.name+".";
      }
    });
    
    var payal = new Person("Payal");
    assertEqual( payal.speak() ,  'I am Payal.' );

## Calling base methods

Call base methods with <code>this._super</code>.  The following overwrites person
to provide a more 'classy' greating:

    Person("ClassyPerson", {
      speak : function(){
        return "Salutations, "+this._super();
      }
    });
    
    var fancypants = new ClassyPerson("Mr. Fancy");
    assertEquals( fancypants.speak() , 'Salutations, I am Mr. Fancy.')

### Proxies

Class's callback method returns a function that has 'this' set appropriately (similar to [$.proxy](http://api.jquery.com/jQuery.proxy/)).  The following creates a clicky class that counts how many times it was clicked:

    $.Class("Clicky",{
      init : function(){
        this.clickCount = 0;
      },
      clicked: function(){
        this.clickCount++;
      },
      listen: function(el){
        el.click( this.callback('clicked') );
      }
    })
    
    var clicky = new Clicky();
    clicky.listen( $('#foo') );
    clicky.listen( $('#bar') ) ;

## Static Inheritance 

Class lets you define inheritable static properties and methods.  The following allows us to retrieve a person instance from the server by calling <code>Person.findOne(ID, success(person) )</code>.  Success is called back with an instance of Person, which has the <code>speak</code> method.

    $.Class("Person",{
      findOne : function(id, success){
        $.get('/person/'+id, function(attrs){
          success( new Person( attrs ) );
        },'json')
      }
    },{
      init : function(attrs){
        $.extend(this, attrs)
      },
      speak : function(){
        return "I am "+this.name+".";
      }
    })

    Person.findOne(5, function(person){
      assertEqual( person.speak(), "I am Payal." );
    })

## Introspection

Class provides namespacing and access to the name of the class and namespace object:

    $.Class("Jupiter.Person");

    Jupiter.Person.shortName; //-> 'Person'
    Jupiter.Person.fullName;  //-> 'Jupiter.Person'
    Jupiter.Person.namespace; //-> Jupiter
    
    var person = new Jupiter.Person();
    
    person.Class.shortName; //-> 'Person'

## Model example

Putting it all together, we can make a basic ORM-style model layer.  Just by inheriting from Model, we can request data from REST services and get it back wrapped in instances of the inheriting Model.

    $.Class("Model",{
      findOne : function(id, success){
        $.get('/'+this.fullName.toLowerCase()+'/'+id, 
          this.callback(function(attrs){
             success( new this( attrs ) );
          })
        },'json')
      }
    },{
      init : function(attrs){
        $.extend(this, attrs)
      }
    })

    Model("Person",{
      speak : function(){
        return "I am "+this.name+".";
      }
    });

    Person.findOne(5, function(person){
      alert( person.speak() );
    });

    Model("Task")

    Task.findOne(7,function(task){
      alert(task.name);
    })
    

This is similar to how JavaScriptMVC's model layer works. Please continue to [mvc.model Model].