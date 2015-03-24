/**
 * Restaurants Model Fixture
 */
can.fixture("GET /restaurants", function requestHandler() {
    return [
        {
            "name": "Spago",
            "location": "USA",
            "cuisine": "Modern",
            "owner": "Wolfgang Puck",
            "restaurantId": 1
        },
        {
            "name": "El Bulli",
            "location": "Spain",
            "cuisine": "Modern",
            "owner": "Ferran Adria",
            "restaurantId": 2
        },
        {
            "name": "The French Laundry",
            "location": "USA",
            "cuisine": "French Traditional",
            "owner": "Thomas Keller",
            "restaurantId": 3
        }
    ];
});

/**
 * Order Fixture
 */
can.fixture('POST /order', function requestHandler(){
    return true;
});

/**
 * Restaurant Menus Fixture
 */
can.fixture("GET /menus/{id}", function requestHandler(request) {

    var id = parseInt(request.data.id, 10) - 1;

    var menuList = [
        {
            //Spago
            "menus": [
                {
                    "menuName": "Lunch",
                    "items": [
                        {name: "Spinach Fennel Watercress Ravioli", price: 35.99, id: 32},
                        {name: "Herring in Lavender Dill Reduction", price: 45.99, id: 33},
                        {name: "Garlic Fries", price: 15.99, id: 34}
                    ]
                },
                {
                    "menuName": "Dinner",
                    "items": [
                        {name: "Crab Pancakes with Sorrel Syrup", price: 35.99, id: 22},
                        {name: "Chicken with Tomato Carrot Chutney Sauce", price: 45.99, id: 23},
                        {name: "Onion Fries", price: 15.99, id: 24}
                    ]
                }
            ]

        },
        {
            //El Bulli
            "menus": [
                {
                    "menuName": "Lunch",
                    "items": [
                        {name: "Spherified Calf Brains and Lemon Rind Risotto", price: 35.99, id: 32},
                        {name: "Sweet Bread Bon Bons", price: 45.99, id: 33},
                        {name: "JoJos", price: 15.99, id: 34}
                    ]
                },
                {
                    "menuName": "Dinner",
                    "items": [
                        {name: "Goose Liver Arugula Foam with Kale Crackers", price: 35.99, id: 22},
                        {name: "Monkey Toenails", price: 45.99, id: 23},
                        {name: "Tater Tots", price: 15.99, id: 24}
                    ]
                }
            ]

        },
        {
            //The French Kitchen
            "menus": [
                {
                    "menuName": "Lunch",
                    "items": [
                        {name: "Croque Monsieur", price: 35.99, id: 32},
                        {name: "Pain Au Chocolat", price: 45.99, id: 33},
                        {name: "Potato Latkes", price: 15.99, id: 34}
                    ]
                },
                {
                    "menuName": "Dinner",
                    "items": [
                        {name: "Chateau Briande", price: 35.99, id: 22},
                        {name: "Veal Almandine", price: 45.99, id: 23},
                        {name: "Hashbrowns", price: 15.99, id: 24}
                    ]
                }
            ]

        }
    ];

    return menuList[id];
});

/**
 * Site Menu Fixture
 */
can.fixture("GET /site_menu", function requestHandler() {
    return {
        menuText: {
            "PageTitle": "PlaceMyOrder.com",
            "FoodAtFingertips": "Food at your Fingertips",
            "Restaurants": "Restaurants",
            "Cuisines": "Cuisines"
        }
    };
});