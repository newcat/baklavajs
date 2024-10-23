import { computed, reactive, ref, Ref, shallowReadonly, watch } from "vue";
import { AbstractNode, Editor, Graph, GraphTemplate, NodeInterface } from "@baklavajs/core";
import { IBaklavaTapable, SequentialHook } from "@baklavajs/events";

import { ICommandHandler, useCommandHandler } from "./commands";
import { IClipboard, useClipboard } from "./clipboard";
import { IHistory, useHistory } from "./history";
import { registerGraphCommands } from "./graph";
import { useSwitchGraph } from "./graph/switchGraph";
import { IViewNodeState, setViewNodeProperties } from "./node/viewNode";
import { SubgraphInputNode, SubgraphOutputNode } from "./graph/subgraphInterfaceNodes";
import { registerSidebarCommands } from "./sidebar";
import { DEFAULT_SETTINGS, IViewSettings } from "./settings";
import { registerZoomToFitCommands } from "./zoomToFit";
export interface IBaklavaViewModel extends IBaklavaTapable {
    editor: Editor;
    /** Currently displayed graph */
    displayedGraph: Graph;
    /** True if the currently displayed graph is a subgraph, false if it is the root graph */
    isSubgraph: Readonly<boolean>;
    settings: IViewSettings;
    commandHandler: ICommandHandler;
    history: IHistory;
    clipboard: IClipboard;
    hooks: {
        /** Called whenever a node is rendered */
        renderNode: SequentialHook<{ node: AbstractNode; el: HTMLElement }, null>;
        /** Called whenever an interface is rendered */
        renderInterface: SequentialHook<{ intf: NodeInterface<any>; el: HTMLElement }, null>;
    };
    switchGraph: (newGraph: Graph | GraphTemplate) => void;
}

export function useBaklava(existingEditor?: Editor): IBaklavaViewModel {
    const editor: Ref<Editor> = ref(existingEditor ?? new Editor()) as Ref<Editor>;
    const token = Symbol("ViewModelToken");

    const _displayedGraph = ref(null as any) as Ref<Graph>;
    const displayedGraph = shallowReadonly(_displayedGraph);
    const { switchGraph } = useSwitchGraph(editor, _displayedGraph);

    const isSubgraph = computed(() => displayedGraph.value && displayedGraph.value !== editor.value.graph);

    const settings: IViewSettings = reactive(DEFAULT_SETTINGS());

    const commandHandler = useCommandHandler();
    const history = useHistory(displayedGraph, commandHandler);
    const clipboard = useClipboard(displayedGraph, editor, commandHandler);

    const hooks = {
        /** Called whenever a node is rendered */
        renderNode: new SequentialHook<{ node: AbstractNode; el: HTMLElement }, null>(null),
        /** Called whenever an interface is rendered */
        renderInterface: new SequentialHook<{ intf: NodeInterface<any>; el: HTMLElement }, null>(null),
    };

    registerGraphCommands(displayedGraph, commandHandler, switchGraph);
    registerSidebarCommands(displayedGraph, commandHandler);
    registerZoomToFitCommands(displayedGraph, commandHandler, settings);

    watch(
        editor,
        (newValue, oldValue) => {
            if (oldValue) {
                oldValue.events.registerGraph.unsubscribe(token);
                oldValue.graphEvents.beforeAddNode.unsubscribe(token);
                newValue.nodeHooks.beforeLoad.unsubscribe(token);
                newValue.nodeHooks.afterSave.unsubscribe(token);
                newValue.graphTemplateHooks.beforeLoad.unsubscribe(token);
                newValue.graphTemplateHooks.afterSave.unsubscribe(token);
                newValue.graph.hooks.load.unsubscribe(token);
                newValue.graph.hooks.save.unsubscribe(token);
            }
            if (newValue) {
                newValue.nodeHooks.beforeLoad.subscribe(token, (state, node) => {
                    node.position = (state as IViewNodeState).position ?? { x: 0, y: 0 };
                    node.width = (state as IViewNodeState).width ?? settings.nodes.defaultWidth;
                    node.twoColumn = (state as IViewNodeState).twoColumn ?? false;
                    return state;
                });
                newValue.nodeHooks.afterSave.subscribe(token, (state, node) => {
                    (state as IViewNodeState).position = node.position;
                    (state as IViewNodeState).width = node.width;
                    (state as IViewNodeState).twoColumn = node.twoColumn;
                    return state;
                });
                newValue.graphTemplateHooks.beforeLoad.subscribe(token, (state, template) => {
                    template.panning = state.panning;
                    template.scaling = state.scaling;
                    return state;
                });
                newValue.graphTemplateHooks.afterSave.subscribe(token, (state, template) => {
                    state.panning = template.panning;
                    state.scaling = template.scaling;
                    return state;
                });
                newValue.graph.hooks.load.subscribe(token, (state, graph) => {
                    graph.panning = state.panning;
                    graph.scaling = state.scaling;
                    return state;
                });
                newValue.graph.hooks.save.subscribe(token, (state, graph) => {
                    state.panning = graph.panning;
                    state.scaling = graph.scaling;
                    return state;
                });

                newValue.graphEvents.beforeAddNode.subscribe(token, (node) =>
                    setViewNodeProperties(node, { defaultWidth: settings.nodes.defaultWidth }),
                );

                editor.value.registerNodeType(SubgraphInputNode, { category: "Subgraphs" });
                editor.value.registerNodeType(SubgraphOutputNode, { category: "Subgraphs" });

                switchGraph(newValue.graph);
            }
        },
        { immediate: true },
    );

    return reactive({
        editor,
        displayedGraph,
        isSubgraph,
        settings,
        commandHandler,
        history,
        clipboard,
        hooks,
        switchGraph,
    }) as IBaklavaViewModel;
}
