# Creating Custom Nodes <!-- omit in toc -->

- [Basics](#basics)
- [Custom Node Implementation](#custom-node-implementation)
  - [Node Builder](#node-builder)
  - [Class](#class)
- [Calculation](#calculation)

## Basics
Every node consists of three parts:
* [Output Interfaces](/node-interfaces.md)
* [Options](/node-options.md)
* [Input Interfaces](/node-interfaces.md)

![node parts](img/node_parts.png)

All of these parts are customizable.

## Custom Node Implementation
There are two ways to create custom nodes:

### Node Builder
The [NodeBuilder](!!API%{ "type": "class", "name": "nodebuilder" }%) is a simple way to build nodes "on the fly".
```js
import { NodeBuilder, Options } from "baklavajs";

export default new NodeBuilder("MathNode")
    .addInputInterface("Number 1", "number", Options.NumberOption, 1)
    .addInputInterface("Number 2", "number", Options.NumberOption, 10)
    .addOption("Operation", Options.SelectOption, () => ({
        selected: "Add",
        items: [ "Add", "Subtract" ]
    }))
    .addOutputInterface("Output", "number")
    .onCalculate((n) => {
        const n1 = n.getInterface("Number 1").value;
        const n2 = n.getInterface("Number 2").value;
        const operation = n.getOptionValue("Operation").selected;
        let result;
        if (operation === "Add") {
            result = n1 + n2;
        } else if (operation === "Subtract") {
            result = n1 - n2;
        }
        n.getInterface("Output").value = result;
    })
    .build();
```

> Don't forget to `build()` at the end.

### Class
If you have a more complex node, you can create a subclass of `Node`
and implement the required methods/properties yourself.
```js
import { Node, Options } from "baklavajs";

export class MathNode extends Node {
    
    type = "MathNode";
    name = this.type;

    constructor() {
        super();
        this.addInputInterface("Number 1", "number", Options.NumberOption, 1);
        this.addInputInterface("Number 2", "number", Options.NumberOption, 10);
        this.addOutputInterface("Output", "number");
        this.addOption("Operation", Options.SelectOption, () => ({
            selected: "Add",
            items: [ "Add", "Subtract" ]
        }));
    }

    public calculate() {
        const n1 = this.getInterface("Number 1").value;
        const n2 = this.getInterface("Number 2").value;
        const operation = this.getOptionValue("Operation").selected;
        let result;
        if (operation === "Add") {
            result = n1 + n2;
        } else if (operation === "Subtract") {
            result = n1 - n2;
        }
        this.getInterface("Output").value = result;
    }

}
```

## Calculation
Each Node class can overwrite the `calculate()` function to perform some logic.
Usually the calculation functions reads the values from the input interfaces and the options,
performs some logic and sets the values of the output interfaces with the results.

For a node, that outputs the sum of its two inputs, the calculation function could look like this:
```js
calculate() {
    const a = this.getInterface("Number 1").value;
    const b = this.getInterface("Number 2").value;
    this.getInterface("Output").value = a + b;
}
```