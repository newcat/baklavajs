# Interface Types

[API reference](!!API%{ "module": "@baklavajs/plugin-interface-types", "type": "class", "name": "InterfaceTypePlugin" }%)

Every node interface has a type associated with it. The type is an arbitrary string.
By default, two node interfaces can only be connected if they have the same type.
You can, however, override this behavior by using [*conversions*](#conversions).

## Usage
```js
import { Editor } from "@baklavajs/core";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
const editor = new Editor();
const intfTypePlugin = new InterfaceTypePlugin();
editor.use(intfTypePlugin);
```

## Register Interface Types
For adding conversions and coloring the ports, you need to register the type.

```js
intfTypePlugin.addType("string", "#00FF00");
```

The [addType](!!API%{ "module": "@baklavajs/plugin-interface-types", "type": "class", "name": "InterfaceTypePlugin", "field": "addType" }%) method takes two parameters:
* `name`: Name of the interface.
* `color`: Color for the port. The color can be any valid CSS color.

You can now use the type when creating interfaces like this:
```js
// NodeBuilder
new NodeBuilder("MyNode")
    .addInputInterface("My Interface", "InputOption", "", { type: "string" })
    .build();

// Class
class MyNode extends Node {
    constructor() {
        super();
        this.addInputInterface("My Interface", "InputOption", "", { type: "string" })
    }
}
```

## Conversions

> This only applies in conjunction with the [Engine](/plugins/engine.md) plugin

Conversions allow you to connect two node interfaces with different types.
Every conversion has a source type, a target type and a transformation function.
The transformation function will be called when a value needs to be transferred from a node interface of the source type to a node interface of the target type. You can use the transformation function to transform the value to the format that is expected by the target node interface.
If, for example, you want to allow connections from a node interface of type `string` to a node interface of type `number`, you can add the following conversion:
```js
intfTypePlugin.addConversion("string", "number", (v) => parseInt(v));
```

> If you do not specify a transformation function when adding a conversion, the value will be passed as-is from the source node interface to the target node interface.