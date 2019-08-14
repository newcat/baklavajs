# Engine

[API reference](!!API%{ "module": "@baklavajs/plugin-engine", "type": "class", "name": "engine" }%)

By default, the node editor just "looks good". But it doesn't do anything. This is, where the engine plugin comes into play.
The engine does multiple things:
* Find the order in which the node's `calculation` functions need to be executed
* Transfer the values from and to connected interfaces
* Optionally watch for changes and recalculate all nodes
* Ensure that a connection can't be added if it would result in a cycle in the graph

## Usage
```js
import { Editor } from "@baklavajs/core";
import { Engine } from "@baklavajs/plugin-engine";
const editor = new Editor();
const engine = new Engine(false /* whether to automatically calculate on changes */);
editor.use(engine);
```

## Automatic Execution
The engine can detect changes to a node interface or a node option and automatically recalculate all nodes.
To activate this feature, pass `true` in the constructor (see example above).

## Execution Order
The execution order is determined by building a tree, that has all the output nodes as root. All the nodes that connect to the output nodes are in the second level; all nodes connected to the nodes in the second level are in the third level and so on.

After building the tree, all nodes are calculated from the bottom of the tree to the top. If a node has in multiple levels, it will only be calculated at the lowest of its levels.

### Root Nodes
By default, root nodes are all nodes that only have input interfaces but no output interfaces.
This also means, that if you do not have such a node in your editor, nothing will be calculated as the tree will be empty.
To change this behaviour, you can set the [rootNodes](!!API%{ "module": "@baklavajs/plugin-engine", "type": "class", "name": "engine", "field": "rootNodes" }%) property of the `Engine` plugin to a custom array, which will be used as the root of the tree.