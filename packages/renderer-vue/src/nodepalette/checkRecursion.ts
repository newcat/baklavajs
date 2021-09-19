import { Editor, getGraphNodeTypeString, Graph, GRAPH_NODE_TYPE_PREFIX } from "@baklavajs/core";

/** This function checks, whether the given GraphNode would cause a recursion if placed in the specified current graph */
export function checkRecursion(editor: Editor, currentGraph: Graph, graphNodeType: string): boolean {
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
