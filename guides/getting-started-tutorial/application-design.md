@page ApplicationDesign Application Design
@parent Tutorial 2
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - Designing an Application
- - -

The first step in putting together a CanJS app is sketching out the various
states of your application, as you understand them at the moment
(requirements are always subject to change!),
and any supporting elements you might need.

We’ll be building a small application called “Place My Order”. Place My Order is a
website that lets you select from available restaurants in your area, view their
menus, and purchase items for delivery. For this sample application, we’ll keep
things pretty simple. We won’t worry about registration, authentication, or
payment processing.

Let’s walk through the different pages of our application.

## Home

![place-my-order.com home page](../can/guides/images/application-design/Home.png)

The home page includes a header for navigation and a quick summary of the website’s
purpose. You can see the main purposes of the website: to order from a restaurant
and see your order history.

## Restaurants

![place-my-order.com home page](../can/guides/images/application-design/RestaurantLocator.png)

The restaurants page is the starting point for finding a restaurant from which you
want to order. Here, you can see that the process starts by selecting a (U.S.)
state and city.

### Finding a Restaurant

![place-my-order.com home page](../can/guides/images/application-design/RestaurantList.png)

After you select a state and city, you’re presented with a list of restaurants from
which to order. The list includes details about the restaurant, such as its rating
and hours, as well as a “Place My Order” button.

### Restaurant Details

![place-my-order.com home page](../can/guides/images/application-design/RestaurantDetails.png)

The restaurant details page includes more information about the restaurant and an
order button to start the ordering process.

### Ordering from a Restaurant

![place-my-order.com home page](../can/guides/images/application-design/RestaurantOrderForm.png)

The order page has a simple menu and form for collecting the user’s information. We
ask for their name, address, and phone number. At the bottom of the page, we show a
total amount for the order and a button to place the order.

### Order Confirmation

![place-my-order.com home page](../can/guides/images/application-design/RestaurantOrderConfirmation.png)

The order confirmation page shows the items the user selected for purchase, a total,
as well as their information. Note that this page also has a link to restart the
ordering process in case the user wants to place another order at the same restaurant.

## Order History

![place-my-order.com home page](../can/guides/images/application-design/OrderHistory.png)

The order history page has a list of orders with different statuses: new, preparing,
in delivery, and delivered. This page allows you to mark orders as different
statuses as they move through the entire flow.

- - -

<span class="pull-left">[&lsaquo; Setup](Setup.html)</span>
<span class="pull-right">[Constructors &rsaquo;](Constructors.html)</span>

</div>

