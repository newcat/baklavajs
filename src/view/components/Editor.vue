<template>
    <div tabindex="-1"
        :class="['node-editor', { 'ignore-mouse': !!temporaryConnection }]"
        @mousemove.self="mouseMoveHandler"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @mousewheel.self="mouseWheel"
        @keydown="keyDown"
        @contextmenu.self.prevent="openContextMenu"
    >

        <svg class="connections-container">
            <g v-for="connection in connections" :key="connection.id">
                <slot name="connections" :connection="connection">
                    <connection :connection="connection"></connection>
                </slot>
            </g>
            <temp-connection
                v-if="temporaryConnection"
                :connection="temporaryConnection"
            ></temp-connection>
        </svg>

        <div class="node-container" :style="styles">
            <node
                v-for="node in nodes"
                :key="node.id"
                :data="node"
                :selected="selectedNode === node"
                @select="selectNode(node)"
            >
            </node>

        </div>

        <context-menu
            v-model="contextMenu.show"
            :x="contextMenu.x"
            :y="contextMenu.y"
            :items="context"
            @click="onContextMenuClick"
        ></context-menu>

        <sidebar></sidebar>

    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from "vue-property-decorator";
import { VueConstructor } from "vue";

import { Editor, Node, Connection, NodeInterface, ITemporaryConnection, TemporaryConnectionState } from "../../core";

import NodeView from "./node/Node.vue";
import ConnectionView from "./connection/ConnectionWrapper.vue";
import TempConnectionView from "./connection/TemporaryConnection.vue";
import ContextMenu, { IMenuItem } from "./ContextMenu.vue";
import Sidebar from "./Sidebar.vue";

@Component({
    components: {
        "node": NodeView,
        "connection": ConnectionView,
        "temp-connection": TempConnectionView,
        ContextMenu,
        Sidebar
    }
})
export default class EditorView extends Vue {

    @Prop({ type: Object })
    model!: Editor;

    @Prop({ type: Object, default: () => ({}) })
    options!: Record<string, VueConstructor>;

    temporaryConnection: ITemporaryConnection|null = null;
    hoveringOver?: NodeInterface|null = null;
    selectedNode?: Node|null = null;
    dragging = false;

    contextMenu = {
        show: false,
        x: 0,
        y: 0
    };

    @Provide("editor")
    nodeeditor: EditorView = this;

    get styles() {
        return {
            "transform-origin": "0 0",
            // transform: `translate(${this.model.panning.x}px, ${this.model.panning.y}px) scale(${this.model.scaling})`
            "transform": `scale(${this.model.scaling}) translate(${this.model.panning.x}px, ${this.model.panning.y}px)`
        };
    }

    get nodes() {
        return this.model ? this.model.nodes : [];
    }

    get connections() {
        return this.model ? this.model.connections : [];
    }

    get context() {

        // TODO
        /*const categories = Object.keys(this.model.nodeCategories)
            .filter((c) => c !== "default")
            .map((c) => {
                const nodes = this.model.nodeCategories[c]
                    .map((n) => ({ value: "addNode:" + n, label: n }));
                return { label: c, submenu: nodes };
            });

        const defaultNodes = this.model.nodeCategories.default
            .map((n) => ({ value: "addNode:" + n, label: n }));

        return [
            {
                label: "Add Node",
                submenu: [ ...categories, { isDivider: true }, ...defaultNodes ]
            }
        ] as IMenuItem[];*/
        return [];

    }

    hoveredOver(ni: NodeInterface|undefined) {
        this.hoveringOver = ni;
        if (ni && this.temporaryConnection) {
            this.temporaryConnection.to = ni;
            this.temporaryConnection.status =
                this.model.checkConnection(this.temporaryConnection.from, this.temporaryConnection.to) ?
                TemporaryConnectionState.ALLOWED :
                TemporaryConnectionState.FORBIDDEN;
            this.connections
                .filter((c) => c.to === ni)
                .forEach((c) => { c.isInDanger = true; });
        } else if (!ni && this.temporaryConnection) {
            this.$set(this.temporaryConnection, "to", undefined);
            this.temporaryConnection.status = TemporaryConnectionState.NONE;
            this.connections.forEach((c) => { c.isInDanger = false; });
        }
    }

    mouseMoveHandler(ev: MouseEvent) {
        if (this.temporaryConnection) {
            this.temporaryConnection.mx = (ev.offsetX / this.model.scaling) - this.model.panning.x;
            this.temporaryConnection.my = (ev.offsetY / this.model.scaling) - this.model.panning.y;
        } else if (this.dragging) {
            this.model.panning.x += ev.movementX / this.model.scaling;
            this.model.panning.y += ev.movementY / this.model.scaling;
        }
    }

    mouseDown(ev: MouseEvent) {
        if (this.hoveringOver) {

            // if this interface is an input and already has a connection
            // to it, remove the connection and make it temporary
            const connection = this.connections.find((c) => c.to === this.hoveringOver);
            if (this.hoveringOver.isInput && connection) {
                this.temporaryConnection = {
                    status: TemporaryConnectionState.NONE,
                    from: connection.from
                };
                this.model.removeConnection(connection);
            } else {
                this.temporaryConnection = {
                    status: TemporaryConnectionState.NONE,
                    from: this.hoveringOver
                };
            }

            this.$set(this.temporaryConnection as any, "mx", null);
            this.$set(this.temporaryConnection as any, "my", null);

        } else if (ev.target === this.$el) {
            this.selectedNode = null;
            this.dragging = true;
        }
    }

    mouseUp(ev: MouseEvent) {
        this.dragging = false;
        const tc = this.temporaryConnection;
        if (tc && this.hoveringOver) {
            this.model.addConnection(tc.from, tc.to!);
        }
        this.temporaryConnection = null;
    }

    mouseWheel(ev: MouseWheelEvent) {
        ev.preventDefault();
        const newScale = this.model.scaling * (1 - ev.deltaY / 3000);
        const currentPoint = [
            (ev.offsetX / this.model.scaling) - this.model.panning.x,
            (ev.offsetY / this.model.scaling) - this.model.panning.y
        ];
        const newPoint = [
            (ev.offsetX / newScale) - this.model.panning.x,
            (ev.offsetY / newScale) - this.model.panning.y
        ];
        const diff = [
            newPoint[0] - currentPoint[0],
            newPoint[1] - currentPoint[1]
        ];
        this.model.panning.x += diff[0];
        this.model.panning.y += diff[1];
        this.model.scaling = newScale;
    }

    keyDown(ev: KeyboardEvent) {
        if (ev.key === "Delete" && this.selectedNode) {
            this.model.removeNode(this.selectedNode);
        } else if (ev.key === "Tab") {
            ev.preventDefault();
        }
    }

    selectNode(node: Node) {
        this.selectedNode = node;
    }

    openContextMenu(event: MouseEvent) {
        this.contextMenu.show = true;
        this.contextMenu.x = event.offsetX;
        this.contextMenu.y = event.offsetY;
    }

    onContextMenuClick(action: string) {
        if (action.startsWith("addNode:")) {
            // TODO
            /*const nodeName = action.substring(action.indexOf(":") + 1);
            const node = this.model.addNode(nodeName);
            if (node) {
                node.position.x = this.contextMenu.x;
                node.position.y = this.contextMenu.y;
            }*/
        }
    }

}
</script>
