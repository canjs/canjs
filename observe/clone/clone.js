steal("can/util", "can/observe", "can/construct/super", function(can) {

  /**
   * @class can.Observe.Clone
   * @extends can.Observe (and all subclasses)
   *
   * Create a copy of an observable that holds a reference
   * to the original, allowing the properties of the copy
   * to be merged back to the original later.
   *
   * Clones cook, look, and taste like their original objects
   * but can have their attributes set independently for later
   * merging back into the original object.
   */
  var Observe = can.Observe
  , oldsetup = can.Observe.setup
  , makeClone = function(obs) {
    
    //Don't make clones all the way down.
    //  A clone's clone class is itself.
    if(obs.prototype.merge)
      return obs;

    return obs({
     
    }, {
      setup : function(opts) {
        var that = this
        , orig = opts.original;
        Observe.prototype.setup.apply(this);
        can.extend(this, {
          _deep : opts.deep
          , _original : opts.original
          , _dirty : {}
          , isClone : true 
        });

        orig.each(function(val, key) {
          if(opts.deep && val instanceof Observe && !val._original) {
            that.attr(key, val.clone());
          } else if(orig instanceof can.Model && key === orig.constructor.id) {
          	that.attr(that.constructor.id, val);
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
	        if(that._deep && newVal.isClone) {
	          newVal = newVal.merge();
	        }
        	if(that._dirty[key]) {
	          orig.attr(key, newVal);
	        }
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
      	return this._super.apply(this, arguments);
      }
    });
  };

  Observe.Clone = makeClone(Observe);

  Observe.setup = function(){
    oldsetup.apply(this, arguments);
    this.Clone = makeClone(this);

    if(can.Model && this.prototype instanceof can.Model) {
    	//don't want to have a collision in the Model store, so rename
    	// the id field.
    	this.Clone.id = "original_" + this.id;
    	this.Clone.prototype.save = function() {
    		var that = this;
    		return this._original.save.apply(this, arguments).then(function(nv) {
    			return that.merge().attr(nv._data ? nv._data : nv);
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