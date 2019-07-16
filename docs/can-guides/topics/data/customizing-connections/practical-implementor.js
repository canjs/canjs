import { connect, key } from "//unpkg.com/can@5/core.mjs";

function _getRequestURLAndMethod(connUrl, requestName, params) {
	let url = null;
	let method = null;

	if (connUrl[requestName]) {
		[method, url] = connUrl[requestName].split(/ (.+)/);
	} else {
		switch(requestName) {
			case 'getListData':
				url = connUrl;
				method = 'GET';
				break;
			case 'createData':
				url = connUrl;
				method = 'POST';
				break;
			case 'getData':
				url = connUrl+"/{id}";
				method = 'GET';
				break;
			case 'updateData':
				url = connUrl+"/{id}";
				method = 'PUT';
				break;
			case 'destroyData':
				url = connUrl+"/{id}";
				method = 'DELETE';
				break;
		}
	}

	url = key.replaceWith(url, params, (key, value) => encodeURIComponent(value), true);

	return { url, method };
}

function _makeFetchRequest({ url, method }, params) {
	return fetch(url, {
		method,
		credentials: 'same-origin',
		body: method !== 'GET' ? JSON.stringify(params) : undefined,
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(
		response => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`Server did not produce a successful response code: ${response.status}`);
			}
		},
		error => {
			console.log('There has been a network error during fetch execution: ', error.message);
		}
	);
}

const fetchData = connect.behavior(
	'fetch-data',
	() => {
		return {
			getListData(params) {
				return _makeFetchRequest(
					_getRequestURLAndMethod(this.url, 'getListData', params),
					params
				);
			},
			getData(params) {
				return _makeFetchRequest(
					_getRequestURLAndMethod(this.url, 'getData', params),
					params
				);
			},
			createData(params) {
				return _makeFetchRequest(
					_getRequestURLAndMethod(this.url, 'createData', params),
					params
				);
			},
			updateData(params) {
				return _makeFetchRequest(
					_getRequestURLAndMethod(this.url, 'updateData', params),
					params
				);
			},
			destroyData(params) {
				return _makeFetchRequest(
					_getRequestURLAndMethod(this.url, 'destroyData', params),
					params
				);
			},
		};
	}
);

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos',
};

const fetchConn = fetchData(connectionOptions);

fetchConn.getListData({}).then(data =>
	console.log(`Used fetch to load ${data.length} todos.`)
);
