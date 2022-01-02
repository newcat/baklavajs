# Graph Execution

BaklavaJS not only offers a way to edit compute graphs but also to execute them.
This is done by _engines_. There are different types of engines which execute the graph in different ways.

-   [Dependency Engine](./dependency)
-   [Forward Engine](./forward)

::: info
If you want the behavior of Baklava V1's engine, use the dependency engine.
:::

There are, however, some prerequisites that are indenpendent of the engine implementation:

## Node calculate function

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

## Global calculation data

You can provide data that is passed to every node's `calculate()` function as a second parameter.
There are two ways to provide the global calculation to the engine:

### When using the engine in manual mode with `runOnce`

```ts
engine.runOnce({ offset: 5 });
```

### When using the engine in automatic mode (after `engine.start()`)

In this case you need to register a hook beforehand.
This hook is called for every calculation; except the ones triggered manually with `engine.runOnce()`
```ts
const token = Symbol("token");
engine.hooks.gatherCalculationData.subscribe(token, () => {
    return { offset: 5 };
});
engine.start();
```

You can find more information about hooks in the documentation for the [event system](/event-system).

### Consuming global data

You can now use the global data in the `calculate` function of your nodes:

```ts
export default defineNode({
    // ...
    calculate(inputs, global) {
        return {
            result: inputs.number1 + inputs.number2 + global.offset,
        };
    },
});
```
