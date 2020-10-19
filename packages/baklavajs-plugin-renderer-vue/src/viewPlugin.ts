import Vue, { VueConstructor } from "vue";
import { IPlugin, IEditor } from "../../baklavajs-core/types";
import { SequentialHook } from "@baklavajs/events";
import { IViewNode, IViewPlugin } from "../types";

import NodeView from "./components/node/Node.vue";
import NodeOptionView from "./components/node/NodeOption.vue";
import NodeInterfaceView from "./components/node/NodeInterface.vue";
import ConnectionView from "./components/connection/ConnectionView.vue";
import ConnectionWrapper from "./components/connection/ConnectionWrapper.vue";
import TempConnectionView from "./components/connection/TemporaryConnection.vue";
import ContextMenu from "./components/ContextMenu.vue";
import Sidebar from "./components/Sidebar.vue";
import Minimap from "./components/Minimap.vue";

export class ViewPlugin implements IPlugin, IViewPlugin {

    public type = "ViewPlugin";
    public editor!: IEditor;
    public panning = { x: 0, y: 0 };
    public scaling = 1;
    public sidebar = { visible: false, nodeId: "", optionName: "" };

    /** Use straight connections instead of bezier curves */
    public useStraightConnections = false;

    /** Show a minimap */
    public enableMinimap = false;

    public options: Record<string, VueConstructor> = {};
    public nodeTypeAliases: Record<string, string> = {};

    public hooks = {
        /** Called whenever a node is rendered */
        renderNode: new SequentialHook<NodeView>(),
        /** Called whenever an option is rendered */
        renderOption: new SequentialHook<NodeOptionView>(),
        /** Called whenever an interface is rendered */
        renderInterface: new SequentialHook<NodeInterfaceView>(),
        /** Called whenever a connection is rendered */
        renderConnection: new SequentialHook<ConnectionView>()
    };

    /** Use this property to provide custom components,
     * which will be used when rendering the respective entities
     */
    public components: Record<string, Vue.Component> = {
        node: NodeView,
        nodeOption: NodeOptionView,
        nodeInterface: NodeInterfaceView,
        connection: ConnectionWrapper,
        tempConnection: TempConnectionView,
        contextMenu: ContextMenu,
        sidebar: Sidebar,
        minimap: Minimap
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
                // default values for savefiles from older versions
                n.position = state.position || { x: 0, y: 0 };
                n.width = state.width || 200;
                n.twoColumn = state.twoColumn || false;
                return state;
            });
        });
    }

    /**
     * Register a node option
     * @param name Name of the node option as used when defining nodes
     * @param component Component that will be rendered for the option
     */
    public registerOption(name: string, component: VueConstructor) {
        Vue.set(this.options, name, component);
    }

    /**
     * Add an alias for a node type that is displayed in the "Add Node" context menu instead of
     * the raw node type name
     * @param nodeType Node type
     * @param alias Alias that will be displayed in the context menu. When this value is `null`, an existing alias is removed
     */
    public setNodeTypeAlias(nodeType: string, alias: string|null) {
        if (alias) {
            Vue.set(this.nodeTypeAliases, nodeType, alias);
        } else if (this.nodeTypeAliases[nodeType]) {
            Vue.delete(this.nodeTypeAliases, nodeType);
        }
    }

}
