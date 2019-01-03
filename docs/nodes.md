# Nodes

## Creating custom nodes
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
This method is used to create a new set of NodeInterfaces (inputs/outputs of a node).
```js
getInterfaces() {
    return {
        input1: new NodeInterface(this, true, "number"),
        input2: new NodeInterface(this, true, "number"),
        output: new NodeInterface(this, false, "number")
    }
}
```

### getOptions
This method is used to create a new set of 