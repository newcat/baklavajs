<template>
    <div
        tabindex="-1"
        :class="[
            'node-editor',
            { 'ignore-mouse': !!temporaryConnection, '--temporary-connection': !!temporaryConnection },
        ]"
        ref="el"
        @mousemove.self="mouseMoveHandler"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @wheel.self="mouseWheel"
        @keydown="keyDown"
        @keyup="keyUp"
    >
        <div class="background" :style="backgroundStyle"></div>

        <svg class="connections-container">
            <g v-for="connection in connections" :key="connection.id + counter.toString()">
                <slot name="connections" :connection="connection">
                    <connection-wrapper :connection="connection"></connection-wrapper>
                </slot>
            </g>
            <slot name="temporaryConnection" :temporaryConnection="temporaryConnection">
                <temporary-connection
                    v-if="temporaryConnection"
                    :connection="temporaryConnection"
                ></temporary-connection>
            </slot>
        </svg>

        <div class="node-container" :style="nodeContainerStyle">
            <template v-for="node in nodes">
                <slot name="node" :node="node" :selected="selectedNodes.includes(node)" @select="selectNode(node)">
                    <node
                        :key="node.id + counter.toString()"
                        :node="node"
                        :selected="selectedNodes.includes(node)"
                        @select="selectNode(node)"
                    >
                    </node>
                </slot>
            </template>
        </div>

        <slot name="sidebar">
            <sidebar :graph="plugin.editor.graph"></sidebar>
        </slot>

        <slot name="minimap" :nodes="nodes" :connections="connections">
            <minimap v-if="plugin.enableMinimap" :nodes="nodes" :connections="connections"></minimap>
        </slot>

        <NodePalette />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, Ref, ref, toRef } from "vue";

import { AbstractNode } from "@baklavajs/core";
import { ViewPlugin } from "../viewPlugin";
import { usePanZoom } from "./panZoom";
import { useTemporaryConnection } from "./temporaryConnection";

import Node from "../node/Node.vue";
import ConnectionWrapper from "../connection/ConnectionWrapper.vue";
import TemporaryConnection from "../connection/TemporaryConnection.vue";
import Sidebar from "../components/Sidebar.vue";
import Minimap from "../components/Minimap.vue";
import NodePalette from "../nodepalette/NodePalette.vue";

import Clipboard from "./clipboard";
import History from "./history";

export default defineComponent({
    components: { Node, ConnectionWrapper, TemporaryConnection, Sidebar, Minimap, NodePalette },
    props: {
        plugin: {
            type: Object as () => ViewPlugin,
            required: true,
        },
    },
    setup(props) {
        const token = Symbol("EditorToken");

        const el = ref<HTMLElement | null>(null);
        const selectedNodes = ref<AbstractNode[]>([]) as Ref<AbstractNode[]>;
        const ctrlPressed = ref(false);

        // Reason: https://github.com/newcat/baklavajs/issues/54
        const counter = ref(0);

        const clipboard = new Clipboard(props.plugin.editor);
        const history = new History(props.plugin.editor.graph);

        const pluginRef = toRef(props, "plugin") as Ref<ViewPlugin>;
        const panZoom = usePanZoom(pluginRef);
        const temporaryConnection = useTemporaryConnection(pluginRef);

        const backgroundStyle = props.plugin.backgroundStyles;
        const nodeContainerStyle = computed(() => ({
            ...panZoom.styles.value,
        }));

        props.plugin.editor.hooks.load.tap(token, (s) => {
            counter.value++;
            return s;
        });

        const mouseMoveHandler = (ev: MouseEvent) => {
            panZoom.onMouseMove(ev);
            temporaryConnection.onMouseMove(ev);
        };

        const mouseDown = (ev: MouseEvent) => {
            if (ev.button === 0) {
                if (ev.target === el.value) {
                    unselectAllNodes();
                    panZoom.dragging.value = true;
                }
                temporaryConnection.onMouseDown();
            }
        };

        const mouseUp = () => {
            panZoom.dragging.value = false;
            temporaryConnection.onMouseUp();
        };

        const keyDown = (ev: KeyboardEvent) => {
            if (ev.key === "Delete" && selectedNodes.value.length > 0) {
                selectedNodes.value.forEach((n) => props.plugin.editor.graph.removeNode(n));
            } else if (ev.key === "Tab") {
                ev.preventDefault();
            } else if (ev.key === "Control") {
                ctrlPressed.value = true;
            } else if (ev.key === "z" && ev.ctrlKey) {
                history.undo();
            } else if (ev.key === "y" && ev.ctrlKey) {
                history.redo();
            } else if (ev.key === "c" && ev.ctrlKey) {
                clipboard.copy(selectedNodes.value);
            } else if (ev.key === "v" && ev.ctrlKey && !clipboard.isEmpty) {
                history.startTransaction();
                clipboard.paste();
                history.commitTransaction();
            }
        };

        const keyUp = (ev: KeyboardEvent) => {
            if (ev.key === "Control") {
                ctrlPressed.value = false;
            }
        };

        const selectNode = (node: AbstractNode) => {
            if (!ctrlPressed.value) {
                unselectAllNodes();
            }
            selectedNodes.value.push(node);
        };

        const unselectAllNodes = () => {
            selectedNodes.value = [];
        };

        provide("plugin", props.plugin);
        return {
            el,
            selectedNodes,
            counter,
            nodes: props.plugin.editor.graph.nodes,
            connections: props.plugin.editor.graph.connections,
            backgroundStyle,
            nodeContainerStyle,
            mouseMoveHandler,
            mouseDown,
            mouseUp,
            keyDown,
            keyUp,
            selectNode,
            temporaryConnection: temporaryConnection.temporaryConnection,
            mouseWheel: panZoom.onMouseWheel,
        };
    },
});
</script>
