import { inject } from "vue";
import { ViewPlugin } from "../viewPlugin";

export function useTransform(plugin?: ViewPlugin) {
    if (!plugin) {
        plugin = inject<ViewPlugin>("plugin")!;
    }

    const transform = (x: number, y: number) => {
        const tx = x / plugin!.scaling - plugin!.panning.x;
        const ty = y / plugin!.scaling - plugin!.panning.y;
        return [tx, ty] as [number, number];
    };

    return { transform };
}
