<template>
    <canvas
        ref="canvas"
        class="baklava-minimap"
        @mouseenter="mouseenter"
        @mouseleave="mouseleave"
        @mousedown.self="mousedown"
        @mousemove.self="mousemove"
        @mouseup="mouseup"
        @contextmenu.stop.prevent=""
    />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { AbstractNode } from "@baklavajs/core";
import { getDomElements, getDomElementOfNode } from "../connection/domResolver";
import { getPortCoordinates } from "../connection/portCoordinates";
import { useGraph, useViewModel } from "../utility";

interface IRect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const { viewModel } = useViewModel();
const { graph } = useGraph();

const canvas = ref<HTMLCanvasElement | null>(null);
const showViewBounds = ref(false);

let ctx: CanvasRenderingContext2D | undefined;
let dragging = false;
let bounds: IRect = { x1: 0, y1: 0, x2: 0, y2: 0 };
let interval: number;

const updateCanvas = () => {
    if (!ctx) {
        return;
    }
    ctx.canvas.width = canvas.value!.offsetWidth;
    ctx.canvas.height = canvas.value!.offsetHeight;

    const nodeCoords = new Map<AbstractNode, IRect>();
    const nodeDomElements = new Map<AbstractNode, HTMLElement | null>();
    for (const n of graph.value.nodes) {
        const domElement = getDomElementOfNode(n);
        const width = domElement?.offsetWidth ?? 0;
        const height = domElement?.offsetHeight ?? 0;
        const posX = n.position?.x ?? 0;
        const posY = n.position?.y ?? 0;
        nodeCoords.set(n, {
            x1: posX,
            y1: posY,
            x2: posX + width,
            y2: posY + height,
        });
        nodeDomElements.set(n, domElement);
    }

    // get bound rectangle
    const newBounds: IRect = {
        x1: Number.MAX_SAFE_INTEGER,
        y1: Number.MAX_SAFE_INTEGER,
        x2: Number.MIN_SAFE_INTEGER,
        y2: Number.MIN_SAFE_INTEGER,
    };
    for (const nc of nodeCoords.values()) {
        if (nc.x1 < newBounds.x1) {
            newBounds.x1 = nc.x1;
        }
        if (nc.y1 < newBounds.y1) {
            newBounds.y1 = nc.y1;
        }
        if (nc.x2 > newBounds.x2) {
            newBounds.x2 = nc.x2;
        }
        if (nc.y2 > newBounds.y2) {
            newBounds.y2 = nc.y2;
        }
    }

    // add some padding
    const padding = 50;
    newBounds.x1 -= padding;
    newBounds.y1 -= padding;
    newBounds.x2 += padding;
    newBounds.y2 += padding;
    bounds = newBounds;

    // ensure aspect ratio matches canvas
    const canvasRatio = ctx.canvas.width / ctx.canvas.height;
    const boundsRatio = (bounds.x2 - bounds.x1) / (bounds.y2 - bounds.y1);
    if (canvasRatio > boundsRatio) {
        const diff = (canvasRatio - boundsRatio) * (bounds.y2 - bounds.y1) * 0.5;
        bounds.x1 -= diff;
        bounds.x2 += diff;
    } else {
        const boundsWidth = bounds.x2 - bounds.x1;
        const boundsHeight = bounds.y2 - bounds.y1;
        const diff = ((boundsWidth - canvasRatio * boundsHeight) / canvasRatio) * 0.5;
        bounds.y1 -= diff;
        bounds.y2 += diff;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw connections
    ctx.strokeStyle = "white";
    for (const c of graph.value.connections) {
        const [origX1, origY1] = getPortCoordinates(getDomElements(c.from));
        const [origX2, origY2] = getPortCoordinates(getDomElements(c.to));
        const [x1, y1] = transformCoordinates(origX1, origY1);
        const [x2, y2] = transformCoordinates(origX2, origY2);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        if (viewModel.value.settings.useStraightConnections) {
            ctx.lineTo(x2, y2);
        } else {
            const dx = 0.3 * Math.abs(x1 - x2);
            ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2);
        }
        ctx.stroke();
    }

    // draw nodes
    ctx.strokeStyle = "lightgray";
    for (const [n, nc] of nodeCoords.entries()) {
        const [x1, y1] = transformCoordinates(nc.x1, nc.y1);
        const [x2, y2] = transformCoordinates(nc.x2, nc.y2);
        ctx.fillStyle = getNodeColor(nodeDomElements.get(n));
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.fill();
        ctx.stroke();
    }

    if (showViewBounds.value) {
        const viewBounds = getViewBounds();
        const [x1, y1] = transformCoordinates(viewBounds.x1, viewBounds.y1);
        const [x2, y2] = transformCoordinates(viewBounds.x2, viewBounds.y2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
};

/** Transforms coordinates from editor space to minimap space */
const transformCoordinates = (origX: number, origY: number): [number, number] => {
    return [
        ((origX - bounds.x1) / (bounds.x2 - bounds.x1)) * ctx!.canvas.width,
        ((origY - bounds.y1) / (bounds.y2 - bounds.y1)) * ctx!.canvas.height,
    ];
};

/** Transforms coordinates from minimap space to editor space */
const reverseTransform = (thisX: number, thisY: number): [number, number] => {
    return [
        (thisX * (bounds.x2 - bounds.x1)) / ctx!.canvas.width + bounds.x1,
        (thisY * (bounds.y2 - bounds.y1)) / ctx!.canvas.height + bounds.y1,
    ];
};

const getNodeColor = (domElement?: HTMLElement | null) => {
    if (domElement) {
        const content = domElement.querySelector(".__content");
        if (content) {
            const contentColor = getComputedColor(content);
            if (contentColor) {
                return contentColor;
            }
        }
        const nodeColor = getComputedColor(domElement);
        if (nodeColor) {
            return nodeColor;
        }
    }
    return "gray";
};

const getComputedColor = (domElement: Element): string | undefined => {
    const c = getComputedStyle(domElement).backgroundColor;
    if (c && c !== "rgba(0, 0, 0, 0)") {
        return c;
    }
};

/** Returns view bounds in editor space */
const getViewBounds = (): IRect => {
    const parentWidth = canvas.value!.parentElement!.offsetWidth;
    const parentHeight = canvas.value!.parentElement!.offsetHeight;
    const x2 = parentWidth / graph.value.scaling - graph.value.panning.x;
    const y2 = parentHeight / graph.value.scaling - graph.value.panning.y;
    return { x1: -graph.value.panning.x, y1: -graph.value.panning.y, x2, y2 };
};

const mousedown = (ev: MouseEvent) => {
    if (ev.button === 0) {
        dragging = true;
        mousemove(ev);
    }
};

const mousemove = (ev: MouseEvent) => {
    if (dragging) {
        // still slightly off when zoomed
        const [cx, cy] = reverseTransform(ev.offsetX, ev.offsetY);
        const viewBounds = getViewBounds();
        const dx = (viewBounds.x2 - viewBounds.x1) / 2;
        const dy = (viewBounds.y2 - viewBounds.y1) / 2;
        graph.value.panning.x = -(cx - dx);
        graph.value.panning.y = -(cy - dy);
    }
};

const mouseup = () => {
    dragging = false;
};

const mouseenter = () => {
    showViewBounds.value = true;
};

const mouseleave = () => {
    showViewBounds.value = false;
    mouseup();
};

watch([showViewBounds, graph.value.panning, () => graph.value.scaling, () => graph.value.connections.length], () => {
    updateCanvas();
});

const nodePositions = computed(() => graph.value.nodes.map((n) => n.position));
const nodeSizes = computed(() => graph.value.nodes.map((n) => n.width));
watch(
    [nodePositions, nodeSizes],
    () => {
        updateCanvas();
    },
    { deep: true },
);

onMounted(() => {
    ctx = canvas.value!.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    updateCanvas();
    interval = setInterval(updateCanvas, 500);
});

onBeforeUnmount(() => {
    clearInterval(interval);
});
</script>
