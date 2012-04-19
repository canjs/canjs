steal("can/util", function() {

  can.extend( can, {

    debounce : function( fn, time, context ) {

      var timeout;

      return function() {

        var args = arguments;
            
        context = context || this;

        clearTimeout( timeout );
        timeout = setTimeout(function() {
          fn.apply( context, args );
        }, time );
      }

    },

    throttle : function( fn, time, context ) {

      var run;

      return function() {

        var args = arguments;

        context = context || this;

        if ( ! run ) {
          run = true;
          setTimeout(function() {
            fn.apply( context, args );
            run = false;
          }, time );
        }

      }
    }

  });

});
