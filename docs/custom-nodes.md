# Creating Custom Nodes <!-- omit in toc -->

- [Basics](#basics)
- [Node Interfaces](#node-interfaces)
- [Node Options](#node-options)
  - [Sidebar](#sidebar)
  - [Prebuilt Options](#prebuilt-options)
  - [Default Values](#default-values)
- [Custom Node Implementation](#custom-node-implementation)
  - [Node Builder](#node-builder)
  - [Class](#class)
- [Calculation](#calculation)

## Basics
Every node consists of three parts:
* [Output Interfaces](#node-interfaces)
* [Options](#node-options)
* [Input Interfaces](#node-interfaces)

![node parts](img/node_parts.png)

All of these parts are customizable.

## Node Interfaces
Interfaces are used to receive data from other nodes (*input interfaces*) or send data to other nodes (*output interfaces*). A node interface has two important properties:

| Property | Description |
| --- | --- |
| <p>**name**</p> | <p>The name is displayed to the user. You also need the name to get the value of the interface</p> |
| <p>**type**</p> | <p> The type can be any string. For more information, see [Node Interface Types](/interface-types.md)</p> |

An input interface, which is not connected, can display a node option to allow the user to change its value.

## Node Options
Options are just Vue components, that support the `v-model` directive.
This means, they receive the option's value through the `value` prop and can write updates
to the value using the `input` event.
Additionally, each option can emit the `openSidebar` event, which will open the [sidebar](#sidebar)
to display a more advanced UI for the option.

Their value can be written or read by using the [setOptionValue](docs/api.md#Node+setOptionValue)
or [getOptionValue](docs/api.md#Node+getOptionValue) methods.

### Sidebar
Some options can require a more complex UI which would not fit in the limited space that a node provides.
In this case, you can display a button in the node that will open the sidebar when pressed.
The advanced UI can now be displayed in the sidebar.

> Open the sidebar by emitting the `openSidebar` event in an option.

```js
import { Options } from "baklavajs";
import MySidebarOption from "./MySidebarOption.vue";

// in the node constructor
this.addOption("SidebarTest", Options.ButtonOption, () => ({ testtext: "any" }), MySidebarOption);
```

Both the component in the node as well as the component in the sidebar
will receive the current option value through the `value` prop.

### Prebuilt Options
There are prebuilt options like text and number input, dropdown menu and many more available.
These are documented [here](/prebuilt-options).

### Default Values
> When providing complex default values like arrays or objects as default values using the NodeBuilder's
> [addInputInterface](docs/api.md#NodeBuilder+addInputInterface) or
> [addOption](docs/api.md#NodeBuilder+addOption) method, you need to provide an option that returns
> the default array or object. This ensures that multiple instances of the node interface or node option
> all have their own data objects.

Example:
```js
new NodeBuilder("MyNode")
    // This is fine, because we provide a primitive as default value
    .addInputInterface("Primitive", "type", MyOption, "default")
    // But in this case we need to provide a function to create an object
    .addInputInterface("Complex", "type", MyOption, () => {
        return { a: 1, b: "Hello World!" };
    })
```

## Custom Node Implementation
There are two ways to create custom nodes:

### Node Builder
The [node builder](api.md#NodeBuilder) is a simple way to build nodes "on the fly".
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