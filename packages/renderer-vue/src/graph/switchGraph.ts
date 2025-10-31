import type { Ref } from "vue";
import { type Editor, Graph, type GraphTemplate } from "@baklavajs/core";

export type SwitchGraph = (newGraph: Graph | GraphTemplate) => void;

const isTemplate = (g: Graph | GraphTemplate): g is GraphTemplate => !(g instanceof Graph);

export function useSwitchGraph(editor: Ref<Editor>, displayedGraph: Ref<Graph>) {
    const switchGraph: SwitchGraph = (newGraph: Graph | GraphTemplate) => {
        let newGraphInstance: Graph;
        if (!isTemplate(newGraph)) {
            if (newGraph !== editor.value.graph) {
                throw new Error(
                    "Can only switch using 'Graph' instance when it is the root graph. " +
                        "Otherwise a 'GraphTemplate' must be used.",
                );
            }
            newGraphInstance = newGraph;
        } else {
            newGraphInstance = new Graph(editor.value);
            newGraph.createGraph(newGraphInstance);
        }

        if (displayedGraph.value && displayedGraph.value !== editor.value.graph) {
            displayedGraph.value.destroy();
        }

        newGraphInstance.panning = newGraphInstance.panning ?? newGraph.panning ?? { x: 0, y: 0 };
        newGraphInstance.scaling = newGraphInstance.scaling ?? newGraph.scaling ?? 1;
        newGraphInstance.selectedNodes = newGraphInstance.selectedNodes ?? [];
        newGraphInstance.sidebar = newGraphInstance.sidebar ?? { visible: false, nodeId: "", optionName: "" };

        displayedGraph.value = newGraphInstance;
    };

    return { switchGraph };
}
