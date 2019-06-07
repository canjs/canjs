import { connect } from "//unpkg.com/can@5/core.mjs";

// a behavior that implements the `getListData` method of the `Data Interface`
const fetchData = connect.behavior(
	'fetch-data',
	(previousPrototype) => {
		return {
			getListData() {
				return fetch(this.url).then(response => response.json());
			}
			// ... a complete Data Interface implementation would also implement:
			//     getData, createData, updateData, destroyData
		};
	}
);

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/',
};

const fetchConn = fetchData(connectionOptions);

fetchConn.getListData({}).then(data => 
	console.log(`Used fetch to load ${data.length} todos.`)
);
