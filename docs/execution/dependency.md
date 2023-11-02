# Dependency Engine

The dependency engine determines the execution order by [topologically sorting](https://en.wikipedia.org/wiki/Topological_sorting) the node graph.

![Node Execution Order](./node_execution_order.png)

In this example, the node execution order is either

-   `A -> D -> B -> C`
-   `D -> A -> B -> C`

## Multiple Connections to a Single Input

By default, the dependency engine doesn't allow multiple connections to a single input interface.
You can, however, opt-in and allow multiple connections:

```ts
import { defineNode, NodeInterface } from "@baklavajs/core";
import { allowMultipleConnections } from "@baklavajs/engine";

export default defineNode({
    inputs: {
        multiple: () => new NodeInterface<number[]>("Multiple Numbers", []).use(allowMultipleConnections),
    },
    // ...
});
```

If you are using TypeScript, make sure the type of your node interface is an array (like `number[]` in this case).
The value of the interface is an array with all the values of all incoming connections.
