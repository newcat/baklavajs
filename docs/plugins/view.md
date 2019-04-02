# View

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
The ViewPlugin contains the [options](!!API%{ "type": "class", "name": "viewplugin", "field": "options" }%) field that maps these strings to actual view components.

To add your custom option to this mapping, use the [registerOption](!!API%{ "type": "class", "name": "viewplugin", "field": "registerOption" }%) method.
