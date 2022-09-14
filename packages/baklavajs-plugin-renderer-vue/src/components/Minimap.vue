<template>
    <canvas
        ref="cv"
        class="minimap"
        @mouseenter="showViewBounds = true"
        @mouseleave="() => { this.showViewBounds = false; this.mouseup() }"
        @mousedown.self="mousedown"
        @mousemove.self="mousemove"
        @mouseup="mouseup"
    ></canvas>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Watch } from "vue-property-decorator";
import { IConnection } from "../../../baklavajs-core/types";
import { IViewNode } from "../../types";
import getDomElements, { getDomElementOfNode } from "./connection/domResolver";
import { getPortCoordinates } from "./connection/portCoordinates";
import { ViewPlugin } from "../viewPlugin";

interface IRect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

@Component
export default class Minimap extends Vue {

    ctx?: CanvasRenderingContext2D;
    intervalHandle = 0;
    showViewBounds = false;
    dragging = false;
    bounds: IRect = { x1: 0, y1: 0, x2: 0, y2: 0 };

    @Prop()
    nodes!: IViewNode[];

    @Prop()
    connections!: IConnection[];

    @Inject("plugin")
    plugin!: ViewPlugin;

    mounted() {
        const canvas = (this.$refs.cv as HTMLCanvasElement);
        this.ctx = canvas.getContext("2d") ?? undefined;
        if (this.ctx) { this.ctx.imageSmoothingQuality = "high"; }
        this.intervalHandle = setInterval(() => this.updateCanvas(), 250) as unknown as number;
    }

    beforeDestroy() {
        clearInterval(this.intervalHandle);
    }

    @Watch("showViewBounds")
    @Watch("plugin.panning.x")
    @Watch("plugin.panning.y")
    @Watch("plugin.scaling")
    updateCanvas() {
        if (!this.ctx) { return; }

        const nodeCoords = new Map<IViewNode, IRect>();
        const nodeDomElements = new Map<IViewNode, HTMLElement|null>();
        for (const n of this.nodes) {
            const domElement = getDomElementOfNode(n);
            const width = domElement?.clientWidth ?? 0;
            const height = domElement?.clientHeight ?? 0;
            nodeCoords.set(n, { x1: n.position.x, y1: n.position.y, x2: n.position.x + width, y2: n.position.y + height });
            nodeDomElements.set(n, domElement);
        }

        // get bound rectangle
        const bounds: IRect = {
            x1: Number.MAX_SAFE_INTEGER, y1: Number.MAX_SAFE_INTEGER,
            x2: Number.MIN_SAFE_INTEGER, y2: Number.MIN_SAFE_INTEGER
        };
        for (const nc of nodeCoords.values()) {
            if (nc.x1 < bounds.x1) {
                bounds.x1 = nc.x1;
            }
            if (nc.y1 < bounds.y1) {
                bounds.y1 = nc.y1;
            }
            if (nc.x2 > bounds.x2) {
                bounds.x2 = nc.x2;
            }
            if (nc.y2 > bounds.y2) {
                bounds.y2 = nc.y2;
            }
        }

        // add some padding
        const padding = 50;
        bounds.x1 -= padding;
        bounds.y1 -= padding;
        bounds.x2 += padding;
        bounds.y2 += padding;
        this.bounds = bounds;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // draw connections
        this.ctx.strokeStyle = "white";
        for (const c of this.connections) {
            const toDom = getDomElements(c.to);
            const [origX1, origY1] = getPortCoordinates(getDomElements(c.from));
            const [origX2, origY2] = getPortCoordinates(getDomElements(c.to));
            const [x1, y1] = this.transformCoordinates(origX1, origY1);
            const [x2, y2] = this.transformCoordinates(origX2, origY2);
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            if (this.plugin.useStraightConnections) {
                this.ctx.lineTo(x2, y2);
            } else {
                const dx = 0.3 * Math.abs(x1 - x2);
                this.ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2);
            }
            this.ctx.stroke();
        }

        // draw nodes
        this.ctx.strokeStyle = "lightgray";
        for (const [n, nc] of nodeCoords.entries()) {
            const [x1, y1] = this.transformCoordinates(nc.x1, nc.y1);
            const [x2, y2] = this.transformCoordinates(nc.x2, nc.y2);
            this.ctx.fillStyle = this.getNodeColor(nodeDomElements.get(n));
            this.ctx.beginPath();
            this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
            this.ctx.fill();
            this.ctx.stroke();
        }

        if (this.showViewBounds) {
            const viewBounds = this.getViewBounds();
            const [x1, y1] = this.transformCoordinates(viewBounds.x1, viewBounds.y1);
            const [x2, y2] = this.transformCoordinates(viewBounds.x2, viewBounds.y2);
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        }

    }

    /** Transforms coordinates from editor space to minimap space */
    transformCoordinates(origX: number, origY: number): [number, number] {
        return [
            ((origX - this.bounds.x1) / (this.bounds.x2 - this.bounds.x1)) * this.ctx!.canvas.clientWidth,
            ((origY - this.bounds.y1) / (this.bounds.y2 - this.bounds.y1)) * this.ctx!.canvas.clientHeight
        ];
    }

    /** Transforms coordinates from minimap space to editor space */
    reverseTransform(thisX: number, thisY: number): [number, number] {
        return [
            (thisX * (this.bounds.x2 - this.bounds.x1)) / this.ctx!.canvas.clientWidth + this.bounds.x1,
            (thisY * (this.bounds.y2 - this.bounds.y1)) / this.ctx!.canvas.clientHeight + this.bounds.y1,
        ];
    }

    getNodeColor(domElement?: HTMLElement|null) {
        if (domElement) {
            const content = domElement.querySelector(".__content");
            if (content) {
                const contentColor = this.getComputedColor(content);
                if (contentColor) { return contentColor; }
            }
            const nodeColor = this.getComputedColor(domElement);
            if (nodeColor) { return nodeColor; }
        }
        return "gray";
    }

    getComputedColor(domElement: Element): string|undefined {
        const c = getComputedStyle(domElement).backgroundColor;
        if (c && c !== "rgba(0, 0, 0, 0)") {
            return c;
        }
    }

    /** Returns view bounds in editor space */
    getViewBounds(): IRect {
        const parentWidth = (this.$parent!.$el as HTMLElement).offsetWidth;
        const parentHeight = (this.$parent!.$el as HTMLElement).offsetHeight;
        const x2 = (parentWidth / this.plugin.scaling) - this.plugin.panning.x;
        const y2 = (parentHeight / this.plugin.scaling) - this.plugin.panning.y;
        return { x1: -this.plugin.panning.x, y1: -this.plugin.panning.y, x2, y2 };
    }

    mousedown(ev: MouseEvent) {
        if (ev.button === 0) {
            this.dragging = true;
            this.mousemove(ev);
        }
    }

    mousemove(ev: MouseEvent) {
        if (this.dragging) {
            // still slightly off when zoomed
            const [cx, cy] = this.reverseTransform(ev.offsetX, ev.offsetY);
            const viewBounds = this.getViewBounds();
            const dx = (viewBounds.x1 - viewBounds.x2) / 2;
            const dy = (viewBounds.y1 - viewBounds.y2) / 2;
            this.plugin.panning.x = -(cx + dx);
            this.plugin.panning.y = -(cy + dy);
        }
    }

    mouseup(ev: MouseEvent) {
        this.dragging = false;
    }

}
</script>
