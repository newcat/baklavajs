<script setup>
import ApiLink from "../components/ApiLink.vue";
</script>

# Setup

## View Model

There is one key component you need when using the visual editor: the _view model_. You can create a new view model by using the <ApiLink type="functions" module="@baklavajs/renderer-vue" name="useBaklava"><code>useBaklava</code></ApiLink> function. The view model has the following type:

```ts
interface IBaklavaViewModel {
    editor: Editor;
    /** Currently displayed graph */
    displayedGraph: Graph;
    /** True if the currently displayed graph is a subgraph, false if it is the root graph */
    isSubgraph: Readonly<boolean>;
    settings: IViewSettings;
    commandHandler: ICommandHandler;
    history: IHistory;
    clipboard: IClipboard;
    hooks: {
        /** Called whenever a node is rendered */
        renderNode: SequentialHook<{ node: AbstractNode; el: HTMLElement }, null>;
        /** Called whenever an interface is rendered */
        renderInterface: SequentialHook<{ intf: NodeInterface<any>; el: HTMLElement }, null>;
    };
    switchGraph: (newGraph: Graph | GraphTemplate) => void;
}
```

The view model is reactive so it can be used in watchers, computed properties, etc.

::: warning
The `useBaklava` function accepts an existing editor instance as parameter. However, because of the way Vue's reactivity system works you'll need to use the viewModel.editor property afterwards instead of your own reference to the editor.
:::

## Editor Component

Now you can pass the view model to the editor component:

```vue
<template>
    <baklava-editor :view-model="baklava" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { EditorComponent, useBaklava } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/syrup-dark.css";

export default defineComponent({
    components: {
        "baklava-editor": EditorComponent,
    },
    setup() {
        const baklava = useBaklava();
        return { baklava };
    },
});
</script>
```
