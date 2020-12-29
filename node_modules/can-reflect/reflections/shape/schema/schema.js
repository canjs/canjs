"use strict";
var canSymbol = require("can-symbol");
var typeReflections = require("../../type/type");
var getSetReflections = require("../../get-set/get-set");
var shapeReflections = require("../shape");

var getSchemaSymbol = canSymbol.for("can.getSchema"),
    isMemberSymbol = canSymbol.for("can.isMember"),
    newSymbol = canSymbol.for("can.new");

function comparator(a, b) {
    return a.localeCompare(b);
}

function sort(obj) {
    if(typeReflections.isPrimitive(obj) || obj instanceof Date) {
        return obj;
    }
    var out;
    if (typeReflections.isListLike(obj)) {
        out = [];
        shapeReflections.eachKey(obj, function(item){
            out.push(sort(item));
        });
        return out;
    }
    if( typeReflections.isMapLike(obj) ) {

        out = {};

        shapeReflections.getOwnKeys(obj).sort(comparator).forEach(function (key) {
            out[key] = sort( getSetReflections.getKeyValue(obj, key) );
        });

        return out;
    }


    return obj;
}

function isPrimitiveConverter(Type){
    return Type === Number || Type === String || Type === Boolean;
}

var schemaReflections =  {
    /**
	 * @function can-reflect.getSchema getSchema
	 * @parent can-reflect/shape
	 * @description Returns the schema for a type or value.
	 *
	 * @signature `getSchema(valueOrType)`
	 *
     * Calls the `@can.getSchema` property on the `valueOrType` argument. If it's not available and
     * `valueOrType` has a `constructor` property, calls the `constructor[@can.getSchema]`
     * and returns the result.
     *
     * ```js
     * import canReflect from "can-reflect";
     *
     * var Type = DefineMap.extend({
     *   name: "string",
     *   id: "number"
     * });
     *
     * canReflect.getSchema( Type ) //-> {
     * //   type: "map",
     * //   keys: {
     * //     name: MaybeString
     * //     id: MaybeNumber
     * //   }
     * // }
     * ```
	 *
	 *
	 * @param  {Object|Function} valueOrType A value, constructor function, or class to get the schema from.
	 * @return {Object} A schema. A schema for a [can-reflect.isMapLike] looks like:
     *
     *
     * ```js
     * {
     *   type: "map",
     *   identity: ["id"],
     *   keys: {
     *     id: Number,
     *     name: String,
     *     complete: Boolean,
     *     owner: User
     *   }
     * }
     * ```
     *
     * A schema for a list looks like:
     *
     * ```js
     * {
     *   type: "list",
     *   values: String
     *   keys: {
     *     count: Number
     *   }
     * }
     * ```
     *
	 */
    getSchema: function(type){
        if (type === undefined) {
            return undefined;
        }
        var getSchema = type[getSchemaSymbol];
        if(getSchema === undefined ) {
            type = type.constructor;
            getSchema = type && type[getSchemaSymbol];
        }
        return getSchema !== undefined ? getSchema.call(type) : undefined;
    },
    /**
	 * @function can-reflect.getIdentity getIdentity
	 * @parent can-reflect/shape
	 * @description Get a unique primitive representing an object.
	 *
	 * @signature `getIdentity( object [,schema] )`
	 *
	 * This uses the object's schema, or the provided schema to return a unique string or number that
     * represents the object.
     *
     * ```js
     * import canReflect from "can-reflect";
     *
     * canReflect.getIdentity({id: 5}, {identity: ["id"]}) //-> 5
     * ```
     *
     * If the schema has multiple identity keys, the identity keys and values
     * are return stringified (and sorted):
     *
     * ```js
     * canReflect.getIdentity(
     *   {z: "Z", a: "A", foo: "bar"},
     *   {identity: ["a","b"]}) //-> '{"a":"A","b":"B"}'
     * ```
	 *
	 * @param  {Object|Function} object A map-like object.
     * @param {Object} [schema] A schema object with an `identity` array of the unique
     * keys of the object like:
     *   ```js
     *   {identity: ["id"]}
     *   ```
	 * @return {Number|String} A value that uniquely represents the object.
	 */
    getIdentity: function(value, schema){
        schema = schema || schemaReflections.getSchema(value);
        if(schema === undefined) {
            throw new Error("can-reflect.getIdentity - Unable to find a schema for the given value.");
        }

        var identity = schema.identity;
        if(!identity || identity.length === 0) {
            throw new Error("can-reflect.getIdentity - Provided schema lacks an identity property.");
        } else if(identity.length === 1) {
            return getSetReflections.getKeyValue(value, identity[0]);
        } else {
            var id = {};
            identity.forEach(function(key){
                id[key] = getSetReflections.getKeyValue(value, key);
            });
            return JSON.stringify(schemaReflections.cloneKeySort(id));
        }
    },
    /**
	 * @function can-reflect.cloneKeySort cloneKeySort
	 * @parent can-reflect/shape
	 * @description Copy a value while sorting its keys.
	 *
	 * @signature `cloneKeySort(value)`
	 *
     * `cloneKeySort` returns a copy of `value` with its [can-reflect.isMapLike]
     * key values sorted. If you just want a copy of a value,
     * use [can-reflect.serialize].
     *
     * ```js
     * import canRefect from "can-reflect";
     *
     * canReflect.cloneKeySort({z: "Z", a: "A"}) //-> {a:"A",z:"Z"}
     * ```
     *
     * Nested objects are also sorted.
	 *
     * This is useful if you need to store a representation of an object that can be used as a
     * key.
	 *
	 * @param  {Object} value An object or array.
	 * @return {Object} A copy of the object with its keys sorted.
	 */
    cloneKeySort: function(obj) {
        return sort(obj);
    },
    /**
	 * @function can-reflect.convert convert
	 * @parent can-reflect/shape
	 * @description Convert one value to another type.
	 *
	 * @signature `convert(value, Type)`
	 *
     * `convert` attempts to convert `value` to the type specified by `Type`.
     *
     * ```js
     * import canRefect from "can-reflect";
     *
     * canReflect.convert("1", Number) //-> 1
     * ```
     *
     * `convert` works by performing the following logic:
     *
     * 1. If the `Type` is a primitive like `Number`, `String`, `Boolean`, the
     *    `value` will be passed to the `Type` function and the result returned.
     *    ```js
     *    return Type(value);
     *    ```
     * 2. The value will be checked if it is already an instance of the type
     *    by performing the following:
     *    1. If the `Type` has a `can.isMember` symbol value, that value will be used
     *       to determine if the `value` is already an instance.
     *    2. If the `Type` is a [can-reflect.isConstructorLike] function, `instanceof Type`
     *       will be used to check if `value` is already an instance.
     * 3. If `value` is already an instance, `value` will be returned.
     * 4. If `Type` has a `can.new` symbol, `value` will be passed to it and the result
     *    returned.
     * 5. If `Type` is a [can-reflect.isConstructorLike] function, `new Type(value)` will be
     *    called the the result returned.
     * 6. If `Type` is a regular function, `Type(value)` will be called and the result returned.
     * 7. If a value hasn't been returned, an error is thrown.
	 *
	 * @param  {Object|Primitive} value A value to be converted.
     * @param  {Object|Function} Type A constructor function or an object that implements the
     * necessary symbols.
	 * @return {Object} The `value` converted to a member of `Type`.
	 */
    convert: function(value, Type){
        if(isPrimitiveConverter(Type)) {
            return Type(value);
        }
        // check if value is already a member
        var isMemberTest = Type[isMemberSymbol],
            isMember = false,
            type = typeof Type,
            createNew = Type[newSymbol];
        if(isMemberTest !== undefined) {
            isMember = isMemberTest.call(Type, value);
        } else if(type === "function") {
            if(typeReflections.isConstructorLike(Type)) {
                isMember = (value instanceof Type);
            }
        }
        if(isMember) {
            return value;
        }
        if(createNew !== undefined) {
            return createNew.call(Type, value);
        } else if(type === "function") {
            if(typeReflections.isConstructorLike(Type)) {
                return new Type(value);
            } else {
                // call it like a normal function
                return Type(value);
            }
        } else {
            throw new Error("can-reflect: Can not convert values into type. Type must provide `can.new` symbol.");
        }
    }
};
module.exports = schemaReflections;
