<template>
    <connection-view
        :x1="d.input.x" :y1="d.input.y"
        :x2="d.output.x" :y2="d.output.y"
        :state="status"
        is-temporary
    ></connection-view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import ConnectionView from "./ConnectionView.vue";
import { ITemporaryConnection, TemporaryConnectionState, NodeInterface } from "../../../core";
import resolveDom from "../../domResolver";

@Component({
    components: {
        "connection-view": ConnectionView
    }
})
export default class TemporaryConnection extends Vue {

    @Prop({ type: Object })
    connection!: ITemporaryConnection;

    get status() {
        return this.connection ? this.connection.status : TemporaryConnectionState.NONE;
    }

    get d() {
        if (!this.connection) {
            return {
                input: { x: 0, y: 0 },
                output: { x: 0, y: 0 }
            };
        }

        const start = this.getCoords(this.connection.from);
        const end = this.connection.to ?
                this.getCoords(this.connection.to) :
                { x: this.connection.mx || start.x, y: this.connection.my || start.y };

        if (this.connection.from.isInput) {
            return {
                input: end,
                output: start
            };
        } else {
            return {
                input: start,
                output: end
            };
        }

    }

    getCoords(ni: NodeInterface) {
        const d = resolveDom(ni);
        if (d.node && d.interface) {
            const x = ni.isInput ? d.node.offsetLeft : d.node.offsetLeft + d.node.clientWidth;
            const y = d.node.offsetTop + d.interface.offsetTop + d.interface.clientHeight / 2 + 2;
            return { x, y };
        } else {
            return { x: 0, y: 0 };
        }
    }

}
</script>
