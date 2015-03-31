var RestaurantModel = can.Model.extend({
  findAll: 'GET /restaurants'
}, {
  // Include second, empty parameter object to set instanceProperties
});

var RestaurantMenusModel = can.Model.extend({
  findAll: 'GET /menus/{id}',
  parseModels: 'menus'
}, {});

var MenuOrderModel = can.Model.extend({
  create: 'POST /order'
}, {});

var SiteMenuModel = can.Model.extend({
  findOne: 'GET /site_menu'
}, {});

var RestaurantModel = can.Model.extend({
  findAll: 'GET /restaurants',
  findOne: 'GET /restaurant/{name}'
}, {});