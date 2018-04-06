can.Component.extend({
  tag: 'video-player',
  view: `
      <video controls>
        <source src="{{src}}"/>
      </video>
    `,
  ViewModel: {
    src: 'string'
  }
});
