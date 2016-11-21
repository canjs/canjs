### Compared to other frameworks

In Angular 1.X, there are no direct observables. It uses dirty checking with regular JavaScript objects, which means at the end of the current $digest cycle, it will run an algorithm that determines what data has changed. This has performance drawbacks, as well as making it harder to write simple unit tests.

Angular 2.0

In React, there is no observable data layer. You could define a fullName like we showed above, but it would be recomputed every time render is called, whether or not it has changed. Though it's possible to isolate and unit test its ViewModel, it's not quite set up to make this easy. For more details on how other React-based frameworks compare, read [this](./comparison.html).
