<template>
    <div ref="el" class="baklava-sidebar" :class="{ '--open': graph.sidebar.visible }" :style="styles">
        <div class="__resizer" @mousedown="startResize" />

        <div class="__header">
            <button tabindex="-1" class="__close" @click="close">
                &times;
            </button>
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
import { computed, defineComponent, ref } from "vue";
import { useGraph, useViewModel } from "../utility";
import { OpenSidebarCommand, OPEN_SIDEBAR_COMMAND } from "./index";

export default defineComponent({
    setup() {
        const { viewModel } = useViewModel();
        const { graph } = useGraph();

        const el = ref<HTMLElement | null>(null);
        const width = ref(300);

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

        viewModel.value.commandHandler.registerCommand<OpenSidebarCommand>(OPEN_SIDEBAR_COMMAND, {
            execute: (nodeId: string) => {
                graph.value.sidebar.nodeId = nodeId;
                graph.value.sidebar.visible = true;
            },
            canExecute: () => true,
        });

        return { el, graph, node, styles, displayedInterfaces, startResize, close };
    },
});
</script>
