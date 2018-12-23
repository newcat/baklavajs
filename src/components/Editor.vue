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
                :data="temporaryConnection"
                :valid="temporaryConnectionValid"
            ></temp-connection>
        </svg>
        <node
            v-for="node in nodes"
            :key="node.id"
            :data="node"
            :selected="selectedNodeId === node.id"
            @select="selectNode(node.id)"
            @input="updateNode(node.id, $event)"
        >
        </node>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from "vue-property-decorator";

import { INode } from "@/types/node";
import { IConnection } from "@/types/connection";

import Node from "./node/Node.vue";
import NodeInterface from "./node/NodeInterface.vue";
import Connection from "./connection/ConnectionWrapper.vue";
import TempConnection from "./connection/TemporaryConnection.vue";
import { ITemporaryConnection, TemporaryConnectionState } from "@/types/temporaryConnection";
import generateId from "@/utility/idGenerator";
import { INodeInterface } from "@/types/nodeInterface";

@Component({
    components: {
        "node": Node,
        "connection": Connection,
        "temp-connection": TempConnection
    }
})
export default class Editor extends Vue {

    @Prop({ type: Array, default: () => [] })
    nodes!: INode[];

    @Prop({ type: Array, default: () => [] })
    connections!: IConnection[];

    @Prop({ type: Boolean, default: false })
    temporaryConnectionValid!: boolean;

    xOffset = 0;
    yOffset = 0;

    temporaryConnection: ITemporaryConnection|null = null;
    hoveringOver?: INodeInterface|null = null;
    selectedNodeId: string = "";

    @Provide("editor")
    nodeeditor: Editor = this;

    registerNode(id: string, node: Node) {
        this.$set(this.nodes, id, node);
    }

    unregisterNode(id: string) {
        this.$delete(this.nodes, id);
    }

    hoveredOver(ni: INodeInterface|undefined) {
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
                this.$emit("deleteConnection", connection);
            } else {
                this.temporaryConnection = {
                    status: TemporaryConnectionState.NONE,
                    from: {
                        node: this.hoveringOver.parent,
                        interface: this.hoveringOver
                    }
                };
            }

            this.$set(this.temporaryConnection as any, "mx", ev.x);
            this.$set(this.temporaryConnection as any, "my", ev.y);

        } else {
            this.selectedNodeId = "";
        }
    }

    mouseUp(ev: MouseEvent) {
        const tc = this.temporaryConnection;
        if (tc && this.hoveringOver) {
            const newConnections = this.connections.concat([{
                id: generateId(),
                from: tc.from,
                to: tc.to!
            }]);
            this.$emit("update:connections", newConnections);
        }
        this.temporaryConnection = null;
    }

    keyDown(ev: KeyboardEvent) {
        if (ev.key === "Delete" && this.selectedNodeId) {
            this.$emit("deleteNode", this.selectedNodeId);
        }
    }

    selectNode(id: string) {
        this.selectedNodeId = id;
    }

    updateNode(id: string, value: INode) {
        const copy = this.nodes.slice();
        const index = copy.findIndex((x) => x.id === id);
        copy[index] = value;
        this.$emit("update:nodes", copy);
    }

}
</script>
