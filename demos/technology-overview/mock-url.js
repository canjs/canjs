import { Component, DefineMap, stache } from "can";

const style = document.createElement("style");
style.innerHTML = `
mock-url {display: block;}
mock-url .location {
    display: flex;
    margin-bottom: 20px;
}
mock-url .url {
    display: inline-block;
    border: solid 1px;
    padding: 2px;
    flex-grow: 1;
}

mock-url .back, mock-url .forward, mock-url .reload {
    font-size: 16px;
    font-family: Verdana,sans-serif;
    border: solid 1px black;
    padding: 2px;
    line-height: 20px;
    flex-grow: 0;
    cursor: pointer;
}
mock-url input {
    border: none;
    font-size: 16;
}
`;

document.body.appendChild(style);

Component.extend({
    tag: "mock-url",
    view: `
        <div class='location'>
            <span class='back' on:click='back()'>&#x21E6;</span>
            <span class='forward' on:click='forward()'>&#x21E8;</span>
            <span class='reload' on:click='reload()'>&#8635;</span>
            <div class="url">URL: {{ page }}<input value:bind="url"/></div>
        </div>`,

    ViewModel: DefineMap.extend("MockUrl",{
        page: {
            default: "/my-app.html"
        },
        url: {
            value(prop) {
                // When the property is set, update the hash.
                prop.listenTo(prop.lastSet, function(newVal){
                    window.location.hash = newVal;
                });

                // When the hash changes, update the property
                function updateWithHash(){
                    prop.resolve(window.location.hash);
                }
                window.addEventListener("hashchange", updateWithHash);

                // Set the property value right away
                prop.resolve(window.location.hash);

                // teardown
                return function(){
                    window.removeEventListener("hashchange", updateWithHash);
                }
            }
        },
        back(){
            history.back();
        },
        forward(){
            history.forward();
        },
        reload(){
            location.reload();
        }
    })
});
