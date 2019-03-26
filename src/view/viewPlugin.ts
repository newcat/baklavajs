import { VueConstructor } from "vue";
import { IPlugin, Editor, SequentialHook } from "../core";
import NodeView from "./components/node/Node.vue";
import NodeOptionView from "./components/node/NodeOption.vue";
import NodeInterfaceView from "./components/node/NodeInterface.vue";
import ConnectionView from "./components/connection/ConnectionView.vue";

export class ViewPlugin implements IPlugin {

    public editor!: Editor;
    public panning = { x: 0, y: 0 };
    public scaling = 1;

    public options: Record<string, VueConstructor> = {};

    public hooks = {
        renderNode: new SequentialHook<NodeView>(),
        renderOption: new SequentialHook<NodeOptionView>(),
        renderInterface: new SequentialHook<NodeInterfaceView>(),
        renderConnection: new SequentialHook<ConnectionView>()
    };

    public register(editor: Editor): void {
        this.editor = editor;
        // TODO: Save / load hooks
    }

}
