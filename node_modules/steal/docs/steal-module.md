@page steal.steal-module steal-module script tag
@parent StealJS.other

Inline a module directly in HTML.

@body

## Use

Add a steal-module script to the page and it will run after Steal has been configured:

    <script type="steal-module">
      import _ from "lodash";

	  console.log(_.repeat("0", 10));
	</script>

The **type** must be **text/steal-module**.  You can add as many of these tags as is needed. They can import other modules, but exports cannot be used by other modules.
