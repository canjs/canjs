import { Component } from "can";

const PageLogin = Component.extend({
    tag: "page-login",
    view: `
        <h1><code>&lt;page-login&gt;</code></h1>
        <p>This content is provided by the <code>&lt;page-login&gt;</code> component.</p>
        <p>Please click the <i>Login</i> button below to access your page.</p>
        <button on:click="login()">Login</button>
    `,
    ViewModel: {
        isLoggedIn: "boolean",
        login: function(){
            this.isLoggedIn = true;
        }
    }
});

export default PageLogin;
