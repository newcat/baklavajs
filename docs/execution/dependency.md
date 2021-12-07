# Dependency Engine

The dependency engine determines the execution order by [topologically sorting](https://en.wikipedia.org/wiki/Topological_sorting) the node graph.

![Node Execution Order](/img/node_execution_order.png)

In this example, the node execution order is either

-   `A -> D -> B -> C`
-   `D -> A -> B -> C`