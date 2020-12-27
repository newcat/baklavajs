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
                    <component :is="plugin.components.connection" :connection="connection"></component>
                </slot>
            </g>
            <component
                :is="plugin.components.tempConnection"
                v-if="temporaryConnection"
                :connection="temporaryConnection"
            ></component>
        </svg>

        <div class="node-container" :style="styles">
            <component
                :is="plugin.components.node"
                v-for="node in nodes"
                :key="node.id + counter.toString()"
                :data="node"
                :selected="selectedNodes.includes(node)"
                @select="selectNode(node)"
            >
            </component>
        </div>

        <component :is="plugin.components.sidebar"></component>

        <component
            v-if="plugin.enableMinimap"
            :is="plugin.components.minimap"
            :nodes="nodes"
            :connections="connections"
        ></component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, provide, Ref, ref, toRef } from "vue";

import { Editor, AbstractNode, Connection, NodeInterface } from "@baklavajs/core";
import { ViewPlugin } from "../viewPlugin";
import { ITemporaryConnection, TemporaryConnectionState } from "../connection/connection";
import { usePanZoom } from "./panZoom";
import { useTemporaryConnection } from "./temporaryConnection";

// import Clipboard from "./clipboard";
import History from "./history";

export default defineComponent({
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

        // const clipboard = new Clipboard(props.plugin.editor);
        const history = new History(props.plugin);

        const pluginRef = toRef(props, "plugin") as Ref<ViewPlugin>;
        const panZoom = usePanZoom(pluginRef);
        const temporaryConnection = useTemporaryConnection(pluginRef);

        const backgroundStyles = props.plugin.backgroundStyles;
        const style = computed(() => ({
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
                selectedNodes.value.forEach((n) => props.plugin.editor.removeNode(n));
            } else if (ev.key === "Tab") {
                ev.preventDefault();
            } else if (ev.key === "Control") {
                ctrlPressed.value = true;
            } else if (ev.key === "z" && ev.ctrlKey) {
                history.undo();
            } else if (ev.key === "y" && ev.ctrlKey) {
                history.redo();
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
        return { el, backgroundStyles, style, onMouseWheel: panZoom.onMouseWheel };
    },
});
</script>
