import { ComputedRef, reactive, ref, Ref, watch } from "vue";
import { Editor, Graph } from "@baklavajs/core";

import { gridBackgroundProvider } from "./editor/backgroundProvider";
import { setViewNodeProperties } from "./node/viewNode";
import { ICommandHandler, useCommandHandler } from "./commands";
import { IClipboard, useClipboard } from "./clipboard";
import { IHistory, useHistory } from "./history";
import { registerGraphCommands } from "./graph";

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

    registerGraphCommands(displayedGraph, commandHandler);

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

                newGraph.nodes.forEach((node) => setViewNodeProperties(node, token));
                newGraph.events.beforeAddNode.addListener(token, (node) => setViewNodeProperties(node, token));
            }
        },
        { immediate: true }
    );

    return { editor, displayedGraph, settings, backgroundStyles, commandHandler, history, clipboard };
}
