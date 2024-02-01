import { computed, ComputedRef, ref, Ref } from "vue";
import { useGraph, useViewModel } from "../utility";
import { AbstractNode } from "@baklavajs/core";

interface SelectionBoxState {
    isSelecting: Ref<boolean>;
    startX: Ref<number>;
    startY: Ref<number>;
    endX: Ref<number>;
    endY: Ref<number>;
}

interface SelectionBoxRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export function useSelectionBox(editorEl: Ref<HTMLElement | null>) {
    const { viewModel } = useViewModel();
    const { graph } = useGraph();

    const nodes = computed(() => graph.value.nodes) as ComputedRef<AbstractNode[]>;

    const state: SelectionBoxState = {
        isSelecting: ref(false),
        startX: ref(0),
        startY: ref(0),
        endX: ref(0),
        endY: ref(0),
    };

    const onPointerMove = (ev: PointerEvent) => {
        if (state.isSelecting.value) {
            state.startX.value = ev.clientX - editorEl.value!.getBoundingClientRect().left;
            state.startY.value = ev.clientY - editorEl.value!.getBoundingClientRect().top;
        }
    };

    const onPointerDown = (ev: PointerEvent) => {
        // Start the selection box
        state.isSelecting.value = true;
        state.endX.value = ev.clientX - editorEl.value!.getBoundingClientRect().left;
        state.endY.value = ev.clientY - editorEl.value!.getBoundingClientRect().top;
    };

    const onPointerUp = (ev: PointerEvent) => {
        if (state.isSelecting.value) {
            state.startX.value = ev.clientX - editorEl.value!.getBoundingClientRect().left;
            state.startY.value = ev.clientY - editorEl.value!.getBoundingClientRect().top;
            state.isSelecting.value = false;
            handleSelection();
        }
    };

    const handleSelection = () => {
        const selectedNodes = getNodesInSelection();
        for (const node of selectedNodes) {
            viewModel.value.displayedGraph.selectedNodes.push(node);
        }
    };

    const getNodesInSelection = () => {
        const selectionBoxRect = getSelectionBoxRect();
        return nodes.value.filter((node) => {
            const nodeRect = getNodeRect(node);
            return isRectOverlap(selectionBoxRect, nodeRect);
        });
    };

    const getSelectionBoxRect = (): SelectionBoxRect => {
        const editor = document.querySelector(".baklava-editor") as Element;
        const editorBounding = editor.getBoundingClientRect();

        return {
            left: Math.min(state.startX.value, state.endX.value) - editorBounding.left,
            top: Math.min(state.startY.value, state.endY.value) - editorBounding.top,
            right: Math.max(state.startX.value, state.endX.value),
            bottom: Math.max(state.startY.value, state.endY.value),
        };
    };

    const getNodeRect = (node: AbstractNode): SelectionBoxRect => {
        const domNode = document.getElementById(node.id);
        const rect = domNode ? domNode.getBoundingClientRect() : { x: 0, y: 0, width: 0, height: 0 };
        return {
            left: rect.x,
            top: rect.y,
            right: rect.x + rect.width,
            bottom: rect.y + rect.height,
        };
    };

    const isRectOverlap = (rect1: SelectionBoxRect, rect2: SelectionBoxRect) => {
        return (
            rect1.left < rect2.right && rect1.right > rect2.left && rect1.top < rect2.bottom && rect1.bottom > rect2.top
        );
    };

    const unselect = () => {
        state.isSelecting.value = false;
    };
    return {
        isSelecting: state.isSelecting,
        startX: state.startX,
        startY: state.startY,
        endX: state.endX,
        endY: state.endY,
        onPointerMove,
        onPointerDown,
        onPointerUp,
        unselect,
    };
}
