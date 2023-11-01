import { Ref } from "vue";
import { AbstractNode, Editor, Graph, GraphTemplate } from "@baklavajs/core";
import { SubgraphInputNode, SubgraphOutputNode } from "./subgraphInterfaceNodes";

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

            // get bounding box of all nodes to place the interface nodes in a nice way
            const xRight = newGraphInstance.nodes.reduce((acc: number, cur: AbstractNode) => {
                const x = cur.position.x;
                return x < acc ? x : acc;
            }, Infinity);

            const yTop = newGraphInstance.nodes.reduce((acc: number, cur: AbstractNode) => {
                const y = cur.position.y;
                return y < acc ? y : acc;
            }, Infinity);

            const xLeft = newGraphInstance.nodes.reduce((acc: number, cur: AbstractNode) => {
                const x = cur.position.x + cur.width;
                return x > acc ? x : acc;
            }, -Infinity);

            // create interface nodes
            newGraphInstance.inputs.forEach((input, idx) => {
                let node = newGraphInstance.nodes.find(
                    (n) => n instanceof SubgraphInputNode && n.graphInterfaceId === input.id,
                ) as SubgraphInputNode;

                if (!node) {
                    node = new SubgraphInputNode();
                    node.inputs.name.value = input.name;
                    node.graphInterfaceId = input.id;
                    node.position = {
                        x: xRight - 300,
                        y: yTop + idx * 200
                    };
                    newGraphInstance.addNode(node);
                }

                const targetInterface = newGraphInstance.findNodeInterface(input.nodeInterfaceId);
                if (!targetInterface) {
                    console.warn(`Could not find target interface ${input.nodeInterfaceId} for subgraph input node`);
                    return;
                }
                newGraphInstance.addConnection(node.outputs.placeholder, targetInterface);
            });

            newGraphInstance.outputs.forEach((output, index) => {
                let node = newGraphInstance.nodes.find(
                    (n) => n instanceof SubgraphOutputNode && n.graphInterfaceId === output.id,
                ) as SubgraphOutputNode;

                if (!node) {
                    node = new SubgraphOutputNode();
                    node.inputs.name.value = output.name;
                    node.graphInterfaceId = output.id;
                    node.position = {
                        x: xLeft + 100,
                        y: yTop + index * 200
                    };
                    newGraphInstance.addNode(node);
                }

                const targetInterface = newGraphInstance.findNodeInterface(output.nodeInterfaceId);
                if (!targetInterface) {
                    console.warn(`Could not find target interface ${output.nodeInterfaceId} for subgraph input node`);
                    return;
                }
                newGraphInstance.addConnection(targetInterface, node.inputs.placeholder);
            });
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
