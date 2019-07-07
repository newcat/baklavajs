<template>
    <div tabindex="-1"
        :class="['node-editor', { 'ignore-mouse': !!temporaryConnection }]"
        @mousemove.self="mouseMoveHandler"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @wheel.self="mouseWheel"
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
            :items="contextMenu.items"
            @click="onContextMenuClick"
        ></context-menu>

        <sidebar></sidebar>

    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from "vue-property-decorator";
import { VueConstructor } from "vue";

import { IEditor, INode, ITransferConnection, INodeInterface,
    ITemporaryConnection, TemporaryConnectionState } from "../../../baklavajs-core/types";
import { ViewPlugin, IViewNode } from "../viewPlugin";

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

    @Prop({ type: Object, required: true })
    @Provide("plugin")
    plugin!: ViewPlugin;

    @Provide("editor")
    nodeeditor: EditorView = this;

    temporaryConnection: ITemporaryConnection|null = null;
    hoveringOver?: INodeInterface|null = null;
    selectedNode?: IViewNode|null = null;
    dragging = false;

    contextMenu = {
        items: [] as IMenuItem[],
        show: false,
        x: 0,
        y: 0
    };

    get styles() {
        return {
            "transform-origin": "0 0",
            "transform": `scale(${this.plugin.scaling}) translate(${this.plugin.panning.x}px, ${this.plugin.panning.y}px)`
        };
    }

    get nodes() {
        return this.plugin.editor ? this.plugin.editor.nodes : [];
    }

    get connections() {
        return this.plugin.editor ? this.plugin.editor.connections : [];
    }

    mounted() {
        this.updateContextMenu();
        this.plugin.editor.events.registerNodeType.addListener(this, () => this.updateContextMenu());
    }

    updateContextMenu() {

        const categories = Array.from(this.plugin.editor.nodeCategories.keys())
            .filter((c) => c !== "default")
            .map((c) => {
                const nodes = Array.from(this.plugin.editor.nodeCategories.get(c)!)
                    .map((n) => ({ value: "addNode:" + n, label: n }));
                return { label: c, submenu: nodes };
            });

        const defaultNodes = this.plugin.editor.nodeCategories.get("default")!
            .map((n) => ({ value: "addNode:" + n, label: n }));

        this.contextMenu.items = [
            {
                label: "Add Node",
                submenu: [ ...categories, { isDivider: true }, ...defaultNodes ]
            }
        ] as IMenuItem[];

    }

    hoveredOver(ni: INodeInterface|undefined) {
        this.hoveringOver = ni;
        if (ni && this.temporaryConnection) {
            this.temporaryConnection.to = ni;
            this.temporaryConnection.status =
                this.plugin.editor.checkConnection(this.temporaryConnection.from, this.temporaryConnection.to) ?
                TemporaryConnectionState.ALLOWED :
                TemporaryConnectionState.FORBIDDEN;
            this.connections
                .filter((c) => c.to === ni)
                .forEach((c) => { (c as ITransferConnection).isInDanger = true; });
        } else if (!ni && this.temporaryConnection) {
            this.$set(this.temporaryConnection, "to", undefined);
            this.temporaryConnection.status = TemporaryConnectionState.NONE;
            this.connections.forEach((c) => { (c as ITransferConnection).isInDanger = false; });
        }
    }

    mouseMoveHandler(ev: MouseEvent) {
        if (this.temporaryConnection) {
            this.temporaryConnection.mx = (ev.offsetX / this.plugin.scaling) - this.plugin.panning.x;
            this.temporaryConnection.my = (ev.offsetY / this.plugin.scaling) - this.plugin.panning.y;
        } else if (this.dragging) {
            this.plugin.panning.x += ev.movementX / this.plugin.scaling;
            this.plugin.panning.y += ev.movementY / this.plugin.scaling;
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
                this.plugin.editor.removeConnection(connection);
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
            this.plugin.editor.addConnection(tc.from, tc.to!);
        }
        this.temporaryConnection = null;
    }

    mouseWheel(ev: MouseWheelEvent) {
        ev.preventDefault();
        const newScale = this.plugin.scaling * (1 - ev.deltaY / 3000);
        const currentPoint = [
            (ev.offsetX / this.plugin.scaling) - this.plugin.panning.x,
            (ev.offsetY / this.plugin.scaling) - this.plugin.panning.y
        ];
        const newPoint = [
            (ev.offsetX / newScale) - this.plugin.panning.x,
            (ev.offsetY / newScale) - this.plugin.panning.y
        ];
        const diff = [
            newPoint[0] - currentPoint[0],
            newPoint[1] - currentPoint[1]
        ];
        this.plugin.panning.x += diff[0];
        this.plugin.panning.y += diff[1];
        this.plugin.scaling = newScale;
    }

    keyDown(ev: KeyboardEvent) {
        if (ev.key === "Delete" && this.selectedNode) {
            this.plugin.editor.removeNode(this.selectedNode);
        } else if (ev.key === "Tab") {
            ev.preventDefault();
        }
    }

    selectNode(node: IViewNode) {
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
            const nt = this.plugin.editor.nodeTypes.get(nodeName);
            if (nt) {
                const node = this.plugin.editor.addNode(new nt()) as IViewNode;
                if (node) {
                    node.position.x = this.contextMenu.x;
                    node.position.y = this.contextMenu.y;
                }
            }
        }
    }

}
</script>
