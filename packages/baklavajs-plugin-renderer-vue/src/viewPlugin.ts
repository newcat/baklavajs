import { ComputedRef, isRef, ref, Ref } from "vue";
import { BaklavaEvent } from "@baklavajs/events";
import { IPlugin, Editor, AbstractNode, Graph } from "@baklavajs/core";

import { gridBackgroundProvider } from "./editor/backgroundProvider";
import { IViewNodeState } from "./node/viewNode";
import { HotkeyHandler, registerCommonCommands } from "./commands";
import { Clipboard } from "./clipboard";
import { History } from "./history";

export class ViewPlugin implements IPlugin {
    public type = "ViewPlugin";
    public editor!: Editor;

    // ======== STATE ========
    public panning = { x: 0, y: 0 };
    public scaling = 1;
    public sidebar = { visible: false, nodeId: "", optionName: "" };
    public selectedNodes: AbstractNode[] = [];
    public displayedGraph!: Graph;

    public backgroundStyles: ComputedRef<Record<string, any>> = gridBackgroundProvider(this, {
        gridSize: 100,
        gridDivision: 5,
        subGridVisibleThreshold: 0.6,
    });

    // ======== SETTINGS ========
    /** Use straight connections instead of bezier curves */
    public useStraightConnections = false;

    /** Show a minimap */
    public enableMinimap = false;

    // ======== EVENTS ========
    public events = {
        displayedGraphChanged: new BaklavaEvent<Graph>(),
    };

    // ======== OTHER ========
    private commands: Map<string, () => any> = new Map();

    public hotkeyHandler = new HotkeyHandler(this);
    public history = new History(this);
    public clipboard = new Clipboard(this);

    public constructor() {
        registerCommonCommands(this);
    }

    public register(editor: Editor): void {
        console.log(this, isRef(this.editor));
        this.editor = editor;
        this.editor.hooks.load.tap(this, (d) => {
            // TODO: Load & save other state like selected nodes, graph, ...
            this.panning = d.panning;
            this.scaling = d.scaling;
            return d;
        });
        this.editor.hooks.save.tap(this, (d) => {
            d.panning = this.panning;
            d.scaling = this.scaling;
            return d;
        });
        this.changeDisplayedGraph(editor.graph);
    }

    public registerCommand(name: string, executionFn: () => any): void {
        if (this.commands.has(name)) {
            throw new Error(`Command "${name}" already exists`);
        }
        this.commands.set(name, executionFn);
    }

    public executeCommand(name: string): boolean {
        if (!this.commands.has(name)) {
            return false;
        }
        this.commands.get(name)!();
        return true;
    }

    public changeDisplayedGraph(newGraph: Graph) {
        if (this.displayedGraph) {
            this.displayedGraph.events.beforeAddNode.removeListener(this);
            this.displayedGraph.nodes.forEach((n) => {
                n.hooks.afterSave.untap(this);
                n.hooks.beforeLoad.untap(this);
            });
        }

        this.selectedNodes = [];
        this.displayedGraph = newGraph;

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

        this.events.displayedGraphChanged.emit(newGraph);
    }
}
