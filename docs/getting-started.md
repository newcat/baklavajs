# Getting Started

## Installation

::: tip
While not recommended, it is possible to use BaklavaJS standalone; without Vue and any build tools.
For more information see [Browser Build](./browser-build.md)
:::

BaklavaJS is split into multiple packages:

-   `@baklavajs/core`: Contains all the core elements that Baklava needs to work
-   `@baklavajs/engine`: The engine is used to execute the graph
-   `@baklavajs/interface-types`: Adds the functionality to assign types to interfaces, which allows only certain connections to be created
-   `@baklavajs/renderer-vue`: Used to display and edit the graph in a Vue 3 application

You can install the packages individually or use the combined `baklavajs` package:

```bash
# npm
npm i baklavajs

# yarn
yarn add baklavajs
```

Now you can use Baklava in your Vue application:

```vue
<template>
    <!--
        By default, the editor completely fills its parent HTML element.
        If you directly use the editor in the <body> element, make sure to use
        a wrapper <div> with specified width and height properties:
        <div style="width: 90vw; height: 90vh">
            <BaklavaEditor :view-model="baklava" />
        </div>
    -->
    <BaklavaEditor :view-model="baklava" />
</template>

<script setup lang="ts">
import { BaklavaEditor, useBaklava } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";

const baklava = useBaklava();
</script>
```

## Creating your first node

When initializing Baklava, you can't see any nodes in the palette.
This is because you haven't registered any nodes yet.
To do this, we first need to create a node type, which is essentially a template for the node instances.
In object-oriented programming, the node type is similar to a class and the node instances are instances of that class.

To create a node you can use the `defineNode()` method:

```ts
// file: MyNode.ts
import { defineNode, NodeInterface, NumberInterface, SelectInterface } from "baklavajs";

export default defineNode({
    type: "MyNode",
    inputs: {
        number1: () => new NumberInterface("Number", 1),
        number2: () => new NumberInterface("Number", 10),
        operation: () => new SelectInterface("Operation", "Add", ["Add", "Subtract"]).setPort(false),
    },
    outputs: {
        output: () => new NodeInterface("Output", 0),
    },
});
```

Now register the node type so the editor knows it exists:

```ts{5}
import MyNode from "./MyNode";

// this code is from the setup function above
const baklava = useBaklava();
baklava.editor.registerNodeType(MyNode);
return { baklava };
```

That's it! You should now be able to create nodes and connect them.
