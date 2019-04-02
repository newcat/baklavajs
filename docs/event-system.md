# Event System

BaklavaJS uses a custom event system to allow for extensibility and plugins. Each class that supports has an `events` and/or a `hook` property, which can be used to subscribe to an event or tap into a hook.

Most JS event systems need a reference to the listener function to remove an event listener. However, this doesn't work well with inline arrow-functions. To support such functions as well, Baklava uses so-called `tokens` for adding and removing a listener. The token can be any reference-type (for example and object, array, or `this` when you are in a class) or symbol. It is provided when adding an event listener and provided again when removing the listener.

## Events
There are two types of events: *normal* and *preventable* events. *Normal* events are usually fired after an action, to react on that action. *Preventable* events, on the other hand, are fired before an action and can be used by the listener to prevent the action from happening. This is done by returning `false` in a listener function. Most preventable events have the `before` prefix in their name.

## Hooks
Hooks are similar to events, however, hooks have the ability to pass data from one hook to another. They are executed in the order they have been tapped into.