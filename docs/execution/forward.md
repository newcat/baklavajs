# Forward Engine

::: warning
The forward engine is currently in beta and may have breaking changes even in non-major releases. Use with caution and provide feedback if you try it out!
:::

The forward engine uses a fundamentally different execution model than the [dependency engine](./dependency).
Instead of calculating all nodes based on their dependencies, the forward engine starts at a specific node and follows **execution-flow connections** forward, calculating nodes along the way.

This is the same execution model used by Unreal Engine Blueprints and Unity Visual Scripting:
execution flows forward through explicit connections, while data dependencies are resolved backward on demand.

## When to use the Forward Engine

Use the forward engine when you need:

- **Explicit execution flow**: control which nodes run and in what order
- **Branching**: conditionally execute different paths in your graph
- **Loops**: execute a subchain of nodes multiple times
- **Event-driven execution**: start execution from a specific trigger node

If you just need a simple dataflow graph where all nodes are always calculated, use the [dependency engine](./dependency) instead.

## Execution-flow connections

The forward engine introduces a distinction between two types of connections:

- **Execution-flow connections**: determine _which_ nodes run and _in what order_. Represented by special `ExecutionFlowInterface` node interfaces.
- **Data connections**: carry values between nodes. These are regular node interfaces, resolved on demand when a node is about to execute.

### Creating execution-flow interfaces

```js
import { defineNode, NodeInterface } from "@baklavajs/core";
import { ExecutionFlowInterface } from "@baklavajs/engine";

const MyNode = defineNode({
    type: "MyNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("Exec"),
        value: () => new NodeInterface("Value", 0),
    },
    outputs: {
        execOut: () => new ExecutionFlowInterface("Exec"),
        result: () => new NodeInterface("Result", 0),
    },
    calculate({ value }) {
        return { execOut: true, result: value * 2 };
    },
});
```

`ExecutionFlowInterface` is a `NodeInterface<boolean>` with the execution-flow type already set. This ensures the `calculate` return type is compatible with the `boolean` type of the interface.

