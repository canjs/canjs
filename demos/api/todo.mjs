import { ObservableObject, ObservableArray, type } from "//unpkg.com/can@6/core.mjs";

// -------------------------------
// Define an observable Todo type:
// -------------------------------
class Todo extends ObservableObject {
	static props = {
		// `id` is a Number, null, or undefined and
		// uniquely identifies instances of this type.
		id: { type: type.maybe(Number), identity: true },

		// `complete` is a Boolean, null or undefined
		// and defaults to `false`.
		complete: { type: type.maybe(Boolean), default: false },

		// `dueDate` is a Date, null or undefined.
		dueDate: type.maybe(Date),

		// `isDueWithin24Hours` property returns if the `.dueDate`
		// is in the next 24 hrs. This is a computed property.
		get isDueWithin24Hours(){
			let msLeft = this.dueDate - new Date();
			return msLeft >= 0 && msLeft <= 24 * 60 * 60 * 1000;
		},

		// `name` is a String, null or undefined.
		name: type.maybe(String),

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
			type: {
				first: "string",
				last: "string"
			}
		},

		// `tags` is an observable array of items that
		// defaults to including "new"
		tags: {
			get default() {
				return new ObservableArray(["new"]);
			}
		}
	};

	toggleComplete() {
		this.complete != this.complete;
	}
}

export default Todo;
