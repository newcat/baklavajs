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
                @pointerdown="onDragStart(nt, ni)"
            />
        </section>
    </div>
    <transition name="fade">
        <div
            v-if="draggedNode"
            class="dragged-node"
            :style="draggedNodeStyles"
        >
            <PaletteEntry
                :type="draggedNode.type"
                :title="draggedNode.nodeInformation.title"
            />
        </div>
    </transition>
</template>

<script lang="ts">
import { computed, CSSProperties, defineComponent, inject, Ref, ref, reactive } from "vue";
import { useMouse } from "@vueuse/core";
import { AbstractNode, INodeTypeInformation } from "@baklavajs/core";
import PaletteEntry from "./PaletteEntry.vue";
import { usePlugin, useTransform } from "../utility";
import { SUBGRAPH_INPUT_NODE_TYPE, SUBGRAPH_OUTPUT_NODE_TYPE } from "../graph/subgraphInterfaceNodes";
import { checkRecursion } from "./checkRecursion";

type NodeTypeInformations = Record<string, INodeTypeInformation>;

interface IDraggedNode {
    type: string;
    nodeInformation: INodeTypeInformation;
}

export default defineComponent({
    components: { PaletteEntry },
    setup() {
        const { plugin } = usePlugin();
        const { x: mouseX, y: mouseY } = useMouse();
        const { transform } = useTransform();

        const editorEl = inject<Ref<HTMLElement | null>>("editorEl");

        const draggedNode = ref<IDraggedNode | null>(null);

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

        const draggedNodeStyles = computed<CSSProperties>(() => {
            if (!draggedNode.value || !editorEl?.value) {
                return {};
            }
            const { left, top } = editorEl.value.getBoundingClientRect();
            return {
                top: `${mouseY.value - top}px`,
                left: `${mouseX.value - left}px`,
            };
        });

        const onDragStart = (type: string, nodeInformation: INodeTypeInformation) => {
            draggedNode.value = {
                type,
                nodeInformation,
            };

            const onDragEnd = () => {
                console.log("pointerup");
                const instance = reactive(new nodeInformation.type()) as AbstractNode;
                plugin.value.displayedGraph.value.addNode(instance);

                const rect = editorEl!.value!.getBoundingClientRect();
                const [x, y] = transform(mouseX.value - rect.left, mouseY.value - rect.top);
                instance.position.x = x;
                instance.position.y = y;

                draggedNode.value = null;
                document.removeEventListener("pointerup", onDragEnd);
            };
            document.addEventListener("pointerup", onDragEnd);
        };

        return { draggedNode, categories, draggedNodeStyles, onDragStart };
    },
});
</script>
