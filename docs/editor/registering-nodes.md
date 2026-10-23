# Registering Nodes

## Basic Usage

```ts
import MyNode from "./MyNode";

editor.registerNodeType(MyNode);
```

::: warning
`registerNodeType` creates a throwaway instance of the node type to read its `type` and `title`.
Baklava also creates instances without arguments in other places, for example when loading a graph, pasting nodes or undoing a deletion.

This means the constructor (or the `onCreate` lifecycle method when using `defineNode()`) of your node type:

-   is called without arguments, so all parameters must be optional
-   runs even if no node of this type is ever added to a graph, so it should not have side effects like network requests or subscribing to global events

Put code that should only run for nodes in a graph into the [`onPlaced`](../nodes/lifecycle.md#onplaced) lifecycle method instead and clean it up in [`onDestroy`](../nodes/lifecycle.md#ondestroy).
:::

## Advanced Options

### Category

When you have a lot of node types, the node palette can get a bit convoluted.
To help your users find node types quicker, you can divide them into **categories**.
You don't need to create the category manually; just specify the name of the category when registering the node type:

```ts
editor.registerNodeType(MyNode, { category: "My Category" });
```

### Custom Title

By default, the node title is determined by the `title` property of the node type.
However, you can set a custom title for the node palette:

```ts
editor.registerNodeType(MyNode, { title: "Custom title" });
```

::: warning
This only changes the title in the node palette.
It does not change the title of the nodes being created.
For that, you need to modify the title property of your node type.
:::
