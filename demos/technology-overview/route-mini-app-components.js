import Component from "can-component";
import stache from "can-stache";
import DefineMap from "can-define/map/map";
import "can/demos/technology-overview/task-editor";
import "can-stache-route-helpers";

Component.extend({
    tag: "page-home",
    view: stache(`
        <h1><code>&lt;page-home&gt;</code></h1>
        <p>This content is provided by the <code>&lt;page-home&gt;</code> component.
            Please click one of the tasks below to be directed to one of their pages
            or click <i>Logout</i> to log out.
        </p>
        <ul>
            <li><a href="{{routeUrl(page='tasks' taskId='0')}}">Task 0</a></li>
            <li><a href="{{routeUrl(page='tasks' taskId='1')}}">Task 1</a></li>
        </ul>
        <button on:click='logout()'>Logout</button>
    `)
});

Component.extend({
    tag: "page-login",
    view: stache(`
        <h1><code>&lt;page-login&gt;</code></h1>
        <p>This content is provided by the <code>&lt;page-login&gt;</code> component.</p>
        <p>Please click the <i>Login</i> button below to access your page.</p>
        <button on:click='login()'>Login</button>
    `),
    ViewModel: DefineMap.extend({
        isLoggedIn: "boolean",
        login: function(){
            this.isLoggedIn = true;
        }
    })
});
