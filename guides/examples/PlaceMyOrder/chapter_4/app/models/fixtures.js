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