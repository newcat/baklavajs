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
        @dragover="dragOver"
        @drop="drop"
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
            <template v-for="node in plugin.editor.graph.nodes">
                <slot
                    name="node"
                    :node="node"
                    :selected="plugin.selectedNodes.includes(node)"
                    @select="selectNode(node)"
                >
                    <node
                        :key="node.id + counter.toString()"
                        :node="node"
                        :selected="plugin.selectedNodes.includes(node)"
                        @select="selectNode(node)"
                    >
                    </node>
                </slot>
            </template>
        </div>

        <slot name="sidebar">
            <sidebar :graph="currentGraph"></sidebar>
        </slot>

        <slot name="minimap" :nodes="nodes" :connections="connections">
            <minimap v-if="plugin.enableMinimap" :nodes="nodes" :connections="connections"></minimap>
        </slot>

        <NodePalette />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, isReactive, isRef, reactive, Ref, ref, toRef, watch, watchEffect } from "vue";

import { AbstractNode, Graph } from "@baklavajs/core";
import { ViewPlugin } from "../viewPlugin";
import { usePanZoom } from "./panZoom";
import { useTemporaryConnection } from "./temporaryConnection";

import Node from "../node/Node.vue";
import ConnectionWrapper from "../connection/ConnectionWrapper.vue";
import TemporaryConnection from "../connection/TemporaryConnection.vue";
import Sidebar from "../components/Sidebar.vue";
import Minimap from "../components/Minimap.vue";
import NodePalette from "../nodepalette/NodePalette.vue";

import { useTransform, providePlugin, provideGraph } from "../utility";

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

        const pluginRef = toRef(props, "plugin") as Ref<ViewPlugin>;
        providePlugin(pluginRef);

        const el = ref<HTMLElement | null>(null);

        const currentGraph = toRef(pluginRef.value, "displayedGraph") as Ref<Graph>;
        provideGraph(currentGraph);
        const nodes = computed(() => {
            console.log("Recomputing nodes");
            return currentGraph.value.nodes;
        });
        const connections = computed(() => currentGraph.value.connections);

        /*watch(
            () => [...props.plugin.displayedGraph.nodes],
            (c, p) => {
                if (c.length !== p.length) {
                    console.log(c.length, p.length);
                }
            },
            { deep: true }
        );

        watchEffect(() => {
            console.log("effect", props.plugin.editor.graph.nodes[0].position);
        });*/

        const panZoom = usePanZoom(pluginRef);
        const temporaryConnection = useTemporaryConnection(pluginRef);
        const { transform } = useTransform();

        const backgroundStyle = props.plugin.backgroundStyles;
        const nodeContainerStyle = computed(() => ({
            ...panZoom.styles.value,
        }));

        // Reason: https://github.com/newcat/baklavajs/issues/54
        const counter = ref(0);
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
                    panZoom.onMouseDown(ev);
                }
                temporaryConnection.onMouseDown();
            }
        };

        const mouseUp = () => {
            panZoom.onMouseUp();
            temporaryConnection.onMouseUp();
        };

        const keyDown = (ev: KeyboardEvent) => {
            if (ev.key === "Tab") {
                ev.preventDefault();
            }
            props.plugin.hotkeyHandler.onKeyDown(ev);
        };

        const keyUp = (ev: KeyboardEvent) => {
            props.plugin.hotkeyHandler.onKeyUp(ev);
        };

        const dragOver = (ev: DragEvent) => {
            ev.preventDefault();
            if (ev.dataTransfer?.getData("text/plain")) {
                const nodeTypeName = ev.dataTransfer.getData("text/plain");
                if (props.plugin.editor.nodeTypes.has(nodeTypeName)) {
                    ev.dataTransfer.dropEffect = "copy";
                } else {
                    ev.dataTransfer.dropEffect = "none";
                }
            }
        };

        const drop = (ev: DragEvent) => {
            ev.preventDefault();
            if (ev.dataTransfer?.getData("text/plain")) {
                const nodeTypeName = ev.dataTransfer.getData("text/plain");
                const nodeTypeInfo = props.plugin.editor.nodeTypes.get(nodeTypeName);
                if (!nodeTypeInfo) {
                    return;
                }

                const instance = new nodeTypeInfo.type();
                props.plugin.displayedGraph.addNode(instance);
                const [x, y] = transform(ev.clientX, ev.clientY);
                instance.position.x = x;
                instance.position.y = y;
            }
        };

        const selectNode = (node: AbstractNode) => {
            if (!props.plugin.hotkeyHandler.pressedKeys.includes("Control")) {
                unselectAllNodes();
            }
            props.plugin.selectedNodes.push(node);
        };

        const unselectAllNodes = () => {
            props.plugin.selectedNodes = [];
        };

        return {
            el,
            counter,
            currentGraph,
            nodes,
            connections,
            backgroundStyle,
            nodeContainerStyle,
            mouseMoveHandler,
            mouseDown,
            mouseUp,
            keyDown,
            keyUp,
            dragOver,
            drop,
            selectNode,
            temporaryConnection: temporaryConnection.temporaryConnection,
            mouseWheel: panZoom.onMouseWheel,
        };
    },
});
</script>

function useDragMove() { throw new Error("Function not implemented."); }
