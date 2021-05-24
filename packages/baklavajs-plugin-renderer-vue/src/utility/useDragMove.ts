import { computed, Ref, ref } from "vue";
import { useGraph } from "./useGraph";

interface IPosition {
    x: number;
    y: number;
}

export function useDragMove(positionRef: Ref<IPosition>) {
    const { graph } = useGraph();
    const draggingStartPoint = ref<IPosition | null>(null);
    const draggingStartPosition = ref<IPosition | null>(null);

    const dragging = computed(() => !!draggingStartPoint.value);

    const onMouseDown = (ev: MouseEvent) => {
        draggingStartPoint.value = {
            x: ev.screenX,
            y: ev.screenY,
        };
        draggingStartPosition.value = {
            x: positionRef.value.x,
            y: positionRef.value.y,
        };
    };

    const onMouseMove = (ev: MouseEvent) => {
        if (draggingStartPoint.value) {
            const dx = ev.screenX - draggingStartPoint.value.x;
            const dy = ev.screenY - draggingStartPoint.value.y;
            positionRef.value.x = draggingStartPosition.value!.x + dx / graph.value.scaling;
            positionRef.value.y = draggingStartPosition.value!.y + dy / graph.value.scaling;
        }
    };

    const onMouseUp = () => {
        draggingStartPoint.value = null;
        draggingStartPosition.value = null;
    };

    return { dragging, onMouseDown, onMouseMove, onMouseUp };
}
