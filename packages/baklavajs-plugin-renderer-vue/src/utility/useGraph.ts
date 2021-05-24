import { Ref } from "vue";
import { Graph } from "@baklavajs/core";

// const injectionKey = Symbol("viewPlugin");

// workaround: Currently, self-injecting is not possible.
// so we use a singleton to provide this functionality.
// RFC: https://github.com/vuejs/rfcs/pull/254
let graphRef: Ref<Graph> | null = null;

export function provideGraph(graph: Ref<Graph>) {
    // provide(injectionKey, plugin);
    graphRef = graph;
}

export function useGraph(): { graph: Ref<Graph> } {
    // let plugin = inject<Ref<ViewPlugin>>(injectionKey);
    if (!graphRef) {
        throw new Error("provideGraph() must be called before useGraph()");
    }
    return {
        graph: graphRef,
    };
}
