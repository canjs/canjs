const ClockControlsVM = can.DefineMap.extend( "ClockControlsVM", {
	time: {
		value( { resolve } ) {
			const intervalID = setInterval( () => {
				resolve( new Date() );
			}, 1000 );
			resolve( new Date() );
			return () => clearInterval( intervalID );
		}
	}
} );
can.Component.extend( {
	tag: "clock-controls",
	ViewModel: ClockControlsVM,
	view: can.stache( `
<p>{{time}}</p>
<digital-clock time:from="time"/>
<analog-clock time:from="time"/>
` )
} );
