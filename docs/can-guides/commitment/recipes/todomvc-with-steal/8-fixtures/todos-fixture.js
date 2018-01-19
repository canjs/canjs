// models/todos-fixture.js
import fixture from 'can-fixture';

import Todo from './todo';


var todoStore = fixture.store([
    { name: "mow lawn", complete: false, id: 5 },
    { name: "dishes", complete: true, id: 6 },
    { name: "learn canjs", complete: false, id: 7 }
], Todo.algebra);

fixture("/api/todos", todoStore);
fixture.delay = 500;

export default todoStore;
