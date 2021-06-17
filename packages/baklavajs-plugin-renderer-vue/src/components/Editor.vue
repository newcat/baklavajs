<template>
    <div
        tabindex="-1"
        :class="[
            'node-editor',
            { 'ignore-mouse': !!temporaryConnection, '--temporary-connection': !!temporaryConnection },
        ]"
        @mousemove.self="mouseMoveHandler"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @wheel.self="mouseWheel"
        @keydown="keyDown"
        @keyup="keyUp"
        @contextmenu.self.prevent="openContextMenu"
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
                @select="selectNode(node, $event)"
            >
            </component>
        </div>

        <component
            :is="plugin.components.contextMenu"
            v-model="contextMenu.show"
            :x="contextMenu.x"
            :y="contextMenu.y"
            :items="contextMenu.items"
            flippable
            @click="onContextMenuClick"
        ></component>

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
import { Component, Vue, Prop, Provide, Watch } from "vue-property-decorator";

import {
    ITransferConnection,
    INodeInterface,
    ITemporaryConnection,
    TemporaryConnectionState,
} from "../../../baklavajs-core/types";
import { ViewPlugin } from "../viewPlugin";
import { IViewNode } from "../../types";
import { IMenuItem } from "./ContextMenu.vue";

import Clipboard from "../clipboard";
import History from "../history";

interface IPosition {
    x: number;
    y: number;
}

@Component
export default class EditorView extends Vue {
    @Prop({ type: Object, required: true })
    @Provide("plugin")
    plugin!: ViewPlugin;

    @Provide("editor")
    nodeeditor: EditorView = this;

    clipboard!: Clipboard;
    history!: History;

    temporaryConnection: ITemporaryConnection | null = null;
    hoveringOver?: INodeInterface | null = null;
    selectedNodes: IViewNode[] = [];
    ctrlPressed = false;

    draggingStartPoint: IPosition | null = null;
    draggingStartPanning: IPosition | null = null;

    // Reason: https://github.com/newcat/baklavajs/issues/54
    counter = 0;

    contextMenu = {
        items: [] as IMenuItem[],
        show: false,
        x: 0,
        y: 0,
    };

    get styles() {
        return {
            "transform-origin": "0 0",
            "transform": `scale(${this.plugin.scaling}) translate(${this.plugin.panning.x}px, ${this.plugin.panning.y}px)`,
        };
    }

    get backgroundStyle() {
        const positionLeft = this.plugin.panning.x * this.plugin.scaling;
        const positionTop = this.plugin.panning.y * this.plugin.scaling;
        const size = this.plugin.scaling * this.plugin.backgroundGrid.gridSize;
        const subSize = size / this.plugin.backgroundGrid.gridDivision;
        const backgroundSize = `${size}px ${size}px, ${size}px ${size}px`;
        const subGridBackgroundSize =
            this.plugin.scaling > this.plugin.backgroundGrid.subGridVisibleThreshold
                ? `, ${subSize}px ${subSize}px, ${subSize}px ${subSize}px`
                : "";
        return {
            "background-position": `left ${positionLeft}px top ${positionTop}px`,
            "background-size": `${backgroundSize} ${subGridBackgroundSize}`,
        };
    }

    get nodes() {
        return this.plugin.editor ? this.plugin.editor.nodes : [];
    }

    get connections() {
        return this.plugin.editor ? this.plugin.editor.connections : [];
    }

    get hasEnginePlugin() {
        for (const p of this.plugin.editor.plugins.values()) {
            if (p.type === "EnginePlugin") {
                return true;
            }
        }
        return false;
    }

    mounted() {
        this.updateContextMenu();
        this.plugin.editor.events.registerNodeType.addListener(this, () => this.updateContextMenu());
        this.plugin.editor.hooks.load.tap(this, (s) => {
            this.counter++;
            return s;
        });
        this.clipboard = new Clipboard(this.plugin.editor);
        this.history = new History(this.plugin);
        Vue.prototype.$selectedNodeEvents = [];
    }

    @Watch("plugin.nodeTypeAliases")
    updateContextMenu() {
        const categories = Array.from(this.plugin.editor.nodeCategories.keys())
            .filter((c) => c !== "default")
            .map((c) => {
                const nodes = Array.from(this.plugin.editor.nodeCategories.get(c)!).map((n) => ({
                    value: "addNode:" + n,
                    label: this.plugin.nodeTypeAliases[n] || n,
                }));
                return { label: c, submenu: nodes };
            });

        const defaultNodes = this.plugin.editor.nodeCategories.get("default")!.map((n) => ({
            value: "addNode:" + n,
            label: this.plugin.nodeTypeAliases[n] || n,
        }));

        const addNodeSubmenu: IMenuItem[] = [...categories];
        if (categories.length > 0 && defaultNodes.length > 0) {
            addNodeSubmenu.push({ isDivider: true });
        }
        addNodeSubmenu.push(...defaultNodes);

        this.contextMenu.items = [
            {
                label: "Add Node",
                submenu: addNodeSubmenu,
            },
            {
                label: "Copy Nodes",
                value: "copy",
                disabledFunction: () => this.selectedNodes.length === 0,
            },
            {
                label: "Paste Nodes",
                value: "paste",
                disabledFunction: () => this.clipboard.isEmpty,
            },
        ] as IMenuItem[];
    }

