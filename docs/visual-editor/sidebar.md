<script setup>
import ApiLink from "../components/ApiLink.vue";
</script>

# Sidebar

The sidebar can be used to display additional settings for a node, that wouldn't fit inside the node (a code editor or a chart).

## Defining Sidebar Node Interfaces

To display a node interface in the sidebar, use the <ApiLink module="@baklavajs/renderer-vue" type="functions" name="displayInSidebar"><code>displayInSidebar</code></ApiLink> function:

```ts
import { defineNode, NodeInterface, NumberInterface, SelectInterface, displayInSidebar } from "baklavajs";

export default defineNode({
    type: "SidebarNode",
    inputs: {
        sidebarOption1: () =>
            new SelectInterface("Dropdown", "foo", ["foo", "bar", "blub"]).use(displayInSidebar, true).setPort(false),
        sidebarOption2: () => new NumberInterface("Test", 4).setHidden(true).use(displayInSidebar, true),
    },
});
```

## Opening the Sidebar

There are two options to open the sidebar:
- Use the `OPEN_SIDEBAR` command
- Emit an `openSidebar` event in your node interface display component

For example: `SidebarButton.vue`:
```vue
<template>
    <button class="baklava-button --block" :title="intf.name" @click="onClick">
        {{ intf.name }}
    </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NodeInterface } from "baklavajs";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => NodeInterface,
            required: true,
        },
    },
    emits: ["openSidebar"],
    setup(props, { emit }) {
        const onClick = () => {
            emit("openSidebar");
        };

        return { onClick };
    },
});
</script>
```

`SidebarNode.ts`:
```ts
import { markRaw } from "vue";
import { defineNode, NodeInterface, NumberInterface, SelectInterface, displayInSidebar } from "baklavajs";
import SidebarButton from "./SidebarButton.vue";

export default defineNode({
    type: "SidebarNode",
    inputs: {
        openButton: () =>
            new NodeInterface("Open Sidebar", undefined).setComponent(markRaw(SidebarButton)).setPort(false),
        sidebarOption1: () =>
            new SelectInterface("Dropdown", "foo", ["foo", "bar", "blub"]).use(displayInSidebar, true).setPort(false),
        sidebarOption2: () => new NumberInterface("Test", 4).setHidden(true).use(displayInSidebar, true),
    },
});
```
