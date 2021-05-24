import { Ref } from "vue";
import { Graph } from "@baklavajs/core";
import { usePlugin } from "./usePlugin";

export function useGraph(): { graph: Ref<Graph> } {
    const { plugin } = usePlugin();
    return {
        graph: plugin.value.displayedGraph,
    };
}
