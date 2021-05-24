import { ComputedRef, reactive, ref, Ref, toRaw, toRef, watch } from "vue";
import { Editor, AbstractNode, Graph } from "@baklavajs/core";

import { gridBackgroundProvider } from "./editor/backgroundProvider";
import { IViewNodeState } from "./node/viewNode";
import { ICommandHandler, registerCommonCommands, useCommandHandler } from "./commands";
import { IClipboard, useClipboard } from "./clipboard";
import { IHistory, useHistory } from "./history";

export interface IViewSettings {
    /** Use straight connections instead of bezier curves */
    useStraightConnections: boolean;
    /** Show a minimap */
    enableMinimap: boolean;
}

export interface IBaklavaView {
    editor: Ref<Editor>;
    displayedGraph: Ref<Graph>;
    settings: IViewSettings;
    backgroundStyles: ComputedRef<Record<string, any>>;
    commandHandler: ICommandHandler;
    history: IHistory;
    clipboard: IClipboard;
}

export function useBaklava(editor: Ref<Editor>): IBaklavaView {
    const token = Symbol("ViewPluginToken");

    const displayedGraph = ref(editor.value.graph) as Ref<Graph>;

    const settings: IViewSettings = reactive({
        useStraightConnections: false,
        enableMinimap: false,
    });

    const backgroundStyles: ComputedRef<Record<string, any>> = gridBackgroundProvider(displayedGraph, {
        gridSize: 100,
        gridDivision: 5,
        subGridVisibleThreshold: 0.6,
    });

    const commandHandler = useCommandHandler();
    const history = useHistory(displayedGraph, commandHandler);
    const clipboard = useClipboard(displayedGraph, editor, commandHandler);

    registerCommonCommands(displayedGraph, commandHandler);

    watch(
        editor,
        (newValue, oldValue) => {
            if (oldValue) {
                oldValue.hooks.load.untap(token);
                oldValue.hooks.save.untap(token);
            }
            if (newValue) {
                // TODO: Saving and loading hooks
                displayedGraph.value = newValue.graph;
            }
        },
        { immediate: true }
    );

    watch(
        displayedGraph,
        (newGraph, oldGraph) => {
            console.log("XX", oldGraph, newGraph);
            if (oldGraph) {
                oldGraph.events.beforeAddNode.removeListener(token);
                oldGraph.nodes.forEach((n) => {
                    n.hooks.afterSave.untap(token);
                    n.hooks.beforeLoad.untap(token);
                });
            }

            if (newGraph) {
                newGraph.panning = newGraph.panning ?? { x: 0, y: 0 };
                newGraph.scaling = newGraph.scaling ?? 1;
                newGraph.selectedNodes = newGraph.selectedNodes ?? [];
                newGraph.sidebar = newGraph.sidebar ?? { visible: false, nodeId: "", optionName: "" };

                newGraph.events.beforeAddNode.addListener(token, (node) => {
                    node.position = { x: 0, y: 0 };
                    node.disablePointerEvents = false;
                    node.twoColumn = node.twoColumn || false;
                    node.width = node.width || 200;
                    node.hooks.afterSave.tap(token, (state) => {
                        (state as IViewNodeState).position = node.position;
                        (state as IViewNodeState).width = node.width;
                        (state as IViewNodeState).twoColumn = node.twoColumn;
                        return state;
                    });
                    node.hooks.beforeLoad.tap(token, (state) => {
                        // default values for savefiles from older versions
                        node.position = (state as IViewNodeState).position || { x: 0, y: 0 };
                        node.width = (state as IViewNodeState).width || 200;
                        node.twoColumn = (state as IViewNodeState).twoColumn || false;
                        return state;
                    });
                });
            }
        },
        { immediate: true }
    );

    return { editor, displayedGraph, settings, backgroundStyles, commandHandler, history, clipboard };
}
