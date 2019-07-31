import Vue, { VueConstructor } from "vue";
import { IPlugin, IEditor } from "../../baklavajs-core/types";
import { SequentialHook } from "../../baklavajs-core/src/events";
import { IViewNode, IViewPlugin } from "../types";

import NodeView from "./components/node/Node.vue";
import NodeOptionView from "./components/node/NodeOption.vue";
import NodeInterfaceView from "./components/node/NodeInterface.vue";
import ConnectionView from "./components/connection/ConnectionView.vue";
import ConnectionWrapper from "./components/connection/ConnectionWrapper.vue";
import TempConnectionView from "./components/connection/TemporaryConnection.vue";
import ContextMenu from "./components/ContextMenu.vue";
import Sidebar from "./components/Sidebar.vue";

export class ViewPlugin implements IPlugin, IViewPlugin {

    public type = "ViewPlugin";
    public editor!: IEditor;
    public panning = { x: 0, y: 0 };
    public scaling = 1;
    public sidebar = { visible: false, nodeId: "", optionName: "" };

    public options: Record<string, VueConstructor> = {};

    public hooks = {
        renderNode: new SequentialHook<NodeView>(),
        renderOption: new SequentialHook<NodeOptionView>(),
        renderInterface: new SequentialHook<NodeInterfaceView>(),
        renderConnection: new SequentialHook<ConnectionView>()
    };

    public components = {
        node: NodeView,
        nodeOption: NodeOptionView,
        nodeInterface: NodeInterfaceView,
        connection: ConnectionWrapper,
        tempConnection: TempConnectionView,
        contextMenu: ContextMenu,
        sidebar: Sidebar
    };

    public register(editor: IEditor): void {
        this.editor = editor;
        this.editor.hooks.load.tap(this, (d) => {
            this.panning = d.panning;
            this.scaling = d.scaling;
            return d;
        });
        this.editor.hooks.save.tap(this, (d) => {
            d.panning = this.panning;
            d.scaling = this.scaling;
            return d;
        });
        this.editor.events.beforeAddNode.addListener(this, (node) => {
            const n = node as IViewNode;
            n.position = { x: 0, y: 0 };
            n.disablePointerEvents = false;
            n.twoColumn = n.twoColumn || false;
            n.width = n.width || 200;
            node.hooks.save.tap(this, (state) => {
                state.position = n.position;
                state.width = n.width;
                state.twoColumn = n.twoColumn;
                return state;
            });
            node.hooks.load.tap(this, (state) => {
                n.position = state.position;
                n.width = state.width;
                n.twoColumn = state.twoColumn;
                return state;
            });
        });
    }

    public registerOption(name: string, component: VueConstructor) {
        Vue.set(this.options, name, component);
    }

}
