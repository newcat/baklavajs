# Migrating from Baklava V1

## Editor

-   Nodes and Connections are not part of the editor anymore. They moved to `editor.graph`

## Nodes

-   The `NodeBuilder` doesn't exist in V2 anymore. You can either use [class-based] or [declaration-based] approach.
-   Node options have been removed. They are now interfaces with `.setPort(false)`
-   The `calculate` functions behave differently, see [Graph Execution]
