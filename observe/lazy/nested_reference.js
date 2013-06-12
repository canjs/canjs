steal('can/util',function(can){
	
	
	var pathIterator = function(root, propPath, callback){
		var props = propPath.split("."),
			cur = root,
			part;
		while(part = props.shift()){
			cur = cur[part]
			callback && callback(cur,part)
		}
		return cur;
	}
	
	
	var NestedReference = function(root){
		this.root = root;
		this.references = [];
	}
	
	var ArrIndex = function(array){
		this.array = array;
	}
	ArrIndex.prototype.toString = function(){
		return ""+can.inArray(this.item, this.array)
	}
	
	NestedReference.ArrIndex = ArrIndex;
	
	can.extend(NestedReference.prototype, {
		make: function(propPath){
			
			// [ {array: data, item: data[1]},
			//   "items",
			//   {array: data[1].items, item: data[1].items[1]} ]
			var path = [],
				arrIndex;
			
			if(can.isArray(this.root) || this.root instanceof can.LazyList){
				arrIndex = new ArrIndex(this.root);
			}
			
			pathIterator(this.root, propPath, function(item, prop){
				
				
				if(arrIndex){
					arrIndex.item = item;
					path.push(arrIndex);
					arrIndex = undefined;
				} else {
					
					path.push(prop);
					
					if(can.isArray(item)){
						arrIndex = new ArrIndex(item)
					}
				}
				
			});
			
			
			var pathFunc = function(){
				return path.join(".")
			}
			this.references.push(pathFunc)

			return pathFunc;
		},
		removeChildren: function(path, callback){
			var i =0; 
			while(i < this.references.length){
				var reference = this.references[i]()
				if(reference.indexOf(path) === 0){
					callback(this.get(reference), reference);
					this.references.splice(i, 1)
				} else {
					i++;
				}
			}
		},
		get: function(path){
			return pathIterator(this.root, path)
		},
		each: function(cb){
			var self = this;
			can.each(this.references, function(ref){
				var path = ref();
				cb(self.get(path), ref, path)
			})
		}
		
	});
	
	can.NestedReference = NestedReference;
	
})
