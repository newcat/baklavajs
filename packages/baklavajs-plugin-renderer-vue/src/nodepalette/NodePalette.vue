<template>
    <div class="node-palette">
        <section
            v-for="c in categories"
            :key="c.name"
        >
            <h1 v-if="c.name !== 'default'">
                {{ c.name }}
            </h1>
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
import { SUBGRAPH_INPUT_NODE_TYPE, SUBGRAPH_OUTPUT_NODE_TYPE } from "../graph/subgraphInterfaceNodes";
import { checkRecursion } from "./checkRecursion";

type NodeTypeInformations = Record<string, INodeTypeInformation>;

export default defineComponent({
    components: { PaletteEntry },
    setup() {
        const { plugin } = usePlugin();

        const categories = computed<Array<{ name: string; nodeTypes: NodeTypeInformations }>>(() => {
            const nodeTypeEntries = Array.from(plugin.value.editor.value.nodeTypes.entries());

            const categoryNames = new Set(nodeTypeEntries.map(([, ni]) => ni.category));

            const categories: Array<{ name: string; nodeTypes: NodeTypeInformations }> = [];
            for (const c of categoryNames.values()) {
                let nodeTypesInCategory = nodeTypeEntries.filter(([, ni]) => ni.category === c);

                if (plugin.value.displayedGraph.value.template) {
                    // don't show the graph nodes that directly or indirectly contain the current subgraph to prevent recursion
                    nodeTypesInCategory = nodeTypesInCategory.filter(
                        ([nt]) => !checkRecursion(plugin.value.editor.value, plugin.value.displayedGraph.value, nt),
                    );
                } else {
                    // if we are not in a subgraph, don't show subgraph input & output nodes
                    nodeTypesInCategory = nodeTypesInCategory.filter(
                        ([nt]) => ![SUBGRAPH_INPUT_NODE_TYPE, SUBGRAPH_OUTPUT_NODE_TYPE].includes(nt),
                    );
                }

                if (nodeTypesInCategory.length > 0) {
                    categories.push({
                        name: c,
                        nodeTypes: Object.fromEntries(nodeTypesInCategory),
                    });
                }
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
