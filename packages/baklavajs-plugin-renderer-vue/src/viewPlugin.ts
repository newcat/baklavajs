import { ComputedRef, ComponentOptions } from "vue";
import { IPlugin, Editor } from "@baklavajs/core";
import { SequentialHook } from "@baklavajs/events";

import NodeView from "./components/node/Node.vue";
import NodeOptionView from "./components/node/NodeOption.vue";
import NodeInterfaceView from "./components/node/NodeInterface.vue";
import ConnectionView from "./components/connection/ConnectionView.vue";
import ConnectionWrapper from "./components/connection/ConnectionWrapper.vue";
import TempConnectionView from "./components/connection/TemporaryConnection.vue";
import Sidebar from "./components/Sidebar.vue";
import Minimap from "./components/Minimap.vue";
import { gridBackgroundProvider } from "./editor/backgroundProvider";
import { IViewNode, IViewNodeState } from "./node/viewNode";

export class ViewPlugin implements IPlugin {
    public type = "ViewPlugin";
    public editor!: Editor;
    public panning = { x: 0, y: 0 };
    public scaling = 1;
    public sidebar = { visible: false, nodeId: "", optionName: "" };

    public backgroundStyles: ComputedRef<Record<string, any>> = gridBackgroundProvider(this, {
        gridSize: 100,
        gridDivision: 5,
        subGridVisibleThreshold: 0.6,
    });

    /** Use straight connections instead of bezier curves */
    public useStraightConnections = false;

    /** Show a minimap */
    public enableMinimap = false;

    public hooks = {
        /** Called whenever a node is rendered */
        renderNode: new SequentialHook<NodeView>(),
        /** Called whenever an option is rendered */
        renderOption: new SequentialHook<NodeOptionView>(),
        /** Called whenever an interface is rendered */
        renderInterface: new SequentialHook<NodeInterfaceView>(),
        /** Called whenever a connection is rendered */
        renderConnection: new SequentialHook<ConnectionView>(),
    };

    /** Use this property to provide custom components,
     * which will be used when rendering the respective entities
     */
    public components: Record<string, ComponentOptions> = {
        node: NodeView,
        nodeOption: NodeOptionView,
        nodeInterface: NodeInterfaceView,
        connection: ConnectionWrapper,
        tempConnection: TempConnectionView,
        sidebar: Sidebar,
        minimap: Minimap,
    };

    public register(editor: Editor): void {
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
            node.hooks.afterSave.tap(this, (state) => {
                (state as IViewNodeState).position = n.position;
                (state as IViewNodeState).width = n.width;
                (state as IViewNodeState).twoColumn = n.twoColumn;
                return state;
            });
            node.hooks.beforeLoad.tap(this, (state) => {
                // default values for savefiles from older versions
                n.position = (state as IViewNodeState).position || { x: 0, y: 0 };
                n.width = (state as IViewNodeState).width || 200;
                n.twoColumn = (state as IViewNodeState).twoColumn || false;
                return state;
            });
        });
    }
}
