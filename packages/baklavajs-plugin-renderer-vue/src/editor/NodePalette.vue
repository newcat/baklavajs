<template></template>

<script lang="ts">
import { ViewPlugin } from "../viewPlugin";
import { computed, defineComponent, inject } from "vue";

export default defineComponent({
    setup() {
        const plugin = inject<ViewPlugin>("plugin")!;

        const categories = computed(() => {
        const categories = Array.from(plugin.editor.nodeCategories.keys())
            .filter((c) => c !== "default")
            .map((c) => {
                const nodes = Array.from(plugin.editor.nodeCategories.get(c)!).map((n) => ({
                    value: "addNode:" + n,
                    label: plugin.nodeTypeAliases[n] || n,
                }));
                return { label: c, submenu: nodes };
            });

        const defaultNodes = plugin.editor.nodeCategories.get("default")!.map((n) => ({
            value: "addNode:" + n,
            label: plugin.nodeTypeAliases[n] || n,
        }));

        const addNodeSubmenu: IMenuItem[] = [...categories];
        if (categories.length > 0 && defaultNodes.length > 0) {
            addNodeSubmenu.push({ isDivider: true });
        }
        addNodeSubmenu.push(...defaultNodes);
    });

    }
};
</script>
