<template>
    <div
        tabindex="0"
        :class="['node-editor', { 'ignore-mouse': !!temporaryConnection }]"
        @mousemove="mouseMoveHandler"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
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
        <node
            v-for="node in nodes"
            :key="node.id"
            :data="node"
            :selected="selectedNode === node"
            @select="selectNode(node)"
        >
        </node>

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

import { Editor, Node, Connection, NodeInterface, ITemporaryConnection, TemporaryConnectionState } from "../model";

import NodeView from "./node/Node.vue";
import ConnectionView from "./connection/ConnectionWrapper.vue";
import TempConnectionView from "./connection/TemporaryConnection.vue";
import ContextMenu from "./ContextMenu.vue";
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

    xOffset = 0;
    yOffset = 0;

    temporaryConnection: ITemporaryConnection|null = null;
    hoveringOver?: NodeInterface|null = null;
    selectedNode?: Node|null = null;

    contextMenu = {
        show: false,
        x: 0,
        y: 0
    };

    @Provide("editor")
    nodeeditor: EditorView = this;

    get nodes() {
        return this.model ? this.model.nodes : [];
    }

    get connections() {
        return this.model ? this.model.connections : [];
    }

    get context() {

        const categories = Object.keys(this.model.nodeCategories)
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
                submenu: [ ...categories, ...defaultNodes ]
            }
        ];

    }

    hoveredOver(ni: NodeInterface|undefined) {
        this.hoveringOver = ni;
        if (ni && this.temporaryConnection && this.temporaryConnection.from !== ni) {
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
        if (!this.temporaryConnection) { return; }
        this.temporaryConnection.mx = ev.offsetX;
        this.temporaryConnection.my = ev.offsetY;
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

            this.$set(this.temporaryConnection as any, "mx", ev.x);
            this.$set(this.temporaryConnection as any, "my", ev.y);

        } else if (ev.target === this.$el) {
            this.selectedNode = null;
        }
    }

    mouseUp(ev: MouseEvent) {
        const tc = this.temporaryConnection;
        if (tc && this.hoveringOver) {
            this.model.addConnection(tc.from, tc.to!);
        }
        this.temporaryConnection = null;
    }

    keyDown(ev: KeyboardEvent) {
        if (ev.key === "Delete" && this.selectedNode) {
            this.model.removeNode(this.selectedNode);
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
            const nodeName = action.substring(action.indexOf(":") + 1);
            const node = this.model.addNode(nodeName);
            if (node) {
                node.position.x = this.contextMenu.x;
                node.position.y = this.contextMenu.y;
            }
        }
    }

}
</script>
