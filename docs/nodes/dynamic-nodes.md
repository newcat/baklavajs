---
lang: en-US
title: Dynamic Nodes
---

<script setup>
import ApiLink from "../components/ApiLink.vue";
</script>

# Dynamic Nodes

Sometimes you may want to have nodes, that have a different set interfaces based on certain parameters.
For example, a `Math Node` that can add or subtract two numeric values, but also calculate the sine of a single number.

To easily implement this, you can use the <code><ApiLink type="functions" module="@baklavajs/core" name="defineDynamicNode">defineDynamicNode</ApiLink></code> function:

```js
import { defineDynamicNode, NodeInterface, NumberInterface, SelectInterface } from "baklavajs";

export default defineDynamicNode({
    type: "DynamicMathNode",
    inputs: {
        operation: () => new SelectInterface("Operation", "Addition", ["Addition", "Subtraction", "Sine"]),
    },
    outputs: {
        result: () => new NodeInterface("Result", 0),
    },
    onUpdate({ operation }) {
        if (operation === "Sine") {
            return {
                inputs: {
                    input1: () => new NumberInterface("Input", 0),
                },
            };
        } else {
            return {
                inputs: {
                    input1: () => new NumberInterface("Input", 0),
                    input2: () => new NumberInterface("Input", 0),
                },
            };
        }
    },
    calculate(inputs) {
        let result = 0;
        switch (inputs.operation) {
            case "Addition":
                result = inputs.input1 + inputs.input2;
                break;
            case "Subtraction":
                result = inputs.input1 - inputs.input2;
                break;
            case "Sine":
                result = Math.sin(inputs.input1);
                break;
        }
        return { result };
    },
});
```

The definition of a dynamic node is similar to the one of a normal node with these notable differences:

-   The inputs and outputs defined as part of the node definition are called _static interfaces_. They are always present in the dynamic node.
-   A dynamic node definition requires an `onUpdate` function. This function is called once the node is placed as well as whenever the value of one of the static interfaces changes.

The `onUpdate(inputValues, outputValues)` function receives the values of the static interfaces as parameters. Based on that, it must return an object with the following type:

```ts
type DynamicNodeDefinition = Record<string, () => NodeInterface<any>>;
interface DynamicNodeUpdateResult {
    inputs?: DynamicNodeDefinition;
    outputs?: DynamicNodeDefinition;
    forceUpdateInputs?: string[];
    forceUpdateOutputs?: string[];
}
```

The `inputs` and `outputs` properties have the same format as when defining a normal node.
They define, which _dynamic interfaces_ the dynamic node should have based on the values of the static interfaces.
The keys of the object are used as identifiers.
If an interface with the specified key does not exist on the dynamic node yet, it will be created.
Similarly, if there is an interface with a key that is not specified in the `DynamicNodeUpdateResult` it is removed.
Essentially, the `DynamicNodeUpdateResult` describes a target state and the dynamic node automatically performs the necessary steps (adding / removing interfaces) to achieve that target state.

## Force Updates

By default, when an interface with a key is specified in the `DynamicNodeUpdateResult` and the key does already exist on the dynamic node, nothing is done for that key.
This can be an issue, for example when switching types of node interfaces.
Let's consider this `onUpdate` method:

```js
onUpdate({ type }) {
    return type === "Number"
        ? { inputs: { myInput: () => new NumberInterface("Input", 0) } }
        : { inputs: { myInput: () => new TextInputInterface("Input", "") } };
}
```

In this case, the `myInput` node interface is not replaced, as the key already exists.
To fix this issue, you can provide keys that should always be updated:

```js
onUpdate({ type }) {
    const inputs = type === "Number"
        ? { myInput: () => new NumberInterface("Input", 0) }
        : { myInput: () => new TextInputInterface("Input", "") };
    return {
        input,
        forceUpdateInputs: ["myInput"]
    };
}
```

Note, however, that this will always delete any interfaces with key `myInput` and therefore destroy all connections to it, even if a node interface of the same type is created afterwards.
