const DigitalClockVM = can.DefineMap.extend( "DigitalClockVM", {
	time: Date,
	hh() {
		const hr = this.time.getHours() % 12;
		return hr === 0 ? 12 : hr;
	},
	mm() {
		return this.time.getMinutes().toString().padStart( 2, "00" );
	},
	ss() {
		return this.time.getSeconds().toString().padStart( 2, "00" );
	}
} );
can.Component.extend( {
	tag: "digital-clock",
	view: can.stache( "{{hh()}}:{{mm()}}:{{ss()}}" ),
	ViewModel: DigitalClockVM
} );
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
