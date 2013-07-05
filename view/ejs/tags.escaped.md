@function can.EJS.tags.escaped <%= CODE %>
@parent can.EJS.tags 1


@signature `<%= CODE %>`

Runs JS Code and writes the _escaped_ result into the result of the template.

The following results in the user seeing "my favorite element is &lt;blink>BLINK&lt;blink>" and not
<blink>BLINK</blink>.

     <div>my favorite element is <%= '<blink>BLINK</blink>' %>.</div>