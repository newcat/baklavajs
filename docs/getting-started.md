# Getting Started

## Installation

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
    <baklava-editor :plugin="baklava" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { EditorComponent, useBaklava } from "@baklavajs/renderer-vue";

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
