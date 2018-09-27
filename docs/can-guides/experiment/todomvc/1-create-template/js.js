import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "todo-mvc",
  view: `
      <section id="todoapp">
        <header id="header">
          <h1>{{ this.appName }}</h1>
          <input id="new-todo"
            placeholder="What needs to be done?"/>
        </header>
        <section id="main">
          <input id="toggle-all" type="checkbox"/>
          <label for="toggle-all">Mark all as complete</label>
          <ul id="todo-list">
            <li class="todo">
              <div class="view">
                  <input class="toggle" type="checkbox">
                  <label>Do the dishes</label>
                  <button class="destroy"></button>
              </div>
              <input class="edit" type="text" value="Do the dishes">
            </li>
            <li class="todo completed">
              <div class="view">
                  <input class="toggle" type="checkbox">
                  <label>Mow the lawn</label>
                  <button class="destroy"></button>
              </div>
              <input class="edit" type="text" value="Mow the lawn">
            </li>
            <li class="todo editing">
              <div class="view">
                  <input class="toggle" type="checkbox">
                  <label>Pick up dry cleaning</label>
                  <button class="destroy"></button>
              </div>
              <input class="edit" type="text" value="Pick up dry cleaning">
            </li>
          </ul>
        </section>
        <footer id="footer" class="">
          <span id="todo-count">
            <strong>2</strong> items left
          </span>
          <ul id="filters">
            <li>
              <a href="#!" class="selected">All</a>
            </li>
            <li>
              <a href="#!active">Active</a>
            </li>
            <li>
              <a href="#!complete">Completed</a>
            </li>
          </ul>
          <button id="clear-completed">
            Clear completed (1)
          </button>
        </footer>
      </section>
  `,
  ViewModel: {
    appName: {default: "TodoMVC"}
  }
});
