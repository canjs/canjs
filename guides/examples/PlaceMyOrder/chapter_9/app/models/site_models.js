/**
 * Restaurant Model
 * @type {void|*}
 */
var RestaurantModel = can.Model.extend({
        findAll: "GET /restaurants",
        findOne: 'GET /restaurant/{name}'
    },
    {});

/**
 * RestaurantMenusModel
 * @type {void|*}
 */
var RestaurantMenusModel = can.Model.extend({
        findAll: "GET /menus/{id}",
        parseModels: "menus"
    },
    {});

/**
 * Menu Order Model
 * @type {void|*}
 */
var MenuOrderModel = can.Model.extend({
        create: 'POST /order'
    },
    {});

/**
 * Site Menu Model
 * @type {void|*}
 */
var SiteMenuModel = can.Model.extend({
    findOne: "GET /site_menu"
});