::: tip
Execution-flow outputs must return a truthy value from `calculate` to activate the next node.
Returning a falsy value (e.g. `false`) skips that execution path, which is how [branching](#branching) works.
:::

::: details Using setExecutionFlow manually
If you need more control, you can also use `setExecutionFlow` directly on any `NodeInterface`. Make sure to use `NodeInterface<boolean>` to avoid type errors:

```ts
import { setExecutionFlow } from "@baklavajs/engine";

const intf = new NodeInterface()<boolean>("Exec", false);
setExecutionFlow(intf);
```

:::

## Setting up the engine

```js
import { Editor } from "@baklavajs/core";
import { ForwardEngine } from "@baklavajs/engine";

const editor = new Editor();
const engine = new ForwardEngine(editor);
```

### Manual execution

To manually run the engine, call `runOnce` with a starting node:

```js
const triggerNode = editor.graph.nodes[0];
const result = await engine.runOnce(undefined, triggerNode, undefined);
```

The first argument is the [global calculation data](./setup#global-calculation-data), the second is the node to start execution from, and the third is optional node update event data.

### Automatic execution

When started with `engine.start()`, the forward engine will automatically re-run whenever a node's interface value changes, using the changed node as the starting point:

```js
engine.start();
// Now any value change will trigger forward execution from the affected node
```

## How execution works

When the engine runs, it follows this process:

1. Start at the trigger node
2. For each node in the execution queue:
    1. Gather data inputs (pull values from connected data sources, use defaults for unconnected inputs)
    2. Call the node's `calculate` function
    3. For each execution-flow output with a truthy value, add the connected nodes to the queue
3. Repeat until the queue is empty

### Data resolution (backward pull)

When a node in the execution flow needs data from a connected node that is _not_ part of the execution flow (a pure data node), the engine **pulls** the value by recursively calculating that node and its dependencies. This is similar to how Unreal Engine resolves data pins.

```js
const DataNode = defineNode({
    type: "DataNode",
    inputs: {
        value: () => new NodeInterface("Value", 5),
    },
    outputs: {
        out: () => new NodeInterface("Out", 0),
    },
    calculate({ value }) {
        return { out: value * 2 };
    },
});

const ExecNode = defineNode({
    type: "ExecNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("Exec"),
        data: () => new NodeInterface("Data", 0),
    },
    outputs: {
        execOut: () => new ExecutionFlowInterface("Exec"),
        result: () => new NodeInterface("Result", 0),
    },
    calculate({ data }) {
        return { execOut: true, result: data + 1 };
    },
});
```

If `DataNode.out` is connected to `ExecNode.data`, the engine will automatically calculate `DataNode` when `ExecNode` needs its value, even though `DataNode` has no execution-flow connections.

Data nodes are stateless: they are re-evaluated every time their value is pulled, just like pure functions in Unreal Blueprints.

## Branching

Branching is achieved by conditionally returning truthy or falsy values for execution-flow outputs:

```js
const BranchNode = defineNode({
    type: "BranchNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("Exec"),
        condition: () => new NodeInterface("Condition", false),
    },
    outputs: {
        trueExec: () => new ExecutionFlowInterface("True"),
        falseExec: () => new ExecutionFlowInterface("False"),
    },
    calculate({ condition }) {
        return {
            trueExec: !!condition,
            falseExec: !condition,
        };
    },
});
```

When `condition` is `true`, only the nodes connected to the `trueExec` output will execute.
When `condition` is `false`, only the nodes connected to `falseExec` will execute.

## Re-execution

If a node can be reached through multiple execution paths, it will execute multiple times.
For example, if a node with two execution outputs (`A` and `B`) both connect to the same downstream node, that node will run twice: once for each path.

This behavior is intentional and matches how Unreal Engine Blueprints work. It is also what enables loops.

## Loops

The forward engine supports loops through the `executeOutput` function, which is available on the calculation context. This function allows a node to programmatically fire an execution-flow output — and await the entire downstream chain — from within its `calculate` function. By calling it in a loop, you can execute the downstream chain multiple times.

### `executeOutput(outputKey, outputValues?)`

- `outputKey`: the key of the execution-flow output to fire
- `outputValues`: optional object with values for the current node's data outputs. Downstream nodes that pull data from this node will see these values during this chain execution.
- Returns: `Promise<CalculationResult>` — the results of all nodes executed in the chain

When `executeOutput` is used for an output, the engine will **not** automatically fire that output again after `calculate` returns. This prevents double-execution.

### ForLoop example

```ts
import { defineNode, NodeInterface } from "@baklavajs/core";
import { ExecutionFlowInterface, ForwardCalculationContext } from "@baklavajs/engine";

const ForLoopNode = defineNode({
    type: "ForLoopNode",
    inputs: {
        execIn: () => new ExecutionFlowInterface("Exec"),
        start: () => new NodeInterface("Start", 0),
        end: () => new NodeInterface("End", 10),
    },
    outputs: {
        loopBody: () => new ExecutionFlowInterface("Loop Body"),
        completed: () => new ExecutionFlowInterface("Completed"),
        index: () => new NodeInterface("Index", 0),
    },
    async calculate({ start, end }, context) {
        const { executeOutput } = context as ForwardCalculationContext;

        for (let i = start; i < end; i++) {
            // Fire the "loopBody" exec output, providing the current index
            // as the value for the "index" data output.
            // Downstream nodes connected to "index" will see this value.
            await executeOutput("loopBody", { index: i });
        }

        // Return loopBody: false so the engine doesn't fire it again.
        // Return completed: true so the engine fires the "completed" path.
        return { loopBody: false, completed: true, index: end };
    },
});
```

Downstream nodes in the loop body can read the current iteration index by connecting to the `index` data output. On each iteration, `executeOutput` provides the updated `index` value so that data pulls from the loop node resolve to the correct value for that iteration.

The `completed` output fires once after the loop finishes, allowing you to continue execution after the loop.

::: tip
You can use the same pattern to implement `ForEach`, `While`, or any other control-flow node.
The key insight is that `executeOutput` is just an async function — you can call it conditionally, in a loop, or even recursively.
:::

## Cycle handling

- **Execution-flow connections** are allowed to form cycles. This is necessary for loop support.
- **Data connections** must remain acyclic. The engine will prevent you from creating data connections that would introduce a cycle.
