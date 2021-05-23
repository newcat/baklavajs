import { usePlugin } from "./usePlugin";

export function useTransform() {
    const { plugin } = usePlugin();

    const transform = (x: number, y: number) => {
        const tx = x / plugin.value.scaling - plugin.value.panning.x;
        const ty = y / plugin.value.scaling - plugin.value.panning.y;
        return [tx, ty] as [number, number];
    };

    return { transform };
}
