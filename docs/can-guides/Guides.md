@page guides Guides
@parent canjs 1
@group guides/essentials 2 essentials
@group guides/experiment 3 app guides
@group guides/upgrade 5 upgrade
@group guides/getting-started 6 other
@templateRender <% %>
@subchildren

@description Welcome to CanJS! These guides are here to help you
master CanJS development, get involved with the CanJS community,
and contribute back to CanJS.

@body

## Development Guides

The following skill-tree diagram organizes our guides by topic vertically and by difficulty
horizontally. Harder and longer guides to the right. This allows you to
take the guides that fit your needs.

For example:

- A user new to JavaScript programming might start with the [guides/technology-overview]
  then try a few of the more simple guides: [guides/chat], [guides/recipes/signup-simple], [guides/recipes/file-navigator-simple].
- An advanced user might jump right to our most advanced guide - [https://donejs.com/place-my-order.html PlaceMyOrder].

We encourage everyone to take a look at:

- [guides/technology-overview] to understand CanJS’s core concepts.
- One of the _Platform and Environment Integration_ guides to
  get CanJS working in your development and production environments.
- [guides/debugging] to know how to fix problems when they arise.

> Note: Some of the following guides are on [DoneJS.com](http://donejs.com).
> DoneJS is another framework built on top of CanJS.
> These DoneJS guides feature CanJS extensively and are __extremely__
> useful to understanding how to build a CanJS application even if you are
> not using DoneJS.


<style>
.down:before {
    content: "\2193";
    position: absolute;
    bottom: -20px;
    left: 50%;
}
.down, .down-left, .down-right, .right, .end, .up-right {
    position: relative;
    border: solid 1px;
    padding: 3px;
}
.down-left:before {
    content: "\2199";
    position: absolute;
    bottom: -20px;
    left: -20px;
}
.up-right:before {
    content: "\2197";
    position: absolute;
    top: -20px;
    right: -20px;
}
.down-right:before {
    content: "\2198";
    position: absolute;
    bottom: -20px;
    right: -20px;
}
.right:after {
    content: "\2192";
    position: absolute;
    top: 50%;
    right: -20px;
    line-height: 0;
}
.skill p {
    font-size: 0.8em;
}
.skill img {
    width: 100px;
}
.skill {
    border-collapse: separate;
    border-spacing: 20px;
    /*margin-bottom: 30px;*/
}
.skill td {
    text-align: center;
}
.scroll-contents-right {
    overflow-x: auto;
}
.skill td:nth-child(1) {  
    border: none;
    padding: 3px;
}
.in-progress {
    background-color: #ffeeba;
}
.proposed {
    background-color: #f5c6cb;
}
</style>

<div class='scroll-contents-right'>
<table class='skill'>
<tbody>
<TR>
    <td class='right'>Architecture</td>
    <td class='right'>[guides/technology-overview]
<p><%this.[guides/technology-overview].description%></p>
<img src="../docs/can-guides/experiment/technology/overview.svg"
  alt="Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer"
  class='bit-docs-screenshot' width='100px'/>
    </td>
<td class='right down-right'>[guides/chat]
<p><%this.[guides/chat].description%></p>
<img src="../docs/can-guides/experiment/chat/chat.png" width='100px'/>
</td>
<td class='right down-right'>[guides/todomvc]
<p>
<%this.[guides/todomvc].description%>
</p>
<img src="../docs/can-guides/experiment/todomvc/todomvc.png" width='100px'/>
</td>

 <td class='end'>[https://donejs.com/place-my-order.html PlaceMyOrder]
 <p>Build and deploy a real-time, multi-page DoneJS application.</p>
 <img src="https://donejs.com/static/img/place-my-order.png"/>
 </td>
</tr>

<TR>
<td></td>
<td></td>
<td></td>
<td class='up-right right'>[guides/recipes/todomvc-with-steal]
<p><%this.[guides/recipes/todomvc-with-steal].description%></p>
<img src="../docs/can-guides/experiment/todomvc/todomvc.png" width='100px'/>
</td>
<td class='end'>[https://donejs.com/bitballs.html Bitballs]
<p>Walk through a DoneJS app built with PostgreSQL.</p>
<img src="https://donejs.com/static/img/bitballs/bitballs-video.png"/>
</td>
</TR>

<TR>
<td class='right'>Platform and Environment Integration</td>
<td class='right'>[guides/setup]
  <p><%this.[guides/setup].description%></p>
  <img src='../docs/can-guides/experiment/setup.png'/>
</td>
<td class='right'>[https://donejs.com/Guide.html DoneJS Chat]
 <p>Deploy to a
    CDN. Build a desktop and mobile app.</p>
 <img src="https://donejs.com/static/img/donejs-chat3.png"/>
</td>
 <td class='end'>[https://donejs.com/place-my-order.html PlaceMyOrder]
 <p>Setup continuous integration, continuous deployment. Deploy to a
    CDN.  Build a desktop and mobile app.
 </p>
 <img src="https://donejs.com/static/img/place-my-order.png"/></td>
</tr>


<TR>
<td class='right'>Debugging</td>
<td class='end'>[guides/debugging]
<p><%this.[guides/debugging].description%></p>
<img src="../node_modules/can-debug/doc/map-dependency-graph.png"
  alt="A visual representation of an observable's dependency graph"
  width="100px"/></td>
</TR>

<TR>
<td class='right'>State Management</td>
<td class='right'>[guides/atm]
<p><%this.[guides/atm].description%></p>
<img src="../docs/can-guides/experiment/atm/atm.png" width='100px'/>
</td>
<td class='end'>[guides/recipes/credit-card-advanced]
 <p><%this.[guides/recipes/credit-card-advanced].description%></p>
 <img src="https://user-images.githubusercontent.com/78602/27451508-d86e9bd8-5754-11e7-954b-a812e1ed63b1.png" width='100px'/>
</td>
</TR>

<TR>
<td class='right'>Testing</td>
<td class='right'>
 [guides/atm]
 <p><%this.[guides/atm].description%></p>
 <img src="../docs/can-guides/experiment/atm/atm.png" width='100px'/></td>
<td class='end proposed'>[https://github.com/canjs/canjs/issues/3862 Testing Guide]<p>Proposed. Vote for it in our Survey.</p></td>
<td></td>
</TR>

<TR>
<td class='right'>Routing</td>
<td class='right'>
 [https://donejs.com/bitballs.html Bitballs]
 <p>The Bitballs example routes between a large number of pages.</p>
 <img src="https://donejs.com/static/img/bitballs/bitballs-video.png" width='100px'/>
</td>
<td class='end in-progress'>
 [https://github.com/canjs/can-route/issues/122 Routing Guide]
 <p>In Progress.</p>
</td>

</tr>
<TR>
<td class='right'>Data</td>
<td class='right'>[guides/recipes/file-navigator-advanced]
 <p><%this.[guides/recipes/file-navigator-advanced].description%></p>
 <img src="../docs/can-guides/commitment/recipes/file-navigator/file-navigator.png" width='100px'/>
</td>
<td class='right down-right proposed'>[https://github.com/canjs/canjs/issues/4014 Data Guide]
<p>Proposed. Vote for it in our Survey.</p>
</td>
<td class='right down-right'>[guides/todomvc]
 <p>
 Learn how to retrieve, create, update, and delete items.
 </p>
 <img src="../docs/can-guides/experiment/todomvc/todomvc.png" width='100px'/>
</td>
<td class='end'>
 [https://donejs.com/bitballs.html Bitballs]
 <p>Learn how to connect to a service built on PostgreSQL, handle
   relationships, and sessions.</p>
 <img src="https://donejs.com/static/img/bitballs/bitballs-video.png" width='100px'/></td>
</tr>

<TR>
<td></td>
<td></td>
<td></td>
<td class='right up-right'>[https://donejs.com/place-my-order.html PlaceMyOrder]
<p>Build and deploy a real-time, CRUD DoneJS application.</p>
<img src="https://donejs.com/static/img/place-my-order.png"/>
</td>
<td class='end'>
 [https://github.com/donejs/bitcentive Bitcentive]
 <p>Example repo showing how to connect to a document-based data layer.</p>
 <img src="https://raw.githubusercontent.com/donejs/bitcentive/staging/Bitcentive.png"/>
</td>
</tr>

<TR>
<td class='right'>Rich User Interfaces</td>
<td class='right'>[guides/recipes/signup-simple]
 <p><%this.[guides/recipes/signup-simple].description%></p>
 <img src="../docs/can-guides/commitment/recipes/signup-simple/signup.png" width='100px'/>
</td>
<td class='right'>[guides/forms]
 <p><%this.[guides/forms].description%></p>
 <img src="../docs/can-guides/topics/forms.png" width='100px'/>
</td>
<td class='end'>[guides/recipes/playlist-editor]
  <p><%this.[guides/recipes/playlist-editor].description%></p>
  <img src="https://user-images.githubusercontent.com/78602/27451781-ea3ed3d6-5755-11e7-8dd8-c4e83bc8aa90.png"/>
</td>
</tr>



<TR>
<td class='right'>Non-DOM API Integration</td>

<td class='right'>[guides/recipes/canvas-clock]
<p><%this.[guides/recipes/canvas-clock].description%></p>
<img src="../docs/can-guides/commitment/recipes/canvas-clock/canvas-clock.png"/>
</td>

<td class='right'>[guides/recipes/weather-report-simple]
<p><%this.[guides/recipes/weather-report-simple].description%></p>
<img src="../docs/can-guides/commitment/recipes/weather-report/weather-report.png"/></td>

<td class='right'>[guides/recipes/cta-bus-map]
<p><%this.[guides/recipes/cta-bus-map].description%></p>
<img src="../docs/can-guides/commitment/recipes/cta-bus-map/cta-bus-map.png"/></td>

<td class='end'>[guides/recipes/text-editor]
<p><%this.[guides/recipes/text-editor].description%></p>
<img src="../docs/can-guides/commitment/recipes/text-editor/text-editor.png"/></td>

</tr>
</tbody>
</table>
</div>

## Community

Once you’ve committed to CanJS, it’s important that you keep liking it and
get better at using it.  

CanJS’s community has lots of people who can offer advice and tips on
how to build an application the right way. Instead of struggling,
please
[join our Slack](https://www.bitovi.com/community/slack)
and ask for advice in the
[#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A)
or the [forums](https://forums.bitovi.com/c/canjs).  Share a screenshot of what you’re building
and we’ll tell you what needs to be done.

To stay up on CanJS’s latest news, we suggest:

 - Following [@CanJS](https://twitter.com/canjs) on twitter.
 - Subscribing to Bitovi’s [development blog](https://www.bitovi.com/blog/topic/development).

To get hands-on instruction, sign up for a DoneJS meetup in your area:

- [Boston](https://www.meetup.com/DoneJS-Boston/)
- [Chicago](https://www.meetup.com/DoneJS-Chicago/)
- [Ft. Lauderdale](https://www.meetup.com/DoneJS-Fort-Lauderdale/)
- [Los Angeles](https://www.meetup.com/DoneJS-LA/)
- [New York](https://www.meetup.com/DoneJS-NYC/)
- [Phoenix](https://www.meetup.com/DoneJS-Phoenix/)
- [Raleigh-Durham](https://www.meetup.com/DoneJS-raleigh-durham/)
- [San Francisco](https://www.meetup.com/DoneJS-San-Francisco/)
- [Seattle](https://www.meetup.com/DoneJS-Seattle/)
- [Silicon Valley](https://www.meetup.com/DoneJS-Silicon-Valley/)

If you’ve already committed to CanJS and are looking to move to 3.0, read [migrate-3].

## Contributing

Once you’ve settled down with CanJS, it’s time to think about adding extensions and improvements to the framework of your own. There are many ways to contribute to
CanJS, including:

 - [guides/contributing/bug-report Report a bug]
 - [guides/contributing/feature-suggestion Suggest a feature]
 - [guides/contributing/code Code changes]
 - [guides/contributing/documentation Documentation improvements]
 - [Create a plugin](https://donejs.com/plugin.html)
 - [guides/contributing/evangelism Evangelism - Blog, meetup and conference talks]
 - [guides/contributing/releases Releases - Maintaining CanJS]

CanJS is managed by the [DoneJS Contributors Team](https://donejs.com/About.html#team).
All contributions from all types of contributors are welcome. Contributing
to an Open Source project can be an intimidating experience.  We’re
committed to making the experience as pleasant and rewarding as possible.  We’re happy to set up a
pairing session to show you how to fix a bug or write a feature.  

If you have any questions, you can always
[join our Slack](https://www.bitovi.com/community/slack)
and reach us in the
[#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A).

If you want to become a CanJS contributor, you simply have to:

 - [Email](mailto:contact@bitovi.com) the core team expressing your interest.
 - Attend the weekly DoneJS Contributors meeting twice a month. [DoneJS Calendar](https://www.google.com/calendar/embed?src=jupiterjs.com_g27vck36nifbnqrgkctkoanqb4%40group.calendar.google.com&ctz=America/Chicago).
 - Make one small contribution, even a spelling correction, a month.

Issues that should be easy for a new contributor to pick up have an “easy” label. [This GitHub search](https://github.com/search?utf8=%E2%9C%93&q=user%3Acanjs+is%3Aopen+is%3Aissue+label%3AEasy&type=Issues) makes it easy to find easy issues across all the CanJS repositories.
