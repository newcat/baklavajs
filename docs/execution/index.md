# Graph Execution

BaklavaJS not only offers a way to edit compute graphs but also to execute them.
This is done by _engines_. There are different types of engines which execute the graph in different ways.

-   [Dependency Engine](./dependency)
-   [Forward Engine](./forward)

::: info
If you want the behavior of Baklava V1's engine, use the dependency engine.
:::

There are, however, some prerequisites that are indenpendent of the engine implementation:

## Node `calculate` function

Each node needs to have a caluate function.
The calculate function receives the node inputs as a JavaScript object (and optionally some [global calculation data](#global-calculation-data)), does the calculation and returns the values for the outputs as a JavaScript object.

Let's take a simple "Add Node" as an example.
Mathematically speaking, it should perform this function: `f(a, b) = a + b`.
This is done in Baklava as follows:

```js
import { defineNode, NodeInterface } from "@baklavajs/core";
import { NumberInterface, SelectInterface } from "@baklavajs/renderer-vue";

export default defineNode({
    type: "AddNode",
    inputs: {
        number1: () => new NumberInterface("Number", 1),
        number2: () => new NumberInterface("Number", 10),
    },
    outputs: {
        result: () => new NodeInterface("Result", 0),
    },
    calculate(inputs) {
        return {
            result: inputs.number1 + inputs.number2,
        };
    },
});
```

`inputs` in this case has the following format:

```js
{
    number1: 1,
    number2: 10
}
```

Of course the actual values depend on the values of the input interfaces.

The calculate function needs to return an object that contains all the outputs as keys mapping to their corresponding values (see example above).

## Setting up the engine

The general setup is independent of which engine you choose.

```js
import { Editor } from "@baklavajs/core";
import { DependencyEngine } from "@baklavajs/engine";

const editor = new Editor();
const engine = new DependencyEngine(editor);
engine.start();
```

The second parameter specifies whether the engine should automatically execute the graph when it

## Global calculation data
