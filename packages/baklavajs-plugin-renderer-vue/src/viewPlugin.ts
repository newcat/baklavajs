import { ComputedRef } from "vue";
import { IPlugin, Editor } from "@baklavajs/core";

import { gridBackgroundProvider } from "./editor/backgroundProvider";
import { IViewNodeState } from "./node/viewNode";

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
        this.editor.graph.events.beforeAddNode.addListener(this, (node) => {
            node.position = { x: 0, y: 0 };
            node.disablePointerEvents = false;
            node.twoColumn = node.twoColumn || false;
            node.width = node.width || 200;
            node.hooks.afterSave.tap(this, (state) => {
                (state as IViewNodeState).position = node.position;
                (state as IViewNodeState).width = node.width;
                (state as IViewNodeState).twoColumn = node.twoColumn;
                return state;
            });
            node.hooks.beforeLoad.tap(this, (state) => {
                // default values for savefiles from older versions
                node.position = (state as IViewNodeState).position || { x: 0, y: 0 };
                node.width = (state as IViewNodeState).width || 200;
                node.twoColumn = (state as IViewNodeState).twoColumn || false;
                return state;
            });
        });
    }
}
