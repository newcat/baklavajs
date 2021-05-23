import { computed, Ref, ref } from "vue";
import { usePlugin } from "./usePlugin";

interface IPosition {
    x: number;
    y: number;
}

export function useDragMove(positionRef: Ref<IPosition>) {
    const { plugin } = usePlugin();
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
            positionRef.value.x = draggingStartPosition.value!.x + dx / plugin.value.scaling;
            positionRef.value.y = draggingStartPosition.value!.y + dy / plugin.value.scaling;
        }
    };

    const onMouseUp = () => {
        draggingStartPoint.value = null;
        draggingStartPosition.value = null;
    };

    return { dragging, onMouseDown, onMouseMove, onMouseUp };
}
