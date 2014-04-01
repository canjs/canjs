@page can.event can.event
@parent canjs
@test can/event/test.html
@link ../docco/event.html docco
@group can.event.plugins plugins
@group can.event.static static
@release 2.1

@description Events

MindMap.prototype = can.extend({}, can.event, MindMap.prototype);
^-- prevents conflicts like with can/control
Or can.Control(can.extend({}, can.event, {
