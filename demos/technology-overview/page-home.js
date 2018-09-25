import { Component, stacheRouteHelpers } from "can";

const PageHome = Component.extend({
    tag: "page-home",
    view: `
        <h1><code>&lt;page-home&gt;</code></h1>
        <p>This content is provided by the <code>&lt;page-home&gt;</code> component.
            Please click one of the tasks below to be directed to one of their pages
            or click <i>Logout</i> to log out.
        </p>
        <ul>
            <li><a href="{{ routeUrl(page='tasks' taskId='0') }}">Task 0</a></li>
            <li><a href="{{ routeUrl(page='tasks' taskId='1') }}">Task 1</a></li>
        </ul>
        <button on:click="logout()">Logout</button>
    `,
    ViewModel: {}
});

export default PageHome;
