@page guides/contributing/feature-suggestion Feature Suggestion
@parent guides/contribute

@description Learn how to suggest a feature.

@body

## Overview

CanJS uses [GitHub Issues](https://github.com/canjs/canjs/issues/new) to track feature requests. However,
CanJS is made up of many individual GitHub repositories. Ideally, features are created within the
repository whose code needs to be modified.  For example, features with
[can-define] can be created at [canjs/can-define/issues/new](https://github.com/canjs/can-define/issues/new).

If you do not know which repository your feature belongs to, that’s totally ok!  Please
create your issue in the main
[canjs/canjs issues page](https://github.com/canjs/canjs/issues/new).  The core team will
move the issue to the correct repository if necessary.

When creating an feature issue, it’s very helpful to include:

 - Examples of what using the feature will look like.
 - Benefits and drawbacks of the feature.
 - Why the feature is important.
 - Any implementation details around the feature.

Here’s some example well written feature requests:

 - [Make events fire asynchronously and dispatched during request animation frame or setImmediate](https://github.com/canjs/can-event/issues/11)
 - [Modify key -> argument behavior in stache](https://github.com/canjs/canjs/issues/1699)

Also, please search for previous feature requests.  If there’s something similar, add to that, or
give it a `+1`.

Finally, if there are any questions, reach out to
us on the [CanJS forums](http://forums.donejs.com/c/canjs) or talk to us on
the [Gitter canjs/canjs channel](https://gitter.im/canjs/canjs).

## Priority, Tags, and Complexity

The [core team](https://donejs.com/About.html#team) reviews issues
and assigns them a `P0` to `P4` tag corresponding to the following priorities:

- `P0` - An issue that will preempt any other issues currently being worked on.
- `P1` - A critical feature or bug that needs to be fixed to keep CanJS’s high degree of quality.
- `P2` - A feature or bug that is less likely to be encountered, but something we intend to get to.
- `P3` - A nice to have. The OS team might get to it, but it’s helpful if the community assists.
- `P4` - A nice to have that the OS team will accept, but will be unlikely to prioritize any effort towards.

There are several ways to influence these priorities:

 - Offer to pair with a contributor on a solution.
 - Write a good test.
 - Come to a DoneJS Contributors meeting and make your case.
 - Get others from other organizations to `+1` the issue.
 - Make your case on Gitter with a contributor or in the issue.
 - You can always hire [Bitovi](https://www.bitovi.com) or a contributor to make the change.


Also, the core team will often include a complexity indicator in the title that looks like
`~NUMBER`.  This is a fibonacci number.  `~1` means its an extremely simple task.  `~8` is about
a half day task.  `~34` might take a week of experimentation.
