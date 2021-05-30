import { Ref } from "vue";
import { Graph } from "@baklavajs/core";
import { usePlugin } from "./usePlugin";
import { SwitchGraph } from "../graph/switchGraph";

export function useGraph(): { graph: Readonly<Ref<Graph>>; switchGraph: SwitchGraph } {
    const { plugin } = usePlugin();
    return {
        graph: plugin.value.displayedGraph,
        switchGraph: plugin.value.switchGraph,
    };
}
