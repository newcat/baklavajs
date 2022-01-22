# Node Lifecycle

Each node exposes lifecycle methods that can be overridden.
When using the `defineNode()` approach for creating node types, the lifecycle methods have `this` bound to the node instance.

## `onCreate`

This method is called when the node is instantiated.
It can be seen as the "constructor".

::: tip
This lifecycle is only available when using the `defineNode()` approach.
When using the class-based approach, use the `constructor` instead
:::

## `onPlaced`

This method is called as soon as the node instance has been placed into a graph.
Therefore, the `this.graph` property has been set and can be used when this method is called.

## `onDestroy`

This method is called when the node instance is removed from the graph.
You can use this method for clean-up.
