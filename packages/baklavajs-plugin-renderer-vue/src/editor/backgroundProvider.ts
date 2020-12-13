import { computed, ComputedRef } from "vue";
import type { ViewPlugin } from "../viewPlugin";

export type BackgroundProvider<T = undefined> = (plugin: ViewPlugin, config: T) => ComputedRef<Record<string, any>>;

export interface IGridBackgroundProviderConfig {
    gridSize: number;
    gridDivision: number;
    subGridVisibleThreshold: number;
}

export const gridBackgroundProvider: BackgroundProvider<IGridBackgroundProviderConfig> = (plugin, config) => {
    return computed(() => {
        const positionLeft = plugin.panning.x * plugin.scaling;
        const positionTop = plugin.panning.y * plugin.scaling;
        const size = plugin.scaling * config.gridSize;
        const subSize = size / config.gridDivision;
        const backgroundSize = `${size}px ${size}px, ${size}px ${size}px`;
        const subGridBackgroundSize =
            plugin.scaling > config.subGridVisibleThreshold
                ? `, ${subSize}px ${subSize}px, ${subSize}px ${subSize}px`
                : "";
        return {
            "background-position": `left ${positionLeft}px top ${positionTop}px`,
            "background-size": `${backgroundSize} ${subGridBackgroundSize}`,
        };
    });
};
