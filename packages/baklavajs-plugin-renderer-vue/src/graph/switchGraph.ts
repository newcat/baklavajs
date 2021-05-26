import { Ref } from "vue";
import { Graph, GraphTemplate } from "@baklavajs/core";
import { SubgraphInputNode, SubgraphOutputNode } from "./subgraphInterfaceNodes";

export function switchGraph(displayedGraph: Ref<Graph>, newGraph: Graph | GraphTemplate) {
    if (newGraph instanceof Graph) {
        if (newGraph !== displayedGraph.value.editor.graph) {
            throw new Error(
                "Can only switch using 'Graph' instance when it is the root graph. " +
                    "Otherwise a 'GraphTemplate' must be used."
            );
        }
        const oldGraph = displayedGraph.value;
        displayedGraph.value = newGraph;
        // TODO: oldGraph.destroy();
        return;
    }

    const newGraphInstance = newGraph.createGraph();
    displayedGraph.value = newGraphInstance;

    // create interface nodes
    newGraphInstance.inputs.forEach((input) => {
        const node = new SubgraphInputNode();
        node.inputs.name.value = input.name;
        newGraphInstance.addNode(node);
        const targetInterface = newGraphInstance.findNodeInterface(input.nodeInterfaceId);
        if (!targetInterface) {
            console.warn(`Could not find target interface ${input.nodeInterfaceId} for subgraph input node`);
            return;
        }
        newGraphInstance.addConnection(node.outputs.placeholder, targetInterface);
    });

    newGraphInstance.outputs.forEach((output) => {
        const node = new SubgraphOutputNode();
        node.inputs.name.value = output.name;
        newGraphInstance.addNode(node);
        const targetInterface = newGraphInstance.findNodeInterface(output.nodeInterfaceId);
        if (!targetInterface) {
            console.warn(`Could not find target interface ${output.nodeInterfaceId} for subgraph input node`);
            return;
        }
        newGraphInstance.addConnection(targetInterface, node.inputs.placeholder);
    });
}
