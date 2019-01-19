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

### Class
If you have a more complex node, you can create a subclass of `Node`
and implement the required methods/properties yourself.
A minimal class could look like this:
```js
import { Node } from "baklavajs";
import InputOption from "baklavajs/options/InputOption.vue";
import SelectOption from "baklavajs/options/SelectOption.vue";

export class MyNode extends Node {
    
    type = "MyNode";
    name = this.type;

    constructor() {
        super();
        this.addInputInterface("Input", "boolean", InputOption);
        this.addOutputInterface("Output", "boolean");
        this.addOption("Select", SelectOption, { selected: "Test1", items: ["Test1", "Test2", "Test3"] })
    }

    public calculate() {
        this.getInterface("Output").value = this.getInterface("Input");
    }

}
```

Every node consists of three parts:
- Input Interfaces
- Options
- Output Interfaces

All of these parts are customizable.


## Node Options
Options are just Vue components, that support the `v-model` directive.
Their value can be written or read by using the [setOptionValue](api.md#Node+setOptionValue)
or [getOptionValue](api.md#Node+getOptionValue) methods.

There are prebuilt options that can be used:
- [InputOption](options/input.md): A simple text field
- [SelectOption](options/select.md): A dropdown select
- [TextOption](options/text.md): Displays arbitrary strings


## Calculation
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