<template>
    <canvas
        ref="cv"
        class="minimap"
        @mouseenter="showViewBounds = true"
        @mouseleave="showViewBounds = false"
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
        this.intervalHandle = setInterval(() => this.updateCanvas(), 1000) as unknown as number;
    }

    beforeDestroy() {
        clearInterval(this.intervalHandle);
    }

    @Watch("showViewBounds")
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

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // draw connections
        this.ctx.strokeStyle = "white";
        for (const c of this.connections) {
            const toDom = getDomElements(c.to);
            const [origX1, origY1] = getPortCoordinates(getDomElements(c.from));
            const [origX2, origY2] = getPortCoordinates(getDomElements(c.to));
            const [x1, y1] = this.transformCoordinates(origX1, origY1, bounds);
            const [x2, y2] = this.transformCoordinates(origX2, origY2, bounds);
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
        this.ctx.fillStyle = "gray";
        this.ctx.strokeStyle = "lightgray";
        for (const [n, nc] of nodeCoords.entries()) {
            const [x1, y1] = this.transformCoordinates(nc.x1, nc.y1, bounds);
            const [x2, y2] = this.transformCoordinates(nc.x2, nc.y2, bounds);
            this.ctx.beginPath();
            this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
            this.ctx.fill();
            this.ctx.stroke();
        }

        if (this.showViewBounds) {
            // TODO: This isn't working yet
            const parentWidth = (this.$parent.$el as HTMLElement).offsetWidth / this.plugin.scaling;
            const parentHeight = (this.$parent.$el as HTMLElement).offsetHeight / this.plugin.scaling;
            const px = -this.plugin.panning.x / this.plugin.scaling;
            const py = -this.plugin.panning.y / this.plugin.scaling;
            const [x1, y1] = this.transformCoordinates(px, py, bounds);
            const [x2, y2] = this.transformCoordinates(px + parentWidth, py + parentHeight, bounds);
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.ctx.fillRect(x1, y1, x2, y2);
        }

    }

    transformCoordinates(origX: number, origY: number, bounds: IRect): [number, number] {
        return [
            ((origX - bounds.x1) / (bounds.x2 - bounds.x1)) * this.ctx!.canvas.clientWidth,
            ((origY - bounds.y1) / (bounds.y2 - bounds.y1)) * this.ctx!.canvas.clientHeight
        ];
    }

}
</script>
