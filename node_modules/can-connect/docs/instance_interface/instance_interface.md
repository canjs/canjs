@typedef can-connect/InstanceInterface InstanceInterface
@parent can-connect.types

@description The methods used to create, retrieve, update and destroy typed instances with a connection.

@signature `InstanceInterface`

The [can-connect/constructor/constructor] behavior is typically
used to implement the core instance interface methods:

 - [can-connect/connection.getList] - Get a list of instances.
 - [can-connect/connection.get] - Get a single instance.
 - [can-connect/connection.save] - Create or update an instance.
 - [can-connect/connection.destroy] - Destroy an instance.
