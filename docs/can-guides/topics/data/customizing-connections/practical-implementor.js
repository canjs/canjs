import { connect, key } from "//unpkg.com/can@5/core.mjs";

const fetchData = connect.behavior(
	'fetch-data',
	() => {
		return {
			_getRequestURLAndMethod(requestName, params) {
				let url = null;
				let method = null;
				
				if (this.url[requestName]) {
					[method, url] = this.url[requestName].split(/ (.+)/);
				} else {
					switch(requestName) {
						case 'getListData':
							url = this.url;
							method = 'GET';
							break;
						case 'createData':
							url = this.url;
							method = 'POST';
							break;
						case 'getData':
							url = this.url+"/{id}";
							method = 'GET';
							break;
						case 'updateData':
							url = this.url+"/{id}";
							method = 'PUT';
							break;
						case 'destroyData':
							url = this.url+"/{id}";
							method = 'DELETE';
							break;
					}
				}
				
				url = key.replaceWith(url, params, (key, value) => encodeURIComponent(value), true);
				
				return { url, method };
			},
			_makeFetchRequest({ url, method }, params) {
				return fetch(url, {
					method,
					credentials: 'same-origin',
					body: JSON.stringify(params),
					headers: {
						'Content-Type': 'application/json'
					}
				}).then(response => {
					if (response.ok) {
						return response.json();
					} else {
						throw new Error('Server did not produce an expected response.');
					}
				}).catch(error => {
					console.log('There has been a network error during fetch execution: ', error.message);
				});
			},
			getListData(params) {
				return this._makeFetchRequest(
					this._getRequestURLAndMethod('getListData', params),
					params
				);
			},
			getData(params) {
				return this._makeFetchRequest(
					this._getRequestURLAndMethod('getData', params),
					params
				);
			},
			createData(params) {
				return this._makeFetchRequest(
					this._getRequestURLAndMethod('createData', params),
					params
				);
			},
			updateData(params) {
				return this._makeFetchRequest(
					this._getRequestURLAndMethod('updateData', params),
					params
				);
			},
			destroyData(params) {
				return this._makeFetchRequest(
					this._getRequestURLAndMethod('destroyData', params),
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
