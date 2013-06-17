steal("can/observe", function(can) {

  /**
   * @class can.Observe.Clone
   * @extends can.Observe (and all subclasses)
   *
   * Create a copy of an observable that holds a reference
   * to the original, allowing the properties of the copy
   * to be merged back to the original later.
   *
   * Clones cook, look, and taste like their original objects
   */
  var Observe = can.Observe
  , oldsetup = can.Observe.setup
  , makeClone = function(obs) {
    
    //Don't make clones all the way down.
    //  A clone's clone class is itself.
    if(obs.isClone)
      return obs;

    return obs({
     
    }, {
      setup : function(opts) {
        var that = this;
        Observe.prototype.setup.apply(this);
        can.extend(this, {
          _deep : opts.deep
          , _original : opts.original
          , _dirty : {}
          , isClone : true      
        });

        opts.original.each(function(val, key) {
          if(opts.deep && val instanceof Observe && !val._original) {
            that.attr(key, val.clone());
          } else {
            that.attr(key, val);
          }
        });
        this._dirty = {}; //reset dirty after we touched everything
      }

      , merge : function() {
        var that = this
        , orig = this._original;
        this.each(function(val, key) {
        	var newVal = that[key];
	        if(that._deep && newVal.isClone &&) {
	          newVal = newVal.merge();
	        }
          orig.attr(key, that[key]);
          delete that[key];
          delete that._dirty[key];
	      });
	      delete this._original;
	      return orig;
      }

      // set dirty for any attributes
      , attr : function(name, value) {
      	if(arguments.length > 1 && typeof name !== "object") {
      		this._dirty[name] = true;
      	}
      	this._super.apply(this, arguments);
      }
    });
  };

  Observe.Clone = makeClone(Observe);

  Observe.setup = function(){
    oldsetup.apply(this, arguments);
    this.Clone = makeClone(this);

    if(this.prototype instanceof can.Model) {
    	//don't want to have a collision in the Model store, so rename
    	// the id field.
    	this.Clone.id = "original_" + this.id;
    	this.Clone.prototype.save = function() {
    		return this._original.save.apply(this, arguments).then(function(nv) {
    			return nv.merge();
    		});
    	};
    	//overriding serialize allows save to function with the renamed id field
    	this.Clone.prototype.serialize = function() {
    		var serial = this._original.serialize.apply(this, arguments);
    		serial[this._original.constructor.id] = serial[this.constructor.id];
    		delete serial[this.constructor.id];
    		return serial;
    	}
    }
  }
  /**
    @function clone

    Create a clone instance of the current object, constructed
    by the class's Clone member constructor

    @param deep true to make Clones of all sub-observables.
   */
  Observe.prototype.clone = function(deep) {
    return new this.constructor.Clone({original : this, deep : !!deep});
  }

  return Observe;

});