<template>
    <div
        ref="el"
        tabindex="-1"
        class="baklava-editor"
        :class="{
            'baklava-ignore-mouse': !!temporaryConnection.temporaryConnection.value || panZoom.dragging.value,
            '--temporary-connection': !!temporaryConnection.temporaryConnection.value,
            '--start-selection-box': selectionBox.startSelection,
        }"
        @pointermove.self="onPointerMove"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @wheel.self="panZoom.onMouseWheel"
        @keydown="keyDown"
        @keyup="keyUp"
        @contextmenu.self="contextMenu.open"
    >
        <slot name="background">
            <Background />
        </slot>

        <slot name="toolbar">
            <Toolbar v-if="viewModel.settings.toolbar.enabled" />
        </slot>

        <slot name="palette">
            <NodePalette v-if="viewModel.settings.palette.enabled" />
        </slot>

        <svg class="connections-container">
            <g v-for="connection in connections" :key="connection.id + counter.toString()">
                <slot name="connection" :connection="connection">
                    <ConnectionWrapper :connection="connection" />
                </slot>
            </g>
            <slot name="temporaryConnection" :temporary-connection="temporaryConnection.temporaryConnection.value">
                <TemporaryConnection
                    v-if="temporaryConnection.temporaryConnection.value"
                    :connection="temporaryConnection.temporaryConnection.value"
                />
            </slot>
        </svg>

        <div class="node-container" :style="nodeContainerStyle">
            <transition-group name="fade">
                <template v-for="(node, idx) in nodes" :key="node.id + counter.toString()">
                    <slot
                        name="node"
                        :node="node"
                        :selected="selectedNodes.includes(node)"
                        :dragging="dragMoves[idx].dragging.value"
                        @select="selectNode(node)"
                        @start-drag="startDrag"
                    >
                        <Node
                            :node="node"
                            :selected="selectedNodes.includes(node)"
                            :dragging="dragMoves[idx].dragging.value"
                            @select="selectNode(node)"
                            @start-drag="startDrag"
                        />
                    </slot>
                </template>
            </transition-group>
        </div>

        <slot name="sidebar">
            <Sidebar v-if="viewModel.settings.sidebar.enabled" />
        </slot>

        <slot name="minimap">
            <Minimap v-if="viewModel.settings.enableMinimap" />
        </slot>

        <slot name="contextMenu" :context-menu="contextMenu">
            <ContextMenu
                v-if="viewModel.settings.contextMenu.enabled"
                v-model="contextMenu.show.value"
                :items="contextMenu.items.value"
                :x="contextMenu.x.value"
                :y="contextMenu.y.value"
                @click="contextMenu.onClick"
            />
        </slot>

        <div v-if="selectionBox.isSelecting" class="selection-box" :style="selectionBox.getStyles()" />
    </div>
</template>

<script setup lang="ts">
import { computed, provide, Ref, ref, toRef } from "vue";

import { AbstractNode } from "@baklavajs/core";
import { IBaklavaViewModel } from "../viewModel";
import { providePlugin, useDragMove } from "../utility";
import { usePanZoom } from "./panZoom";
import { provideTemporaryConnection } from "./temporaryConnection";
import { useContextMenu } from "./contextMenu";
import { useSelectionBox } from "./selectionBox";

import Background from "./Background.vue";
import Node from "../node/Node.vue";
import ConnectionWrapper from "../connection/ConnectionWrapper.vue";
import TemporaryConnection from "../connection/TemporaryConnection.vue";
import Sidebar from "../sidebar/Sidebar.vue";
import Minimap from "../components/Minimap.vue";
import NodePalette from "../nodepalette/NodePalette.vue";
import Toolbar from "../toolbar/Toolbar.vue";
import ContextMenu from "../contextmenu/ContextMenu.vue";

const props = defineProps<{ viewModel: IBaklavaViewModel }>();

const token = Symbol("EditorToken");

const viewModelRef = toRef(props, "viewModel") as unknown as Ref<IBaklavaViewModel>;
providePlugin(viewModelRef);

const el = ref<HTMLElement | null>(null);
provide("editorEl", el);

const nodes = computed(() => props.viewModel.displayedGraph.nodes);
const dragMoves = computed(() => props.viewModel.displayedGraph.nodes.map((n) => useDragMove(toRef(n, "position"))));
const connections = computed(() => props.viewModel.displayedGraph.connections);
const selectedNodes = computed(() => props.viewModel.displayedGraph.selectedNodes);

const panZoom = usePanZoom();
const temporaryConnection = provideTemporaryConnection();
const contextMenu = useContextMenu(viewModelRef);
const selectionBox = useSelectionBox(el);

const nodeContainerStyle = computed(() => ({
    ...panZoom.styles.value,
}));

// Reason: https://github.com/newcat/baklavajs/issues/54
const counter = ref(0);
props.viewModel.editor.hooks.load.subscribe(token, (s) => {
    counter.value++;
    return s;
});

const onPointerMove = (ev: PointerEvent) => {
    panZoom.onPointerMove(ev);
    temporaryConnection.onMouseMove(ev);
};

const onPointerDown = (ev: PointerEvent) => {
    if (ev.button === 0) {
        if (selectionBox.onPointerDown(ev)) {
            return;
        }

        if (ev.target === el.value) {
            unselectAllNodes();
            panZoom.onPointerDown(ev);
        }
        temporaryConnection.onMouseDown();
    }
};

const onPointerUp = (ev: PointerEvent) => {
    panZoom.onPointerUp(ev);
    temporaryConnection.onMouseUp();
};

const keyDown = (ev: KeyboardEvent) => {
    if (ev.key === "Tab") {
        ev.preventDefault();
    }
    props.viewModel.commandHandler.handleKeyDown(ev);
};

const keyUp = (ev: KeyboardEvent) => {
    props.viewModel.commandHandler.handleKeyUp(ev);
};

const selectNode = (node: AbstractNode) => {
    if (!["Control", "Shift"].some((k) => props.viewModel.commandHandler.pressedKeys.includes(k))) {
        unselectAllNodes();
    }
    props.viewModel.displayedGraph.selectedNodes.push(node);
};

const unselectAllNodes = () => {
    props.viewModel.displayedGraph.selectedNodes = [];
};

const startDrag = (ev: PointerEvent) => {
    for (const selectedNode of props.viewModel.displayedGraph.selectedNodes) {
        const idx = nodes.value.indexOf(selectedNode);
        const dragMove = dragMoves.value[idx];
        dragMove.onPointerDown(ev);

        document.addEventListener("pointermove", dragMove.onPointerMove);
    }

    document.addEventListener("pointerup", stopDrag);
};

const stopDrag = () => {
    for (const selectedNode of props.viewModel.displayedGraph.selectedNodes) {
        const idx = nodes.value.indexOf(selectedNode);
        const dragMove = dragMoves.value[idx];
        dragMove.onPointerUp();

        document.removeEventListener("pointermove", dragMove.onPointerMove);
    }

    document.removeEventListener("pointerup", stopDrag);
};
</script>
