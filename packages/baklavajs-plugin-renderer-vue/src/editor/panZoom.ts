import { computed } from "vue";
import { useDragMove, useGraph } from "../utility";

export function usePanZoom() {
    const { graph } = useGraph();

    // State needed for pinch-zoom
    let pointerCache: PointerEvent[] = [];
    let prevDiff = -1;
    let midpoint: { x: number; y: number } = { x: 0, y: 0 };

    const panningRef = computed(() => graph.value.panning);
    const dragMove = useDragMove(panningRef);

    const styles = computed(() => ({
        "transform-origin": "0 0",
        "transform": `scale(${graph.value.scaling}) translate(${graph.value.panning.x}px, ${graph.value.panning.y}px)`,
    }));

    const applyZoom = (centerX: number, centerY: number, newScale: number) => {
        const currentPoint = [
            centerX / graph.value.scaling - graph.value.panning.x,
            centerY / graph.value.scaling - graph.value.panning.y,
        ];
        const newPoint = [centerX / newScale - graph.value.panning.x, centerY / newScale - graph.value.panning.y];
        const diff = [newPoint[0] - currentPoint[0], newPoint[1] - currentPoint[1]];
        graph.value.panning.x += diff[0];
        graph.value.panning.y += diff[1];
        graph.value.scaling = newScale;
    };

    const onMouseWheel = (ev: WheelEvent) => {
        ev.preventDefault();
        let scrollAmount = ev.deltaY;
        if (ev.deltaMode === 1) {
            scrollAmount *= 32; // Firefox fix, multiplier is trial & error
        }
        const newScale = graph.value.scaling * (1 - scrollAmount / 3000);
        applyZoom(ev.offsetX, ev.offsetY, newScale);
    };

    const getCoordsFromCache = () => ({
        ax: pointerCache[0].clientX,
        ay: pointerCache[0].clientY,
        bx: pointerCache[1].clientX,
        by: pointerCache[1].clientY,
    });

    const onPointerDown = (ev: PointerEvent) => {
        pointerCache.push(ev);
        dragMove.onPointerDown(ev);

        if (pointerCache.length === 2) {
            const { ax, ay, bx, by } = getCoordsFromCache();
            midpoint = {
                x: ax + (bx - ax) / 2,
                y: ay + (by - ay) / 2,
            };
        }
    };

    const onPointerMove = (ev: PointerEvent) => {
        for (let i = 0; i < pointerCache.length; i++) {
            if (ev.pointerId == pointerCache[i].pointerId) {
                pointerCache[i] = ev;
                break;
            }
        }

        if (pointerCache.length == 2) {
            const { ax, ay, bx, by } = getCoordsFromCache();
            const dx = ax - bx;
            const dy = ay - by;
            const curDiff = Math.sqrt(dx * dx + dy * dy);

            if (prevDiff > 0) {
                const newScale = graph.value.scaling * (1 + (curDiff - prevDiff) / 500);
                applyZoom(midpoint.x, midpoint.y, newScale);
            }

            // Cache the distance for the next move event
            prevDiff = curDiff;
        } else {
            dragMove.onPointerMove(ev);
        }
    };

    const onPointerUp = (ev: PointerEvent) => {
        pointerCache = pointerCache.filter((p) => p.pointerId !== ev.pointerId);
        prevDiff = -1;
        dragMove.onPointerUp();
    };

    return { styles, ...dragMove, onPointerDown, onPointerMove, onPointerUp, onMouseWheel };
}
