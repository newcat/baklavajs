<template>
    <div ref="el" :class="['sidebar', { '--open': plugin.sidebar.visible }]" :style="styles">
        <div class="__resizer" @mousedown="startResize"></div>

        <div class="d-flex align-items-center">
            <button tabindex="-1" class="__close" @click="close">&times;</button>
            <div class="ml-2">
                <b>{{ nodeName }}</b>
            </div>
        </div>

        <!-- TODO: Make unique so it works with multiple Baklava instances on the same page -->
        <div id="sidebar-container"></div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref } from "vue";
import { ViewPlugin } from "../viewPlugin";

export default defineComponent({
    setup() {
        const el = ref<HTMLElement | null>(null);
        const width = ref(300);
        const plugin = inject<ViewPlugin>("plugin")!;

        const nodeName = computed(() => {
            const id = plugin.sidebar.nodeId;
            const n = plugin.editor.nodes.find((x) => x.id === id);
            return n ? n.title : "";
        });

        const styles = computed(() => ({
            width: `${width}px`,
        }));

        const close = () => {
            plugin.sidebar.visible = false;
        };

        const startResize = () => {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener(
                "mouseup",
                () => {
                    window.removeEventListener("mousemove", onMouseMove);
                },
                { once: true }
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

        return { el, plugin, nodeName, styles, startResize, close };
    },
});
</script>
