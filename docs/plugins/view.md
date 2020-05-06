# View

[API reference](!!API%{ "module": "@baklavajs/plugin-renderer-vue", "type": "class", "name": "ViewPlugin" }%)

The view plugin is used to display the editor to the users. It makes heavy use of the [VueJS framework](https://vuejs.org/).

## Getting Started
For getting the editor view up and running, you need to follow these steps:

### 1. Vue Plugin and Styles
```js
// in your main.js
import { BaklavaVuePlugin } from "@baklavajs/plugin-renderer-vue";
import "@baklavajs/plugin-renderer-vue/dist/styles.css";
Vue.use(BaklavaVuePlugin);
```

### 2. Editor and ViewPlugin
```vue
<template>
    <baklava-editor :plugin="viewPlugin"></baklava-editor>
</template>

<script>
import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";

export default {
    data() {
        return {
            editor: new Editor(),
            viewPlugin: new ViewPlugin()
        }
    },
    created() {
        this.editor.use(this.viewPlugin);
        // register your nodes, node options, node interface types, ...
    }
}
</script>
```

> If you do not see the node editor, add a wrapper element with width and height properties around the editor.
> By default, the editor fills its parent completely. However, if the parent is the `<body>` element, this won't work.

## Register Options
When adding an option to a node, you only specify the type of the option as a string. This is done to separate logic and view.
The ViewPlugin contains the `options` field that maps these strings to actual view components.

To add your custom option to this mapping, use the `registerOption` method:
```js
import MyOption from "MyOption.vue";
viewPlugin.registerOption("MyOption", MyOption);
```

## Additional Options
You can pass additional options to your nodes, node interfaces or node options that can be used by the `renderer-vue` plugin. These additional options can also be used when you use [custom components](../styling.md).

Currently, additional options are only used for nodes:
* `position: { x: number, y: number }`: Position of the node
* `width: number`: Width of the node in pixels
* `twoColumn: boolean`: Whether to display input and output interfaces next to each other (`true`) or below each other (`false`)

```js
// Creating a two column node with the node builder
new NodeBuilder("MyNode", { twoColumn: true }).build()

// Creating a two column node when using the class syntax
class MyNode extends Node {
    twoColumn = true;
    //...
}
```

## Node Type Aliases
You can customize the names displayed in the "Add Node" context menu.
```js
viewPlugin.setNodeTypeAlias("TestNode", "TestNode (with alias)");
```

## Electron
If you want to use this plugin in Electron, you might need to add it to the whitelisted externals.
To do that, add the following code to your `package.json`:
```json
{
    "electronWebpack": {
        "whiteListedModules": [ "@baklavajs/plugin-renderer-vue" ]
    }
}
```