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
            <sidebar></sidebar>
        </slot>

        <slot name="minimap">
            <minimap v-if="plugin.settings.enableMinimap"></minimap>
        </slot>

        <NodePalette />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, isReactive, isRef, reactive, Ref, ref, toRef, watch, watchEffect } from "vue";

import { AbstractNode, Graph } from "@baklavajs/core";
import { IBaklavaView } from "../useBaklava";
import { usePanZoom } from "./panZoom";
import { useTemporaryConnection } from "./temporaryConnection";

import Node from "../node/Node.vue";
import ConnectionWrapper from "../connection/ConnectionWrapper.vue";
import TemporaryConnection from "../connection/TemporaryConnection.vue";
import Sidebar from "../components/Sidebar.vue";
import Minimap from "../components/Minimap.vue";
import NodePalette from "../nodepalette/NodePalette.vue";

import { useTransform, providePlugin } from "../utility";

export default defineComponent({
    components: { Node, ConnectionWrapper, TemporaryConnection, Sidebar, Minimap, NodePalette },
    props: {
        plugin: {
            type: Object as () => IBaklavaView,
            required: true,
        },
    },
    setup(props) {
        const token = Symbol("EditorToken");

        const pluginRef = (toRef(props, "plugin") as unknown) as Ref<IBaklavaView>;
        providePlugin(pluginRef);

        const el = ref<HTMLElement | null>(null);

        const currentGraph = props.plugin.displayedGraph;
        const nodes = computed(() => currentGraph.value.nodes);
        const connections = computed(() => currentGraph.value.connections);
        const selectedNodes = computed(() => currentGraph.value.selectedNodes);

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

        const panZoom = usePanZoom();
        const temporaryConnection = useTemporaryConnection();
        const { transform } = useTransform();

        const backgroundStyle = props.plugin.backgroundStyles;
        const nodeContainerStyle = computed(() => ({
            ...panZoom.styles.value,
        }));

        // Reason: https://github.com/newcat/baklavajs/issues/54
        const counter = ref(0);
        props.plugin.editor.value.hooks.load.tap(token, (s) => {
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
            props.plugin.commandHandler.handleKeyDown(ev);
        };

        const keyUp = (ev: KeyboardEvent) => {
            props.plugin.commandHandler.handleKeyUp(ev);
        };

        const dragOver = (ev: DragEvent) => {
            ev.preventDefault();
            if (ev.dataTransfer?.getData("text/plain")) {
                const nodeTypeName = ev.dataTransfer.getData("text/plain");
                if (props.plugin.editor.value.nodeTypes.has(nodeTypeName)) {
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
                const nodeTypeInfo = props.plugin.editor.value.nodeTypes.get(nodeTypeName);
                if (!nodeTypeInfo) {
                    return;
                }

                const instance = new nodeTypeInfo.type();
                currentGraph.value.addNode(instance);
                const [x, y] = transform(ev.clientX, ev.clientY);
                instance.position.x = x;
                instance.position.y = y;
            }
        };

        const selectNode = (node: AbstractNode) => {
            if (!props.plugin.commandHandler.pressedKeys.value.includes("Control")) {
                unselectAllNodes();
            }
            currentGraph.value.selectedNodes.push(node);
        };

        const unselectAllNodes = () => {
            currentGraph.value.selectedNodes = [];
        };

        return {
            el,
            counter,
            nodes,
            connections,
            selectedNodes,
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
