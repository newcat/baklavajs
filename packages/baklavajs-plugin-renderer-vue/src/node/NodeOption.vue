<template>
    <component :is="option.component" class="node-option" :node="node" :option="option"></component>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AbstractNode, INodeIO } from "@baklavajs/core";
import { ViewPlugin } from "../viewPlugin";

export default defineComponent({
    props: {
        option: {
            type: Object as () => INodeIO,
            required: true,
        },
        node: {
            type: Object as () => AbstractNode,
            required: true,
        },
    },
});
</script>
