<template>
    <div ref="el" class="baklava-sidebar" :class="{ '--open': graph.sidebar.visible }" :style="styles">
        <div v-if="resizable" class="__resizer" @mousedown="startResize" />

        <div class="__header">
            <button tabindex="-1" class="__close" @click="close">&times;</button>
            <div class="__node-name">
                <b>{{ node ? node.title : "" }}</b>
            </div>
        </div>

        <div v-for="intf in displayedInterfaces" :key="intf.id" class="__interface">
            <component :is="intf.component" v-model="intf.value" :node="node" :intf="intf" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRef } from "vue";
import { useGraph, useViewModel } from "../utility";

export default defineComponent({
    setup() {
        const { viewModel } = useViewModel();
        const { graph } = useGraph();

        const el = ref<HTMLElement | null>(null);

        const width = toRef(viewModel.value.settings.sidebar, "width");
        const resizable = computed(() => viewModel.value.settings.sidebar.resizable);
        let resizeStartWidth = 0;
        let resizeStartMouseX = 0;

        const node = computed(() => {
            const id = graph.value.sidebar.nodeId;
            return graph.value.nodes.find((x) => x.id === id);
        });

        const styles = computed(() => ({
            width: `${width.value}px`,
        }));

        const displayedInterfaces = computed(() => {
            if (!node.value) {
                return [];
            }
            const allIntfs = [...Object.values(node.value.inputs), ...Object.values(node.value.outputs)];
            return allIntfs.filter((intf) => intf.displayInSidebar && intf.component);
        });

        const close = () => {
            graph.value.sidebar.visible = false;
        };

        const startResize = (event: MouseEvent) => {
            resizeStartWidth = width.value;
            resizeStartMouseX = event.clientX;
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener(
                "mouseup",
                () => {
                    window.removeEventListener("mousemove", onMouseMove);
                },
                { once: true },
            );
        };

        const onMouseMove = (event: MouseEvent) => {
            const maxwidth = el.value?.parentElement?.getBoundingClientRect().width ?? 500;
            const deltaX = event.clientX - resizeStartMouseX;
            let newWidth = resizeStartWidth - deltaX;
            if (newWidth < 300) {
                newWidth = 300;
            } else if (newWidth > 0.9 * maxwidth) {
                newWidth = 0.9 * maxwidth;
            }
            width.value = newWidth;
        };

        return { el, graph, resizable, node, styles, displayedInterfaces, startResize, close };
    },
});
</script>
