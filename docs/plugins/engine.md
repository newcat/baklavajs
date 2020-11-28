# Engine

[API reference](!!API%{ "module": "@baklavajs/plugin-engine", "type": "class", "name": "Engine" }%)

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
To change this behaviour, you can set the [rootNodes](!!API%{ "module": "@baklavajs/plugin-engine", "type": "class", "name": "Engine", "field": "rootNodes" }%) property of the `Engine` plugin to a custom array, which will be used as the root of the tree.

### Providing Data for Calculation and Getting the Results
In this example, we will pass an object to the sample nodes. The object contains a key `foo` with a string value.
The sample nodes have an input interface and will concatenate the text from this interface with the value provided by the calculation data.
They will return the concatenated value and we will print it to the console.

**Sample Nodes**
```js
// Sample node with node builder
new NodeBuilder("SampleNode")
    .addInputInterface("text", "InputOption", "", { displayName: "Enter your text" })
    .onCalculate((n, d) => {
        const t = n.getInterface("text").value;
        return t + d.foo;
    })
    .build();

// Sample node with class
class SampleNode extends Node {

    type = "SampleNode";
    name = this.type;

    constructor() {
        super();
        this.addInputInterface("text", "InputOption", "", { displayName: "Enter your text" });
    }

    calculate(data) {
        const t = this.getInterface("text").value;
        return t + d.foo;
    }

}
```

**WITH Automatic Execution**
```js
engine.hooks.gatherCalculationData.tap(this, () => {
    // return the data you want to pass to all nodes
    // you can return whatever you want and all nodes will receive this value as a parameter in their calculate function
    return { foo: "bar" };
});
engine.events.calculated.addListener(this, (r) => {
    // r is a Map<Node, any> with the key being a node instance and the value being what the node's calculate function returned
    for (const v of r.values()) {
        console.log(v);
    }
});
```

**WITHOUT Automatic Execution**
```js
const r = await engine.calculate({ foo: "bar" });
for (const v of r.values()) {
    console.log(v);
}
```
