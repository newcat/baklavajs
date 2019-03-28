import Vue, { VueConstructor } from "vue";
import { IPlugin, Editor, SequentialHook, Node } from "../core";
import NodeView from "./components/node/Node.vue";
import NodeOptionView from "./components/node/NodeOption.vue";
import NodeInterfaceView from "./components/node/NodeInterface.vue";
import ConnectionView from "./components/connection/ConnectionView.vue";

export interface IViewNode extends Node {
    position: { x: number, y: number };
    disablePointerEvents: boolean;
}

export class ViewPlugin implements IPlugin {

    public type = "ViewPlugin";
    public editor!: Editor;
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
            node.hooks.save.tap(this, (state) => {
                state.position = n.position;
                return state;
            });
            node.hooks.load.tap(this, (state) => {
                n.position = state.position;
                return state;
            });
        });
    }

    public registerOption(name: string, component: VueConstructor) {
        Vue.set(this.options, name, component);
    }

}
