import { Ref } from "vue";
import { Editor, Graph, GraphTemplate } from "@baklavajs/core";
import { InputNode, OutputNode, SubgraphInputNode, SubgraphOutputNode } from "./subgraphInterfaceNodes";
import { setViewNodeProperties } from "../node/viewNode";

export type SwitchGraph = (newGraph: Graph | GraphTemplate) => void;

const isTemplate = (g: Graph | GraphTemplate): g is GraphTemplate => !(g instanceof Graph);

export function useSwitchGraph(editor: Ref<Editor>, displayedGraph: Ref<Graph>) {
    const token = Symbol();

    const unregisterEventListeners = (graph: Graph) => {
        graph.events.beforeAddNode.removeListener(token);
        graph.nodes.forEach((n) => {
            n.hooks.afterSave.untap(token);
            n.hooks.beforeLoad.untap(token);
        });
    };

    const registerEventListeners = (graph: Graph) => {
        graph.panning = graph.panning ?? { x: 0, y: 0 };
        graph.scaling = graph.scaling ?? 1;
        graph.selectedNodes = graph.selectedNodes ?? [];
        graph.sidebar = graph.sidebar ?? { visible: false, nodeId: "", optionName: "" };

        graph.nodes.forEach((node) => setViewNodeProperties(node, token));
        graph.events.beforeAddNode.addListener(token, (node) => setViewNodeProperties(node, token));
    };

    const switchGraph: SwitchGraph = (newGraph: Graph | GraphTemplate) => {
        let newGraphInstance: Graph;
        if (!isTemplate(newGraph)) {
            if (newGraph !== editor.value.graph) {
                throw new Error(
                    "Can only switch using 'Graph' instance when it is the root graph. " +
                        "Otherwise a 'GraphTemplate' must be used."
                );
            }
            newGraphInstance = newGraph;
        } else {
            newGraphInstance = new Graph(editor.value);
        }

        if (displayedGraph.value) {
            unregisterEventListeners(displayedGraph.value);
        }
        registerEventListeners(newGraphInstance);

        if (isTemplate(newGraph)) {
            newGraph.createGraph(newGraphInstance);

            // create interface nodes
            newGraphInstance.inputs.forEach((input) => {
                const node = new SubgraphInputNode() as InputNode;
                node.inputs.name.value = input.name;
                node.graphInterfaceId = input.id;
                newGraphInstance.addNode(node);
                const targetInterface = newGraphInstance.findNodeInterface(input.nodeInterfaceId);
                if (!targetInterface) {
                    console.warn(`Could not find target interface ${input.nodeInterfaceId} for subgraph input node`);
                    return;
                }
                newGraphInstance.addConnection(node.outputs.placeholder, targetInterface);
            });

            newGraphInstance.outputs.forEach((output) => {
                const node = new SubgraphOutputNode() as OutputNode;
                node.inputs.name.value = output.name;
                node.graphInterfaceId = output.id;
                newGraphInstance.addNode(node);
                const targetInterface = newGraphInstance.findNodeInterface(output.nodeInterfaceId);
                if (!targetInterface) {
                    console.warn(`Could not find target interface ${output.nodeInterfaceId} for subgraph input node`);
                    return;
                }
                newGraphInstance.addConnection(targetInterface, node.inputs.placeholder);
            });
        }

        displayedGraph.value = newGraphInstance;
    };

    return { switchGraph };
}
