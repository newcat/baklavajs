# Registering Nodes

## Basic Usage

```ts
import MyNode from "./MyNode";

editor.registerNodeType(MyNode);
```

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
