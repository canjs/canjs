// models/todos-fixture.js
import {fixture} from "can";
import Todo from "./todo";

const todoStore = fixture.store([
    { name: "mow lawn", complete: false, id: "5" },
    { name: "dishes", complete: true, id: "6" },
    { name: "learn canjs", complete: false, id: "7" }
], Todo);

fixture("/api/todos/{id}", todoStore);
fixture.delay = 500;

export default todoStore;
