# Engine

[API reference](!!API%{ "type": "class", "name": "engine" }%)

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

## Automatic execution
The engine can detect changes to a node interface or a node option and automatically recalculate all nodes.
To activate this feature, pass `true` in the constructor (see example above).

## Execution order
TODO