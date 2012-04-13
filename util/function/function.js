steal("can/util", function() {

  can.extend( can, {

    debounce : function( fn, time ) {

      var timeout;

      return function() {
        clearTimeout( timeout );
        timeout = setTimeout(function() {
          fn();
        }, time );
      }

    },

    throttle : function( fn, time ) {

      var run;

      return function() {

        if ( ! run ) {
          run = true;
          setTimeout(function() {
            fn();
            run = false;
          }, time );
        }

      }
    }

  });

});
