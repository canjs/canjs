var SiteMenuViewModel = can.Map.extend({
    init: function () {
        this.attr('menuData', {});
        this.attr('homeLink', "");
    }
});

can.Component.extend({
    tag: "menu",
    template: can.view('components/site_menu/site_menu.stache'),
    scope: SiteMenuViewModel,
    events: {
        inserted: function () {
            var siteMenuViewModel = this.scope;
            SiteMenuModel.findOne({},
                function success(menu) {
                    siteMenuViewModel.attr('menuData', menu);
                    siteMenuViewModel.attr('menuData.menuText.HomeLink',
                        can.route.link( 'Restaurants', {restaurant: null}, false ));
                },
                function error(xhr) {
                    alert(xhr.error.message);
                });
        }
    }
});

