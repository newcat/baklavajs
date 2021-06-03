<template>
    <div :id="node.id" :class="classes" :style="styles" @mousedown="select" :data-node-type="node.type">
        <div class="__title" @mousedown.self.stop="startDrag">
            <template v-if="!renaming">
                <div class="__title-label">{{ node.title }}</div>
                <div class="__menu">
                    <button @click="openContextMenu">E</button>
                    <context-menu
                        v-model="showContextMenu"
                        :x="0"
                        :y="0"
                        :items="contextMenuItems"
                        @click="onContextMenuClick"
                    ></context-menu>
                </div>
            </template>
            <input
                v-else
                ref="renameInputEl"
                type="text"
                class="dark-input"
                v-model="tempName"
                placeholder="Node Name"
                @blur="doneRenaming"
                @keydown.enter="doneRenaming"
            />
        </div>

        <div class="__content">
            <!-- Outputs -->
            <div class="__outputs">
                <NodeInterface
                    v-for="output in node.outputs"
                    :key="output.id"
                    :node="node"
                    :intf="output"
                ></NodeInterface>
            </div>

            <!-- Inputs -->
            <div class="__inputs">
                <NodeInterface v-for="input in node.inputs" :key="input.id" :node="node" :intf="input"></NodeInterface>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRef, nextTick } from "vue";
import { AbstractNode, IGraphNode } from "@baklavajs/core";
import { useDragMove, useGraph } from "../utility";

import ContextMenu from "../components/ContextMenu.vue";
import NodeInterface from "./NodeInterface.vue";

export default defineComponent({
    components: { ContextMenu, NodeInterface },
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
    setup(props, { emit }) {
        const { graph, switchGraph } = useGraph();
        const dragMove = useDragMove(toRef(props.node, "position"));

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

        const select = () => {
            emit("select", props.node);
        };

        const startDrag = (ev: MouseEvent) => {
            dragMove.onMouseDown(ev);
            document.addEventListener("mousemove", dragMove.onMouseMove);
            document.addEventListener("mouseup", stopDrag);
            select();
        };

        const stopDrag = () => {
            dragMove.onMouseUp();
            document.removeEventListener("mousemove", dragMove.onMouseMove);
            document.removeEventListener("mouseup", stopDrag);
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
                    const graphNode = props.node as AbstractNode & IGraphNode;
                    switchGraph(graphNode.template);
                    break;
            }
        };

        const doneRenaming = () => {
            props.node.title = tempName.value;
            renaming.value = false;
        };

        return {
            renaming,
            tempName,
            renameInputEl,
            showContextMenu,
            contextMenuItems,
            classes,
            styles,
            select,
            startDrag,
            openContextMenu,
            onContextMenuClick,
            doneRenaming,
        };
    },
});
</script>
