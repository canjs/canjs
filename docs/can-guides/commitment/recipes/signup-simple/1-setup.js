const AppViewModel = can.DefineMap.extend({

});

const viewModel = new AppViewModel({});

const view = can.stache.from("app-view");
const fragment = view(viewModel);

document.body.appendChild(fragment);
