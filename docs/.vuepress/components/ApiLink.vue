<template>
    <StaticLink :href="href"><slot></slot></StaticLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import StaticLink from "./StaticLink.vue";

const props = defineProps({
    module: { type: String, required: true },
    type: { type: String as () => "classes" | "modules" | "interfaces", required: true },
    name: { type: String },
    hash: { type: String },
});

const href = computed(() => {
    const transformedModuleName = props.module.replace("@", "_").replace("/", "_");
    let url = `/api/${props.type}/${transformedModuleName}`;
    if (props.type !== "modules") {
        url += `.${props.name}`;
    }
    url += ".html";
    if (props.hash) {
        url += `#${props.hash}`;
    }
    return url;
});
</script>
