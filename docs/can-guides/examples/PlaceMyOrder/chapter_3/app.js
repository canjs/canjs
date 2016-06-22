$(function () {
  var AppState = can.Map.extend({});

  var appState = new AppState();

  // Bind the application state to the root of the application
  $('#can-main').html(can.view('main.stache', appState));

  // Set up the routes
  can.route(':page', { page: 'home' });
  can.route(':page/:slug', { slug: null });
  can.route(':page/:slug/:action', { slug: null, action: null });

  $('body').on('click', 'a[href="javascript://"]', function(ev) {
    ev.preventDefault();
  });

  // Bind the application state to the can.route
  can.route.map(appState);

  can.route.ready();
});
