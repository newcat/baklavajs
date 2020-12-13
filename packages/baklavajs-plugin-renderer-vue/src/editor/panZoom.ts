import { computed, ref, Ref } from "vue";
import { ViewPlugin } from "../viewPlugin";

export function usePanZoom(pluginRef: Ref<ViewPlugin>) {
    const dragging = ref(false);

    const styles = computed(() => ({
        "transform-origin": "0 0",
        "transform": `scale(${pluginRef.value.scaling}) translate(${pluginRef.value.panning.x}px, ${pluginRef.value.panning.y}px)`,
    }));

    const onMouseMove = (ev: MouseEvent) => {
        if (dragging.value) {
            pluginRef.value.panning.x += ev.movementX / pluginRef.value.scaling;
            pluginRef.value.panning.y += ev.movementY / pluginRef.value.scaling;
        }
    };

    const onMouseWheel = (ev: WheelEvent) => {
        ev.preventDefault();
        let scrollAmount = ev.deltaY;
        if (ev.deltaMode === 1) {
            scrollAmount *= 32; // Firefox fix, multiplier is trial & error
        }
        const newScale = pluginRef.value.scaling * (1 - scrollAmount / 3000);
        const currentPoint = [
            ev.offsetX / pluginRef.value.scaling - pluginRef.value.panning.x,
            ev.offsetY / pluginRef.value.scaling - pluginRef.value.panning.y,
        ];
        const newPoint = [
            ev.offsetX / newScale - pluginRef.value.panning.x,
            ev.offsetY / newScale - pluginRef.value.panning.y,
        ];
        const diff = [newPoint[0] - currentPoint[0], newPoint[1] - currentPoint[1]];
        pluginRef.value.panning.x += diff[0];
        pluginRef.value.panning.y += diff[1];
        pluginRef.value.scaling = newScale;
    };

    return { dragging, styles, onMouseMove, onMouseWheel };
}
