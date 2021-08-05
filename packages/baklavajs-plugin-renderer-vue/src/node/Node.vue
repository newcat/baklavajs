<template>
    <div :id="node.id" ref="el" :class="classes" :style="styles" :data-node-type="node.type" @pointerdown="select">
        <div class="__title" @pointerdown.self.stop="startDrag">
            <template v-if="!renaming">
                <div class="__title-label">
                    {{ node.title }}
                </div>
                <div class="__menu">
                    <vertical-dots class="--clickable" @click="openContextMenu" />
                    <context-menu
                        v-model="showContextMenu"
                        :x="0"
                        :y="0"
                        :items="contextMenuItems"
                        @click="onContextMenuClick"
                    />
                </div>
            </template>
            <input
                v-else
                ref="renameInputEl"
                v-model="tempName"
                type="text"
                class="dark-input"
                placeholder="Node Name"
                @blur="doneRenaming"
                @keydown.enter="doneRenaming"
            >
        </div>

        <div class="__content">
            <!-- Outputs -->
            <div class="__outputs">
                <NodeInterface v-for="output in displayedOutputs" :key="output.id" :node="node" :intf="output" />
            </div>

            <!-- Inputs -->
            <div class="__inputs">
                <NodeInterface v-for="input in displayedInputs" :key="input.id" :node="node" :intf="input" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRef, nextTick, onUpdated, onMounted } from "vue";
import { AbstractNode, IGraphNode } from "@baklavajs/core";
import { useDragMove, useGraph, usePlugin } from "../utility";

import ContextMenu from "../components/ContextMenu.vue";
import VerticalDots from "../icons/VerticalDots.vue";
import NodeInterface from "./NodeInterface.vue";

export default defineComponent({
    components: { ContextMenu, NodeInterface, VerticalDots },
    props: {
        node: {
            type: Object as () => AbstractNode,
            required: true,
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["select"],
    setup(props, { emit }) {
        const { plugin } = usePlugin();
        const { graph, switchGraph } = useGraph();
        const dragMove = useDragMove(toRef(props.node, "position"));

        const el = ref<HTMLElement | null>(null);
        const renaming = ref(false);
        const tempName = ref("");
        const renameInputEl = ref<HTMLInputElement | null>(null);

        const showContextMenu = ref(false);
        const contextMenuItems = computed(() => {
            const items = [
                { value: "rename", label: "Rename" },
                { value: "delete", label: "Delete" },
            ];

            if (props.node.type.startsWith("__baklava_GraphNode")) {
                items.push({ value: "editSubgraph", label: "Edit Subgraph" });
            }

            return items;
        });

        const classes = computed(() => ({
            "node": true,
            "--selected": props.selected,
            "--dragging": dragMove.dragging.value,
            "--two-column": !!props.node.twoColumn,
        }));

        const styles = computed(() => ({
            top: `${props.node.position?.y ?? 0}px`,
            left: `${props.node.position?.x ?? 0}px`,
            width: `${props.node.width ?? 200}px`,
        }));

        const displayedInputs = computed(() => Object.values(props.node.inputs).filter((ni) => !ni.hidden));
        const displayedOutputs = computed(() => Object.values(props.node.outputs).filter((ni) => !ni.hidden));

        const select = () => {
            emit("select", props.node);
        };

        const startDrag = (ev: PointerEvent) => {
            dragMove.onPointerDown(ev);
            document.addEventListener("pointermove", dragMove.onPointerMove);
            document.addEventListener("pointerup", stopDrag);
            select();
        };

        const stopDrag = () => {
            dragMove.onPointerUp();
            document.removeEventListener("pointermove", dragMove.onPointerMove);
            document.removeEventListener("pointerup", stopDrag);
        };

        const openContextMenu = () => {
            showContextMenu.value = true;
        };

        const onContextMenuClick = async (action: string) => {
            switch (action) {
            case "delete":
                graph.value.removeNode(props.node);
                break;
            case "rename":
                tempName.value = props.node.title;
                renaming.value = true;
                await nextTick();
                renameInputEl.value?.focus();
                break;
            case "editSubgraph":
                switchGraph((props.node as AbstractNode & IGraphNode).template);
                break;
            }
        };

        const doneRenaming = () => {
            props.node.title = tempName.value;
            renaming.value = false;
        };

        const onRender = () => {
            if (el.value) {
                plugin.value.hooks.renderNode.execute({ node: props.node, el: el.value });
            }
        };

        onMounted(onRender);
        onUpdated(onRender);

        return {
            el,
            renaming,
            tempName,
            renameInputEl,
            showContextMenu,
            contextMenuItems,
            classes,
            styles,
            displayedInputs,
            displayedOutputs,
            select,
            startDrag,
            openContextMenu,
            onContextMenuClick,
            doneRenaming,
        };
    },
});
</script>
