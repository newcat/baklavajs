<template>
    <connection-view
        :x1="d.input[0]"
        :y1="d.input[1]"
        :x2="d.output[0]"
        :y2="d.output[1]"
        :state="status"
        is-temporary
    />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import ConnectionView from "./ConnectionView.vue";
import { ITemporaryConnection, TemporaryConnectionState } from "./connection";
import { getDomElements } from "./domResolver";
import { getPortCoordinates } from "./portCoordinates";

export default defineComponent({
    components: {
        "connection-view": ConnectionView
    },
    props: {
        connection: {
            type: Object as () => ITemporaryConnection,
            required: true
        }
    },
    setup(props) {
        const status = computed(() => (props.connection ? props.connection.status : TemporaryConnectionState.NONE));

        const d = computed(() => {
            if (!props.connection) {
                return {
                    input: [0, 0],
                    output: [0, 0]
                };
            }

            const start = getPortCoordinates(getDomElements(props.connection.from));
            const end = props.connection.to
                ? getPortCoordinates(getDomElements(props.connection.to))
                : [props.connection.mx || start[0], props.connection.my || start[1]];

            if (props.connection.from.isInput) {
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
        });

        return { d, status };
    }
});
</script>