    hoveredOver(ni: INodeInterface | undefined) {
        this.hoveringOver = ni;
        if (ni && this.temporaryConnection) {
            this.temporaryConnection.to = ni;
            this.temporaryConnection.status = this.plugin.editor.checkConnection(
                this.temporaryConnection.from,
                this.temporaryConnection.to
            )
                ? TemporaryConnectionState.ALLOWED
                : TemporaryConnectionState.FORBIDDEN;
            if (this.hasEnginePlugin) {
                this.connections
                    .filter((c) => c.to === ni)
                    .forEach((c) => {
                        (c as ITransferConnection).isInDanger = true;
                    });
            }
        } else if (!ni && this.temporaryConnection) {
            this.$set(this.temporaryConnection, "to", undefined);
            this.temporaryConnection.status = TemporaryConnectionState.NONE;
            this.connections.forEach((c) => {
                (c as ITransferConnection).isInDanger = false;
            });
        }
    }

    mouseMoveHandler(ev: MouseEvent) {
        if (this.temporaryConnection) {
            this.temporaryConnection.mx = ev.offsetX / this.plugin.scaling - this.plugin.panning.x;
            this.temporaryConnection.my = ev.offsetY / this.plugin.scaling - this.plugin.panning.y;
        } else if (this.draggingStartPoint) {
            const dx = ev.screenX - this.draggingStartPoint.x;
            const dy = ev.screenY - this.draggingStartPoint.y;
            this.plugin.panning.x = this.draggingStartPanning!.x + dx / this.plugin.scaling;
            this.plugin.panning.y = this.draggingStartPanning!.y + dy / this.plugin.scaling;
        }
    }

    mouseDown(ev: MouseEvent) {
        if (ev.button === 0) {
            if (this.hoveringOver) {
                // if this interface is an input and already has a connection
                // to it, remove the connection and make it temporary
                const connection = this.connections.find((c) => c.to === this.hoveringOver);
                if (this.hoveringOver.isInput && connection) {
                    this.temporaryConnection = {
                        status: TemporaryConnectionState.NONE,
                        from: connection.from,
                    };
                    this.plugin.editor.removeConnection(connection);
                } else {
                    this.temporaryConnection = {
                        status: TemporaryConnectionState.NONE,
                        from: this.hoveringOver,
                    };
                }

                this.$set(this.temporaryConnection as any, "mx", null);
                this.$set(this.temporaryConnection as any, "my", null);
            } else if (ev.target === this.$el) {
                this.unselectAllNodes();
                this.draggingStartPoint = {
                    x: ev.screenX,
                    y: ev.screenY,
                };
                this.draggingStartPanning = {
                    x: this.plugin.panning.x,
                    y: this.plugin.panning.y,
                };
            }
        }
    }

    mouseUp() {
        this.draggingStartPoint = null;
        this.draggingStartPanning = null;
        const tc = this.temporaryConnection;
        if (tc && this.hoveringOver) {
            this.plugin.editor.addConnection(tc.from, tc.to!);
        }
        this.temporaryConnection = null;
    }

    mouseWheel(ev: WheelEvent) {
        ev.preventDefault();
        let scrollAmount = ev.deltaY;
        if (ev.deltaMode === 1) {
            scrollAmount *= 32; // Firefox fix, multiplier is trial & error
        }
        const newScale = this.plugin.scaling * (1 - scrollAmount / 3000);
        const currentPoint = [
            ev.offsetX / this.plugin.scaling - this.plugin.panning.x,
            ev.offsetY / this.plugin.scaling - this.plugin.panning.y,
        ];
        const newPoint = [ev.offsetX / newScale - this.plugin.panning.x, ev.offsetY / newScale - this.plugin.panning.y];
        const diff = [newPoint[0] - currentPoint[0], newPoint[1] - currentPoint[1]];
        this.plugin.panning.x += diff[0];
        this.plugin.panning.y += diff[1];
        this.plugin.scaling = newScale;
    }

    keyDown(ev: KeyboardEvent) {
        if (ev.key === "Delete" && this.selectedNodes.length > 0) {
            this.selectedNodes.forEach((n) => this.plugin.editor.removeNode(n));
        } else if (ev.key === "Tab") {
            ev.preventDefault();
        } else if (ev.key === "Control") {
            this.ctrlPressed = true;
        } else if (ev.key === "z" && ev.ctrlKey) {
            this.history.undo();
        } else if (ev.key === "y" && ev.ctrlKey) {
            this.history.redo();
        }
    }

    keyUp(ev: KeyboardEvent) {
        if (ev.key === "Control") {
            this.ctrlPressed = false;
        }
    }

    selectNode(node: IViewNode, event: Event) {
        if (!this.ctrlPressed) {
            this.unselectAllNodes();
        }

        this.selectedNodes.push(node);
        Vue.prototype.$selectedNodeEvents.push(event);
    }

    unselectAllNodes() {
        this.selectedNodes.splice(0, this.selectedNodes.length);
        Vue.prototype.$selectedNodeEvents.splice(0, Vue.prototype.$selectedNodeEvents.length);
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
                    node.position.x = this.contextMenu.x / this.plugin.scaling - this.plugin.panning.x;
                    node.position.y = this.contextMenu.y / this.plugin.scaling - this.plugin.panning.y;
                }
            }
        } else if (action === "copy" && this.selectedNodes.length > 0) {
            this.clipboard.copy(this.selectedNodes);
        } else if (action === "paste" && !this.clipboard.isEmpty) {
            this.clipboard.paste();
        }
    }
}
</script>
