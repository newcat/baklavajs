import { ComputedRef, reactive, ref, Ref, shallowReadonly, watch } from "vue";
import { Editor, Graph, GraphTemplate } from "@baklavajs/core";

import { gridBackgroundProvider } from "./editor/backgroundProvider";
import { ICommandHandler, useCommandHandler } from "./commands";
import { IClipboard, useClipboard } from "./clipboard";
import { IHistory, useHistory } from "./history";
import { registerGraphCommands } from "./graph";
import { useSwitchGraph } from "./graph/switchGraph";

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
    switchGraph: (newGraph: Graph | GraphTemplate) => void;
}

export function useBaklava(editor: Ref<Editor>): IBaklavaView {
    const token = Symbol("ViewPluginToken");

    const _displayedGraph = ref(null as any) as Ref<Graph>;
    const displayedGraph = shallowReadonly(_displayedGraph) as Readonly<Ref<Graph>>;
    const { switchGraph } = useSwitchGraph(editor, _displayedGraph);
    switchGraph(editor.value.graph);

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

    registerGraphCommands(displayedGraph, commandHandler, switchGraph);

    watch(
        editor,
        (newValue, oldValue) => {
            if (oldValue) {
                oldValue.hooks.load.untap(token);
                oldValue.hooks.save.untap(token);
            }
            if (newValue) {
                // TODO: Saving and loading hooks
                // displayedGraph.value = newValue.graph;
            }
        },
        { immediate: true }
    );

    return { editor, displayedGraph, settings, backgroundStyles, commandHandler, history, clipboard, switchGraph };
}
