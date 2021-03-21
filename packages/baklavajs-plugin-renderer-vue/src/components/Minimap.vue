<template>
    <canvas
        ref="canvas"
        class="minimap"
        @mouseenter="showViewBounds = true"
        @mouseleave="
            () => {
                this.showViewBounds = false;
                this.mouseup();
            }
        "
        @mousedown.self="mousedown"
        @mousemove.self="mousemove"
        @mouseup="mouseup"
    ></canvas>
</template>

<script lang="ts">
import { defineComponent, inject, onBeforeUnmount, onMounted, ref, toRef, watch } from "vue";
import { IConnection, AbstractNode } from "@baklavajs/core";
import getDomElements, { getDomElementOfNode } from "../connection/domResolver";
import { getPortCoordinates } from "../connection/portCoordinates";
import { ViewPlugin } from "../viewPlugin";

interface IRect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export default defineComponent({
    props: {
        nodes: {
            type: Array as () => AbstractNode[],
            required: true,
        },
        connections: {
            type: Array as () => IConnection[],
            required: true,
        },
    },
    setup(props) {
        const canvas = ref<HTMLCanvasElement | null>(null);
        const showViewBounds = ref(false);

        const plugin = inject<ViewPlugin>("plugin")!;

        let ctx: CanvasRenderingContext2D | undefined;
        let intervalHandle: ReturnType<typeof setInterval> | undefined;
        let dragging = false;
        let bounds: IRect = { x1: 0, y1: 0, x2: 0, y2: 0 };

        onMounted(() => {
            ctx = canvas.value!.getContext("2d")!;
            ctx.imageSmoothingQuality = "high";
            intervalHandle = setInterval(() => updateCanvas(), 250);
        });

        onBeforeUnmount(() => {
            if (intervalHandle) {
                clearInterval(intervalHandle);
                intervalHandle = undefined;
            }
        });

        const updateCanvas = () => {
            if (!ctx) {
                return;
            }

            const nodeCoords = new Map<AbstractNode, IRect>();
            const nodeDomElements = new Map<AbstractNode, HTMLElement | null>();
            for (const n of props.nodes) {
                const domElement = getDomElementOfNode(n);
                const width = domElement?.clientWidth ?? 0;
                const height = domElement?.clientHeight ?? 0;
                nodeCoords.set(n, {
                    x1: n.position.x,
                    y1: n.position.y,
                    x2: n.position.x + width,
                    y2: n.position.y + height,
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

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // draw connections
            ctx.strokeStyle = "white";
            for (const c of props.connections) {
                const [origX1, origY1] = getPortCoordinates(getDomElements(c.from));
                const [origX2, origY2] = getPortCoordinates(getDomElements(c.to));
                const [x1, y1] = transformCoordinates(origX1, origY1);
                const [x2, y2] = transformCoordinates(origX2, origY2);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                if (plugin.useStraightConnections) {
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

            if (showViewBounds) {
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
                ((origX - bounds.x1) / (bounds.x2 - bounds.x1)) * ctx!.canvas.clientWidth,
                ((origY - bounds.y1) / (bounds.y2 - bounds.y1)) * ctx!.canvas.clientHeight,
            ];
        };

        /** Transforms coordinates from minimap space to editor space */
        const reverseTransform = (thisX: number, thisY: number): [number, number] => {
            return [
                (thisX * (bounds.x2 - bounds.x1)) / ctx!.canvas.clientWidth + bounds.x1,
                (thisY * (bounds.y2 - bounds.y1)) / ctx!.canvas.clientHeight + bounds.y1,
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
            const x2 = parentWidth / plugin.scaling - plugin.panning.x;
            const y2 = parentHeight / plugin.scaling - plugin.panning.y;
            return { x1: -plugin.panning.x, y1: -plugin.panning.y, x2, y2 };
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
                const dx = (viewBounds.x1 - viewBounds.x2) / 2;
                const dy = (viewBounds.y1 - viewBounds.y2) / 2;
                plugin.panning.x = -(cx + dx);
                plugin.panning.y = -(cy + dy);
            }
        };

        const mouseup = (ev: MouseEvent) => {
            dragging = false;
        };

        watch([showViewBounds, plugin.panning, toRef(plugin, "scaling")], () => {
            updateCanvas();
        });

        return { canvas, showViewBounds, mousedown, mousemove, mouseup };
    },
});
</script>
