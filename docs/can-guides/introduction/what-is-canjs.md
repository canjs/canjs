@page guides/what-is-canjs What is CanJS?
@parent guides/introduction 1

@body

CanJS is an evolving and improving set of client side JavaScript architectural
libraries that balances innovation and stability.

CanJS is one piece of the larger DoneJS framework, which provides a full stack
of tooling for building high performance, real-time web and mobile
applications.

CanJS, and each of its libraries, can be used in isolation, and are
individually useful, but are even more useful when combined together.

GRAPHIC: show CanJS as a piece of DoneJS, and it’s modules as pieces themselves

CanJS includes everything you need to build a modern, well architected
JavaScript application:

- Observable objects
- Computed properties
- Live binding templates
- Custom elements
- Service modeling and intelligent data caching
- Routing

The CanJS libraries are divided into four categories:

1. __The Core Collection__ - the core, most useful parts of the library.
2. __The Ecosystem Collection__ - extensions to the core collection, which may
be useful for some applications, like mocked AJAX requests, helpers for
importing modules, virtual DOM libraries, and two way data bindings
3. __The Infrastructure Collection__ - Lower level utilities that power the
core collection, generally not things that application developers will use
often, like low level JS and DOM utilities, the core parts of the template and
observable systems.
4. __The Legacy Collection__ - Supported former libraries that are no longer
actively developed, such as previous template engines and observable APIs.

## Our Mission

CanJS’ intended audience is experienced developers building complex
applications, which they intend to live for a long time.

Our guiding principle is:

> You shouldn't have to rewrite your application to keep pace with technology.

That means new ideas and evolving best practices will consistently be
integrated with CanJS libraries, but in a responsible way that makes it easy to
upgrade gracefully.

The JavaScript ecosystem is a constantly changing hellscape. We aim to provide
a stable platform to block out that noise, so you can focus on your app, not
the tools. [More on this here](why-canjs/business-advantages).

ANIMATION: Smooth ride, looking out the window, while hurricane of JavaScript
logos and terminology passes by outside the window. Vehicle has an arrow
pointing forward towards progress.
