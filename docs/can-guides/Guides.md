@page guides Guides
@parent canjs 1
@group guides/experiment 2 experiment
@group guides/getting-started 3 getting started
@group guides/topics 5 topics
@group guides/contribute 6 contribute
@group guides/upgrade 7 upgrade
@templateRender <% %>
@subchildren

@description Welcome to CanJS! These guides are here to help you develop and improve your relationship with CanJS. After all, picking a JavaScript framework is a commitment.  We want CanJS to be the framework you marry.  This page helps you know how to advance through the different stages of this relationship:

@body

## Experimenting

So now you’ve decided to give CanJS a try.
The best place to start is the [guides/chat].
It’s only an hour and shows off CanJS’s best features while you build
a real-time chat application.  You build the whole thing in a JS&nbsp;Bin.

Next, you’ll want to try the [guides/todomvc].  This takes about 1.5 hours and touches on
every core part of CanJS.  You can also follow the whole guide in a JS&nbsp;Bin.

After that, check out the [guides/atm].  It takes about 2 hours and shows how to build and __test__
an ATM. It also shows how to composite state.  The whole guide is done in a JS&nbsp;Bin.

You might also want to to go through DoneJS’s [Place My Order Guide](https://donejs.com/place-my-order.html).  This is an in-depth
look at how CanJS works within the context of a wide variety of other tools.  This guide takes
about 8 hours.

Finally, when you’re just about to commit, read [guides/setup] to learn how to set up
CanJS for your particular environment.

## Commitment

Once you’ve committed to CanJS, it’s important that you keep liking it and
get better at using it.  

CanJS’s community has lots of people who can offer advice and tips on
how to build an application the right way. Instead of struggling,
please ask for advice on [Gitter chat](https://gitter.im/canjs/canjs) or the [forums](https://forums.donejs.com/c/canjs).  Share a screenshot of what you’re building
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

If you have any questions, you can always reach us on [Gitter chat](https://gitter.im/canjs/canjs).

If you want to become a CanJS contributor, you simply have to:

 - [Email](mailto:contact@bitovi.com) the core team expressing your interest.
 - Attend the weekly DoneJS Contributors meeting twice a month. [DoneJS Calendar](https://www.google.com/calendar/embed?src=jupiterjs.com_g27vck36nifbnqrgkctkoanqb4%40group.calendar.google.com&ctz=America/Chicago).
 - Make one small contribution, even a spelling correction, a month.

Issues that should be easy for a new contributor to pick up have an “easy” label. [This GitHub search](https://github.com/search?utf8=%E2%9C%93&q=user%3Acanjs+is%3Aopen+is%3Aissue+label%3AEasy&type=Issues) makes it easy to find easy issues across all the CanJS repositories.


## Skill Tree

<style>
.down:before {
    content: "\2193";
     position: absolute;
     bottom: -20px;
     left: 50%;
}
.down, .down-left, .down-right, .right {
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
.down-right:after {
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
}
.skill p {
    font-size: 0.8em;
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
}
</style>

<div class='scroll-contents-right'>
<table class='skill'>
<tbody>
<tr>
    <td>Architecture</td>
    <td class='right'>[guides/technology-overview]
<p><%this.[guides/technology-overview].description%></p>
<img src="../docs/can-guides/experiment/technology/overview.svg"
  alt="Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer"
  class='bit-docs-screenshot' width='100px'/>
    </td>
<td class='right'>[guides/chat]
<p><%this.[guides/chat].description%></p>
<img src="../docs/can-guides/experiment/chat/chat.png" width='100px'/>
</td>
<td class='right'>[guides/todomvc]
<p>
<%this.[guides/todomvc].description%>
</p>
<img src="../docs/can-guides/experiment/todomvc/todomvc.png" width='100px'/>
</td>

<td class='right'>[guides/recipes/todomvc-with-steal]
<p><%this.[guides/recipes/todomvc-with-steal].description%></p>
<img src="../docs/can-guides/experiment/todomvc/todomvc.png" width='100px'/>
</td>

<td class='right'>Bitballs</td>
<td>Bitcentive</td>
</tr>

<tr>
<td>Debugging</td>
<td class='right'>[guides/debugging]
<p><%this.[guides/debugging].description%></p>
<img src="../node_modules/can-debug/doc/map-dependency-graph.png"
  alt="A visual representation of an observable's dependency graph"
  width="100px"/></td>
</tr>

<tr>
    <td>State Management</td>
    <td>ATM</td>
    <td>Credit Card</td>
</tr>
<tr>
    <td>Testing</td>
    <td>ATM</td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td>Routing</td>
    <td>signup</td>
    <td>Routing Guide</td>
    <td>Bitballs</td>
</tr>
<tr>
    <td>Data</td>
    <td>File Navigator</td>
    <td>Bitballs</td>
    <td>Bitcentive</td>
</tr>
<tr>
    <td>Rich User Interfaces</td>
    <td>Forms Guide</td>
    <td>Playlist Editor</td>
</tr>
<tr>
    <td>Platform and Environment Integration</td>
    <td>DoneJS Chat Guide</td>
    <td>DoneJS PMO Guide</td>
</tr>
<tr>
    <td>Non-DOM API Integration</td>
    <td>Canvas Clock</td>
    <td>Rich Text Editor</td>
    <td>Weather Report</td>
    <td>Bus Tracker</td>
</tr>
</tbody>
</table>
</div>


<table class='skill'>
<tbody>
<tr>
    <td></td>
    <td class='down'>[guides/technology-overview]
<p><%this.[guides/technology-overview].description%></p>
<img src="../docs/can-guides/experiment/technology/overview.svg"
  alt="Observables are the center hub.  They are connected to the DOM by the view layer, the service layer by the data modeling layer, and the window location by the routing layer"
  class='bit-docs-screenshot' width='100px'/>
    </td>
    <td></td>
</tr>
<tr>
    <td></td>
<td class='down-left'>
[guides/chat]
<p><%this.[guides/chat].description%></p>
</td>
<td></td>
</tr>

<tr>
<td>Integrations</td>
<td></td>
<td></td>
</tr>

<tr>
<td class='down'>
[guides/debugging]
<p><%this.[guides/debugging].description%></p>
<img src="../node_modules/can-debug/doc/map-dependency-graph.png"
  alt="A visual representation of an observable's dependency graph"
  width="100px"/>
</td>

<td></td><td>Tutorials</td>
</tr>
<tr>
<td class='down'>ATM Guide (for testing)</td>
<td></td>
<td></td>
</tr>

<tr>
<td class='down'>TodoMVC with StealJS (module loading)</td>
<td></td>
<td></td>
</tr>

<tr>
<td class='down'>DoneJS Getting Started Guide (building / generators)</td>
<td></td>
<td></td>
</tr>

<tr>
<td class='down'>DoneJS Place My Order (CI / CD / Testing)</td>
<td></td>
<td></td>
</tr>

</tbody>
</table>
