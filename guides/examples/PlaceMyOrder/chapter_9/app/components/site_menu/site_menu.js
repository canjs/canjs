var SiteMenuViewModel = can.Map.extend({
    menuData: {}
});

can.Component.extend({
    tag: 'menu',
    template: can.view('components/site_menu/site_menu.stache'),
    scope: SiteMenuViewModel,
    helpers: {
        homeUrl: function() {
            return can.route.url({restaurant: null}, false);
        }
    },
    events: {
        inserted: function() {
            var siteMenuViewModel = this.scope;
            SiteMenuModel.findOne({},
                function(menu) {
                    siteMenuViewModel.attr('menuData', menu);
                },
                function(xhr) {
                    alert(xhr.error.message);
                });
        }
    }
});

