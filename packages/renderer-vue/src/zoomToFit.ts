import { Ref } from "vue";
import { AbstractNode, Graph } from "@baklavajs/core";
import { ICommand, ICommandHandler } from "./commands";
import { IViewSettings } from "./settings";

interface IRect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export const ZOOM_TO_FIT_RECT_COMMAND = "ZOOM_TO_FIT_RECT";
export const ZOOM_TO_FIT_NODES_COMMAND = "ZOOM_TO_FIT_NODES";
export const ZOOM_TO_FIT_GRAPH_COMMAND = "ZOOM_TO_FIT_GRAPH";

export type ZoomToFitRectCommand = ICommand<void, [IRect]>;
export type ZoomToFitNodesCommand = ICommand<void, [AbstractNode[]]>;
export type ZoomToFitGraphCommand = ICommand<void>;

export function registerZoomToFitCommands(displayedGraph: Ref<Graph>, handler: ICommandHandler, settings: IViewSettings) {
    handler.registerCommand(ZOOM_TO_FIT_RECT_COMMAND, {
        canExecute: () => true,
        execute: (rect: IRect) => zoomToFitRect(displayedGraph.value, settings, rect),
    });
    handler.registerCommand(ZOOM_TO_FIT_NODES_COMMAND, {
        canExecute: () => true,
        execute: (nodes: AbstractNode[]) => zoomToFitNodes(displayedGraph.value, settings, nodes),
    });
    handler.registerCommand(ZOOM_TO_FIT_GRAPH_COMMAND, {
        canExecute: () => displayedGraph.value.nodes.length > 0,
        execute: () => zoomToFitGraph(displayedGraph.value, settings),
    });
    handler.registerHotkey(["f"], ZOOM_TO_FIT_GRAPH_COMMAND);
}

function zoomToFitRect(graph: Graph, settings: IViewSettings, rect: IRect) {
    const padding = {
        left: settings.zoomToFit.paddingLeft,
        right: settings.zoomToFit.paddingRight,
        top: settings.zoomToFit.paddingTop,
        bottom: settings.zoomToFit.paddingBottom,
    };

    const editorEl = document.querySelector(".baklava-editor") as Element;
    const editorBounding = editorEl.getBoundingClientRect();

    const editorWidth = Math.max(0, editorBounding.width - padding.left - padding.right);
    const editorHeight = Math.max(0, editorBounding.height - padding.top - padding.bottom);

    rect = normalizeRect(rect);

    const rectWidth = rect.x2 - rect.x1;
    const rectHeight = rect.y2 - rect.y1;

    const widthRatio = rectWidth === 0 ? Infinity : editorWidth / rectWidth;
    const heightRatio = rectHeight == 0 ? Infinity : editorHeight / rectHeight;

    let scale = Math.min(widthRatio, heightRatio);

    if (scale === 0 || !Number.isFinite(scale)) {
        scale = 1;
    }

    const remainingEditorWidth = Math.max(0, editorWidth / scale - rectWidth);
    const remainingEditorHeight = Math.max(0, editorHeight / scale - rectHeight);

    const offsetX = -rect.x1 + padding.left / scale + remainingEditorWidth / 2;
    const offsetY = -rect.y1 + padding.top / scale + remainingEditorHeight / 2;

    graph.panning.x = offsetX;
    graph.panning.y = offsetY;
    graph.scaling = scale;
}

function zoomToFitNodes(graph: Graph, settings: IViewSettings, nodes: readonly AbstractNode[]) {
    if (nodes.length === 0) {
        return;
    }

    const nodeRects = nodes.map(getNodeRect);

    const boundingRect = {
        x1: Math.min(...nodeRects.map((i) => i.x1)),
        y1: Math.min(...nodeRects.map((i) => i.y1)),
        x2: Math.max(...nodeRects.map((i) => i.x2)),
        y2: Math.max(...nodeRects.map((i) => i.y2)),
    };

    zoomToFitRect(graph, settings, boundingRect);
}

function zoomToFitGraph(graph: Graph, settings: IViewSettings) {
    zoomToFitNodes(graph, settings, graph.nodes);
}

function getNodeRect(node: AbstractNode): IRect {
    const domElement = document.getElementById(node.id);
    const width = domElement?.offsetWidth ?? 0;
    const height = domElement?.offsetHeight ?? 0;
    const posX = node.position?.x ?? 0;
    const posY = node.position?.y ?? 0;

    return {
        x1: posX,
        y1: posY,
        x2: posX + width,
        y2: posY + height,
    };
}

function normalizeRect(rect: IRect): IRect {
    // Make (x1, y1) the top left corner and (x2, y2) the bottom right corner.
    return {
        x1: Math.min(rect.x1, rect.x2),
        y1: Math.min(rect.y1, rect.y2),
        x2: Math.max(rect.x1, rect.x2),
        y2: Math.max(rect.y1, rect.y2),
    };
}
