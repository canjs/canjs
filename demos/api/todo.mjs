import {DefineMap} from "//unpkg.com/can@5/core.mjs";

// -------------------------------
// Define an observable Todo type:
// -------------------------------
const Todo = DefineMap.extend("Todo",{

    // `id` is a Number, null, or undefined and
    // uniquely identifies instances of this type.
    id: { type: "number", identity: true },

    // `complete` is a Boolean, null or undefined
    // and defaults to `true`.
    complete: { type: "boolean", default: false },

    // `dueDate` is a Date, null or undefined.
    dueDate: "date",

    // `isDueWithin24Hours` property returns if the `.dueDate`
    // is in the next 24 hrs. This is a computed property.
    get isDueWithin24Hours(){
        let msLeft = this.dueDate - new Date();
        return msLeft >= 0 && msLeft <= 24 * 60 * 60 * 1000;
    },

    // `name` is a String, null or undefined.
    name: "string",
    // `nameChangeCount` increments when `name` changes.
    nameChangeCount: {
        value({listenTo, resolve}) {
            let count = resolve(0);
            listenTo("name", ()=> {
                resolve(++count);
            })
        }
    },
	// `owner` is a custom DefineMap with a first and
	// last property.
    owner: {
        Type: {
            first: "string",
            last: "string"
        }
    },
	// `tags` is an observable list of items that
	// defaults to including "new"
	tags: {
		default(){
			return ["new"]
		}
	},
    // `toggleComplete` is a method
    toggleComplete(){
        this.complete != this.complete;
    }
});

export default Todo;
