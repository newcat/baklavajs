import { computed, ComputedRef, reactive, ref, Ref, watch } from "vue";
import { AbstractNode } from "@baklavajs/core";
import { useGraph, useViewModel } from "../utility";
import { ICommand } from "../commands";

interface SelectionBoxRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

type Coordinate = [number, number];

export const START_SELECTION_BOX_COMMAND = "START_SELECTION_BOX";
export type StartSelectionBoxCommand = ICommand<void>;

export function useSelectionBox(editorEl: Ref<HTMLElement | null>) {
    const { viewModel } = useViewModel();
    const { graph } = useGraph();

    const nodes = computed(() => graph.value.nodes) as ComputedRef<AbstractNode[]>;

    const startSelection = ref(false);
    const isSelecting = ref(false);
    const start = ref<Coordinate>([0, 0]);
    const end = ref<Coordinate>([0, 0]);

    watch(
        viewModel,
        () => {
            if (viewModel.value.commandHandler.hasCommand(START_SELECTION_BOX_COMMAND)) {
                return;
            }

            viewModel.value.commandHandler.registerCommand(START_SELECTION_BOX_COMMAND, {
                canExecute: () => true,
                execute() {
                    startSelection.value = true;
                },
            });
            viewModel.value.commandHandler.registerHotkey(["b"], START_SELECTION_BOX_COMMAND);
        },
        { immediate: true },
    );

    function getCoordinatesFromEvent(ev: PointerEvent): Coordinate {
        return [
            ev.clientX - editorEl.value!.getBoundingClientRect().left,
            ev.clientY - editorEl.value!.getBoundingClientRect().top,
        ];
    }

    /** @returns True if the selection has been started and therefore no panning should be started */
    function onPointerDown(ev: PointerEvent): boolean {
        if (startSelection.value) {
            isSelecting.value = true;
            startSelection.value = false;
            start.value = getCoordinatesFromEvent(ev);
            end.value = getCoordinatesFromEvent(ev);

            document.addEventListener("pointermove", onPointerMove);
            document.addEventListener("pointerup", onPointerUp);

            return true;
        }
        return false;
    }

    function onPointerMove(ev: PointerEvent) {
        start.value = getCoordinatesFromEvent(ev);
    }

    function onPointerUp(ev: PointerEvent) {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);

        start.value = getCoordinatesFromEvent(ev);
        isSelecting.value = false;
        const selectedNodes = getNodesInSelection();
        for (const node of selectedNodes) {
            viewModel.value.displayedGraph.selectedNodes.push(node);
        }
    }

    function getNodesInSelection() {
        const selectionBoxRect = getSelectionBoxRect();
        const editor = document.querySelector(".baklava-editor") as Element;
        const editorBounding = editor.getBoundingClientRect();
        return nodes.value.filter((node) => {
            const nodeRect = getNodeRect(node, editorBounding);
            return isRectOverlap(selectionBoxRect, nodeRect);
        });
    }

    function getSelectionBoxRect(): SelectionBoxRect {
        return {
            left: Math.min(start.value[0], end.value[0]),
            top: Math.min(start.value[1], end.value[1]),
            right: Math.max(start.value[0], end.value[0]),
            bottom: Math.max(start.value[1], end.value[1]),
        };
    }

    function getNodeRect(node: AbstractNode, editorBounding: DOMRect): SelectionBoxRect {
        const domNode = document.getElementById(node.id);
        const rect = domNode ? domNode.getBoundingClientRect() : { x: 0, y: 0, width: 0, height: 0 };
        const left = rect.x - editorBounding.left;
        const top = rect.y - editorBounding.top;
        return {
            left,
            top,
            right: left + rect.width,
            bottom: top + rect.height,
        };
    }

    function isRectOverlap(rect1: SelectionBoxRect, rect2: SelectionBoxRect) {
        return (
            rect1.left < rect2.right && rect1.right > rect2.left && rect1.top < rect2.bottom && rect1.bottom > rect2.top
        );
    }

    function getStyles() {
        return {
            width: Math.abs(end.value[0] - start.value[0]) + "px",
            height: Math.abs(end.value[1] - start.value[1]) + "px",
            left: (end.value[0] > start.value[0] ? start.value[0] : end.value[0]) + "px",
            top: (end.value[1] > start.value[1] ? start.value[1] : end.value[1]) + "px",
        };
    }

    return reactive({
        startSelection,
        isSelecting,
        start,
        end,
        onPointerDown,
        getStyles,
    });
}
