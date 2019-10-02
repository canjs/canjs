import { ObservableObject, QueryLogic, connect } from "//unpkg.com/can@pre/core.mjs";

class Todo extends ObservableObject {
  static props = {
    id: {
      identity: true,
      type: Number
    },
    userId: Number,
    title: String,
    completed: Boolean,
    lastAccessedDate: String,
  }
}

// a behavior that extends the `getData` method of the `Data Interface`, to add
// logging whenever a single instance is loaded
const loggingBehavior = connect.behavior(
	'data-logging',
	(previousPrototype) => {
		return {
			getData(query) {
				return previousPrototype.getData(query).then((data) => {
					console.log(
						`Successfully fetched ${this.Map.shortName} ${this.id(data)} data from server.`
					);
					return data;
				});
			}
		};
	}
);

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/{id}',
	queryLogic: new QueryLogic(Todo),
	ObjectType: Todo,
};

const connection = connect.constructor(loggingBehavior(connect.dataUrl(connect.base(
	connectionOptions
))));
connection.init();

connection.get({id: 5}).then((instance) => {
	document.body.innerText = JSON.stringify(instance, null, 4);
});
