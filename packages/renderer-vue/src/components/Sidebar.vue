<template>
    <div ref="el" class="baklava-sidebar" :class="{ '--open': graph.sidebar.visible }" :style="styles">
        <div class="__resizer" @mousedown="startResize" />

        <div class="__header">
            <button tabindex="-1" class="__close" @click="close">
                &times;
            </button>
            <div class="__node-name">
                <b>{{ nodeName }}</b>
            </div>
        </div>

        <!-- TODO: Make unique so it works with multiple Baklava instances on the same page -->
        <div id="sidebar-container" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useGraph } from "../utility";

export default defineComponent({
    setup() {
        const { graph } = useGraph();

        const el = ref<HTMLElement | null>(null);
        const width = ref(300);

        const nodeName = computed(() => {
            const id = graph.value.sidebar.nodeId;
            const n = graph.value.nodes.find((x) => x.id === id);
            return n ? n.title : "";
        });

        const styles = computed(() => ({
            width: `${width.value}px`,
        }));

        const close = () => {
            graph.value.sidebar.visible = false;
        };

        const startResize = () => {
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
            width.value -= event.movementX;
            if (width.value < 300) {
                width.value = 300;
            } else if (width.value > 0.9 * maxwidth) {
                width.value = 0.9 * maxwidth;
            }
        };

        return { el, graph, nodeName, styles, startResize, close };
    },
});
</script>
