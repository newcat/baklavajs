<template>
    <div
        ref="el"
        tabindex="-1"
        class="baklava-editor"
        :class="{
            'baklava-ignore-mouse': !!temporaryConnection || dragging,
            '--temporary-connection': !!temporaryConnection,
        }"
        @pointermove.self="onPointerMove"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @wheel.self="mouseWheel"
        @keydown="keyDown"
        @keyup="keyUp"
    >
        <slot name="background">
            <background />
        </slot>

        <slot name="toolbar">
            <toolbar />
        </slot>

        <slot name="palette">
            <node-palette />
        </slot>

        <svg class="connections-container">
            <g v-for="connection in connections" :key="connection.id + counter.toString()">
                <slot name="connections" :connection="connection">
                    <connection-wrapper :connection="connection" />
                </slot>
            </g>
            <slot name="temporaryConnection" :temporary-connection="temporaryConnection">
                <temporary-connection v-if="temporaryConnection" :connection="temporaryConnection" />
            </slot>
        </svg>

        <div class="node-container" :style="nodeContainerStyle">
            <transition-group name="fade">
                <template v-for="node in nodes">
                    <slot name="node" :node="node" :selected="selectedNodes.includes(node)" @select="selectNode(node)">
                        <node
                            :key="node.id + counter.toString()"
                            :node="node"
                            :selected="selectedNodes.includes(node)"
                            @select="selectNode(node)"
                        />
                    </slot>
                </template>
            </transition-group>
        </div>

        <slot name="sidebar">
            <sidebar />
        </slot>

        <slot name="minimap">
            <minimap v-if="viewModel.settings.enableMinimap" />
        </slot>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, Ref, ref, toRef } from "vue";

import { AbstractNode } from "@baklavajs/core";
import { IBaklavaViewModel } from "../viewModel";
import { usePanZoom } from "./panZoom";
import { useTemporaryConnection } from "./temporaryConnection";

import Background from "./Background.vue";
import Node from "../node/Node.vue";
import ConnectionWrapper from "../connection/ConnectionWrapper.vue";
import TemporaryConnection from "../connection/TemporaryConnection.vue";
import Sidebar from "../sidebar/Sidebar.vue";
import Minimap from "../components/Minimap.vue";
import NodePalette from "../nodepalette/NodePalette.vue";
import Toolbar from "../toolbar/Toolbar.vue";

import { providePlugin } from "../utility";

export default defineComponent({
    components: { Background, Node, ConnectionWrapper, TemporaryConnection, Sidebar, Minimap, NodePalette, Toolbar },
    props: {
        viewModel: {
            type: Object as () => IBaklavaViewModel,
            required: true,
        },
    },
    setup(props) {
        const token = Symbol("EditorToken");

        const viewModelRef = toRef(props, "viewModel") as unknown as Ref<IBaklavaViewModel>;
        providePlugin(viewModelRef);

        const el = ref<HTMLElement | null>(null);
        provide("editorEl", el);

        const nodes = computed(() => props.viewModel.displayedGraph.value.nodes);
        const connections = computed(() => props.viewModel.displayedGraph.value.connections);
        const selectedNodes = computed(() => props.viewModel.displayedGraph.value.selectedNodes);

        const panZoom = usePanZoom();
        const temporaryConnection = useTemporaryConnection();

        const nodeContainerStyle = computed(() => ({
            ...panZoom.styles.value,
        }));

        // Reason: https://github.com/newcat/baklavajs/issues/54
        const counter = ref(0);
        props.viewModel.editor.value.hooks.load.subscribe(token, (s) => {
            counter.value++;
            return s;
        });

        const onPointerMove = (ev: PointerEvent) => {
            panZoom.onPointerMove(ev);
            temporaryConnection.onMouseMove(ev);
        };

        const onPointerDown = (ev: PointerEvent) => {
            if (ev.button === 0) {
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
            if (!props.viewModel.commandHandler.pressedKeys.value.includes("Control")) {
                unselectAllNodes();
            }
            props.viewModel.displayedGraph.value.selectedNodes.push(node);
        };

        const unselectAllNodes = () => {
            props.viewModel.displayedGraph.value.selectedNodes = [];
        };

        return {
            el,
            counter,
            nodes,
            connections,
            selectedNodes,
            nodeContainerStyle,
            onPointerMove,
            onPointerDown,
            onPointerUp,
            keyDown,
            keyUp,
            selectNode,
            temporaryConnection: temporaryConnection.temporaryConnection,
            mouseWheel: panZoom.onMouseWheel,
            dragging: panZoom.dragging,
        };
    },
});
</script>
