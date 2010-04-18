// provides very simple storage
// var store = new jQuery.Store();
// when its being extended, it should make a new simplestore
steal.plugins('jquery/model/store').then('init',function(){
if(typeof google == 'undefined'){
	//return jQuery.Store.Gears;
}else{
	var db = google.gears.factory.create('beta.database');
}




var typeConversions  = {
	'text' : 'text',
	'number' : 'int',
	'date' : 'int',
	'string' : 'text'
}
var makeTable = function(Class){
	var stmt = Class.underscoredName+" (", columns = []
	for(var attr in Class.attributes){
		columns.push( attr+" "+typeConversions[Class.attributes[attr]] )
	}
	columns.push("gearsStatus text")
	return stmt += columns.join(', ')+")"
}

var findOne = function(inst, func){
	db.close();
	db.open('model');
	var rs = db.execute('select * from '+inst.Class.underscoredName+ " WHERE id = "+inst.id);
	var res = rs.isValidRow();
	rs.close();
	return res;
}
var tableExists  = function(table){
	db.close();
	db.open('model');
	var rs = db.execute("SELECT name FROM sqlite_master WHERE name=?",[table]);
	var res = rs.isValidRow();
	rs.close();
	return res;
}
var insert = function(db, inst){
	//we need to check this isn't already here ...
	if(inst.id && findOne(inst)){
		console.log('skipping')
		return;
	}
	
	
	var stmt = "insert into "+inst.Class.underscoredName+ " values (", vals = [], attrs = inst.attrs(), first=[];
	for(var attr in inst.Class.attributes){
		vals.push( attrs[attr] );
		first.push("?")
	}
	vals.push(null);//for gearsStatus
	try{
		db.execute(stmt+first.join(', ')+",?)", vals)
	}catch(e){
		console.log(e.message)
	}
	
}
var getAttrs = function(rs){
	var count = rs.fieldCount(), attrs = [];
	for(var i=0; i < count;i++){
		attrs.push(rs.fieldName(i))
	}
	return attrs;
}, ignoreCreates = false;
/**
 * Provides simple storage for elements.  Replace this store with Gears!
 */
jQuery.Class.extend("jQuery.Store.Gears",
/* @prototype */
{
	/**
	 * 
	 * @param {Object} klass
	 */
    init: function(klass){
        if(typeof db == 'undefined'){
			return;
		}
		this.storingClass = klass;
		this.created = false;
		
		//overwrite findAll
		var oldFind = klass.findAll;
		klass.findAll = function(params, success, error){
			if(navigator.onLine){
				oldFind.apply(this, arguments)
			}else{
				//do this other thing
				var result = []
				ignoreCreates = true;
				db.close();
				db.open('model');
				var rs = db.execute('select * from '+this.underscoredName);
				var attrNames = getAttrs(rs)
				while (rs.isValidRow()) {
				  var attrs = {};
				  $.each(attrNames, function(){
				  		if(String(this) != 'gearsStatus')
							attrs[String(this)] = rs.fieldByName(String(this))
				  })
				  rs.next();
				  if(rs.fieldByName("gearsStatus") != 'destroy')
				  	result.push(new this(attrs))
				}
				ignoreCreates = false;
				success(result)
			}
		}
		
		//change delete
		var oldDestroy = klass.destroy
		klass.destroy = function(id, success, error){
			if (navigator.onLine) {
				oldDestroy.apply(this, arguments)
			}
			else {
				db.close();
				db.open('model');
				db.execute('update '+this.underscoredName+ " SET gearsStatus = ? WHERE id = ?", ['destroy' ,id]);
				if(db.rowsAffected > 0){
					success()
				}else{
					error();
				}
			}
		}
		if(!navigator.onLine) return;
		//lets check if there are changes
		if(!tableExists(this.storingClass.underscoredName)){
			return;
		}
		
		db.close();
		db.open('model');
		var rs = db.execute('select * from '+this.storingClass.underscoredName+" WHERE gearsStatus is NOT NULL");
		if(rs.isValidRow()){
			if(!confirm('apply changes while you were offline?'))
				return;
		}		
		while (rs.isValidRow()) {
			var stat = rs.fieldByName('gearsStatus');
			if(stat == 'destroy'){
				this.storingClass.destroy(rs.fieldByName('id'), function(){})
			}
			rs.next();
		
		}
		rs.close();
		db.close();
	},
	/**
	 * 
	 * @param {Object} id
	 */
    findOne: function(id){
        var rs = db.execute('select * from '+this.storingClass.underscoredName+" WHERE id = ?",[id]);
		var attrNames = getAttrs(rs)
		while (rs.isValidRow()) {
			var attrs = {};
			$.each(attrNames, function(){
				if (String(this) != 'gearsStatus') 
					attrs[String(this)] = rs.fieldByName(String(this))
			})
			rs.close();
			ignoreCreates = true;
			var thing = new this.storingClass(attrs);
			ignoreCreates = false;
			return thing;
		}
		return null;
	},
	/**
	 * 
	 * @param {Object} obj
	 */
    create: function(obj){
		if(ignoreCreates) return;
		if(!this.created){
			db.close();
			db.open('model');
			if(navigator.onLine)
				db.execute("drop table if exists "+ obj.Class.underscoredName)
			db.execute('create table if not exists '+makeTable(obj.Class));
			this.created = true;
		}
		//console.log(obj.attrs())
		insert(db, obj)
		//db.execute('insert into Test values (?, ?)', ['Monkey!', new Date().getTime()]);
		//var id = obj[obj.Class.id];
		//this._data[id] = obj;
	},
	/**
	 * 
	 * @param {Object} id
	 */
    destroy: function(id){
		
	},
    /**
     * Finds instances using a test function.  If no test function is provided returns all instances.
     * @param {Function} f
     * @return {Array}
     */
    find : function(f){
        var instances = [];
        for(var id in this._data){
            var inst = this._data[id];
            if(!f || f(inst))
                instances.push(inst);
        }
        return instances;
    },
    /**
     * Clears instances
     */
    clear : function(){
        this._data = {};
    },
    /**
     * Returns if there is no instances
     * @return {Boolean}
     */
    isEmpty: function() {
		return !this.find().length;
	}
});
});