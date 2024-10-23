<template>
    <StaticLink :href="href" target="_blank"><slot /></StaticLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import StaticLink from "./StaticLink";

const props = withDefaults(
    defineProps<{
        module: string;
        type: "classes" | "modules" | "interfaces" | "functions";
        name?: string;
        hash?: string;
    }>(),
    {
        name: "",
        hash: "",
    },
);

const href = computed(() => {
    const transformedModuleName = props.module.replace("@", "_").replace("/", "_").replace("-", "_");
    let url = `https://baklava.tech/api/${props.type}/${transformedModuleName}`;
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
