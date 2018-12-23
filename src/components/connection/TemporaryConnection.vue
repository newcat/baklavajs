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
import { IConnection, INodeInterfacePair } from "@/types/connection";
import { INodeInterface } from "@/types/nodeInterface";
import { INode } from "@/types/node";
import { ITemporaryConnection } from "@/types/temporaryConnection";
import resolveDom from "@/utility/domResolver";

@Component({
    components: {
        "connection-view": ConnectionView
    }
})
export default class TemporaryConnection extends Vue {

    @Prop({ type: Object })
    connection!: ITemporaryConnection;

    get d() {

        const start = this.getCoords(this.connection.from);
        const end = this.connection.to ?
                this.getCoords(this.connection.to) :
                { x: this.connection.mx, y: this.connection.my };

        if (this.connection.from.interface.isInput) {
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

    getCoords(p: INodeInterfacePair) {
        const d = resolveDom(p);
        if (d.node && d.interface) {
            const x = p.interface.isInput ? d.node.offsetLeft : d.node.offsetLeft + d.node.clientWidth;
            const y = d.node.offsetTop + d.interface.offsetTop + d.interface.clientHeight / 2 + 2;
            return { x, y };
        } else {
            return { x: 0, y: 0 };
        }
    }

}
</script>
