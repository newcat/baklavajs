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

    const onPointerDown = (ev: PointerEvent) => {
        draggingStartPoint.value = {
            x: ev.pageX,
            y: ev.pageY,
        };
        draggingStartPosition.value = {
            x: positionRef.value.x,
            y: positionRef.value.y,
        };
    };

    const onPointerMove = (ev: PointerEvent) => {
        if (draggingStartPoint.value) {
            const dx = ev.pageX - draggingStartPoint.value.x;
            const dy = ev.pageY - draggingStartPoint.value.y;
            positionRef.value.x = draggingStartPosition.value!.x + dx / graph.value.scaling;
            positionRef.value.y = draggingStartPosition.value!.y + dy / graph.value.scaling;
        }
    };

    const onPointerUp = () => {
        draggingStartPoint.value = null;
        draggingStartPosition.value = null;
    };

    return { dragging, onPointerDown, onPointerMove, onPointerUp };
}
