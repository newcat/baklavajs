<template>
    <div class="node-palette">
        <section v-for="c in categories" :key="c.name">
            <h1 v-if="c.name !== 'default'">{{ c.name }}</h1>
            <NodePreview v-for="(ni, nt) in c.nodeTypes" :key="nt" :type="nt" :title="ni.title" />
        </section>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { INodeTypeInformation } from "@baklavajs/core";
import { ViewPlugin } from "../viewPlugin";
import NodePreview from "./NodePreview.vue";

type NodeTypeInformations = Record<string, INodeTypeInformation>;

export default defineComponent({
    components: { NodePreview },
    setup() {
        const plugin = inject<ViewPlugin>("plugin")!;

        const categories = computed<Array<{ name: string; nodeTypes: NodeTypeInformations }>>(() => {
            const nodeTypeEntries = Array.from(plugin.editor.nodeTypes.entries());

            const categoryNames = new Set(nodeTypeEntries.map(([nt, ni]) => ni.category));

            console.log(categoryNames);

            const categories: Array<{ name: string; nodeTypes: NodeTypeInformations }> = [];
            for (const c of categoryNames.values()) {
                const nodeTypesInCategory = nodeTypeEntries.filter(([nt, ni]) => ni.category === c);
                categories.push({
                    name: c,
                    nodeTypes: Object.fromEntries(nodeTypesInCategory),
                });
            }

            // sort, so the default category is always first and all others are sorted alphabetically
            categories.sort((a, b) => {
                if (a.name === "default") {
                    return -1;
                } else if (b.name === "default") {
                    return 1;
                } else {
                    return a.name > b.name ? 1 : -1;
                }
            });

            return categories;
        });

        return { categories };
    },
});
</script>

<style scoped>
.node-palette {
    position: absolute;
    left: 0;
    top: 0;
    width: 250px;
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
    background: #0003;
    color: white;
}

.node-palette h1 {
    margin-top: 2rem;
}
</style>
