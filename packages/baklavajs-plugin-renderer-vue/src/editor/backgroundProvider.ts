import { computed, ComputedRef, Ref } from "vue";
import { Graph } from "@baklavajs/core";

export type BackgroundProvider<T = undefined> = (graph: Ref<Graph>, config: T) => ComputedRef<Record<string, any>>;

export interface IGridBackgroundProviderConfig {
    gridSize: number;
    gridDivision: number;
    subGridVisibleThreshold: number;
}

export const gridBackgroundProvider: BackgroundProvider<IGridBackgroundProviderConfig> = (graph, config) => {
    return computed(() => {
        const positionLeft = graph.value.panning.x * graph.value.scaling;
        const positionTop = graph.value.panning.y * graph.value.scaling;
        const size = graph.value.scaling * config.gridSize;
        const subSize = size / config.gridDivision;
        const backgroundSize = `${size}px ${size}px, ${size}px ${size}px`;
        const subGridBackgroundSize =
            graph.value.scaling > config.subGridVisibleThreshold
                ? `, ${subSize}px ${subSize}px, ${subSize}px ${subSize}px`
                : "";
        return {
            "background-position": `left ${positionLeft}px top ${positionTop}px`,
            "background-size": `${backgroundSize} ${subGridBackgroundSize}`,
        };
    });
};
