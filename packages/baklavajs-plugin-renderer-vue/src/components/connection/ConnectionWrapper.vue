<template>
    <connection-view :x1="d.x1" :y1="d.y1" :x2="d.x2" :y2="d.y2" :state="state" :connection="connection"></connection-view>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";
import ConnectionView from "./ConnectionView.vue";
import resolveDom from "../../utility/domResolver";
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
        if (from.node && from.interface && to.node && to.interface) {

            if (!this.resizeObserver) {
                this.resizeObserver = new ResizeObserver(() => { this.updateCoords(); });
                this.resizeObserver.observe(from.node);
                this.resizeObserver.observe(to.node);
            }

            const x1 = from.node.offsetLeft + from.node.clientWidth;
            const y1 = from.node.offsetTop + from.interface.offsetTop + from.interface.clientHeight / 2;
            const x2 = to.node.offsetLeft;
            const y2 = to.node.offsetTop + to.interface.offsetTop + to.interface.clientHeight / 2;
            this.d = { x1, y1, x2, y2 };
        } else {
            this.d = { x1: 0, y1: 0, x2: 0, y2: 0 };
        }
    }

}
</script>
