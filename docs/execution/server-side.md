# Server-side Execution

You don't need a browser or Vue to execute a graph.
`@baklavajs/core` and `@baklavajs/engine` have no dependency on Vue, so you can run graphs in Node.js, for example to calculate a graph that a user created in the visual editor.

## Installation

Only install the packages you need on the server:

```bash
npm i @baklavajs/core @baklavajs/engine
```

If you use [interface types](../nodes/interface-types.md) for conversions, also install `@baklavajs/interface-types`.

## Sharing node definitions

The server needs the same node types as the browser, since a saved graph only stores the type of each node.
It is recommended to put your node definitions in a separate module that both the frontend and the server import.

Interfaces like `NumberInterface` or `SelectInterface` are part of `@baklavajs/renderer-vue` and import Vue.
If your node definitions use them, the server also needs `@baklavajs/renderer-vue` and `vue` installed.

## Running a saved graph

1. Save the graph in the browser with `editor.save()` and send the result to the server, for example as JSON (see [Saving and Loading](../editor/saving-loading.md)).
2. On the server, create an editor, register all node types and load the state.
3. Run the engine once with `runOnce`.

```ts
import { Editor } from "@baklavajs/core";
import { DependencyEngine } from "@baklavajs/engine";
import { AddNode } from "./nodes";

export async function calculate(state) {
    const editor = new Editor();
    editor.registerNodeType(AddNode);

    // Returns a list of warnings, for example when a node type is not registered
    const warnings = editor.load(state);
    if (warnings.length > 0) {
        console.warn(warnings);
    }

    const engine = new DependencyEngine(editor);
    const result = await engine.runOnce({});

    // result maps each node id to a map of its output values
    const outputs = {};
    for (const [nodeId, values] of result ?? []) {
        outputs[nodeId] = Object.fromEntries(values);
    }
    return outputs;
}
```

::: tip
Don't call `engine.start()` on the server.
`start()` recalculates the graph whenever it changes, which is only useful while a user is editing it.
:::

You can pass [global calculation data](./setup.md#global-calculation-data) to `runOnce` the same way as in the browser.
If you use [interface types](../nodes/interface-types.md), pass the engine so the conversions are applied during the calculation. The view plugin is not needed:

```ts
import { BaklavaInterfaceTypes } from "@baklavajs/interface-types";
import { stringType, numberType } from "./interfaceTypes";

const engine = new DependencyEngine(editor);
new BaklavaInterfaceTypes(editor, { engine }).addTypes(stringType, numberType);
```
