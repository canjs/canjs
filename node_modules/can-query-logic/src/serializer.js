var canReflect = require("can-reflect");

var Serializer = function(entries){
	var serializers = this.serializers = new Map();
	if (entries) {
		entries.forEach(function(entry) {
			var key = entry[0], value = entry[1];
			serializers.set(key, value);
		});
	}
    this.serialize = this.serialize.bind(this);
};
Serializer.prototype.add = function(serializers){
    canReflect.assign( this.serializers, serializers instanceof Serializer ? serializers.serializers : serializers );
};


Serializer.prototype.serialize = function(item) {
    if(!item) {
        return item;
    }
    var Type = item.constructor;
    var serializer = this.serializers.get(Type);
    if(!serializer) {
        return canReflect.serialize(item);
    } else {
        return serializer(item, this.serialize);
    }
};

module.exports = Serializer;
