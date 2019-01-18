# Nodes

## Creating custom nodes

There are two ways to create custom nodes:

### Node Builder
The node builder is a simple way to build nodes "on the fly".
```ts
import { NodeBuilder } from "baklavajs";
import InputOption from "baklavajs/options/InputOption.vue";

export default new NodeBuilder("BuilderTestNode")
    .addInputInterface("Input 1", "string", InputOption, "default1")
    .addInputInterface("Input 2", "string", InputOption, "default2")
    .addOption("Separator", InputOption, ",")
    .addOutputInterface("Output", "string")
    .onCalculate((n) => {
        const s1 = n.getInterface("Input 1").value;
        const s2 = n.getInterface("Input 2").value;
        const sep = n.getOptionValue("Separator");
        n.getInterface("Output").value = s1 + sep + s2;
    })
    .build();
```

To create a custom node, you need to write a class which inherits from the base node class provided by the library.
A minimal class could look like this:
```js
import { Node } from "baklavajs";

export class MyNode extends Node {
    
    type = "MyNode";
    name = "MyNode";

    getInterfaces() {
        return {};
    }

    getOptions() {
        return {};
    }

}
```

Every node consists of three parts:
- Input Interfaces
- Options
- Output Interfaces

All of these parts are customizable.

### getInterfaces
This method is used to create a new set of [NodeInterfaces](nodeInterfaces.md) (inputs/outputs of a node).
```js
import { NodeInterface } from "baklavajs";

getInterfaces() {
    return {
        input1: new NodeInterface(this, true, "number"),
        input2: new NodeInterface(this, true, "number"),
        output: new NodeInterface(this, false, "number")
    }
}
```

### getOptions
This method is used to create a new set of options. Options are just Vue components,
that support the `v-model` directive. Their value can be written to or read from the
`options` field of the instance.

There are prebuilt options that can be used:
- [InputOption](options/input.md): A simple text field
- [SelectOption](options/select.md): A dropdown select
- [TextOption](options/text.md): Displays arbitrary strings

```js
import InputOption from "baklavajs/dist/options/InputOption.vue";

getOptions() {
    return {
        myOption: InputOption
    };
}
```
The value can later be accessed with `this.options.myOptions`

### Calculation
Each Node class can overwrite the `calculate()` function to perform some logic.
Usually the calculation functions reads the values from the input interfaces and the options,
performs some logic and sets the values of the output interfaces with the results.

For a node, that outputs the sum of its two inputs, the calculation function could look like this:
```js
calculate() {
    const a = this.interfaces.input1.value;
    const b = this.interfaces.input2.value;
    this.interfaces.output.value = a + b;
}
```