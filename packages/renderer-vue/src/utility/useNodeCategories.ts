import { Ref, computed } from "vue";
import {
    type Editor,
    type Graph,
    type INodeTypeInformation,
    GRAPH_NODE_TYPE_PREFIX,
    GRAPH_INPUT_NODE_TYPE,
    GRAPH_OUTPUT_NODE_TYPE,
    getGraphNodeTypeString,
} from "@baklavajs/core";
import { IBaklavaViewModel } from "../viewModel";

/** This function checks, whether the given GraphNode would cause a recursion if placed in the specified current graph */
function checkRecursion(editor: Editor, currentGraph: Graph, graphNodeType: string): boolean {
    if (!currentGraph.template) {
        // we are in the root graph, no recursion can happen here
        return false;
    }

    if (getGraphNodeTypeString(currentGraph.template) === graphNodeType) {
        return true;
    }

    // find the template of the specified graph node
    const template = editor.graphTemplates.find((t) => getGraphNodeTypeString(t) === graphNodeType);
    if (!template) {
        return false;
    }

    // find all the graph nodes contained in the templates and check them
    const containedGraphNodes = template.nodes.filter((n) => n.type.startsWith(GRAPH_NODE_TYPE_PREFIX));
    return containedGraphNodes.some((n) => checkRecursion(editor, currentGraph, n.type));
}

type NodeTypeInformations = Record<string, INodeTypeInformation>;

export function useNodeCategories(viewModel: Ref<IBaklavaViewModel>) {
    return computed<Array<{ name: string; nodeTypes: NodeTypeInformations }>>(() => {
        const nodeTypeEntries = Array.from(viewModel.value.editor.nodeTypes.entries());

        const categoryNames = new Set(nodeTypeEntries.map(([, ni]) => ni.category));

        const categories: Array<{ name: string; nodeTypes: NodeTypeInformations }> = [];
        for (const c of categoryNames.values()) {
            let nodeTypesInCategory = nodeTypeEntries.filter(([, ni]) => ni.category === c);

            if (viewModel.value.displayedGraph.template) {
                // don't show the graph nodes that directly or indirectly contain the current subgraph to prevent recursion
                nodeTypesInCategory = nodeTypesInCategory.filter(
                    ([nt]) => !checkRecursion(viewModel.value.editor, viewModel.value.displayedGraph, nt),
                );
            } else {
                // if we are not in a subgraph, don't show subgraph input & output nodes
                nodeTypesInCategory = nodeTypesInCategory.filter(
                    ([nt]) => ![GRAPH_INPUT_NODE_TYPE, GRAPH_OUTPUT_NODE_TYPE].includes(nt),
                );
            }

            if (nodeTypesInCategory.length > 0) {
                categories.push({
                    name: c,
                    nodeTypes: Object.fromEntries(nodeTypesInCategory),
                });
            }
        }

        // sort, so the default category is always first and all others are sorted alphabetically
        categories.sort((a, b) => {
            if (a.name === "default") {
                return -1;
            } else if (b.name === "default") {
                return 1;
            } else {
                return a.name > b.name ? 1 : -1;
            }
        });

        return categories;
    });
}
