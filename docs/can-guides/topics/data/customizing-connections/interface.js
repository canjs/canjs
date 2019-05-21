import { connect } from "//unpkg.com/can@5/core.mjs";

// two behaviors that implement the `getListData` method of the `Data Interface`

const xhrData = connect.behavior('xhr-data', (previousPrototype) => {
	return {
		getListData() {
			return new Promise((resolve, reject) => {
				const request = new XMLHttpRequest();
				request.addEventListener("load", function() { 
					resolve(JSON.parse(this.responseText));
				});
				request.open("GET", this.url);
				request.send();
			});
		}
		// ... an actual DataInterface implementation would also implement: 
		//     getData, createData, updateData, destroyData
	};
});

const fetchData = connect.behavior(
	'fetch-data', 
	(previousPrototype) => {
		return {
			getListData() {
				return fetch(this.url).then(response => response.json());
			}
			// ... an actual DataInterface implementation would also implement:
			//     getData, createData, updateData, destroyData
		};
	}
);

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/',
};

const xhrConn = xhrData(connectionOptions);
const fetchConn = fetchData(connectionOptions);

xhrConn.getListData().then(data => 
	console.log(`Used XHR to load ${data.length} todos.`)
);
fetchConn.getListData().then(data => 
	console.log(`Used fetch to load ${data.length} todos.`)
);
