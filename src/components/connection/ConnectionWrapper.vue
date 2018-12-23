<template>
    <connection-view :x1="d.x1" :y1="d.y1" :x2="d.x2" :y2="d.y2"></connection-view>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ConnectionView from "./ConnectionView.vue";
import { IConnection } from "@/types/connection";
import resolveDom from "@/utility/domResolver";

@Component({
    components: {
        "connection-view": ConnectionView
    }
})
export default class ConnectionWrapper extends Vue {

    @Prop({ type: Object })
    connection!: IConnection;

    get d() {

        const from = resolveDom(this.connection.from);
        const to = resolveDom(this.connection.to);
        if (from.node && from.interface && to.node && to.interface) {
            const x1 = from.node.offsetLeft + from.node.clientWidth;
            const y1 = from.node.offsetTop + from.interface.offsetTop + from.interface.clientHeight / 2;
            const x2 = to.node.offsetLeft;
            const y2 = to.node.offsetTop + to.interface.offsetTop + to.interface.clientHeight / 2;
            return { x1, y1, x2, y2 };
        } else {
            return { x1: 0, y1: 0, x2: 0, y2: 0 };
        }
    }

}
</script>
