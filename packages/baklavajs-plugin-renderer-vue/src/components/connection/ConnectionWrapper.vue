<template>
    <connection-view :x1="d.x1" :y1="d.y1" :x2="d.x2" :y2="d.y2" :state="state" :connection="connection"></connection-view>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";
import ConnectionView from "./ConnectionView.vue";
import resolveDom, { IResolvedDomElements } from "./domResolver";
import { ITransferConnection, TemporaryConnectionState } from "../../../../baklavajs-core/types";

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

@Component({
    components: {
        "connection-view": ConnectionView
    }
})
export default class ConnectionWrapper extends Vue {

    @Prop({ type: Object })
    connection!: ITransferConnection;

    d = { x1: 0, y1: 0, x2: 0, y2: 0 };

    private resizeObserver!: ResizeObserverPolyfill;

    get state() {
        return this.connection.isInDanger ?
            TemporaryConnectionState.FORBIDDEN :
            TemporaryConnectionState.NONE;
    }

    async mounted() {
        await this.$nextTick();
        this.updateCoords();
    }

    beforeDestroy() {
        this.resizeObserver.disconnect();
    }

    @Watch("connection.from.parent.position", { deep: true })
    @Watch("connection.to.parent.position", { deep: true })
    updateCoords() {
        const from = resolveDom(this.connection.from);
        const to = resolveDom(this.connection.to);
        if (from.node && to.node) {
            if (!this.resizeObserver) {
                this.resizeObserver = new ResizeObserver(() => { this.updateCoords(); });
                this.resizeObserver.observe(from.node);
                this.resizeObserver.observe(to.node);
            }
        }
        const [x1, y1] = this.getPortCoordinates(from);
        const [x2, y2] = this.getPortCoordinates(to);
        this.d = { x1, y1, x2, y2 };
    }

    private getPortCoordinates(resolved: IResolvedDomElements): [number, number] {
        if (resolved.node && resolved.interface && resolved.port) {
            return [
                resolved.node.offsetLeft + resolved.interface.offsetLeft + resolved.port.offsetLeft + resolved.port.clientWidth / 2,
                resolved.node.offsetTop + resolved.interface.offsetTop + resolved.port.offsetTop + resolved.port.clientHeight / 2
            ];
        } else {
            return [0, 0];
        }
    }

}
</script>
