# Engine

By default, the node editor just "looks good". But it doesn't do anything. This is, where the engine plugin comes into play.
The engine does multiple things:
* Find the order in which the node's `calculation` functions need to be executed
* Transfer the values from and to connected interfaces
* Optionally watch for changes and recalculate all nodes
* Ensure that a connection can't be added if it resulted in a cycle in the graph

For more information, see the [API reference](!!API%{ "type": "class", "name": "engine" }%)

## Execution order
TODO