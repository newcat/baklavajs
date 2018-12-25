<template>
    <div
        tabindex="0"
        :class="['node-editor', { 'ignore-mouse': !!temporaryConnection }]"
        @mousemove="mouseMoveHandler"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @keydown="keyDown"
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
            @input="updateNode(node.id, $event)"
        >
        </node>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from "vue-property-decorator";

import Editor from "@/model/editor";
import Node from "@/model/node";
import Connection from "@/model/connection";
import NodeInterface from "@/model/nodeInterface";

import NodeView from "./node/Node.vue";
import NodeInterfaceView from "./node/NodeInterface.vue";
import ConnectionView from "./connection/ConnectionWrapper.vue";
import TempConnectionView from "./connection/TemporaryConnection.vue";

import { ITemporaryConnection, TemporaryConnectionState } from "@/types/temporaryConnection";

@Component({
    components: {
        "node": NodeView,
        "connection": ConnectionView,
        "temp-connection": TempConnectionView
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

    @Provide("editor")
    nodeeditor: EditorView = this;

    get nodes() {
        return this.model ? this.model.nodes : [];
    }

    get connections() {
        return this.model ? this.model.connections : [];
    }

    registerNode(id: string, node: NodeView) {
        // this.$set(this.nodes, id, node);
    }

    unregisterNode(id: string) {
        // this.$delete(this.nodes, id);
    }

    hoveredOver(ni: NodeInterface|undefined) {
        this.hoveringOver = ni;
        if (ni && this.temporaryConnection && this.temporaryConnection.from.interface !== ni) {
            this.temporaryConnection.to = {
                node: ni.parent,
                interface: ni
            };
            this.$emit("checkTemporaryConnection", this.temporaryConnection);
        } else if (!ni && this.temporaryConnection) {
            this.$set(this.temporaryConnection, "to", undefined);
            this.$emit("checkTemporaryConnection");
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
            const connection = this.connections.find((c) => c.to.interface === this.hoveringOver);
            if (this.hoveringOver.isInput && connection) {
                this.temporaryConnection = {
                    status: TemporaryConnectionState.NONE,
                    from: {
                        node: connection.from.node,
                        interface: connection.from.interface
                    }
                };
                this.model.removeConnection(connection);
            } else {
                this.temporaryConnection = {
                    status: TemporaryConnectionState.NONE,
                    from: {
                        node: this.hoveringOver.parent as Node,
                        interface: this.hoveringOver
                    }
                };
            }

            this.$set(this.temporaryConnection as any, "mx", ev.x);
            this.$set(this.temporaryConnection as any, "my", ev.y);

        } else {
            this.selectedNode = null;
        }
    }

    mouseUp(ev: MouseEvent) {
        const tc = this.temporaryConnection;
        if (tc && this.hoveringOver) {
            this.model.addConnection(new Connection(tc.from, tc.to!));
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

    updateNode(id: string, value: Node) {
        /*const copy = this.nodes.slice();
        const index = copy.findIndex((x) => x.id === id);
        copy[index] = value;
        this.$emit("update:nodes", copy);*/
    }

}
</script>
