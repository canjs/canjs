module("Class");

test("Creating", function(){
        
    jQuery.Class.extend("Animal",
    {
        count: 0,
        test : function(){
            return this.match ? true : false
        }
    },
    {
        init : function(){
            this.Class.count++;
            this.eyes = false;
        }
    }
    );
    Animal.extend("Dog",
    {
        match : /abc/
    },
    {
        init: function(){
            this._super();
        },
		talk : function(){
			return "Woof";
		}
    });
    Dog.extend("Ajax",
    {
        count : 0
    },
    {
        init : function(hairs){
            this._super();
            this.hairs = hairs;
            this.setEyes();
            
        },
        setEyes : function(){
            this.eyes = true;
        }
    });
    new Dog();
    new Animal();
    new Animal();
    ajax = new Ajax(1000);
        
    equals(2, Animal.count, "right number of animals");
    equals(1, Dog.count, "right number of animals")
    ok(Dog.match, "right number of animals")
    ok(!Animal.match, "right number of animals")
    ok(Dog.test(), "right number of animals")
    ok(!Animal.test(), "right number of animals")
    equals(1, Ajax.count, "right number of animals")
    equals(2, Animal.count, "right number of animals");
    equals(true, ajax.eyes, "right number of animals");
    equals(1000, ajax.hairs, "right number of animals");
})


test("new instance",function(){
    var d = Ajax.newInstance(6);
    equals(6, d.hairs);
})

test("Ad-Hoc Polymorphism", function(){
	
	Animal.extend("Human",
    {
        defaults : {
            COUNTRY : "US"    
        }
    },
    {
		talk: function(){
			return "Hello"
		}
	})
	
	$.Class.extend("Trainer",{
		init : function(){
			this.trained = new this.Class.TRAINING()
		},
		giveTreat : function(){
			return this.trained.talk();
		}
	})
	
	var DogTrainer = Trainer({TRAINING: Dog});
	equals( new DogTrainer().giveTreat(), "Woof","Dog Trainer gets Woof");
	DogTrainer.somethingStatic = 1;
	var HumanTrainer = Trainer({TRAINING: Human});
	HumanTrainer.somethingStatic = 2;
	var dog_trainer =  new DogTrainer();
	var human_trainer =  new HumanTrainer();

	equals( dog_trainer.giveTreat(), "Woof","Dog Trainer gets Woof");
	equals(human_trainer.giveTreat(),"Hello", "Human Trainer get Hello");
	
	equals( DogTrainer.somethingStatic, 1,"Dog Trainer gets Woof");
	equals(HumanTrainer.somethingStatic,2, "Human Trainer get Hello");
	
	//test defaults
    equals(Human.COUNTRY, "US", "Normal Default Set");
    equals(Human({COUNTRY: "Mexico"}).COUNTRY, "Mexico", "Got Mexico");
	
})