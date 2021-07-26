<template>
    <connection-view
        :x1="d.input[0]" :y1="d.input[1]"
        :x2="d.output[0]" :y2="d.output[1]"
        :state="status"
        :connection="connection"
        is-temporary
    ></connection-view>
</template>

<script lang="ts">
import { Options, Prop, Vue } from "vue-property-decorator";

import ConnectionView from "./ConnectionView.vue";
import { ITemporaryConnection, TemporaryConnectionState } from "../../../../baklavajs-core/types";
import resolveDom from "./domResolver";
import { getPortCoordinates } from "./portCoordinates";

@Options({
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
                input: [0, 0],
                output: [0, 0]
            };
        }

        const start = getPortCoordinates(resolveDom(this.connection.from));
        const end = this.connection.to ?
                getPortCoordinates(resolveDom(this.connection.to)) :
                [this.connection.mx || start[0], this.connection.my || start[1] ];

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

}
</script>
