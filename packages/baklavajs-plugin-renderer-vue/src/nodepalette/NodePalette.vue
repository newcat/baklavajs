<template>
    <div class="node-palette">
        <section v-for="c in categories" :key="c.name">
            <h1 v-if="c.name !== 'default'">{{ c.name }}</h1>
            <PaletteEntry
                v-for="(ni, nt) in c.nodeTypes"
                :key="nt"
                :type="nt"
                :title="ni.title"
                draggable="true"
                @dragstart="onDragStart($event, nt)"
            />
        </section>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { INodeTypeInformation } from "@baklavajs/core";
import PaletteEntry from "./PaletteEntry.vue";
import { usePlugin } from "../utility";

type NodeTypeInformations = Record<string, INodeTypeInformation>;

export default defineComponent({
    components: { PaletteEntry },
    setup() {
        const { plugin } = usePlugin();

        const categories = computed<Array<{ name: string; nodeTypes: NodeTypeInformations }>>(() => {
            const nodeTypeEntries = Array.from(plugin.value.editor.nodeTypes.entries());

            const categoryNames = new Set(nodeTypeEntries.map(([nt, ni]) => ni.category));

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

        const onDragStart = (ev: DragEvent, nodeType: string) => {
            ev.dataTransfer?.setData("text/plain", nodeType);
        };

        return { categories, onDragStart };
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
