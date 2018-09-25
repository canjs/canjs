import { Component, DefineMap, stache } from "can";
import "can/demos/technology-overview/component-slider";

Component.extend({
    tag: "task-editor",
    view: stache(`

        {{# if logout }}
            <h1><code>&lt;task-editor&gt;</code></h1>
            <p>
                This content is provided by the <code>&lt;task-editor&gt;</code> component.
                Click <a href="{{ routeUrl(page='home') }}">Home</a> to return to the homepage, or
                <button on:click='logout()'>Logout</button> to log out. Edit the task below:

            </p>
        {{/ else }}
            <h2>Task Editor</h2>
        {{/ if }}
        <form on:submit='save(scope.event)'>
            Name: {{ name }}
            <p>
                <input value:bind='name'/>
            </p>
            Progress: {{ progress }}
            <p>
                <percent-slider value:bind='progress'/>
            </p>
            <button disabled:from="isSaving">
                {{# if(isSaving) }}Saving{{ else }}Save{{/ if }}
            </button>
        </form>
    `),
    ViewModel: DefineMap.extend({
        id: "number",
        name: {
            default: function(){
                return "Task "+this.id;
            }
        },
        progress: {
            // makes progress an integer
            type(num){
                return parseInt(num);
            },
            default: 0
        },
        isSaving: {default: false},
        save(event){
            event.preventDefault();
            this.isSaving = true;
            // fake ajax request
            setTimeout(() => {
                this.isSaving = false;
            },2000);
        }
    })
});
