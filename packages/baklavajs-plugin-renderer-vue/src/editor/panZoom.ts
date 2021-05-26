import { computed, toRef } from "vue";
import { useDragMove, useGraph } from "../utility";

export function usePanZoom() {
    const { graph } = useGraph();

    const panningRef = computed(() => graph.value.panning);
    const dragMove = useDragMove(panningRef);

    const styles = computed(() => ({
        "transform-origin": "0 0",
        "transform": `scale(${graph.value.scaling}) translate(${graph.value.panning.x}px, ${graph.value.panning.y}px)`,
    }));

    const onMouseWheel = (ev: WheelEvent) => {
        ev.preventDefault();
        let scrollAmount = ev.deltaY;
        if (ev.deltaMode === 1) {
            scrollAmount *= 32; // Firefox fix, multiplier is trial & error
        }
        const newScale = graph.value.scaling * (1 - scrollAmount / 3000);
        const currentPoint = [
            ev.offsetX / graph.value.scaling - graph.value.panning.x,
            ev.offsetY / graph.value.scaling - graph.value.panning.y,
        ];
        const newPoint = [ev.offsetX / newScale - graph.value.panning.x, ev.offsetY / newScale - graph.value.panning.y];
        const diff = [newPoint[0] - currentPoint[0], newPoint[1] - currentPoint[1]];
        graph.value.panning.x += diff[0];
        graph.value.panning.y += diff[1];
        graph.value.scaling = newScale;
    };

    return { styles, ...dragMove, onMouseWheel };
}
