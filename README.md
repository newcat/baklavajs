# BaklavaJS

[![Build Status](https://travis-ci.org/newcat/baklavajs.svg?branch=master)](https://travis-ci.org/newcat/baklavajs)
[![npm version](https://badge.fury.io/js/baklavajs.svg)](https://badge.fury.io/js/baklavajs)

Graph / node editor in the browser using VueJS
![example](docs/img/example.png)

## Getting started
First, you need to install the library:
```bash
# npm
npm i baklavajs

# yarn
yarn add baklavajs
```

Now you need to tell Vue to use this library. Add the following code in your application entry file (usually `index.js` or `main.js`):
```js
import BaklavaJS from "baklavajs";
Vue.use(BaklavaJS);
```

The library is now installed and ready to use.
To actually use it, you need to create an `Editor` instance, which you can provide to the editor component.
This is a minimal wrapper component:
```vue
<template>
    <baklava-editor :model="editor"></baklava-editor>
</template>

<script>
import { Editor } from "baklavajs";

export default {
    data() {
        return {
            editor: new Editor()
        }
    }
}
</script>
```

## Create custom nodes
There are two ways to create custom nodes:

### Node Builder
The node builder is a simple way to build nodes "on the fly".
```ts
import { NodeBuilder, Options } from "baklavajs";

export default new NodeBuilder("BuilderTestNode")
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

### Class
If you have a more complex node, you can create a subclass of `Node`
and implement the required methods/properties yourself.
A minimal class could look like this:
```js
import { Node, Options } from "baklavajs";

export class MyNode extends Node {
    
    type = "MyNode";
    name = this.type;

    constructor() {
        super();
        this.addInputInterface("Input", "boolean", Options.InputOption);
        this.addOutputInterface("Output", "boolean");
        this.addOption("Select", Options.SelectOption, { selected: "Test1", items: ["Test1", "Test2", "Test3"] })
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

### Node Options
Options are just Vue components, that support the `v-model` directive.
Their value can be written or read by using the [setOptionValue](docs/api.md#Node+setOptionValue)
or [getOptionValue](docs/api.md#Node+getOptionValue) methods.

There are prebuilt options that can be used:
- [ButtonOption](docs/options/button.md): A button that opens the sidebar when clicked
- [CheckboxOption](docs/options/checkbox.md): A checkbox for setting boolean values
- [InputOption](docs/options/input.md): A simple text field
- [NumberOption](docs/options/number.md): A numeric up/down field for numeric values
- [SelectOption](docs/options/select.md): A dropdown select
- [TextOption](docs/options/text.md): Displays arbitrary strings

These options are under the `Options` namespace. For usage examples, see the code snippets above.

When providing complex default values like arrays or objects as default values using the NodeBuilder's
[addInputInterface](docs/api.md#NodeBuilder+addInputInterface) or
[addOption](docs/api.md#NodeBuilder+addOption) method, you need to provide an option that returns
the default array or object. This ensures that multiple instances of the node interface or node option
all have their own data objects.

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

## Further documentation
* [Editor functions](docs/editor.md)
* [Customize styles and colors](docs/styling.md)
* [API Reference](docs/api.md)

## Roadmap
* Add panning for all nodes
* Allow connections from input to output (auto-reverse)
* Optional keyboard shortcuts