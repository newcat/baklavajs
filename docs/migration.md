# Migrating from Baklava V1

## Editor

-   Nodes and Connections are not part of the editor anymore. They moved to `editor.graph`
-   There is no "plugin" concept anymore. Instead of calling `editor.use(...)` for engine etc., use the new constructors 
-   The parameters of the `editor.registerNodeType()` method have changed. See the documentation for more details.

## Nodes

-   The `NodeBuilder` doesn't exist in V2 anymore. You can either use [class-based](/nodes/nodes#class-based-approach) or [declaration-based](/nodes/nodes#definenode) approach.
-   Node options have been removed. They are now interfaces with `.setPort(false)`
-   The `calculate` function behaves differently, see [Graph Execution](/execution/setup)

## Sidebar

-   The sidebar is now per-node instead of per-option / per-interface as before. See TODO: Sidebar

## Events

- `addListener` has been renamed to `subscribe`
- `removeListener` has been renamed to `unsubscribe`

## Engine

- Instead of a single engine there are multiple different Engine implementations now. If you want to keep the behavior of the v1 engine, use the new `DependencyEngine`
- There is no longer a boolean parameter for the constructor to enable the calculate-on-change-behavior. Instead, call `engine.start()`

## Interface Types

- The interface type plugin does not use strings anymore to identify node interface types. Instead, you need to create `NodeInterfaceType`s. See the [documentation](/plugins/interface-types) for more information.
- Conversions have to be added directly to the `NodeInterfaceType`.
- It is no longer possible to specify the color of the port using JS/TS. Instead, you need to use CSS.

## Vue Renderer

- Since the plugin concept has been abandoned, the `ViewPlugin` is now called `ViewModel`
- The `registerOption` method has been removed, since the options are now directly defined in the node interfaces.